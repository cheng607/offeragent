/**
 * OfferAgent · 扩充题库（数据库 · 第三批：MySQL 内核 / 锁与事务 / 高可用架构）
 * 挂载到 global.App.db3Bank，由 bank.js 加载时合并。
 */
(function (global) {
  'use strict';

  var DB3 = [
    {
      id: 'db-101', category: 'database', tags: ['MySQL', 'InnoDB', '执行流程'], difficulty: 3,
      question: '一条 UPDATE 语句在 InnoDB 中是如何执行的？（与 SELECT 有何不同）',
      answer: `一句话结论：UPDATE 除了和 SELECT 一样走连接器→分析器→优化器→执行器，还会经历「修改 Buffer Pool 页 → 写 undo log → 写 redo log（两阶段提交）→ 写 binlog」。

【完整流程】
1. 连接器：建立连接、权限校验；
2. 分析器：词法/语法解析；
3. 优化器：选择索引、生成执行计划；
4. 执行器：调用存储引擎接口找到目标行（走索引或全表扫描）；
5. 修改：把数据页读入 Buffer Pool，加锁，修改内存中的页（脏页）；
6. 写 undo log：记录旧值，用于回滚和 MVCC；
7. 写 redo log（prepare 阶段）：保证崩溃恢复；
8. 写 binlog：记录逻辑日志（用于主从复制、归档）；
9. redo log 提交（commit 阶段）：两阶段提交保证 redo 与 binlog 一致。

【两阶段提交】
先 redo prepare → 写 binlog → redo commit；崩溃时通过判断 binlog 是否完整来决定回滚还是提交，保证主从一致。

【与 SELECT 区别】
· SELECT 走 MVCC 快照读，通常不加锁；
· UPDATE 是当前读，要加行锁（X 锁），并产生 undo/redo/binlog。

【避坑】redo 是物理日志（页级），binlog 是逻辑日志（语句/行级），两者用途不同，别混淆。`,
      source: 'MySQL 45 讲 / InnoDB 内核'
    },
    {
      id: 'db-102', category: 'database', tags: ['MySQL', 'Buffer Pool', 'LRU'], difficulty: 3,
      question: 'InnoDB 的 Buffer Pool 是什么？它的 LRU 为何要「冷热分离」？',
      answer: `一句话结论：Buffer Pool 是 InnoDB 的内存缓存区，缓存数据页和索引页；为避免全表扫描污染缓存，采用冷热分离的 LRU 变体。

【Buffer Pool 作用】
1. 缓存磁盘数据页，减少磁盘 IO；
2. 修改先发生在内存页（脏页），由后台线程刷盘；
3. 大小由 innodb_buffer_pool_size 控制，通常设为物理内存的 60%~80%。

【LRU 冷热分离（新老代）】
1. LRU 链表分两段：前段 5/8 是「热区」（young），后段 3/8 是「冷区」（old）；
2. 新读入的页先放冷区头部（不是热区）；
3. 只有冷区的页被再次访问且停留时间超过阈值（innodb_old_blocks_time，默认 1s）才晋升热区；
4. 全表扫描读入的大量页放在冷区，很快被淘汰，不污染热区。

【为什么需要】若用朴素 LRU，一次大表扫描会把常用热数据全部挤出缓存，导致后续查询大量回磁盘。

【相关参数】innodb_buffer_pool_instances（多实例减少锁竞争）、innodb_flush_method 等。

【避坑】Buffer Pool 越大不一定越好，太大可能导致内存换页反而变慢；预热可用 buffer pool load。`,
      source: 'MySQL 官方文档 / InnoDB 内核'
    },
    {
      id: 'db-103', category: 'database', tags: ['MySQL', '主键', 'B+树'], difficulty: 3,
      question: '为什么建议用自增主键？UUID 或随机主键对 B+ 树有什么影响？',
      answer: `一句话结论：自增主键插入时是顺序追加，B+ 树只需在右侧新增页，页分裂少、空间利用率高；随机主键会导致频繁页分裂和碎片。

【自增主键优势】
1. 顺序插入：新记录永远追加到最右叶子，避免页分裂；
2. 页利用率高：叶子页填充充分（约 15/16 后自然分裂）；
3. 二级索引更小：二级索引叶子存主键值，自增主键通常更短（bigint 8 字节）。

【随机主键（UUID/雪花）问题】
1. 插入位置随机，频繁页分裂，产生大量碎片；
2. 页利用率低，树变高，IO 增多；
3. 二级索引变大（UUID 字符串长），占用更多空间。

【UUID 的缓解】
· 用有序 UUID（UUIDv7 / 雪花算法）替代随机 UUID，兼顾全局唯一与顺序性。

【追问】分布式场景必须全局唯一怎么办？→ 用雪花算法（时间有序）或「业务段 + 自增」复合键，尽量保持递增趋势。

【避坑】并非所有场景都用自增主键，但插入频繁的大表应优先保证主键「递增趋势」，避免随机性。`,
      source: 'MySQL 45 讲 / 索引设计'
    },
    {
      id: 'db-104', category: 'database', tags: ['MySQL', 'count', '性能'], difficulty: 2,
      question: 'count(*)、count(1)、count(主键)、count(字段) 有什么区别？谁更快？',
      answer: `一句话结论：count(*) 和 count(1) 语义相同且性能相当；count(字段) 会忽略该字段为 NULL 的行，性能通常更差。

【区别】
1. count(*)：统计所有行数，优化器会选最小的索引扫描，不读字段值；
2. count(1)：同样统计所有行，1 是常量，等价 count(*)；
3. count(主键)：主键非空，效果同 count(*)，但可能走主键索引（更大）；
4. count(字段)：只统计该字段非 NULL 的行，需读取字段判断，最慢。

【实现层面】
· InnoDB 中 count 是遍历索引统计，没有保存行数（因为 MVCC 下不同事务看到不同行数）；
· MyISAM 会保存总行数，count(*) 是 O(1)，但 MyISAM 不支持事务。

【性能排序】count(*) ≈ count(1) >= count(主键) > count(字段)。

【优化】
1. 建一个窄的二级索引，让 count 走它减少扫描量；
2. 大表精确计数可用「计数表」或业务上允许用估算值（information_schema 或 show table status 的估算）。

【追问】为什么 InnoDB 不能像 MyISAM 那样存行数？→ 因为 MVCC 并发下，不同事务的可见行数不同，无法用单一值表示。

【避坑】别用 count(字段) 来「统计行数」，它会把 NULL 排除，结果可能偏小。`,
      source: 'MySQL 45 讲 / 大厂八股'
    },
    {
      id: 'db-105', category: 'database', tags: ['MySQL', '事务', '幻读'], difficulty: 3,
      question: '什么是幻读？InnoDB 如何解决幻读？（MVCC + 间隙锁）',
      answer: `一句话结论：幻读指同一事务内两次范围查询「多出了」新插入的行；InnoDB 在可重复读下用 MVCC 快照读 + 当前读的间隙锁/临键锁解决。

【幻读定义】
事务 A 第一次 SELECT 范围得到 N 行，事务 B 插入了一行落在该范围内并提交，事务 A 再次相同查询得到 N+1 行，多出的行即「幻影」。

【解决机制（分两种读）】
1. 快照读（普通 SELECT）：走 MVCC，读取事务开始时的快照，天然看不到后来插入的行；
2. 当前读（SELECT ... FOR UPDATE / UPDATE / DELETE）：加间隙锁（Gap Lock）或临键锁（Next-Key Lock），锁住索引区间，阻止其他事务在区间内插入。

【临键锁 Next-Key Lock】
= 行锁 + 间隙锁，锁住「记录本身 + 它前面的间隙」，是 RR 隔离级别下默认的加锁方式，既防幻读又防重复读。

【追问】RR 下为什么还需要间隙锁？→ 因为 MVCC 只解决快照读的幻读，当前读必须靠锁解决，否则并发更新会出问题。

【避坑】间隙锁只在可重复读（RR）级别下生效；读提交（RC）下没有间隙锁，会有幻读。`,
      source: 'MySQL 45 讲 / InnoDB 锁'
    },
    {
      id: 'db-106', category: 'database', tags: ['MySQL', '索引', 'change buffer'], difficulty: 3,
      question: '唯一索引和普通索引在「查询」和「更新」上有什么区别？（change buffer）',
      answer: `一句话结论：查询上唯一索引找到即停、普通索引要继续往后找一条，性能差异微乎其微；更新上普通索引可利用 change buffer 延迟写盘，性能更好。

【查询差异】
· 唯一索引：命中后立即返回（等值查询）；
· 普通索引：命中后还要判断下一条是否相等，多一次比较，但差异极小。

【更新差异（核心）】
1. 普通索引：更新时若目标数据页不在内存，可先写入 change buffer（内存中的变更缓存），等后续读该页或后台刷盘时再合并，减少随机 IO；
2. 唯一索引：更新时必须读盘判断唯一性，无法用 change buffer 优化，因为要保证唯一约束。

【change buffer 适用场景】
· 写多读少（如日志、账单流水）收益大；
· 写后立刻读的场景收益小（反正要读盘）。

【相关参数】innodb_change_buffer_max_size。

【追问】change buffer 和 redo log 有什么区别？→ change buffer 是「页还没读进来时的内存缓存」，redo log 是持久化的物理日志，崩溃恢复用。

【避坑】唯一索引的业务语义（如身份证号）优先于性能，只有性能关键且可容忍重复时才用普通索引 + 业务去重。`,
      source: 'MySQL 45 讲 / InnoDB'
    },
    {
      id: 'db-107', category: 'database', tags: ['MySQL', '锁', 'InnoDB'], difficulty: 3,
      question: 'MySQL 的锁有哪些？表锁、行锁、意向锁、间隙锁分别是什么？',
      answer: `一句话结论：按粒度分表锁和行锁；InnoDB 还有意向锁（表级，快速判断行锁冲突）、记录锁、间隙锁和临键锁。

【表锁】
· 锁整张表，粒度大、并发低；MyISAM 只支持表锁；
· LOCK TABLES / ALTER 等操作会用到。

【行锁（记录锁 Record Lock）】
· 锁住单条索引记录；InnoDB 默认，粒度细、并发高；
· 注意：行锁是加在「索引」上的，没走索引会退化成锁全表。

【意向锁（Intention Lock）】
· 表级锁：IS（意向共享）、IX（意向排他）；
· 作用：加行锁前先加意向锁，其他事务加表锁时无需逐行检查，快速判断是否冲突。

【间隙锁 Gap Lock】
· 锁住索引记录之间的间隙，防止幻读；
· 只在 RR 隔离级别下存在。

【临键锁 Next-Key Lock】
· 记录锁 + 间隙锁，锁「记录 + 前间隙」；
· RR 下默认加锁方式。

【加锁场景速记】
· SELECT 快照读不加锁；SELECT ... FOR UPDATE / LOCK IN SHARE MODE 加锁；
· 主键等值：记录锁；非唯一索引等值：间隙+记录；范围：临键锁。

【避坑】无索引的 UPDATE 会锁全表，务必走索引；死锁排查看 SHOW ENGINE INNODB STATUS。`,
      source: 'MySQL 45 讲 / InnoDB 锁机制'
    },
    {
      id: 'db-108', category: 'database', tags: ['MySQL', '隔离级别', '并发'], difficulty: 2,
      question: '脏读、不可重复读、幻读分别是什么？各隔离级别如何解决？',
      answer: `一句话结论：脏读是读到未提交数据，不可重复读是同一行被改，幻读是范围查询多出/少了行；隔离级别越高越能避免，但并发越低。

【三种问题】
1. 脏读：事务 A 读到事务 B 未提交的修改，B 回滚后 A 读到的是脏数据；
2. 不可重复读：同一事务两次读同一行，值不同（被别的事务 UPDATE 提交）；
3. 幻读：同一事务两次范围查询，行数不同（被别的事务 INSERT 提交）。

【四种隔离级别】
1. 读未提交（Read Uncommitted）：都不解决，可能脏读；
2. 读提交（RC）：解决脏读，仍有不可重复读和幻读；
3. 可重复读（RR，MySQL 默认）：解决脏读+不可重复读，配合间隙锁基本解决幻读；
4. 串行化（Serializable）：全部解决，但性能最低。

【MySQL 实现】
· RC/RR 用 MVCC 快照 + 锁实现；
· RR 下快照读靠 MVCC 避免不可重复读，当前读靠临键锁避免幻读。

【追问】Oracle 默认是 RC，MySQL 默认是 RR，为什么？→ 历史与主从复制 binlog 格式相关（statement 格式下 RR 更安全）。

【避坑】「不可重复读」针对 UPDATE/DELETE（同一行），「幻读」针对 INSERT（行数），两者本质不同，面试别混。`,
      source: 'MySQL 官方 / 大厂八股'
    },
    {
      id: 'db-109', category: 'database', tags: ['MySQL', '分页', '优化'], difficulty: 3,
      question: '深分页（limit 100000,10）为什么慢？如何优化？',
      answer: `一句话结论：深分页需要扫描并丢弃前面大量行，越往后越慢；用「覆盖索引 + 延迟关联」或「记录上次位置」优化。

【为什么慢】
1. limit offset, size 会扫描 offset + size 行，然后丢弃前 offset 行；
2. offset 越大，扫描和回表越多，随机 IO 越多；
3. 深分页时可能走全表扫描而非索引。

【优化方案】
1. 覆盖索引 + 延迟关联：
   SELECT * FROM t
   JOIN (SELECT id FROM t ORDER BY id LIMIT 100000, 10) AS tmp
   ON t.id = tmp.id;
   先在索引上只取 id（覆盖索引，快），再回表取完整行（只 10 行）；
2. 记录上次位置（游标）：
   WHERE id > 上次最大 id ORDER BY id LIMIT 10，适合翻页顺序递增；
3. 业务上限制最大翻页深度（如最多翻 100 页）。

【追问】为什么「记录上次位置」更快？→ 因为它直接定位到起始行，无需扫描和丢弃前 N 行，复杂度 O(size)。

【避坑】「记录上次位置」不支持任意跳页；延迟关联要求排序字段有索引。`,
      source: 'MySQL 45 讲 / 分页优化'
    },
    {
      id: 'db-110', category: 'database', tags: ['MySQL', '索引', '最左前缀'], difficulty: 2,
      question: '联合索引的「最左前缀原则」是什么？哪些情况会失效？',
      answer: `一句话结论：联合索引 (a,b,c) 只有在查询条件以 a 开头（a、a+b、a+b+c）时才能走索引，跳过 a 直接查 b 或 c 会失效。

【最左前缀原则】
1. 联合索引按 (a, b, c) 的顺序组织，等价于先按 a 排序、再按 b、再按 c；
2. 查询必须从最左列 a 开始，中间不能断（可含 a+b，或 a+c 但只用到 a）。

【失效场景】
1. 不满足最左前缀：where b = ?（无 a）；
2. 索引列上做运算/函数：where year(col) = 2020、col + 1 = 5；
3. 隐式类型转换：字符串列与数字比较（col = 123 时 col 被转数字，索引失效）；
4. like 以 % 开头：like '%xx'；
5. 范围查询后的列失效：where a = 1 and b > 2 and c = 3，c 无法走索引；
6. or 连接非索引列。

【优化建议】
1. 把等值、高区分度列放前面；
2. 范围查询列放最后；
3. 尽量使用覆盖索引。

【追问】为什么「范围列之后的索引列」会失效？→ 因为 b 是范围，b 之后无法保证 c 有序，索引只能用到 b。

【避坑】最左前缀是「列的顺序」而非「条件的书写顺序」，优化器会自动调整 where 中的条件顺序。`,
      source: 'MySQL 45 讲 / 索引失效'
    },
    {
      id: 'db-111', category: 'database', tags: ['MySQL', '索引', '前缀索引'], difficulty: 2,
      question: '长字符串字段（如 URL、邮箱）如何建索引？前缀索引怎么权衡？',
      answer: `一句话结论：长字符串用「前缀索引」只索引前 N 个字符，节省空间；但会损失区分度，可能导致回表次数增多。

【前缀索引】
1. 只对列的前缀建索引：ALTER TABLE t ADD INDEX idx(email(10));
2. 前缀长度 N 要选得足够有区分度。

【选择 N 的方法】
· 计算不同 N 下的区分度（distinct 前缀数 / 总行数），选接近全列区分度的最小 N；
· 如：SELECT COUNT(DISTINCT LEFT(email, N)) / COUNT(*) FROM t 多试几个 N。

【优缺点】
· 优点：索引更小，省空间、更快；
· 缺点：无法用前缀索引做 ORDER BY / GROUP BY，也无法做覆盖索引（需回表）。

【其他方案】
1. 倒序存储 + 前缀索引：适合前缀相同、后缀区分度高的字符串（如身份证）；
2. 哈希字段：额外存一列 CRC32/MD5 短哈希建索引，但要处理哈希冲突；
3. 全文索引 / 搜索引擎：适合模糊搜索场景。

【追问】为什么前缀索引无法覆盖？→ 索引里只有前缀，没有完整值，必须回表取完整字段。

【避坑】前缀长度太短会导致大量重复前缀、回表增多，甚至不如全表扫描；要实测区分度。`,
      source: 'MySQL 45 讲 / 索引设计'
    },
    {
      id: 'db-112', category: 'database', tags: ['MySQL', '优化', '大字段'], difficulty: 2,
      question: '大字段（TEXT/BLOB）和大数据量表有哪些优化手段？',
      answer: `一句话结论：大字段应「拆表或单独存」，避免占用主表行与缓冲池；大数据量表靠分区、归档、分库分表、读写分离等解决。

【大字段（TEXT/BLOB）优化】
1. 拆表：把大字段放到独立表，主表只存必要字段；
2. 存储分离：大文本/图片存对象存储（OSS/COS），DB 只存 URL；
3. 前缀索引：对大字段只建前缀索引；
4. 压缩：启用页压缩或应用层压缩；
5. 避免 SELECT *：大字段会影响 Buffer Pool 命中率。

【大数据量表优化】
1. 分区表：按时间等维度分区，方便裁剪和归档；
2. 归档冷数据：历史数据迁移到归档库/冷存储；
3. 分库分表：水平拆分，分散单表压力；
4. 读写分离：主写从读，扩展读能力；
5. 合理索引 + 覆盖索引 + 查询优化。

【追问】TEXT/BLOB 为什么影响性能？→ 数据量大时可能行外存储，读取要额外 IO，且占用缓冲池空间。

【避坑】不要在含大字段的表上做全表 SELECT *；大字段的排序/分组也尽量避开。`,
      source: 'MySQL 优化实践 / 大厂八股'
    },
    {
      id: 'db-113', category: 'database', tags: ['MySQL', '主从', '延迟'], difficulty: 3,
      question: '主从复制为什么会延迟？有哪些解决方案？',
      answer: `一句话结论：主从延迟源于主库并发写、从库单线程回放或慢 SQL；通过并行复制、半同步、读写分离策略等缓解。

【延迟原因】
1. 从库单线程回放：老版本从库 SQL 线程串行执行 relay log，跟不上主库并发；
2. 主库大事务/DDL：一个长事务在从库回放很久；
3. 从库硬件弱或负载高（读多）；
4. 网络延迟。

【解决方案】
1. 并行复制：MySQL 5.7+ 的 MTS（多线程复制），按库/组提交并行回放；
2. 半同步复制（semi-sync）：主库等待至少一个从库确认，减少数据丢失，但会增加主库延迟；
3. 拆分大事务，避免长时间锁；
4. 提升从库配置（SSD、更多核）；
5. 读写分离时对「实时性要求高」的读走主库，容忍延迟的读走从库。

【追问】半同步和异步复制的区别？→ 异步主库不等从库；半同步至少等一个从库 ack，可靠性更高但性能略降。

【避坑】读写分离一定要处理「主从延迟」：刚写完立刻读可能读到旧数据，需延迟读或强制走主库。`,
      source: 'MySQL 高可用 / 大厂八股'
    },
    {
      id: 'db-114', category: 'database', tags: ['MySQL', '高可用', '架构'], difficulty: 3,
      question: '如何设计一个高可用的 MySQL 架构？（主从、MHA、MGR）',
      answer: `一句话结论：高可用核心是「冗余 + 自动故障切换」，常见方案有主从复制 + 半同步 + 故障切换工具、MHA、以及原生 MGR/InnoDB Cluster。

【方案对比】
1. 主从 + MHA：一主多从，主库故障时 MHA 自动选新主、补数据，切换秒级~几十秒；
2. 半同步复制：主库提交需从库确认，保证数据不丢，但性能有损；
3. MGR（组复制）：多主/单主模式，基于 Paxos 协议，节点间强一致，自动选主；
4. InnoDB Cluster：MGR + MySQL Shell + Router 的一体化方案；
5. 云上 RDS/托管：直接用云厂商的 HA 能力。

【高可用关键组件】
· 故障检测（心跳）、自动切换（VIP/代理）、数据一致性保障、读写分离路由。

【追问】主库宕机后如何保证数据不丢？→ 半同步复制 + binlog 及时落盘（sync_binlog=1）+ redo 刷盘（innodb_flush_log_at_trx_commit=1）。

【避坑】纯异步主从在主库宕机时会丢最近的事务；高可用方案要配合监控与切换演练。`,
      source: 'MySQL 高可用架构 / MHA / MGR'
    },
    {
      id: 'db-115', category: 'database', tags: ['分库分表', '跨库', '分布式'], difficulty: 4,
      question: '分库分表后，跨库 JOIN、分页、聚合统计等全局查询怎么做？',
      answer: `一句话结论：分库分表后要避免跨库 JOIN，改用「冗余字段、应用层聚合、数据同步到数仓/中间件」等方式解决全局查询。

【常见难题与解法】
1. 跨库 JOIN：无法直接 join，方案是「字段冗余」把关联数据冗余到同一分片，或「应用层分两次查再组装」；
2. 分页排序：各分片取前 N 页数据到应用层归并排序，深分页很痛苦；改进用「全局有序 ID + 记录游标」；
3. 聚合统计（count/sum）：各分片算完在应用层汇总，或同步到 ES/数仓做 OLAP；
4. 全局唯一 ID：用雪花算法/发号器，避免各分片自增冲突。

【设计原则】
1. 尽量按「查询最频繁的维度」选分片键，让大多数查询落在单分片；
2. 能冗余就冗余，换取免跨库查询；
3. 复杂分析查询走数据同步（binlog → 数仓/ES），不在分片上做。

【追问】分片键如何选？→ 选高区分度、查询命中率高、增长均匀的字段（如 userId），避免热点。

【避坑】分库分表不是万能的，先优化索引/SQL/架构，数据量真到亿级再考虑；一旦拆分，跨片查询复杂度陡增。`,
      source: 'ShardingSphere / 分库分表实践'
    },
    {
      id: 'db-116', category: 'database', tags: ['MySQL', 'DDL', '运维'], difficulty: 3,
      question: '大表如何做在线 DDL（加字段/加索引）而不长时间锁表？',
      answer: `一句话结论：用在线 DDL（InnoDB 的 Online DDL）或 gh-ost / pt-online-schema-change 等工具，在拷贝/变更过程中尽量不阻塞读写。

【方案一：MySQL 在线 DDL】
· InnoDB 支持部分 Online DDL，通过 ALGORITHM=INPLACE（不重建表）或 COPY；
· 加二级索引可用 INPLACE，仅短暂加元数据锁，基本不阻塞 DML；
· 加字段用 INSTANT（8.0）可瞬间完成，仅改元数据。

【方案二：gh-ost / pt-osc】
1. 原理：创建一张结构相同的新表，把原表数据分批复制过去，同时通过 binlog 增量同步变更；
2. 复制完成后，短暂锁表切换表名；
3. 全程对业务影响极小，且可随时暂停。

【注意点】
1. 避免在业务高峰期做 DDL；
2. 关注磁盘空间（copy 需要额外空间）；
3. 主从环境下注意 DDL 对从库的影响；
4. 设置合理的批次大小，控制主从延迟。

【追问】为什么 gh-ost 比直接 ALTER 更安全？→ 它用「影子表 + binlog 同步」方式，可控制速度、可暂停，切换时锁表时间极短。

【避坑】Online DDL 并非完全不锁，某些操作仍会锁；大表操作前务必在测试环境验证。`,
      source: 'gh-ost / pt-osc / MySQL 8.0'
    },
    {
      id: 'db-117', category: 'database', tags: ['MySQL', '8.0', '特性'], difficulty: 2,
      question: 'MySQL 8.0 相比 5.7 有哪些重要新特性？',
      answer: `一句话结论：MySQL 8.0 带来窗口函数、CTE、原子 DDL、隐藏索引、降序索引、JSON 增强、更好的优化器与运维能力。

【重要新特性】
1. 窗口函数：ROW_NUMBER / RANK / DENSE_RANK / LAG 等，方便做排名、累计；
2. 通用表表达式 CTE：WITH 语句，支持递归查询；
3. 原子 DDL：DDL 要么成功要么回滚，不再出现中间状态；
4. 隐藏索引：INVISIBLE 索引，可先隐藏观察再删除；
5. 降序索引：支持 DESC 索引，优化排序；
6. 默认 utf8mb4 + utf8mb4_0900_ai_ci 排序规则；
7. 优化器改进：更好的直方图、不可见索引、哈希连接；
8. 安全与账户：默认 caching_sha2_password，角色（Role）支持；
9. 持久化自增值、redo log 优化等。

【追问】窗口函数解决了什么问题？→ 以前做「分组内排名」要写复杂子查询/变量，窗口函数一条 SQL 搞定。

【避坑】8.0 默认认证插件 caching_sha2_password，老客户端/驱动可能连不上，需注意兼容性。`,
      source: 'MySQL 8.0 官方文档'
    },
    {
      id: 'db-118', category: 'database', tags: ['Redis', '性能', '单线程'], difficulty: 2,
      question: 'Redis 为什么这么快？单线程模型与 IO 多路复用是什么？',
      answer: `一句话结论：Redis 快在于「纯内存操作 + 高效数据结构 + IO 多路复用 + 单线程避免锁竞争」；6.0 后网络读写引入多线程，但命令执行仍是单线程。

【快的原因】
1. 纯内存：数据都在内存，读写纳秒级；
2. 单线程执行命令：避免线程切换和锁竞争开销；
3. IO 多路复用：单线程通过 epoll 同时监听多个连接，高效处理高并发；
4. 高效数据结构：SDS、跳表、压缩列表等，复杂度低；
5. 渐进式 rehash、惰性删除等设计减少阻塞。

【单线程的争议】
· 传统理解是「单线程」，其实 6.0 后网络 IO 读写用多线程（io-threads），但「命令执行」仍然是单线程，保证原子性和顺序。

【为什么单线程反而快】
· 瓶颈在内存和网络，不在 CPU；多线程会带来锁竞争和上下文切换，得不偿失。

【追问】单线程的潜在问题？→ 单个耗时命令（KEYS、大 key 删除）会阻塞其他命令，需用 SCAN、异步删除等规避。

【避坑】「Redis 是单线程」要限定为「命令执行单线程」，6.0 后网络部分已多线程。`,
      source: 'Redis 官方 / 大厂八股'
    },
    {
      id: 'db-119', category: 'database', tags: ['Redis', '数据结构', '底层'], difficulty: 3,
      question: 'Redis 各数据类型的底层实现是什么？（SDS、ziplist、skiplist）',
      answer: `一句话结论：Redis 的每种数据类型都由更底层的数据结构实现，如 String 用 SDS，List 用 quicklist，ZSet 用 skiplist + dict，Hash/Set 用 dict 或 listpack。

【底层实现对应】
1. String：SDS（简单动态字符串），记录长度、预分配空间，O(1) 取长度，二进制安全；
2. List：quicklist（由多个 ziplist/listpack 组成的双向链表），兼顾内存与性能；
3. Hash：小数据用 listpack，大数据用 hashtable（dict）；
4. Set：小数据用 intset（整数集合），大数据用 hashtable；
5. ZSet：跳表 skiplist + dict，跳表用于范围查询和排序，dict 用于 O(1) 查分数。

【关键结构】
1. SDS：len + free + buf，避免 C 字符串的 strlen O(n) 和缓冲区溢出；
2. 跳表：多层链表，查找/插入/删除 O(log n)，支持范围查询；
3. dict：渐进式 rehash，扩容时不阻塞。

【为什么 ZSet 用跳表不用红黑树】→ 跳表实现简单、支持高效范围查询，且更适合内存结构。

【避坑】版本差异：旧版用 ziplist，7.0 后逐步用 listpack 替代（更安全，避免连锁更新）。`,
      source: 'Redis 设计与实现'
    },
    {
      id: 'db-120', category: 'database', tags: ['MySQL', 'MVCC', '一致性读'], difficulty: 3,
      question: 'MVCC 中的「快照读」和「当前读」有什么区别？',
      answer: `一句话结论：快照读读取的是事务开始时的版本快照（不加锁），当前读读取的是最新已提交版本并加锁。

【快照读（Snapshot Read）】
1. 普通 SELECT 语句；
2. 基于 MVCC，读取事务开始时的 Read View 决定的可见版本；
3. 不加锁，并发高；
4. 例：SELECT * FROM t WHERE id = 1;

【当前读（Current Read）】
1. 读取记录的最新版本，并加锁防止其他事务修改；
2. 包括：SELECT ... FOR UPDATE、SELECT ... LOCK IN SHARE MODE、UPDATE、DELETE、INSERT；
3. 读取的是最新已提交数据（加锁后当前值）。

【MVCC 如何实现快照】
· 每行有隐藏列 trx_id（最近修改事务）和 roll_pointer（回滚指针指向 undo log）；
· Read View 记录活跃事务列表，据此判断某个版本是否可见；
· 通过 undo log 版本链回溯到可见版本。

【追问】为什么「快照读不加锁却能读到一致数据」？→ 因为 MVCC 通过版本链 + Read View 构造一致性视图，而不是靠锁。

【避坑】同一事务中，快照读读到的是事务开始时的快照，当前读读到的是最新值，两者结果可能不同，面试常考。`,
      source: 'MySQL 45 讲 / MVCC'
    }
  ];

  global.App = global.App || {};
  global.App.db3Bank = DB3;
})(window);
