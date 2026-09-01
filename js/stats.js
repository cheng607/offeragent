/**
 * OfferAgent · 多维统计计算层
 * 从 state 派生各类统计指标（概览、掌握度分布、每日趋势、分类进度、记忆留存）。
 * 挂载到全局命名空间 App.stats
 */
(function (global) {
  'use strict';

  var cfg = global.App.config;
  var bank = global.App.bank;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function dateStr(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // 每张卡最近一次自评结果（从日志推导）qid -> rating(0-3)
  function lastRatingByCard(state) {
    var map = {};
    for (var i = 0; i < state.logs.length; i++) {
      var lg = state.logs[i];
      map[lg.qid] = lg.rating;
    }
    return map;
  }

  // 概览数据
  function overview(state) {
    var total = bank.all.length;
    var learned = 0, mastered = 0, learning = 0;
    for (var qid in state.cards) {
      var c = state.cards[qid];
      if (c.status === 'new') continue;
      learned++;
      if (c.status === 'mastered' || global.App.scheduler.isMastered(c)) mastered++;
      else learning++;
    }
    var due = global.App.scheduler.dueReviews(state).length;
    var today = global.App.scheduler.todayCount(state);

    // 记忆留存率 = 最近一次自评 >= 2 的已复习卡片占比
    var lastRating = lastRatingByCard(state);
    var reviewedCount = 0, retainedCount = 0;
    for (var q in state.cards) {
      if (state.cards[q].reviewCount > 0) {
        reviewedCount++;
        if (lastRating[q] >= 2) retainedCount++;
      }
    }
    var retention = reviewedCount ? Math.round(retainedCount / reviewedCount * 100) : 0;

    return {
      total: total,
      learned: learned,
      learning: learning,
      mastered: mastered,
      newCount: total - learned,
      due: due,
      todayLearned: today.learned,
      todayReviewed: today.reviewed,
      streak: state.meta.streak,
      streakBest: state.meta.streakBest,
      totalLearned: state.meta.totalLearned,
      totalReviews: state.meta.totalReviews,
      retention: retention
    };
  }

  // 掌握度分布（环形图数据）
  function masteryDistribution(state) {
    var o = overview(state);
    return [
      { key: 'mastered', label: '已掌握', value: o.mastered, color: '#3E9B6F' },
      { key: 'learning', label: '学习中', value: o.learning, color: '#E0A22E' },
      { key: 'new', label: '未学习', value: o.newCount, color: '#E4E1DA' }
    ];
  }

  // 每日学习趋势（近 N 天）
  function dailyTrend(state, days) {
    days = days || cfg.TREND_DAYS;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = today.getTime() - (days - 1) * 86400000;

    var buckets = {};
    for (var i = 0; i < days; i++) {
      var ts = start + i * 86400000;
      var key = dateStr(ts);
      buckets[key] = { learned: 0, reviewed: 0 };
    }

    for (var j = 0; j < state.logs.length; j++) {
      var lg = state.logs[j];
      if (lg.ts < start) continue;
      var k = dateStr(lg.ts);
      if (buckets[k]) {
        if (lg.type === 'learn') buckets[k].learned++;
        else buckets[k].reviewed++;
      }
    }

    var result = [];
    for (var d = 0; d < days; d++) {
      var t = start + d * 86400000;
      var key = dateStr(t);
      var dt = new Date(t);
      result.push({
        label: (dt.getMonth() + 1) + '/' + dt.getDate(),
        learned: buckets[key].learned,
        reviewed: buckets[key].reviewed
      });
    }
    return result;
  }

  // 分类学习进度
  function categoryProgress(state) {
    var cats = cfg.CATEGORIES;
    var result = [];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var qs = bank.byCategory[cat.id] || [];
      var learned = 0, mastered = 0;
      for (var j = 0; j < qs.length; j++) {
        var c = state.cards[qs[j].id];
        if (c && c.status !== 'new') {
          learned++;
          if (c.status === 'mastered' || global.App.scheduler.isMastered(c)) mastered++;
        }
      }
      result.push({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        total: qs.length,
        learned: learned,
        mastered: mastered,
        pct: qs.length ? Math.round(learned / qs.length * 100) : 0
      });
    }
    return result;
  }

  // 记忆留存曲线（理论遗忘 vs 间隔复习，示意）
  function retentionSeries() {
    var reviewDays = cfg.STAGES.slice(0, 6); // [1,2,4,7,15,30]
    var maxT = 30;

    // 理论遗忘（无复习）：指数衰减，收敛到 ~20%
    var theory = [];
    for (var t = 0; t <= maxT; t++) {
      theory.push({ t: t, v: Math.round(20 + 80 * Math.exp(-t / 1.5)) });
    }

    // 间隔复习（锯齿状）：在复习点记忆回升
    var spaced = [];
    var mem = 100;
    var nextReview = 0;
    var decay = 0.55;
    spaced.push({ t: 0, v: 100 });
    for (var d = 1; d <= maxT; d++) {
      mem = mem * decay + 20 * (1 - decay);
      if (nextReview < reviewDays.length && d === reviewDays[nextReview]) {
        mem = mem + (100 - mem) * 0.92; // 复习回升
        nextReview++;
      }
      spaced.push({ t: d, v: Math.round(Math.min(100, mem)) });
    }

    return { reviewDays: reviewDays, theory: theory, spaced: spaced };
  }

  global.App = global.App || {};
  global.App.stats = {
    overview: overview,
    masteryDistribution: masteryDistribution,
    dailyTrend: dailyTrend,
    categoryProgress: categoryProgress,
    retentionSeries: retentionSeries
  };
})(window);
