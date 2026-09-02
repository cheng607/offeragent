/**
 * OfferAgent · 扩充题库（后端 · 第二批：be-021 ~ be-100）
 * 挂载到 global.App.be2Bank，由 bank.js 加载时合并。
 * 答案采用「一句话结论 + 完整解答」范式。
 */
(function (global) {
  'use strict';

  var BE2 = [
    {
      id: 'be-021', category: 'backend', tags: ['JVM', '内存'], difficulty: 2,
      question: 'JVM 运行时数据区包含哪些部分？各自作用是什么？',
      answer: `一句话结论：JVM 运行时内存分为线程共享的「堆 + 方法区（元空间）」和线程私有的「虚拟机栈 + 本地方法栈 + 程序计数器」五大部分。

【线程共享】
1. 堆 Heap：存放对象实例，GC 主战场，分新生代（Eden + 两个 Survivor）与老年代；
2. 方法区/元空间 Metaspace：存类元信息、常量、静态变量（JDK8 后移到本地内存）。

【线程私有】
3. 虚拟机栈：每个方法一个栈帧（局部变量表、操作数栈、动态链接、返回地址）；
4. 本地方法栈：服务 native 方法；
5. 程序计数器：记录当前字节码行号，线程切换后能回到正确位置。

【面试追问】栈溢出（StackOverflowError）与堆溢出（OOM）分别是什么？→ 递归过深/栈帧过多；堆对象无法回收。常量池在 JDK8 后放哪？→ 字符串常量池在堆中，类常量在元空间。`,
      source: '大厂八股文 / JVM'
    },
    {
      id: 'be-022', category: 'backend', tags: ['JVM', 'GC'], difficulty: 3,
      question: 'JVM 有哪些垃圾回收算法和垃圾回收器？CMS、G1、ZGC 有什么区别？',
      answer: `一句话结论：回收算法有「标记-清除、复制、标记-整理、分代收集」四种；回收器从 Serial/ParNew/Parallel 到 CMS，再到低延迟的 G1 与超低延迟的 ZGC。

【四大算法】
1. 标记-清除：有碎片；
2. 复制：无碎片但浪费空间，用于新生代；
3. 标记-整理：无碎片，用于老年代；
4. 分代收集：新生代复制、老年代标记整理。

【回收器对比】
· CMS：老年代并发收集，目标是低停顿，但有碎片、并发失败退化 Full GC；
· G1：把堆划分为 Region，可预测停顿时间，兼顾吞吐与延迟，默认回收器；
· ZGC：染色指针 + 读屏障，停顿时间控制在亚毫秒级，适合超大堆低延迟场景。

【避坑】不是 GC 越新越好，要看场景——吞吐优先选 Parallel，低延迟选 G1/ZGC。`,
      source: '大厂八股文 / JVM'
    },
    {
      id: 'be-023', category: 'backend', tags: ['JVM', '类加载'], difficulty: 2,
      question: '什么是类加载机制？双亲委派模型是什么？为什么要打破它？',
      answer: `一句话结论：类加载是「加载 → 连接（验证/准备/解析）→ 初始化」的过程；双亲委派指加载请求优先交给父加载器，避免核心类被篡改，保证类唯一性。

【类加载器层级】Bootstrap（核心库）→ Extension/Platform → Application（应用类）→ 自定义加载器。

【双亲委派流程】收到加载请求先委托父加载器，父无法加载才自己加载。

【为什么要打破】SPI 场景（如 JDBC 驱动）——核心类需要反向调用应用类，于是用「线程上下文类加载器」打破；Tomcat 为隔离不同 Web 应用的类也自定义加载器。

【避坑】判断两个类是否相同 = 类名 + 类加载器都相同。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-024', category: 'backend', tags: ['Java', '集合'], difficulty: 2,
      question: 'HashMap 的底层实现原理是什么？为什么线程不安全？',
      answer: `一句话结论：HashMap 底层是「数组 + 链表 + 红黑树」，通过 key 的 hash 定位桶下标，冲突用链地址法，链表过长（>8 且数组 ≥64）转红黑树。

【put 流程】hash(key) 扰动 → (n-1)&hash 定位下标 → 冲突则尾插链表/红黑树 → 超过阈值扩容（2 倍）。

【为什么线程不安全】
1. JDK7 头插法并发扩容会形成环形链表导致死循环（JDK8 已改尾插）；
2. 并发 put 会丢数据（两个线程同时覆盖同一桶）；
3. size 计数非原子，扩容时并发读写可能拿到错误数据。

【面试追问】负载因子默认 0.75 为什么？→ 时间与空间折中；容量为什么是 2 的幂？→ 便于位运算取模与均匀分布。

【避坑】并发场景用 ConcurrentHashMap，不要自己加锁包 HashMap。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-025', category: 'backend', tags: ['Java', '并发'], difficulty: 3,
      question: 'ConcurrentHashMap 是如何保证线程安全的？JDK7 和 JDK8 有什么区别？',
      answer: `一句话结论：JDK7 用「分段锁 Segment + ReentrantLock」，JDK8 改为「CAS + synchronized 锁单个桶」，锁粒度更细、并发度更高。

【JDK8 实现】
1. put 时先用 CAS 尝试插入空桶，失败则 synchronized 锁住该桶头节点；
2. 扩容时多线程协作迁移（transfer），每个线程负责一段；
3. 查询无锁（volatile 保证可见性），读性能高。

【对比】
· JDK7：Segment 数组，锁粒度到段，并发度受段数限制；
· JDK8：锁粒度到桶，红黑树优化，size 用 baseCount + CounterCell 分散计数。

【避坑】ConcurrentHashMap 的 key/value 都不允许为 null（与 HashMap 不同），因为并发下无法区分「不存在」和「值为 null」。`,
      source: '大厂八股文 / Java 并发'
    },
    {
      id: 'be-026', category: 'backend', tags: ['Java', '并发'], difficulty: 2,
      question: 'ThreadLocal 的原理是什么？会导致内存泄漏吗？',
      answer: `一句话结论：ThreadLocal 为每个线程保存一份独立副本，底层是 Thread 对象里的 ThreadLocalMap，key 是 ThreadLocal 的弱引用。

【原理】每个 Thread 维护一个 ThreadLocalMap，key 为 ThreadLocal 实例，value 为对应值；get/set 都操作当前线程自己的 map，天然线程隔离。

【内存泄漏】会。key 是弱引用（ThreadLocal 被 GC 后 key 变 null），但 value 是强引用仍被 Entry 持有，若线程是线程池里的长期存活线程，value 一直不释放 → 泄漏。

【解决】用完调用 remove()。

【应用】数据库连接、事务上下文、用户信息传递、SimpleDateFormat 复用。

【面试追问】为什么 key 用弱引用？→ 避免 ThreadLocal 本身无法被回收；但弱引用 key 也让 value 泄漏问题凸显，所以必须 remove。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-027', category: 'backend', tags: ['Java', '线程池'], difficulty: 3,
      question: '线程池的核心参数有哪些？任务提交后的执行流程是怎样的？',
      answer: `一句话结论：核心参数是核心线程数、最大线程数、存活时间、工作队列、线程工厂、拒绝策略；执行遵循「核心线程 → 队列 → 最大线程 → 拒绝」的顺序。

【七大参数】corePoolSize、maximumPoolSize、keepAliveTime、unit、workQueue、threadFactory、handler。

【执行流程】
1. 当前线程数 < core → 新建核心线程执行；
2. ≥ core 且队列未满 → 入队等待；
3. 队列已满且 < max → 新建非核心线程执行；
4. 达到 max → 走拒绝策略。

【四种拒绝策略】AbortPolicy（抛异常）、CallerRunsPolicy（调用者执行）、DiscardPolicy（丢弃）、DiscardOldestPolicy（丢弃最旧）。

【面试追问】核心线程数怎么定？→ CPU 密集：核数+1；IO 密集：核数×2 或核数/(1-阻塞系数)。为什么不允许用 Executors 创建？→ 无界队列会 OOM。`,
      source: '大厂八股文 / 线程池'
    },
    {
      id: 'be-028', category: 'backend', tags: ['Java', '并发'], difficulty: 3,
      question: 'synchronized 的锁升级过程是怎样的？',
      answer: `一句话结论：synchronized 锁会随竞争升级——「无锁 → 偏向锁 → 轻量级锁 → 重量级锁」，是 JVM 为减少加锁开销做的优化。

【升级过程】
1. 偏向锁：无竞争时标记线程 ID，同线程重入无需 CAS；
2. 轻量级锁：有竞争时用 CAS 把对象头替换为指向锁记录的指针，自旋等待；
3. 重量级锁：自旋失败后升级为重量级锁，线程阻塞挂起，由操作系统互斥量实现。

【对比】偏向锁省去 CAS；轻量级锁适合竞争不激烈（自旋）；重量级锁适合竞争激烈（阻塞）。

【对象头】Mark Word 记录锁标志位、hashCode、GC 分代年龄等，锁状态通过标志位区分。

【面试追问】偏向锁可以撤销吗？→ 可以，到达安全点且竞争时撤销。synchronized 是可重入吗？→ 是，Monitor 记录持有者与重入次数。`,
      source: '大厂八股文 / 并发'
    },
    {
      id: 'be-029', category: 'backend', tags: ['Java', '并发'], difficulty: 2,
      question: 'volatile 关键字的作用和原理是什么？它能保证原子性吗？',
      answer: `一句话结论：volatile 保证「可见性」和「禁止指令重排」，但不保证原子性；靠内存屏障（StoreLoad 等）实现。

【两大作用】
1. 可见性：写 volatile 变量会立即刷新到主内存，读会从主内存读（配合 MESI 缓存一致性协议）；
2. 有序性：通过内存屏障禁止特定指令重排。

【不能保证原子性】如 count++ 是「读-改-写」三步，volatile 无法阻止多线程同时执行，仍会丢更新；需要 CAS 或 synchronized。

【典型应用】单例双检锁的 instance 标记、状态标志位（如 stop 标志）、DCL 单例。

【面试追问】volatile 与 synchronized 区别？→ volatile 轻量、只保证可见性；synchronized 保证原子性+可见性+有序性但更重。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-030', category: 'backend', tags: ['设计模式', '并发'], difficulty: 2,
      question: '单例模式的双重检查锁（DCL）为什么必须加 volatile？',
      answer: `一句话结论：DCL 加 volatile 是为了禁止「实例化对象」时的指令重排，避免其他线程拿到「未初始化完成」的半成品对象。

【问题】new 对象并非原子操作，分三步：①分配内存 ②初始化对象 ③把引用指向内存。JVM 可能重排为 ①③②。

【后果】线程 A 执行到 ③ 还没执行 ② 时，线程 B 判断 instance != null，拿到一个未初始化完成的对象，可能 NPE。

【解决】instance 声明为 private static volatile Singleton，volatile 的内存屏障阻止 ②③ 重排。

【面试追问】还有哪些线程安全单例？→ 饿汉式（类加载即创建）、静态内部类（懒加载+线程安全）、枚举（防反射/序列化破坏）。`,
      source: '大厂八股文 / 设计模式'
    },
    {
      id: 'be-031', category: 'backend', tags: ['Spring', '框架'], difficulty: 2,
      question: 'Spring 的 IoC 和 AOP 分别是什么？实现原理是怎样的？',
      answer: `一句话结论：IoC（控制反转）把对象的创建与依赖交给容器管理，AOP（面向切面）通过动态代理把横切逻辑织入业务。

【IoC 原理】容器通过反射 + 配置文件/注解实例化 Bean，并完成依赖注入（DI）；核心是 BeanFactory/ApplicationContext，Bean 存于单例池。

【AOP 原理】基于动态代理：
1. 目标类有接口 → JDK 动态代理（Proxy + InvocationHandler）；
2. 无接口 → CGLIB 字节码生成子类代理。

【AOP 应用】事务、日志、权限、性能监控、缓存。

【面试追问】JDK 动态代理与 CGLIB 区别？→ JDK 基于接口、性能略高；CGLIB 基于继承、能代理无接口类，但 final 类/方法无法代理。Spring 如何选择？→ 默认 JDK，可强制 CGLIB。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-032', category: 'backend', tags: ['Spring', '框架'], difficulty: 3,
      question: 'Spring Bean 的生命周期是怎样的？',
      answer: `一句话结论：Bean 生命周期可概括为「实例化 → 属性注入 → 各种 Aware/后处理器 → 初始化 → 使用 → 销毁」。

【完整流程】
1. 实例化：构造器/工厂创建对象；
2. 属性填充：依赖注入；
3. Aware 接口回调：BeanNameAware、BeanFactoryAware、ApplicationContextAware；
4. BeanPostProcessor 前置处理（postProcessBeforeInitialization）；
5. 初始化：@PostConstruct / InitializingBean.afterPropertiesSet / init-method；
6. BeanPostProcessor 后置处理（postProcessAfterInitialization，AOP 在此生成代理）；
7. 使用；
8. 销毁：@PreDestroy / DisposableBean.destroy / destroy-method。

【加分】能说出 BeanPostProcessor 是 AOP 和很多扩展点（如 @Autowired 的 AutowiredAnnotationBeanPostProcessor）的核心。`,
      source: '大厂八股文 / Spring'
    },
    {
      id: 'be-033', category: 'backend', tags: ['Spring', '事务'], difficulty: 3,
      question: 'Spring 事务有哪些失效的场景？',
      answer: `一句话结论：Spring 事务失效的根因通常是「没走代理」或「异常没被正确识别」，常见有自调用、非 public、异常被吞、传播行为配置错等。

【高频失效场景】
1. 同类内部自调用：this.method() 不经过代理，事务失效（解决：注入自身代理或用 AspectJ）；
2. 方法非 public：@Transactional 只对 public 生效（CGLIB 代理限制）；
3. 异常被 try-catch 吞掉：事务感知不到异常不回滚；
4. 抛出受检异常（checked）：默认只对 RuntimeException 和 Error 回滚，需指定 rollbackFor；
5. 传播行为配置错误（如 PROPAGATION_NOT_SUPPORTED 挂起事务）；
6. 数据库引擎不支持事务（如 MyISAM）。

【避坑】@Transactional 必须作用于 public 方法且通过代理调用；异步方法（@Async）事务不生效。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-034', category: 'backend', tags: ['MyBatis', '缓存'], difficulty: 2,
      question: 'MyBatis 的一级缓存和二级缓存有什么区别？',
      answer: `一句话结论：一级缓存是 SqlSession 级别、默认开启、无需配置；二级缓存是 Mapper 级别、跨 SqlSession 共享、需手动开启。

【一级缓存】
· 作用域：SqlSession（一次会话），默认开启不可关闭；
· 原理：查询结果缓存在本地，同一 SqlSession 内相同 SQL 直接返回缓存；
· 失效：执行增删改、commit、rollback、clearCache 时清空。

【二级缓存】
· 作用域：namespace（Mapper），跨 SqlSession 共享；
· 开启：配置 cacheEnabled=true + 在 mapper.xml 加 <cache/> 标签；
· 要求：POJO 需实现 Serializable；
· 问题：脏数据（多表关联、分布式下不一致），生产环境慎用，更推荐 Redis 集中缓存。

【避坑】一级缓存可能读到「旧数据」——同一个 SqlSession 中先查再改再查，第二次仍返回缓存旧值。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-035', category: 'backend', tags: ['Kafka', '消息队列'], difficulty: 3,
      question: 'Kafka 为什么能做到高性能、高吞吐？',
      answer: `一句话结论：Kafka 靠「顺序写磁盘 + 页缓存 + 零拷贝 + 批量/压缩 + 分区并行」实现百万级吞吐。

【核心设计】
1. 顺序写：消息追加到日志末尾，避免随机 IO，磁盘顺序写接近内存速度；
2. 页缓存（Page Cache）：读写都走操作系统页缓存，命中内存；
3. 零拷贝：sendfile 直接把数据从页缓存发到网卡，减少用户态拷贝；
4. 分区并行：topic 分多 partition，水平扩展、并行读写；
5. 批量与压缩：producer 批量发送 + 消息压缩（gzip/snappy/lz4）。

【对比】相比 RabbitMQ（内存型、偏事务性消息），Kafka 定位是高吞吐日志流。

【面试追问】为什么分区过多有副作用？→ 打开文件句柄多、leader 选举开销大、端到端延迟增加。`,
      source: '大厂八股文 / Kafka'
    },
    {
      id: 'be-036', category: 'backend', tags: ['Kafka', '消息队列'], difficulty: 3,
      question: 'Kafka 如何保证消息不丢失？又如何处理重复消费？',
      answer: `一句话结论：不丢失需在「生产端、Broker、消费端」三段分别保证（ack 机制 + 副本 + 手动提交）；重复消费靠幂等来兜底。

【保证不丢失】
1. 生产端：ack=all（或 -1）+ retries 重试，确保写入所有副本；
2. Broker：min.insync.replicas≥1 + replication.factor≥3，避免 leader 挂时丢数据；
3. 消费端：关闭自动提交（enable.auto.commit=false），处理完再手动 commit offset。

【重复消费】「至少一次」语义下难免重复，解决方案是业务幂等：
1. 唯一键去重（数据库唯一索引）；
2. 幂等表 + 事务；
3. Redis setnx 去重。

【面试追问】exactly-once 能做到吗？→ 生产端可用幂等 producer（PID + 序号），端到端精确一次靠 Kafka Streams 的事务；但一般业务用「至少一次 + 幂等」更实用。`,
      source: '大厂八股文 / Kafka'
    },
    {
      id: 'be-037', category: 'backend', tags: ['Kafka', '消息队列'], difficulty: 2,
      question: 'Kafka 的 ISR 机制是什么？leader 和 follower 如何协作？',
      answer: `一句话结论：ISR（In-Sync Replicas）是与 leader 保持同步的副本集合，只有 ISR 中的副本才有资格被选为新 leader，从而保证数据不丢。

【副本机制】每个分区有 1 个 leader + 多个 follower，读写都走 leader，follower 从 leader 拉取同步。

【ISR】同步副本集合，满足「落后在一定阈值内」的 follower 才会留在 ISR；落后太多会被踢出。

【选举】leader 挂后，从 ISR 中选新 leader（优先 AR 列表第一个）；若 ISR 为空，按配置决定是否允许选 unclean 副本（可能丢数据）。

【配置】replication.factor、min.insync.replicas 决定可用性与一致性权衡。

【避坑】min.insync.replicas 设 1 且 ack=all 仍可能丢数据，实际至少设 2。`,
      source: '大厂八股文 / Kafka'
    },
    {
      id: 'be-038', category: 'backend', tags: ['消息队列'], difficulty: 2,
      question: 'RabbitMQ 和 Kafka 如何选型？各自适用什么场景？',
      answer: `一句话结论：RabbitMQ 适合低延迟、复杂路由、需 ACK/事务的「业务消息」；Kafka 适合高吞吐、日志流、大数据管道的「流处理」。

【RabbitMQ】
· 优点：功能全（路由、延迟队列、死信）、低延迟、AMQP 标准；
· 缺点：吞吐相对低、消息堆积性能下降；
· 场景：订单、通知、任务分发等业务解耦。

【Kafka】
· 优点：超高吞吐、消息可重放、分区有序、生态完善；
· 缺点：延迟略高、路由简单；
· 场景：日志采集、埋点、流计算、事件溯源。

【面试追问】要保证消息严格顺序怎么选？→ Kafka 单分区内有序；RabbitMQ 单队列单消费者有序。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-039', category: 'backend', tags: ['消息队列'], difficulty: 2,
      question: '消息堆积（消费不过来）如何解决？',
      answer: `一句话结论：消息堆积的本质是「生产速度 > 消费速度」，解决方向是提升消费能力、临时扩容、或转储。

【解决手段】
1. 提升消费性能：优化消费逻辑（批量、异步、减少 DB 交互）；
2. 增加消费者：提高并发度（Kafka 增加分区+消费者实例，注意分区数限制）；
3. 临时应急：新建临时 topic 扩容分区，把堆积消息转移到新 topic 消费；
4. 丢弃/降级：对可丢弃的日志类消息直接跳过；
5. 从源头限流：生产者降速。

【排查】先看是「消费者慢」还是「分区不够」。RabbitMQ 可增加 prefetch 并发；Kafka 提高 max.poll.records 和消费线程。

【避坑】盲目加消费者实例无用——Kafka 一个分区只能被一个消费者消费，分区数是并发上限。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-040', category: 'backend', tags: ['分布式', '事务'], difficulty: 3,
      question: '分布式事务有哪些解决方案？2PC、TCC、Saga 各有什么特点？',
      answer: `一句话结论：分布式事务方案从强一致到最终一致演进，主要有 2PC/3PC、TCC、本地消息表、可靠消息最终一致、Saga 等。

【2PC/3PC】协调者两/三阶段提交，强一致但同步阻塞、协调者单点、性能差；3PC 加超时机制缓解阻塞。

【TCC】Try-Confirm-Cancel，业务自己实现预留/确认/取消，侵入性强但对业务可控，如转账冻结余额。

【本地消息表】本地事务里写业务 + 消息表，后台重试投递 MQ，保证最终一致。

【可靠消息】事务消息（如 RocketMQ 半消息）确保本地事务与消息发送一致。

【Saga】长事务拆成多个本地事务，失败走补偿，适合流程长、无法用 TCC 的场景。

【避坑】选型核心是「一致性要求 vs 性能/侵入性」的权衡，绝大多数互联网场景用最终一致。`,
      source: '大厂八股文 / 分布式事务'
    },
    {
      id: 'be-041', category: 'backend', tags: ['分布式', '一致性'], difficulty: 3,
      question: 'Raft 和 Paxos 协议分别是什么？Raft 如何选举和复制日志？',
      answer: `一句话结论：Paxos 是分布式一致性的经典算法但难懂难实现，Raft 通过「强 leader + 日志复制 + 任期」把一致性问题拆成可理解的三部分。

【Raft 核心】
1. Leader 选举：节点随机超时触发选举，得票过半成为 leader（任期 term 递增）；
2. 日志复制：客户端写请求只发给 leader，leader 把日志复制到多数派 follower 后提交；
3. 安全性：只有包含最新日志的节点才能当选 leader。

【与 Paxos 对比】Paxos 允许多个提议者、复杂；Raft 单一 leader、易实现，被 etcd、TiKV、Consul 广泛采用。

【面试追问】脑裂如何避免？→ 靠「多数派」原则，旧 leader 在少数派分区里无法提交日志。`,
      source: '大厂八股文 / 一致性协议'
    },
    {
      id: 'be-042', category: 'backend', tags: ['分布式', '算法'], difficulty: 2,
      question: '什么是一致性哈希？它如何解决分布式缓存扩缩容问题？',
      answer: `一句话结论：一致性哈希把节点和 key 都映射到同一个哈希环上，key 顺时针找最近的节点，节点增删时只影响相邻一小段，大幅减少缓存失效。

【原理】哈希环 0~2^32-1；节点经 hash 落到环上，key 也 hash 到环上，顺时针找第一个节点存储。

【解决扩缩容】普通取模（hash%N）在节点数变化时几乎所有 key 重映射；一致性哈希只影响变更节点相邻区间，其余 key 不动。

【虚拟节点】节点少时哈希环分布不均（数据倾斜），给每个真实节点映射多个虚拟节点均匀散布环上。

【应用】Redis Cluster（哈希槽）、Memcached 客户端、Dubbo 负载均衡、CDN。

【面试追问】一致性哈希能完全避免数据迁移吗？→ 不能，只是减少；迁移过程仍需考虑缓存重建/双写。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-043', category: 'backend', tags: ['Redis', '高可用'], difficulty: 2,
      question: 'Redis 的主从复制和哨兵（Sentinel）机制是怎样的？',
      answer: `一句话结论：主从复制实现数据冗余与读写分离，哨兵实现自动故障转移（主挂自动选新主），两者结合保证 Redis 高可用。

【主从复制】从节点通过 psync 同步主节点数据：首次全量（RDB）+ 后续增量（repl_backlog 偏移量）。

【哨兵 Sentinel】
1. 监控：定时 PING 主从节点；
2. 主观/客观下线：多数哨兵认为主下线 → 客观下线；
3. 选主：从健康的从节点中按优先级/偏移量选新主；
4. 通知：客户端通过哨兵感知新主地址。

【面试追问】主从复制有延迟吗？→ 有，异步复制，可能丢数据（可开 WAIT/半同步缓解）。脑裂怎么办？→ min-slaves-to-write 等配置。`,
      source: '大厂八股文 / Redis'
    },
    {
      id: 'be-044', category: 'backend', tags: ['Redis', '分布式'], difficulty: 3,
      question: 'Redis Cluster 的原理是什么？如何实现数据分片？',
      answer: `一句话结论：Redis Cluster 用 16384 个哈希槽做数据分片，每个节点负责一部分槽，客户端按 key 的 CRC16 值定位槽与节点，支持无中心化水平扩展。

【分片】slot = CRC16(key) % 16384；每个主节点负责一段槽，槽可在节点间迁移。

【架构】无中心（去掉了哨兵），每个节点通过 gossip 协议交换状态；主节点配从节点保证高可用。

【请求路由】客户端先算槽，再连对应节点；若槽已迁移，节点返回 MOVED（永久重定向）或 ASK（临时），客户端更新路由。

【限制】不支持跨槽的多 key 操作（需 hash tag 把 key 约束到同一槽）；事务/管道仅限同槽。

【面试追问】为什么是 16384 个槽？→ 在心跳包大小与节点数间折中，够用且通信开销小。`,
      source: '大厂八股文 / Redis'
    },
    {
      id: 'be-045', category: 'backend', tags: ['Redis', '内存'], difficulty: 2,
      question: 'Redis 有哪些内存淘汰策略？如何选择？',
      answer: `一句话结论：淘汰策略分「不淘汰、对过期键、对所有键」三类，常见 LRU/LFU 变体；缓存场景一般用 allkeys-lru 或 allkeys-lfu。

【八种策略】
1. noeviction：内存满返回错误（默认，慎用于缓存）；
2. volatile-lru / allkeys-lru：对设置了过期时间/所有 key 做 LRU 淘汰；
3. volatile-lfu / allkeys-lfu：LFU 淘汰；
4. volatile-random / allkeys-random：随机淘汰；
5. volatile-ttl：淘汰最早过期的 key。

【LRU vs LFU】LRU 按「最近使用」淘汰，LFU 按「使用频率」淘汰（适合有明显热点/冷数据的场景）。

【选择建议】纯缓存用 allkeys-lru/lfu；数据不能丢用 noeviction 并做好容量规划。

【避坑】淘汰是「近似算法」，Redis 随机采样一批 key 估算，非严格全局 LRU。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-046', category: 'backend', tags: ['Redis', '性能'], difficulty: 2,
      question: 'Redis 的大 key 和热 key 分别是什么？有什么危害？如何解决？',
      answer: `一句话结论：大 key 是单个 key 的 value 过大（如大 String/大集合），热 key 是访问量集中的 key；前者拖慢 Redis 主线程，后者打爆单节点。

【大 key 危害与解决】
· 危害：读写阻塞、网络/内存压力、迁移慢；
· 排查：--bigkeys、redis-rdb-tools；
· 解决：拆分（大集合分片成多个小 key）、压缩、改用其他存储。

【热 key 危害与解决】
· 危害：单节点 QPS 打满、引发雪崩；
· 解决：本地缓存 + 多级缓存、热 key 复制到多节点随机读取、读写分离、限流。

【面试追问】如何提前发现热 key？→ 客户端统计上报、Redis 的 hotkey 检测、Proxy 层统计。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-047', category: 'backend', tags: ['Redis', '分布式锁'], difficulty: 3,
      question: 'Redisson 分布式锁的原理是什么？看门狗（watchdog）机制如何续期？',
      answer: `一句话结论：Redisson 用 Redis 的 Hash 结构 + Lua 脚本实现可重入分布式锁，看门狗定时续期避免业务未执行完锁就过期。

【加锁流程】用 Lua 脚本原子执行：判断锁不存在则 HSET 并设过期时间（默认 30s），返回线程标识。

【可重入】Hash 的 field 是线程 ID，value 是重入次数，同一线程可重复加锁。

【看门狗】默认锁租约 30s，看门狗每 10s 检查并续期到 30s，直到业务完成释放，防止锁提前过期。

【释放】Lua 脚本校验线程身份后释放，防止误删他人锁。

【对比 SETNX】SETNX 无续期、非可重入、释放有误删风险；Redisson 解决了这些痛点。

【避坑】Redisson 也非绝对安全——主从切换时锁可能丢失，强一致场景需 RedLock 或改用 Zookeeper/etcd。`,
      source: '大厂八股文 / 分布式锁'
    },
    {
      id: 'be-048', category: 'backend', tags: ['算法', '缓存'], difficulty: 2,
      question: '布隆过滤器（Bloom Filter）的原理是什么？有哪些应用场景？',
      answer: `一句话结论：布隆过滤器用「多个哈希函数 + 位数组」判断元素「可能存在」或「一定不存在」，用极小内存换极高查询效率，但有误判率。

【原理】元素经 k 个哈希函数映射到位数组的 k 个位置置 1；查询时若 k 个位置都是 1 则「可能存在」，任一为 0 则「一定不存在」。

【特性】
· 空间效率极高、插入查询 O(k)；
· 有误判（假阳性）、不支持删除（计数布隆可解决）。

【应用】缓存穿透拦截、垃圾邮件过滤、URL 去重、Google BigTable、爬虫去重。

【避坑】误判率与 bit 数组大小、哈希函数个数有关；删除需求要用 Cuckoo Filter 或计数布隆。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-049', category: 'backend', tags: ['微服务', '注册中心'], difficulty: 2,
      question: '服务注册与发现是如何工作的？如何设计一个注册中心？',
      answer: `一句话结论：注册中心是微服务的「通信录」，服务启动时注册、定期心跳续约，调用方订阅服务列表并按负载均衡选择实例。

【核心能力】
1. 服务注册：实例启动上报 IP/端口/元数据；
2. 健康检查：心跳保活，剔除不健康实例；
3. 服务发现：拉取或订阅服务实例列表；
4. 负载均衡：客户端/服务端侧选择实例。

【典型实现】Zookeeper（CP，临时节点+watch）、Eureka（AP，自我保护）、Nacos（AP/CP 可切换）、Consul、etcd。

【面试追问】注册中心 CP 还是 AP？→ 服务发现场景更重可用性（AP），宁可拿到稍旧列表也不应整体不可用。心跳 vs 主动探测？→ 心跳上报为主，辅以主动健康检查。`,
      source: '大厂八股文 / 微服务'
    },
    {
      id: 'be-050', category: 'backend', tags: ['微服务', '网关'], difficulty: 2,
      question: 'API 网关（Gateway）的作用是什么？如何设计一个网关？',
      answer: `一句话结论：网关是所有请求的统一入口，负责路由转发、鉴权、限流、熔断、日志、协议转换等横切能力，避免每个服务重复实现。

【核心功能】
1. 路由转发：按路径/版本路由到后端服务；
2. 统一鉴权：登录校验、token 验签；
3. 限流熔断：保护后端；
4. 灰度发布：按 header/比例分流；
5. 协议转换、日志审计、监控埋点。

【实现】Spring Cloud Gateway（WebFlux 响应式、Filter 链）、Kong、APISIX、Zuul。

【面试追问】网关会成为性能瓶颈/单点吗？→ 会，需集群部署 + 无状态 + 尽量异步非阻塞；网关应「轻」逻辑，业务逻辑下沉到服务。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-051', category: 'backend', tags: ['微服务', '容错'], difficulty: 2,
      question: '什么是服务雪崩？熔断、降级、限流如何防止雪崩？',
      answer: `一句话结论：服务雪崩是某个服务故障导致依赖它的上游级联崩溃；通过限流（入口控量）、熔断（快速失败）、降级（兜底）三位一体防护。

【雪崩成因】单个服务超时/异常 → 调用方线程耗尽 → 级联扩散。

【熔断】调用失败率达到阈值 → 打开熔断器，后续请求直接快速失败，一段时间后半开试探。

【降级】故障时返回兜底数据/默认值，保证核心链路可用。

【限流】对入口/热点接口限流，控制流量，从源头保护。

【实现】Sentinel、Hystrix、Resilience4j。

【面试追问】熔断和降级的区别？→ 熔断是「被动触发」的快速失败保护机制，降级是「主动/兜底」的可用性策略，两者常配合使用。`,
      source: '大厂八股文 / 微服务'
    },
    {
      id: 'be-052', category: 'backend', tags: ['高并发', '幂等'], difficulty: 2,
      question: '接口超时、重试、幂等三者如何协同设计？',
      answer: `一句话结论：超时是网络/服务的兜底，重试提升成功率，但重试会带来重复请求，必须靠幂等保证「重复执行结果一致」。

【超时】设置合理的 connect/read 超时，避免线程长时间占用；超时不一定失败（服务端可能已成功）。

【重试】对幂等操作可安全重试；重试需配合退避（指数退避 + 随机抖动）避免重试风暴。

【幂等】保证同一请求多次执行结果一致：
1. 唯一请求号（token/id）去重；
2. 数据库唯一索引；
3. 状态机（如订单状态流转不可逆）。

【协同】「超时 → 重试 → 幂等」是链条：重试依赖幂等，幂等是重试安全的前提。

【避坑】转账、下单等非幂等操作重试前必须幂等化，否则造成重复扣款。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-053', category: 'backend', tags: ['数据库', '连接池'], difficulty: 2,
      question: 'HikariCP 为什么快？连接池的关键参数如何配置？',
      answer: `一句话结论：HikariCP 靠「字节码精简、无锁设计、并发数据结构、快速代理」做到极致性能，是 Spring Boot 默认连接池。

【快的秘诀】
1. 代码精简：无大量同步与校验；
2. 并发设计：ConcurrentBag 无锁获取连接；
3. 快速代理：字节码生成轻量 Proxy，避免反射；
4. 合理默认值：连接池大小、超时等默认即优。

【关键参数】
· maximumPoolSize：最大连接数（过大反而浪费、加剧锁竞争）；
· minimumIdle：最小空闲；
· connectionTimeout：获取连接超时；
· maxLifetime：连接最大存活（应小于数据库 wait_timeout）；
· idleTimeout：空闲回收。

【避坑】连接数不是越大越好，公式：连接数 ≈ (核心数 × 2) + 有效磁盘数；结合 QPS×RT 估算。`,
      source: '大厂八股文 / 连接池'
    },
    {
      id: 'be-054', category: 'backend', tags: ['Java', '并发'], difficulty: 3,
      question: '什么是 JMM（Java 内存模型）？happens-before 规则是什么？',
      answer: `一句话结论：JMM 是一套规范，定义多线程下共享变量的可见性与有序性；happens-before 规则给出「哪些操作的结果对后续可见」的判断依据。

【JMM 核心】主内存存共享变量，每个线程有工作内存副本；通过 volatile、锁等保证可见性。JMM 允许编译器/CPU 指令重排，但受 happens-before 约束。

【happens-before 规则】
1. 程序顺序规则：同一线程内按代码顺序；
2. 锁规则：解锁 happens-before 加锁；
3. volatile 规则：写 happens-before 读；
4. 传递性：A hb B、B hb C → A hb C；
5. start/join、中断等规则。

【面试追问】JMM 与物理机内存模型的关系？→ JMM 屏蔽底层差异，抽象出统一的并发语义，是「语言级内存模型」。`,
      source: '大厂八股文 / 并发'
    },
    {
      id: 'be-055', category: 'backend', tags: ['Go', '并发'], difficulty: 2,
      question: 'Go 的 goroutine 和 channel 是什么？为什么 goroutine 很轻量？',
      answer: `一句话结论：goroutine 是 Go 的轻量级协程（初始栈仅几 KB、可动态增长），channel 是 goroutine 间通信的管道，遵循「不要通过共享内存通信，而通过通信共享内存」。

【goroutine 轻量原因】
1. 初始栈很小（约 2KB），按需增长；
2. 由 Go 运行时调度（GMP），不直接对应 OS 线程；
3. 上下文切换在用户态完成，开销远小于线程。

【channel】
· 无缓冲：同步，发送方阻塞直到接收；
· 有缓冲：满则阻塞发送，空则阻塞接收；
· 用于同步、传递数据、控制并发（如信号量）。

【避坑】channel 已关闭再发送会 panic；从已关闭 channel 接收会得到零值（用 ok 判断）。goroutine 泄漏：channel 没人接收导致 goroutine 永久阻塞。`,
      source: '大厂八股文 / Go'
    },
    {
      id: 'be-056', category: 'backend', tags: ['Go', '并发'], difficulty: 3,
      question: 'Go 的 GMP 调度模型是什么？',
      answer: `一句话结论：GMP 是 Go 的调度模型——G（goroutine）、M（OS 线程）、P（处理器/调度上下文），P 负责把 G 调度到 M 上执行，实现 M:N 调度。

【三者关系】
· G：待执行的 goroutine；
· M：实际运行 G 的系统线程；
· P：持有可运行 G 的队列（本地 runq），数量由 GOMAXPROCS 决定，默认 CPU 核数。

【调度流程】M 绑定 P 后，从 P 的本地队列取 G 执行；本地队列空则从全局队列或「偷」其他 P 的 G（work-stealing）。

【阻塞处理】G 阻塞（如系统调用/网络）时，M 与 P 解绑，P 去接新的 M，避免空闲。

【面试追问】为什么要有 P？→ 引入 P 解耦调度与线程，减少全局锁竞争，实现负载均衡与局部性。`,
      source: '大厂八股文 / Go'
    },
    {
      id: 'be-057', category: 'backend', tags: ['Go', '基础'], difficulty: 2,
      question: 'Go 的 defer、panic、recover 的执行机制是什么？',
      answer: `一句话结论：defer 用于延迟执行（后进先出），panic 触发崩溃，recover 只能在 defer 中捕获 panic 恢复程序。

【defer】
· 后进先出（LIFO）执行；
· 参数在 defer 声明时求值（不是执行时）；
· 常用于资源释放、解锁、记录日志。

【panic/recover】
· panic 停止当前函数执行，逐层向上传播；
· recover 只能在 defer 中生效，捕获 panic 使程序继续；
· 若没有 recover，程序崩溃。

【面试追问】defer 与 return 的执行顺序？→ 先给返回值赋值，再执行 defer，最后返回（defer 可修改命名返回值）。

【避坑】defer 在 for 循环里会堆积到函数结束才执行（资源延迟释放），注意用闭包/函数包裹。`,
      source: '大厂八股文 / Go'
    },
    {
      id: 'be-058', category: 'backend', tags: ['线上问题', '排查'], difficulty: 2,
      question: '线上 CPU 飙高到 100% 如何排查？',
      answer: `一句话结论：CPU 飙高先定位是「哪个进程 → 哪个线程 → 哪段代码」，核心工具是 top、top -H、jstack（或 pprof）。

【排查步骤】
1. top 找到 CPU 高的进程 PID；
2. top -Hp PID 找到 CPU 高的线程 TID；
3. 把 TID 转十六进制（printf "%x"）；
4. jstack PID > dump 后搜索该十六进制线程 id，定位到代码栈；
5. 分析：死循环、频繁 GC、正则回溯、锁竞争等。

【Go 场景】用 pprof：import net/http/pprof，采集 CPU profile 分析热点函数。

【常见根因】死循环、无界循环、频繁 Full GC（CPU 打满但业务慢）、正则灾难回溯、JSON 大对象反复解析。

【避坑】先判断是用户态还是系统态/GC，别上来就改代码。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-059', category: 'backend', tags: ['线上问题', '排查'], difficulty: 3,
      question: '线上 OOM（内存溢出）如何排查？',
      answer: `一句话结论：OOM 排查核心是「拿堆转储 → 分析大对象与引用链」，工具用 -XX:+HeapDumpOnOutOfMemoryError、jmap、MAT/JProfiler。

【排查步骤】
1. 启动时加参数 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=... 保留现场；
2. 用 jmap -dump 手动导出堆，或用 jstat 观察 GC 趋势；
3. 用 MAT 分析：看 Dominator Tree（谁占内存最大）、Leak Suspects（泄漏点）；
4. 定位 GC Roots 引用链，找到不该存活的对象。

【常见根因】集合/缓存无限增长、ThreadLocal 未清理、连接未关闭、大对象一次性加载、内存泄漏。

【区分】内存溢出（OutOfMemory，内存不够）vs 内存泄漏（Memory Leak，对象无法回收导致的持续增长）。

【避坑】先看是堆、元空间还是直接内存溢出，不同区域排查方向不同。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-060', category: 'backend', tags: ['线上问题', '性能'], difficulty: 2,
      question: '一个接口响应很慢，如何排查优化？',
      answer: `一句话结论：慢接口排查遵循「定位瓶颈层 → 定位慢点 → 针对性优化」，从链路追踪、日志、DB、缓存、代码逐层定位。

【排查思路】
1. 链路追踪：看整体耗时分布，定位是网络/网关/服务/DB/下游；
2. 分阶段计时：在代码里打点，定位是哪个环节慢；
3. DB 慢查询：开启慢日志，explain 分析，加索引/优化 SQL；
4. 缓存：是否缓存穿透/失效，命中率低；
5. 下游依赖：是否调用了慢的服务，能否并行/异步；
6. 代码：循环里查库（N+1）、大对象序列化、锁竞争。

【优化手段】加缓存、批量、异步、并行、连接复用、减少序列化、索引优化。

【避坑】不要盲猜，用数据说话；先确认瓶颈在哪一层再动手。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-061', category: 'backend', tags: ['日志', '可观测性'], difficulty: 2,
      question: '如何设计日志系统？traceId 链路追踪是怎么实现的？',
      answer: `一句话结论：日志系统要「结构化、可关联、可检索」，核心是给每个请求生成唯一 traceId，贯穿整个调用链，实现日志串联。

【日志设计要点】
1. 结构化：JSON 格式，字段统一（时间、级别、traceId、服务、方法）；
2. 分级与采样：区分 debug/info/warn/error，控制日志量；
3. 集中采集：Filebeat 采集 → Kafka → Logstash → ES → Kibana；
4. 脱敏：敏感字段（手机号、密码）打码。

【traceId 链路追踪】
· 请求入口生成 traceId + spanId；
· 通过 HTTP header / RPC 上下文透传；
· 每个服务打印日志时带上 traceId，即可按 traceId 串联整条链路。

【面试追问】traceId 如何透传？→ HTTP 用 header（如 X-Trace-Id），RPC 用 context/attachment；用 MDC（Mapped Diagnostic Context）绑定线程。`,
      source: '大厂八股文 / 可观测性'
    },
    {
      id: 'be-062', category: 'backend', tags: ['可观测性', '链路追踪'], difficulty: 2,
      question: '分布式链路追踪的原理是什么？SkyWalking、OpenTelemetry 分别是什么？',
      answer: `一句话结论：链路追踪通过在请求链路中埋点采集 span，把调用关系串联成 trace，定位性能瓶颈与故障；SkyWalking 是开源 APM，OpenTelemetry 是统一的埋点标准。

【核心概念】
· Trace：一次完整请求的调用链；
· Span：一次调用单元，含起止时间、标签；
· 父子关系：通过 traceId + spanId + parentSpanId 关联。

【实现方式】无侵入（字节码增强/agent，如 SkyWalking agent）或侵入式（SDK 手动埋点）。

【SkyWalking】Java agent 自动探针，采集指标/拓扑/日志，自带存储与 UI。

【OpenTelemetry（OTel）】CNCF 的统一标准，定义 API + SDK + 采集协议（OTLP），可对接 Jaeger/Zipkin/Prometheus，避免厂商锁定。

【面试追问】采样策略？→ 全量 vs 按比例采样，高频请求需采样降低开销。`,
      source: '大厂八股文 / 可观测性'
    },
    {
      id: 'be-063', category: 'backend', tags: ['配置中心', '微服务'], difficulty: 2,
      question: '配置中心的作用是什么？如何实现配置热更新？',
      answer: `一句话结论：配置中心集中管理各服务配置，支持动态下发；热更新靠「长轮询/推送 + 监听回调」实现，无需重启应用。

【作用】集中管理、环境隔离（dev/test/prod）、版本管理、灰度发布、动态生效。

【热更新原理】
1. 客户端启动拉取配置，并注册监听；
2. 配置变更后服务端推送，或客户端长轮询感知变化；
3. 客户端回调更新内存配置（配合 @RefreshScope / @Value 刷新）。

【实现】Nacos、Apollo、Spring Cloud Config + Bus。

【面试追问】热更新对哪些配置生效？→ 普通 @Value 需 @RefreshScope 才刷新；数据库连接等需重建 Bean 或重启。如何保证配置一致？→ 配置中心本身高可用 + 本地缓存兜底。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-064', category: 'backend', tags: ['定时任务', '分布式'], difficulty: 2,
      question: '分布式定时任务如何设计？XXL-Job 的原理是什么？',
      answer: `一句话结论：分布式定时任务解决「多实例下任务重复执行」和「调度可靠性」问题，核心是「调度中心 + 执行器」分离，XXL-Job 是经典实现。

【XXL-Job 架构】
· 调度中心：管理任务、触发调度、路由策略；
· 执行器：注册到调度中心，接收调度请求执行任务。

【关键设计】
1. 分布式调度：调度中心选一个执行器实例执行，避免重复；
2. 失败重试、告警；
3. 路由策略：轮询、随机、故障转移、分片广播；
4. 分片广播：大数据任务分片到多实例并行。

【面试追问】如何避免任务重复执行？→ 调度中心统一触发 + 执行器幂等；或加分布式锁。与 cron 相比？→ cron 单机、无 HA、无失败重试。`,
      source: '大厂八股文 / 定时任务'
    },
    {
      id: 'be-065', category: 'backend', tags: ['发布', '运维'], difficulty: 2,
      question: '灰度发布、蓝绿发布、滚动发布有什么区别？',
      answer: `一句话结论：三者都是降低发布风险的手段——蓝绿是两套环境切换，滚动是逐台替换，灰度是按比例引流逐步放量。

【蓝绿发布】准备两套完全相同环境（蓝=旧、绿=新），切换流量入口，秒级回滚；代价是需要双倍资源。

【滚动发布】逐台替换实例，逐个更新，不中断服务；回滚相对慢。

【灰度发布（金丝雀）】先让一小部分流量（如按用户 ID 哈希、header）走新版本，验证无问题后逐步放量到 100%，影响面最小。

【面试追问】灰度规则怎么做？→ 用户维度（ID 取模）、比例、特定用户/地域白名单。如何保证灰度链路一致？→ 请求打标，全链路透传灰度标识。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-066', category: 'backend', tags: ['DevOps', 'CI/CD'], difficulty: 2,
      question: '什么是 CI/CD？一条典型的 CI/CD 流水线包含哪些环节？',
      answer: `一句话结论：CI（持续集成）自动构建测试、CD（持续交付/部署）自动发布，目标是高频、可靠地交付软件。

【CI 持续集成】代码提交后自动触发：拉代码 → 编译 → 单元测试 → 代码扫描 → 打包制品，快速反馈。

【CD 持续交付/部署】把制品自动部署到测试/生产环境：镜像构建 → 推送仓库 → 部署编排 → 健康检查 → 回滚。

【典型流水线】代码提交 → 触发流水线 → 构建/测试 → 质量门禁 → 构建镜像 → 部署 → 冒烟测试 → 通知。

【工具】Jenkins、GitLab CI、GitHub Actions、Argo CD（GitOps）。

【面试追问】CI 和 CD 的区别？→ CI 关注「集成验证」，CD 关注「自动化交付上线」。`,
      source: '大厂八股文 / DevOps'
    },
    {
      id: 'be-067', category: 'backend', tags: ['容器', 'Docker'], difficulty: 2,
      question: 'Docker 的核心原理是什么？镜像、容器、仓库有什么关系？',
      answer: `一句话结论：Docker 基于 Linux 的 namespace（隔离）和 cgroup（资源限制）实现轻量级容器；镜像是只读模板，容器是镜像的运行实例，仓库用于存储分发镜像。

【三大核心】
1. 镜像 Image：分层只读的文件系统模板，层可复用；
2. 容器 Container：镜像 + 可写层的运行实例，共享宿主机内核；
3. 仓库 Registry：存储镜像（Docker Hub、私有 Harbor）。

【隔离与限制】namespace 隔离进程/网络/挂载/用户等；cgroup 限制 CPU/内存/IO。

【面试追问】容器 vs 虚拟机？→ 容器共享内核、秒级启动、开销小；虚拟机隔离更强、各自独立内核。镜像层为什么能复用？→ 分层存储 + 写时复制，相同基础层共享。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-068', category: 'backend', tags: ['容器', 'K8s'], difficulty: 2,
      question: 'Kubernetes 的核心概念有哪些？Pod、Service、Deployment 分别是什么？',
      answer: `一句话结论：K8s 是容器编排平台，Pod 是最小调度单元，Deployment 管理无状态应用的副本与滚动更新，Service 提供稳定的服务发现与负载均衡。

【核心对象】
1. Pod：一个或多个容器的组合，共享网络与存储，最小调度单元；
2. Deployment：声明式管理 Pod 副本数、滚动升级、回滚；
3. Service：给 Pod 提供稳定虚拟 IP + 负载均衡（ClusterIP/NodePort/LoadBalancer）；
4. 其他：Namespace、ConfigMap/Secret、Ingress、StatefulSet、DaemonSet。

【控制循环】声明式：用户声明期望状态，控制器（controller）不断调谐使实际状态趋向期望。

【面试追问】Pod 重启后 IP 会变怎么办？→ 用 Service 屏蔽 Pod IP 变化；有状态应用用 StatefulSet + 稳定网络标识。`,
      source: '大厂八股文 / K8s'
    },
    {
      id: 'be-069', category: 'backend', tags: ['微服务', 'Service Mesh'], difficulty: 3,
      question: '什么是 Service Mesh？Sidecar 模式是什么？与微服务框架有何不同？',
      answer: `一句话结论：Service Mesh 把服务间通信的治理能力（负载均衡、熔断、限流、安全）下沉到独立的 Sidecar 代理，业务代码不再依赖框架 SDK。

【Sidecar 模式】每个服务 Pod 旁部署一个代理（如 Envoy），业务流量都经过代理，代理统一处理治理逻辑。

【解决什么问题】传统微服务框架（Spring Cloud）把治理逻辑以 SDK 形式耦合在业务里，多语言难统一、升级需发版；Service Mesh 将治理与业务解耦，多语言通用、无侵入。

【核心组件】控制面（Istiod）下发策略 + 数据面（Envoy）执行转发。

【代表】Istio、Linkerd。

【面试追问】Service Mesh 的代价？→ 增加一跳网络延迟、运维复杂度、资源开销。何时用？→ 多语言/大规模服务治理需求强时。`,
      source: '大厂八股文 / Service Mesh'
    },
    {
      id: 'be-070', category: 'backend', tags: ['认证', 'SSO'], difficulty: 2,
      question: '单点登录（SSO）是如何实现的？',
      answer: `一句话结论：SSO 让用户一次登录、多系统共享登录态，核心是「统一认证中心 + 票据（ticket）传递」。

【典型流程（CAS 协议）】
1. 用户访问系统 A，未登录 → 重定向到认证中心；
2. 认证中心校验登录态（Cookie），未登录则让用户登录；
3. 登录成功签发票据 ticket，重定向回系统 A 并带上 ticket；
4. 系统 A 拿 ticket 向认证中心验证，成功后建立本地会话；
5. 再访问系统 B，同样跳认证中心，此时已登录直接发 ticket，无需再次登录。

【实现要点】全局会话（认证中心 Cookie）+ 局部会话（各系统）+ ticket 一次性校验。

【面试追问】SSO 与 OAuth2 的区别？→ SSO 解决「登录态共享」，OAuth2 解决「授权第三方访问资源」。`,
      source: '大厂八股文 / SSO'
    },
    {
      id: 'be-071', category: 'backend', tags: ['认证', 'OAuth2'], difficulty: 3,
      question: 'OAuth2.0 的授权码模式（Authorization Code）流程是怎样的？',
      answer: `一句话结论：授权码模式是 OAuth2 最安全的流程，通过「授权码」中转，避免把 token 暴露给浏览器，适合有后端的应用。

【流程】
1. 用户点「用 XX 登录」，客户端重定向到授权服务器并带 client_id、redirect_uri、scope；
2. 用户登录并同意授权；
3. 授权服务器返回授权码 code 给客户端（浏览器）；
4. 客户端拿 code + client_secret 向授权服务器换取 access_token（服务端直连）；
5. 用 access_token 访问资源服务器。

【为什么安全】code 在浏览器可见但一次性、短期；token 只发给服务端，不经过浏览器，防 token 泄露。

【面试追问】四种模式？→ 授权码、简化式（implicit，已废弃）、密码式、客户端凭证。access_token 和 refresh_token 区别？→ refresh 用于续期，长期有效但可撤销。`,
      source: '大厂八股文 / OAuth2'
    },
    {
      id: 'be-072', category: 'backend', tags: ['安全', '加密'], difficulty: 2,
      question: '对称加密和非对称加密有什么区别？分别用在什么场景？',
      answer: `一句话结论：对称加密用同一把密钥加解密（快，但密钥分发难），非对称加密用公私钥对（安全，但慢）；实际常结合使用。

【对称加密】DES、AES：加解密同密钥，速度快，适合大量数据；难题是密钥如何安全共享。

【非对称加密】RSA、ECC：公钥加密私钥解密（或私钥签名公钥验签），速度慢，适合密钥交换、数字签名、身份认证。

【结合使用（HTTPS）】用非对称加密协商出对称密钥（会话密钥），后续数据用对称加密传输，兼顾安全与性能。

【面试追问】RSA 和 AES 各用在哪？→ RSA 交换密钥/签名，AES 加密数据。为什么不用非对称加密传所有数据？→ 慢几个数量级。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-073', category: 'backend', tags: ['安全', '接口'], difficulty: 2,
      question: '如何保证接口安全？签名、防重放、防篡改如何设计？',
      answer: `一句话结论：接口安全三板斧是「签名（防篡改）+ 时间戳/随机数（防重放）+ 加密/HTTPS（防窃听）」。

【签名 sign】客户端把参数 + 密钥按约定算法（如 HMAC-SHA256）生成签名，服务端用同样规则验签，防止参数被篡改。

【防重放】
1. 时间戳：请求带 timestamp，服务端校验时间窗口（如 ±5 分钟）；
2. 随机数 nonce：服务端记录已用 nonce，拒绝重复；
3. 或 timestamp + nonce 组合。

【其他】HTTPS 传输加密、token 鉴权、IP 白名单、限流、参数校验、敏感数据脱敏。

【避坑】密钥不能硬编码在前端；签名算法用成熟的 HMAC，别自创。`,
      source: '大厂八股文 / 接口安全'
    },
    {
      id: 'be-074', category: 'backend', tags: ['代理', '网络'], difficulty: 2,
      question: '正向代理和反向代理有什么区别？各有什么作用？',
      answer: `一句话结论：正向代理「代理客户端」帮客户端访问外部资源，反向代理「代理服务端」帮服务端接收请求并转发，客户端感知不到真实后端。

【正向代理】
· 位置：客户端一侧；
· 作用：访问墙外资源、隐藏客户端、缓存、访问控制；
· 客户端知道代理存在，需手动配置。

【反向代理】
· 位置：服务端一侧；
· 作用：负载均衡、SSL 卸载、缓存、安全防护、统一入口；
· 客户端无感知，访问的是代理地址。

【典型工具】正向：Shadowsocks；反向：Nginx、HAProxy。

【面试追问】Nginx 属于哪种？→ 反向代理（也可做正向代理）。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-075', category: 'backend', tags: ['Nginx', '负载均衡'], difficulty: 2,
      question: 'Nginx 如何实现反向代理和负载均衡？常见负载均衡策略有哪些？',
      answer: `一句话结论：Nginx 通过 proxy_pass 反向代理到 upstream 后端组，用不同策略分发请求；策略有轮询、加权轮询、ip_hash、least_conn、fair 等。

【配置要点】
· upstream 定义后端服务器列表；
· location 中用 proxy_pass 转发；
· 可配连接超时、重试、健康检查（第三方模块）。

【策略】
1. 轮询（默认）：依次分发；
2. 加权轮询：按权重比例分发；
3. ip_hash：按客户端 IP 哈希，保证同一 IP 到同一后端（会话保持）；
4. least_conn：最少连接优先；
5. url_hash/fair：按 URL/响应时间。

【面试追问】ip_hash 的缺陷？→ 后端增减会重新映射、代理 IP 集中导致不均衡；一般用「会话共享（Redis）替代会话粘滞」。`,
      source: '大厂八股文 / Nginx'
    },
    {
      id: 'be-076', category: 'backend', tags: ['架构', '高可用'], difficulty: 3,
      question: '如何设计一个高可用（HA）系统？多活、容灾是怎么做的？',
      answer: `一句话结论：高可用靠「冗余 + 故障转移 + 降级」，从单机到集群、机房、异地多活逐级提升可用性，核心是消除单点。

【分层设计】
1. 接入层：DNS/LB 多活，健康检查剔除故障；
2. 应用层：无状态 + 多副本，随时扩容；
3. 数据层：主从复制 + 自动切换、分片冗余；
4. 依赖：熔断降级，避免级联。

【容灾等级】同机房 HA → 同城双活 → 异地多活（单元化），可用性目标从 99.9% 到 99.999%。

【多活关键】流量单元化（按用户路由到固定机房）、数据双向同步与冲突处理、全局 ID。

【面试追问】可用性几个 9 怎么理解？→ 99.99% = 一年宕机约 52 分钟。`,
      source: '大厂八股文 / 架构'
    },
    {
      id: 'be-077', category: 'backend', tags: ['分布式', '一致性'], difficulty: 2,
      question: '什么是最终一致性？有哪些落地实现手段？',
      answer: `一句话结论：最终一致性允许系统在短暂时间窗口内不一致，但经过一段时间后最终达到一致，是分布式系统的常见选择。

【为什么用】强一致（2PC）性能差、可用性低；最终一致以短暂不一致换取高可用与性能。

【落地手段】
1. 消息队列：本地事务 + 消息，异步驱动下游，最终一致；
2. 对账/补偿：定时任务比对，发现不一致主动修复；
3. 事件溯源（Event Sourcing）：记录事件流，重放恢复状态；
4. 幂等 + 重试：保证重复/失败重试不会造成二次副作用。

【面试追问】最终一致会带来什么问题？→ 用户可能短暂看到旧数据（如下单后订单状态延迟），需在交互上提示。`,
      source: '大厂八股文 / 一致性'
    },
    {
      id: 'be-078', category: 'backend', tags: ['分布式', '时钟'], difficulty: 3,
      question: '分布式系统中的时钟问题有哪些？逻辑时钟、NTP 分别解决什么？',
      answer: `一句话结论：分布式下各机器物理时钟不同步，导致「谁先发生」难以判断；NTP 同步物理时钟，逻辑时钟（Lamport/向量时钟）不依赖物理时间、通过事件序号定序。

【问题】时钟漂移导致：订单时间错乱、超时误判、ID 顺序错误、无法确定事件先后。

【NTP】网络时间协议，把机器时钟同步到标准时间源，精度到毫秒级；但仍有漂移、不可完全依赖。

【Lamport 时钟】每个进程维护计数器，发送事件递增并附上，接收时取 max+1；若 a 的时钟 < b 的时钟，不一定 a 先发生，只能推出「a 先于 b 则时钟小」。

【向量时钟】记录每个进程的计数向量，能更精确判断因果/并发关系。

【避坑】业务不要依赖本机时钟排序，用全局递增 ID（如雪花算法）或版本号。`,
      source: '大厂八股文 / 分布式'
    },
    {
      id: 'be-079', category: 'backend', tags: ['系统设计'], difficulty: 2,
      question: '如何设计一个短链接系统（短链服务）？',
      answer: `一句话结论：短链核心是「长 URL → 短码」的映射与还原，靠发号器生成唯一短码 + 存储映射 + 301 重定向实现。

【核心流程】
1. 生成：长 URL 哈希/发号器生成短码（如 62 进制的自增 ID）；
2. 存储：短码 → 长 URL 映射存 Redis/DB；
3. 访问：根据短码查长 URL，返回 301/302 重定向。

【短码生成】自增 ID 转 62 进制（0-9a-zA-Z）压缩长度；或用 MurmurHash 取前几位（需处理冲突）。

【进阶设计】缓存热点、布隆过滤器拦截无效短码、分布式发号（如雪花/号段）、过期清理、访问统计。

【面试追问】用 301 还是 302？→ 301 永久重定向（浏览器缓存，省服务器但统计不准），302 临时（每次回源，可统计）。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-080', category: 'backend', tags: ['系统设计'], difficulty: 3,
      question: '如何设计一个微信抢红包系统？',
      answer: `一句话结论：抢红包是「高并发 + 强一致（金额不能超发）+ 随机分配」问题，核心用「预分配 + 原子扣减」保证金额准确与性能。

【核心设计】
1. 发红包：把总金额按二倍均值法/线段切割法预拆成 N 份，存入 list/DB；
2. 抢红包：用 Redis list 原子 pop 一份（LPOP），或用 DB 乐观锁扣减；
3. 并发安全：预拆分后每份独立，天然无超发问题；
4. 一致性：拆包结果落库，保证金额总和 = 红包金额。

【拆分算法】
· 二倍均值法：每次随机 [0.01, 剩余均值×2]，保证公平；
· 线段切割法：随机切 N-1 刀。

【面试追问】如何防止重复抢？→ 用户维度去重（每人只能 pop 一次，记录已抢）。高并发怎么扛？→ 预拆包 + Redis + 削峰。`,
      source: '大厂八股文 / 系统设计'
    },
    {
      id: 'be-081', category: 'backend', tags: ['Redis', '系统设计'], difficulty: 2,
      question: '如何设计一个排行榜系统（Top N）？为什么用 Redis ZSet？',
      answer: `一句话结论：排行榜用 Redis 有序集合 ZSet 实现，靠 score 排序天然支持实时 Top N、排名查询、范围查询。

【ZSet 特性】底层跳表 + 哈希，按 score 排序，O(logN) 增删查。

【设计】
1. 加分：ZADD key score member；
2. 查 Top N：ZREVRANGE key 0 N-1（按 score 降序）；
3. 查某人排名：ZREVRANK key member；
4. 周榜/月榜：按时间分 key（如 rank:2026w1），或 ZUNIONSTORE 合并。

【面试追问】score 相同怎么办？→ ZSet 按 member 字典序排序，可把 member 设计成「分数+时间戳」保证唯一。大数据量？→ 分片、只保留 Top N 裁剪。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-082', category: 'backend', tags: ['系统设计'], difficulty: 2,
      question: '如何设计一个点赞/计数系统（如微博点赞、视频点赞数）？',
      answer: `一句话结论：点赞系统要点是「高并发写入 + 计数读多写多 + 幂等」，用 Redis 计数 + 异步落库 + 唯一约束防重复。

【设计】
1. 点赞：Redis SET 记录「用户-对象」关系防重复点赞，计数器 INCR；
2. 取消：SREM + DECR；
3. 幂等：以用户+对象为唯一键，重复点赞不生效；
4. 持久化：异步批量把计数刷到 DB，Redis 做高并发缓冲。

【读多优化】热点对象的计数缓存 + 定期校准；点赞列表分页用 ZSet/DB。

【面试追问】Redis 挂了丢计数怎么办？→ AOF 持久化 + 定期与 DB 对账补偿；极端可用「本地缓存 + 异步」削峰。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-083', category: 'backend', tags: ['系统设计', '消息推送'], difficulty: 2,
      question: '如何设计一个消息推送系统（如 App 推送、站内信）？',
      answer: `一句话结论：推送系统核心是「海量用户 + 定向投递 + 实时性」，靠消息队列削峰、连接通道分发、失败重试保证送达。

【架构分层】
1. 业务触发 → 消息队列（Kafka）削峰；
2. 推送服务消费 → 按用户/标签过滤 → 路由到通道；
3. 通道：WebSocket/长连接（在线）、厂商推送（离线，如 APNs/厂商通道）；
4. 用户鉴权与连接管理：维护「用户 → 连接」映射。

【关键点】在线/离线通道切换、消息去重、失败重试、限流、用户标签系统、已读未读。

【面试追问】如何保证消息不丢？→ MQ 可靠投递 + 通道 ACK + 离线消息存储补发。海量连接怎么扛？→ 连接分片、多机 + 注册中心定位用户连接所在机器。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-084', category: 'backend', tags: ['系统设计', '延迟队列'], difficulty: 2,
      question: '如何实现订单超时未支付自动关闭？',
      answer: `一句话结论：订单超时关闭用「延迟任务」实现，常见方案有 Redis 过期监听、ZSet 延迟队列、RabbitMQ 死信、时间轮。

【方案对比】
1. Redis ZSet：以「下单时间+超时时长」为 score，定时轮询到期订单处理（需处理轮询精度）；
2. Redis keyspace 过期监听：SET key 过期触发通知（不可靠，可能丢事件）；
3. RabbitMQ 死信队列：消息 TTL 过期进入死信队列消费；
4. 时间轮：内存定时器，高效但需持久化防重启丢失；
5. 数据库定时扫描：简单但性能差，不适合大流量。

【要点】幂等（关闭前检查状态）、补偿（关闭失败重试）、对账兜底。

【面试追问】ZSet 轮询精度问题？→ 可结合「到期时间分桶 + 定时扫描」，减少空轮询。`,
      source: '大厂八股文 / 系统设计'
    },
    {
      id: 'be-085', category: 'backend', tags: ['消息队列', '延迟队列'], difficulty: 2,
      question: '延迟队列有哪些实现方式？各自的优缺点？',
      answer: `一句话结论：延迟队列实现有 Redis ZSet、过期监听、RabbitMQ TTL+死信、RocketMQ 延迟消息、时间轮等，各有取舍。

【Redis ZSet】score=执行时间，轮询取到期任务；灵活但轮询有延迟、需保证多实例不重复消费（加锁）。

【Redis 过期监听】利用 keyspace notifications；实现简单但事件可能丢失，不可靠。

【RabbitMQ TTL+死信】消息设 TTL，过期进死信队列消费；缺点是「先过期的在队头」会阻塞后到期消息（需按时间分队列）。

【RocketMQ 延迟消息】内置延迟级别（1s~2h），简单可靠，但延迟时间受固定级别限制。

【时间轮】内存定时器，O(1) 插入，高效但需持久化。

【避坑】选型看「可靠性要求」和「延迟精度」；要可靠用 RocketMQ/持久化方案，别用纯过期监听。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-086', category: 'backend', tags: ['限流', '高并发'], difficulty: 2,
      question: '什么是热点参数限流？如何实现？',
      answer: `一句话结论：热点参数限流是针对「某个具体参数值（如热门商品 ID）」的精细化限流，防止个别热点打垮服务，而普通请求不受影响。

【场景】秒杀时某个商品 ID 被疯狂请求，整体 QPS 没超限但单商品超限，需按参数值限流。

【实现】
1. 识别热点参数：统计参数访问频次，动态识别 top 热点；
2. 按参数限流：对热点参数单独限流（如某商品每秒 100）；
3. 本地缓存热点参数 + 令牌桶/滑动窗口计数。

【实现工具】Sentinel 支持热点参数限流（param flow）。

【面试追问】与普通限流区别？→ 普通限流按接口/资源整体，热点限流按参数维度更细。`,
      source: '大厂八股文 / 限流'
    },
    {
      id: 'be-087', category: 'backend', tags: ['架构', '容量'], difficulty: 2,
      question: '如何做系统容量估算？QPS、TPS、RT、并发数之间什么关系？',
      answer: `一句话结论：容量估算核心公式「并发数 = QPS × 平均 RT」，据业务量推 QPS，再推需要的机器与资源。

【关键指标】
· QPS：每秒查询数；
· TPS：每秒事务数（写场景）；
· RT：响应时间；
· 并发数：同时在处理的请求数。

【公式】并发数 = QPS × RT（Little 定律）。

【估算示例】日活 100 万，每人每天 20 次请求 → 日均 2000 万请求；按二八原则 80% 集中在高峰期 4 小时 → 峰值 QPS ≈ 2000万×0.8/(4×3600) ≈ 1111；预留 3 倍余量。

【推资源】单机 QPS 按压测实测（如 500），则需 3~4 台 + 冗余。

【避坑】估算用「峰值」而非均值，预留冗余；实际以压测数据为准。`,
      source: '大厂八股文 / 容量'
    },
    {
      id: 'be-088', category: 'backend', tags: ['测试', '性能'], difficulty: 2,
      question: '什么是全链路压测？为什么要做？怎么做？',
      answer: `一句话结论：全链路压测是在生产环境或等比例环境对整个调用链施压，验证系统整体容量与瓶颈，而不是只压单接口。

【为什么做】单接口压测发现不了链路级瓶颈（如下游、DB、网络、限流、中间件），全链路才能还原真实流量。

【怎么做】
1. 流量录制：录生产真实请求作为压测流量；
2. 流量染色：给压测请求打标（如 header 标识），与真实流量隔离；
3. 影子库/影子表：压测流量写影子存储，不污染生产数据；
4. 施压：用 JMeter/Locust 等按梯度加压；
5. 监控与定位瓶颈。

【难点】压测流量隔离（影子链路）、数据隔离、不误伤真实用户。

【避坑】全链路压测必须在隔离机制完善的前提下进行，否则会污染生产数据。`,
      source: '大厂八股文 / 压测'
    },
    {
      id: 'be-089', category: 'backend', tags: ['MySQL', '读写分离'], difficulty: 2,
      question: '读写分离下主从延迟会带来什么问题？如何解决？',
      answer: `一句话结论：主从延迟导致「刚写入却读不到」（读旧数据），解决方向是强制读主、延迟容忍、或减少延迟。

【问题】写主库后立刻读从库，可能因主从同步延迟读到旧数据（如订单已创建但查询不到）。

【解决方案】
1. 强制读主：关键写后读、事务内读走主库；
2. 延迟容忍：对实时性不敏感的读走从库；
3. 降低延迟：并行复制（MTS）、半同步复制、就近部署；
4. 缓存兜底：写后更新缓存，读走缓存。

【识别主从延迟】用 seconds_behind_master 监控；或写主库时记录位点，读从库校验。

【避坑】「写完立刻读」场景必须读主库或走缓存，不能依赖从库实时。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-090', category: 'backend', tags: ['MySQL', '分库分表'], difficulty: 3,
      question: '分库分表后如何扩容？数据迁移怎么做？',
      answer: `一句话结论：分库分表扩容核心是「数据重分布」，常见方案有停机迁移、双写迁移、按时间/范围天然扩容。

【方案】
1. 停机迁移：停服 → 全量导出 → 按新规则导入 → 切换，简单但有停机窗口；
2. 双写迁移：新老库双写 → 全量同步 → 校验一致 → 切读 → 停止老写，平滑但复杂；
3. 范围分片天然扩容：按时间分片，新数据自然进新表，老数据无需迁移。

【工具】ShardingSphere 的弹性伸缩、阿里 DTS 数据同步、Canal + 自定义同步。

【要点】迁移过程保证数据一致性（双写 + 对账）、灰度切换、可回滚。

【避坑】避免用「取模」分片（扩容要全量迁移），优先「范围/一致性哈希」分片降低扩容成本。`,
      source: '大厂八股文 / 分库分表'
    },
    {
      id: 'be-091', category: 'backend', tags: ['NewSQL', '分布式数据库'], difficulty: 2,
      question: '什么是 NewSQL？TiDB 相比传统分库分表有什么优势？',
      answer: `一句话结论：NewSQL 兼具传统关系型数据库的 ACID 与 NoSQL 的水平扩展能力；TiDB 通过「存储计算分离 + Raft 副本」实现分布式事务与自动扩缩容。

【TiDB 架构】
· TiDB Server：SQL 层，无状态，负责解析优化；
· PD：元数据与调度；
· TiKV：分布式 KV 存储，Raft 保证一致性。

【相比分库分表的优势】
1. 无需业务手动分片，自动水平扩展；
2. 分布式事务（跨分片 ACID）；
3. 数据自动 rebalance；
4. 兼容 MySQL 协议，迁移成本低。

【代价】架构更重、延迟略高、运维复杂度，适合大数据量且不想维护分片逻辑的场景。

【面试追问】适用场景？→ 数据量大、需弹性扩展、希望屏蔽分片复杂度的在线事务/分析业务。`,
      source: '大厂八股文 / NewSQL'
    },
    {
      id: 'be-092', category: 'backend', tags: ['幂等', '系统设计'], difficulty: 2,
      question: '什么是幂等 token 方案？如何用 token 防止重复提交？',
      answer: `一句话结论：幂等 token 是「先取 token、提交时校验并删除 token」的防重机制，靠 token 一次性保证同一请求只处理一次。

【流程】
1. 进入表单页时，服务端生成唯一 token 存入 Redis（或返回前端）；
2. 提交请求时带上 token；
3. 服务端原子地「校验 token 存在 → 删除 token」；
4. 若 token 不存在，说明是重复提交，直接拒绝。

【关键】校验+删除必须原子（Lua 脚本），否则并发下仍会重复。

【适用】表单重复提交、下单防重、支付防重。

【面试追问】token 方案 vs 唯一索引？→ token 适合「前端可控」的防重；唯一索引更兜底、不依赖流程，可结合使用。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-093', category: 'backend', tags: ['缓存', '一致性'], difficulty: 3,
      question: '延迟双删为什么仍可能不一致？有什么更可靠的方案？',
      answer: `一句话结论：延迟双删（先删缓存→更新 DB→延迟再删）能降低但不彻底消除不一致；更可靠的是「订阅 binlog 异步更新缓存（Canal）」。

【延迟双删的不足】
1. 延迟时间难以精确（取决于主从延迟与业务耗时）；
2. 「更新 DB 成功、第二次删除前」窗口期仍可能读到脏数据；
3. 删除失败需重试机制兜底。

【更可靠方案】
1. 订阅 binlog（Canal）→ 消费更新缓存：DB 是唯一事实源，缓存严格跟随 DB；
2. 先更新 DB → 再删缓存（Cache Aside 变体）：配合消息队列保证删缓存必成功；
3. 终极一致 + 兜底：给缓存设短 TTL，即使不一致也会自动过期。

【避坑】「先删缓存再更新 DB」在高并发下易产生脏数据，推荐「先更 DB 再删缓存」。`,
      source: '大厂八股文 / 缓存一致性'
    },
    {
      id: 'be-094', category: 'backend', tags: ['限流', '网关'], difficulty: 2,
      question: '接口限流如何在网关层实现？有哪些维度？',
      answer: `一句话结论：网关是限流的理想位置（统一入口），按「接口、应用、用户、IP、热点参数」等多维度，用令牌桶/滑动窗口算法实现。

【实现要点】
1. 维度：按 API 路径、调用方 appId、用户、IP、全局；
2. 算法：令牌桶（允许突发）、滑动窗口（平滑）、漏桶（恒定）；
3. 存储：单机内存（简单）或 Redis（分布式，需原子性 Lua）；
4. 降级：限流时返回 429 或友好提示。

【实现工具】网关内置（如 APISIX/Sentinel 网关流控）、Redis + Lua。

【面试追问】网关限流和业务限流的区别？→ 网关做「粗粒度入口保护」，业务做「细粒度热点/参数限流」，两者配合。`,
      source: '大厂八股文 / 限流'
    },
    {
      id: 'be-095', category: 'backend', tags: ['安全', '架构'], difficulty: 2,
      question: '什么是零信任（Zero Trust）安全模型？核心原则是什么？',
      answer: `一句话结论：零信任的核心是「永不信任、始终验证」——不因设备在内网就默认可信，每次访问都要鉴权与校验。

【核心原则】
1. 网络位置不等于信任：内网不再默认可信；
2. 持续验证：每次请求都验证身份、设备、权限；
3. 最小权限：只授予完成工作所需的最小权限；
4. 假设已遭入侵：按「已被攻破」设计，横向移动受限。

【实践手段】微隔离（mTLS）、身份认证（多因素）、动态访问控制、细粒度授权（如服务间 mTLS + 授权策略）。

【应用】Service Mesh 的 mTLS 是零信任在微服务中的落地。

【面试追问】与传统边界安全区别？→ 传统「内网可信、边界防御」，零信任「内外都不默认可信」。`,
      source: '大厂八股文 / 安全'
    },
    {
      id: 'be-096', category: 'backend', tags: ['安全', 'mTLS'], difficulty: 2,
      question: '什么是 mTLS（双向 TLS）？它解决什么问题？',
      answer: `一句话结论：mTLS 在普通 TLS（服务端向客户端证明身份）基础上，要求客户端也出示证书，实现双向身份认证。

【单向 TLS】客户端验证服务端证书，服务端不验证客户端（靠密码/token 认证）。

【双向 mTLS】双方都出示证书并互相验证，适用于服务间通信，确保「对端确实是我信任的服务」。

【流程】在 TLS 握手基础上增加：服务端请求客户端证书 → 客户端发送证书 → 服务端验证。

【应用】微服务间零信任通信（Service Mesh/Envoy）、金融/政企高安全场景、K8s 内部组件。

【面试追问】mTLS 的代价？→ 证书管理复杂（签发/轮换/吊销）、握手开销略增，需配合 SPIRE/Cert-Manager 等自动管理。`,
      source: '大厂八股文 / mTLS'
    },
    {
      id: 'be-097', category: 'backend', tags: ['MySQL', '读写分离'], difficulty: 2,
      question: '读写分离的实现方式有哪些？如何保证读从库的一致性？',
      answer: `一句话结论：读写分离靠中间件/框架路由实现（写主读从），一致性用「强制读主、半同步、延迟监控」等手段保障。

【实现方式】
1. 客户端/ORM 路由（如 MyBatis 多数据源）；
2. 中间件代理：MyCAT、ShardingSphere、Atlas；
3. 数据库自带：MySQL Group Replication + 读写分离插件。

【一致性保障】
1. 关键场景强制读主（事务、写后读）；
2. 半同步复制降低延迟与丢数据；
3. 监控主从延迟，延迟过大时切主库读；
4. 缓存兜底。

【面试追问】中间件路由 vs 客户端路由？→ 中间件无侵入但多一跳；客户端轻量但需各应用接入。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-098', category: 'backend', tags: ['注册中心', '微服务'], difficulty: 2,
      question: '注册中心如何做健康检查？心跳和主动探测有什么区别？',
      answer: `一句话结论：健康检查确保注册中心只返回可用实例，方式有「客户端心跳上报」和「服务端主动探测」两种。

【心跳上报】
· 客户端定时向注册中心发心跳续约；
· 超时未上报则判定不健康；
· 优点：减轻服务端压力、实时性好；
· 缺点：客户端「假死」但能上报时无法发现（如业务卡死）。

【主动探测】
· 服务端定时对实例发起健康检查请求（如 HTTP /health、TCP 探测）；
· 优点：能发现假死；缺点：服务端压力大、有探测延迟。

【实践】Nacos/Eureka 用心跳；Consul 支持健康检查；K8s 用 readiness/liveness 探针。

【面试追问】为什么要有「摘除保护」？→ 避免网络抖动导致大量实例被误判下线（如 Eureka 自我保护）。`,
      source: '大厂八股文 / 注册中心'
    },
    {
      id: 'be-099', category: 'backend', tags: ['线上问题', '内存泄漏'], difficulty: 3,
      question: '如何排查内存泄漏？堆转储和 GC 日志怎么分析？',
      answer: `一句话结论：内存泄漏排查靠「观察 GC 趋势 + 堆转储分析」，确认内存持续增长后定位 GC Roots 引用链，找到泄漏对象。

【排查步骤】
1. 观察：jstat 看 GC 频率与老年代增长，或监控内存曲线持续上涨；
2. 抓现场：jmap -dump:live 导出堆（或 OOM 时自动 dump）；
3. 分析：MAT/JProfiler 找 Dominator Tree 中占比异常的对象，看 Leak Suspects；
4. 定位：沿 GC Roots 引用链找到是谁持有泄漏对象（如静态集合、ThreadLocal、缓存）。

【GC 日志分析】开启 -Xlog:gc，看 Full GC 是否频繁且回收不了多少（内存泄漏典型特征）。

【常见泄漏】静态集合无限 add、ThreadLocal 未 remove、连接/流未关闭、监听器未注销、缓存无上限。`,
      source: '牛客面经高频'
    },
    {
      id: 'be-100', category: 'backend', tags: ['线上问题', '综合'], difficulty: 3,
      question: '讲一次你处理过的线上故障，你是如何排查和解决的？（综合题）',
      answer: `一句话结论：回答线上故障要按「现象 → 快速止血 → 定位根因 → 修复验证 → 复盘改进」的完整链路，突出方法论而非背答案。

【回答框架】
1. 现象：什么时间、什么指标异常（如接口 500 率飙升、延迟突增）；
2. 止血：先限流/降级/回滚，控制影响面，恢复可用；
3. 定位：看监控告警、链路追踪、日志（按 traceId）、DB 慢查询，逐层定位；
4. 根因：说明真正原因（如慢 SQL、缓存击穿、连接池耗尽、代码 bug）；
5. 修复：改代码/加索引/优化配置，灰度上线验证；
6. 复盘：加监控告警、补充测试、写文档，防止复发。

【加分】能体现「先恢复后定位」的优先级意识，以及用数据（监控/链路）而非猜测定位。

【避坑】不要只讲「改了某行代码」，要体现完整排查思路与可量化的改进。`,
      source: '大厂面试真题'
    }
  ];

  global.App = global.App || {};
  global.App.be2Bank = BE2;
})(window);
