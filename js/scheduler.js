/**
 * OfferAgent · 艾宾浩斯记忆调度引擎
 * 根据四级自评结果调度每道题的复习时间（遗忘曲线间隔阶梯 + 自适应难度系数）。
 * 挂载到全局命名空间 App.scheduler
 */
(function (global) {
  'use strict';

  var DAY = 86400000; // 1 天的毫秒数
  var cfg = global.App.config;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // 判断卡片是否已掌握
  function isMastered(card) {
    return card.stage >= cfg.MASTER_STAGE && card.correctStreak >= cfg.MASTER_STREAK;
  }

  /**
   * 根据自评 rating（0忘记/1模糊/2记得/3牢记）更新卡片调度信息
   * @param {object} card  卡片状态（会被原地修改）
   * @param {number} rating 0-3
   * @param {number} now    当前时间戳
   * @returns {object} { type: 'learn'|'review', rating, intervalDays }
   */
  function schedule(card, rating, now) {
    now = now || Date.now();
    var r = cfg.RATINGS[rating];
    var wasNew = (card.status === 'new');
    var intervalDays = 0;

    card.reviewCount += 1;
    card.lastReview = now;

    if (r.reset) {
      // 忘记：重置记忆阶段，立即安排重学（今天再次出现）
      card.stage = 0;
      card.correctStreak = 0;
      card.lapses += 1;
      card.ease = clamp(card.ease + r.easeDelta, cfg.EASE_MIN, cfg.EASE_MAX);
      card.dueDate = now; // 立即到期
      card.status = 'learning';
      intervalDays = 0;
    } else {
      // 模糊/记得/牢记：调整阶段与难度系数
      card.stage = clamp(card.stage + r.stageDelta, 0, cfg.STAGES.length - 1);
      card.ease = clamp(card.ease + r.easeDelta, cfg.EASE_MIN, cfg.EASE_MAX);
      card.correctStreak = (r.stageDelta > 0) ? card.correctStreak + 1 : 0;

      var baseDays = cfg.STAGES[card.stage];
      intervalDays = Math.max(1, Math.round(baseDays * card.ease));
      card.dueDate = now + intervalDays * DAY;
      card.status = isMastered(card) ? 'mastered' : 'learning';
    }

    return {
      type: wasNew ? 'learn' : 'review',
      rating: rating,
      intervalDays: intervalDays
    };
  }

  // 到期待复习卡片（dueDate <= now），按到期时间升序
  function dueReviews(state, now) {
    now = now || Date.now();
    var list = [];
    for (var qid in state.cards) {
      var c = state.cards[qid];
      if (c.status !== 'new' && c.dueDate <= now) {
        list.push({ qid: qid, card: c });
      }
    }
    list.sort(function (a, b) { return a.card.dueDate - b.card.dueDate; });
    return list;
  }

  // 新题队列（尚未学习的题目，按题库顺序）
  function newQueue(state) {
    var list = [];
    var all = global.App.bank.all;
    for (var i = 0; i < all.length; i++) {
      var q = all[i];
      var c = state.cards[q.id];
      if (!c || c.status === 'new') {
        list.push({ qid: q.id, card: c || null });
      }
    }
    return list;
  }

  // 今日待学：优先复习，复习完再做新题
  function buildTodayQueue(state, now) {
    now = now || Date.now();
    var reviews = dueReviews(state, now);
    var fresh = newQueue(state).slice(0, state.settings.dailyNewTarget);
    return {
      reviews: reviews,
      news: fresh
    };
  }

  // 今日已学数量（按日志统计）
  function todayCount(state) {
    var today = global.App.storage.todayStr();
    var learned = 0, reviewed = 0;
    for (var i = 0; i < state.logs.length; i++) {
      var lg = state.logs[i];
      if (global.App.storage.todayStr(new Date(lg.ts)) !== today) continue;
      if (lg.type === 'learn') learned++;
      else reviewed++;
    }
    return { learned: learned, reviewed: reviewed };
  }

  global.App = global.App || {};
  global.App.scheduler = {
    isMastered: isMastered,
    schedule: schedule,
    dueReviews: dueReviews,
    newQueue: newQueue,
    buildTodayQueue: buildTodayQueue,
    todayCount: todayCount
  };
})(window);
