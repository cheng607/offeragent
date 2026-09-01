/**
 * OfferAgent · 数据持久化层
 * 基于 localStorage 保存学习状态与学习日志，支持导出/导入备份。
 * 挂载到全局命名空间 App.storage
 */
(function (global) {
  'use strict';

  var KEY = global.App.config.STORAGE_KEY;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function defaultState() {
    var cfg = global.App.config;
    return {
      version: 1,
      cards: {},                 // { qid: CardState }
      logs: [],                  // [{ ts, type, qid, rating }]
      settings: {
        dailyNewTarget: cfg.DAILY_NEW_TARGET,
        dailyReviewTarget: cfg.DAILY_REVIEW_TARGET
      },
      meta: {
        createdAt: Date.now(),
        lastStudyDate: '',       // YYYY-MM-DD
        streak: 0,
        streakBest: 0,
        totalLearned: 0,         // 累计学习的新题数（去重）
        totalReviews: 0          // 累计复习次数
      }
    };
  }

  function load() {
    var state = null;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch (e) {
      console.error('OfferAgent: 读取本地数据失败', e);
    }
    if (!state || state.version !== 1) {
      return defaultState();
    }
    // 容错：确保关键字段存在
    state.cards = state.cards || {};
    state.logs = state.logs || [];
    state.settings = state.settings || defaultState().settings;
    state.meta = state.meta || defaultState().meta;
    return state;
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('OfferAgent: 保存本地数据失败', e);
      return false;
    }
  }

  // 获取题目的卡片状态（若不存在则创建默认"新题"状态，但不立即写回）
  function getCard(state, qid) {
    if (!state.cards[qid]) {
      state.cards[qid] = {
        status: 'new',           // new | learning | mastered
        stage: 0,
        ease: global.App.config.EASE_DEFAULT,
        dueDate: 0,
        lastReview: 0,
        reviewCount: 0,
        correctStreak: 0,
        lapses: 0
      };
    }
    return state.cards[qid];
  }

  // 记录一次学习日志并更新连续打卡
  function logStudy(state, entry) {
    state.logs.push({
      ts: Date.now(),
      type: entry.type,          // 'learn' | 'review'
      qid: entry.qid,
      rating: entry.rating       // 0-3
    });
    // 更新累计统计
    if (entry.type === 'learn') {
      state.meta.totalLearned += 1;
    } else {
      state.meta.totalReviews += 1;
    }
    updateStreak(state);
    // 控制日志体积，最多保留 4000 条
    if (state.logs.length > 4000) {
      state.logs = state.logs.slice(state.logs.length - 4000);
    }
  }

  function updateStreak(state) {
    var today = todayStr();
    var meta = state.meta;
    if (meta.lastStudyDate === today) return;       // 当天已打卡
    var yesterday = todayStr(new Date(Date.now() - 86400000));
    if (meta.lastStudyDate === yesterday) {
      meta.streak += 1;
    } else {
      meta.streak = 1;
    }
    meta.lastStudyDate = today;
    if (meta.streak > meta.streakBest) meta.streakBest = meta.streak;
  }

  // 导出为 JSON 字符串（用于备份）
  function exportData(state) {
    return JSON.stringify({
      app: 'OfferAgent',
      exportedAt: new Date().toISOString(),
      state: state
    }, null, 2);
  }

  // 从 JSON 字符串导入，返回解析后的 state 或 null
  function importData(jsonStr) {
    try {
      var obj = JSON.parse(jsonStr);
      var state = obj && obj.state ? obj.state : obj;
      if (!state || typeof state.cards !== 'object') return null;
      state.cards = state.cards || {};
      state.logs = state.logs || [];
      state.settings = state.settings || defaultState().settings;
      state.meta = state.meta || defaultState().meta;
      return state;
    } catch (e) {
      return null;
    }
  }

  function clearAll() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  global.App = global.App || {};
  global.App.storage = {
    todayStr: todayStr,
    defaultState: defaultState,
    load: load,
    save: save,
    getCard: getCard,
    logStudy: logStudy,
    updateStreak: updateStreak,
    exportData: exportData,
    importData: importData,
    clearAll: clearAll
  };
})(window);
