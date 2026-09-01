/**
 * OfferAgent · 结构化面试题库
 * 数据内嵌于 JS（避免 file:// 下 fetch 的 CORS 限制）。
 * 每题字段：id / category(分类id) / tags / difficulty(1简单2中等3困难) / question / answer / source
 * 挂载到全局命名空间 App.bank
 */
(function (global) {
  'use strict';

  var QUESTIONS = [
    // ==================== 前端 ====================
    {
      id: 'fe-001', category: 'frontend', tags: ['JavaScript', '作用域'], difficulty: 2,
      question: '什么是闭包（Closure）？它有哪些典型应用场景和注意事项？',
      answer: '闭包是指函数可以记住并访问其词法作用域（定义时所在的作用域）中的变量，即使该函数在其词法作用域之外执行。\n\n【形成原理】当内层函数引用外层函数的变量时，即使外层函数已执行完毕，被引用的变量仍会被保留在内存中（不会被垃圾回收），形成闭包。\n\n【典型应用】\n1. 数据私有化 / 模块封装（如计数器、单例）；\n2. 柯里化与偏函数；\n3. 防抖、节流的实现；\n4. 循环中保存每次迭代的变量（let 或 IIFE）。\n\n【注意事项】\n1. 可能导致内存泄漏：闭包引用的变量无法被回收，需在不需要时置空引用；\n2. 循环 + var 导致的经典问题（应改用 let 或立即执行函数）。',
      source: '高频面试题'
    },
    {
      id: 'fe-002', category: 'frontend', tags: ['JavaScript', '异步'], difficulty: 2,
      question: '说说事件循环（Event Loop）以及宏任务、微任务的区别。',
      answer: 'JavaScript 是单线程语言，靠事件循环（Event Loop）实现异步非阻塞。\n\n【执行流程】\n1. 同步代码进入调用栈（Call Stack）顺序执行；\n2. 遇到异步任务，交给对应线程处理（如定时器、网络请求），完成后回调进入任务队列；\n3. 调用栈清空后，事件循环不断从队列取任务执行。\n\n【宏任务 macroTask】script、setTimeout、setInterval、I/O、UI 渲染、setImmediate。\n【微任务 microTask】Promise.then/catch/finally、async/await、MutationObserver、queueMicrotask。\n\n【关键区别】每执行完一个宏任务后，会立即清空所有微任务队列，再进入下一个宏任务；微任务优先于下一个宏任务执行。\n\n【常见输出题】new Promise 内的同步代码立即执行，.then 回调进入微任务队列。',
      source: '高频面试题'
    },
    {
      id: 'fe-003', category: 'frontend', tags: ['浏览器', '网络'], difficulty: 2,
      question: '从输入 URL 到页面展示，浏览器经历了哪些过程？',
      answer: '1. 【DNS 解析】将域名解析为 IP 地址（浏览器缓存 → 系统缓存 → 路由器 → 递归查询）。\n2. 【建立连接】TCP 三次握手建立连接（HTTPS 还需 TLS 握手）。\n3. 【发送请求】构造 HTTP 请求并发送到服务器。\n4. 【服务器响应】服务器处理并返回响应（含状态码、响应体）。\n5. 【解析渲染】\n   - 解析 HTML 生成 DOM 树；\n   - 解析 CSS 生成 CSSOM 树；\n   - 两者合成 Render Tree（渲染树）；\n   - 布局（Layout/Reflow）计算几何信息；\n   - 绘制（Paint）与合成（Composite）显示到屏幕。\n6. 【连接关闭】四次挥手（HTTP/1.1 可复用连接）。\n\n【进阶】脚本与样式的加载会阻塞解析；async/defer 可优化 JS 加载。',
      source: '高频面试题'
    },
    {
      id: 'fe-004', category: 'frontend', tags: ['CSS', '布局'], difficulty: 1,
      question: '实现元素水平垂直居中的常用方式有哪些？',
      answer: '1. 【Flexbox】父容器 display:flex; justify-content:center; align-items:center。\n2. 【Grid】父容器 display:grid; place-items:center。\n3. 【绝对定位 + transform】子元素 position:absolute; left:50%; top:50%; transform:translate(-50%,-50%)。\n4. 【绝对定位 + margin 负值】已知宽高时 margin 设为负一半宽高。\n5. 【绝对定位 + margin:auto】子元素定位四边为 0 且 margin:auto（需固定宽高）。\n6. 【行内元素】父容器 text-align:center + line-height 等于高度（单行文本）。\n\n推荐优先使用 Flex/Grid，语义清晰且适配响应式。',
      source: '高频面试题'
    },
    {
      id: 'fe-005', category: 'frontend', tags: ['JavaScript', '性能'], difficulty: 2,
      question: '什么是防抖（debounce）和节流（throttle）？分别适用什么场景？',
      answer: '【防抖 debounce】在事件触发 n 秒后才执行，若 n 秒内再次触发则重新计时。\n- 适用：输入框搜索（等用户停止输入后再请求）、窗口 resize 结束后再计算、按钮防连点。\n- 核心：最后一次触发为准，只执行一次。\n\n【节流 throttle】在 n 秒内只执行一次，无论触发多少次。\n- 适用：滚动加载（scroll）、鼠标移动、拖拽、高频点击等需要"均匀限流"的场景。\n- 核心：固定时间间隔执行一次。\n\n【区别】防抖是"延迟执行、只执行最后"，节流是"规律地、固定频率执行"。\n\n【实现要点】防抖用 setTimeout + clearTimeout；节流可用时间戳或定时器实现。',
      source: '高频面试题'
    },
    {
      id: 'fe-006', category: 'frontend', tags: ['HTTP', '性能'], difficulty: 2,
      question: 'HTTP 缓存有哪些？强缓存与协商缓存的区别是什么？',
      answer: 'HTTP 缓存分为强缓存和协商缓存两类。\n\n【强缓存】（不发请求，直接用本地缓存）\n- 响应头 Cache-Control（HTTP/1.1，优先级高）：max-age、no-cache、no-store、public/private；\n- Expires（HTTP/1.0，绝对时间，受本地时间影响）。\n\n【协商缓存】（发请求，由服务器判断是否用缓存）\n- 返回 304 Not Modified 表示可继续用缓存，返回 200 表示返回新内容；\n- 两种实现：\n  1. Last-Modified / If-Modified-Since（基于时间，秒级精度，可能不准）；\n  2. ETag / If-None-Match（基于内容摘要，更精确，优先）。\n\n【流程】先判断强缓存是否命中 → 未命中则发请求 → 服务器通过协商缓存判断是否返回 304。\n\n【刷新行为】F5 刷新会跳过强缓存走协商缓存；Ctrl+F5 强制刷新跳过所有缓存。',
      source: '高频面试题'
    },

    {
      id: 'fe-007', category: 'frontend', tags: ['JavaScript', '原型'], difficulty: 3,
      question: '什么是原型链？JavaScript 如何实现继承？',
      answer: '【原型链】每个对象都有一个内部属性 [[Prototype]]（通过 __proto__ 访问，标准方法为 Object.getPrototypeOf），指向其原型对象；原型对象又有自己的原型，层层向上直到 Object.prototype（其原型为 null），形成一条"原型链"。访问对象属性时，若自身没有则沿原型链向上查找。\n\n【关键三角关系】\n- 构造函数有 prototype（原型对象）；\n- 原型对象有 constructor 指回构造函数；\n- 实例的 __proto__ 指向构造函数的 prototype。\n\n【继承实现方式】\n1. 原型链继承：Child.prototype = new Parent()；\n2. 构造函数继承：在子类中 Parent.call(this)；\n3. 组合继承（1+2）：最常用，但会调用两次父类构造；\n4. 寄生组合继承（最优）：Child.prototype = Object.create(Parent.prototype) 并修正 constructor；\n5. ES6 class extends（本质是寄生组合继承的语法糖，内部走 super 与原型链）。\n\n【补充】instanceof 就是沿原型链判断；hasOwnProperty 判断自身属性而非继承属性。',
      source: '高频面试题'
    },
    {
      id: 'fe-008', category: 'frontend', tags: ['JavaScript', '基础'], difficulty: 2,
      question: '浅拷贝和深拷贝有什么区别？如何实现深拷贝？',
      answer: '【浅拷贝】只复制对象的第一层，嵌套的引用类型仍共享同一引用（修改会互相影响）。\n实现：Object.assign({}, obj)、展开运算符 { ...obj }、数组 slice()/concat()。\n\n【深拷贝】递归复制所有层级，产生完全独立的对象（修改互不影响）。\n\n【实现方式】\n1. JSON 序列化：JSON.parse(JSON.stringify(obj))——简单但有局限（无法处理函数、undefined、Symbol、Date 会变字符串、RegExp、循环引用会报错、丢失原型）；\n2. 手写递归：遍历所有 key，递归复制，用 WeakMap 记录已拷贝对象解决循环引用；\n3. 第三方库：lodash.cloneDeep；\n4. structuredClone（现代浏览器原生 API，支持更多类型）。\n\n【手写要点】\nfunction deepClone(obj, map = new WeakMap()) {\n  if (obj === null || typeof obj !== \'object\') return obj;\n  if (map.has(obj)) return map.get(obj); // 处理循环引用\n  const res = Array.isArray(obj) ? [] : {};\n  map.set(obj, res);\n  for (const k in obj) res[k] = deepClone(obj[k], map);\n  return res;\n}',
      source: '高频面试题'
    },
    {
      id: 'fe-009', category: 'frontend', tags: ['性能', '优化'], difficulty: 2,
      question: '前端性能优化有哪些常用手段？',
      answer: '【加载阶段（减少资源体积与请求）】\n1. 代码压缩（JS/CSS 压缩、Tree Shaking 移除无用代码）；\n2. 图片优化（WebP/AVIF、懒加载 loading=lazy、响应式图片 srcset、CDN）；\n3. 静态资源走 CDN、开启 gzip/brotli 压缩、使用 HTTP/2；\n4. 合理拆分 chunk、路由懒加载（动态 import）；\n5. 利用浏览器缓存（强缓存 + 协商缓存）。\n\n【渲染阶段（提升首屏与交互）】\n1. 关键 CSS 内联、非关键 CSS 延迟加载；\n2. 脚本 async/defer 避免阻塞解析；\n3. 减少重排重绘（批量操作 DOM、用 transform 代替 top/left）；\n4. 虚拟列表处理长列表；\n5. 防抖节流减少高频事件触发；\n6. 预加载/预取（preload、prefetch、dns-prefetch）。\n\n【指标监控】用 Core Web Vitals：LCP（最大内容绘制）、FID/INP（交互延迟）、CLS（布局偏移）。\n\n【框架层面】React 用 memo/useMemo/useCallback、Vue 用 computed/缓存等避免不必要渲染。',
      source: '高频面试题'
    },
    {
      id: 'fe-010', category: 'frontend', tags: ['CSS', '布局'], difficulty: 2,
      question: '什么是 BFC（块级格式化上下文）？它有什么作用、如何触发？',
      answer: '【定义】BFC 是一块独立的渲染区域，内部元素的布局不影响外部元素，且容器内的浮动元素、外边距折叠等会形成独立的布局环境。\n\n【触发方式】\n1. 根元素 html；\n2. float 不为 none；\n3. position 为 absolute/fixed；\n4. overflow 不为 visible（hidden/auto/scroll）；\n5. display 为 inline-block、flow-root、flex、grid 等。\n\n【主要作用】\n1. 清除浮动（父元素形成 BFC 后能包裹浮动子元素，替代 clearfix）；\n2. 阻止外边距折叠（margin 合并）：两个相邻元素或父子元素间 margin 重叠时，用 BFC 隔开；\n3. 防止元素被浮动元素覆盖（BFC 区域不与 float 重叠，可用于两栏布局）。\n\n【最佳实践】现代常用 display: flow-root 或 overflow: hidden 来触发 BFC。\n\n【补充】外边距折叠只发生在普通流中（垂直方向），BFC 内外的 margin 不会折叠。',
      source: '高频面试题'
    },

    // ==================== 后端 ====================
    {
      id: 'be-001', category: 'backend', tags: ['操作系统', '并发'], difficulty: 2,
      question: '进程和线程的区别是什么？',
      answer: '【进程】是操作系统资源分配和调度的基本单位，拥有独立的地址空间、内存、文件描述符等资源。\n【线程】是 CPU 调度的基本单位，是进程内的执行单元，同一进程的线程共享进程的内存和资源。\n\n【主要区别】\n1. 资源：进程拥有独立资源，线程共享所属进程资源；\n2. 开销：进程创建/切换开销大，线程开销小；\n3. 隔离：进程间相互独立，一个进程崩溃不影响其他进程；线程间共享内存，一个线程崩溃可能拖垮整个进程；\n4. 通信：进程间通信需 IPC（管道、消息队列、共享内存等），线程间可直接读写共享内存。\n\n【补充】协程是更轻量的"用户态线程"，由程序自身调度，切换开销更小。',
      source: '高频面试题'
    },
    {
      id: 'be-002', category: 'backend', tags: ['MySQL', '索引'], difficulty: 2,
      question: 'MySQL 索引为什么用 B+ 树？它和 B 树、哈希索引有何区别？',
      answer: '【为什么用 B+ 树】\n1. 磁盘 IO 友好：B+ 树是多路平衡树，树高很低（千万级数据约 3 层），减少磁盘寻道；\n2. 范围查询高效：叶子节点通过链表有序连接，支持高效的范围扫描；\n3. 数据都在叶子节点，非叶子节点只存索引键，单节点能存更多键，进一步降低树高。\n\n【与 B 树区别】B 树每个节点都存数据，B+ 树只有叶子存数据，非叶子更"瘦"，且叶子有序成链，范围查询更优。\n\n【与哈希索引区别】哈希索引 O(1) 等值查询快，但不支持范围查询、排序，且存在哈希冲突；适合等值查询场景（如 MEMORY 引擎）。\n\n【补充】InnoDB 主键索引（聚簇索引）叶子存整行数据，二级索引叶子存主键值（需回表）。',
      source: '高频面试题'
    },
    {
      id: 'be-003', category: 'backend', tags: ['Redis', '缓存'], difficulty: 2,
      question: 'Redis 有哪些常见数据结构？分别适用哪些场景？',
      answer: '1. 【String 字符串】缓存对象、计数器、分布式锁（SETNX）、Session。\n2. 【List 列表】消息队列、最新消息列表、时间线。\n3. 【Hash 哈希】存储对象（如用户信息）、购物车。\n4. 【Set 集合】去重、共同好友、标签、抽奖（SRANDMEMBER）。\n5. 【ZSet 有序集合】排行榜、延时队列（score 为时间戳）、优先级队列。\n6. 【Bitmap】签到、布隆过滤器辅助、统计在线人数。\n7. 【HyperLogLog】海量数据 UV 统计（近似去重计数，省内存）。\n8. 【Geospatial】地理位置、附近的人。\n\n【补充】底层实现：String 用 SDS，List 用 quicklist，Hash/Set/ZSet 小数据量用 ziplist/listpack，ZSet 大数量用跳表。',
      source: '高频面试题'
    },
    {
      id: 'be-004', category: 'backend', tags: ['消息队列', '架构'], difficulty: 2,
      question: '消息队列有哪些作用？如何保证消息不丢失、不重复消费？',
      answer: '【作用】1. 削峰填谷（应对流量洪峰）；2. 解耦（系统间异步通信）；3. 异步处理（提升响应速度）；4. 最终一致性。\n\n【消息不丢失（三个环节）】\n1. 生产端：开启确认机制（confirm / ack），失败重试；\n2. Broker 端：持久化（如 Kafka 落盘、复制副本、ack=all）；\n3. 消费端：手动 ack，处理成功后再确认，失败不确认让消息重投。\n\n【不重复消费（幂等）】\n- 消费端做幂等处理：\n  1. 数据库唯一索引 / 唯一键约束；\n  2. Redis setnx 记录已消费消息 ID；\n  3. 业务状态机判断（已处理则跳过）；\n  4. 消息携带全局唯一 ID（如 UUID），消费前查重。\n\n【补充】还要考虑顺序消息、消息堆积等问题的处理方案。',
      source: '高频面试题'
    },
    {
      id: 'be-005', category: 'backend', tags: ['分布式', '并发'], difficulty: 3,
      question: '如何实现分布式锁？各方案有什么优缺点？',
      answer: '【方案一：Redis 分布式锁】\n- 使用 SET key value NX EX 过期时间（原子操作）；\n- value 用唯一标识，释放时用 Lua 脚本判断标识再删除，防止误删他人锁；\n- 优点：性能高、实现简单；\n- 缺点：非强一致（主从切换可能丢锁），可用 Redisson 红锁/看门狗续期增强。\n\n【方案二：ZooKeeper 分布式锁】\n- 基于临时顺序节点 + Watch 机制，节点最小序号者获得锁；\n- 优点：强一致、可靠（会话断开自动释放）；\n- 缺点：性能低于 Redis，依赖 ZooKeeper 集群。\n\n【方案三：数据库分布式锁】\n- 基于唯一索引插入记录，或 select for update；\n- 优点：简单、无需额外组件；\n- 缺点：性能差、易死锁、需处理锁超时。\n\n【选型】高并发、可容忍极小概率失效 → Redis；强一致要求高 → ZooKeeper。',
      source: '高频面试题'
    },

    {
      id: 'be-006', category: 'backend', tags: ['Redis', '缓存'], difficulty: 3,
      question: '什么是缓存穿透、缓存击穿、缓存雪崩？分别如何解决？',
      answer: '【缓存穿透】查询根本不存在的数据，缓存和数据库都没有，导致每次请求都打到数据库。\n- 解决：1. 缓存空值（null），设置较短过期时间；2. 布隆过滤器（Bloom Filter）提前拦截不存在的 key；3. 参数校验拦截非法请求。\n\n【缓存击穿】某个热点 key 在过期的瞬间，大量并发请求同时打到数据库。\n- 解决：1. 热点数据永不过期或逻辑过期；2. 加互斥锁（如 Redis setnx），只允许一个请求回源重建缓存，其余等待；3. 提前异步刷新热点缓存。\n\n【缓存雪崩】大量 key 在同一时间集中过期或缓存服务宕机，导致海量请求落到数据库。\n- 解决：1. 过期时间加随机值（打散过期点）；2. 多级缓存（本地缓存 + Redis）；3. 缓存高可用（主从/集群/哨兵）；4. 限流降级、熔断保护数据库。\n\n【总结】穿透=查无此数据；击穿=单点热点失效；雪崩=大面积同时失效。',
      source: '高频面试题'
    },
    {
      id: 'be-007', category: 'backend', tags: ['架构', '幂等'], difficulty: 2,
      question: '什么是接口幂等性？如何设计幂等接口？',
      answer: '【定义】幂等指同一个操作执行一次或多次，产生的效果相同（不会因重复请求造成副作用，如重复扣款、重复下单）。\n\n【为什么需要】网络重试、客户端重复点击、消息队列重复投递等都可能导致同一请求被多次执行。\n\n【设计方案】\n1. 数据库唯一索引：用业务唯一键（如订单号）建唯一索引，重复插入直接冲突拦截；\n2. 幂等表：请求前先查幂等表（以唯一请求 ID 为主键），已处理则直接返回结果；\n3. Redis 分布式锁：setnx 判断是否已处理（配合过期时间）；\n4. 状态机：业务状态流转校验（如已支付则不再扣款）；\n5. Token 机制：客户端先获取 token，提交时携带，服务端校验并删除 token（防重复提交）。\n\n【配合】全局唯一请求 ID（requestId）贯穿链路，是幂等判断的基础。\n\n【补充】GET/HEAD/PUT/DELETE 天然幂等，POST 需业务层保证幂等。',
      source: '高频面试题'
    },
    {
      id: 'be-008', category: 'backend', tags: ['架构', '高并发'], difficulty: 3,
      question: '如何设计一个高并发的秒杀系统？',
      answer: '秒杀的核心矛盾：瞬时流量洪峰 + 库存扣减一致性。设计要点：\n\n【前端/网关层】\n1. 静态资源 CDN，页面静态化；\n2. 按钮防重（置灰）、答题/验证码限流；\n3. 网关限流（令牌桶/漏桶）、Nginx 限流。\n\n【服务层】\n1. 请求削峰：消息队列（MQ）异步下单，服务端快速返回排队结果；\n2. 库存扣减用 Redis：预扣库存 + Lua 脚本保证原子性（判断库存 > 0 再扣）；\n3. 本地缓存 + 热点数据提前预热。\n\n【数据一致性】\n1. 乐观锁：UPDATE ... SET stock=stock-1 WHERE stock > 0（原子判断）；\n2. Redis 扣减成功后异步落库，最终一致；\n3. 超卖防护：库存扣减是唯一入口，扣到 0 即售罄。\n\n【其他】\n1. 限流降级：超过阈值直接返回"已售罄/请稍后再试"；\n2. 分库分表、读写分离扛住数据层压力；\n3. 监控告警，实时观察 QPS 与库存。\n\n【核心一句话】层层拦截 + 异步削峰 + 原子扣库存。',
      source: '高频面试题'
    },
    {
      id: 'be-009', category: 'backend', tags: ['分布式', '负载均衡'], difficulty: 2,
      question: '常见的负载均衡算法有哪些？各有什么特点？',
      answer: '1. 【轮询 Round Robin】依次分配，简单公平；加权轮询按权重分配，适配性能不同的机器。\n2. 【随机 Random】随机选择一台；加权随机同理。\n3. 【最少连接 Least Connections】分配给当前连接数最少的服务器，适合长连接场景；\n4. 【源地址哈希 IP Hash】对客户端 IP 哈希，同一 IP 始终打到同一台（会话保持），但机器增减会导致重映射；\n5. 【一致性哈希 Consistent Hash】哈希环 + 虚拟节点，机器增减只影响局部映射，适合分布式缓存（如 Redis 集群分片）。\n\n【实现层级】\n- 四层负载均衡（L4，传输层）：Nginx、LVS，基于 IP+端口转发；\n- 七层负载均衡（L7，应用层）：Nginx、HAProxy，基于 HTTP 内容路由（可按 URL 分发）。\n\n【选型】一般业务用加权轮询/最少连接；需要会话保持用 IP Hash；分布式存储用一致性哈希。',
      source: '高频面试题'
    },
    {
      id: 'be-010', category: 'backend', tags: ['并发', '一致性'], difficulty: 3,
      question: '高并发场景下如何保证数据一致性？',
      answer: '高并发下数据一致性需根据业务对一致性的要求（强一致/最终一致）选择策略：\n\n【单机/数据库层】\n1. 悲观锁：SELECT ... FOR UPDATE，先锁后改，强一致但并发低；\n2. 乐观锁：版本号 version 或 CAS（UPDATE ... SET x=x+1 WHERE version=?），冲突重试，并发高；\n3. 原子 SQL：UPDATE stock=stock-1 WHERE stock>0，一条语句保证原子。\n\n【分布式层】\n1. 分布式锁（Redis/ZK）串行化关键操作；\n2. 分布式事务：两阶段提交（2PC）、TCC（Try-Confirm-Cancel）、Saga、本地消息表 + 最终一致；\n3. 消息队列：异步解耦 + 幂等消费保证最终一致。\n\n【取舍原则（CAP）】\n- 强一致：牺牲可用性/性能（如 2PC、分布式锁）；\n- 最终一致：牺牲实时一致，换取高可用（如 MQ、异步对账）。\n\n【实践】核心资金用强一致（事务/悲观锁），非核心用最终一致（异步 + 对账补偿）；关键是用幂等 + 对账兜底。',
      source: '高频面试题'
    },

    // ==================== 算法 ====================
    {
      id: 'al-001', category: 'algorithm', tags: ['复杂度', '基础'], difficulty: 1,
      question: '什么是时间复杂度、空间复杂度？常见复杂度如何排序？',
      answer: '【时间复杂度】算法执行时间随输入规模 n 增长的趋势，用大 O 表示（关注最高阶、忽略常数与低阶）。\n【空间复杂度】算法运行所占额外内存随 n 增长的趋势。\n\n【常见排序（由快到慢）】\nO(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2^n) < O(n!)\n\n【常见算法复杂度举例】\n- 二分查找：O(log n)；\n- 遍历数组：O(n)；\n- 归并/快排（平均）：O(n log n)；\n- 冒泡/选择/插入：O(n²)；\n- 汉诺塔：O(2^n)。\n\n【补充】快排最坏 O(n²)（已有序时），随机化或三数取中可避免。',
      source: '高频面试题'
    },
    {
      id: 'al-002', category: 'algorithm', tags: ['排序', '基础'], difficulty: 2,
      question: '常见的排序算法有哪些？各自的稳定性与时间复杂度？',
      answer: '【稳定排序】（相等元素相对顺序不变）\n- 冒泡：O(n²)，稳定；\n- 插入：O(n²)，稳定（基本有序时接近 O(n)）；\n- 归并：O(n log n)，稳定，需 O(n) 额外空间；\n- 基数：O(d·n)，稳定。\n\n【不稳定排序】\n- 选择：O(n²)，不稳定；\n- 快速：平均 O(n log n)、最坏 O(n²)，不稳定；\n- 堆：O(n log n)，不稳定。\n\n【选择建议】\n- 小规模/基本有序 → 插入排序；\n- 需稳定且大数据 → 归并排序；\n- 通用、内存原地 → 快速排序；\n- 求 Top K → 堆排序。\n\n【补充】Java 中 Arrays.sort 对基本类型用双轴快排，对象用 TimSort（归并+插入混合）。',
      source: '高频面试题'
    },
    {
      id: 'al-003', category: 'algorithm', tags: ['查找', '基础'], difficulty: 1,
      question: '二分查找的实现思路、复杂度以及适用前提？',
      answer: '【思路】在有序数组中，每次取中间元素与目标比较：\n- 相等 → 找到；\n- 中间 < 目标 → 在右半区继续找；\n- 中间 > 目标 → 在左半区继续找；\n重复直至找到或区间为空。\n\n【复杂度】时间 O(log n)，空间 O(1)（迭代版）。\n\n【适用前提】\n1. 数据必须有序（或单调）；\n2. 支持随机访问（数组，链表不适合）；\n3. 静态或低频变更的数据。\n\n【易错点】\n1. 边界：while(left <= right) 与 left=mid+1/right=mid-1 要配套；\n2. 防溢出：mid = left + (right - left) / 2 而非 (left+right)/2；\n3. 变体：查找第一个/最后一个等于目标、查找第一个大于等于目标等。',
      source: '高频面试题'
    },
    {
      id: 'al-004', category: 'algorithm', tags: ['链表', '指针'], difficulty: 1,
      question: '如何反转一个单链表？（迭代与递归两种思路）',
      answer: '【迭代法】用三个指针 prev、cur、next 遍历：\n1. next = cur.next 暂存下一个节点；\n2. cur.next = prev 反转指向；\n3. prev = cur、cur = next 后移；\n4. 循环直至 cur 为空，prev 即新头节点。\n时间 O(n)、空间 O(1)。\n\n【递归法】\n1. 递归到最后一个节点作为新头；\n2. 回溯时 head.next.next = head、head.next = null 逐层反转。\n时间 O(n)、空间 O(n)（递归栈）。\n\n【示例（迭代伪码）】\nprev=null, cur=head\nwhile cur:\n    nxt = cur.next\n    cur.next = prev\n    prev = cur\n    cur = nxt\nreturn prev',
      source: '高频面试题'
    },
    {
      id: 'al-005', category: 'algorithm', tags: ['动态规划', '思想'], difficulty: 3,
      question: '动态规划的核心思想是什么？与贪心、分治有何区别？',
      answer: '【核心思想】把复杂问题分解为重叠子问题，通过保存子问题的解（记忆化 / 状态表）避免重复计算，自底向上递推得到最优解。\n\n【适用条件】1. 最优子结构；2. 无后效性；3. 子问题重叠。\n\n【解题步骤】\n1. 定义状态（dp[i] 表示什么）；\n2. 找状态转移方程；\n3. 确定初始值与边界；\n4. 确定计算顺序并填表。\n\n【与贪心区别】贪心每步做局部最优选择、不回退，不一定全局最优；DP 会考虑所有可能，保证全局最优（但代价更高）。\n\n【与分治区别】分治将问题划分为不相交的子问题（如归并排序）；DP 的子问题相互重叠。\n\n【经典例题】斐波那契、爬楼梯、背包问题、最长公共子序列、打家劫舍。',
      source: '高频面试题'
    },

    {
      id: 'al-006', category: 'algorithm', tags: ['数据结构', '基础'], difficulty: 1,
      question: '数组和链表的区别？各自适用什么场景？',
      answer: '【数组】内存中连续存储，支持通过下标 O(1) 随机访问。\n- 优点：随机访问快、缓存友好（局部性）；\n- 缺点：插入/删除需移动元素（O(n)），扩容需重新分配内存。\n\n【链表】节点分散存储，通过指针串联，每个节点存数据 + 指向下一节点的指针。\n- 优点：插入/删除 O(1)（已知节点位置）、无需连续内存、可动态扩展；\n- 缺点：无法随机访问（需遍历 O(n)）、额外指针占用内存、缓存不友好。\n\n【对比】\n- 访问：数组 O(1) vs 链表 O(n)；\n- 插入/删除：数组 O(n) vs 链表 O(1)（头/已知位置）；\n- 内存：数组连续 vs 链表分散。\n\n【适用场景】\n- 数组：频繁随机访问、元素数量固定的场景；\n- 链表：频繁插入删除（尤其头部）、数量动态变化、LRU 缓存实现等。',
      source: '高频面试题'
    },
    {
      id: 'al-007', category: 'algorithm', tags: ['数据结构', '栈队列'], difficulty: 1,
      question: '栈和队列的区别？如何用栈实现队列？',
      answer: '【栈 Stack】后进先出（LIFO），只在一端（栈顶）操作，push 入栈 / pop 出栈。\n- 应用：函数调用栈、括号匹配、表达式求值、DFS、浏览器前进后退。\n\n【队列 Queue】先进先出（FIFO），一端入队（enqueue）、另一端出队（dequeue）。\n- 应用：任务调度、消息队列、BFS、缓存淘汰（FIFO）。\n\n【用两个栈实现队列】\n- 维护 in 栈（入队）与 out 栈（出队）；\n- 入队：直接 push 到 in 栈；\n- 出队：若 out 栈非空则 pop；若为空，则把 in 栈所有元素依次弹出并压入 out 栈（反转顺序），再 pop out 栈。\n- 均摊时间复杂度 O(1)。\n\n【用两个队列实现栈】入栈 O(1) 到非空队列；出栈时把非空队列除最后一个外的元素移到另一个队列，弹出最后一个。\n\n【补充】还有双端队列（Deque，两端可进出）、优先队列（按优先级出队）。',
      source: '高频面试题'
    },
    {
      id: 'al-008', category: 'algorithm', tags: ['数据结构', '哈希'], difficulty: 2,
      question: '哈希表的原理是什么？哈希冲突如何解决？',
      answer: '【原理】通过哈希函数 hash(key) 将 key 映射到数组下标，实现 O(1) 平均时间的增删查。数组 + 哈希函数构成哈希表。\n\n【哈希冲突】不同 key 映射到相同下标。解决方法：\n\n1. 链地址法（拉链法）：每个槽位挂一个链表/红黑树，冲突元素链到同一下标（Java HashMap 采用，链表过长时转红黑树）；\n2. 开放寻址法：冲突时按探测序列找下一个空位（线性探测、二次探测、双重哈希）；ThreadLocal 用线性探测；\n3. 再哈希法：冲突时换另一个哈希函数重算；\n4. 公共溢出区：冲突元素统一放入溢出区。\n\n【扩容与重哈希】负载因子（元素数/容量）超过阈值（如 0.75）时扩容为约 2 倍并重新哈希所有元素。\n\n【好的哈希函数】计算快、分布均匀、减少冲突。\n\n【应用】去重、计数、缓存（LRU）、两数之和等。\n\n【补充】JDK HashMap 在链表长度≥8 且数组长度≥64 时转红黑树，降低最坏 O(n) 为 O(log n)。',
      source: '高频面试题'
    },
    {
      id: 'al-009', category: 'algorithm', tags: ['树', '遍历'], difficulty: 2,
      question: '二叉树的遍历方式有哪些？分别如何实现？',
      answer: '【深度优先 DFS】\n1. 前序遍历：根 → 左 → 右（递归或栈实现）；\n2. 中序遍历：左 → 根 → 右（对二叉搜索树 BST 可得有序序列）；\n3. 后序遍历：左 → 右 → 根（用于先处理子节点、删除树）。\n\n【广度优先 BFS】\n4. 层序遍历：逐层从左到右（用队列实现）。\n\n【实现】\n- 递归：DFS 三序都可用递归简洁实现（改变访问根的顺序）；\n- 迭代：前序/中序用显式栈模拟；后序可用"根右左"再反转；层序用队列逐层输出。\n\n【复杂度】时间 O(n)、空间 O(h)（递归栈深度，最坏 O(n)），层序空间 O(最大层宽)。\n\n【应用】前序用于序列化/复制树；中序用于 BST 排序；后序用于自底向上计算（如树高）；层序用于求树高、Z 字形遍历。\n\n【补充】已知前序+中序（或后序+中序）可唯一确定一棵二叉树，但前序+后序不能。',
      source: '高频面试题'
    },
    {
      id: 'al-010', category: 'algorithm', tags: ['滑动窗口', '双指针'], difficulty: 2,
      question: '什么是滑动窗口算法？适用于解决什么问题？',
      answer: '【思想】维护一个可伸缩的区间（窗口），用左右双指针表示窗口边界，通过移动/扩展窗口，在 O(n) 时间内解决与"连续子数组/子串"相关的问题，避免对每个子区间重复计算。\n\n【模板（求满足条件的最长子串/子数组）】\nleft = 0, right = 0\nwhile right < n:\n    加入 nums[right]\n    while 窗口不满足条件:\n        移除 nums[left]，left++\n    更新结果\n    right++\n\n【适用场景】\n1. 最长无重复字符子串；\n2. 最小覆盖子串（滑动窗口 + 哈希计数）；\n3. 长度最小的子数组（和 ≥ target）；\n4. 定长窗口（如长度为 k 的连续子数组）。\n\n【复杂度】每个元素至多被左右指针各访问一次，时间 O(n)、空间 O(字符集/哈希)。\n\n【要点】关键是判断"何时移动左边界收缩窗口"，通常配合哈希表统计窗口内字符/元素。\n\n【联系】滑动窗口本质是双指针的一种，常用于线性结构的连续区间问题。',
      source: '高频面试题'
    },

    // ==================== 数据库 ====================
    {
      id: 'db-001', category: 'database', tags: ['事务', 'ACID'], difficulty: 2,
      question: '什么是数据库事务？ACID 分别指什么？',
      answer: '事务是数据库操作的最小逻辑单元，要么全部成功、要么全部失败回滚，保证数据一致性。\n\n【ACID】\n1. 原子性 Atomicity：事务内的操作要么全部成功，要么全部回滚（undo log 实现）；\n2. 一致性 Consistency：事务执行前后数据都满足约束规则（由原子性+隔离性+持久性共同保证）；\n3. 隔离性 Isolation：并发事务之间互不干扰（由锁 + MVCC 实现）；\n4. 持久性 Durability：事务提交后对数据的修改永久生效，即使宕机也不丢失（redo log 实现）。\n\n【补充】隔离性与一致性存在权衡，隔离级别越低并发越高，但可能产生脏读、不可重复读、幻读。',
      source: '高频面试题'
    },
    {
      id: 'db-002', category: 'database', tags: ['MySQL', '事务'], difficulty: 3,
      question: '数据库事务隔离级别有哪些？分别解决什么问题？',
      answer: '【四种隔离级别（由低到高）】\n1. 读未提交 Read Uncommitted：可能脏读、不可重复读、幻读；\n2. 读已提交 Read Committed：解决脏读，仍有不可重复读、幻读（Oracle 默认）；\n3. 可重复读 Repeatable Read：解决脏读、不可重复读，仍有幻读（InnoDB 默认，靠 MVCC+间隙锁基本解决幻读）；\n4. 串行化 Serializable：全部解决，但并发最低、性能最差。\n\n【三类并发问题】\n- 脏读：读到其他事务未提交的数据；\n- 不可重复读：同一事务内多次读同一数据结果不一致（被其他事务修改提交）；\n- 幻读：同一事务内多次查询，结果集行数不一致（被其他事务插入/删除）。\n\n【实现】MVCC（多版本并发控制）+ 锁；隔离级别越高，锁越多、吞吐越低。',
      source: '高频面试题'
    },
    {
      id: 'db-003', category: 'database', tags: ['MySQL', '引擎'], difficulty: 2,
      question: 'MySQL 中 InnoDB 与 MyISAM 存储引擎有什么区别？',
      answer: '【InnoDB】（默认引擎）\n- 支持事务（ACID）、行级锁、外键；\n- 使用聚簇索引（主键索引叶子存整行数据）；\n- 支持 MVCC，并发读写性能好；\n- 崩溃后可通过 redo log 恢复，安全性高；\n- 适用于需要事务、高并发的业务。\n\n【MyISAM】\n- 不支持事务、外键，仅表级锁；\n- 使用非聚簇索引（索引与数据分离）；\n- 支持全文索引、压缩，读性能较好；\n- 不支持崩溃安全恢复；\n- 适用于只读、查询为主的历史/日志类场景（已逐渐被取代）。\n\n【补充】5.5 版本起 InnoDB 成为默认引擎；现在新项目基本默认 InnoDB。',
      source: '高频面试题'
    },
    {
      id: 'db-004', category: 'database', tags: ['MySQL', '索引'], difficulty: 3,
      question: '什么是索引失效？哪些情况会导致索引失效？',
      answer: '索引失效指 SQL 本可用索引却实际走了全表扫描或错误索引。常见场景：\n\n1. 对索引列使用函数或运算：WHERE YEAR(create_time)=2024 或 WHERE age+1=20；\n2. 隐式类型转换：字符串列与数字比较（如 phone=138...，会触发类型转换）；\n3. 前导模糊查询：LIKE \'%xx\'（% 在开头）；\n4. 违反最左前缀原则：联合索引 (a,b,c) 而 WHERE 只用了 b 或 c；\n5. 使用 OR 且部分列无索引（可能退化为全表）；\n6. 索引列使用 IS NULL / NOT IN / != 等（视优化器而定）；\n7. 数据量小或区分度低（优化器认为全表扫描更划算）。\n\n【排查】用 EXPLAIN 查看执行计划（type、key、rows、Extra）。\n【优化】改写 SQL、调整索引设计、覆盖索引减少回表。',
      source: '高频面试题'
    },
    {
      id: 'db-005', category: 'database', tags: ['MySQL', '优化'], difficulty: 2,
      question: '如何定位并优化一条慢查询 SQL？',
      answer: '【定位】\n1. 开启慢查询日志（slow_query_log、long_query_time）；\n2. 或用 show processlist、performance_schema 找出慢 SQL。\n\n【分析】用 EXPLAIN 查看执行计划，关注：\n- type：是否为 ALL（全表）需优化；\n- key：是否命中索引；\n- rows：扫描行数是否过大；\n- Extra：Using filesort / Using temporary 需优化。\n\n【优化手段】\n1. 加合适索引（覆盖索引、联合索引遵循最左前缀）；\n2. 改写 SQL：避免 SELECT *、避免函数作用于索引列、减少子查询改用 JOIN；\n3. 分页优化：大 offset 用"延迟关联"或 WHERE id > 上一页最大 id；\n4. 数据量过大考虑分库分表、读写分离；\n5. 必要时升级硬件 / 调整 buffer pool 等参数。',
      source: '高频面试题'
    },

    {
      id: 'db-006', category: 'database', tags: ['MySQL', '架构'], difficulty: 3,
      question: '什么是分库分表？有哪些分片策略？',
      answer: '【背景】单表数据量过大（如数千万级）导致查询变慢、写入压力大，需要拆分。\n\n【垂直拆分】\n- 垂直分库：按业务模块拆分到不同库（如用户库、订单库），降低库间耦合；\n- 垂直分表：按字段拆分（高频字段与低频/大字段分离），减少单行体积。\n\n【水平拆分（分片）】\n- 水平分库：按行拆分到多个库；\n- 水平分表：按行拆分到多张表（同库或跨库）。\n\n【分片策略】\n1. 范围分片：按时间/ID 区间（如按月分表），利于范围查询，但易热点；\n2. 哈希分片：对分片键取模或一致性哈希，分布均匀，但扩容需迁移数据；\n3. 按地理位置/业务分片：如按用户归属地。\n\n【带来的问题】\n1. 分布式 ID 生成（雪花算法）；\n2. 跨库 JOIN 困难（需冗余、应用层聚合）；\n3. 分布式事务、跨分片分页排序；\n4. 数据迁移与扩容复杂。\n\n【选型】优先单库优化（索引、缓存、读写分离），确实扛不住再分库分表。',
      source: '高频面试题'
    },
    {
      id: 'db-007', category: 'database', tags: ['MySQL', '高可用'], difficulty: 2,
      question: 'MySQL 主从复制的原理是什么？读写分离如何实现？',
      answer: '【主从复制流程】\n1. 主库将数据变更写入二进制日志 binlog；\n2. 从库的 IO 线程连接主库，将 binlog 拉取并写入中继日志 relay log；\n3. 从库的 SQL 线程读取 relay log 并重放，实现数据同步。\n\n【复制模式】\n1. 异步复制：主库不等待从库确认（默认，可能丢数据）；\n2. 半同步复制：至少一个从库确认收到后才提交（提升可靠性）；\n3. 全同步：所有从库确认（性能差，少见）。\n\n【作用】读写分离、数据备份、高可用（故障切换）。\n\n【读写分离】\n- 写操作走主库，读操作走从库，通过中间件（如 ShardingSphere、MyCat）或应用层路由实现；\n- 主从延迟问题：从库可能读到旧数据，需评估或强制走主库（如刚写入后立即读）。\n\n【延迟原因】主从是异步、单线程（或受限并行）重放，大事务/高并发会导致延迟；可用并行复制、半同步缓解。',
      source: '高频面试题'
    },
    {
      id: 'db-008', category: 'database', tags: ['设计', '范式'], difficulty: 2,
      question: '数据库三大范式（1NF/2NF/3NF）分别是什么？',
      answer: '【第一范式 1NF】属性不可再分（原子性），每列保持原子值，不能有嵌套表或重复组。\n\n【第二范式 2NF】在满足 1NF 基础上，消除非主属性对主键的部分依赖（即非主属性必须完全依赖整个主键，不能只依赖主键的一部分）。\n- 主要针对复合主键：如 (学号, 课程号) 主键，若"学生姓名"只依赖学号则违反 2NF。\n\n【第三范式 3NF】在满足 2NF 基础上，消除非主属性对主键的传递依赖（非主属性不能依赖其他非主属性）。\n- 如 学号 → 院系 → 院系主任，则"院系主任"传递依赖学号，违反 3NF，应拆分。\n\n【BCNF（3NF 加强）】消除主属性对候选键的部分/传递依赖。\n\n【总结】1NF 原子性 → 2NF 消除部分依赖 → 3NF 消除传递依赖。\n\n【反范式化】实际项目中为提升查询性能，常适度冗余、反范式化（用空间换时间），需权衡。',
      source: '高频面试题'
    },
    {
      id: 'db-009', category: 'database', tags: ['并发', '锁'], difficulty: 2,
      question: '乐观锁和悲观锁有什么区别？分别如何实现？',
      answer: '【悲观锁】假设会发生冲突，操作前先加锁，其他事务阻塞等待，操作完释放。\n- 实现：SELECT ... FOR UPDATE（行锁/表锁）、synchronized、数据库排它锁。\n- 优点：强一致，不会出现冲突；缺点：并发低、易死锁、锁等待影响性能。\n- 适用：写多读少、冲突频繁、强一致场景（如转账扣款）。\n\n【乐观锁】假设不会冲突，操作时不加锁，提交时校验版本是否变化，变了则重试或放弃。\n- 实现：版本号（version 字段）或时间戳：UPDATE ... SET x=x+1, version=version+1 WHERE version=?（影响行数为 0 则重试）；CAS 比较并交换。\n- 优点：无锁、并发高、吞吐好；缺点：冲突多时重试成本高，需处理重试逻辑。\n- 适用：读多写少、冲突少、可容忍重试场景（如库存扣减）。\n\n【对比】悲观锁"先锁后操作"（阻塞），乐观锁"先操作后校验"（重试）。\n\n【注意】乐观锁要保证 version 校验与更新是原子的（同一条 SQL），否则会有 ABA/并发问题。',
      source: '高频面试题'
    },
    {
      id: 'db-010', category: 'database', tags: ['MySQL', 'SQL'], difficulty: 1,
      question: 'SQL 中 JOIN 有哪些类型？各有什么区别？',
      answer: 'JOIN 用于根据关联条件连接多张表。常见类型：\n\n1. 【INNER JOIN 内连接】只返回两表都满足关联条件的行；\n2. 【LEFT JOIN 左连接】返回左表全部行，右表无匹配则补 NULL；\n3. 【RIGHT JOIN 右连接】返回右表全部行，左表无匹配则补 NULL；\n4. 【FULL OUTER JOIN 全外连接】返回两表全部行，无匹配补 NULL（MySQL 不直接支持，可用 LEFT JOIN UNION RIGHT JOIN 模拟）；\n5. 【CROSS JOIN 交叉连接】笛卡尔积（无关联条件，行数 = 两表行数乘积）。\n\n【注意】\n- LEFT/RIGHT JOIN 的过滤条件写在 ON 与 WHERE 效果不同：ON 在连接时生效，WHERE 在连接后过滤；\n- 多表 JOIN 要关注索引，避免笛卡尔积导致性能爆炸；\n- 隐式连接（逗号分隔 + WHERE）等价于 INNER JOIN，但不推荐。\n\n【性能】JOIN 大表时用小表驱动大表、关联字段建索引；必要时反范式化或分库分表避免跨库 JOIN。',
      source: '高频面试题'
    },

    // ==================== 计算机网络 ====================
    {
      id: 'net-001', category: 'network', tags: ['TCP', '传输层'], difficulty: 2,
      question: 'TCP 三次握手和四次挥手的过程是怎样的？为什么需要三次？',
      answer: '【三次握手】\n1. 客户端 → 服务端：SYN=1, seq=x；\n2. 服务端 → 客户端：SYN=1, ACK=1, seq=y, ack=x+1；\n3. 客户端 → 服务端：ACK=1, seq=x+1, ack=y+1。\n\n【为什么三次】\n- 三次握手能确认双方收发能力都正常，并同步初始序列号；\n- 防止已失效的历史连接请求突然到达服务端导致错误建立连接（两次无法判断）。\n\n【四次挥手】\n1. 主动方 → 被动方：FIN=1（我不再发数据）；\n2. 被动方 → 主动方：ACK（收到，可能还有数据要发）；\n3. 被动方 → 主动方：FIN=1（我发完了）；\n4. 主动方 → 被动方：ACK（确认，主动方进入 TIME_WAIT）。\n\n【为什么四次】因为 TCP 全双工，双方关闭需各自发送 FIN + ACK，故挥手比握手多一次。\n\n【TIME_WAIT】主动关闭方等待 2MSL，确保最后一个 ACK 到达、旧连接报文失效。',
      source: '高频面试题'
    },
    {
      id: 'net-002', category: 'network', tags: ['HTTP', '安全'], difficulty: 2,
      question: 'HTTP 和 HTTPS 的区别？HTTPS 的加密过程是怎样的？',
      answer: '【区别】\n1. 安全性：HTTP 明文传输，HTTPS 加密传输（防窃听、篡改）；\n2. 端口：HTTP 80，HTTPS 443；\n3. 证书：HTTPS 需要 CA 颁发的证书（需付费/申请）；\n4. 性能：HTTPS 需 TLS 握手，略慢（但有优化如 HTTP/2、会话复用）。\n\n【HTTPS = HTTP + TLS/SSL】\n\n【加密过程】\n1. 客户端发 ClientHello（支持的加密套件、随机数）；\n2. 服务端回 ServerHello + 证书 + 随机数；\n3. 客户端验证证书有效性，生成 pre-master secret，用服务端公钥加密发送；\n4. 双方根据两个随机数 + pre-master secret 生成对称会话密钥；\n5. 之后用对称密钥加密通信。\n\n【核心思想】非对称加密（RSA/ECDHE）用于安全交换对称密钥，对称加密（AES）用于实际数据传输（效率高）。',
      source: '高频面试题'
    },
    {
      id: 'net-003', category: 'network', tags: ['传输层', '协议'], difficulty: 1,
      question: 'TCP 和 UDP 有什么区别？各自适用什么场景？',
      answer: '【TCP】面向连接、可靠、面向字节流、有流量/拥塞控制、有序、首部较大，速度较慢。\n【UDP】无连接、不可靠、面向报文、无控制、可能乱序/丢包、首部小（8字节）、速度快。\n\n【对比表】\n- 连接：TCP 需建立连接，UDP 不需要；\n- 可靠性：TCP 保证可靠（重传、校验、排序），UDP 不保证；\n- 效率：UDP 更快、开销更低。\n\n【适用场景】\n- TCP：HTTP、文件传输、邮件等要求可靠传输的场景；\n- UDP：实时音视频、直播、DNS、游戏（可容忍少量丢包、追求低延迟）。\n\n【补充】可靠与速度是核心权衡；QUIC 协议基于 UDP 实现了可靠传输（HTTP/3 使用）。',
      source: '高频面试题'
    },
    {
      id: 'net-004', category: 'network', tags: ['基础', '分层'], difficulty: 1,
      question: 'OSI 七层模型和 TCP/IP 四层模型分别是什么？',
      answer: '【OSI 七层】\n7 应用层 → 6 表示层 → 5 会话层 → 4 传输层 → 3 网络层 → 2 数据链路层 → 1 物理层。\n\n【TCP/IP 四层（实际更常用）】\n1. 应用层：HTTP、HTTPS、DNS、FTP、SMTP；\n2. 传输层：TCP、UDP；\n3. 网络层：IP、ICMP、ARP；\n4. 网络接口层（链路层）：以太网、MAC。\n\n【各层职责】\n- 应用层：为应用程序提供网络服务；\n- 传输层：端到端通信（端口区分进程）；\n- 网络层：路由寻址、IP 定位主机；\n- 数据链路层：相邻节点间帧传输（MAC）；\n- 物理层：比特流的物理传输。\n\n【记忆】"应表会传网数物"；数据从上层到下层不断封装（加头部）。',
      source: '高频面试题'
    },
    {
      id: 'net-005', category: 'network', tags: ['HTTP', '状态码'], difficulty: 1,
      question: '常见的 HTTP 状态码有哪些？分别代表什么含义？',
      answer: '【1xx 信息】100 Continue。\n\n【2xx 成功】\n- 200 OK：请求成功；\n- 201 Created：创建成功；\n- 204 No Content：成功但无返回内容。\n\n【3xx 重定向】\n- 301 Moved Permanently：永久重定向；\n- 302 Found：临时重定向；\n- 304 Not Modified：资源未修改（走缓存）。\n\n【4xx 客户端错误】\n- 400 Bad Request：请求参数错误；\n- 401 Unauthorized：未认证；\n- 403 Forbidden：无权限；\n- 404 Not Found：资源不存在；\n- 429 Too Many Requests：请求过于频繁。\n\n【5xx 服务端错误】\n- 500 Internal Server Error：服务器内部错误；\n- 502 Bad Gateway：网关错误（上游异常）；\n- 503 Service Unavailable：服务不可用（过载/维护）；\n- 504 Gateway Timeout：网关超时。',
      source: '高频面试题'
    },

    {
      id: 'net-006', category: 'network', tags: ['HTTP', '协议'], difficulty: 3,
      question: 'HTTP/1.1、HTTP/2、HTTP/3 有什么区别？',
      answer: '【HTTP/1.1】\n- 支持持久连接（keep-alive）、管线化（但队头阻塞严重）；\n- 每次请求/响应一个 TCP 连接上串行处理；\n- 文本协议、头部冗余、无压缩。\n\n【HTTP/2】\n1. 二进制分帧：将数据拆分为二进制帧传输；\n2. 多路复用：一个 TCP 连接上并行传输多个请求/响应，解决队头阻塞；\n3. 头部压缩（HPACK）：压缩请求头，减少开销；\n4. 服务器推送（Server Push）：服务端可主动推送资源；\n5. 仍需 TCP，存在 TCP 层面的队头阻塞（丢包重传阻塞后续）。\n\n【HTTP/3】\n1. 基于 QUIC（UDP 之上）：彻底解决 TCP 队头阻塞；\n2. 更快的连接建立（0-RTT/1-RTT，减少握手）；\n3. 连接迁移：切换网络（WiFi→4G）连接不断（基于连接 ID 而非 IP+端口）；\n4. 内置 TLS 1.3，头部压缩用 QPACK。\n\n【演进主线】减少延迟、提升并发、解决队头阻塞。\n\n【补充】HTTP/2 通过 TLS 的 ALPN 协商启用；目前 HTTP/3 已广泛用于大型站点。',
      source: '高频面试题'
    },
    {
      id: 'net-007', category: 'network', tags: ['认证', '会话'], difficulty: 2,
      question: 'Cookie、Session、Token（JWT）有什么区别？',
      answer: '【Cookie】\n- 存储在浏览器端的小段文本，由服务端 Set-Cookie 下发，随请求自动携带；\n- 用于会话保持、记住登录态；有大小限制（约 4KB）、可设过期时间、同源策略。\n\n【Session】\n- 存储在服务端的会话数据，客户端只存 Session ID（通常放 Cookie）；\n- 服务端维护状态，安全性较好，但分布式环境下需共享 Session（如 Redis）；\n- 状态保存在服务端，服务重启/扩容需处理。\n\n【Token（如 JWT）】\n- 服务端签发的一串加密令牌，客户端存储（header/本地）并在请求头携带；\n- 无状态：服务端不存会话，靠签名验证，适合分布式/微服务、移动端、跨域；\n- 缺点：无法主动失效（除非配合黑名单/短过期）、体积较大。\n\n【对比】\n- 存储位置：Cookie 浏览器 / Session 服务端 / Token 客户端；\n- 扩展性：Session 差（需共享）、Token 好（无状态）；\n- 安全性：Session 相对更可控，Token 需防 XSS/泄露。\n\n【选择】传统 Web 用 Cookie+Session；前后端分离、微服务、移动端多用 Token。',
      source: '高频面试题'
    },
    {
      id: 'net-008', category: 'network', tags: ['安全', 'CORS'], difficulty: 2,
      question: '什么是跨域？如何解决跨域问题（CORS）？',
      answer: '【跨域】浏览器的同源策略（协议、域名、端口三者相同才算同源）限制了一个源的脚本访问另一个源的资源，违反即产生跨域。\n\n【CORS 跨域资源共享】服务端通过响应头允许跨域：\n1. Access-Control-Allow-Origin：允许的来源（或 *）；\n2. Access-Control-Allow-Methods：允许的方法；\n3. Access-Control-Allow-Headers：允许的请求头；\n4. Access-Control-Allow-Credentials：是否允许携带 Cookie（此时 Origin 不能为 *）；\n5. Access-Control-Max-Age：预检缓存时间。\n\n【简单请求 vs 预检请求】\n- 简单请求（GET/POST 且特定 Content-Type）：直接发送，服务端返回头即可；\n- 非简单请求（如 application/json、自定义头、PUT/DELETE）：先发 OPTIONS 预检，通过后才发实际请求。\n\n【其他方案】\n1. JSONP（仅 GET，利用 script 标签，已少用）；\n2. 反向代理（Nginx 同源转发）；\n3. WebSocket、postMessage（跨窗口）。\n\n【本质】跨域是浏览器安全限制，服务端之间调用无跨域问题。',
      source: '高频面试题'
    },
    {
      id: 'net-009', category: 'network', tags: ['TCP', '拥塞控制'], difficulty: 3,
      question: 'TCP 拥塞控制有哪些算法？拥塞窗口如何变化？',
      answer: '拥塞控制通过动态调整拥塞窗口（cwnd）避免网络过载。核心算法：\n\n1. 【慢启动 Slow Start】连接建立或超时后，cwnd 从 1 开始按指数增长（每收到 ACK 翻倍），直到达到慢启动阈值 ssthresh；\n2. 【拥塞避免 Congestion Avoidance】cwnd ≥ ssthresh 后，改为线性增长（每 RTT 加 1）；\n3. 【快重传 Fast Retransmit】收到 3 个重复 ACK 时，不等待超时立即重传丢失报文；\n4. 【快恢复 Fast Recovery】快重传后，ssthresh 减半、cwnd 设为 ssthresh，进入拥塞避免（而非慢启动）。\n\n【超时 vs 快重传】\n- 超时（RTO）：视为严重拥塞，ssthresh 减半、cwnd 回到 1，重新慢启动；\n- 3 个重复 ACK：视为轻度拥塞，走快重传+快恢复。\n\n【目标】在"吞吐最大化"与"避免拥塞崩溃"间平衡。\n\n【补充】还有显式拥塞通知 ECN、以及 BBR 等新型算法（基于带宽与延迟估计）。',
      source: '高频面试题'
    },
    {
      id: 'net-010', category: 'network', tags: ['HTTP', '基础'], difficulty: 1,
      question: 'GET 和 POST 有什么区别？',
      answer: '【语义】GET 用于获取/查询资源，POST 用于提交/创建数据。\n\n【主要区别】\n1. 参数位置：GET 参数在 URL 查询串，POST 在请求体；\n2. 长度限制：GET 受 URL 长度限制（浏览器约 2KB），POST 理论上无限制；\n3. 安全性：GET 参数暴露在 URL（历史记录、日志），POST 相对隐蔽（但都不真正加密，加密靠 HTTPS）；\n4. 缓存：GET 可被缓存、可收藏、幂等；POST 一般不缓存、不幂等；\n5. 数据类型：POST 支持更多类型（JSON、文件、二进制）。\n\n【幂等性】GET 是安全且幂等的（多次请求无副作用），POST 不幂等（可能产生副作用）。\n\n【本质】二者都是 HTTP 方法，底层无本质区别，POST 也可带 URL 参数；区别主要在语义与浏览器/服务端的默认处理。\n\n【补充】还有 PUT（更新，幂等）、DELETE（删除，幂等）、PATCH（部分更新）等，语义化使用更规范。',
      source: '高频面试题'
    },

    // ==================== 操作系统 ====================
    {
      id: 'os-001', category: 'os', tags: ['并发', '死锁'], difficulty: 2,
      question: '什么是死锁？产生死锁的四个必要条件以及如何避免？',
      answer: '死锁指多个进程因互相持有对方所需资源而陷入永久等待的状态。\n\n【四个必要条件（同时满足才可能死锁）】\n1. 互斥：资源只能被一个进程独占；\n2. 请求与保持：已持有资源又请求新资源，且不释放已有资源；\n3. 不可剥夺：已获得的资源不能被强制抢占；\n4. 循环等待：存在进程间的循环等待链。\n\n【预防（破坏任一条件）】\n- 破坏循环等待：资源统一排序，按序申请；\n- 破坏请求与保持：一次性申请所有资源。\n\n【避免】银行家算法：在分配前判断是否进入不安全状态，安全才分配。\n\n【检测与恢复】定时检测资源分配图是否有环，出现死锁则撤销/回滚进程。\n\n【鸵鸟策略】Linux/Windows 等多数系统选择忽略死锁，因为处理代价高且发生概率低。',
      source: '高频面试题'
    },
    {
      id: 'os-002', category: 'os', tags: ['内存', '虚拟内存'], difficulty: 2,
      question: '什么是虚拟内存？分页和分段有什么区别？',
      answer: '【虚拟内存】为每个进程提供独立的、连续的虚拟地址空间，通过地址映射将虚拟地址翻译为物理地址，使进程可使用比实际物理内存更大的空间，并实现内存隔离与保护。\n\n【分页 Paging】\n- 将内存划分为固定大小的页（page）与页框（frame）；\n- 通过页表映射虚拟页到物理页框；\n- 优点：无外部碎片、便于内存管理；缺点：可能产生内部碎片、页表占用内存。\n\n【分段 Segmentation】\n- 按逻辑单位（代码段、数据段、栈）划分不同大小的段；\n- 优点：符合程序逻辑、便于共享与保护；缺点：产生外部碎片。\n\n【对比】分页是物理视角、段是逻辑视角；现代系统常采用"段页式"结合两者。\n\n【相关】缺页中断、页面置换算法（LRU、FIFO、LFU）、快表 TLB 加速地址转换。',
      source: '高频面试题'
    },
    {
      id: 'os-003', category: 'os', tags: ['IPC', '并发'], difficulty: 2,
      question: '进程间通信（IPC）有哪些方式？',
      answer: '1. 【管道 Pipe】半双工字节流，父子/亲缘进程间通信（匿名管道）；有名管道可跨无关进程。\n2. 【消息队列 Message Queue】消息链表，支持按类型读取，独立于进程存在。\n3. 【共享内存 Shared Memory】最快的 IPC，多个进程映射同一块物理内存，需配合信号量同步。\n4. 【信号量 Semaphore】用于进程同步与互斥（PV 操作），控制对共享资源的访问。\n5. 【信号 Signal】异步通知（如 kill、Ctrl+C），用于异常通知。\n6. 【Socket】网络通信，可用于本机或跨主机进程间通信。\n\n【补充】共享内存最快但需同步；消息队列/管道由内核管理、可靠性好但慢于共享内存。\n\n【扩展】线程间通信主要靠共享内存（进程内），配合锁/条件变量/信号量同步。',
      source: '高频面试题'
    },
    {
      id: 'os-004', category: 'os', tags: ['调度', '基础'], difficulty: 2,
      question: '什么是上下文切换？为什么频繁切换会影响性能？',
      answer: '【上下文切换】CPU 从一个进程/线程切换到另一个时，需要保存当前任务的执行现场（寄存器、程序计数器、栈指针等），并加载新任务的现场，这一过程称为上下文切换。\n\n【为什么影响性能】\n1. 切换本身是纯开销：保存/恢复现场需要 CPU 时间，不产生任何有效计算；\n2. 缓存失效（Cache/TLB）：切换后新任务需重新加载缓存，导致缓存命中率下降；\n3. 频繁切换导致"上下文切换开销占比"升高，吞吐下降。\n\n【分类】\n- 进程切换：开销最大（需切换地址空间）；\n- 线程切换：同进程线程共享地址空间，开销较小；\n- 协程切换：用户态切换，开销最小（只保存少量寄存器）。\n\n【优化】减少锁竞争、合理设置线程池大小、避免无谓的线程创建/销毁。',
      source: '高频面试题'
    },
    {
      id: 'os-005', category: 'os', tags: ['基础', '内核'], difficulty: 1,
      question: '用户态和内核态有什么区别？为什么要区分？如何切换？',
      answer: '【定义】\n- 用户态：运行用户程序，权限受限，只能访问受限资源与执行普通指令；\n- 内核态：运行操作系统内核，拥有最高权限，可访问所有硬件与执行特权指令。\n\n【为什么区分】\n1. 保护系统安全：防止用户程序随意访问/破坏系统资源；\n2. 隔离错误：用户程序崩溃不会拖垮内核。\n\n【如何切换（三种方式）】\n1. 系统调用：用户程序主动请求内核服务（如 read、write），通过软中断/trap 进入内核态；\n2. 异常：如除零、缺页等异常触发进入内核态处理；\n3. 中断：外部设备中断（如磁盘 IO 完成）使 CPU 切换到内核态处理中断。\n\n【性能】每次系统调用都有状态切换开销（保存现场、切换栈），所以系统调用频率过高会影响性能。',
      source: '高频面试题'
    },
    {
      id: 'os-006', category: 'os', tags: ['内存', '页面置换'], difficulty: 2,
      question: '常见的页面置换算法有哪些？',
      answer: '当内存已满、需要换入新页时，页面置换算法决定淘汰哪个页面。常见算法：\n\n1. 【最优置换 OPT】淘汰未来最长时间不会被访问的页面（理想算法，无法实现，仅作理论基准）；\n2. 【先进先出 FIFO】淘汰最早进入的页面；实现简单，但可能出现 Belady 异常（分配帧数增加反而缺页更多）；\n3. 【最近最久未使用 LRU】淘汰最长时间未被访问的页面，基于"局部性原理"，效果好、最常用；\n4. 【最不常用 LFU】淘汰访问次数最少的页面；\n5. 【时钟算法 Clock（近似 LRU）】环形队列 + 访问位，指针扫描，访问位为 0 则淘汰、为 1 则清零继续，实现成本低。\n\n【实现对比】\n- LRU 精确但实现成本较高（链表/哈希）；\n- Clock 是 LRU 的近似，兼顾性能与效果，被 Linux 等采用。\n\n【评价指标】缺页率（缺页次数 / 访问次数）越低越好。\n\n【补充】现代系统还结合预读、工作集（Working Set）等策略。',
      source: '高频面试题'
    },
    {
      id: 'os-007', category: 'os', tags: ['调度', '基础'], difficulty: 2,
      question: '常见的进程调度算法有哪些？各有什么特点？',
      answer: '1. 【先来先服务 FCFS】按到达顺序调度；公平简单，但长作业会阻塞短作业（对短作业不利）。\n2. 【短作业优先 SJF/SPF】优先调度运行时间最短的作业；平均等待时间最短，但长作业可能"饥饿"、且运行时间难以预知。\n3. 【高响应比优先 HRRN】响应比 =（等待时间 + 运行时间）/ 运行时间，兼顾长短作业，减少饥饿。\n4. 【时间片轮转 RR】每个进程分配固定时间片，轮流执行；公平、响应快，适合交互式系统，但时间片过小切换开销大、过大退化为 FCFS。\n5. 【优先级调度 Priority】按优先级调度，可抢占或非抢占；可能产生低优先级饥饿（可用"老化"技术逐渐提升等待进程优先级）。\n6. 【多级反馈队列 Multilevel Feedback Queue】多个优先级队列 + 时间片，新进程进高优先级，用不完时间片降级；兼顾响应与吞吐，被现代系统广泛采用。\n\n【分类】抢占式 vs 非抢占式；批处理 vs 交互式 vs 实时系统的关注点不同。',
      source: '高频面试题'
    },
    {
      id: 'os-008', category: 'os', tags: ['内存', '基础'], difficulty: 1,
      question: '内存泄漏和内存溢出有什么区别？如何排查？',
      answer: '【内存泄漏 Memory Leak】程序申请的内存不再使用但未释放，导致可用内存逐渐减少。\n- 原因：忘记释放、闭包持有引用、全局变量、未清理的定时器/监听器、集合中对象未移除等。\n- 后果：长期运行内存持续增长，最终可能引发内存溢出。\n\n【内存溢出 Out Of Memory, OOM】程序申请内存时，系统无法提供足够内存（内存不足），导致分配失败、崩溃。\n- 原因：一次性加载大量数据、死循环创建对象、内存泄漏累积、JVM 堆设置过小等。\n\n【关系】内存泄漏是内存溢出的常见诱因之一，但两者不是一回事；泄漏是"该释放未释放"，溢出是"想申请申请不到"。\n\n【排查】\n1. 观察内存曲线是否持续上升；\n2. 生成堆转储（Heap Dump）分析大对象与引用链；\n3. 用分析工具（如 Chrome DevTools Memory、MAT、JProfiler）定位泄漏源。\n\n【预防】及时释放资源、弱引用、避免全局缓存无界增长、规范生命周期管理。',
      source: '高频面试题'
    },
    {
      id: 'os-009', category: 'os', tags: ['并发', 'IO'], difficulty: 2,
      question: '同步、异步、阻塞、非阻塞有什么区别？',
      answer: '这是两组不同维度的概念：同步/异步关注"调用方是否主动等待结果"，阻塞/非阻塞关注"调用后线程是否被挂起"。\n\n【同步 Synchronous】调用方发起请求后，主动等待结果返回才继续（结果由自己轮询/等待）；\n【异步 Asynchronous】调用方发起请求后立即返回，结果由被调用方通过回调/通知/事件返回（不等结果）。\n\n【阻塞 Blocking】调用后线程被挂起，直到数据准备好才返回（如阻塞 read）；\n【非阻塞 Non-blocking】调用后立即返回（无论数据是否就绪），通过轮询/多路复用继续处理（如非阻塞 read）。\n\n【组合（以 IO 为例）】\n1. 同步阻塞：经典 BIO，一次一个请求，线程阻塞等待；\n2. 同步非阻塞：NIO 轮询，线程不挂起但要不断查询；\n3. 异步阻塞：少见（如线程池 + 异步接口却阻塞等待）；\n4. 异步非阻塞：AIO，最优，回调通知（如 epoll + 事件驱动）。\n\n【典型模型】Nginx/Netty 用 IO 多路复用（select/poll/epoll）实现高并发，属于"同步非阻塞"IO 模型。\n\n【记忆】阻塞/非阻塞 = 等待时"干不干别的"；同步/异步 = 结果"谁来通知"。',
      source: '高频面试题'
    },
    {
      id: 'os-010', category: 'os', tags: ['内存', '内核'], difficulty: 2,
      question: '操作系统如何管理内存？什么是内存碎片？',
      answer: '【内存管理目标】分配与回收内存、地址转换（虚拟→物理）、内存保护与隔离、提高利用率。\n\n【管理方式】\n1. 连续分配：单一连续、固定分区、动态分区（首次适应/最佳适应/最坏适应算法）；\n2. 分页：固定大小页 + 页表，无外部碎片；\n3. 分段：按逻辑段划分，便于共享保护，有外部碎片；\n4. 段页式：段 + 页结合，现代系统主流。\n\n【内存碎片】\n- 内部碎片：分配的内存块大于实际需求，多出的部分浪费（如分页中最后一页未用完）；\n- 外部碎片：空闲内存被分割成许多不连续的小块，无法满足大的连续分配请求（如动态分区/分段）。\n\n【解决外部碎片】\n1. 紧凑（压缩）：移动已分配内存合并空闲区（代价高）；\n2. 分页机制：把内存分成固定页，避免外部碎片（这也是分页的重要优势）。\n\n【伙伴系统 Buddy System】Linux 用于管理物理页，按 2 的幂次拆分/合并空闲块，快速分配与回收、减少外部碎片。',
      source: '高频面试题'
    }
  ];

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
