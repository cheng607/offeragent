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
