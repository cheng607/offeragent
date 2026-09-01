/**
 * OfferAgent · SVG 自绘图表库
 * 零依赖，使用内联 SVG 绘制：环形图 / 分组柱状图 / 横向条形图 / 折线图。
 * 挂载到全局命名空间 App.charts
 */
(function (global) {
  'use strict';

  var C = {
    accent: '#E4573D',
    blue: '#6A9BCC',
    grid: '#E4E1DA',
    muted: '#8A867E',
    ink: '#211F1C',
    green: '#3E9B6F',
    amber: '#E0A22E'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 环形图
  function donut(container, data, centerTitle, centerValue) {
    var size = 168, cx = 84, cy = 84, r = 58, sw = 20;
    var total = 0;
    data.forEach(function (d) { total += d.value; });

    var segs = '';
    if (total === 0) {
      segs = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.grid + '" stroke-width="' + sw + '"/>';
    } else {
      var circumference = 2 * Math.PI * r;
      var offset = 0;
      data.forEach(function (d) {
        if (d.value <= 0) return;
        var frac = d.value / total;
        var dash = frac * circumference;
        segs += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + d.color + '" stroke-width="' + sw + '" stroke-linecap="butt" stroke-dasharray="' + dash + ' ' + (circumference - dash) + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"><title>' + esc(d.label + ' ' + d.value) + '</title></circle>';
        offset += dash;
      });
    }

    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" class="chart-svg" role="img">' +
      segs +
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="donut-value">' + (centerValue != null ? centerValue : total) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" class="donut-label">' + esc(centerTitle || '') + '</text>' +
      '</svg>';

    var legend = '<ul class="chart-legend">' + data.map(function (d) {
      return '<li><i style="background:' + d.color + '"></i><span>' + esc(d.label) + '</span><b>' + d.value + '</b></li>';
    }).join('') + '</ul>';

    container.innerHTML = '<div class="donut-wrap">' + svg + legend + '</div>';
  }

  // 分组柱状图（新增 vs 复习）
  function bars(container, data, seriesA, seriesB) {
    var W = 640, H = 220, padL = 34, padR = 8, padT = 16, padB = 30;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var n = data.length;

    var maxVal = 0;
    data.forEach(function (d) {
      maxVal = Math.max(maxVal, d[seriesA], d[seriesB]);
    });
    if (maxVal === 0) maxVal = 1;
    // 取一个"友好"的 y 轴上限
    var yMax = Math.max(4, Math.ceil(maxVal * 1.2));

    var groupW = plotW / n;
    var barW = Math.min(16, groupW * 0.3);

    // 网格线 + y 轴刻度
    var grid = '';
    var ticks = 4;
    for (var g = 0; g <= ticks; g++) {
      var yv = yMax * g / ticks;
      var yy = padT + plotH - (yv / yMax) * plotH;
      grid += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '" stroke="' + C.grid + '" stroke-width="1"/>';
      grid += '<text x="' + (padL - 6) + '" y="' + (yy + 4) + '" text-anchor="end" class="chart-tick">' + Math.round(yv) + '</text>';
    }

    var bars = '';
    data.forEach(function (d, i) {
      var cx = padL + groupW * i + groupW / 2;
      var ha = d[seriesA] / yMax * plotH;
      var hb = d[seriesB] / yMax * plotH;
      var xa = cx - barW - 1.5;
      var xb = cx + 1.5;
      var ya = padT + plotH - ha;
      var yb = padT + plotH - hb;
      bars += '<rect x="' + xa + '" y="' + ya + '" width="' + barW + '" height="' + Math.max(0, ha) + '" rx="2" fill="' + C.accent + '"><title>' + esc(d.label + ' 新增 ' + d[seriesA]) + '</title></rect>';
      bars += '<rect x="' + xb + '" y="' + yb + '" width="' + barW + '" height="' + Math.max(0, hb) + '" rx="2" fill="' + C.blue + '"><title>' + esc(d.label + ' 复习 ' + d[seriesB]) + '</title></rect>';

      // x 轴标签（间隔显示）
      if (n <= 7 || i % 2 === 0) {
        bars += '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle" class="chart-tick">' + esc(d.label) + '</text>';
      }
    });

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-svg" role="img">' + grid + bars + '</svg>';
    var legend = '<ul class="chart-legend inline"><li><i style="background:' + C.accent + '"></i><span>新增</span></li><li><i style="background:' + C.blue + '"></i><span>复习</span></li></ul>';

    container.innerHTML = svg + legend;
  }

  // 横向条形图（分类进度）
  function hbars(container, data) {
    var rows = data.map(function (d) {
      var pct = d.pct;
      return '<div class="hbar-row">' +
        '<div class="hbar-head"><span>' + esc(d.name) + '</span><b>' + d.learned + '/' + d.total + '</b></div>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + pct + '%;background:' + d.color + '"></div></div>' +
        '</div>';
    }).join('');
    container.innerHTML = '<div class="hbars">' + rows + '</div>';
  }

  // 折线图（理论遗忘 vs 间隔复习）
  function lines(container, data, seriesTheo, seriesSpaced, reviewDays) {
    var W = 640, H = 240, padL = 36, padR = 10, padT = 16, padB = 30;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxT = 30;

    function pt(t, v) {
      var x = padL + (t / maxT) * plotW;
      var y = padT + plotH - (v / 100) * plotH;
      return { x: x, y: y };
    }

    function path(series, close) {
      var d = '';
      series.forEach(function (p, i) {
        var xy = pt(p.t, p.v);
        d += (i === 0 ? 'M' : 'L') + xy.x.toFixed(1) + ' ' + xy.y.toFixed(1) + ' ';
      });
      return '<path d="' + d.trim() + '" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    var grid = '';
    for (var g = 0; g <= 4; g++) {
      var yv = 100 * g / 4;
      var yy = padT + plotH - (yv / 100) * plotH;
      grid += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '" stroke="' + C.grid + '" stroke-width="1"/>';
      grid += '<text x="' + (padL - 6) + '" y="' + (yy + 4) + '" text-anchor="end" class="chart-tick">' + Math.round(yv) + '%</text>';
    }
    // x 轴关键刻度
    [0, 5, 10, 15, 20, 25, 30].forEach(function (t) {
      var x = padL + (t / maxT) * plotW;
      grid += '<text x="' + x + '" y="' + (H - 8) + '" text-anchor="middle" class="chart-tick">' + t + '</text>';
    });

    var theoPath = path(data[seriesTheo]).replace('stroke-width="2.5"', 'stroke-width="2.5" stroke="#C9C5BC" stroke-dasharray="5 5"');
    var spacedPath = path(data[seriesSpaced]).replace('stroke-width="2.5"', 'stroke-width="2.5" stroke="' + C.accent + '"');
    var markers = reviewDays.map(function (t) {
      var p = data[seriesSpaced][t];
      var xy = pt(t, p.v);
      return '<circle cx="' + xy.x.toFixed(1) + '" cy="' + xy.y.toFixed(1) + '" r="3.5" fill="' + C.accent + '"><title>第 ' + t + ' 天复习</title></circle>';
    }).join('');

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart-svg" role="img">' +
      grid +
      theoPath +
      spacedPath +
      markers +
      '</svg>';

    var legend = '<ul class="chart-legend inline"><li><i class="line-dash"></i><span>无复习·遗忘</span></li><li><i style="background:' + C.accent + '"></i><span>间隔复习</span></li></ul>';

    container.innerHTML = svg + legend;
  }

  global.App = global.App || {};
  global.App.charts = {
    donut: donut,
    bars: bars,
    hbars: hbars,
    lines: lines
  };
})(window);
