/**
 * OfferAgent · 扩充题库（前端 · 第二批：JS 深入 / 手写 / 浏览器 / 网络）
 * 挂载到 global.App.fe2Bank，由 bank.js 加载时合并。
 */
(function (global) {
  'use strict';

  var FE2 = [
    {
      id: 'fe-021', category: 'frontend', tags: ['JavaScript', '类型'], difficulty: 2,
      question: '== 和 === 有什么区别？JavaScript 的隐式类型转换规则是什么？',
      answer: `一句话结论：== 比较时会做类型转换（宽松相等），=== 不转换直接比较（严格相等）；隐式转换遵循「ToPrimitive → 数值或字符串」的规则，是 JS 最容易踩坑的地方。

【== 的转换规则】
1. 类型相同：直接比较（对象比引用）；
2. null == undefined 为 true（特例）；
3. 数字 vs 字符串：字符串转数字；
4. 一方是布尔：布尔转数字（true→1, false→0）；
5. 一方是对象：对象转原始值（先 valueOf 再 toString）；
6. 其他都转成数字比较。

【经典坑】
· [] == 0 为 true（[] 转 "" 转 0）；
· [] == ![] 为 true（![] 为 false 转 0，[] 转 0）；
· null == 0 为 false（null 只等于 undefined 和自己）。

【面试追问】对象转原始值的完整过程？→ 先查 Symbol.toPrimitive，再 valueOf，最后 toString。

【避坑】日常开发一律用 ===，避免隐式转换的意外；只有明确需要「null 或 undefined」判断时才用 == null。`,
      source: '牛客面经高频'
    },
    {
      id: 'fe-022', category: 'frontend', tags: ['JavaScript', 'Symbol'], difficulty: 2,
      question: 'Symbol 是什么？有哪些典型应用场景？',
      answer: `一句话结论：Symbol 是 ES6 引入的「唯一、不可变」的原始类型，用作属性名可避免冲突，是 JS 元编程的重要基础。

【特性】
1. 唯一性：Symbol('a') !== Symbol('a')，即使描述相同；
2. 不可变：是原始值，不能 new；
3. 可作为对象属性名，但不会出现在 for...in / Object.keys 中（需 Object.getOwnPropertySymbols）。

【典型应用】
1. 定义唯一属性/常量，避免命名冲突（如 Redux 的 action type）；
2. 定义私有属性（约定，非真正私有）；
3. 内置 Symbol：Symbol.iterator（迭代器）、Symbol.toPrimitive（类型转换）、Symbol.hasInstance（instanceof）、Symbol.asyncIterator 等，用于定制语言行为。

【面试追问】Symbol.for 和 Symbol 区别？→ Symbol.for 会注册到全局符号表，相同 key 返回同一个；Symbol 每次都新建。

【避坑】Symbol 做属性名时不能用点访问（obj.sym 是字符串键），要用 obj[sym]；JSON.stringify 会忽略 Symbol 属性。`,
      source: '牛客面经 / 大厂八股'
    },
    {
      id: 'fe-023', category: 'frontend', tags: ['JavaScript', 'Proxy'], difficulty: 3,
      question: 'Proxy 和 Reflect 是什么？它们能做什么？',
      answer: `一句话结论：Proxy 在目标对象外再包一层「拦截器」，可拦截属性的读写、删除、函数调用等 13 种操作；Reflect 提供对应的「默认行为」方法，配合 Proxy 使用。

【Proxy 常用陷阱（trap）】
· get / set：拦截属性读写；
· has：拦截 in 操作符；
· deleteProperty：拦截 delete；
· apply：拦截函数调用；
· construct：拦截 new。

【典型应用】
1. Vue3 响应式：用 Proxy 替代 Object.defineProperty，能拦截新增/删除属性、数组索引变化；
2. 数据校验：set 时校验类型/范围；
3. 日志/埋点：统计属性访问；
4. 负索引数组、缺省值（如 arr[-1] 取最后一个）。

【Reflect 的作用】
· 提供与 Proxy trap 一一对应的默认行为（Reflect.get/set/has）；
· 让操作结果返回布尔值而非抛错，便于判断；
· 统一函数式 API（替代 Object 上的部分命令式操作）。

【面试追问】Proxy 相比 Object.defineProperty 的优势？→ 能拦截所有操作、能监听新增/删除/数组索引、无需遍历属性、性能更好。

【避坑】Proxy 无法完全透明（this 指向、私有字段可能出问题）；不支持旧浏览器需 polyfill 或用 defineProperty 降级。`,
      source: 'Vue3 源码 / 大厂八股'
    },
    {
      id: 'fe-024', category: 'frontend', tags: ['JavaScript', '内存'], difficulty: 2,
      question: 'WeakMap 和 Map 有什么区别？WeakMap 有什么应用场景？',
      answer: `一句话结论：WeakMap 的 key 只能是对象且是「弱引用」，key 被回收后对应条目自动清除、不可枚举；Map 的 key 任意、是强引用。

【核心区别】
1. key 类型：Map 任意值，WeakMap 只能是对象；
2. 引用强度：WeakMap 对 key 是弱引用（不影响 GC），Map 是强引用（key 不释放则条目不释放）；
3. 可枚举性：WeakMap 不可遍历、无 size/keys/values 方法；
4. 用途：WeakMap 适合「给对象挂额外数据且不阻止其回收」的场景。

【应用场景】
1. 缓存：缓存计算结果，对象被回收时缓存自动清理；
2. 私有属性：把私有数据存在 WeakMap，key 是实例对象；
3. DOM 数据关联：给 DOM 节点挂数据，节点移除后自动释放（避免内存泄漏）。

【面试追问】为什么 WeakMap 不能遍历？→ 弱引用随时可能被 GC 清除，遍历结果不确定，故设计为不可枚举。

【避坑】深拷贝解决循环引用时常用 WeakMap 记录已拷贝对象，这是面试手写题的高频考点。`,
      source: '牛客面经 / 大厂八股'
    },
    {
      id: 'fe-025', category: 'frontend', tags: ['JavaScript', 'Generator'], difficulty: 3,
      question: 'Generator 函数是什么？什么是可迭代协议和迭代器？',
      answer: `一句话结论：Generator 是「可暂停/恢复」的函数（function*），用 yield 分段产出值；迭代器是实现了 next() 的对象，可迭代对象是实现了 Symbol.iterator 的对象。

【Generator 特性】
1. 调用 Generator 返回一个迭代器，不立即执行；
2. 每次调用 next() 执行到下一个 yield 并返回 {value, done}；
3. yield 可接收外部传值（next 的参数作为上一个 yield 的返回值）；
4. 可配合 yield* 委托给另一个 Generator。

【迭代器协议】
· 对象要有 next() 方法，返回 {value, done}。

【可迭代协议】
· 对象要实现 Symbol.iterator，返回迭代器；
· 可被 for...of、展开运算符 ...、解构使用。

【面试追问】Generator 的典型应用？→ 异步流程控制（async/await 的前身）、惰性求值（无限序列）、实现自定义迭代器。

【避坑】生成器函数调用不执行函数体，必须 next() 才推进；for...of 会自动调用 Symbol.iterator 并遍历到 done。`,
      source: '牛客面经 / 大厂八股'
    },
    {
      id: 'fe-026', category: 'frontend', tags: ['JavaScript', '异步'], difficulty: 3,
      question: 'async/await 的实现原理是什么？它和 Generator + Promise 有什么关系？',
      answer: `一句话结论：async/await 本质是 Generator + Promise + 自动执行器（co）的语法糖，await 会暂停函数执行、等待 Promise 完成再继续。

【原理】
1. async 函数返回一个 Promise；
2. await 后面的表达式会被 Promise.resolve 包裹；
3. await 会「暂停」async 函数，把控制权交回事件循环，等 Promise 完成后再恢复执行；
4. 内部可理解为：把函数体转成 Generator，用自动执行器递归调用 next()，每次 yield 一个 Promise，resolve 后继续。

【执行顺序关键】
· await 之后的代码会被放进微任务队列（相当于 .then 回调）；
· 多个 await 是「串行」的，后一个要等前一个完成。

【面试追问】async/await 相比 Promise.then 的优点？→ 代码更像同步、可读性好、能用 try/catch 捕获错误。

【避坑】
· await 会阻塞后续代码（串行），不相关的请求应并行（Promise.all）；
· 循环里 await 是「顺序串行」，想并行要用 Promise.all + map。`,
      source: '牛客面经高频'
    },
    {
      id: 'fe-027', category: 'frontend', tags: ['JavaScript', '手写', 'Promise'], difficulty: 3,
      question: '手写 Promise.all、Promise.race、Promise.allSettled、Promise.any 的区别与实现？',
      answer: `一句话结论：all 全部成功才成功、race 谁先结束就返回谁、allSettled 等全部结束（不管成败）、any 任意一个成功就成功（全失败才 reject）。

【四者对比】
· Promise.all：全部 resolve 才 resolve（返回结果数组），任一 reject 立即 reject；
· Promise.race：最先 settle 的那个决定结果（无论成功失败）；
· Promise.allSettled：等全部 settle，返回 [{status, value/reason}]，永不 reject；
· Promise.any：任一 resolve 即 resolve，全部 reject 才 reject（AggregateError）。

【手写 all 要点】
遍历 promise 数组，用计数器记录完成数，全部 resolve 后返回结果数组，注意用 index 而非 push 保证顺序。

【手写 allSettled 要点】
每个 promise 无论成败都记录结果，全部完成后 resolve。

【面试追问】手写 race 的关键？→ 谁先 resolve/reject 就调用外层 resolve/reject，后续的忽略（Promise 状态不可变）。

【避坑】
· all 的结果顺序要和输入顺序一致（用 index 赋值）；
· any 和 race 在「空数组」时行为不同（any 会 reject）。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-028', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 2,
      question: '手写实现数组的 map、filter、reduce 方法。',
      answer: `一句话结论：map 逐项变换返回新数组、filter 按条件筛选、reduce 把数组「归约」成一个值；三者都基于遍历 + 回调。

【手写 map】
Array.prototype.myMap = function (fn) {
  const res = [];
  for (let i = 0; i < this.length; i++) res.push(fn(this[i], i, this));
  return res;
};

【手写 filter】
Array.prototype.myFilter = function (fn) {
  const res = [];
  for (let i = 0; i < this.length; i++) if (fn(this[i], i, this)) res.push(this[i]);
  return res;
};

【手写 reduce】
Array.prototype.myReduce = function (fn, init) {
  let acc = init === undefined ? this[0] : init;
  let i = init === undefined ? 1 : 0;
  for (; i < this.length; i++) acc = fn(acc, this[i], i, this);
  return acc;
};

【面试追问】reduce 没传初始值时从哪开始？→ 从第二个元素开始，第一个元素作初始累加值。

【避坑】map/filter 返回新数组不改变原数组；reduce 空数组且无初始值会报错；手写时注意 this 指调用数组。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-029', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 2,
      question: '什么是函数柯里化（Currying）？如何手写实现？',
      answer: `一句话结论：柯里化把「接收多个参数的函数」转成「一系列接收单个参数的函数」，参数够了才执行，不够则返回新函数继续收集。

【实现】
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...rest) => curried(...args, ...rest);
  };
}

【使用】
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6

【应用场景】
1. 参数复用（预设部分参数）；
2. 延迟执行；
3. 函数组合/中间件；
4. 面试常考 add(1)(2)(3) 这类题。

【面试追问】柯里化和偏函数（Partial Application）区别？→ 偏函数是固定部分参数返回新函数，柯里化是严格地「每次一个参数」。

【避坑】用 fn.length（形参个数）判断是否执行，注意默认参数/剩余参数会「截断」length；实现时用递归 + 闭包收集参数。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-030', category: 'frontend', tags: ['JavaScript', '设计模式'], difficulty: 2,
      question: '手写一个发布-订阅模式（事件总线 EventEmitter）。',
      answer: `一句话结论：发布-订阅是一种解耦模式，订阅者先注册回调，发布者触发时通知所有订阅者；核心是「事件名 → 回调数组」的映射。

【实现】
class EventEmitter {
  constructor() { this.events = {}; }
  on(name, fn) { (this.events[name] ||= []).push(fn); }
  off(name, fn) { this.events[name] = (this.events[name] || []).filter(f => f !== fn); }
  once(name, fn) { const wrap = (...a) => { fn(...a); this.off(name, wrap); }; this.on(name, wrap); }
  emit(name, ...args) { (this.events[name] || []).forEach(fn => fn(...args)); }
}

【应用场景】
· 跨组件通信（非父子组件）；
· 事件驱动的解耦（Node 的 EventEmitter、Vue 的 $emit/$on）；
· 埋点、消息通知。

【面试追问】发布-订阅和观察者模式的区别？→ 观察者模式里「观察者」直接订阅「目标」，两者耦合较紧；发布-订阅多一个「事件中心」，发布者与订阅者完全解耦。

【避坑】emit 时若回调里又 on/off 要注意遍历快照；及时 off 防止内存泄漏（尤其是组件销毁时）。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-031', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 2,
      question: '数组去重和数组扁平化（flatten）如何实现？',
      answer: `一句话结论：去重可用 Set、双层循环、filter+indexOf；扁平化可用递归、reduce 或 flat(Infinity)。

【数组去重】
1. [...new Set(arr)]：最简单，但不能去重对象/NaN 需注意（Set 能正确去重 NaN）；
2. filter((item, index) => arr.indexOf(item) === index)；
3. 对象数组按某个字段去重：用 Map 记录 key。

【数组扁平化】
function flatten(arr) {
  return arr.reduce((acc, cur) =>
    acc.concat(Array.isArray(cur) ? flatten(cur) : cur), []);
}
// 或指定深度：
function flattenDepth(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((a, c) => a.concat(Array.isArray(c) ? flattenDepth(c, depth - 1) : c), [])
    : arr.slice();
}

【面试追问】flat(Infinity) 的底层思路？→ 递归把嵌套数组展开到任意深度。

【避坑】Set 去重对象无效（对象引用不同）；递归扁平化注意栈溢出（极深嵌套时改迭代）。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-032', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 3,
      question: '如何手写一个深比较（deepEqual）函数？',
      answer: `一句话结论：深比较递归比较两个值的「结构与内容」是否完全一致，处理对象、数组、原始类型，并处理循环引用。

【实现思路】
function deepEqual(a, b, seen = new WeakMap()) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (seen.get(a) === b) return true; // 循环引用
  seen.set(a, b);
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k], seen));
}

【关键点】
1. 先 === 短路（含 NaN 需单独处理，NaN !== NaN）；
2. 类型判断：原始类型直接比较，对象递归；
3. 循环引用用 WeakMap 记录已比较对，防死循环；
4. 数组和普通对象可统一用 Object.keys 处理。

【面试追问】NaN 怎么处理？→ 用 Number.isNaN 或 a !== a && b !== b 特判。

【避坑】浅比较（===）只比引用，React 的 PureComponent/shouldComponentUpdate 用它；深比较开销大，大对象慎用。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-033', category: 'frontend', tags: ['JavaScript', '精度'], difficulty: 2,
      question: '为什么 0.1 + 0.2 !== 0.3？如何解决浮点数精度问题？',
      answer: `一句话结论：JS 用 IEEE 754 双精度浮点数，0.1 和 0.2 的二进制是「无限循环小数」被截断，相加后再转十进制就不等于 0.3。

【原因】
· 十进制 0.1 转二进制是 0.0001100110011...（无限循环），64 位只能存 52 位尾数，产生舍入误差；
· 两个近似值相加，误差累积，结果约等于 0.30000000000000004。

【解决方案】
1. 转整数运算：把小数放大成整数计算再缩回；
2. 四舍五入到指定精度：Number((0.1 + 0.2).toFixed(1))；
3. 用误差阈值比较：Math.abs(a - b) < Number.EPSILON；
4. 大数/高精度用 BigInt 或第三方库（decimal.js、big.js）。

【面试追问】BigInt 是什么？→ 表示任意精度的整数，用 n 后缀（10n），不能和普通 number 混算，用于超长整数/金额。

【避坑】金融金额千万不能用浮点直接算，要转「分」为整数或用 decimal 库；判断相等用阈值而非 ===。`,
      source: '牛客面经高频'
    },
    {
      id: 'fe-034', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 2,
      question: '如何实现数字千分位格式化（如 1234567 → 1,234,567）？',
      answer: `一句话结论：千分位格式化可用正则、toLocaleString、或手动从右往左每三位加逗号。

【三种实现】
1. 原生：num.toLocaleString('en-US') 或 (1234567).toLocaleString()；
2. 正则：String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')；
3. 手动：从右往左每三位加逗号。

【正则解释】
· \B 非单词边界；
· (?=(\d{3})+(?!\d))：前瞻——后面是「3 的倍数个数字」且之后不是数字，即从右往左每三位处。

【手写版本】
function format(n) {
  const s = String(n), parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

【面试追问】带小数和负数怎么处理？→ 只格式化整数部分，符号和小数部分保持不变。

【避坑】toLocaleString 在不同环境输出可能不同（依赖 locale），要稳定用正则或手写。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-035', category: 'frontend', tags: ['JavaScript', '事件'], difficulty: 2,
      question: '事件捕获、冒泡、事件委托分别是什么？',
      answer: `一句话结论：事件传播分「捕获（外层→内层）→ 目标 → 冒泡（内层→外层）」三阶段；事件委托把子元素的事件监听挂到父元素上，利用冒泡统一处理。

【三阶段】
1. 捕获阶段：从 window 向下传递到目标元素；
2. 目标阶段：到达触发事件的元素；
3. 冒泡阶段：从目标元素向上冒泡到 window。

【事件委托】
· 原理：子元素事件会冒泡到父元素，父元素用 e.target 判断实际点击的是哪个子元素；
· 优点：减少监听器数量、动态添加的子元素也自动生效。

【代码示例】
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') console.log(e.target.textContent);
});

【面试追问】addEventListener 第三个参数？→ false（默认）在冒泡阶段触发，true 在捕获阶段触发；也可传 options 对象（once、passive）。

【避坑】e.stopPropagation 阻止冒泡会影响委托；委托要判断 e.target 是否为目标元素（可能是子元素内部）。`,
      source: '牛客面经高频'
    },
    {
      id: 'fe-036', category: 'frontend', tags: ['浏览器', '动画'], difficulty: 2,
      question: 'requestAnimationFrame 是什么？它和 setTimeout 做动画有什么区别？',
      answer: `一句话结论：requestAnimationFrame 让浏览器在「下一帧重绘前」执行回调，与屏幕刷新率同步，做动画更流畅省电；setTimeout 是定时触发，与渲染不同步。

【rAF 特点】
1. 回调执行时机与浏览器刷新率对齐（通常 60fps，约 16.6ms 一帧）；
2. 后台标签页会自动暂停（省资源）；
3. 浏览器自动优化，动画流畅不掉帧。

【和 setTimeout 的区别】
· setTimeout 不关心渲染时机，可能一帧内执行多次或错过帧，导致掉帧/卡顿；
· rAF 每帧只执行一次，天然适配动画循环。

【典型用法】
function animate() { /* 更新 */ requestAnimationFrame(animate); }
requestAnimationFrame(animate);

【面试追问】如何取消？→ cancelAnimationFrame(id)。

【避坑】rAF 里不要再做重活（会阻塞下一帧）；连续 rAF 要记得在组件销毁时取消，否则内存泄漏。`,
      source: '牛客面经 / 大厂八股'
    },
    {
      id: 'fe-037', category: 'frontend', tags: ['浏览器', '多线程'], difficulty: 2,
      question: 'Web Worker 是什么？它解决了什么问题？有什么限制？',
      answer: `一句话结论：Web Worker 在独立线程里运行脚本，让耗时计算不阻塞主线程 UI，解决「计算密集任务卡页面」的问题。

【作用】
· JS 单线程，耗时计算会阻塞渲染；
· Worker 在后台线程执行，与主线程通过 postMessage 通信。

【使用】
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => { /* 处理结果 */ };

【限制】
1. 不能操作 DOM（没有 window/document）；
2. 通信靠消息传递（数据是拷贝，大数据用 Transferable 转移）；
3. 同源限制；
4. 不能直接用 localStorage 的部分场景（可访问但有限制）。

【面试追问】Worker 有哪些类型？→ 专用 Worker、SharedWorker（多页面共享）、Service Worker（离线缓存，本项目 PWA 就用了）。

【避坑】Worker 通信有序列化开销，不适合「频繁小通信」的场景；大量图片/矩阵计算才划算。`,
      source: '大厂八股'
    },
    {
      id: 'fe-038', category: 'frontend', tags: ['前端路由'], difficulty: 2,
      question: '前端路由 hash 模式和 history 模式有什么区别？',
      answer: `一句话结论：hash 模式用 URL 的 # 部分做路由，不经过服务器、兼容性好；history 模式用 HTML5 History API 改路径，更美观但需服务器配合。

【hash 模式】
· URL 形如 example.com/#/home，# 之后是路由；
· 监听 hashchange 事件；
· 优点：不需要服务器配置、刷新不会 404、兼容性好；
· 缺点：URL 有 #，不美观。

【history 模式】
· URL 形如 example.com/home；
· 用 pushState/replaceState 改变路径，监听 popstate；
· 优点：URL 干净、符合语义；
· 缺点：刷新时会请求服务器该路径，需服务器重定向到 index.html（否则 404）。

【面试追问】history 模式为什么刷新会 404？→ 刷新时浏览器直接请求 /home 路径，服务器没有该资源，需配置 fallback 到 index.html。

【避坑】部署 history 模式必须配服务器 rewrite 规则；pushState 不会触发 popstate（只有浏览器前进后退触发）。`,
      source: '大厂八股'
    },
    {
      id: 'fe-039', category: 'frontend', tags: ['HTTP', '协议'], difficulty: 3,
      question: 'HTTP/1.1、HTTP/2、HTTP/3 有什么区别？',
      answer: `一句话结论：HTTP/1.1 存在队头阻塞；HTTP/2 用二进制分帧 + 多路复用解决应用层队头阻塞；HTTP/3 改用基于 UDP 的 QUIC，进一步解决传输层队头阻塞。

【HTTP/1.1】
· 文本协议、Keep-Alive 长连接、但同一连接请求串行（队头阻塞）；
· 并发靠多开 TCP 连接（一般 6 个）。

【HTTP/2】
· 二进制分帧：数据拆成帧，多路复用（同一连接并行多个请求）；
· 头部压缩（HPACK）、服务器推送（Server Push）；
· 解决「应用层」队头阻塞，但仍受 TCP 丢包重传影响。

【HTTP/3（QUIC）】
· 基于 UDP，减少握手（0-RTT/1-RTT）；
· 连接不依赖 IP（连接迁移，切换网络不断线）；
· 彻底解决「传输层」队头阻塞。

【面试追问】HTTP/2 一定比 1.1 快吗？→ 弱网/高丢包下 HTTP/2 可能因 TCP 队头阻塞反而不如多连接；此时 HTTP/3 更优。

【避坑】「多路复用」是 HTTP/2 的核心考点；Server Push 因实现复杂实际用得少。`,
      source: '大厂八股（字节/腾讯）'
    },
    {
      id: 'fe-040', category: 'frontend', tags: ['安全', 'XSS'], difficulty: 3,
      question: '什么是 XSS 攻击？有哪些类型？如何防御？',
      answer: `一句话结论：XSS（跨站脚本）是攻击者在页面注入恶意脚本，在受害者浏览器执行；分存储型、反射型、DOM 型；核心防御是「输入过滤 + 输出转义 + CSP」。

【三种类型】
1. 存储型：恶意脚本存到服务器（如评论），其他用户访问时执行，危害最大；
2. 反射型：脚本藏在 URL 参数，诱导用户点击，一次性；
3. DOM 型：不经过服务器，前端 JS 把不可信数据写进 DOM（innerHTML）触发。

【防御】
1. 输出转义：用户内容显示前转义 HTML 特殊字符（< > " ' &）；
2. 不要用 innerHTML 拼不可信数据，改用 textContent；
3. CSP：内容安全策略，限制脚本来源；
4. 输入校验/过滤（白名单）；
5. cookie 设 HttpOnly（防脚本窃取）。

【面试追问】为什么 HttpOnly 能防 XSS？→ 设 HttpOnly 后 JS 无法读取该 cookie，即使注入脚本也偷不到凭证。

【避坑】「只过滤输入」不够，输出转义才是关键；富文本场景要用白名单过滤（如 DOMPurify）。`,
      source: '大厂八股 / 安全'
    },
    {
      id: 'fe-041', category: 'frontend', tags: ['安全', 'CSRF'], difficulty: 2,
      question: '什么是 CSRF 攻击？如何防御？',
      answer: `一句话结论：CSRF（跨站请求伪造）是攻击者诱导用户在已登录的站点上「发起非本意的请求」，利用浏览器自动携带 cookie 的机制冒用用户身份。

【攻击原理】
1. 用户登录了 A 网站（cookie 已保存）；
2. 访问恶意网站 B，B 里放了一个「请求 A 网站转账」的请求（如图片 src、表单提交）；
3. 浏览器自动带上 A 的 cookie，A 以为是用户本人操作。

【防御】
1. CSRF Token：服务器生成随机 token，随表单提交并校验（攻击者拿不到）；
2. SameSite Cookie：设 SameSite=Lax/Strict，跨站请求不携带 cookie；
3. 校验 Referer/Origin 请求头；
4. 敏感操作二次验证（验证码、短信）。

【面试追问】SameSite 三个值的区别？→ Strict 完全禁止跨站携带；Lax 允许部分（如链接跳转）；None 不限制（需配 Secure）。

【避坑】CSRF 和 XSS 常一起考：XSS 是「注入脚本」，CSRF 是「冒用身份」，防御手段不同。`,
      source: '大厂八股 / 安全'
    },
    {
      id: 'fe-042', category: 'frontend', tags: ['安全', 'CORS'], difficulty: 3,
      question: '什么是跨域？CORS 的原理和预检请求（Preflight）是什么？',
      answer: `一句话结论：跨域是「协议、域名、端口」任一不同就受同源策略限制；CORS 是服务器通过响应头（Access-Control-Allow-*）声明允许哪些源访问。

【同源策略】
· 同源 = 协议 + 域名 + 端口都相同；
· 限制跨域请求、跨域读取 DOM、跨域访问 localStorage。

【CORS 原理】
· 简单请求：直接发，响应带 Access-Control-Allow-Origin 即可；
· 非简单请求（如 PUT、自定义头、Content-Type 非表单）：先发 OPTIONS 预检请求，服务器确认允许后才发真实请求。

【关键响应头】
· Access-Control-Allow-Origin：允许的源（或 *）；
· Access-Control-Allow-Methods / -Headers：允许的方法/头；
· Access-Control-Allow-Credentials：是否允许携带 cookie。

【面试追问】为什么有预检？→ 复杂请求先「探路」，确认服务器允许，避免对服务器造成实际影响。

【避坑】带 cookie 时 Allow-Origin 不能是 *，必须指定具体源 + Allow-Credentials: true；预检结果可被缓存（Access-Control-Max-Age）。`,
      source: '大厂八股'
    },
    {
      id: 'fe-043', category: 'frontend', tags: ['浏览器', '渲染'], difficulty: 3,
      question: '什么是浏览器的合成层（Composite）和 GPU 加速？',
      answer: `一句话结论：合成层是浏览器把部分元素提升到独立图层，交给 GPU 合成，避免影响其他元素的重排重绘，提升动画/滚动性能。

【渲染流水线】
DOM/CSSOM → 布局（Layout）→ 绘制（Paint）→ 合成（Composite）。

【合成层的作用】
· 某些元素（transform、opacity、will-change）被提升为独立图层；
· 动画只在这个图层上做「合成」，不触发重排重绘（GPU 处理）；
· 主线程压力减小，动画更流畅。

【哪些属性触发合成】
· transform、opacity、filter、will-change、video/canvas 等。

【面试追问】为什么用 transform 做动画比 left/top 好？→ left/top 触发布局（重排），transform 只触发合成，走 GPU，性能高得多。

【避坑】「图层不是越多越好」，图层过多会占内存、增加合成开销；will-change 滥用反而变慢，用完要移除。`,
      source: '大厂八股'
    },
    {
      id: 'fe-044', category: 'frontend', tags: ['性能', 'SPA'], difficulty: 3,
      question: 'SPA（单页应用）首屏加载慢，如何优化？',
      answer: `一句话结论：首屏优化围绕「减少资源体积、减少请求、加快关键渲染」——代码分割、按需加载、SSR/预渲染、缓存、CDN、压缩等。

【优化手段】
1. 代码分割 + 路由懒加载：首屏只加载当前路由的 JS；
2. 资源压缩：gzip/brotli、图片压缩（webp/avif）；
3. CDN 加速 + 静态资源强缓存；
4. 关键 CSS 内联、非关键 CSS 延迟加载；
5. 骨架屏 / loading 占位，提升感知性能；
6. SSR / SSG / 预渲染：直接输出 HTML，缩短白屏；
7. 预加载（preload/prefetch）关键资源；
8. 减小打包体积：tree-shaking、按需引入、去重依赖。

【面试追问】首屏性能指标有哪些？→ FCP（首次内容绘制）、LCP（最大内容绘制）、TTI（可交互时间）。

【避坑】不要只堆手段，先用性能分析工具定位瓶颈（是 JS 大、还是图片大、还是接口慢）。`,
      source: '大厂八股 / 性能优化'
    },
    {
      id: 'fe-045', category: 'frontend', tags: ['性能', '加载'], difficulty: 2,
      question: '懒加载（Lazy Load）和预加载（Preload/Prefetch）有什么区别？',
      answer: `一句话结论：懒加载是「用到才加载」，延迟加载非关键资源；预加载是「提前加载」未来要用的资源，两者方向相反。

【懒加载】
· 场景：图片（滚动到可视区才加载）、路由组件、长列表；
· 实现：IntersectionObserver 监听元素进入视口，或监听 scroll；
· 图片可用 loading="lazy" 属性。

【预加载】
· preload：声明当前页面马上要用的资源，高优先级提前加载（如关键字体、首屏图片）；
· prefetch：预取「未来可能用」的资源（如下一页的 JS），低优先级空闲时加载；
· dns-prefetch / preconnect：提前解析 DNS / 建立连接。

【对比】
· 懒加载：省初始流量、加快首屏；
· 预加载：减少后续跳转/使用的等待。

【面试追问】preload 和 prefetch 区别？→ preload 用于「当前页面必需的资源」，prefetch 用于「将来可能用到的资源」。

【避坑】滥用 prefetch 会浪费带宽；懒加载要注意 SEO（关键内容别懒加载）。`,
      source: '大厂八股 / 性能优化'
    },
    {
      id: 'fe-046', category: 'frontend', tags: ['性能', '长列表'], difficulty: 3,
      question: '长列表（上万条数据）如何优化渲染？什么是虚拟滚动？',
      answer: `一句话结论：长列表核心是「只渲染可视区域 + 缓冲区的部分」，虚拟滚动动态计算渲染窗口，避免一次性渲染上万 DOM。

【虚拟滚动原理】
1. 外层固定高度的容器 + 内层「撑高」的占位；
2. 根据 scrollTop 计算可视区对应的起始/结束索引；
3. 只渲染 [startIndex - buffer, endIndex + buffer] 的数据；
4. 用 transform: translateY 定位渲染的数据块。

【其他优化】
1. 分页/无限滚动（分批加载）；
2. 列表项用 React.memo / 固定 key 减少重复渲染；
3. 图片懒加载。

【面试追问】虚拟滚动为什么要「缓冲区」？→ 防止快速滚动时出现空白，提前渲染可视区外少量项。

【避坑】每项高度不定时虚拟滚动实现更复杂（需动态测量）；要正确处理滚动定位与数据更新。`,
      source: '大厂八股 / 性能优化'
    },
    {
      id: 'fe-047', category: 'frontend', tags: ['性能', '图片'], difficulty: 2,
      question: '前端图片优化有哪些手段？',
      answer: `一句话结论：图片优化围绕「更小体积、更快加载、更好体验」——选对格式、压缩、懒加载、响应式、CDN、雪碧图等。

【优化手段】
1. 格式选择：照片用 WebP/AVIF（比 JPEG/PNG 更小），图标用 SVG；
2. 压缩：无损/有损压缩、按需缩放尺寸；
3. 懒加载：滚动到才加载（loading="lazy"）；
4. 响应式图片：srcset 按屏幕宽度/DPR 加载不同尺寸；
5. CDN + 强缓存；
6. 雪碧图 / 内联小图标（减少请求）；
7. 渐进式 JPEG（先模糊后清晰）。

【面试追问】WebP 的优势？→ 同质量下体积比 JPEG 小 25%~35%，支持透明，已被现代浏览器广泛支持。

【避坑】大图直接塞页面是首屏慢的常见原因；不要用 CSS 缩放超大图（下载的还是原图）。`,
      source: '大厂八股 / 性能优化'
    },
    {
      id: 'fe-048', category: 'frontend', tags: ['浏览器', 'V8'], difficulty: 3,
      question: 'V8 引擎是如何执行 JavaScript 的？什么是 JIT 编译？',
      answer: `一句话结论：V8 用「解析 → 字节码 → JIT 编译」的流水线执行 JS；JIT（即时编译）在运行时把热点代码编译成机器码，兼顾启动速度与执行性能。

【执行流程】
1. Parser 解析：源码 → AST（抽象语法树）；
2. Ignition 解释器：AST → 字节码并执行（启动快）；
3. TurboFan 编译器：监测到「热点代码」（频繁执行），编译成优化机器码；
4. 优化失败则「去优化」（deopt）回退到解释执行。

【JIT 优势】
· 相比纯解释执行更快，相比 AOT 编译启动更快；
· 边执行边优化，只优化热点代码。

【面试追问】为什么说「隐藏类」和「保持对象形状一致」能提升性能？→ V8 靠隐藏类（Map）做属性访问优化，动态增删属性/改变形状会导致去优化。

【避坑】写 JS 时保持对象结构稳定、避免频繁改变类型，能帮助 JIT 优化；这是「性能优化」底层原理的常考点。`,
      source: '大厂八股（V8 原理）'
    },
    {
      id: 'fe-049', category: 'frontend', tags: ['JavaScript', '优化'], difficulty: 3,
      question: '什么是尾调用优化（Tail Call Optimization）？',
      answer: `一句话结论：尾调用是函数最后一步调用另一个函数；尾调用优化（TCO）让引擎复用当前栈帧而非新建，避免递归栈溢出。

【尾调用】
function f() { return g(); } // g() 是尾调用

【为什么能优化】
· 尾调用后当前函数不再需要自己的栈帧，可直接复用，栈不增长；
· 尾递归（递归调用是最后一步）可变成「循环」，避免栈溢出。

【示例】
// 非尾递归（会栈溢出）
function fact(n) { return n * fact(n - 1); }
// 尾递归（可优化）
function fact(n, acc = 1) { return n <= 1 ? acc : fact(n - 1, n * acc); }

【面试追问】JS 支持 TCO 吗？→ ES6 规范支持「正确的尾调用」，但只有 Safari 等少数引擎实现，V8/Chrome 长期未完整实现。

【避坑】「尾调用」必须是「返回语句直接调用」，前面不能有额外运算；实践中更常用「循环改写」或「蹦床函数（trampoline）」替代。`,
      source: '大厂八股'
    },
    {
      id: 'fe-050', category: 'frontend', tags: ['JavaScript', '正则'], difficulty: 2,
      question: '正则表达式常用的元字符和方法有哪些？贪婪匹配和惰性匹配有什么区别？',
      answer: `一句话结论：正则用元字符描述「模式」来匹配/替换字符串，JS 里常用 test/exec/match/replace；贪婪匹配尽量多匹配，惰性匹配尽量少匹配。

【常用元字符】
· . 任意字符；\d 数字 \w 字母数字下划线 \s 空白；
· * 0次+、+ 1次+、? 0或1次、{n,m} n到m次；
· ^ 开头 $ 结尾；[] 字符集；() 分组；| 或。

【贪婪 vs 惰性】
· 贪婪（默认）：量词尽量多匹配，如 /a.*b/ 匹配最长的「a...b」；
· 惰性：量词后加 ?，尽量少匹配，如 /a.*?b/ 匹配最短的「a...b」。

【常用方法】
· regex.test(str)：返回布尔；
· str.match(regex)：返回匹配结果；
· str.replace(regex, cb)：替换（正则最常用的场景）。

【面试追问】如何写「匹配邮箱/手机号」的正则？→ 邮箱大致 /[\w.-]+@[\w-]+(\.[\w-]+)+/；注意边界情况。

【避坑】正则易写难维护，复杂场景要加注释；回溯过多可能导致性能问题（ReDoS）。`,
      source: '牛客面经'
    },
    {
      id: 'fe-051', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 3,
      question: '手写 bind 的完整实现（处理 new 的情况）。',
      answer: `一句话结论：bind 返回一个「绑定了 this 和部分参数」的新函数；难点是当新函数被 new 调用时，this 应指向新实例而非绑定的 this。

【完整实现】
Function.prototype.myBind = function (context, ...args) {
  const self = this;
  const bound = function (...innerArgs) {
    // 被 new 调用时，this 是 bound 的实例，应优先用 this
    return self.apply(
      this instanceof bound ? this : context,
      args.concat(innerArgs)
    );
  };
  // 继承原型
  bound.prototype = Object.create(self.prototype);
  return bound;
};

【关键点】
1. 用闭包保存原函数和预设参数；
2. 判断是否被 new 调用：this instanceof bound；
3. 用 Object.create 连接原型，保证 new 出来的实例能访问原函数原型方法。

【面试追问】为什么 bind 后 new 会优先用实例？→ new 绑定优先级最高，bind 的内部 this 绑定要让位于 new。

【避坑】bind 是「返回新函数」不立即执行，call/apply 立即执行；箭头函数没有自己的 this，bind 对它无效（只做参数预设）。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-052', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 2,
      question: '手写 Object.create 的实现。',
      answer: `一句话结论：Object.create(proto) 创建一个新对象，并把它的原型指向 proto；手写核心就是「临时构造函数 + 原型指向」。

【实现】
Object.prototype.myCreate = function (proto, props) {
  function F() {}
  F.prototype = proto;
  const obj = new F();
  if (props) Object.defineProperties(obj, props);
  return obj;
};

【原理】
· 用空构造函数 F，把 F.prototype 设为 proto；
· new F() 得到 obj，obj.__proto__ = F.prototype = proto；
· 这就是「原型式继承」的实现。

【面试追问】Object.create(null) 有什么用？→ 创建「无原型」的纯净对象，没有 toString 等方法，适合做字典/哈希表（键不会被原型污染）。

【避坑】Object.create 和 new 的区别：new 执行构造函数、Object.create 只指定原型；面试常和「寄生组合继承」一起考。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-053', category: 'frontend', tags: ['JavaScript', '手写'], difficulty: 3,
      question: '手写 JSON.stringify 的实现（处理常见类型和循环引用）。',
      answer: `一句话结论：JSON.stringify 把 JS 值转成 JSON 字符串；手写要点是区分类型处理、处理循环引用、转义特殊字符。

【实现思路】
function myStringify(data) {
  if (data === null) return 'null';
  const type = typeof data;
  if (type === 'string') return '"' + data + '"';
  if (type === 'number' || type === 'boolean') return String(data);
  if (type === 'undefined' || type === 'function' || type === 'symbol') return undefined;
  if (Array.isArray(data)) {
    const arr = data.map(v => myStringify(v) === undefined ? 'null' : myStringify(v));
    return '[' + arr.join(',') + ']';
  }
  const keys = Object.keys(data);
  const pairs = keys.filter(k => myStringify(data[k]) !== undefined)
                    .map(k => '"' + k + '":' + myStringify(data[k]));
  return '{' + pairs.join(',') + '}';
}

【关键点】
1. 类型处理：字符串加引号、数字/布尔直接转、undefined/函数/符号忽略或转 null；
2. 循环引用：需用 WeakMap 记录已处理对象，否则死循环；
3. 特殊字符（引号、换行）要转义。

【面试追问】JSON.stringify 的局限？→ 丢失函数/undefined/Symbol、Date 变字符串、无法处理循环引用、丢失原型。

【避坑】实现时循环引用是重点（面试官常追问）；数组里 undefined/函数要转成 null。`,
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-054', category: 'frontend', tags: ['JavaScript', '类型'], difficulty: 2,
      question: 'JS 有哪些判断类型的方法？各自有什么优缺点？',
      answer: `一句话结论：判断类型常用 typeof、instanceof、Object.prototype.toString.call、Array.isArray；各有盲区，综合使用才能准确判断。

【方法对比】
1. typeof：能区分基本类型，但 typeof null 是 'object'、无法区分对象/数组（都是 'object'）、typeof 函数是 'function'；
2. instanceof：判断是否在某构造函数的原型链上，能判断数组（[] instanceof Array），但跨 iframe 失效、不能判断基本类型；
3. Object.prototype.toString.call(x)：返回 '[object Type]'，最准确（能判断 null、数组、日期等），是通用方案；
4. Array.isArray(x)：专门判断数组，最可靠。

【面试追问】为什么 typeof null 是 'object'？→ 历史遗留 bug：JS 早期用「类型标签」表示，null 的标签和对象一样是 0。

【避坑】判断数组别用 typeof（返回 'object'），用 Array.isArray 或 toString；判断 null 用 x === null。`,
      source: '牛客面经'
    },
    {
      id: 'fe-055', category: 'frontend', tags: ['JavaScript', 'ES6'], difficulty: 2,
      question: 'ES6 及之后（ES6+）有哪些重要的新特性？',
      answer: `一句话结论：ES6+ 带来 let/const、箭头函数、解构、模板字符串、Promise、class、模块化、Symbol、Proxy、async/await、可选链、空值合并等一大批特性。

【重要特性分类】
1. 变量：let/const（块级作用域）；
2. 函数：箭头函数、默认参数、剩余参数 ...rest；
3. 语法：解构赋值、模板字符串、扩展运算符 ...；
4. 对象：class、对象的简洁写法、Object.assign；
5. 异步：Promise、async/await、Generator；
6. 模块化：import/export；
7. 数据结构：Set/Map/WeakSet/WeakMap、Symbol；
8. 新 API：Object.entries/values、String.includes/startsWith、Array.from/find/includes、flat；
9. 元编程：Proxy/Reflect；
10. 后续：可选链 ?.、空值合并 ??、BigInt、Promise.allSettled、顶层 await、Array.at 等。

【面试追问】可选链 ?. 和空值合并 ?? 的区别？→ ?. 安全访问（避免 undefined 报错），?? 只在 null/undefined 时用默认值（区别于 || 的假值判断）。

【避坑】记住「某特性属于哪个版本」常被问，但更重要的是「会用、知道它解决什么问题」。`,
      source: '牛客面经 / 大厂八股'
    },
    {
      id: 'fe-056', category: 'frontend', tags: ['JavaScript', '函数式'], difficulty: 2,
      question: '什么是函数式编程？纯函数、高阶函数、不可变性分别是什么？',
      answer: `一句话结论：函数式编程把计算看成「函数的组合与求值」，强调纯函数、不可变数据、无副作用；纯函数是「同输入必同输出、无副作用」的函数。

【核心概念】
1. 纯函数：不依赖/不修改外部状态，同输入恒同输出，可缓存、可测试、易推理；
2. 高阶函数：接收或返回函数的函数（如 map/filter/reduce/柯里化）；
3. 不可变性：数据一旦创建不修改，变化时返回新副本（避免共享状态副作用）；
4. 函数组合：compose(f, g)(x) = f(g(x))，把多个小函数组合成大逻辑。

【在 JS 中的体现】
· 数组方法 map/filter/reduce 是函数式思想的体现；
· React 的「UI = f(state）」、Redux 的 reducer 都是纯函数 + 不可变。

【面试追问】纯函数的好处？→ 可缓存（memoize）、易测试、易并行、无副作用、结果可预测。

【避坑】「不可变」不等于「不用修改数据」，而是「变化时生成新数据」；JS 里可用 Object.freeze 浅冻结（注意是浅冻结）。`,
      source: '大厂八股'
    },
    {
      id: 'fe-057', category: 'frontend', tags: ['浏览器', 'Cookie'], difficulty: 2,
      question: 'Cookie 有哪些重要属性？HttpOnly、Secure、SameSite 分别是什么？',
      answer: `一句话结论：Cookie 的属性控制其作用域、安全性和携带时机；HttpOnly 防 JS 读取、Secure 仅 HTTPS、SameSite 控制跨站携带。

【重要属性】
1. HttpOnly：禁止 JS 读取（document.cookie 拿不到），防 XSS 窃取；
2. Secure：只在 HTTPS 下传输；
3. SameSite：控制跨站请求是否携带 cookie；
   · Strict：完全禁止跨站携带（最严）；
   · Lax：允许部分（如链接跳转），默认推荐；
   · None：不限制（必须配 Secure）；
4. Domain/Path：作用域（哪些域名/路径下有效）；
5. Expires/Max-Age：过期时间（会话 cookie 关闭即失效）。

【面试追问】为什么登录态常用 HttpOnly + Secure + SameSite？→ 综合防 XSS 窃取、防明文传输、防 CSRF。

【避坑】SameSite=None 必须同时设 Secure，否则浏览器忽略；cookie 大小约 4KB，别存大数据。`,
      source: '大厂八股 / 安全'
    },
    {
      id: 'fe-058', category: 'frontend', tags: ['安全', 'CSP'], difficulty: 2,
      question: '什么是 CSP（内容安全策略）？它如何工作？',
      answer: `一句话结论：CSP 通过 HTTP 响应头（Content-Security-Policy）告诉浏览器「允许从哪些源加载哪些资源」，是防 XSS 的重要防线。

【工作原理】
· 服务器下发 CSP 头，声明资源白名单；
· 浏览器按策略拦截不在白名单内的资源/脚本。

【常用指令】
· default-src 'self'：默认只允许同源；
· script-src：允许的脚本来源（可设 'unsafe-inline' 或 nonce/hash）；
· style-src、img-src、font-src：对应资源；
· connect-src：允许的请求地址。

【防 XSS 的原理】
即使攻击者注入 <script>，只要脚本来源不在白名单，浏览器就不执行。

【面试追问】如何允许「内联脚本」又保证安全？→ 用 nonce（随机数）或 hash 精确白名单特定内联脚本，避免直接开 'unsafe-inline'。

【避坑】CSP 配置过严会导致正常功能失效，要逐步收紧 + 测试；CSP 是「纵深防御」的一层，不能替代输入过滤。`,
      source: '大厂八股 / 安全'
    },
    {
      id: 'fe-059', category: 'frontend', tags: ['监控', '错误处理'], difficulty: 2,
      question: '前端如何捕获和上报错误？有哪些错误类型？',
      answer: `一句话结论：前端错误分「资源加载错误、JS 运行时错误、Promise 未捕获、接口错误、白屏」；用 window.onerror、unhandledrejection、try/catch 捕获并上报。

【捕获方式】
1. window.onerror / addEventListener('error')：捕获 JS 运行时错误；
2. window.addEventListener('unhandledrejection')：捕获未处理的 Promise 拒绝；
3. try/catch：主动包裹可能出错的代码；
4. 资源加载错误：用捕获阶段的 error 事件（资源错误不冒泡）；
5. Vue/React 的全局错误边界（errorHandler / ErrorBoundary）。

【上报内容】
· 错误信息、堆栈、页面 URL、用户信息、浏览器环境、发生时间。

【上报方式】
· 用 navigator.sendBeacon 或图片打点（1x1 gif），避免阻塞页面卸载；
· 采样上报（不是所有错误都报）。

【面试追问】为什么用 sendBeacon？→ 页面卸载/跳转时也能把数据发出去，且不阻塞。

【避坑】「source map」要在服务端保留以便还原堆栈，但不能暴露给用户；错误要聚合去重（同一错误别刷屏）。`,
      source: '大厂八股 / 前端监控'
    },
    {
      id: 'fe-060', category: 'frontend', tags: ['鉴权', '安全'], difficulty: 2,
      question: '前端如何做用户鉴权？JWT、SSO、OAuth 分别是什么？',
      answer: `一句话结论：前端鉴权是「证明你是谁 + 维持登录态」；JWT 是无状态令牌，SSO 是单点登录（一次登录多处可用），OAuth 是第三方授权。

【JWT（JSON Web Token）】
· 三段式：Header.Payload.Signature（签名防篡改）；
· 无状态：服务器不存 session，靠签名验证；
· 前端存 token，请求时放 Authorization: Bearer <token>。

【SSO（单点登录）】
· 一次登录，多个系统共享登录态；
· 核心：统一认证中心 + 票据（ticket）交换。

【OAuth 2.0】
· 第三方授权（如「用微信登录」），用户授权后第三方拿到 token；
· 流程：授权码模式（code → token）。

【面试追问】token 存哪、怎么防过期？→ 短 token + refresh token 刷新；存内存/（必要时）localStorage，注意 XSS 风险。

【避坑】JWT 不能存敏感信息（Payload 只是 base64 编码，可解码）；前端只能做「体验层」鉴权，真正的权限校验必须在后端。`,
      source: '大厂八股 / 鉴权'
    }
  ];

  global.App = global.App || {};
  global.App.fe2Bank = FE2;
})(window);
