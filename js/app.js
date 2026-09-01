/**
 * OfferAgent · UI 渲染与交互主逻辑
 * 负责视图渲染、导航、刷题交互、题库浏览、统计展示、设置与数据备份。
 * 依赖：config / bank / storage / scheduler / stats / charts（按序加载）
 */
(function (global) {
  'use strict';

  var App = global.App;
  var config = App.config;
  var storage = App.storage;
  var scheduler = App.scheduler;
  var stats = App.stats;
  var charts = App.charts;
  var bank = App.bank;

  /* ---------------- 图标库（内联 SVG，无 emoji） ---------------- */
  var ICONS = {
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v3"/><path d="M12 10v8"/><path d="M17 6v12"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>'
  };

  function icon(name, size) {
    size = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------------- 工具函数 ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 18) return '下午好';
    return '晚上好';
  }
  function fullDate() {
    var d = new Date();
    var w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + w;
  }

  function catBadge(id) {
    var c = config.categoryById(id);
    return '<span class="badge badge-gray"><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + c.color + '"></i>' + esc(c.name) + '</span>';
  }
  function diffBadge(v) {
    var label = config.difficultyLabel(v);
    var cls = v === 1 ? 'badge-green' : (v === 2 ? 'badge-amber' : 'badge-accent');
    return '<span class="badge ' + cls + '">' + label + '</span>';
  }
  function statusBadge(card) {
    if (!card || card.status === 'new') return '<span class="badge badge-gray">未学习</span>';
    if (card.status === 'mastered') return '<span class="badge badge-green">已掌握</span>';
    return '<span class="badge badge-amber">学习中</span>';
  }

  var ui = {
    state: null,
    bankFilter: 'all',
    bankQuery: '',
    practiceQueue: [],
    practiceIndex: 0,
    requeueCount: {},

    /* ============ 初始化 ============ */
    init: function () {
      this.state = storage.load();
      this.bindGlobal();
      var tab = location.hash.replace('#', '');
      var tabs = ['home', 'practice', 'bank', 'stats'];
      if (tabs.indexOf(tab) < 0) tab = 'home';
      this.switchTab(tab);
    },

    bindGlobal: function () {
      var self = this;
      $$('.tabbar .tab').forEach(function (btn) {
        btn.addEventListener('click', function () { self.switchTab(btn.getAttribute('data-tab')); });
      });
      $('#btn-settings').addEventListener('click', function () { self.openSettings(); });
      $('#btn-close-settings').addEventListener('click', function () { self.closeSettings(); });
      $('#btn-save-settings').addEventListener('click', function () { self.saveSettings(); });
      $('#btn-export').addEventListener('click', function () { self.exportData(); });
      $('#btn-import').addEventListener('click', function () { $('#file-import').click(); });
      $('#file-import').addEventListener('change', function (e) { self.importData(e); });
      $('#btn-clear').addEventListener('click', function () { self.clearData(); });
      $('#settings-modal').addEventListener('click', function (e) {
        if (e.target === this) self.closeSettings();
      });
    },

    /* ============ 导航 ============ */
    switchTab: function (tab) {
      $$('.view').forEach(function (v) { v.classList.remove('is-active'); });
      $$('.tabbar .tab').forEach(function (t) { t.classList.remove('is-active'); });
      var view = $('#view-' + tab);
      var tabBtn = $('.tabbar .tab[data-tab="' + tab + '"]');
      if (view) view.classList.add('is-active');
      if (tabBtn) tabBtn.classList.add('is-active');

      if (tab === 'home') this.renderHome();
      else if (tab === 'practice') this.renderPractice();
      else if (tab === 'bank') this.renderBank();
      else if (tab === 'stats') this.renderStats();
      if (location.hash !== '#' + tab) location.hash = tab;
      window.scrollTo(0, 0);
    },

    /* ============ 首页 ============ */
    renderHome: function () {
      var o = stats.overview(this.state);
      var todayTotal = o.todayLearned + o.todayReviewed;

      var html =
        '<div class="hero">' +
          '<div class="hero-top">' +
            '<div><div class="hero-greet">' + greeting() + '</div><div class="hero-date">' + fullDate() + '</div></div>' +
            '<span class="streak-pill">' + icon('flame', 16) + '连续 ' + o.streak + ' 天</span>' +
          '</div>' +
        '</div>' +

        '<div class="task-card">' +
          '<div class="task-row">' +
            '<div class="task-stat"><div class="num">' + o.due + '</div><div class="lbl">待复习</div></div>' +
            '<div class="task-stat accent"><div class="num">' + o.newCount + '</div><div class="lbl">新题</div></div>' +
            '<div class="task-stat"><div class="num">' + todayTotal + '</div><div class="lbl">今日已学</div></div>' +
          '</div>' +
          '<div class="task-cta"><button class="btn btn-light btn-block" id="btn-start">' + (o.due + o.newCount > 0 ? '开始学习' : '今日已完成，去看看统计') + '</button></div>' +
        '</div>' +

        '<div class="stat-grid">' +
          '<div class="stat-cell"><div class="num">' + o.learned + '</div><div class="lbl">已学题目</div></div>' +
          '<div class="stat-cell"><div class="num c-green">' + o.mastered + '</div><div class="lbl">已掌握</div></div>' +
          '<div class="stat-cell"><div class="num c-blue">' + o.totalReviews + '</div><div class="lbl">累计复习</div></div>' +
          '<div class="stat-cell"><div class="num c-accent">' + o.retention + '%</div><div class="lbl">记忆留存</div></div>' +
        '</div>' +

        '<div class="section-title">分类学习进度</div>' +
        '<div class="card"><div id="home-cat"></div></div>';

      $('#view-home').innerHTML = html;
      charts.hbars($('#home-cat'), stats.categoryProgress(this.state));

      $('#btn-start').addEventListener('click', function () { ui.switchTab('practice'); });
    },

    /* ============ 刷题 ============ */
    buildQueue: function () {
      var q = [];
      var reviews = scheduler.dueReviews(this.state);
      var news = scheduler.newQueue(this.state).slice(0, this.state.settings.dailyNewTarget);
      reviews.forEach(function (r) { q.push({ type: 'review', qid: r.qid }); });
      news.forEach(function (n) { q.push({ type: 'new', qid: n.qid }); });
      return q;
    },

    modeLabel: function (item) {
      if (item.type === 'new') return { text: '新题学习', cls: 'badge-accent' };
      var card = storage.getCard(this.state, item.qid);
      if (card.stage === 0) return { text: '错题巩固', cls: 'badge-amber' };
      return { text: '间隔复习', cls: 'badge-green' };
    },

    renderPractice: function () {
      this.practiceIndex = 0;
      this.requeueCount = {};
      this.practiceQueue = this.buildQueue();
      if (this.practiceQueue.length === 0) {
        this.renderPracticeDone();
      } else {
        this.showPracticeCard();
      }
    },

    showPracticeCard: function () {
      var item = this.practiceQueue[this.practiceIndex];
      var q = bank.byId[item.qid];
      var card = storage.getCard(this.state, item.qid);
      var mode = this.modeLabel(item);
      var total = this.practiceQueue.length;
      var pct = Math.round(this.practiceIndex / total * 100);

      var tags = (q.tags || []).map(function (t) {
        return '<span class="badge badge-gray">' + esc(t) + '</span>';
      }).join('');

      var html =
        '<div class="practice-head">' +
          '<span class="badge ' + mode.cls + '">' + esc(mode.text) + '</span>' +
          '<span class="practice-progress">' + (this.practiceIndex + 1) + ' / ' + total + '</span>' +
        '</div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="flip-card" id="flip-card">' +
          '<div class="flip-inner">' +
            '<div class="flip-face flip-front">' +
              '<div class="card-meta">' + catBadge(q.category) + diffBadge(q.difficulty) + '</div>' +
              '<div class="card-question">' + esc(q.question) + '</div>' +
              '<div class="card-hint">' + icon('eye', 18) + '点击卡片查看答案</div>' +
            '</div>' +
            '<div class="flip-face flip-back">' +
              '<div class="answer-title">答案解析</div>' +
              '<div class="answer-body">' + esc(q.answer) + '</div>' +
              (tags ? '<div class="card-tags">' + tags + '</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rating-bar">' +
          '<button class="rate-btn r0" data-rating="0" disabled><span class="r-label">忘记</span><span class="r-sub">重新学习</span></button>' +
          '<button class="rate-btn r1" data-rating="1" disabled><span class="r-label">模糊</span><span class="r-sub">降级间隔</span></button>' +
          '<button class="rate-btn r2" data-rating="2" disabled><span class="r-label">记得</span><span class="r-sub">正常升级</span></button>' +
          '<button class="rate-btn r3" data-rating="3" disabled><span class="r-label">牢记</span><span class="r-sub">跳级掌握</span></button>' +
        '</div>';

      $('#view-practice').innerHTML = html;

      var self = this;
      var flipCard = $('#flip-card');
      var ratingBtns = $$('.rate-btn', $('#view-practice'));

      flipCard.addEventListener('click', function () {
        if (flipCard.classList.contains('flipped')) return;
        flipCard.classList.add('flipped');
        ratingBtns.forEach(function (b) { b.disabled = false; });
      });

      ratingBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          self.rateCard(parseInt(b.getAttribute('data-rating'), 10));
        });
      });
    },

    rateCard: function (rating) {
      var item = this.practiceQueue[this.practiceIndex];
      var card = storage.getCard(this.state, item.qid);
      var res = scheduler.schedule(card, rating);
      storage.logStudy(this.state, { type: res.type, qid: item.qid, rating: rating });
      storage.save(this.state);

      // 忘记 → 本组内再次出现（错题巩固），每卡最多重排 2 次
      if (rating === 0) {
        var cnt = this.requeueCount[item.qid] || 0;
        if (cnt < 2) {
          this.requeueCount[item.qid] = cnt + 1;
          this.practiceQueue.push({ type: 'review', qid: item.qid });
        }
      }

      this.practiceIndex++;
      if (this.practiceIndex >= this.practiceQueue.length) {
        this.renderPracticeDone();
      } else {
        this.showPracticeCard();
      }
    },

    renderPracticeDone: function () {
      var t = scheduler.todayCount(this.state);
      var total = t.learned + t.reviewed;
      var html =
        '<div class="empty" style="padding-top:20vh">' +
          '<div class="empty-icon">' + icon('check', 56) + '</div>' +
          '<h3>今日任务完成</h3>' +
          '<p>今天已学 ' + t.learned + ' 新题、复习 ' + t.reviewed + ' 题，共 ' + total + ' 题。</p>' +
          '<p>按照遗忘曲线，明天记得回来巩固哦。</p>' +
          '<div style="margin-top:20px"><button class="btn btn-primary" id="btn-again">再学一组</button></div>' +
        '</div>';
      $('#view-practice').innerHTML = html;
      $('#btn-again').addEventListener('click', function () { ui.renderPractice(); });
    },

    /* ============ 题库 ============ */
    renderBank: function () {
      var chips = ['<button class="chip' + (this.bankFilter === 'all' ? ' is-active' : '') + '" data-cat="all">全部</button>'];
      config.CATEGORIES.forEach(function (c) {
        chips.push('<button class="chip' + (ui.bankFilter === c.id ? ' is-active' : '') + '" data-cat="' + c.id + '">' + esc(c.name) + '</button>');
      });

      var html =
        '<div class="search-box">' +
          icon('search', 18) +
          '<input class="search-input" id="bank-search" type="search" placeholder="搜索题目关键词…" value="' + esc(this.bankQuery) + '">' +
        '</div>' +
        '<div class="chip-scroll">' + chips.join('') + '</div>' +
        '<div id="bank-list"></div>';

      $('#view-bank').innerHTML = html;

      var self = this;
      $('#bank-search').addEventListener('input', function () {
        self.bankQuery = this.value;
        clearTimeout(self._searchTimer);
        self._searchTimer = setTimeout(function () { self.renderBankList(); }, 150);
      });
      $('.chip-scroll', $('#view-bank')).addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        self.bankFilter = chip.getAttribute('data-cat');
        self.renderBank();
      });

      this.renderBankList();
    },

    renderBankList: function () {
      var self = this;
      var qs = bank.all.filter(function (q) {
        var matchCat = self.bankFilter === 'all' || q.category === self.bankFilter;
        var kw = self.bankQuery.trim().toLowerCase();
        var matchKw = !kw ||
          (q.question + ' ' + (q.answer || '') + ' ' + (q.tags || []).join(' ')).toLowerCase().indexOf(kw) >= 0;
        return matchCat && matchKw;
      });

      if (qs.length === 0) {
        $('#bank-list').innerHTML = '<div class="empty">' + icon('book', 40) + '<h3>没有匹配的题目</h3><p>换个关键词或分类试试</p></div>';
        return;
      }

      var html = qs.map(function (q) {
        var card = self.state.cards[q.id];
        var tags = (q.tags || []).map(function (t) { return '<span class="badge badge-gray">' + esc(t) + '</span>'; }).join('');
        return '<div class="q-item" data-qid="' + q.id + '">' +
          '<div class="q-item-head"><div class="q-text">' + esc(q.question) + '</div>' + statusBadge(card) + '</div>' +
          '<div class="q-meta">' + catBadge(q.category) + diffBadge(q.difficulty) + '</div>' +
          '<div class="q-detail"><div class="answer-body">' + esc(q.answer) + '</div>' +
          (tags ? '<div class="card-tags">' + tags + '</div>' : '') + '</div>' +
        '</div>';
      }).join('');

      $('#bank-list').innerHTML = html;
      $('#bank-list').addEventListener('click', function (e) {
        var item = e.target.closest('.q-item');
        if (!item) return;
        item.classList.toggle('open');
      });
    },

    /* ============ 统计 ============ */
    renderStats: function () {
      var o = stats.overview(this.state);

      var html =
        '<div class="card" style="display:flex;justify-content:space-around;text-align:center;margin-bottom:8px">' +
          '<div><div class="num" style="font-size:22px;font-weight:800">' + o.learned + '</div><div style="font-size:12px;color:var(--muted)">已学</div></div>' +
          '<div><div class="num" style="font-size:22px;font-weight:800;color:var(--green)">' + o.mastered + '</div><div style="font-size:12px;color:var(--muted)">已掌握</div></div>' +
          '<div><div class="num" style="font-size:22px;font-weight:800;color:var(--accent)">' + o.retention + '%</div><div style="font-size:12px;color:var(--muted)">留存率</div></div>' +
        '</div>' +

        '<div class="section-title">掌握度分布</div>' +
        '<div class="card chart-card"><div id="chart-dist"></div></div>' +

        '<div class="section-title">每日学习曲线（近 ' + config.TREND_DAYS + ' 天）</div>' +
        '<div class="card chart-card"><div id="chart-trend"></div></div>' +

        '<div class="section-title">分类学习进度</div>' +
        '<div class="card chart-card"><div id="chart-cat"></div></div>' +

        '<div class="section-title">记忆留存曲线</div>' +
        '<div class="card chart-card"><div id="chart-ret"></div></div>';

      $('#view-stats').innerHTML = html;

      charts.donut($('#chart-dist'), stats.masteryDistribution(this.state), '总题数', o.total);
      charts.bars($('#chart-trend'), stats.dailyTrend(this.state, config.TREND_DAYS), 'learned', 'reviewed');
      charts.hbars($('#chart-cat'), stats.categoryProgress(this.state));
      var rs = stats.retentionSeries();
      charts.lines($('#chart-ret'), { theory: rs.theory, spaced: rs.spaced }, 'theory', 'spaced', rs.reviewDays);
    },

    /* ============ 设置 ============ */
    openSettings: function () {
      $('#set-new').value = this.state.settings.dailyNewTarget;
      $('#set-review').value = this.state.settings.dailyReviewTarget;
      $('#settings-modal').hidden = false;
    },
    closeSettings: function () {
      $('#settings-modal').hidden = true;
    },
    saveSettings: function () {
      var n = parseInt($('#set-new').value, 10);
      var r = parseInt($('#set-review').value, 10);
      if (isNaN(n) || n < 1) n = config.DAILY_NEW_TARGET;
      if (isNaN(r) || r < 1) r = config.DAILY_REVIEW_TARGET;
      this.state.settings.dailyNewTarget = Math.min(50, n);
      this.state.settings.dailyReviewTarget = Math.min(500, r);
      storage.save(this.state);
      this.closeSettings();
      this.renderHome();
      this.toast('设置已保存');
    },
    exportData: function () {
      var json = storage.exportData(this.state);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'offeragent-backup-' + storage.todayStr() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.toast('已导出备份文件');
    },
    importData: function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      var self = this;
      reader.onload = function () {
        var state = storage.importData(reader.result);
        if (!state) { self.toast('导入失败：文件格式不正确'); return; }
        self.state = state;
        storage.save(self.state);
        self.renderHome();
        self.toast('导入成功');
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    clearData: function () {
      var ok = window.confirm('确定要清空所有学习数据吗？此操作不可恢复，建议先导出备份。');
      if (!ok) return;
      storage.clearAll();
      this.state = storage.load();
      this.closeSettings();
      this.switchTab('home');
      this.toast('学习数据已清空');
    },

    /* ============ 轻提示 ============ */
    toast: function (msg) {
      var el = $('#toast');
      el.textContent = msg;
      el.hidden = false;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
    }
  };

  App.ui = ui;

  document.addEventListener('DOMContentLoaded', function () {
    ui.init();
  });
})(window);
