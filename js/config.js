/**
 * OfferAgent · 全局配置
 * 集中管理：遗忘曲线间隔、评分调度规则、默认目标、存储键、分类与难度定义。
 * 挂载到全局命名空间 App.config
 */
(function (global) {
  'use strict';

  var config = {
    // ---------- 艾宾浩斯遗忘曲线间隔阶梯（天）----------
    // 阶段索引 stage 从 0 开始；stage 0 表示"新学当天"，无复习间隔
    STAGES: [1, 2, 4, 7, 15, 30],

    // ---------- 四级自评 → 调度动作 ----------
    // rating: 0 忘记 / 1 模糊 / 2 记得 / 3 牢记
    RATINGS: [
      { key: 'forget',  label: '忘记', stageDelta: -99, easeDelta: -0.20, reset: true },
      { key: 'fuzzy',   label: '模糊', stageDelta: -1,  easeDelta: -0.15, reset: false },
      { key: 'know',    label: '记得', stageDelta: 1,   easeDelta: 0.05,  reset: false },
      { key: 'master',  label: '牢记', stageDelta: 2,   easeDelta: 0.10,  reset: false }
    ],

    // ---------- 难度系数 ease 边界 ----------
    EASE_MIN: 1.3,
    EASE_MAX: 2.8,
    EASE_DEFAULT: 2.5,

    // ---------- 掌握判定 ----------
    // 阶段 >= MASTER_STAGE 且连续答对 >= MASTER_STREAK 视为"已掌握"
    MASTER_STAGE: 4,
    MASTER_STREAK: 2,

    // ---------- 默认每日目标 ----------
    DAILY_NEW_TARGET: 10,     // 每日新题数
    DAILY_REVIEW_TARGET: 30,  // 每日复习题数（软目标）

    // ---------- localStorage 存储键 ----------
    STORAGE_KEY: 'offeragent.data.v1',

    // ---------- 分类定义（顺序即展示顺序）----------
    CATEGORIES: [
      { id: 'frontend', name: '前端', color: '#E4573D' },
      { id: 'backend',  name: '后端', color: '#6A9BCC' },
      { id: 'algorithm',name: '算法', color: '#B07BD8' },
      { id: 'database', name: '数据库', color: '#E0A22E' },
      { id: 'network',  name: '计算机网络', color: '#3E9B6F' },
      { id: 'os',       name: '操作系统', color: '#5C7CC0' },
      { id: 'ai',       name: '人工智能', color: '#14B8A6' }
    ],

    // ---------- 难度定义 ----------
    DIFFICULTY: [
      { value: 1, label: '简单' },
      { value: 2, label: '中等' },
      { value: 3, label: '困难' }
    ],

    // ---------- 统计窗口（天）----------
    TREND_DAYS: 14,

    // 工具：按 id 查分类名/颜色
    categoryById: function (id) {
      for (var i = 0; i < this.CATEGORIES.length; i++) {
        if (this.CATEGORIES[i].id === id) return this.CATEGORIES[i];
      }
      return { id: id, name: id, color: '#8A867E' };
    },
    difficultyLabel: function (v) {
      for (var i = 0; i < this.DIFFICULTY.length; i++) {
        if (this.DIFFICULTY[i].value === v) return this.DIFFICULTY[i].label;
      }
      return '简单';
    }
  };

  global.App = global.App || {};
  global.App.config = config;
})(window);
