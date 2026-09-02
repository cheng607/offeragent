/**
 * OfferAgent · 结构化面试题库
 * 数据内嵌于 JS（避免 file:// 下 fetch 的 CORS 限制）。
 * 每题字段：id / category(分类id) / tags / difficulty(1简单2中等3困难) / question / answer / source(具体出处)
 * 答案均对标牛客面经、LeetCode 热题、剑指 Offer、大厂八股文等公认题源，采用「结论先行 + 分点 + 追问/避坑」的面试结构化回答范式。
 * 挂载到全局命名空间 App.bank
 */
(function (global) {
  'use strict';

  var QUESTIONS = [
    // ==================== 前端 ====================
    {
      id: 'fe-001', category: 'frontend', tags: ['JavaScript', '作用域'], difficulty: 2,
      question: '什么是闭包（Closure）？它有哪些典型应用场景和注意事项？',
      answer: '一句话结论：闭包是「函数 + 其定义时所在词法作用域的引用」的组合，它让函数能记住并访问定义处的外层变量，即使在外层函数执行完毕后仍可访问。\n\n【本质】不是简单的"函数套函数"，而是每个函数创建时都会保存对当前作用域链的引用；当函数在别处执行、调用栈已销毁时，这条作用域链仍保留对外层变量的引用——这是闭包能"记住"变量的根本原因。\n\n【典型应用】\n1. 数据私有化 / 模块封装（计数器、单例、IIFE 模块）；\n2. 柯里化与偏函数；\n3. 防抖、节流的实现；\n4. 循环中保存每次迭代的变量（用 let 或 IIFE）。\n\n【面试官高频追问】\n· 闭包会造成内存泄漏吗？→ 会。作用域链引用不被回收，变量常驻内存。解决：用完把引用置 null。\n· for 循环里 var 与 let 为什么输出不同？→ var 无块级作用域，闭包捕获的是同一个变量（最终值）；let 每次迭代创建新绑定，各自独立。\n\n【避坑】全局变量过多、定时器/监听器未清理、DOM 引用未置空，同样会造成内存泄漏，不只是闭包。',
      source: '牛客面经高频'
    },
    {
      id: 'fe-002', category: 'frontend', tags: ['JavaScript', '异步'], difficulty: 2,
      question: '说说事件循环（Event Loop）以及宏任务、微任务的区别。',
      answer: '一句话结论：JS 单线程靠事件循环实现异步非阻塞；核心口诀是「同步代码 → 清空微任务 → 取一个宏任务 → 再清空微任务」循环往复。\n\n【执行流程】\n1. 同步代码进入调用栈顺序执行；\n2. 遇到异步任务交给对应线程（定时器、网络、I/O），完成后回调进入任务队列；\n3. 调用栈清空后，事件循环先从微任务队列取任务执行，直到清空；\n4. 再取一个宏任务执行，之后再次清空微任务，如此循环。\n\n【宏任务 macroTask】script 整体、setTimeout、setInterval、I/O、UI 渲染、setImmediate（Node）。\n【微任务 microTask】Promise.then/catch/finally、async/await（await 后）、MutationObserver、queueMicrotask。\n\n【关键区别】微任务优先级高于宏任务；每执行完一个宏任务都会清空一次微任务队列。\n\n【经典输出题】new Promise 内的同步代码立即执行，.then 回调进微任务队列；setTimeout 进宏任务队列。\n\n【避坑】区分「同步非阻塞」模型：Node 的 process.nextTick 优先级又高于 Promise 微任务。',
      source: '牛客面经高频'
    },
    {
      id: 'fe-003', category: 'frontend', tags: ['浏览器', '网络'], difficulty: 2,
      question: '从输入 URL 到页面展示，浏览器经历了哪些过程？',
      answer: '一句话结论：DNS 解析 → 建立连接（TCP+TLS）→ 发送请求 → 服务器响应 → 解析渲染 → 连接复用/关闭。\n\n【完整流程】\n1. DNS 解析：域名 → IP（浏览器缓存 → 系统 hosts → 本地 DNS 缓存 → 递归/迭代查询根、顶级、权威服务器）；\n2. 建立连接：TCP 三次握手；HTTPS 还需 TLS 握手（证书校验 + 密钥协商）；\n3. 发送 HTTP 请求（含方法、请求头）；\n4. 服务器处理并返回响应（状态码、响应头、响应体）；\n5. 解析渲染：解析 HTML 生成 DOM 树 → 解析 CSS 生成 CSSOM 树 → 合成 Render Tree → 布局 Layout → 绘制 Paint → 合成 Composite；\n6. HTTP/1.1 长连接复用，或四次挥手关闭。\n\n【面试官高频追问】\n· JS/CSS 如何阻塞解析？→ 脚本默认阻塞 HTML 解析（可用 async/defer）；CSS 阻塞渲染但不阻塞 DOM 解析。\n· 如何优化首屏？→ CDN、资源压缩、HTTP/2 多路复用、关键 CSS 内联、懒加载、预加载。',
      source: '大厂八股文（字节/腾讯）'
    },
    {
      id: 'fe-004', category: 'frontend', tags: ['CSS', '布局'], difficulty: 1,
      question: '实现元素水平垂直居中的常用方式有哪些？',
      answer: '一句话结论：优先用 Flex/Grid，其次绝对定位 + transform，特殊场景用 table-cell 或 line-height。\n\n【主流方案】\n1. Flexbox：父容器 display:flex; justify-content:center; align-items:center；\n2. Grid：父容器 display:grid; place-items:center；\n3. 绝对定位 + transform：子元素 position:absolute; left:50%; top:50%; transform:translate(-50%,-50%)（无需知道宽高）；\n4. 绝对定位 + margin:auto：子元素四边定位为 0 + margin:auto（需固定宽高）；\n5. table-cell：父容器 display:table-cell; vertical-align:middle + text-align:center；\n6. 单行文本：line-height 等于容器高度 + text-align:center。\n\n【避坑】transform 方案在元素有动画时可能与自身 transform 冲突，需注意合并；margin 负值方案要求已知宽高，已不推荐。\n\n【面试加分】能说出"未知宽高用 transform、已知宽高可用 margin:auto、文本用 line-height"的选型依据。',
      source: '前端八股文经典'
    },
    {
      id: 'fe-005', category: 'frontend', tags: ['JavaScript', '性能'], difficulty: 2,
      question: '什么是防抖（debounce）和节流（throttle）？分别适用什么场景？',
      answer: '一句话结论：防抖是「停止触发后 n 秒才执行一次」，节流是「固定时间间隔内最多执行一次」。\n\n【防抖 debounce】事件触发后 n 秒才执行，若 n 秒内再次触发则重新计时。\n· 适用：搜索框输入联想（等停止输入再请求）、窗口 resize 结束、按钮防连点。\n· 实现：setTimeout + clearTimeout。\n\n【节流 throttle】n 秒内无论触发多少次只执行一次。\n· 适用：滚动加载、鼠标移动、拖拽、高频点击。\n· 实现：时间戳（立即执行）或定时器（延迟执行）。\n\n【核心区别】防抖强调"最后一次生效"（延迟执行），节流强调"规律限频"（固定节奏）。\n\n【面试官追问】能手写吗？→ 防抖：每次触发 clearTimeout 后重设 setTimeout；节流：记录上次执行时间，间隔不足则忽略。\n\n【进阶】可结合两者：如滚动到底部既要节流又要"停止后触发一次"。',
      source: '牛客面经高频'
    },
    {
      id: 'fe-006', category: 'frontend', tags: ['HTTP', '性能'], difficulty: 2,
      question: 'HTTP 缓存有哪些？强缓存与协商缓存的区别是什么？',
      answer: '一句话结论：强缓存命中不发请求直接用本地；协商缓存发请求由服务器判断，304 表示可继续用缓存。\n\n【强缓存】\n· Cache-Control（HTTP/1.1，优先级高）：max-age、no-cache、no-store、public/private、immutable；\n· Expires（HTTP/1.0，绝对时间，受本地时钟影响，已少用）。\n\n【协商缓存】\n· Last-Modified / If-Modified-Since：基于修改时间，秒级精度，可能因时间精度不足误判；\n· ETag / If-None-Match：基于内容摘要，更精确，优先级更高。\n\n【完整流程】先查强缓存 → 命中直接用；未命中发请求 → 服务器据协商缓存判断 → 返回 304（用缓存）或 200（新内容）。\n\n【刷新行为】普通 F5 跳过强缓存走协商缓存；Ctrl+F5 强制刷新，跳过所有缓存。\n\n【避坑】Cache-Control: no-cache 并非"不缓存"，而是"缓存但每次需协商验证"；no-store 才是完全不缓存。',
      source: '大厂八股文'
    },

    {
      id: 'fe-007', category: 'frontend', tags: ['JavaScript', '原型'], difficulty: 3,
      question: '什么是原型链？JavaScript 如何实现继承？',
      answer: '一句话结论：原型链是「实例 → 构造函数的 prototype → 上级 prototype → … → Object.prototype → null」的逐级查找链，用于属性/方法的复用。\n\n【关键三角关系】\n· 构造函数有 prototype（原型对象）；\n· 原型对象有 constructor 指回构造函数；\n· 实例的 __proto__（标准方法 Object.getPrototypeOf）指向构造函数的 prototype。\n\n【继承演进】\n1. 原型链继承：Child.prototype = new Parent()（共享引用类型会互相污染）；\n2. 构造函数继承：Parent.call(this)（继承属性但不继承原型方法）；\n3. 组合继承：1+2（常用，但调用两次父类构造）；\n4. 寄生组合继承（最优）：Child.prototype = Object.create(Parent.prototype) 并修正 constructor，只调用一次父类构造；\n5. ES6 class extends：本质是寄生组合继承的语法糖，内部走 super + 原型链。\n\n【面试官追问】\n· instanceof 原理？→ 沿原型链查找构造函数的 prototype。\n· hasOwnProperty 作用？→ 判断是自身属性还是继承属性。\n· class 与 function 继承区别？→ class 严格模式、不可枚举方法、必须 new、无变量提升。',
      source: '牛客面经高频'
    },
    {
      id: 'fe-008', category: 'frontend', tags: ['JavaScript', '基础'], difficulty: 2,
      question: '浅拷贝和深拷贝有什么区别？如何实现深拷贝？',
      answer: '一句话结论：浅拷贝只复制第一层（嵌套对象仍共享引用），深拷贝递归复制所有层级产生完全独立的对象。\n\n【浅拷贝】Object.assign({}, obj)、展开运算符 {...obj}、数组 slice()/concat()。\n\n【深拷贝实现】\n1. JSON.parse(JSON.stringify(obj))：简单，但丢失函数/undefined/Symbol、Date 变字符串、RegExp 失效、循环引用报错、丢失原型；\n2. 手写递归 + WeakMap 记录已拷贝对象，解决循环引用；\n3. structuredClone()：现代浏览器原生 API，支持更多类型（仍不支持函数）；\n4. lodash.cloneDeep：生产环境首选。\n\n【手写要点（面试常考）】\nfunction deepClone(obj, map = new WeakMap()) {\n  if (obj === null || typeof obj !== \'object\') return obj;\n  if (map.has(obj)) return map.get(obj); // 处理循环引用\n  const res = Array.isArray(obj) ? [] : {};\n  map.set(obj, res);\n  for (const k in obj) res[k] = deepClone(obj[k], map);\n  return res;\n}\n\n【避坑】用 JSON 方案前先判断数据是否含函数/日期/循环引用，否则生产会踩坑。',
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-009', category: 'frontend', tags: ['性能', '优化'], difficulty: 2,
      question: '前端性能优化有哪些常用手段？',
      answer: '一句话结论：从「加载阶段」减少资源体积与请求数，从「渲染阶段」提升首屏与交互流畅度，并用指标量化。\n\n【加载阶段】\n1. 代码压缩、Tree Shaking 移除无用代码；\n2. 图片优化（WebP/AVIF、懒加载 loading=lazy、响应式 srcset、CDN）；\n3. gzip/brotli 压缩、HTTP/2 多路复用；\n4. 路由懒加载（动态 import）、合理拆 chunk；\n5. 强缓存 + 协商缓存。\n\n【渲染阶段】\n1. 关键 CSS 内联、非关键 CSS 延迟；\n2. 脚本 async/defer 避免阻塞；\n3. 减少回流重绘（批量操作 DOM、动画用 transform/opacity 走合成层）；\n4. 长列表虚拟滚动；\n5. 防抖节流；\n6. 预加载/预取（preload、prefetch、dns-prefetch）。\n\n【指标】Core Web Vitals：LCP（最大内容绘制）、INP（交互延迟，替代 FID）、CLS（累积布局偏移）。\n\n【框架层】React 用 memo/useMemo/useCallback，Vue 用 computed 缓存，避免不必要的组件渲染。\n\n【面试加分】能说清"先测量再优化"，避免盲目优化。',
      source: '大厂面经（字节/美团）'
    },
    {
      id: 'fe-010', category: 'frontend', tags: ['CSS', '布局'], difficulty: 2,
      question: '什么是 BFC（块级格式化上下文）？它有什么作用、如何触发？',
      answer: '一句话结论：BFC 是一块独立的渲染区域，内部布局不影响外部，可解决浮动塌陷、外边距折叠、浮动覆盖三大问题。\n\n【触发方式】\n1. 根元素 html；\n2. float 不为 none；\n3. position 为 absolute/fixed；\n4. overflow 不为 visible（hidden/auto/scroll）；\n5. display 为 inline-block、flow-root、flex、grid 等。\n\n【三大作用】\n1. 清除浮动：父元素形成 BFC 后能包裹浮动子元素（替代 clearfix）；\n2. 阻止外边距折叠：两个相邻块或父子间的垂直 margin 重叠，用 BFC 隔开；\n3. 防止被浮动覆盖：BFC 区域不与 float 重叠，可用于两栏布局（左定宽右自适应）。\n\n【最佳实践】现代常用 display: flow-root（语义清晰、无副作用）或 overflow: hidden 触发 BFC。\n\n【避坑】外边距折叠只发生在普通流的垂直方向；BFC 内外的 margin 不会互相折叠。',
      source: '前端八股文经典'
    },

    {
      id: 'fe-011', category: 'frontend', tags: ['JavaScript', '手写', 'Promise'], difficulty: 3,
      question: '如何手写实现一个符合 Promise/A+ 规范的 Promise？',
      answer: '一句话结论：核心是「状态机 + 发布订阅 + 链式调用」，用回调队列保存 then 回调，resolve 后统一执行。\n\n【核心结构】\nclass MyPromise {\n  constructor(executor) {\n    this.state = \'pending\';\n    this.value = undefined;\n    this.onFulfilled = [];\n    this.onRejected = [];\n    const resolve = (v) => { if (this.state === \'pending\') { this.state = \'fulfilled\'; this.value = v; this.onFulfilled.forEach(fn => fn()); } };\n    const reject = (r) => { if (this.state === \'pending\') { this.state = \'rejected\'; this.value = r; this.onRejected.forEach(fn => fn()); } };\n    try { executor(resolve, reject); } catch (e) { reject(e); }\n  }\n  then(onF, onR) {\n    return new MyPromise((resolve, reject) => {\n      const handleF = () => { try { const r = onF ? onF(this.value) : this.value; r instanceof MyPromise ? r.then(resolve, reject) : resolve(r); } catch (e) { reject(e); } };\n      const handleR = () => { try { const r = onR ? onR(this.value) : this.value; r instanceof MyPromise ? r.then(resolve, reject) : reject(r); } catch (e) { reject(e); } };\n      if (this.state === \'fulfilled\') handleF();\n      else if (this.state === \'rejected\') handleR();\n      else { this.onFulfilled.push(handleF); this.onRejected.push(handleR); }\n    });\n  }\n}\n\n【关键考点】\n1. 状态只能从 pending 变一次（fulfilled 或 rejected），不可逆；\n2. then 返回新 Promise 实现链式；\n3. 异步时用回调队列暂存；\n4. executor 内同步异常要 catch 并 reject。\n\n【加分】补上 catch、finally、静态 resolve/reject/all/race/allSettled 会更完整。',
      source: '牛客面经高频（手写题）'
    },
    {
      id: 'fe-012', category: 'frontend', tags: ['浏览器', '内存', 'V8'], difficulty: 3,
      question: '浏览器的垃圾回收机制是怎样的？如何避免内存泄漏？',
      answer: '一句话结论：V8 采用「分代回收」，新生代用 Scavenge（复制），老生代用标记-清除 + 标记-整理，核心是可达性分析。\n\n【分代回收】\n1. 新生代（存活短的对象）：Scavenge 算法，分 From/To 两个半区，存活对象复制到另一区并晋升；\n2. 老生代（存活久的对象）：标记-清除（Mark-Sweep）+ 标记-整理（Mark-Compact），解决内存碎片。\n\n【核心机制】\n· 可达性分析：从根对象（全局对象、活动执行上下文）出发标记可达对象，不可达则回收；\n· 全停顿/增量标记：V8 用增量标记、惰性清理降低 GC 停顿对主线程的影响。\n\n【常见内存泄漏场景】\n1. 全局变量过多；\n2. 闭包持有大对象引用未释放；\n3. 定时器 setInterval 未 clear；\n4. 事件监听未解绑；\n5. DOM 引用未清空（分离的 DOM 节点）。\n\n【排查】Chrome DevTools → Memory/Performance 面板，生成堆快照（Heap Snapshot）对比分析增长对象与引用链。',
      source: '大厂八股文'
    },
    {
      id: 'fe-013', category: 'frontend', tags: ['浏览器', '渲染', '性能'], difficulty: 2,
      question: '什么是回流（reflow）和重绘（repaint）？如何减少？',
      answer: '一句话结论：回流是重新计算布局（几何属性变化，代价大），重绘是重新绘制外观（颜色等，代价小）；回流必触发重绘，重绘不一定触发回流。\n\n【触发回流】修改宽高、margin、padding、display、position、内容变化、读取 offset/scroll/client 系列布局属性、窗口 resize。\n【触发重绘】修改 color、background、visibility、box-shadow 等不影响布局的样式。\n\n【浏览器优化】把多次回流合并为一次（批量处理）；但"读取布局属性"会强制同步回流（layout thrashing），破坏优化。\n\n【减少手段】\n1. 批量 DOM 操作：先离线修改（display:none / DocumentFragment）再一次性插入；\n2. 动画用 transform/opacity（走合成层，不回流不重绘）；\n3. 缓存布局属性值，避免频繁读取；\n4. 使用 class 统一修改样式，避免逐条改 style；\n5. 用 will-change 或 translateZ(0) 提升为合成层（但别滥用，过多层会占内存）。\n\n【面试加分】能说出"合成层（Composite）"概念：transform/opacity 只在 GPU 合成，性能最优。',
      source: '大厂八股文'
    },

    // ==================== 后端 ====================
    {
      id: 'be-001', category: 'backend', tags: ['操作系统', '并发'], difficulty: 2,
      question: '进程和线程的区别是什么？',
      answer: '一句话结论：进程是资源分配的基本单位（独立内存），线程是 CPU 调度的基本单位（共享进程内存）；进程隔离性好开销大，线程轻量但隔离差。\n\n【主要区别】\n1. 资源：进程拥有独立地址空间、文件描述符等；线程共享所属进程的堆、全局变量等；\n2. 开销：进程创建/切换需分配独立内存、切换地址空间，开销大；线程切换只保存栈和寄存器，开销小；\n3. 隔离：进程崩溃不影响其他进程；一个线程崩溃可能拖垮整个进程；\n4. 通信：进程间需 IPC（管道、消息队列、共享内存、Socket）；线程间直接读写共享内存，需处理同步。\n\n【面试官追问】\n· 协程与线程的区别？→ 协程是用户态调度，无内核切换开销，适合高并发 I/O 密集（如 Go goroutine）。\n· 线程池为何复用线程？→ 避免频繁创建销毁线程的开销，用任务队列 + 拒绝策略管理。\n\n【应用】浏览器每个标签页是进程、页面内 JS 引擎是线程；服务器用线程池/协程处理并发请求。',
      source: '大厂八股文'
    },
    {
      id: 'be-002', category: 'backend', tags: ['MySQL', '索引'], difficulty: 2,
      question: 'MySQL 索引为什么用 B+ 树？它和 B 树、哈希索引有何区别？',
      answer: '一句话结论：B+ 树磁盘 IO 友好、树高低、叶子成链支持范围查询，最契合数据库"范围查询频繁 + 磁盘存储"的特点。\n\n【为什么选 B+ 树】\n1. 树高低：千万级数据约 3 层，最多 3 次磁盘 IO；\n2. 非叶子节点只存索引键不存数据，单节点能存更多键，进一步降低树高；\n3. 叶子节点用双向链表连接，范围查询只需遍历叶子；\n4. 查询效率稳定：所有查询都走根到叶子的路径。\n\n【与 B 树区别】B 树每个节点都存数据（非叶子也存），中序遍历才有序，范围查询不如 B+ 树；且非叶子存数据导致单节点键数少、树更高。\n\n【与哈希索引区别】哈希 O(1) 等值查询快，但不支持范围查询、排序、模糊查询，且有哈希冲突；仅适合等值查询。\n\n【补充】InnoDB 主键是聚簇索引（叶子存整行），二级索引叶子存主键值，非覆盖查询需回表。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'be-003', category: 'backend', tags: ['Redis', '缓存'], difficulty: 2,
      question: 'Redis 有哪些常见数据结构？分别适用哪些场景？',
      answer: '一句话结论：String/List/Hash/Set/ZSet 五大基础类型 + Bitmap/HyperLogLog/Geo 三种扩展，各有明确适用场景。\n\n【五大数据结构】\n1. String：缓存对象、计数器（INCR）、分布式锁（SETNX）、Session；\n2. List：消息队列、最新消息列表、时间线；\n3. Hash：存对象（用户信息）、购物车；\n4. Set：去重、共同好友、标签、抽奖（SRANDMEMBER）；\n5. ZSet：排行榜、延时队列（score 存时间戳）、优先级队列。\n\n【三种扩展】\n6. Bitmap：签到、在线状态统计；\n7. HyperLogLog：海量 UV 近似去重计数（省内存，误差约 0.81%）；\n8. Geo：附近的人、地理位置。\n\n【底层实现（加分）】String 用 SDS；List 用 quicklist；Hash/Set/ZSet 小数据量用 listpack（旧版 ziplist），ZSet 大数据量用跳表 + 哈希。\n\n【面试官追问】跳表为什么适合 ZSet？→ 支持 O(log n) 范围查询 + 维护简单。',
      source: 'Redis 八股文'
    },
    {
      id: 'be-004', category: 'backend', tags: ['消息队列', '架构'], difficulty: 2,
      question: '消息队列有哪些作用？如何保证消息不丢失、不重复消费？',
      answer: '一句话结论：MQ 用于削峰、解耦、异步、最终一致；不丢失靠"生产确认 + Broker 持久化 + 消费手动 ack"，不重复靠"消费端幂等"。\n\n【不丢失（三段式）】\n1. 生产端：开启确认机制（confirm/ack），失败重试；\n2. Broker 端：持久化落盘 + 多副本（如 Kafka ack=all、副本同步）；\n3. 消费端：手动 ack，处理成功后再确认，失败不确认让消息重投。\n\n【不重复消费（幂等）】\n1. 数据库唯一索引 / 唯一键约束；\n2. Redis setnx 记录已消费消息 ID；\n3. 业务状态机判断（已处理则跳过）；\n4. 消息携带全局唯一 ID（UUID），消费前查重。\n\n【进阶追问】\n· 消息堆积怎么办？→ 扩容消费者、批量消费、临时提升消费速率、必要时降级。\n· 如何保证顺序？→ 单分区顺序、消息带序号 + 消费端排序，或业务上规避（用状态机）。\n\n【核心】可靠 + 幂等两者缺一不可：只保证不丢失而消费不幂等，重投仍会产生重复数据。',
      source: '牛客面经'
    },
    {
      id: 'be-005', category: 'backend', tags: ['分布式', '并发'], difficulty: 3,
      question: '如何实现分布式锁？各方案有什么优缺点？',
      answer: '一句话结论：高并发选 Redis（快、可容忍极小概率失效），强一致选 ZooKeeper（可靠、性能略低），简单场景可用数据库。\n\n【Redis 方案】\n· SET key value NX EX 过期时间（原子操作）；value 用唯一标识，释放用 Lua 脚本「判断标识再删除」防误删；\n· 优点：性能高、实现简单；缺点：非强一致，主从切换可能丢锁；用 Redisson 的看门狗自动续期解决"业务超时锁失效"。\n\n【ZooKeeper 方案】\n· 临时顺序节点 + Watch 机制，序号最小者获锁；\n· 优点：强一致、可靠，会话断开自动释放；缺点：性能低于 Redis，依赖 ZK 集群。\n\n【数据库方案】\n· 唯一索引插入记录，或 SELECT ... FOR UPDATE；\n· 优点：简单无额外组件；缺点：性能差、易死锁、需处理锁超时。\n\n【面试官追问】Redisson 看门狗原理？→ 锁默认 30s 过期，每 10s 检查业务未完成则续期，避免业务执行超过锁过期时间。\n\n【选型】核心资金/强一致 → ZK；一般高并发 → Redis。',
      source: '牛客面经（美团/字节）'
    },

    {
      id: 'be-006', category: 'backend', tags: ['Redis', '缓存'], difficulty: 3,
      question: '什么是缓存穿透、缓存击穿、缓存雪崩？分别如何解决？',
      answer: '一句话结论：穿透=查不存在的数据；击穿=单热点 key 失效；雪崩=大面积 key 同时失效或缓存宕机；三者本质都是"缓存未命中导致数据库压力突增"。\n\n【缓存穿透】查缓存和数据库都不存在的数据，每次都打库（常因恶意攻击构造不存在的 key）。\n· 解决：① 缓存空值（存 null，短过期）；② 布隆过滤器提前拦截；③ 接口参数校验。\n\n【缓存击穿】热点 key 过期瞬间，海量并发同时打库。\n· 解决：① 热点 key 永不过期或逻辑过期；② 互斥锁（setnx），只允许一个请求回源重建缓存，其余等待；③ 提前异步刷新。\n\n【缓存雪崩】大量 key 同时过期，或 Redis 宕机，所有请求落到数据库。\n· 解决：① 过期时间加随机值打散；② 多级缓存（本地 + Redis）；③ 缓存高可用（主从/哨兵/集群）；④ 限流降级 + 熔断保护数据库。\n\n【记忆口诀】穿透"查无此数据"（布隆过滤器/空值）、击穿"单点热点"（互斥锁/不过期）、雪崩"大面积失效"（随机过期/集群）。',
      source: '牛客面经（美团/网易/字节）'
    },
    {
      id: 'be-007', category: 'backend', tags: ['架构', '幂等'], difficulty: 2,
      question: '什么是接口幂等性？如何设计幂等接口？',
      answer: '一句话结论：幂等 = 同一操作执行一次或多次效果相同；靠"唯一标识 + 去重判断"保证。\n\n【为什么需要】网络重试、客户端重复点击、MQ 重复投递都会导致同一请求被多次执行（重复扣款、重复下单）。\n\n【设计方案】\n1. 数据库唯一索引：业务唯一键（订单号）建唯一索引，重复插入冲突拦截；\n2. 幂等表：以唯一请求 ID 为主键，先查后插，已处理则返回原结果；\n3. Redis 分布式锁/setnx：判断是否已处理（配合过期时间）；\n4. 状态机：业务状态流转校验（已支付不再扣款）；\n5. Token 机制：先取 token，提交时携带，服务端校验并删除（防重复提交）。\n\n【基础】全局唯一 requestId 贯穿链路，是幂等判断的基石。\n\n【补充】GET/HEAD/PUT/DELETE 天然幂等，POST 需业务层保证幂等。\n\n【面试加分】能区分"幂等"与"防重"：幂等强调结果相同，防重强调不重复提交，实现上常复用唯一 ID。',
      source: '大厂面经'
    },
    {
      id: 'be-008', category: 'backend', tags: ['架构', '高并发'], difficulty: 3,
      question: '如何设计一个高并发的秒杀系统？',
      answer: '一句话结论：层层拦截（CDN/静态化/限流）+ 异步削峰（MQ）+ 原子扣库存（Redis/Lua + 乐观锁），从入口到数据库逐级减压。\n\n【前端/网关层】\n1. 页面静态化 + CDN，减少服务端请求；\n2. 按钮防重（置灰）、验证码/答题限流防刷；\n3. 网关限流（令牌桶/漏桶）、Nginx 限流。\n\n【服务层】\n1. MQ 异步下单，快速返回"排队中"；\n2. Redis 预减库存 + Lua 脚本保证原子（判断库存 > 0 再扣）；\n3. 缓存预热，热点数据提前加载。\n\n【数据一致性（超卖防护）】\n1. 乐观锁：UPDATE ... SET stock=stock-1 WHERE stock>0（原子判断，天然防超卖）；\n2. Redis 扣减成功后异步落库，最终一致；\n3. 预扣库存 + 未支付回补。\n\n【高频追问（牛客面经）】\n· 超卖怎么解决？→ 乐观锁 WHERE stock>0 或 Redis Lua 原子扣减；\n· 重复下单？→ 唯一索引（用户+商品）+ 分布式锁；\n· 减库存成功但下单失败？→ 分布式事务（TCC/本地消息表）或回补库存；\n· 恶意下单？→ 限流 + 令牌 + IP 拉黑。\n\n【核心一句话】拦截 + 削峰 + 原子扣库存。',
      source: '牛客面经（美团/字节/滴滴）'
    },
    {
      id: 'be-009', category: 'backend', tags: ['分布式', '负载均衡'], difficulty: 2,
      question: '常见的负载均衡算法有哪些？各有什么特点？',
      answer: '一句话结论：轮询/随机最简单，最少连接适合长连接，IP 哈希适合会话保持，一致性哈希适合分布式缓存分片。\n\n【算法】\n1. 轮询 Round Robin：依次分配，简单公平；加权轮询按机器性能分配权重；\n2. 随机 Random：随机选择，加权随机同理；\n3. 最少连接 Least Connections：分给当前连接数最少的机器，适合长连接；\n4. 源地址哈希 IP Hash：同一客户端 IP 固定打到同一台（会话保持），但机器增减会重映射；\n5. 一致性哈希：哈希环 + 虚拟节点，机器增减只影响局部，适合分布式缓存（Redis 分片）。\n\n【实现层级】\n· L4（传输层）：LVS、Nginx，基于 IP+端口转发；\n· L7（应用层）：Nginx、HAProxy，基于 HTTP 内容路由（可按 URL 分发）。\n\n【面试加分】能说出一致性哈希用"虚拟节点"解决数据倾斜问题。',
      source: '大厂面经'
    },
    {
      id: 'be-010', category: 'backend', tags: ['并发', '一致性'], difficulty: 3,
      question: '高并发场景下如何保证数据一致性？',
      answer: '一句话结论：根据业务对一致性的要求（强一致/最终一致）选策略——资金用强一致，非核心用最终一致 + 对账兜底。\n\n【单机/数据库层】\n1. 悲观锁：SELECT ... FOR UPDATE，先锁后改，强一致但并发低；\n2. 乐观锁：版本号或 CAS，UPDATE ... SET x=x+1 WHERE version=?，冲突重试，并发高；\n3. 原子 SQL：UPDATE stock=stock-1 WHERE stock>0，一条语句保证原子。\n\n【分布式层】\n1. 分布式锁（Redis/ZK）串行化关键操作；\n2. 分布式事务：2PC（强一致）、TCC（Try-Confirm-Cancel）、Saga、本地消息表 + 最终一致；\n3. MQ 异步解耦 + 幂等消费保证最终一致。\n\n【CAP 取舍】\n· 强一致：牺牲可用性/性能（2PC、分布式锁）；\n· 最终一致：牺牲实时一致换高可用（MQ、异步对账）。\n\n【实践】核心资金用事务/悲观锁强一致；非核心用最终一致 + 幂等 + 对账补偿兜底。\n\n【面试加分】能说出 BASE（基本可用、软状态、最终一致）是 AP 的落地实践。',
      source: '大厂面经'
    },

    {
      id: 'be-011', category: 'backend', tags: ['Redis', '持久化'], difficulty: 2,
      question: 'Redis 的持久化机制 RDB 和 AOF 有什么区别？',
      answer: '一句话结论：RDB 是快照（定时全量，恢复快、可能丢数据），AOF 是追加日志（每次写记录，更安全、文件更大）；生产常两者混合。\n\n【RDB 快照】\n· 原理：fork 子进程 + Copy-on-Write 生成某一时刻的内存快照，落盘为二进制文件；\n· 优点：文件小、恢复快、对性能影响小；缺点：两次快照间隔的数据会丢失、fork 大内存时可能阻塞。\n\n【AOF 追加日志】\n· 原理：每次写命令追加到日志；\n· 策略：always（每次刷盘，最安全最慢）/ everysec（每秒，默认，兼顾）/ no（交给 OS）；\n· 优点：数据更安全、可重写压缩；缺点：文件更大、恢复慢。\n\n【AOF 重写】BGREWRITEAOF 用 fork 子进程按当前数据生成最小命令集，压缩 AOF 体积。\n\n【混合持久化（Redis 4.0+）】RDB 快照 + 增量 AOF 结合，兼顾恢复速度与数据安全。\n\n【选型】对数据安全要求高用 AOF（everysec）；追求恢复速度用 RDB；生产推荐 RDB + AOF 混合。',
      source: 'Redis 八股文'
    },
    {
      id: 'be-012', category: 'backend', tags: ['分布式', '理论'], difficulty: 3,
      question: '什么是 CAP 理论和 BASE 理论？它们有什么关系？',
      answer: '一句话结论：CAP 说一致性/可用性/分区容错三者最多同时满足两个；BASE 是 AP 的落地实践，追求最终一致。\n\n【CAP 三要素】\n· C 一致性 Consistency：所有节点同一时刻数据一致；\n· A 可用性 Availability：请求总能得到响应（不保证数据最新）；\n· P 分区容错 Partition Tolerance：网络分区故障时系统仍能工作。\n\n【取舍】分布式系统网络分区不可避免，P 必选；于是只能在 C 和 A 之间二选一：\n· CP：保证一致，牺牲可用（ZooKeeper、etcd、金融转账）；\n· AP：保证可用，牺牲强一致（Eureka、秒杀、多数互联网业务）。\n\n【BASE 理论】\n· BA 基本可用（降级、限流保证核心可用）；\n· S 软状态（允许中间态/数据不同步）；\n· E 最终一致（经过一段时间最终达成一致）。\n\n【关系】BASE 是对 CAP 中 AP 的扩展与落地：无法做到强一致，就用最终一致换取高可用。\n\n【面试加分】能举例：注册中心 Eureka（AP）vs ZooKeeper（CP）；并说明"CAP 是取舍不是三选二固定"。',
      source: '大厂面经'
    },
    {
      id: 'be-013', category: 'backend', tags: ['限流', '高并发'], difficulty: 3,
      question: '常见的限流算法有哪些？令牌桶和漏桶有什么区别？',
      answer: '一句话结论：计数器最简单，滑动窗口解决临界问题，漏桶恒定速率（削峰），令牌桶允许突发（更灵活）。\n\n【算法】\n1. 固定窗口计数器：单位时间内计数，超限拒绝；缺点：窗口边界瞬间突发（临界问题）；\n2. 滑动窗口：细分时间片统计，解决临界突发，更平滑；\n3. 漏桶 Leaky Bucket：请求先进桶，以固定速率流出；强制恒定速率，能削峰但不能应对突发流量；\n4. 令牌桶 Token Bucket：以固定速率往桶放令牌，请求需取令牌，取到才放行；桶满令牌丢弃，可允许一定突发。\n\n【令牌桶 vs 漏桶】\n· 漏桶：输出速率恒定，适合需要严格匀速的场景（如对外接口保护）；\n· 令牌桶：允许短时突发（桶容量内），适合有突发流量的业务（秒杀瞬时高峰）。\n\n【实现】Redis + Lua 脚本原子实现令牌桶/滑动窗口；Guava RateLimiter（单机）、Sentinel（分布式）。\n\n【面试加分】能说明"令牌桶允许突发是因为桶里可以预先积累令牌"。',
      source: '大厂面经'
    },

    // ==================== 算法 ====================
    {
      id: 'al-001', category: 'algorithm', tags: ['复杂度', '基础'], difficulty: 1,
      question: '什么是时间复杂度、空间复杂度？常见复杂度如何排序？',
      answer: '一句话结论：复杂度描述算法随输入规模 n 增长的趋势，用大 O 表示，关注最高阶、忽略常数与低阶。\n\n【时间复杂度】算法执行时间随 n 的增长趋势；【空间复杂度】额外内存随 n 的增长趋势。\n\n【排序（由快到慢）】O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2^n) < O(n!)\n\n【举例】\n· 二分查找 O(log n)；遍历数组 O(n)；\n· 归并/快排（平均）O(n log n)；冒泡/选择/插入 O(n²)；汉诺塔 O(2^n)。\n\n【面试官追问】\n· 快排最坏情况？→ 已有序时 O(n²)，随机化或三数取中可避免。\n· 为什么忽略常数？→ 大 O 关注增长趋势，n 很大时常数影响可忽略，但工程上常数仍重要。',
      source: 'LeetCode 热题 HOT100'
    },
    {
      id: 'al-002', category: 'algorithm', tags: ['排序', '基础'], difficulty: 2,
      question: '常见的排序算法有哪些？各自的稳定性与时间复杂度？',
      answer: '一句话结论：稳定排序（冒泡/插入/归并/基数）保相对顺序，不稳定排序（选择/快排/堆）更快，各有适用场景。\n\n【稳定排序】\n· 冒泡 O(n²)；插入 O(n²)（基本有序接近 O(n)）；归并 O(n log n)（需 O(n) 空间）；基数 O(d·n)。\n\n【不稳定排序】\n· 选择 O(n²)；快速排序平均 O(n log n)/最坏 O(n²)；堆排序 O(n log n)。\n\n【选型建议】\n· 小规模/基本有序 → 插入排序；\n· 需稳定 + 大数据 → 归并排序；\n· 通用原地 → 快速排序；\n· 求 Top K → 堆排序。\n\n【面试加分】Java Arrays.sort 对基本类型用双轴快排，对对象用 TimSort（归并+插入混合，稳定）。',
      source: '剑指 Offer / 八股文经典'
    },
    {
      id: 'al-003', category: 'algorithm', tags: ['查找', '基础'], difficulty: 1,
      question: '二分查找的实现思路、复杂度以及适用前提？',
      answer: '一句话结论：在有序数组中每次取中点比较、折半缩小区间，O(log n)，前提是有序 + 支持随机访问。\n\n【思路】取中间元素与目标比较：相等找到；中间 < 目标找右半区；中间 > 目标找左半区；重复直至找到或区间为空。\n\n【复杂度】时间 O(log n)，空间 O(1)（迭代版）。\n\n【适用前提】数据有序、支持随机访问（数组）、静态或低频变更。\n\n【易错点（面试高频）】\n1. 边界：while(left <= right) 与 left=mid+1 / right=mid-1 配套；\n2. 防溢出：mid = left + (right-left)/2 而非 (left+right)/2；\n3. 变体：找第一个/最后一个等于目标、第一个大于等于目标（用不同收缩策略）。\n\n【面试加分】能写"找左边界"变体（right=mid 而非 mid-1），体现对边界控制的理解。',
      source: '剑指 Offer'
    },
    {
      id: 'al-004', category: 'algorithm', tags: ['链表', '指针'], difficulty: 1,
      question: '如何反转一个单链表？（迭代与递归两种思路）',
      answer: '一句话结论：迭代用三指针（prev/cur/next）逐个反转，递归回溯时反转指针，均 O(n)。\n\n【迭代法】\nprev = null, cur = head\nwhile cur:\n    nxt = cur.next   # 暂存\n    cur.next = prev  # 反转\n    prev = cur       # 后移\n    cur = nxt\nreturn prev\n时间 O(n)、空间 O(1)。\n\n【递归法】\n1. 递归到最后一个节点作为新头；\n2. 回溯时 head.next.next = head、head.next = null 逐层反转。\n时间 O(n)、空间 O(n)（递归栈）。\n\n【面试官追问】递归版空间复杂度？→ O(n) 递归栈；迭代版更优 O(1)。\n\n【同类题】K 个一组翻转链表（LeetCode 25，先分组再局部反转）。',
      source: 'LeetCode 206 / 剑指 Offer'
    },
    {
      id: 'al-005', category: 'algorithm', tags: ['动态规划', '思想'], difficulty: 3,
      question: '动态规划的核心思想是什么？与贪心、分治有何区别？',
      answer: '一句话结论：DP 把问题分解为重叠子问题，保存子问题解避免重复计算，自底向上递推求最优解。\n\n【适用条件】最优子结构 + 无后效性 + 子问题重叠。\n\n【解题四步】\n1. 定义状态 dp[i] 含义；\n2. 找状态转移方程；\n3. 确定初始值与边界；\n4. 确定计算顺序填表。\n\n【与贪心区别】贪心每步做局部最优不回退，不一定全局最优（如背包）；DP 考虑所有可能保证全局最优（代价更高）。\n\n【与分治区别】分治子问题不重叠（归并排序）；DP 子问题相互重叠（斐波那契、爬楼梯）。\n\n【经典题】爬楼梯、背包、最长公共子序列、打家劫舍、最大子序和（dp[i]=max(nums[i], dp[i-1]+nums[i])）。\n\n【面试加分】能说明"如何从暴力递归优化到记忆化再到 DP"，体现递推思维。',
      source: 'LeetCode 热题 HOT100'
    },

    {
      id: 'al-006', category: 'algorithm', tags: ['数据结构', '基础'], difficulty: 1,
      question: '数组和链表的区别？各自适用什么场景？',
      answer: '一句话结论：数组连续存储、O(1) 随机访问但插入删除 O(n)；链表分散存储、插入删除 O(1) 但访问 O(n)。\n\n【数组】\n· 优点：随机访问 O(1)、缓存友好（局部性）；\n· 缺点：插入/删除需移动元素 O(n)、扩容需重新分配内存。\n\n【链表】\n· 优点：插入/删除 O(1)（已知位置）、无需连续内存、动态扩展；\n· 缺点：访问 O(n)、额外指针占用内存、缓存不友好。\n\n【对比】访问：数组 O(1) vs 链表 O(n)；插入删除：数组 O(n) vs 链表 O(1)。\n\n【场景】数组：频繁随机访问、数量固定；链表：频繁插入删除（尤其头部）、数量动态、LRU 实现。\n\n【面试加分】能说清"缓存友好"原理：数组内存连续，CPU 缓存预取命中率高。',
      source: '剑指 Offer'
    },
    {
      id: 'al-007', category: 'algorithm', tags: ['数据结构', '栈队列'], difficulty: 1,
      question: '栈和队列的区别？如何用栈实现队列？',
      answer: '一句话结论：栈 LIFO（后进先出），队列 FIFO（先进先出）；用两个栈（in/out）实现队列，均摊 O(1)。\n\n【栈】只在一端操作，push/pop；应用：函数调用栈、括号匹配、表达式求值、DFS、浏览器前进后退。\n【队列】一端入队一端出队；应用：任务调度、BFS、消息队列、缓存淘汰。\n\n【用两个栈实现队列】\n· in 栈负责入队，out 栈负责出队；\n· 入队：直接 push 到 in；\n· 出队：若 out 非空则 pop；若为空，把 in 全部弹出并压入 out（反转顺序），再 pop out。\n· 均摊时间 O(1)。\n\n【用两个队列实现栈】入栈 O(1)；出栈时把非空队列除最后一个外的元素移到另一队列，弹出最后一个。\n\n【扩展】双端队列（两端可进出）、优先队列（按优先级出队，堆实现）。',
      source: 'LeetCode 232 / 剑指 Offer'
    },
    {
      id: 'al-008', category: 'algorithm', tags: ['数据结构', '哈希'], difficulty: 2,
      question: '哈希表的原理是什么？哈希冲突如何解决？',
      answer: '一句话结论：哈希函数把 key 映射到数组下标，O(1) 平均时间增删查；冲突用拉链法或开放寻址解决。\n\n【冲突解决】\n1. 链地址法（拉链法）：每个槽挂链表/红黑树（Java HashMap，链表过长转红黑树）；\n2. 开放寻址法：冲突时按探测序列找下一空位（线性/二次/双重探测；ThreadLocal 用线性探测）；\n3. 再哈希法：换哈希函数重算；\n4. 公共溢出区：冲突元素统一放溢出区。\n\n【扩容】负载因子（元素数/容量）超阈值（如 0.75）扩容约 2 倍并 rehash。\n\n【好的哈希函数】计算快、分布均匀、少冲突。\n\n【面试加分】JDK HashMap：链表长度 ≥8 且数组长度 ≥64 时转红黑树，降低最坏 O(n) 到 O(log n)；JDK8 头插改尾插解决并发扩容死循环。\n\n【应用】去重、计数、缓存（LRU）、两数之和。',
      source: 'LeetCode 热题 HOT100 / 八股文'
    },
    {
      id: 'al-009', category: 'algorithm', tags: ['树', '遍历'], difficulty: 2,
      question: '二叉树的遍历方式有哪些？分别如何实现？',
      answer: '一句话结论：DFS（前/中/后序）+ BFS（层序）；前序根左右、中序左根右（BST 有序）、后序左右根、层序逐层。\n\n【深度优先 DFS】\n· 前序：根→左→右（序列化/复制树）；\n· 中序：左→根→右（BST 得有序序列）；\n· 后序：左→右→根（自底向上，如求树高）。\n\n【广度优先 BFS】层序：队列逐层遍历（求树高、Z 字形）。\n\n【实现】\n· 递归：DFS 三序改访问顺序即可；\n· 迭代：前/中序用显式栈；后序用"根右左再反转"；层序用队列记录每层长度。\n\n【复杂度】时间 O(n)，空间 O(h)（递归栈，最坏 O(n)），层序 O(最大层宽)。\n\n【面试加分】能说出"已知前序+中序（或后序+中序）可唯一确定树，前序+后序不能"。',
      source: 'LeetCode 热题 HOT100'
    },
    {
      id: 'al-010', category: 'algorithm', tags: ['滑动窗口', '双指针'], difficulty: 2,
      question: '什么是滑动窗口算法？适用于解决什么问题？',
      answer: '一句话结论：用左右双指针维护可伸缩区间，O(n) 解决"连续子数组/子串"问题，避免重复计算。\n\n【模板（最长/最短子串）】\nleft = 0, right = 0\nwhile right < n:\n    加入 nums[right]\n    while 窗口不满足条件:\n        移除 nums[left]; left++\n    更新结果\n    right++\n\n【适用场景】最长无重复子串、最小覆盖子串、长度最小子数组（和 ≥ target）、定长窗口。\n\n【复杂度】每元素至多被左右指针各访问一次，O(n)。\n\n【要点】关键是"何时移动左边界收缩窗口"，通常配合哈希表统计窗口内字符/元素。\n\n【面试加分】能说明滑动窗口本质是双指针的一种，用于线性结构连续区间问题。',
      source: 'LeetCode 热题 HOT100'
    },

    {
      id: 'al-011', category: 'algorithm', tags: ['LRU', '数据结构', '设计'], difficulty: 3,
      question: '如何实现一个 LRU 缓存（LRU Cache）？',
      answer: '一句话结论：哈希表 + 双向链表，get/put 均 O(1)；哈希表定位节点，双向链表维护访问顺序。\n\n【设计】\n· 哈希表 map：key → 链表节点，O(1) 定位；\n· 双向链表：头部是最近访问，尾部是最久未访问；\n· get(key)：查到则移到头部返回；未查到返回 -1；\n· put(key,value)：存在则更新并移到头部；不存在则插入头部，若超容量则删除尾部节点。\n\n【为什么双向链表】删除任意节点（尾部）需要前驱指针，单链表做不到 O(1)。\n\n【伪码】\nget: if key in map → node=map[key]; moveToHead(node); return node.val; else -1\nput: if key in map → node=map[key]; node.val=val; moveToHead(node)\n     else → new node; addToHead; map[key]=node; if size>cap → remove tail; delete map[tail.key]\n\n【面试加分】\n· 用哈希表 + 双向链表手写；Python 可用 OrderedDict；\n· 能说 Redis 的 LRU 是"近似抽样"实现，与严格 LRU 不同；\n· 同类进阶：LFU（LeetCode 460，按访问频率，需频率桶）。',
      source: 'LeetCode 146'
    },
    {
      id: 'al-012', category: 'algorithm', tags: ['双指针', '哈希'], difficulty: 2,
      question: '两数之和、三数之和如何求解？',
      answer: '一句话结论：两数之和用哈希表 O(n)；三数之和先排序 + 固定一端 + 双指针 O(n²)。\n\n【两数之和（LeetCode 1）】\n· 哈希表存 num→index，遍历时查 target-num；\n· 时间 O(n)、空间 O(n)；\n· 注意重复元素（[3,3] target=6，需先判断再存）。\n\n【三数之和（LeetCode 15）】\n1. 排序；\n2. 固定第一个数 nums[i]，用双指针 left/right 在剩余区间找和为 -nums[i]；\n3. 去重：跳过相同的 i、left、right；\n4. 时间 O(n²)。\n\n【面试官追问】\n· 两数之和若数组有序？→ 双指针 O(n)、空间 O(1)（LeetCode 167）。\n· 三数之和为什么排序 + 双指针？→ 排序后才能用双指针逼近目标和。\n\n【加分】能分析两数之和哈希 O(n) 与排序双指针 O(n log n) 的时空权衡。',
      source: 'LeetCode 1 / 15'
    },
    {
      id: 'al-013', category: 'algorithm', tags: ['链表', '快慢指针'], difficulty: 2,
      question: '如何判断链表是否有环？如何找到环的入口？',
      answer: '一句话结论：快慢指针（Floyd 判圈）——快指针每次 2 步、慢指针 1 步，相遇即有环；再让一指针回起点同速走，相遇点即环入口。\n\n【判断有环】\nslow=head, fast=head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast: return True  # 有环\nreturn False\n\n【找环入口（LeetCode 142）】\n1. 快慢指针相遇后，令一个指针回到 head；\n2. 两指针同速（每次 1 步）前进，再次相遇点即环入口。\n\n【原理】设入环前长度 a、环长 b；相遇时慢指针走 x 步，快指针走 2x，2x-x=nb → x=nb；慢指针还需再走 a 步才到环入口，故从头再走 a 步的指针会与之在入口相遇。\n\n【复杂度】时间 O(n)、空间 O(1)；哈希表方案 O(n) 空间。\n\n【加分】能对比哈希表（O(n) 空间）与快慢指针（O(1) 空间）的取舍。',
      source: 'LeetCode 141 / 142'
    },

    // ==================== 数据库 ====================
    {
      id: 'db-001', category: 'database', tags: ['事务', 'ACID'], difficulty: 2,
      question: '什么是数据库事务？ACID 分别指什么？',
      answer: '一句话结论：事务是最小逻辑单元，要么全成功要么全回滚；ACID 靠 undo log、redo log、锁+MVCC 共同实现。\n\n【ACID 及实现】\n1. 原子性 Atomicity：操作全做或全不做（undo log 回滚实现）；\n2. 一致性 Consistency：事务前后数据满足约束（由 A+I+D 共同保证）；\n3. 隔离性 Isolation：并发事务互不干扰（锁 + MVCC）；\n4. 持久性 Durability：提交后永久保存，宕机不丢（redo log 先写日志再刷盘）。\n\n【面试官追问】\n· 转账例子：A 转 B 200，原子性=要么都成功要么都失败，一致性=总额不变，隔离性=不受其他事务干扰，持久性=提交后落盘。\n· 持久性参数？→ innodb_flush_log_at_trx_commit=1（每次提交刷 redo）。\n\n【加分】能说出"一致性是目标，原子/隔离/持久是手段"。',
      source: 'MySQL 八股文 / 牛客面经'
    },
    {
      id: 'db-002', category: 'database', tags: ['MySQL', '事务'], difficulty: 3,
      question: '数据库事务隔离级别有哪些？分别解决什么问题？',
      answer: '一句话结论：隔离级别由低到高是 RU/RC/RR/Serializable，分别解决脏读、不可重复读、幻读，隔离越高并发越低。\n\n【四级 + 解决的问题】\n1. 读未提交 RU：脏读/不可重复读/幻读都可能；\n2. 读已提交 RC：解决脏读，仍有不可重复读、幻读（Oracle 默认）；\n3. 可重复读 RR：解决脏读、不可重复读，仍有幻读（InnoDB 默认，靠 MVCC+间隙锁基本解决）；\n4. 串行化 Serializable：全解决，但并发最低。\n\n【三类并发问题】\n· 脏读：读到其他事务未提交的数据；\n· 不可重复读：同一事务多次读同一行结果不同（被修改）；\n· 幻读：同一事务多次查询行数不同（被插入/删除）。\n\n【实现】MVCC（多版本并发控制）+ 锁；RR 下 InnoDB 用"快照读 + 间隙锁"缓解幻读。\n\n【加分】能说 InnoDB RR 下 MVCC 读不加锁、写不阻塞读。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-003', category: 'database', tags: ['MySQL', '引擎'], difficulty: 2,
      question: 'MySQL 中 InnoDB 与 MyISAM 存储引擎有什么区别？',
      answer: '一句话结论：InnoDB 支持事务/行级锁/外键/崩溃恢复，是默认且主流；MyISAM 只读场景、表锁、无事务，已边缘化。\n\n【InnoDB（默认）】\n· 支持事务 ACID、行级锁、外键；\n· 聚簇索引（主键叶子存整行）；\n· 支持 MVCC，并发读写性能好；\n· redo log 崩溃恢复，安全性高；\n· 适用：写密集、高并发（订单、交易）。\n\n【MyISAM】\n· 不支持事务/外键，仅表级锁；\n· 非聚簇索引（索引与数据分离）；\n· 支持全文索引、压缩；\n· 不支持崩溃安全恢复；\n· 适用：只读、日志、静态数据（已逐渐被取代）。\n\n【面试加分】能说"阿里生产核心 100% 用 InnoDB，MyISAM 仅历史归档/只读"，避免说"MyISAM 查询更快"（可通过索引/缓存优化追平）。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-004', category: 'database', tags: ['MySQL', '索引'], difficulty: 3,
      question: '什么是索引失效？哪些情况会导致索引失效？',
      answer: '一句话结论：索引失效指 SQL 本可用索引却走了全表扫描；常见于函数运算、隐式转换、前导模糊、违背最左前缀等。\n\n【常见失效场景】\n1. 索引列用函数/运算：WHERE YEAR(create_time)=2024 或 age+1=20；\n2. 隐式类型转换：字符串列与数字比较（phone=138...）；\n3. 前导模糊：LIKE \'%xx\'（% 在开头）；\n4. 违背最左前缀：联合索引 (a,b,c) 只用 b 或 c；\n5. OR 连接非索引列；\n6. IS NULL / NOT IN / !=（视优化器）；\n7. 数据量小或区分度低，优化器认为全表更划算。\n\n【最左前缀原理】B+ 树按最左列排序，跳过左列无法定位索引范围；遇到范围查询（>、<、between、like）停止匹配，后续列失效。\n\n【排查】EXPLAIN 看 type（禁 ALL）、key（是否命中）、rows、Extra（禁 Using filesort/temporary）。\n\n【优化】改写 SQL、调整索引（等值在前范围在后）、覆盖索引减少回表。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-005', category: 'database', tags: ['MySQL', '优化'], difficulty: 2,
      question: '如何定位并优化一条慢查询 SQL？',
      answer: '一句话结论：先开慢日志定位，再 EXPLAIN 分析执行计划，最后加索引/改写 SQL/架构层优化。\n\n【定位】\n1. 开慢查询日志（slow_query_log、long_query_time=1）；\n2. 用 mysqldumpslow / pt-query-digest 分析慢日志；\n3. show processlist、performance_schema 找执行中的慢 SQL。\n\n【分析 EXPLAIN】关注：type（需达 range，最优 ref/eq_ref，禁 ALL）、key（是否命中索引）、rows（扫描行数）、Extra（避免 Using filesort/temporary）。\n\n【优化手段】\n1. 加合适索引（覆盖索引、联合索引遵循最左前缀）；\n2. 改写 SQL：禁 SELECT *、避免函数作用于索引列、子查询改 JOIN；\n3. 分页优化：大 offset 用"WHERE id > 上一页最大 id"或延迟关联；\n4. 大表分库分表、读写分离；\n5. 调整 buffer_pool 等参数。\n\n【加分】能说清阿里标准流程：定位 → 分析 → 优化 → 验证（慢 SQL 数量下降）。',
      source: 'MySQL 八股文 / 阿里考点'
    },

    {
      id: 'db-006', category: 'database', tags: ['MySQL', '架构'], difficulty: 3,
      question: '什么是分库分表？有哪些分片策略？',
      answer: '一句话结论：单表过大时拆库拆表；垂直拆按业务/字段，水平拆按行分片（范围/哈希/一致性哈希）。\n\n【垂直拆分】\n· 垂直分库：按业务模块拆到不同库（用户库、订单库），降耦合；\n· 垂直分表：按字段拆（高频字段与低频大字段分离），减单行体积。\n\n【水平拆分（分片）】\n· 水平分库：按行拆到多库；\n· 水平分表：按行拆到多表（同库或跨库）。\n\n【分片策略】\n1. 范围分片：按时间/ID 区间，利于范围查询但易热点；\n2. 哈希分片：取模或一致性哈希，分布均匀但扩容需迁移；\n3. 按业务/地理位置分片。\n\n【带来的问题】\n1. 分布式 ID（雪花算法）；\n2. 跨库 JOIN 困难（冗余、应用层聚合）；\n3. 分布式事务、跨分片分页排序；\n4. 数据迁移扩容复杂。\n\n【选型】优先单库优化（索引/缓存/读写分离），扛不住再分库分表；工具如 ShardingSphere。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-007', category: 'database', tags: ['MySQL', '高可用'], difficulty: 2,
      question: 'MySQL 主从复制的原理是什么？读写分离如何实现？',
      answer: '一句话结论：主库写 binlog，从库 IO 线程拉取写 relay log，SQL 线程重放实现同步；读写分离靠中间件或应用层路由。\n\n【主从流程】\n1. 主库变更写 binlog；\n2. 从库 IO 线程连接主库，拉取 binlog 写入中继日志 relay log；\n3. 从库 SQL 线程读 relay log 重放，实现同步。\n\n【复制模式】\n· 异步（默认，可能丢数据）；半同步（至少一从确认，提升可靠性）；全同步（性能差）。\n\n【读写分离】写走主库、读走从库，靠 ShardingSphere/MyCat 或应用层路由。\n\n【主从延迟问题】\n· 原因：异步 + 单线程（或受限并行）重放，大事务/高并发导致延迟；\n· 解决：并行复制、半同步；业务上"刚写入立即读"强制走主库。\n\n【面试加分】能说主从用于读写分离、备份、故障切换三大用途。',
      source: 'MySQL 八股文'
    },
    {
      id: 'db-008', category: 'database', tags: ['设计', '范式'], difficulty: 2,
      question: '数据库三大范式（1NF/2NF/3NF）分别是什么？',
      answer: '一句话结论：1NF 属性原子、2NF 消除部分依赖、3NF 消除传递依赖；实际项目常适度反范式化换性能。\n\n【1NF】列不可再分（原子性），无嵌套表/重复组。\n【2NF】满足 1NF + 消除非主属性对主键的部分依赖（非主属性完全依赖整个主键）；针对复合主键。\n【3NF】满足 2NF + 消除非主属性对主键的传递依赖（非主属性不能依赖其他非主属性）。\n\n【例】\n· 2NF：选课表 (学号,课程号) 主键，学生姓名只依赖学号 → 违反 2NF，应拆学生表；\n· 3NF：学号→院系→院系主任，院系主任传递依赖学号 → 违反 3NF，应拆学院表。\n\n【BCNF】3NF 加强，消除主属性对候选键的部分/传递依赖。\n\n【反范式化】为查询性能适度冗余（空间换时间），需权衡一致性与维护成本。\n\n【加分】能举例说明实际项目中哪些地方故意反范式化（如订单表冗余用户名避免 JOIN）。',
      source: 'MySQL 八股文 / 牛客面经'
    },
    {
      id: 'db-009', category: 'database', tags: ['并发', '锁'], difficulty: 2,
      question: '乐观锁和悲观锁有什么区别？分别如何实现？',
      answer: '一句话结论：悲观锁"先锁后操作"（阻塞），乐观锁"先操作后校验"（重试）；写多冲突频繁用悲观，读多写少用乐观。\n\n【悲观锁】假设会冲突，操作前加锁，其他事务阻塞。\n· 实现：SELECT ... FOR UPDATE、synchronized、数据库排它锁；\n· 优点：强一致；缺点：并发低、易死锁、锁等待。\n· 适用：写多读少、冲突频繁、强一致（转账扣款）。\n\n【乐观锁】假设不冲突，提交时校验版本是否变化，变了则重试。\n· 实现：版本号 UPDATE ... SET x=x+1, version=version+1 WHERE version=?（影响 0 行则重试）或 CAS；\n· 优点：无锁、并发高；缺点：冲突多时重试成本高。\n· 适用：读多写少、可容忍重试（库存扣减）。\n\n【注意】乐观锁的 version 校验与更新必须同一条 SQL 保证原子，否则有并发问题。\n\n【加分】能说"秒杀库存用乐观锁 WHERE stock>0 天然防超卖"。',
      source: 'MySQL 八股文 / 牛客面经'
    },
    {
      id: 'db-010', category: 'database', tags: ['MySQL', 'SQL'], difficulty: 1,
      question: 'SQL 中 JOIN 有哪些类型？各有什么区别？',
      answer: '一句话结论：INNER 取交集、LEFT/RIGHT 保留一边全部、FULL 取并集、CROSS 笛卡尔积。\n\n【类型】\n1. INNER JOIN：只返回两表都满足条件的行；\n2. LEFT JOIN：左表全保留，右表无匹配补 NULL；\n3. RIGHT JOIN：右表全保留，左表无匹配补 NULL；\n4. FULL OUTER JOIN：两表全保留（MySQL 用 LEFT UNION RIGHT 模拟）；\n5. CROSS JOIN：笛卡尔积（无关联条件）。\n\n【易错点】\n· LEFT/RIGHT JOIN 的过滤条件写 ON 与 WHERE 效果不同：ON 连接时生效，WHERE 连接后过滤；\n· 多表 JOIN 注意索引，避免笛卡尔积；\n· 小表驱动大表、关联字段建索引。\n\n【面试加分】能说清 ON 与 WHERE 的区别（LEFT JOIN 时 WHERE 会把无匹配行也过滤掉）。',
      source: 'MySQL 八股文'
    },

    {
      id: 'db-011', category: 'database', tags: ['MySQL', 'MVCC', '底层'], difficulty: 3,
      question: 'MySQL 的 MVCC 实现原理是什么？',
      answer: '一句话结论：MVCC 用隐藏列 + undo log 版本链 + Read View，实现"读不加锁、写不阻塞读"的快照读。\n\n【三大组件】\n1. 隐藏列：每行含 DB_TRX_ID（最后修改的事务 ID）、DB_ROLL_PTR（指向 undo log 的回滚指针）、DB_ROW_ID（无主键时的行 ID）；\n2. undo log：记录历史版本，通过 roll_ptr 形成版本链；\n3. Read View：事务可见性视图，含 m_ids（活跃事务集合）、min_trx_id、max_trx_id、creator_trx_id。\n\n【可见性规则】\n· 行 trx_id < min_trx_id：已提交，可见；\n· 行 trx_id > max_trx_id：未创建，不可见；\n· 中间区间：若 trx_id 不在活跃集合则可见，否则不可见（沿版本链向前找）。\n\n【RR vs RC 区别】\n· RR：事务内只创建 1 次 Read View，保证重复读一致；\n· RC：每次查询创建新 Read View，能看到其他事务已提交修改。\n\n【快照读 vs 当前读】普通 SELECT 是快照读（MVCC）；SELECT ... FOR UPDATE / UPDATE 是当前读（加锁）。\n\n【加分】能结合"电商订单用 RR 避免幻读，支付可用 RC 提并发"。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-012', category: 'database', tags: ['MySQL', '索引', '优化'], difficulty: 2,
      question: '什么是覆盖索引、回表、索引下推？',
      answer: '一句话结论：覆盖索引让查询只走索引不回表；回表是二级索引查主键再查主键树；索引下推在存储引擎层先过滤减少回表。\n\n【回表】二级索引（普通索引）叶子存主键值，查完整行需再走主键索引树查一次，即回表（两次 B+ 树查询）。\n\n【覆盖索引】查询的列都在索引中，无需回表。\n· 例：索引 (name)，SELECT name FROM user WHERE name=\'张三\' 走覆盖索引；SELECT * 则需回表。\n· EXPLAIN 的 Extra 显示 Using index。\n\n【索引下推 ICP（Index Condition Pushdown）】\n· 联合索引 (name, age)，WHERE name LIKE \'张%\' AND age=20；\n· 无 ICP：先回表取整行再过滤 age；\n· 有 ICP：存储引擎先用 age 条件过滤，减少回表次数（MySQL 5.6+ 默认开启）。\n\n【优化】为高频查询建覆盖索引，但要控制索引列数（≤3 列），避免维护成本。\n\n【加分】能说清三者关系：索引下推和覆盖索引都是"减少回表"的优化手段。',
      source: 'MySQL 八股文 / 阿里考点'
    },
    {
      id: 'db-013', category: 'database', tags: ['MySQL', '日志', '底层'], difficulty: 3,
      question: 'redo log、undo log、binlog 有什么区别和作用？',
      answer: '一句话结论：redo 重做日志保持久性（崩溃恢复），undo 回滚日志保原子性（回滚+MVCC），binlog 归档日志用于主从复制与恢复。\n\n【redo log（重做日志，InnoDB）】\n· 记录"物理修改"（页的变更）；\n· 先写日志再刷盘（WAL），崩溃后重放恢复已提交数据；\n· 循环写，保证持久性；参数 innodb_flush_log_at_trx_commit 控制刷盘时机。\n\n【undo log（回滚日志，InnoDB）】\n· 记录"修改前"的逻辑状态；\n· 事务回滚时恢复原值；MVCC 通过它形成版本链；保证原子性。\n\n【binlog（归档日志，Server 层）】\n· 记录"逻辑操作"（SQL 语句）；\n· 用于主从复制、数据恢复；追加写，不循环；\n· 参数 sync_binlog 控制刷盘。\n\n【两阶段提交】事务提交时，先写 redo（prepare）→ 写 binlog → redo（commit），保证两份日志一致，是崩溃恢复与主从一致的关键。\n\n【加分】能说"双 1"配置（innodb_flush_log_at_trx_commit=1 + sync_binlog=1）保证金融级一致性。',
      source: 'MySQL 八股文 / 阿里考点'
    },

    // ==================== 计算机网络 ====================
    {
      id: 'net-001', category: 'network', tags: ['TCP', '传输层'], difficulty: 2,
      question: 'TCP 三次握手和四次挥手的过程是怎样的？为什么需要三次？',
      answer: '一句话结论：三次握手确认双方收发能力 + 同步初始序列号；四次挥手因全双工需双方各自 FIN+ACK。\n\n【三次握手】\n1. C→S：SYN=1, seq=x；\n2. S→C：SYN=1, ACK=1, seq=y, ack=x+1；\n3. C→S：ACK=1, ack=y+1。\n\n【为什么三次】\n· 确认双方收发能力正常；\n· 同步双方初始序列号（两次只能确认客户端序列号）；\n· 防止已失效的历史连接请求突然到达导致错误建连。\n\n【四次挥手】\n1. 主动方→被动方：FIN（不再发数据）；\n2. 被动方→主动方：ACK（可能还有数据）；\n3. 被动方→主动方：FIN（发完了）；\n4. 主动方→被动方：ACK（进入 TIME_WAIT）。\n\n【为什么四次】TCP 全双工，双方各需 FIN+ACK，比握手多一次。\n\n【TIME_WAIT】主动关闭方等 2MSL，确保最后 ACK 到达、旧报文失效，避免污染新连接。\n\n【加分】能说第三次握手可携带数据；SYN 洪泛用 SYN Cookie 防御。',
      source: '大厂八股文（腾讯/字节）'
    },
    {
      id: 'net-002', category: 'network', tags: ['HTTP', '安全'], difficulty: 2,
      question: 'HTTP 和 HTTPS 的区别？HTTPS 的加密过程是怎样的？',
      answer: '一句话结论：HTTPS = HTTP + TLS，用非对称加密交换对称密钥，用对称加密传输数据，靠证书防中间人。\n\n【区别】\n1. 安全：HTTP 明文，HTTPS 加密（防窃听/篡改）；\n2. 端口：80 vs 443；\n3. 证书：HTTPS 需 CA 证书；\n4. 性能：HTTPS 需 TLS 握手略慢（可用会话复用优化）。\n\n【TLS 握手】\n1. ClientHello（加密套件、随机数）；\n2. ServerHello + 证书 + 随机数；\n3. 客户端验证证书，生成 pre-master，用服务端公钥加密发送；\n4. 双方由两个随机数 + pre-master 生成对称会话密钥；\n5. 之后用对称密钥（AES）加密通信。\n\n【核心思想】非对称（RSA/ECDHE）安全换密钥，对称（AES）高效传数据。\n\n【加分】能说 HTTPS 防中间人的关键是证书链 + 数字签名验证服务端身份。',
      source: '大厂八股文（腾讯/字节）'
    },
    {
      id: 'net-003', category: 'network', tags: ['传输层', '协议'], difficulty: 1,
      question: 'TCP 和 UDP 有什么区别？各自适用什么场景？',
      answer: '一句话结论：TCP 面向连接可靠有序，UDP 无连接快但不保证；可靠场景用 TCP，低延迟可容忍丢包用 UDP。\n\n【TCP】面向连接、可靠（校验和/序列号/ACK/重传）、字节流、有流量/拥塞控制、首部 20 字节。\n【UDP】无连接、不可靠、面向报文、无控制、首部 8 字节、快。\n\n【场景】\n· TCP：HTTP、文件传输、邮件等需可靠；\n· UDP：音视频、直播、DNS、游戏等求低延迟。\n\n【加分】能说 QUIC（HTTP/3）基于 UDP 实现可靠传输，兼顾可靠与低延迟。',
      source: '大厂八股文'
    },
    {
      id: 'net-004', category: 'network', tags: ['基础', '分层'], difficulty: 1,
      question: 'OSI 七层模型和 TCP/IP 四层模型分别是什么？',
      answer: '一句话结论：OSI 七层是理论模型，TCP/IP 四层是实际协议栈；数据从上层到下层不断封装。\n\n【OSI 七层】应用层→表示层→会话层→传输层→网络层→数据链路层→物理层。\n\n【TCP/IP 四层】\n1. 应用层：HTTP、HTTPS、DNS、FTP、SMTP；\n2. 传输层：TCP、UDP；\n3. 网络层：IP、ICMP、ARP；\n4. 网络接口层：以太网、MAC。\n\n【各层职责】应用层提供服务；传输层端到端（端口）；网络层路由寻址（IP）；链路层相邻节点（MAC）；物理层比特传输。\n\n【加分】能说"封装/解封装"：上层数据加头部逐层下沉，对端逐层解包。',
      source: '大厂八股文'
    },
    {
      id: 'net-005', category: 'network', tags: ['HTTP', '状态码'], difficulty: 1,
      question: '常见的 HTTP 状态码有哪些？分别代表什么含义？',
      answer: '一句话结论：2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。\n\n【2xx】200 OK、201 Created、204 No Content。\n【3xx】301 永久重定向、302 临时重定向、304 缓存未修改。\n【4xx】400 参数错误、401 未认证、403 无权限、404 不存在、429 请求过多。\n【5xx】500 内部错误、502 网关错误、503 服务不可用、504 网关超时。\n\n【加分】\n· 301 vs 302：永久 vs 临时，SEO 影响不同；\n· 304 配合协商缓存使用；\n· 502/504 常与上游服务/网关超时有关，是后端排查高频。',
      source: '大厂八股文'
    },

    {
      id: 'net-006', category: 'network', tags: ['HTTP', '协议'], difficulty: 3,
      question: 'HTTP/1.1、HTTP/2、HTTP/3 有什么区别？',
      answer: '一句话结论：1.1 文本+队头阻塞，2 二进制+多路复用，3 基于 QUIC(UDP) 彻底解决队头阻塞。\n\n【HTTP/1.1】持久连接、管线化（仍有队头阻塞）、文本协议、头部冗余。\n\n【HTTP/2】\n1. 二进制分帧；\n2. 多路复用：一个 TCP 连接并行多请求，解决 HTTP 层队头阻塞；\n3. 头部压缩（HPACK）；\n4. 服务器推送；\n5. 仍用 TCP，存在 TCP 层队头阻塞（丢包重传阻塞后续）。\n\n【HTTP/3】\n1. 基于 QUIC（UDP）：彻底解决队头阻塞；\n2. 连接建立更快（0-RTT/1-RTT）；\n3. 连接迁移：WiFi↔4G 不断连（基于连接 ID）；\n4. 内置 TLS 1.3，头部压缩用 QPACK。\n\n【演进主线】降延迟、提并发、解队头阻塞。\n\n【加分】能说 HTTP/2 通过 ALPN 协商启用；队头阻塞分 HTTP 层（2 已解决）和 TCP 层（3 才解决）。',
      source: '大厂八股文（字节/腾讯）'
    },
    {
      id: 'net-007', category: 'network', tags: ['认证', '会话'], difficulty: 2,
      question: 'Cookie、Session、Token（JWT）有什么区别？',
      answer: '一句话结论：Cookie 存浏览器、Session 存服务端、Token 存客户端且无状态；分布式和前后端分离多用 Token。\n\n【Cookie】浏览器端小文本，服务端 Set-Cookie 下发，随请求自动携带；约 4KB、同源策略。\n【Session】服务端会话数据，客户端只存 Session ID（放 Cookie）；服务端有状态，分布式需共享（Redis）。\n【Token（JWT）】服务端签发令牌，客户端存 header/本地，请求头携带；无状态，靠签名验证，适合分布式/微服务/移动端/跨域。\n\n【对比】\n· 存储：Cookie 浏览器 / Session 服务端 / Token 客户端；\n· 扩展：Session 差（需共享）、Token 好（无状态）；\n· 安全：Session 相对可控，Token 需防 XSS 泄露、无法主动失效（短过期+黑名单）。\n\n【选型】传统 Web 用 Cookie+Session；前后端分离、微服务、移动端用 Token。\n\n【加分】能说 JWT 三段结构（header.payload.signature）及无状态带来的失效难题。',
      source: '大厂八股文'
    },
    {
      id: 'net-008', category: 'network', tags: ['安全', 'CORS'], difficulty: 2,
      question: '什么是跨域？如何解决跨域问题（CORS）？',
      answer: '一句话结论：同源策略（协议+域名+端口相同）限制脚本跨源访问；CORS 靠服务端响应头放行。\n\n【CORS 响应头】\n1. Access-Control-Allow-Origin：允许来源（或 *）；\n2. Access-Control-Allow-Methods / -Headers；\n3. Access-Control-Allow-Credentials：允许携带 Cookie（此时 Origin 不能为 *）；\n4. Access-Control-Max-Age：预检缓存时间。\n\n【简单 vs 预检】\n· 简单请求（GET/POST 特定 Content-Type）：直接发；\n· 非简单（application/json、自定义头、PUT/DELETE）：先发 OPTIONS 预检，通过后再发实际请求。\n\n【其他方案】JSONP（仅 GET）、Nginx 反向代理、WebSocket、postMessage。\n\n【本质】跨域是浏览器安全限制，服务端之间调用无跨域问题。\n\n【加分】能说清预检请求 OPTIONS 的触发条件。',
      source: '大厂八股文'
    },
    {
      id: 'net-009', category: 'network', tags: ['TCP', '拥塞控制'], difficulty: 3,
      question: 'TCP 拥塞控制有哪些算法？拥塞窗口如何变化？',
      answer: '一句话结论：慢启动指数增长、拥塞避免线性增长、快重传+快恢复应对轻度拥塞；超时则回 1 重来。\n\n【四算法】\n1. 慢启动：cwnd 从 1 指数增长（每 ACK 翻倍）到 ssthresh；\n2. 拥塞避免：cwnd ≥ ssthresh 后线性增长（每 RTT +1）；\n3. 快重传：收 3 个重复 ACK 立即重传（不等超时）；\n4. 快恢复：快重传后 ssthresh 减半、cwnd=ssthresh，进拥塞避免。\n\n【超时 vs 快重传】\n· 超时（RTO）：严重拥塞，ssthresh 减半、cwnd=1，重慢启动；\n· 3 个重复 ACK：轻度拥塞，快重传+快恢复。\n\n【目标】吞吐最大化与避免拥塞崩溃平衡。\n\n【加分】能说现代算法 CUBIC（Linux 默认）、BBR（基于带宽/延迟估计），区别于传统丢包驱动。',
      source: '大厂八股文（字节/腾讯）'
    },
    {
      id: 'net-010', category: 'network', tags: ['HTTP', '基础'], difficulty: 1,
      question: 'GET 和 POST 有什么区别？',
      answer: '一句话结论：GET 查询、POST 提交；GET 参数在 URL（可缓存/幂等），POST 在请求体（不缓存/不幂等）。\n\n【区别】\n1. 参数位置：GET 在 URL 查询串，POST 在请求体；\n2. 长度：GET 受 URL 限制（约 2KB），POST 理论无限；\n3. 安全：GET 暴露在 URL/日志，POST 相对隐蔽（都需 HTTPS 加密）；\n4. 缓存/幂等：GET 可缓存、可收藏、幂等；POST 一般不缓存、不幂等。\n\n【本质】都是 HTTP 方法，底层无本质区别，区别在语义与默认处理。\n\n【加分】\n· 能说 PUT（幂等更新）、DELETE（幂等删除）、PATCH（部分更新）的语义；\n· 能说"POST 也可带 URL 参数，区别是约定而非强制"。',
      source: '大厂八股文'
    },

    {
      id: 'net-011', category: 'network', tags: ['DNS', '应用层'], difficulty: 2,
      question: 'DNS 的解析过程是怎样的？',
      answer: '一句话结论：浏览器缓存 → 系统 hosts → 本地 DNS 缓存 → 递归/迭代查询根、顶级、权威服务器，返回 IP。\n\n【解析流程】\n1. 查浏览器缓存；\n2. 查系统 hosts 文件；\n3. 查本地 DNS 服务器（递归查询）；\n4. 本地 DNS 迭代查询：根域名服务器 → 顶级域（.com）→ 权威域名服务器，逐级得到 IP；\n5. 返回结果并缓存。\n\n【递归 vs 迭代】递归：客户端只发一次，由服务器代查到底；迭代：服务器返回下一级地址，客户端继续查。\n\n【加分】\n· 能说 DNS 基于 UDP（默认 53 端口），大响应会转 TCP；\n· 能说 CDN 的 DNS 调度原理（按地域返回最近节点 IP）。',
      source: '大厂八股文'
    },
    {
      id: 'net-012', category: 'network', tags: ['TCP', '粘包'], difficulty: 3,
      question: '什么是 TCP 粘包和拆包？如何解决？',
      answer: '一句话结论：TCP 是字节流，无消息边界，多条消息可能粘在一起（粘包）或一条被拆分（拆包）；靠长度字段/定长/分隔符解决。\n\n【产生原因】\n· 粘包：发送数据小于缓冲区，多条小包一起发；接收端未及时读取；\n· 拆包：发送数据大于缓冲区剩余空间或 MSS，被拆分。\n\n【解决方案】\n1. 消息定长：固定长度，不足补齐；\n2. 长度字段：包头声明消息长度（最常用）；\n3. 分隔符：消息间加特殊分隔符。\n\n【应用】Netty 的 LengthFieldBasedFrameDecoder、HTTP 的 Content-Length 都是基于长度字段解决粘包拆包。\n\n【加分】能说 UDP 是面向报文有边界，不存在粘包问题。',
      source: '大厂八股文 / Netty'
    },
    {
      id: 'net-013', category: 'network', tags: ['安全', 'HTTPS'], difficulty: 3,
      question: '什么是中间人攻击？HTTPS 如何防止中间人攻击？',
      answer: '一句话结论：中间人攻击是攻击者截获并转发双方通信；HTTPS 靠 CA 证书链 + 数字签名验证服务端身份防止。\n\n【中间人攻击】攻击者伪装成服务端（或客户端），在双方之间窃听、篡改通信内容。\n\n【HTTPS 防护】\n1. 服务端向客户端出示由 CA 签发的证书；\n2. 客户端用内置的 CA 公钥验证证书的数字签名，确认证书真实有效；\n3. 验证域名与证书匹配；\n4. 通过后双方协商对称密钥加密通信，中间人无法解密。\n\n【为什么防得住】即使中间人转发通信，它无法伪造 CA 签名的证书，也无法解密对称加密的数据。\n\n【风险场景】用户手动信任了自签名证书、或证书被私钥泄露，中间人攻击仍可能成功。\n\n【加分】能说证书链验证（根证书 → 中间证书 → 站点证书）的信任传递机制。',
      source: '大厂八股文'
    },

    // ==================== 操作系统 ====================
    {
      id: 'os-001', category: 'os', tags: ['并发', '死锁'], difficulty: 2,
      question: '什么是死锁？产生死锁的四个必要条件以及如何避免？',
      answer: '一句话结论：死锁是多个进程互相等待对方持有的资源而永久阻塞；四条件（互斥/请求保持/不可剥夺/循环等待）同时满足才发生。\n\n【四必要条件】\n1. 互斥：资源只能被一个进程独占；\n2. 请求与保持：已持资源又请求新资源，不释放已有；\n3. 不可剥夺：已获资源不能被抢占；\n4. 循环等待：存在进程间循环等待链。\n\n【处理】\n· 预防：破坏任一条件（资源有序分配破坏循环等待、一次性申请破坏请求保持）；\n· 避免：银行家算法，分配前判断是否进入不安全状态；\n· 检测恢复：定期检测资源分配图是否有环，撤销/回滚进程；\n· 忽略：鸵鸟策略（多数系统采用，代价低）。\n\n【加分】能说数据库死锁：统一加锁顺序、缩短事务、设置超时；能举转账例子。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-002', category: 'os', tags: ['内存', '虚拟内存'], difficulty: 2,
      question: '什么是虚拟内存？分页和分段有什么区别？',
      answer: '一句话结论：虚拟内存给每个进程独立连续地址空间，经页表映射到物理内存；分页按固定大小、分段按逻辑单位。\n\n【虚拟内存好处】隔离进程、可运行大于物理内存的程序、内存共享、简化编程。\n\n【分页 Paging】固定大小页 + 页框，页表映射；无外部碎片、可能内部碎片、页表占内存。\n【分段 Segmentation】按逻辑段（代码/数据/栈）划分，段大小不固定；符合逻辑、便于共享保护、有外部碎片。\n\n【对比】分页是物理视角，分段是逻辑视角；现代系统用段页式结合。\n\n【相关】缺页中断、页面置换（LRU/FIFO）、快表 TLB 加速地址转换。\n\n【加分】能说 TLB（快表）缓存页表项，命中率高则大幅加速地址转换。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-003', category: 'os', tags: ['IPC', '并发'], difficulty: 2,
      question: '进程间通信（IPC）有哪些方式？',
      answer: '一句话结论：管道、消息队列、共享内存、信号量、信号、Socket 六种，共享内存最快但需同步。\n\n【六种方式】\n1. 管道 Pipe：半双工，父子/亲缘进程；有名管道可跨无关进程；\n2. 消息队列：消息链表，按类型读取，独立于进程；\n3. 共享内存：最快，多进程映射同一物理内存，需信号量同步；\n4. 信号量：PV 操作，进程同步互斥；\n5. 信号：异步通知（kill、Ctrl+C）；\n6. Socket：本机或跨主机通信。\n\n【加分】\n· 共享内存为什么最快？→ 无需内核拷贝、直接读写；\n· 线程间通信靠共享内存 + 锁/条件变量/信号量。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-004', category: 'os', tags: ['调度', '基础'], difficulty: 2,
      question: '什么是上下文切换？为什么频繁切换会影响性能？',
      answer: '一句话结论：CPU 切换任务时保存/加载现场（寄存器、PC、栈指针），是纯开销；频繁切换导致缓存失效、吞吐下降。\n\n【为什么影响性能】\n1. 切换本身是纯开销，不产生有效计算；\n2. 缓存失效：切换后重新加载 Cache/TLB，命中率下降；\n3. 切换开销占比升高，吞吐下降。\n\n【分类】\n· 进程切换：开销最大（切换地址空间）；\n· 线程切换：同进程共享地址空间，开销较小；\n· 协程切换：用户态，开销最小（只存少量寄存器）。\n\n【优化】减少锁竞争、合理设置线程池、避免频繁创建销毁线程。\n\n【加分】能说"上下文切换是并发编程的性能隐形成本"，线程池/协程本质是减少切换开销。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-005', category: 'os', tags: ['基础', '内核'], difficulty: 1,
      question: '用户态和内核态有什么区别？为什么要区分？如何切换？',
      answer: '一句话结论：用户态权限受限、内核态权限最高；区分为了保护系统安全与隔离错误；靠系统调用/异常/中断切换。\n\n【区别】\n· 用户态：运行用户程序，只能访问受限资源、执行普通指令；\n· 内核态：运行内核，可访问所有硬件、执行特权指令。\n\n【为什么区分】保护系统安全（防用户程序破坏资源）、隔离错误（用户程序崩溃不拖垮内核）。\n\n【切换三方式】\n1. 系统调用：用户程序主动请求内核服务（read/write），软中断/trap 进入；\n2. 异常：除零、缺页等触发；\n3. 中断：外部设备中断（磁盘 IO 完成）。\n\n【加分】能说每次系统调用有状态切换开销，故高频系统调用影响性能。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-006', category: 'os', tags: ['内存', '页面置换'], difficulty: 2,
      question: '常见的页面置换算法有哪些？',
      answer: '一句话结论：OPT 理想不可实现、FIFO 简单但有 Belady 异常、LRU 最常用效果好、Clock 是 LRU 的近似。\n\n【算法】\n1. 最优置换 OPT：淘汰未来最久不访问的页（理论最优，无法实现，作基准）；\n2. 先进先出 FIFO：淘汰最早进入的页；简单，但 Belady 异常（帧数增加缺页反而多）；\n3. 最近最久未使用 LRU：淘汰最久未访问的页，基于局部性，效果好；\n4. 最不常用 LFU：淘汰访问次数最少的页；\n5. 时钟 Clock（近似 LRU）：环形队列 + 访问位，扫描，访问位 0 淘汰、1 清零继续；实现成本低。\n\n【LRU 实现】哈希表 + 双向链表，O(1)。\n\n【加分】能说 Linux 用 Clock 变体；LRU 精确但实现成本高，Clock 兼顾性能与效果。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-007', category: 'os', tags: ['调度', '基础'], difficulty: 2,
      question: '常见的进程调度算法有哪些？各有什么特点？',
      answer: '一句话结论：FCFS 简单、SJF 平均等待最短但饥饿、RR 公平响应快、多级反馈队列综合最优。\n\n【算法】\n1. FCFS 先来先服务：公平简单，长作业阻塞短作业；\n2. SJF 短作业优先：平均等待最短，长作业饥饿、时间难预知；\n3. HRRN 高响应比优先：兼顾长短，减少饥饿；\n4. RR 时间片轮转：公平响应快，适合交互式；时间片过小切换开销大，过大退化 FCFS；\n5. 优先级调度：可能低优先级饥饿（用老化技术缓解）；\n6. 多级反馈队列：多队列 + 时间片，新进程高优先级，用不完降级；兼顾响应与吞吐，现代系统广泛采用。\n\n【加分】能说抢占式 vs 非抢占式；批处理/交互式/实时系统的关注点不同。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-008', category: 'os', tags: ['内存', '基础'], difficulty: 1,
      question: '内存泄漏和内存溢出有什么区别？如何排查？',
      answer: '一句话结论：泄漏是"该释放未释放"，溢出是"想申请申请不到"；泄漏是溢出的常见诱因。\n\n【内存泄漏】申请的内存不再使用但未释放，可用内存逐渐减少。\n· 原因：忘记释放、闭包持有引用、全局变量、未清理定时器/监听器、集合中对象未移除。\n\n【内存溢出 OOM】申请内存时系统无法提供足够内存，分配失败崩溃。\n· 原因：一次加载大量数据、死循环创建对象、泄漏累积、堆设置过小。\n\n【排查】\n1. 观察内存曲线是否持续上升；\n2. 生成堆转储分析大对象与引用链；\n3. 工具：Chrome DevTools Memory、MAT、JProfiler。\n\n【预防】及时释放、弱引用、避免无界缓存、规范生命周期。\n\n【加分】能说 GC 语言（Java/JS）也可能泄漏（缓存未清理、监听器未解绑）。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-009', category: 'os', tags: ['并发', 'IO'], difficulty: 2,
      question: '同步、异步、阻塞、非阻塞有什么区别？',
      answer: '一句话结论：同步/异步看"结果谁来通知"，阻塞/非阻塞看"等待时线程是否挂起"，是两组正交的概念。\n\n【同步/异步】\n· 同步：调用方主动等待结果返回才继续；\n· 异步：调用后立即返回，结果由被调用方回调/通知。\n\n【阻塞/非阻塞】\n· 阻塞：调用后线程挂起，数据就绪才返回；\n· 非阻塞：调用后立即返回，通过轮询/多路复用继续。\n\n【IO 四组合】\n1. 同步阻塞：BIO，线程阻塞等待；\n2. 同步非阻塞：NIO 轮询，不挂起但不断查；\n3. 异步阻塞：少见；\n4. 异步非阻塞：AIO，最优，回调通知。\n\n【典型】Nginx/Netty 用 IO 多路复用（select/poll/epoll），属同步非阻塞。\n\n【加分】能说 epoll 是事件驱动，就绪才通知，避免无效轮询。',
      source: '大厂八股文经典'
    },
    {
      id: 'os-010', category: 'os', tags: ['内存', '内核'], difficulty: 2,
      question: '操作系统如何管理内存？什么是内存碎片？',
      answer: '一句话结论：连续分配/分页/分段/段页式管理；内部碎片是分配多余部分，外部碎片是空闲不连续无法分配。\n\n【管理方式】\n1. 连续分配：单一连续、固定分区、动态分区（首次/最佳/最坏适应）；\n2. 分页：固定页 + 页表，无外部碎片；\n3. 分段：按逻辑段，有外部碎片；\n4. 段页式：结合两者，现代主流。\n\n【内存碎片】\n· 内部碎片：分配块大于需求，多余部分浪费（分页最后一页）；\n· 外部碎片：空闲内存被分割成不连续小块，无法满足大连续分配。\n\n【解决外部碎片】紧凑（压缩）合并空闲区（代价高）；分页机制（固定页避免外部碎片）。\n\n【加分】能说伙伴系统 Buddy System 按 2 的幂次拆分/合并空闲块，快速分配回收、减少外部碎片。',
      source: '大厂八股文经典'
    },

    {
      id: 'os-011', category: 'os', tags: ['IO', '多路复用', '高并发'], difficulty: 3,
      question: 'select、poll、epoll 有什么区别？',
      answer: '一句话结论：select 有 fd 上限且每次全量拷贝、poll 无上限但同样全量、epoll 基于事件驱动只返回就绪 fd，性能最优。\n\n【select】\n· fd 用数组，默认上限 1024；\n· 每次调用全量拷贝 fd 集合到内核，O(n) 遍历；\n· 返回后用户态再 O(n) 遍历找就绪 fd。\n\n【poll】\n· 用链表，无 fd 数量上限；\n· 仍每次全量拷贝、O(n) 遍历，性能随 fd 增多下降。\n\n【epoll】\n· 基于红黑树 + 就绪链表，注册一次，事件驱动；\n· 只返回就绪 fd，无需全量遍历，O(1) 获取就绪事件；\n· 支持 ET（边缘触发）/ LT（水平触发）两种模式。\n\n【对比】epoll 无 fd 上限、无全量拷贝、只返回就绪，适合高并发连接场景。\n\n【加分】能说 Nginx/Redis/Netty 都用 epoll（Linux）；macOS 用 kqueue。',
      source: '大厂八股文 / Linux'
    },
    {
      id: 'os-012', category: 'os', tags: ['IO', '零拷贝', '性能'], difficulty: 2,
      question: '什么是零拷贝？如何实现？',
      answer: '一句话结论：零拷贝减少 CPU 在用户态与内核态间的数据拷贝次数，提升 IO 性能；靠 mmap、sendfile 实现。\n\n【传统 IO 拷贝】读磁盘 → 内核缓冲区 → 用户缓冲区 → socket 缓冲区 → 网卡，共 4 次拷贝 + 4 次上下文切换。\n\n【零拷贝方案】\n1. mmap + write：用户空间映射内核缓冲区，省一次内核到用户的拷贝（3 次拷贝）；\n2. sendfile：数据在内核态直接从文件缓冲区到 socket 缓冲区，不经用户空间（2 次拷贝）；\n3. sendfile + DMA gather：配合 DMA 直接发网卡，最少 2 次 DMA 拷贝。\n\n【应用】Kafka 用 sendfile 高效发送日志、Nginx 用 sendfile 静态文件、Netty 等。\n\n【加分】能说零拷贝的核心是"避免数据在用户态与内核态间来回拷贝"。',
      source: '大厂八股文 / Kafka'
    },
    {
      id: 'os-013', category: 'os', tags: ['进程', 'Linux'], difficulty: 2,
      question: '什么是僵尸进程和孤儿进程？如何避免僵尸进程？',
      answer: '一句话结论：僵尸进程是子进程已结束但父进程未回收（占用 PCB），孤儿进程是父进程先结束被 init 接管。\n\n【僵尸进程 Zombie】\n· 子进程退出后，父进程未调用 wait/waitpid 回收，子进程残留进程表项；\n· 危害：占用 PID 和资源，大量积累导致无法创建新进程。\n\n【孤儿进程 Orphan】\n· 父进程先退出，子进程成为孤儿，被 init/systemd（PID 1）接管，由 init 负责回收。\n\n【避免僵尸进程】\n1. 父进程调用 wait/waitpid 回收；\n2. 忽略 SIGCHLD 信号；\n3. 两次 fork，让 init 接管孙进程。\n\n【排查】ps -ef 查看 Z 状态进程。\n\n【加分】能说僵尸进程无法被 kill（已死），只能等父进程回收或父进程退出。',
      source: '大厂八股文 / Linux'
    }
  ];

  // 合并所有扩充题库（按加载顺序拼接；各扩充文件挂载到 global.App 的不同键上）
  var EXTRA_BANKS = ['extraBank', 'fe2Bank', 'fe3Bank', 'fe4Bank', 'aiBank1', 'aiBank2', 'aiBank3', 'aiBank4', 'ai5Bank', 'be2Bank', 'be3Bank', 'al2Bank', 'al3Bank', 'db2Bank', 'db3Bank', 'net2Bank', 'net3Bank', 'os2Bank', 'os3Bank', 'sd1Bank'];
  for (var bi = 0; bi < EXTRA_BANKS.length; bi++) {
    var extra = global.App && global.App[EXTRA_BANKS[bi]];
    if (extra && extra.length) {
      QUESTIONS = QUESTIONS.concat(extra);
    }
  }

  // 工具：按 id 建索引、按分类取题
  var byId = {};
  var byCategory = {};
  QUESTIONS.forEach(function (q) {
    byId[q.id] = q;
    (byCategory[q.category] = byCategory[q.category] || []).push(q);
  });

  global.App = global.App || {};
  global.App.bank = {
    all: QUESTIONS,
    byId: byId,
    byCategory: byCategory,
    categories: function () {
      return global.App.config.CATEGORIES;
    }
  };
})(window);
