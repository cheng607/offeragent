/**
 * OfferAgent · 扩充题库（前端 · 第四批：手写高频真题 / 浏览器底层 / 工程进阶）
 * 挂载到 global.App.fe4Bank，由 bank.js 加载时合并。
 */
(function (global) {
  'use strict';

  var FE4 = [
    {
      id: 'fe-106', category: 'frontend', tags: ['Promise', '并发控制', '手写'], difficulty: 3,
      question: '如何手写一个并发控制（限制并发数）的 Promise 调度器？',
      answer: `一句话结论：维护一个「并发计数 + 待执行队列」，每完成一个任务就从队列取出下一个执行，直到全部完成，即可把并发数限制在 N。

【核心思路】
1. 入参：任务数组 tasks（返回 Promise 的函数）+ 最大并发数 limit；
2. 用一个 running 记录当前并发数，用 results 保存结果，用索引 i 依次取任务；
3. 启动 min(limit, tasks.length) 个「worker」并发执行；
4. 每个 worker 循环：取下一个任务 → 执行 → 计数加一 → 结束后计数减一并继续取，直到取完；
5. 全部 worker 结束（Promise.all）返回 results。

【关键代码骨架】
function pLimit(tasks, limit) {
  return new Promise((resolve) => {
    const results = new Array(tasks.length);
    let running = 0, index = 0;
    function next() {
      if (index >= tasks.length && running === 0) return resolve(results);
      while (running < limit && index < tasks.length) {
        const cur = index++;
        running++;
        tasks[cur]().then((v) => {
          results[cur] = v;
          running--;
          next();
        }).catch((e) => { results[cur] = e; running--; next(); });
      }
    }
    next();
  });
}

【面试追问】
· 如何保证结果顺序与任务顺序一致？→ 用下标 cur 写入 results 而非 push；
· 如何支持失败即停止？→ 加一个 isRejected 标志，任一 reject 立即 resolve/reject 终止；
· 与 Promise.all 区别？→ all 是全量并发，pLimit 是受控并发，防止打爆服务器。

【避坑】「并发」指的是同时进行中的任务数，不是同时创建；循环里若 await 逐条会退化成串行，反而拖慢速度。`, 
      source: '大厂手写题 / p-limit 原理'
    },
    {
      id: 'fe-107', category: 'frontend', tags: ['算法', '大数相加', '手写'], difficulty: 2,
      question: '如何手写大数相加（两个超大数字字符串相加，不能转 Number）？',
      answer: `一句话结论：从个位开始逐位相加并处理进位，用字符串保存结果，即可避免 Number 精度溢出。

【思路】
1. 两数末尾对齐，从最低位往高位遍历；
2. 每一位 a + b + carry，本位的值是 sum % 10，进位 carry = Math.floor(sum / 10)；
3. 遍历结束后若还有进位，追加到结果前；
4. 最后反转拼接的数组得到结果。

【代码骨架】
function addStrings(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0, res = '';
  while (i >= 0 || j >= 0 || carry) {
    const x = i >= 0 ? +a[i--] : 0;
    const y = j >= 0 ? +b[j--] : 0;
    const sum = x + y + carry;
    res = (sum % 10) + res;
    carry = Math.floor(sum / 10);
  }
  return res;
}

【追问扩展】
· 如何支持小数/负数？→ 拆分整数与小数部分分别相加，符号单独处理；
· 为什么不用 BigInt？→ BigInt 简洁但老环境兼容性差，面试常要求手写；
· 大数相乘？→ 逐位相乘累加，复杂度 O(n*m)，进阶用分治（Karatsuba）。

【避坑】逐位相加时别把字符串当数字整体转换（会精度丢失），要「字符 - '0'」逐位处理。`,
      source: 'LeetCode 415 / 大厂手写题'
    },
    {
      id: 'fe-108', category: 'frontend', tags: ['函数', '记忆化', '手写'], difficulty: 2,
      question: '如何手写函数记忆化（memoize）？有哪些注意点？',
      answer: `一句话结论：用闭包缓存「参数 → 结果」的映射，命中缓存直接返回，避免重复计算。

【基本实现】
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const val = fn.apply(this, args);
    cache.set(key, val);
    return val;
  };
}

【注意点 / 进阶】
1. key 序列化：参数是对象时 JSON.stringify 依赖属性顺序，可改用 Map 嵌套或自定义 key；
2. 缓存失效/上限：纯函数 + 无限缓存会内存膨胀，需加 LRU 淘汰或最大条数；
3. 只适用纯函数：fn 有副作用或依赖外部状态时缓存会返回过期结果；
4. this 上下文：apply(this, args) 保留调用方 this；
5. 递归场景：记忆化斐波那契要缓存的是「递归函数本身」，需先包装再递归调用包装后的函数。

【追问】memoize 与 useMemo 的区别？→ 前者是通用运行时缓存，后者是 React 在依赖变化时才重算并参与渲染。

【避坑】参数顺序不同会命中不同 key，导致缓存失效；Object 参数的 key 建议先排序或转规范形式。`,
      source: '大厂手写题 / lodash.memoize'
    },
    {
      id: 'fe-109', category: 'frontend', tags: ['函数式', 'compose', '手写'], difficulty: 2,
      question: '如何手写 compose 和 pipe？它们有什么作用？',
      answer: `一句话结论：compose 和 pipe 都是「函数组合」，把多个单参函数串成一条流水线；compose 从右往左执行，pipe 从左往右执行。

【实现】
function compose(...fns) {
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}
// 或 reduceRight 实现从左往右
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

【作用】
1. 把复杂逻辑拆成多个可复用的小函数，再组合；
2. 避免嵌套地狱：compose(f, g, h)(x) 等价于 f(g(h(x)))；
3. 在 Redux 的中间件、lodash/fp 中大量使用。

【手写要点】
· 空参数处理：没有函数时返回原样透传（恒等函数）；
· 只支持单参传递（第一个函数可多参，后续都是单参）；
· 执行顺序要牢记：compose 是右到左，别写反。

【追问】Redux 中间件的 compose 与普通 compose 有何不同？→ 中间件签名是 (store) => (next) => (action) => ...，组合的是柯里化函数。

【避坑】reduce 实现 compose 时累加顺序易错；面试常让解释为什么 compose(f,g,h) 先执行 h。`,
      source: '大厂手写题 / Redux compose'
    },
    {
      id: 'fe-110', category: 'frontend', tags: ['网络', 'axios', 'fetch'], difficulty: 2,
      question: 'axios 和 fetch 有什么区别？拦截器原理是什么？如何取消请求？',
      answer: `一句话结论：axios 是基于 XHR 的封装库，提供拦截器、超时、取消、自动 JSON 等能力；fetch 是浏览器原生 API，基于 Promise，但默认不拦截、不超时、404/500 不 reject。

【主要区别】
1. 底层：axios 用 XMLHttpRequest，fetch 用原生 fetch；
2. 超时：axios 有 timeout，fetch 需 AbortController 手动实现；
3. 错误：fetch 只有网络错误才 reject，HTTP 4xx/5xx 仍 resolve，需手动判断 res.ok；
4. 拦截器：axios 支持请求/响应拦截器，fetch 需自己封装；
5. 取消：axios 用 CancelToken/AbortSignal，fetch 用 AbortController；
6. 兼容：fetch 不支持老 IE。

【拦截器原理】
本质是维护一个「请求链」数组，用 Promise 链把 use 注册的函数串起来，按顺序执行，再发送真实请求：
chain = [请求拦截..., 发请求, 响应拦截...]，用 Promise 依次 then。

【取消请求】
· fetch：const c = new AbortController(); fetch(url, { signal: c.signal }); c.abort();
· axios：传 signal 或 CancelToken，取消后抛 CanceledError。

【避坑】fetch 拿数据要 res.json() 且 404 也进 then，实际项目都要二次封装判断 res.ok。`,
      source: 'axios 源码 / MDN'
    },
    {
      id: 'fe-111', category: 'frontend', tags: ['网络', 'SSE', 'WebSocket'], difficulty: 2,
      question: 'SSE（Server-Sent Events）和 WebSocket 有什么区别？分别适用什么场景？',
      answer: `一句话结论：SSE 是「服务器 → 客户端」单向推送，基于 HTTP 长连接；WebSocket 是「双向」全双工，独立协议。

【SSE 特点】
1. 基于 HTTP，Content-Type: text/event-stream，自动重连（可设 Last-Event-ID 续传）；
2. 只支持服务器推送给客户端，客户端靠普通 HTTP 请求发数据；
3. 文本格式，用 EventSource 接口，简单轻量。

【WebSocket 特点】
1. 独立协议 ws://，先 HTTP 握手升级（101 Switching Protocols）；
2. 双向实时通信，二进制/文本都支持；
3. 需自己处理心跳、重连、断线重传。

【选型】
· 只需服务端推送（股票行情、通知、AI 流式输出）→ SSE 更简单；
· 需要双向高频交互（聊天、多人协作、游戏）→ WebSocket。

【追问】SSE 如何实现流式输出（如 AI 打字机效果）？→ 服务端分片 write，前端 onmessage 累加渲染；断线用 event id 续传。

【避坑】SSE 每次连接占一个 HTTP 连接，受浏览器同域并发限制；WebSocket 需注意心跳与重连兜底。`,
      source: 'MDN / 大厂八股'
    },
    {
      id: 'fe-112', category: 'frontend', tags: ['浏览器', '渲染', '性能'], difficulty: 3,
      question: '浏览器从拿到 HTML 到渲染出像素，经历了哪些阶段？（关键渲染路径 CRP）',
      answer: `一句话结论：浏览器依次经历「解析 HTML 建 DOM → 解析 CSS 建 CSSOM → 合并成渲染树 → 布局计算 → 分层绘制 → 合成上屏」。

【完整阶段】
1. 解析 HTML：构建 DOM 树；遇到 JS 会阻塞解析（无 async/defer）；
2. 解析 CSS：构建 CSSOM 树，CSS 阻塞渲染（但不阻塞 DOM 解析）；
3. 构建渲染树：DOM + CSSOM 合并，剔除 display:none 等不可见节点；
4. 布局 Layout：计算每个节点的几何位置和尺寸（回流）；
5. 分层 Layer：根据 will-change、transform 等把元素提升为合成层；
6. 绘制 Paint：生成绘制指令；
7. 合成 Composite：GPU 把各层合成上屏。

【关键渲染路径 CRP 优化】
· 减少关键资源数（合并/内联首屏 CSS）；
· 减少关键字节（压缩、gzip）；
· 缩短关键路径长度（减少阻塞渲染的 JS/CSS 链）。

【追问】JS 阻塞解析与 async/defer 的区别？→ 普通 script 阻塞解析等待执行；async 下载完立即执行；defer 等 DOM 解析完再按序执行。

【避坑】CSS 不阻塞 DOM 解析但阻塞渲染，因为要等 CSSOM 才能建渲染树；JS 可能读写样式，所以浏览器在 JS 执行前会等前面的 CSS 加载完。`,
      source: '浏览器渲染原理 / 大厂八股'
    },
    {
      id: 'fe-113', category: 'frontend', tags: ['浏览器', 'Observer', 'API'], difficulty: 2,
      question: 'IntersectionObserver 和 MutationObserver 分别是什么？原理和用途？',
      answer: `一句话结论：IntersectionObserver 异步监听元素是否进入视口（可见性），MutationObserver 异步监听 DOM 节点的增删改（变化）。

【IntersectionObserver】
· 用途：懒加载图片、无限滚动、曝光埋点、吸顶检测；
· 用法：new IntersectionObserver(cb).observe(el)，回调带 isIntersecting 和 intersectionRatio；
· 原理：浏览器在帧渲染时统一计算相交，异步回调，比监听 scroll + getBoundingClientRect 性能好得多（不强制同步回流）。

【MutationObserver】
· 用途：监听 DOM 变化（子节点增删、属性、文本），用于水印防篡改、监听第三方注入、实现微前端子应用卸载清理；
· 用法：new MutationObserver(cb).observe(el, { childList: true, subtree: true, attributes: true })；
· 原理：基于微任务批量异步触发，一批变化合并成一次回调。

【追问】为什么 IntersectionObserver 比 scroll 监听性能好？→ scroll 高频触发且强制同步布局，IO 由浏览器原生在合成线程判断，避免主线程抖动。

【避坑】IO 回调是异步的，进入视口后要及时 unobserve 避免重复触发；MutationObserver 要避免在回调里又改 DOM 造成死循环。`,
      source: 'MDN / 大厂八股'
    },
    {
      id: 'fe-114', category: 'frontend', tags: ['网络', 'AbortController', '取消'], difficulty: 2,
      question: 'AbortController 是什么？如何用它取消请求和异步任务？',
      answer: `一句话结论：AbortController 提供 signal 信号，配合 abort() 方法可取消 fetch 及其他支持 signal 的异步操作。

【基本用法】
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort(); // 触发 AbortError

【核心机制】
1. signal 是一个 AbortSignal 对象，可监听 abort 事件；
2. 一个 signal 可传给多个操作，实现「一键全取消」；
3. 支持 AbortSignal.timeout(ms) 静态方法设置超时。

【取消自定异步任务】
signal.addEventListener('abort', () => { /* 清理 */ });
// 或用 Promise 包装
function myTask(signal) {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
    ...
  });
}

【典型场景】
· 用户快速切换搜索、路由离开时取消未完成的请求；
· 上传大文件时点击取消；
· 为 fetch 增加超时（AbortSignal.timeout）。

【避坑】取消 fetch 会 reject 一个 name 为 AbortError 的错误，需与真实错误区分，避免误报监控。`,
      source: 'MDN / 大厂八股'
    },
    {
      id: 'fe-115', category: 'frontend', tags: ['工程化', 'sourcemap', '监控'], difficulty: 3,
      question: 'sourcemap 的原理是什么？如何用它定位线上错误？',
      answer: `一句话结论：sourcemap 是一份「压缩后代码 → 原始源码」的映射文件，浏览器或监控平台据此把报错位置还原到源码行。

【原理】
1. 构建时给压缩产物生成 .map 文件（webpack 的 devtool）；
2. .map 包含：sources（原始文件）、sourcesContent（源码内容）、mappings（VLQ 编码的位置映射）；
3. mappings 用 Base64 VLQ 记录「生成代码行列 ↔ 源码行列」的对应关系，体积小。

【类型】
· source-map：完整但慢，用于生产分析；
· eval：最快，用 eval 内联，仅开发；
· cheap-module-source-map：生产常用，定位到行不到列。

【线上定位】
1. 线上 JS 报错只有压缩后的行列，无法直接读；
2. 监控平台（Sentry 等）收集 stack + 对应版本的 .map，用 source-map 库还原；
3. 关键：.map 不要公开部署到生产（防泄密），应私存或上传监控平台。

【追问】为什么 sourcemap 会泄露源码？→ 它含 sourcesContent 完整源码，所以生产不能随包下发 .map。

【避坑】多个版本要按 release 管理 .map 一一对应，否则还原错位；hidden-source-map 既能在 sourcemap 里还原又不暴露给普通用户。`,
      source: 'webpack devtool / Sentry'
    },
    {
      id: 'fe-116', category: 'frontend', tags: ['安全', '点击劫持', '防御'], difficulty: 2,
      question: '什么是点击劫持（Clickjacking）？如何防御？',
      answer: `一句话结论：点击劫持是攻击者用透明 iframe 覆盖目标网站，诱导用户「看似点自己的按钮，实际点了别人的按钮」。

【攻击方式】
1. 攻击者在自己的页面上嵌入目标网站（iframe）；
2. 把 iframe 设为透明，覆盖在诱导按钮上；
3. 用户以为在点攻击者的按钮，实际触发了目标网站的高危操作（如授权、转账、关注）。

【防御手段】
1. X-Frame-Options 响应头：DENY（禁止被嵌入）/ SAMEORIGIN（仅同源可嵌）；
2. CSP 的 frame-ancestors 指令：Content-Security-Policy: frame-ancestors 'self'，更灵活，可指定允许的域；
3. 前端 JS 兜底：top !== self 时跳转（可作为补充，但可被绕过，不能只靠它）。

【追问】为什么 JS 兜底不可靠？→ 攻击者可用 sandbox、或禁用脚本绕过，所以主防御必须在响应头/服务端。

【避坑】现代浏览器已普遍支持 CSP frame-ancestors，应优先用它替代旧的 X-Frame-Options，并两者都配以兼容老环境。`,
      source: 'OWASP / 大厂安全八股'
    },
    {
      id: 'fe-117', category: 'frontend', tags: ['缓存', '请求', 'SWR'], difficulty: 3,
      question: '如何设计一个前端的请求缓存层（SWR 思想）？如何做请求去重？',
      answer: `一句话结论：以「key 为维度」缓存请求结果与 Promise，相同 key 的并发请求共享同一个 Promise，并提供失效重校验（stale-while-revalidate）。

【核心机制】
1. 请求去重：缓存当前进行中的 Promise，同 key 请求直接返回同一 Promise，避免重复请求；
2. 结果缓存：成功后把数据按 key 存起来，下次先返回缓存（stale），再后台重新请求更新（revalidate）；
3. 失效控制：支持手动 invalidate(key)、设置 ttl、或依赖变化时重新校验。

【实现骨架】
const cache = new Map();
function swr(key, fetcher) {
  if (cache.has(key)) {
    const { data, promise } = cache.get(key);
    // 后台重校验
    revalidate(key, fetcher);
    return promise || Promise.resolve(data);
  }
  const promise = fetcher(key).then((data) => {
    cache.set(key, { data, promise: null });
    return data;
  });
  cache.set(key, { data: null, promise });
  return promise;
}

【追问】与浏览器缓存有何区别？→ 浏览器缓存是 HTTP 层，SWR 是应用层，粒度更细、可编程失效。

【避坑】注意并发安全（同 key 共享 promise）、避免缓存无限增长（加容量限制）、注意用户数据隔离（key 要带 userId）。`,
      source: 'swr / react-query 原理'
    },
    {
      id: 'fe-118', category: 'frontend', tags: ['React', 'Hooks', '闭包'], difficulty: 3,
      question: '为什么 useState 拿不到「最新值」？什么是闭包陷阱？如何解决？',
      answer: `一句话结论：因为 setState 后组件还没重新渲染，函数组件里的 state 是本次渲染快照（闭包捕获的旧值），要拿最新值需用函数式更新或 ref。

【现象】
function Demo() {
  const [count, setCount] = useState(0);
  function onClick() {
    setCount(count + 1); // 连点多次也 +1
    setCount(count + 1);
  }
}

【原因】
1. 每次渲染 count 都是独立常量，onClick 捕获的是当次渲染的 count=0；
2. 两次 setCount(count+1) 都基于 0，最终只变 1；
3. 这就是「闭包陷阱」——回调闭住了旧快照。

【解决】
1. 函数式更新：setCount((c) => c + 1)，React 会基于最新状态计算；
2. 用 ref 保存最新值：ref.current 同步可变；
3. 依赖数组正确声明，或用 useEffect 在依赖变化后读取。

【追问】useEffect 里的 state 为什么也可能是旧的？→ 同样因为闭包，依赖数组没写全时，回调拿到的是旧快照。

【避坑】setTimeout/setInterval 里的回调尤其容易闭包旧值，要么用函数式更新，要么用 ref 读取最新值。`,
      source: 'React 官方文档 / 大厂八股'
    },
    {
      id: 'fe-119', category: 'frontend', tags: ['微前端', '沙箱', '隔离'], difficulty: 3,
      question: '微前端中如何实现 JS 沙箱和样式隔离？',
      answer: `一句话结论：JS 沙箱用代理或 iframe 隔离全局变量，样式隔离用 CSS 作用域（前缀/Scoped/CSS Module/Shadow DOM）避免冲突。

【JS 沙箱方案】
1. 快照沙箱：进入时记录全局状态快照，退出时还原（如 qiankun 旧版），适合单实例；
2. Proxy 代理沙箱：把子应用的 window 操作代理到一个 fakeWindow 上，读写都走代理，互不污染；
3. iframe 沙箱：天然隔离，但通信成本高、性能差；
4. 通过 window.__POWERED_BY__ 等约定避免污染。

【样式隔离方案】
1. CSS 前缀/命名空间：BEM、给类名加应用前缀；
2. CSS Module：构建期把类名 hash 化，局部作用域；
3. Scoped（Vue）：编译期加属性选择器 [data-v-xxx]；
4. Shadow DOM：原生隔离，内外样式互不影响；
5. 动态加载/卸载：子应用样式随生命周期挂载与移除。

【追问】qiankun 的沙箱是怎么实现的？→ 用 Proxy 代理 window，子应用对全局变量的读写都拦截到独立空间，切换时激活/失活。

【避坑】样式隔离最难处理的是全局样式（如 antd、reset.css）和第三方库注入的 style，需要约定或运行时打补丁。`,
      source: 'qiankun / 微前端实践'
    },
    {
      id: 'fe-120', category: 'frontend', tags: ['性能', '虚拟滚动', '动态高度'], difficulty: 3,
      question: '如何实现支持「动态高度」的虚拟滚动列表？',
      answer: `一句话结论：虚拟滚动只渲染可视区内的元素；动态高度通过「预估高度 + 实测后修正偏移」来维护每项的 top 位置。

【核心难点】
定高虚拟滚动好做：startIndex = scrollTop / itemHeight。但动态高度时每项高度未知，无法直接定位。

【方案：预估 + 修正】
1. 维护 positions 数组，记录每项 { top, bottom, height }，初始用预估高度；
2. 首次渲染用预估高度计算总高和可视区，渲染可见项；
3. 项渲染后实测真实高度（ResizeObserver / 读取 offsetHeight），更新该项及之后所有项的 top 偏移；
4. 用 translateY 或 padding 占位，滚动时二分查找 scrollTop 对应的 startIndex；
5. 缓冲：可视区上下多渲染若干项，减少白屏。

【关键点】
· 用绝对定位 + transform: translateY(offset) 移动可视容器；
· 外层容器高度 = 所有项高度之和（随修正动态更新）；
· 二分查找定位起始索引，复杂度 O(log n)。

【追问】为什么动态高度比定高复杂？→ 因为总高度和偏移随内容变化，必须缓存并增量修正偏移。

【避坑】实测高度后要更新后续所有项的 top（O(n)），可增量更新避免每帧全量重算；图片加载等异步高度变化也要触发重新测量。`,
      source: '大厂手写题 / 虚拟列表原理'
    },
    {
      id: 'fe-121', category: 'frontend', tags: ['监控', '错误上报', '工程化'], difficulty: 3,
      question: '前端如何做无侵入的错误监控和上报？有哪些错误类型？',
      answer: `一句话结论：通过全局监听捕获运行时错误、资源加载错误、Promise 未处理异常、接口错误，用采样与合并去重后上报。

【错误类型与捕获】
1. JS 运行时错误：window.addEventListener('error', ...)（带 stack）；
2. 资源加载错误：window error 事件 capture 阶段（资源错误不冒泡，要 capture）；
3. Promise 未处理异常：window.addEventListener('unhandledrejection', ...)；
4. 接口错误：重写/包装 fetch 与 XHR，拦截非 2xx；
5. 框架错误：Vue 的 errorHandler、React 的 ErrorBoundary；
6. 白屏/崩溃：心跳检测、performance 指标异常。

【无侵入手段】
· 全局事件监听天然无侵入；
· 对 fetch/XHR 做「打补丁」式包装，业务代码零感知。

【上报优化】
1. 采样：按比例只上报部分，控制流量；
2. 去重合并：相同错误（消息 + 位置）聚合计数；
3. 截断脱敏：敏感字段打码，超长信息截断；
4. 批量发送：队列攒批，或页面卸载时 sendBeacon 兜底。

【追问】为什么资源加载错误要在 capture 阶段监听？→ 因为 <img>/<script> 的 error 不冒泡，只能在捕获阶段拿到。

【避坑】用 sendBeacon 在 unload 时发送，避免常规请求被浏览器取消导致上报丢失。`,
      source: '前端监控实践 / Sentry'
    },
    {
      id: 'fe-122', category: 'frontend', tags: ['网络', '封装', '重试'], difficulty: 2,
      question: '如何封装一个「可重试、可超时、可取消」的 fetch 请求？',
      answer: `一句话结论：用 AbortController 做超时与取消，用循环/递归对可重试错误做有限次重试（带退避），统一错误处理。

【实现骨架】
function request(url, { retries = 3, timeout = 5000, signal } = {}) {
  return (async function attempt(remain) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    // 外部取消信号联动
    const onAbort = () => ctrl.abort();
    signal && signal.addEventListener('abort', onAbort);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      // 网络错误或 5xx 才重试，4xx 不重试
      if (remain > 0 && shouldRetry(err)) {
        await sleep(backoff(retries - remain));
        return attempt(remain - 1);
      }
      throw err;
    } finally {
      clearTimeout(timer);
      signal && signal.removeEventListener('abort', onAbort);
    }
  })(retries);
}

【要点】
1. 超时：setTimeout + AbortController.abort；
2. 重试策略：只对网络错误/5xx 重试，4xx 直接抛（业务错误重试无意义）；
3. 退避：指数退避 + 抖动，避免雪崩；
4. 取消：与外部 signal 联动。

【追问】重试要注意什么？→ 幂等性（GET 可重试，POST 慎用）、次数上限、退避间隔。

【避坑】AbortError 要单独识别，避免和业务错误混在一起误重试。`,
      source: '大厂工程实践'
    },
    {
      id: 'fe-123', category: 'frontend', tags: ['浏览器', 'Worker', '多线程'], difficulty: 2,
      question: 'SharedWorker 和 Web Worker 有什么区别？分别适用什么场景？',
      answer: `一句话结论：Web Worker 是每个页面专属的后台线程；SharedWorker 可被多个同源页面共享，实现跨标签页通信与共享状态。

【Web Worker】
· 一个页面 new Worker(url)，该 worker 专属此页面；
· 通过 postMessage/onmessage 通信，不能操作 DOM；
· 用途：把计算密集任务（大量计算、解析、编码）移到后台，避免阻塞主线程。

【SharedWorker】
· 多个同源标签页/iframe 共享同一个 worker 实例；
· 通过 port.start() + port.postMessage 通信；
· 用途：跨标签页共享连接（如一个 WebSocket 连接多处复用）、共享状态、跨页通信。

【关键区别】
1. 共享范围：Worker 页面级，SharedWorker 同源多页面级；
2. 通信：Worker 直接 postMessage，SharedWorker 要走 MessagePort；
3. 生命周期：SharedWorker 在没有页面引用时才销毁。

【追问】还有哪些跨标签页通信方式？→ BroadcastChannel、localStorage 事件、postMessage、storage 事件。

【避坑】SharedWorker 兼容性一般，且端口（port）必须显式 start；WebSocket 长连接复用常用 SharedWorker 减少连接数。`,
      source: 'MDN / 大厂八股'
    },
    {
      id: 'fe-124', category: 'frontend', tags: ['工程化', '缓存', '构建'], difficulty: 2,
      question: '前端构建产物如何做长期缓存？contenthash 的作用是什么？',
      answer: `一句话结论：给产物文件名加内容哈希（contenthash），内容不变则文件名不变可长期缓存，内容变化则文件名变化强制重新加载。

【缓存策略】
1. HTML 不缓存或短缓存（no-cache / 短 max-age），保证入口最新；
2. JS/CSS 加 contenthash，配合强缓存 max-age=31536000（一年）；
3. 图片等静态资源同样加 hash 长缓存。

【三种 hash 区别】
· hash：整个项目统一，任何文件变都变，缓存粒度最粗；
· chunkhash：按 chunk 维度，一个入口变只影响该 chunk；
· contenthash：按内容，文件内容不变 hash 不变，最细（CSS 抽离后用 contenthash）。

【工作流程】
1. 构建时按内容生成 hash 文件名（如 app.1a2b3c.js）；
2. 部署后 index.html 引用新文件名，浏览器加载新资源；
3. 旧文件保留一段时间，供未刷新用户继续用。

【追问】为什么 HTML 要短缓存？→ 若 HTML 也长缓存，用户拿到旧 HTML 就无法感知新资源，永远加载旧版本。

【避坑】contenthash 依赖内容稳定，提取 CSS、module id 稳定化（HashedModuleIdsPlugin）才能保证 hash 精确，否则无意义地全量变化。`,
      source: 'webpack 缓存策略 / 大厂八股'
    },
    {
      id: 'fe-125', category: 'frontend', tags: ['网络', 'fetch', '流式'], difficulty: 3,
      question: 'fetch 的 Response 对象有哪些常用能力？如何用 ReadableStream 做流式处理？',
      answer: `一句话结论：Response 提供 ok/status/headers 等状态信息和 json()/text()/blob() 等读取方法，body 是 ReadableStream，可流式逐块读取（如 AI 打字机效果）。

【常用属性/方法】
· response.ok / status / statusText：判断请求是否成功；
· response.headers：读取响应头（get 方法）；
· response.json() / text() / blob() / arrayBuffer()：读取完整 body；
· response.body：ReadableStream 流对象；
· response.clone()：克隆（body 只能读一次）。

【流式读取（SSE 之外的通用方案）】
const res = await fetch(url);
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 逐块处理，实现打字机/进度显示
  console.log(decoder.decode(value, { stream: true }));
}

【典型场景】
· AI 流式输出（对话逐字返回）；
· 大文件下载显示进度（Content-Length 计算百分比）。

【追问】Response body 为什么只能读一次？→ 它是流，读完即消耗；需要多次读要用 clone()。

【避坑】流式读取需注意分块边界（UTF-8 多字节字符可能被切开），用 TextDecoder 的 stream:true 处理。`,
      source: 'MDN / AI 流式实践'
    }
  ];

  global.App = global.App || {};
  global.App.fe4Bank = FE4;
})(window);
