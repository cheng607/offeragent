/**
 * OfferAgent · 扩充题库（数据库 · 第二批：db-021 ~ db-100）
 * 挂载到 global.App.db2Bank，由 bank.js 加载时合并。
 * 答案采用「一句话结论 + 完整解答」范式。
 */
(function (global) {
  'use strict';

  var DB2 = [
    {
      id: 'db-021', category: 'database', tags: ['InnoDB', '存储结构'], difficulty: 2,
      question: 'InnoDB 的存储结构是怎样的？页（Page）和 B+ 树是什么关系？',
      answer: `一句话结论：InnoDB 以「页（默认 16KB）」为最小存储与读写单位，通过 B+ 树把页组织成索引，叶子节点存实际数据。

【存储结构】表空间（Tablespace）→ 段（Segment）→ 区（Extent，1MB）→ 页（Page，16KB）→ 行（Row）。

【B+ 树与页的关系】B+ 树的每个节点对应一个页；非叶子节点存「键 + 子页指针」，叶子节点存完整行数据（聚簇索引）或主键值（二级索引）。

【页结构】File Header、Page Header、Infimum/Supremum、User Records（用户记录）、Free Space、Page Directory、File Trailer。

【面试追问】为什么页默认 16KB？→ 与磁盘 IO 单位、操作系统页大小匹配，兼顾读写效率。

【避坑】行不能跨页（大字段溢出到溢出页）。`,
      source: '大厂八股文 / InnoDB'
    },
    {
      id: 'db-022', category: 'database', tags: ['索引'], difficulty: 2,
      question: '聚簇索引和非聚簇索引（二级索引）有什么区别？',
      answer: `一句话结论：聚簇索引的叶子节点存整行数据，表数据按聚簇索引物理排序；二级索引叶子节点存「索引键 + 主键值」，查到后需回表。

【聚簇索引】
· 一个表只有一个（InnoDB 默认主键）；
· 叶子存完整行，主键查询直接拿到数据；
· 数据按主键顺序存储，范围查询、排序高效。

【二级索引】
· 可以有多个；
· 叶子存主键值，查到主键后需「回表」到聚簇索引取数据；
· 覆盖索引可避免回表。

【面试追问】为什么二级索引不存完整数据？→ 节省空间，但维护一致性（更新时只改聚簇索引一处）。

【避坑】InnoDB 必须有聚簇索引：有主键用主键，否则用第一个非空唯一索引，再否则生成隐藏 row_id。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-023', category: 'database', tags: ['索引'], difficulty: 2,
      question: '联合索引的最左前缀原则是什么？为什么会有索引失效？',
      answer: `一句话结论：联合索引 (a,b,c) 相当于建了 a、(a,b)、(a,b,c) 三个索引；查询条件必须从最左列开始连续匹配才能命中。

【最左前缀】联合索引按列顺序排序，跳过最左列（如只用 b）无法利用索引（B+ 树按 a 排序，b 在 a 相同才有序）。

【失效案例】where b=1（跳过 a）失效；where a=1 and c=2（中间断 b）只能用到 a；范围查询后的列不生效（where a=1 and b>1 and c=2，c 用不到）。

【面试追问】为什么范围查询会断？→ 范围条件后，后续列在该范围内不再全局有序。

【避坑】设计联合索引要把「等值查询 + 区分度高的列」放前面。`,
      source: '大厂八股文 / 索引'
    },
    {
      id: 'db-024', category: 'database', tags: ['索引'], difficulty: 2,
      question: '什么是索引的选择性（区分度）？如何评估索引是否有效？',
      answer: `一句话结论：选择性 = 不重复的索引值 / 总记录数，越接近 1 区分度越高，索引效果越好。

【计算】区分度 = count(distinct 列) / count(*)。如性别只有男女，区分度极低，索引几乎无效。

【评估】用 explain 看是否走索引、扫描行数 rows 是否接近结果集；key_len 判断用了联合索引几列。

【设计原则】
1. 高区分度列优先建索引；
2. 联合索引把区分度高的列放前面；
3. 对低区分度列（状态、性别）单独建索引收益低。

【避坑】区分度低不等于不能用（如状态 + 时间组合可能有效），要结合查询模式。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-025', category: 'database', tags: ['索引'], difficulty: 2,
      question: '什么是前缀索引？适用于什么场景？如何确定前缀长度？',
      answer: `一句话结论：前缀索引只索引字符串的前 N 个字符，减少索引体积；适合长字符串列，但无法用于 order by / group by。

【适用】长 VARCHAR/TEXT 列，如 URL、长文本，只取前几位就能有足够区分度。

【确定长度】计算不同前缀长度下的区分度：select count(distinct left(col, N)) / count(*)，选区分度足够高且尽量短的长度。

【缺点】不能做覆盖索引、不能用于排序分组；可能增加回表（前缀相同需回表校验）。

【面试追问】前缀索引 vs 倒序存储？→ 对邮箱等可倒序存储 + 前缀索引，或改用哈希索引辅助。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-026', category: 'database', tags: ['索引'], difficulty: 2,
      question: '普通索引和唯一索引如何选择？它们在性能上有何差异？',
      answer: `一句话结论：唯一索引保证唯一性但影响写入性能（需额外判断冲突），普通索引写入更快；查询性能几乎相同。

【查询】两者都用 B+ 树，读性能基本一致。

【写入】唯一索引插入时需判断是否冲突（不能走 change buffer 优化），普通索引可直接写入 change buffer，因此普通索引写性能更好。

【选型】
· 业务上必须唯一（如手机号、身份证）→ 唯一索引；
· 只需加速查询、无唯一约束 → 普通索引。

【避坑】不要为了「看起来严谨」滥用唯一索引；唯一索引在可重复键场景会报错，反而要配合业务处理。`,
      source: '大厂八股文 / 索引'
    },
    {
      id: 'db-027', category: 'database', tags: ['索引', '实战'], difficulty: 3,
      question: '如何设计一个合理的索引？给一条 SQL 建索引的思路是什么？',
      answer: `一句话结论：索引设计围绕「最频繁的查询条件」，遵循等值优先、最左前缀、覆盖索引、避免过多索引的原则。

【设计步骤】
1. 分析查询：看 where、order by、group by、join 用到的列；
2. 等值条件列优先，按区分度排序组成联合索引；
3. 尽量用覆盖索引（把 select 的列也加入索引）避免回表；
4. 避免冗余与重复索引。

【原则】一个查询尽量只用一个索引；联合索引列顺序 = 等值在前、范围在后。

【面试追问】索引是不是越多越好？→ 否，索引占用空间、拖慢写入、增加维护成本。`,
      source: '大厂八股文 / 索引设计'
    },
    {
      id: 'db-028', category: 'database', tags: ['SQL'], difficulty: 1,
      question: 'count(*)、count(1)、count(列) 有什么区别？哪个更快？',
      answer: `一句话结论：count(*) 和 count(1) 都是统计总行数（含 NULL），性能几乎一样；count(列) 只统计该列非 NULL 的行数。

【区别】
· count(*)：统计所有行，MySQL 会优化选择最优索引扫描；
· count(1)：等价于 count(*)，每行返回 1 计数；
· count(列)：统计该列非 NULL 的行数，若列有索引走索引，无索引走全表。

【性能】InnoDB 下 count(*) ≈ count(1) > count(无索引列)；MyISAM 的 count(*) 因存了总行数是 O(1)。

【避坑】大表 count(*) 慢是 InnoDB 需扫描，可用近似值（information_schema）或缓存计数。

【面试追问】count(*) 会不会统计 NULL 行？→ 会，按行计数，不判断列值。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-029', category: 'database', tags: ['SQL', '优化'], difficulty: 2,
      question: 'order by 和 group by 如何优化？为什么会出现 filesort？',
      answer: `一句话结论：order by/group by 出现 filesort 说明没走索引排序，需临时排序；优化是「利用索引的有序性」或「减少排序数据量」。

【filesort 产生】排序字段无合适索引，MySQL 需额外排序（内存 sort_buffer，超限落盘）。

【优化】
1. 给排序字段建索引，利用索引天然有序；
2. 联合索引让 where 和 order by 用同一索引；
3. 减少排序数据量（先过滤再排序）；
4. group by 同理，可配合索引避免临时表。

【面试追问】group by 与 distinct 谁快？→ 有索引时 group by 常优于 distinct（前者可走索引扫描）。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-030', category: 'database', tags: ['SQL', '优化'], difficulty: 2,
      question: 'limit 深分页（如 limit 100000,10）为什么慢？如何优化？',
      answer: `一句话结论：limit 大偏移量会扫描并丢弃前 10 万行，越往后越慢；优化用「游标/延迟关联/覆盖索引」避免大量丢弃。

【为什么慢】limit 100000,10 要读出前 100010 行，再丢弃前 10 万行，IO 与扫描量大。

【优化方案】
1. 游标分页（推荐）：记住上一页最后一条的主键，where id > 上页末值 order by id limit 10；
2. 延迟关联：先查主键（覆盖索引），再回表查完整数据；
3. 覆盖索引 + 子查询定位起点。

【避坑】游标分页要求主键连续递增（自增），且不能随意跳页。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-031', category: 'database', tags: ['索引', '失效'], difficulty: 2,
      question: '为什么隐式类型转换会导致索引失效？',
      answer: `一句话结论：当条件两侧类型不一致时，MySQL 会做隐式类型转换，若转换发生在索引列上（如把字符串列和数字比较），索引失效。

【原理】如 phone 是 varchar，where phone = 123456 会触发 phone 列隐式转数字（CAST），列上套了函数，无法用索引。

【规则】MySQL 通常把「字符串转数字」而非「数字转字符串」，所以字符串列跟数字比较会失效；反之数字列跟字符串比较（如 where id='123'）一般还能走索引。

【避坑】参数类型要和字段类型一致；用参数化查询时尤其注意传入类型。

【面试追问】如何发现？→ explain 看 type 是否退化、是否有 Using index condition 等。`,
      source: '大厂八股文 / 索引失效'
    },
    {
      id: 'db-032', category: 'database', tags: ['索引', '失效'], difficulty: 2,
      question: '哪些操作会导致索引失效？函数、运算、like 等分别如何影响？',
      answer: `一句话结论：对索引列做函数、运算、隐式转换、前导通配符 like 等，都会让索引失效（列被处理，无法直接匹配）。

【常见失效】
1. 函数：where date(create_time) = '2026-01-01'（应改成范围）；
2. 运算：where age + 1 = 20（应改成 age = 19）；
3. 前导通配：where name like '%张'（like '张%' 可用索引）；
4. 隐式转换、or 连接非索引列、not in / !=（部分场景）。

【避坑】like 只有「左前缀」能走索引；对索引列要「保持原样」比较。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-033', category: 'database', tags: ['字符集'], difficulty: 1,
      question: 'utf8 和 utf8mb4 有什么区别？为什么要用 utf8mb4？',
      answer: `一句话结论：MySQL 的 utf8 实际是「阉割版」（最多 3 字节，不含 emoji 等 4 字节字符），utf8mb4 才是完整的 UTF-8。

【区别】utf8mb3（utf8）最多 3 字节，存不了 emoji、部分生僻字；utf8mb4 最多 4 字节，覆盖全部 Unicode。

【为什么用 utf8mb4】支持 emoji、生僻字，避免存表情报「Incorrect string value」错误。

【排序规则】utf8mb4_general_ci（不区分大小写、性能好）vs utf8mb4_unicode_ci（更准确）vs utf8mb4_0900_ai_ci（MySQL 8 默认）。

【避坑】新项目一律 utf8mb4；注意字符集不一致导致 join 时索引失效。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-034', category: 'database', tags: ['锁'], difficulty: 3,
      question: 'MySQL 的锁有哪些类型？表锁、行锁、意向锁、自增锁分别是什么？',
      answer: `一句话结论：MySQL 锁按粒度分表锁与行锁，还有意向锁（协调表锁与行锁）、自增锁、间隙锁等。

【表锁】锁整张表，粒度大、开销小，MyISAM 主要用表锁。

【行锁】InnoDB 按索引记录加锁，粒度细、并发高；有共享锁（S）、排他锁（X）。

【意向锁】意向共享锁（IS）、意向排他锁（IX），是「表级锁」，表示「表内某行要加 S/X 锁」，用于表锁与行锁冲突的快速判断。

【自增锁】插入自增列时获取，保证自增值唯一。

【面试追问】为什么需要意向锁？→ 加表锁时只需看有无意向锁，不用遍历所有行判断冲突。`,
      source: '大厂八股文 / 锁'
    },
    {
      id: 'db-035', category: 'database', tags: ['锁', '隔离级别'], difficulty: 2,
      question: '间隙锁（Gap Lock）在可重复读隔离级别下有什么作用？',
      answer: `一句话结论：间隙锁锁定「索引记录之间的间隙」，防止其他事务在间隙中插入，从而解决幻读。

【什么是间隙锁】锁的是范围（如 (5, 10) 之间的空隙），不是具体记录；配合记录锁形成临键锁（Next-Key Lock）。

【解决幻读】RR 隔离级别下，范围查询会加间隙锁，阻止其他事务插入满足条件的行，避免同一范围两次查询结果不一致（幻读）。

【面试追问】为什么 RC 级别没有间隙锁？→ RC 下只用记录锁，因此存在幻读，但锁冲突少、并发更高。

【避坑】间隙锁可能扩大锁范围，导致并发插入阻塞、死锁增多，这是 RR 的代价。`,
      source: '大厂八股文 / 锁'
    },
    {
      id: 'db-036', category: 'database', tags: ['MVCC', '隔离级别'], difficulty: 3,
      question: '幻读是如何通过 MVCC 和间隙锁共同解决的？',
      answer: `一句话结论：MVCC（快照读）通过版本链保证一致性非锁定读看不到新插入；当前读（如 select for update）则靠间隙锁阻止插入。

【两种读】
· 快照读：普通 select，基于 MVCC 读取事务开始时的版本，天然看不到别的事务新插入（解决部分幻读）；
· 当前读：select ... for update、update、delete，读取最新数据并加锁。

【幻读场景】快照读不会幻读，但「当前读」下若无间隙锁，其他事务插入新行会导致再次当前读多出行 → 间隙锁解决。

【面试追问】RR 能完全避免幻读吗？→ 基本可以（快照读 + 间隙锁），是 MySQL 相比标准 RR 的增强。`,
      source: '大厂八股文 / MVCC'
    },
    {
      id: 'db-037', category: 'database', tags: ['MVCC'], difficulty: 2,
      question: '什么是当前读和快照读？它们的区别是什么？',
      answer: `一句话结论：快照读读的是 MVCC 的历史版本（不加锁），当前读读的是最新已提交版本（加锁）。

【快照读】普通 select，基于 ReadView + undo 版本链，读取事务开始时的一致性快照，不加锁、性能好。

【当前读】select ... for update / lock in share mode、update、delete、insert，读取最新版本并加锁，保证读到最新且防止并发修改。

【区别】快照读不加锁、可能读到旧版本；当前读加锁、读到最新、阻塞其他写。

【面试追问】RR 下快照读为什么能重复读？→ 事务内 ReadView 固定，始终读同一版本。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-038', category: 'database', tags: ['事务', '隔离级别'], difficulty: 1,
      question: '脏读、不可重复读、幻读分别是什么？举个例子说明？',
      answer: `一句话结论：脏读是读到未提交数据，不可重复读是同一行两次读值不同，幻读是同一范围两次读行数不同。

【脏读】事务 A 读到事务 B 未提交的修改，B 回滚后 A 读到的是脏数据。例：B 改余额未提交，A 读到已改值，B 回滚。

【不可重复读】同一事务内两次读同一行，值不同（被别的事务提交修改）。例：第一次读余额 100，别的事务改成 200 提交，第二次读 200。

【幻读】同一事务内两次范围查询，行数不同（别的事务插入/删除了符合条件的新行）。

【隔离级别】读未提交→有脏读；读已提交→解决脏读；可重复读→解决不可重复读；串行化→全解决。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-039', category: 'database', tags: ['事务', 'Spring'], difficulty: 2,
      question: 'Spring 事务的传播行为有哪些？REQUIRED 和 REQUIRES_NEW 有什么区别？',
      answer: `一句话结论：传播行为定义「事务方法被调用时如何与现有事务交互」，REQUIRED 加入现有事务，REQUIRES_NEW 挂起现有事务、新开独立事务。

【REQUIRED（默认）】有事务则加入，无则新建；调用方回滚会导致被调用方一起回滚。

【REQUIRES_NEW】总是新建独立事务，挂起外层事务；内层提交/回滚不影响外层。

【其他】SUPPORTS、NOT_SUPPORTED、MANDATORY、NEVER、NESTED（嵌套，外层回滚内层也回滚）。

【面试追问】REQUIRES_NEW 的应用？→ 日志记录、消息发送等「即使主事务回滚也要提交」的场景。

【避坑】REQUIRES_NEW 需通过代理调用才生效（同类自调用失效）。`,
      source: '大厂八股文 / Spring 事务'
    },
    {
      id: 'db-040', category: 'database', tags: ['事务', '分布式'], difficulty: 2,
      question: '本地事务和分布式事务有什么区别？分布式事务为什么更难？',
      answer: `一句话结论：本地事务靠单个数据库的 ACID 保证，分布式事务跨多个数据源，涉及网络与多节点，无法用单库事务机制。

【本地事务】单库内，靠 redo/undo log + 锁保证 ACID，简单可靠。

【分布式事务】跨库/跨服务，难点在于：网络不可靠、各节点独立提交/回滚、没有全局锁，无法原子地保证所有节点一致。

【解决思路】2PC/TCC/Saga/可靠消息等（见后端分布式事务）。

【面试追问】为什么分布式下 CAP 只能三选二？→ 网络分区时，一致性（C）和可用性（A）无法同时保证。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-041', category: 'database', tags: ['主从', '读写分离'], difficulty: 2,
      question: '读写分离下的主从延迟是怎么产生的？如何监控和处理？',
      answer: `一句话结论：主从复制是异步的，从库追赶主库需要时间，产生延迟；用 seconds_behind_master 监控，处理靠「强制读主、降低延迟」。

【产生原因】主库高并发写入、大事务、从库性能差、网络延迟、从库单线程回放（可开并行复制）。

【监控】show slave status 看 Seconds_Behind_Master；或对比主从位点。

【处理】
1. 关键写后读强制走主库；
2. 开启并行复制（MTS）、半同步复制；
3. 从库只读、减轻压力。

【避坑】延迟是常态，架构设计时要接受并规避，而不是追求零延迟。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-042', category: 'database', tags: ['主从复制'], difficulty: 2,
      question: 'MySQL 主从复制有哪几种模式？异步、半同步、全同步有什么区别？',
      answer: `一句话结论：区别在于「主库何时返回成功」——异步不等待从库，半同步等至少一个从库收到，全同步等所有从库完成。

【异步复制】主库提交即返回，从库异步拉取；性能最好，但主库故障可能丢数据。

【半同步复制】主库等至少一个从库确认收到 binlog 才返回；兼顾性能与一致性，可能丢少量数据。

【全同步复制（组复制）】所有节点确认后才提交；强一致但性能最差，如 MGR。

【面试追问】如何选？→ 默认异步；对数据安全要求高用半同步；金融级强一致才考虑组复制。`,
      source: '大厂八股文 / 主从'
    },
    {
      id: 'db-043', category: 'database', tags: ['主从复制'], difficulty: 2,
      question: 'GTID 是什么？它比传统 binlog 位点有什么优势？',
      answer: `一句话结论：GTID（全局事务标识）给每个事务分配全局唯一 ID，主从复制用 GTID 定位而非 binlog 文件+偏移量，切换更简单可靠。

【GTID 结构】server_uuid:transaction_id，事务在集群内唯一标识。

【优势】
1. 从库切换主库时无需手动找位点，自动定位；
2. 自动跳过已执行事务，避免重复；
3. 故障切换更简单。

【传统位点】依赖 binlog 文件名 + position，切换主库时需精确对齐，易出错。

【避坑】GTID 模式下某些操作受限（如 create table ... select 默认不允许）。`,
      source: '大厂八股文 / 主从'
    },
    {
      id: 'db-044', category: 'database', tags: ['分库分表', '中间件'], difficulty: 2,
      question: 'ShardingSphere、MyCAT 这些分库分表中间件是如何工作的？',
      answer: `一句话结论：分库分表中间件在应用与数据库之间做「SQL 解析 → 路由 → 改写 → 结果归并」，让应用无感知地操作分片后的数据。

【核心流程】
1. SQL 解析：解析出表名、分片键；
2. 路由：根据分片规则（取模/范围/哈希）定位目标库表；
3. 改写：改写 SQL（如表名加后缀）；
4. 归并：聚合各分片结果（排序、分页、聚合）。

【架构模式】客户端模式（ShardingSphere-JDBC，内嵌应用）vs 代理模式（MyCAT/ShardingSphere-Proxy，独立服务）。

【面试追问】两种模式区别？→ JDBC 无额外部署、性能好；Proxy 对应用透明、统一管理但有网络开销。`,
      source: '大厂八股文 / 分库分表'
    },
    {
      id: 'db-045', category: 'database', tags: ['分库分表'], difficulty: 3,
      question: '分库分表后会带来哪些问题？跨库 join、分页、全局 ID 如何解决？',
      answer: `一句话结论：分库分表牺牲了「单库的便利」，带来跨库 join、分布式分页、全局唯一 ID、分布式事务等问题。

【跨库 join】拆分成多次查询在应用层组装，或用冗余字段/宽表避免 join。

【分页】全局排序分页需各分片取数据后归并（如 limit m,n 在各片取前 m+n 再全局排序）。

【全局 ID】用雪花算法、号段、Redis 等生成全局唯一 ID（见分布式 ID）。

【其他】分布式事务、数据迁移、聚合统计困难、一致性保障。

【避坑】分库分表是「最后手段」，先考虑索引、缓存、读写分离、单表优化。`,
      source: '大厂八股文 / 分库分表'
    },
    {
      id: 'db-046', category: 'database', tags: ['分库分表', '迁移'], difficulty: 2,
      question: '数据库迁移和扩容有哪些方案？如何做到平滑迁移？',
      answer: `一句话结论：迁移方案有停机迁移、双写迁移、借助工具同步，核心是「全量同步 + 增量追平 + 校验切换 + 可回滚」。

【方案】
1. 停机迁移：简单但有停机窗口；
2. 双写迁移：新老库双写 + 全量同步 + 增量追平 + 灰度切读 + 停止老写；
3. 工具同步：DTS、Canal、gh-ost 等辅助。

【平滑要点】
1. 全量同步历史数据；
2. 开启增量同步追平；
3. 数据校验（条数、抽样对比）；
4. 灰度切换读流量，观察；
5. 确认无误后切写、下线老库。

【避坑】迁移期间保证幂等与双写一致性，切换前必须充分校验。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-047', category: 'database', tags: ['架构', '数据治理'], difficulty: 2,
      question: '什么是冷热数据分离？如何实施？',
      answer: `一句话结论：冷热分离把「高频访问的热数据」和「低频的冷数据」分开存储，热数据放高性能存储，冷数据下沉到低成本存储。

【为什么】避免历史数据拖慢核心表，降低主库压力与存储成本。

【实施】
1. 定义冷热标准（如超过 90 天未访问为冷数据）；
2. 定时任务把冷数据迁移到归档库/对象存储；
3. 查询时按数据冷热路由到不同存储。

【存储选型】热数据 MySQL/Redis，冷数据归档表、HDFS、对象存储、ClickHouse（分析）。

【避坑】迁移要增量、可回滚；冷数据查询体验可能下降，需明确业务可接受。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-048', category: 'database', tags: ['运维'], difficulty: 1,
      question: '如何归档和清理历史数据？有哪些注意事项？',
      answer: `一句话结论：历史数据归档要「分批删除 + 定时执行」，避免大事务和长锁，配合索引与备份。

【做法】
1. 按时间分批删除（如每次删 1 天数据，sleep 间隔）；
2. 先归档再删除（备份到归档表/文件）；
3. 用主键范围定位（where id < X limit 1000）避免全表扫描。

【注意事项】
1. 避免长事务与大批量 delete 锁表；
2. 删除前确认有备份；
3. 低峰期执行；
4. 删后做表空间收缩（optimize table）回收空间。

【避坑】一次 delete 几十万行会长时间锁表、主从延迟，务必分批。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-049', category: 'database', tags: ['SQL'], difficulty: 2,
      question: '什么是物化视图？它和普通视图有什么区别？',
      answer: `一句话结论：普通视图是「保存的查询语句」（不存数据），物化视图是「预计算的查询结果」（存数据），查询快但需刷新。

【普通视图】逻辑上的虚拟表，每次访问都执行底层查询，数据实时但不缓存。

【物化视图】把查询结果物理存储，查询直接读结果，性能高；但数据非实时，需定期或按需刷新。

【应用】复杂聚合、报表预计算。

【面试追问】MySQL 支持物化视图吗？→ 原生不支持（可用触发器+表模拟），Oracle/PostgreSQL 原生支持。`,
      source: '数据库八股文'
    },
    {
      id: 'db-050', category: 'database', tags: ['监控', '性能'], difficulty: 1,
      question: '数据库需要监控哪些核心指标？',
      answer: `一句话结论：核心监控「连接数、QPS/TPS、慢查询、主从延迟、锁等待、CPU/内存/磁盘、缓冲池命中率」。

【指标清单】
1. 连接数：当前/最大连接，是否打满；
2. QPS/TPS：吞吐；
3. 慢查询：数量、耗时；
4. 主从延迟：Seconds_Behind_Master；
5. 锁等待/死锁；
6. 资源：CPU、内存、磁盘 IO、网络；
7. 缓冲池命中率、InnoDB 行锁等待。

【工具】Prometheus + Grafana、Percona PMM、云监控。

【避坑】指标要看趋势，不能只看瞬时值；告警阈值要合理避免误报。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-051', category: 'database', tags: ['explain', '优化'], difficulty: 3,
      question: 'explain 的结果字段分别代表什么？type、rows、Extra、key_len 怎么看？',
      answer: `一句话结论：explain 展示 SQL 的执行计划，重点看 type（访问类型）、key（用了哪个索引）、rows（扫描行数）、Extra（额外信息）、key_len（索引长度）。

【type 从好到坏】system > const > eq_ref > ref > range > index > ALL（全表扫描）。目标是至少 ref，避免 ALL。

【rows】预估扫描行数，越小越好。

【Extra】Using index（覆盖索引）、Using where、Using filesort（需排序）、Using temporary（临时表，需优化）。

【key_len】用到的索引字节数，可判断联合索引用了几列。

【避坑】explain 是「预估」不是「实际」，实际以慢查询日志和 profiling 为准。`,
      source: '大厂八股文 / explain'
    },
    {
      id: 'db-052', category: 'database', tags: ['explain', '优化'], difficulty: 2,
      question: 'Using filesort 和 Using temporary 分别代表什么？如何避免？',
      answer: `一句话结论：Using filesort 表示需要额外排序，Using temporary 表示需要用临时表，两者都拖慢查询，应尽量消除。

【Using filesort】排序无法利用索引，MySQL 额外排序；优化：给 order by 字段建索引。

【Using temporary】group by/order by/distinct/union 需建临时表；优化：加索引让分组/排序走索引、减少结果集。

【消除手段】
1. 联合索引覆盖 where + order by/group by；
2. 减少参与排序/分组的数据量；
3. 避免 select 大字段进临时表。

【避坑】Extra 出现这两个提示，往往是 SQL 可优化的信号。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-053', category: 'database', tags: ['索引'], difficulty: 2,
      question: '什么是索引合并（Index Merge）？有哪些类型？',
      answer: `一句话结论：索引合并是 MySQL 优化器「同时用多个索引」再对结果求交/并，避免只用一个索引导致大量回表。

【类型】
1. Intersection（交集）：多个索引结果求交（AND 条件）；
2. Union（并集）：多个索引结果求并（OR 条件）；
3. Sort-Union：先排序再求并。

【作用】如 where a=1 and b=2，两个单列索引各自查主键再求交集。

【避坑】出现索引合并说明「可能缺联合索引」，通常建 (a,b) 联合索引更优。

【面试追问】怎么判断？→ explain 的 type 显示 index_merge。`,
      source: '大厂八股文 / 索引'
    },
    {
      id: 'db-054', category: 'database', tags: ['索引', '优化'], difficulty: 2,
      question: 'MRR（Multi-Range Read）是什么？它如何优化查询？',
      answer: `一句话结论：MRR 把二级索引查到的主键排序后再回表，把随机 IO 变成顺序 IO，提升回表效率。

【问题】普通回表：二级索引查到的主键乱序，逐个回表产生大量随机 IO。

【MRR】先收集一批主键，排序后按主键顺序回表，减少随机 IO，利用磁盘预读。

【开启】optimizer_switch 里的 mrr=on。

【面试追问】MRR 适用场景？→ 范围查询 + 大回表量的场景，尤其在机械盘下收益明显。`,
      source: '大厂八股文 / 优化'
    },
    {
      id: 'db-055', category: 'database', tags: ['InnoDB'], difficulty: 2,
      question: '什么是页分裂和页合并？它们对性能有什么影响？',
      answer: `一句话结论：页分裂是页空间不足时拆成两页，页合并是页数据过少时合并；分裂会带来额外开销，是随机主键性能差的原因之一。

【页分裂】插入导致页满时，分裂成两页并调整父节点指针，可能引发连锁分裂。

【页合并】删除导致页使用率过低时，与相邻页合并。

【与主键关系】自增主键顺序插入，新数据总在末尾，很少分裂；随机主键（UUID）插入位置随机，频繁分裂，还造成页利用率低。

【避坑】这是「为什么推荐自增主键」的底层原因之一。`,
      source: '大厂八股文 / InnoDB'
    },
    {
      id: 'db-056', category: 'database', tags: ['InnoDB', '内存'], difficulty: 2,
      question: 'InnoDB 的 Buffer Pool 是什么？工作原理是怎样的？',
      answer: `一句话结论：Buffer Pool 是 InnoDB 的内存缓冲池，缓存数据页与索引页，减少磁盘 IO，是 MySQL 最重要的内存结构。

【工作原理】
1. 读：先查 Buffer Pool，命中直接返回，未命中从磁盘加载页到池中；
2. 写：修改池中的页（脏页），由后台线程异步刷盘；
3. 淘汰：空间不足时按 LRU 淘汰冷页。

【关键参数】innodb_buffer_pool_size（一般设物理内存 50%~70%）。

【命中率】通过 show status 的命中率指标评估，命中率低说明池太小或查询太散。

【避坑】Buffer Pool 太大可能导致内存不足/OOM；太小则频繁换页、性能差。`,
      source: '大厂八股文 / InnoDB'
    },
    {
      id: 'db-057', category: 'database', tags: ['InnoDB', '优化'], difficulty: 2,
      question: 'change buffer 是什么？它如何提升写入性能？',
      answer: `一句话结论：change buffer 缓存「二级索引的变更」，等数据页被读入内存时再合并，减少随机 IO，提升写入性能。

【原理】更新二级索引时，若目标页不在 Buffer Pool，先把变更写入 change buffer，待后续该页被读取/刷盘时再合并（merge）。

【适用】非唯一二级索引（唯一索引需读盘判断冲突，不能用）。

【为何快】把多次随机写合并成顺序/批量写，减少 IO。

【参数】innodb_change_buffer_max_size。

【避坑】大量「插入后立即读」的场景，change buffer 反而要频繁 merge，收益低。`,
      source: '大厂八股文 / InnoDB'
    },
    {
      id: 'db-058', category: 'database', tags: ['redo log', '参数'], difficulty: 2,
      question: 'redo log 的刷盘策略（innodb_flush_log_at_trx_commit）如何设置？',
      answer: `一句话结论：该参数控制 redo log 何时刷盘，取值 0/1/2，在「性能」与「数据安全」之间权衡。

【三个取值】
· 0：每秒刷一次（后台线程），崩溃最多丢 1 秒数据，性能最好；
· 1（默认）：每次提交都刷盘，最安全，性能最差；
· 2：每次提交写 OS 缓存，每秒刷盘，MySQL 进程崩溃不丢但宕机可能丢。

【选择】金融/交易用 1；普通业务可用 2（配合电池备份）；对一致性要求极高才用 1。

【避坑】这是「数据不丢」的关键参数，配合 sync_binlog=1 才能做到双一（最安全）。`,
      source: '大厂八股文 / redo log'
    },
    {
      id: 'db-059', category: 'database', tags: ['binlog'], difficulty: 2,
      question: 'binlog 有哪三种格式？statement、row、mixed 有什么区别？',
      answer: `一句话结论：binlog 记录数据库变更，三种格式——statement 记 SQL 语句、row 记行变更、mixed 混合两者。

【statement】记录执行的 SQL，日志小；但部分语句（如 now()、uuid()）在主从执行结果可能不一致。

【row】记录每行数据变更（前像/后像），准确可靠，主从一致性好；但日志量大。

【mixed】默认 statement，遇到不确定语句自动用 row。

【选型】推荐 row（主从一致、便于数据恢复与同步到其他系统如 Canal）。

【避坑】用 Canal 订阅 binlog 做缓存同步，必须 row 格式才能拿到行数据。`,
      source: '大厂八股文 / binlog'
    },
    {
      id: 'db-060', category: 'database', tags: ['redo log', 'binlog'], difficulty: 3,
      question: '两阶段提交（2PC）如何保证 redo log 和 binlog 一致？',
      answer: `一句话结论：MySQL 用「两阶段提交」协调 redo log 和 binlog，保证二者一致，从而主从数据一致且崩溃可恢复。

【流程】
1. prepare 阶段：写 redo log（prepare 状态）；
2. 写 binlog；
3. commit 阶段：redo log 标记 commit。

【为什么】崩溃恢复时：
· redo 处于 prepare 且 binlog 完整 → 提交；
· binlog 缺失 → 回滚；
从而保证 redo 与 binlog 一致，主从不产生数据差异。

【背景】redo 用于崩溃恢复（InnoDB），binlog 用于主从复制/归档，两者必须一致，否则主从数据不一致。

【避坑】这也是为什么要用 group commit 优化两阶段提交的性能开销。`,
      source: '大厂八股文 / 一致性'
    },
    {
      id: 'db-061', category: 'database', tags: ['DDL', '运维'], difficulty: 2,
      question: '什么是在线 DDL？MySQL 如何做到在线加字段不锁表？',
      answer: `一句话结论：在线 DDL 允许在不阻塞读写的情况下修改表结构，MySQL 通过「新建临时表 + 增量同步 + 切换」实现。

【流程】
1. 创建与原表结构相同（含新结构）的临时表；
2. 对原表加锁，记录当前位点，复制数据到临时表；
3. 用 binlog/增量把期间变更同步到临时表；
4. 原子切换表名，删除旧表。

【注意】不同 DDL 操作锁级别不同（有些仍需锁表），MySQL 8 的 INSTANT 算法可秒级加列。

【避坑】大表 DDL 即使在线也会产生主从延迟与磁盘压力，需低峰执行或借助 pt-osc/gh-ost。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-062', category: 'database', tags: ['DDL', '运维'], difficulty: 2,
      question: '大表如何安全地加字段、建索引？pt-osc、gh-ost 的原理是什么？',
      answer: `一句话结论：大表 DDL 用在线变更工具（pt-osc/gh-ost）通过「影子表 + 增量同步」避免锁表与长阻塞。

【pt-osc 原理】创建影子表（新结构）→ 触发器同步增量 → 分批复制数据 → 原子切换表名。

【gh-ost 原理】不依赖触发器，通过解析 binlog 同步增量，更安全、可控。

【好处】分批复制、可暂停、可限速、减少主从压力。

【避坑】直接 alter 大表可能长时间锁表，务必用在线工具；切换时注意外键、触发器等兼容性。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-063', category: 'database', tags: ['锁', '死锁'], difficulty: 2,
      question: 'MySQL 的死锁检测机制是什么？innodb_lock_wait_timeout 的作用？',
      answer: `一句话结论：InnoDB 通过「等待图」检测死锁，检测到后回滚其中一个事务；innodb_lock_wait_timeout 是锁等待超时时间。

【死锁检测】InnoDB 维护锁等待关系，若形成环则判定死锁，自动回滚代价小的事务，并返回死锁错误。

【锁等待超时】事务等待锁超过 innodb_lock_wait_timeout（默认 50s）则报错回滚，是死锁检测之外的兜底。

【面试追问】死锁检测的代价？→ 高并发下检测开销大，可考虑关闭检测靠超时（需评估）。如何避免死锁？→ 按固定顺序加锁、缩短事务、减少锁范围。`,
      source: '大厂八股文 / 死锁'
    },
    {
      id: 'db-064', category: 'database', tags: ['死锁', '排查'], difficulty: 3,
      question: '如何排查数据库死锁？SHOW ENGINE INNODB STATUS 怎么看？',
      answer: `一句话结论：用 SHOW ENGINE INNODB STATUS 查看最近一次死锁信息，其中 LATEST DETECTED DEADLOCK 段记录了两个事务的锁与等待关系。

【排查步骤】
1. show engine innodb status 查看死锁日志；
2. 定位死锁的两个事务、各自持有哪些锁、在等待哪些锁；
3. 找到对应的 SQL 语句；
4. 分析锁顺序，找出死锁原因。

【辅助】开启 innodb_print_all_deadlocks 把死锁日志打印到错误日志；用 information_schema.innodb_trx / innodb_locks 查看当前锁。

【常见原因】两个事务按相反顺序更新多行、间隙锁 + 插入冲突。

【避坑】死锁日志只保留「最近一次」，历史死锁需打印到错误日志。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-065', category: 'database', tags: ['优化', '实战'], difficulty: 3,
      question: '举一个 SQL 优化的实战案例：你是如何优化一条慢查询的？',
      answer: `一句话结论：慢查询优化流程是「定位慢 SQL → explain 分析 → 加索引/改写 SQL → 验证效果」，用数据说话。

【案例框架】
1. 定位：慢查询日志发现某查询 3s；
2. 分析：explain 发现 type=ALL 全表扫描，rows 上百万；
3. 优化：where 条件字段无索引，建联合索引；或改写 SQL 避免函数/隐式转换；
4. 验证：explain 确认 type=ref/range，rows 大幅下降，实际耗时降到毫秒级。

【加分】能讲出「先看执行计划、再针对性优化、最后验证」的完整闭环，以及覆盖索引、最左前缀的应用。

【避坑】不要上来就加索引，先确认是否真的需要、是否命中。`,
      source: '大厂面试真题'
    },
    {
      id: 'db-066', category: 'database', tags: ['优化'], difficulty: 1,
      question: '全表扫描和索引扫描有什么区别？什么时候全表扫描反而更好？',
      answer: `一句话结论：全表扫描逐行读整个表，索引扫描通过索引定位；当结果集占表比例很大时，全表扫描可能比索引+回表更快。

【区别】全表扫描顺序读所有页；索引扫描先查索引再回表（可能随机 IO）。

【全表更优的场景】查询返回大量行（如 >20% 数据），回表代价高，优化器会选全表扫描。

【判断】explain 看 type=ALL（全表）vs ref/range（索引）。

【避坑】不是所有查询都必须走索引；优化器基于代价模型选择，全表扫描有时是合理选择。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-067', category: 'database', tags: ['主键', '设计'], difficulty: 1,
      question: '为什么推荐用自增主键？它相比业务主键有什么优势？',
      answer: `一句话结论：自增主键顺序插入，减少页分裂、占用空间小、二级索引叶子节点更小，整体性能更好。

【优势】
1. 顺序插入：新数据在 B+ 树末尾，避免页分裂；
2. 空间小：自增 bigint 8 字节，比长字符串/复合主键小；
3. 二级索引叶子存主键，主键小则二级索引整体小；
4. 简单可靠，避免业务主键变更带来的级联更新。

【业务主键问题】如手机号/身份证做聚簇索引，值大、非顺序，导致页分裂与空间膨胀。

【避坑】不是绝对，若业务主键天然有序且短（如时间戳+序号），也可用；但一般自增最省心。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-068', category: 'database', tags: ['主键', '设计'], difficulty: 2,
      question: '用 UUID 做主键有什么坏处？',
      answer: `一句话结论：UUID 随机无序，导致页分裂、空间浪费、索引效率下降，还占更大空间。

【坏处】
1. 随机插入 → 频繁页分裂，页利用率低（约 50%~70%）；
2. 字符串 UUID 36 字节，远大于 bigint 8 字节，占用空间大；
3. 二级索引叶子存 UUID，所有二级索引都变大；
4. 无序导致范围查询、排序效率差。

【缓解】用「有序 UUID」（UUID v7/时间戳前缀）或雪花算法，保证趋势递增。

【避坑】分布式场景用雪花算法或自增号段代替随机 UUID。`,
      source: '大厂八股文 / 主键'
    },
    {
      id: 'db-069', category: 'database', tags: ['备份', '运维'], difficulty: 2,
      question: '数据库备份有哪些方式？mysqldump 和 Xtrabackup 有什么区别？',
      answer: `一句话结论：备份分逻辑备份（mysqldump）和物理备份（Xtrabackup），逻辑备份是 SQL 文本、物理备份是数据文件。

【mysqldump】逻辑备份，导出 SQL 语句，可跨版本/跨平台恢复；但备份和恢复慢，适合小库。

【Xtrabackup】物理备份，直接拷贝数据文件（配合 redo 保证一致性），备份恢复快，适合大库；支持增量备份。

【选型】小库/需跨版本 → mysqldump；大库/追求速度 → Xtrabackup。

【避坑】备份要定期演练恢复，别等出事了才发现备份不可用。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-070', category: 'database', tags: ['备份', '恢复'], difficulty: 2,
      question: '什么是 PITR（时间点恢复）？如何实现？',
      answer: `一句话结论：PITR 把数据库恢复到过去某个时间点，靠「全量备份 + binlog 重放」实现。

【实现】
1. 用最近的全量备份恢复；
2. 用备份时间点之后的 binlog 重放到目标时间点；
3. 可指定具体时间（--stop-datetime）或 binlog 位置。

【用途】误删数据恢复、事故回滚。

【避坑】需开启 binlog（row 格式更可靠）且保留足够历史；恢复前先备份当前状态，避免二次破坏。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-071', category: 'database', tags: ['高可用'], difficulty: 2,
      question: 'MySQL 高可用方案有哪些？MHA、MGR、Orchestrator 分别是什么？',
      answer: `一句话结论：高可用方案围绕「主从 + 自动故障切换」，MHA、Orchestrator 是切换管理工具，MGR 是原生组复制。

【MHA】监控主库，故障时自动选新主并补齐日志，成熟但较老。

【Orchestrator】管理拓扑、自动故障检测与切换，被广泛使用（如配合 VIP/代理）。

【MGR（组复制）】MySQL 原生多主/单主组复制，基于 Paxos 保证一致，自带故障转移。

【面试追问】如何选？→ 传统主从 + Orchestrator 运维成熟；需要强一致选 MGR。切换时如何保证应用无感？→ 配合 VIP/代理/中间件。`,
      source: '大厂八股文 / 高可用'
    },
    {
      id: 'db-072', category: 'database', tags: ['高可用', 'MGR'], difficulty: 3,
      question: 'MGR（组复制）的原理是什么？它如何保证一致性？',
      answer: `一句话结论：MGR 是 MySQL 的组复制，基于 Paxos 协议让组内节点对事务顺序达成一致，实现强一致与自动故障转移。

【原理】
1. 事务在组内广播，各节点按 Paxos 达成一致提交顺序；
2. 多数派确认后事务提交（可配置单主/多主）；
3. 节点故障由组内自动踢出/加入。

【一致性】基于「多数派」与「全局事务顺序」，比异步主从强一致。

【优点】强一致、自动切换、多写（多主模式）。

【缺点】性能受网络/最慢节点影响，适合对一致性要求高、规模适中的场景。`,
      source: '大厂八股文 / MGR'
    },
    {
      id: 'db-073', category: 'database', tags: ['隔离级别'], difficulty: 2,
      question: '事务隔离级别和性能之间如何权衡？',
      answer: `一句话结论：隔离级别越高，一致性越好但并发越低、锁越多；越低则并发越高但一致性越弱。

【权衡】
· 读未提交：几乎不用；
· 读已提交（RC）：锁少、并发高，但不可重复读/幻读；
· 可重复读（RR）：MySQL 默认，用 MVCC + 间隙锁解决大部分问题，锁略多；
· 串行化：强一致但性能最差，几乎不用。

【选择】互联网多数用 RC（配合业务处理）或 RR；金融强一致才考虑更高。

【避坑】RC 没有间隙锁，死锁更少，很多大厂默认用 RC。`,
      source: '大厂八股文 / 隔离级别'
    },
    {
      id: 'db-074', category: 'database', tags: ['隔离级别'], difficulty: 2,
      question: '读已提交（RC）和可重复读（RR）在生产中如何选择？',
      answer: `一句话结论：RC 并发更高、锁更少（无间隙锁），RR 一致性更强（解决不可重复读/幻读）；互联网多选 RC，传统业务多选 RR。

【RC 特点】只用记录锁，无间隙锁，死锁少、并发好；但同事务内两次读可能不同值。

【RR 特点】快照读一致 + 间隙锁防幻读，一致性更强；但间隙锁扩大锁范围，并发插入受影响、死锁略多。

【选择建议】对一致性要求高（如金融对账）用 RR；追求高并发、能接受业务层处理不可重复读用 RC。

【避坑】MySQL 默认 RR，但很多互联网公司改为 RC 提升并发，需结合业务判断。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-075', category: 'database', tags: ['数据库选型'], difficulty: 2,
      question: 'PostgreSQL 和 MySQL 有什么区别？如何选型？',
      answer: `一句话结论：PG 功能更强大、标准兼容好、适合复杂查询与地理/JSON 等场景；MySQL 生态成熟、简单易用、运维工具多。

【PG 优势】
· 功能丰富：物化视图、窗口函数、CTE、丰富索引类型（GIN/GiST）；
· 强类型、严格 SQL 标准；
· 地理空间（PostGIS）、JSONB、全文检索强。

【MySQL 优势】
· 生态大、上手快、运维工具成熟；
· 主从复制简单、互联网案例多；
· 简单 OLTP 性能好。

【选型】复杂查询/数据分析/强功能 → PG；互联网常规 OLTP、团队熟悉 → MySQL。`,
      source: '数据库八股文'
    },
    {
      id: 'db-076', category: 'database', tags: ['SQL', '窗口函数'], difficulty: 2,
      question: '什么是窗口函数？ROW_NUMBER、RANK、DENSE_RANK 有什么区别？',
      answer: `一句话结论：窗口函数在不合并行的情况下做「分组内计算」，ROW_NUMBER 连续编号、RANK 有跳号、DENSE_RANK 无跳号。

【窗口函数】over(partition by ... order by ...) 定义窗口，函数在窗口内计算，保留每行。

【三者区别（并列时）】
· ROW_NUMBER：1,2,3,4 连续不重复；
· RANK：1,2,2,4 并列跳号；
· DENSE_RANK：1,2,2,3 并列不跳号。

【应用】分组 Top N、排名、累计和（sum over）、移动平均。

【面试追问】窗口函数 vs group by？→ group by 聚合合并行，窗口函数保留每行明细。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-077', category: 'database', tags: ['SQL'], difficulty: 1,
      question: '什么是 CTE（公用表表达式）？它有什么用途？',
      answer: `一句话结论：CTE 是 WITH 定义的临时结果集，让复杂查询更清晰，支持递归。

【语法】WITH cte AS (select ...) select ... from cte。

【用途】
1. 把复杂查询拆成可读的步骤；
2. 同一结果集多次复用；
3. 递归 CTE 处理树形/层级数据（如组织架构、目录）。

【递归示例】WITH RECURSIVE 遍历父子关系。

【面试追问】CTE 和子查询/临时表区别？→ CTE 语法更清晰、可复用，但本质上仍是逻辑结果集（MySQL 8 支持）。`,
      source: '数据库八股文'
    },
    {
      id: 'db-078', category: 'database', tags: ['NoSQL'], difficulty: 1,
      question: 'NoSQL 和关系型数据库有什么区别？各自适用什么场景？',
      answer: `一句话结论：关系型强一致、支持复杂事务与 SQL；NoSQL 牺牲一致性/关系，换取水平扩展与高并发，类型多样。

【关系型】表结构固定、ACID、支持 join、SQL 标准；适合事务性业务（订单、账户）。

【NoSQL 类型】
· KV（Redis）：缓存、计数；
· 文档（MongoDB）：灵活 schema、JSON；
· 列式（HBase/Cassandra）：海量写入；
· 图（Neo4j）：关系查询。

【选型】结构化 + 事务 → 关系型；海量 + 高并发 + 灵活结构 → NoSQL；常混合使用。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-079', category: 'database', tags: ['MongoDB', 'NoSQL'], difficulty: 2,
      question: 'MongoDB 的适用场景和核心原理是什么？',
      answer: `一句话结论：MongoDB 是文档数据库，用 BSON 存 JSON 文档，schema 灵活，适合多变结构、高写入、嵌套数据场景。

【核心概念】集合（collection）≈ 表，文档（document）≈ 行；支持索引、聚合管道、副本集、分片。

【适用】内容管理、日志、用户画像、物联网数据、需快速迭代 schema 的业务。

【不适用】强事务关联（多表 join）、复杂事务（早期版本弱，4.0+ 支持多文档事务但性能一般）。

【面试追问】MongoDB 的索引？→ 支持单字段、复合、地理、文本、TTL 索引。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-080', category: 'database', tags: ['Elasticsearch', '索引'], difficulty: 2,
      question: 'Elasticsearch 的倒排索引原理是什么？',
      answer: `一句话结论：倒排索引是「词 → 文档列表」的映射，把文档按词切分建索引，检索时直接按词定位文档，实现全文搜索。

【原理】
1. 文档分词（Tokenize），提取词项（term）；
2. 建立「词项 → 出现该词的文档 ID 列表」的倒排表；
3. 查询时按词查倒排表，得到候选文档，再按相关性打分排序。

【正排 vs 倒排】正排是「文档 → 词」，倒排是「词 → 文档」。

【加分】能说 ES 底层是 Lucene，倒排索引 + 相关性算法（BM25）实现高效全文检索。`,
      source: '大厂八股文 / ES'
    },
    {
      id: 'db-081', category: 'database', tags: ['Elasticsearch', '架构'], difficulty: 2,
      question: 'ES 的分片（shard）和副本（replica）是什么？如何影响性能与可用性？',
      answer: `一句话结论：分片把索引数据水平拆分到多个节点（提升容量与并行度），副本是分片的拷贝（提升可用性与读性能）。

【分片】一个索引拆成多个主分片，分布在不同节点，写入并行、容量扩展。

【副本】每个主分片有副本，主分片故障时副本升级，保证高可用；副本也可分担读。

【性能影响】分片多 → 并行写入/查询好，但分片过多有开销（小分片浪费资源）；副本多 → 读吞吐高，但写入需同步副本。

【避坑】分片数一旦设定不能改（需重建索引），要合理规划。`,
      source: '大厂八股文 / ES'
    },
    {
      id: 'db-082', category: 'database', tags: ['Elasticsearch', '查询'], difficulty: 2,
      question: 'ES 查询为什么快？相关性打分（BM25）是怎么算的？',
      answer: `一句话结论：ES 快在「倒排索引 + 分布式并行 + 缓存」；相关性用 BM25 算法，综合词频、逆文档频率、字段长度打分。

【为什么快】
1. 倒排索引按词直接定位，无需全表扫描；
2. 分片并行查询；
3. 内存缓存、filter cache。

【BM25 打分】相关性 = 词频（TF，越高越相关）✕ 逆文档频率（IDF，越稀有词权重越高）✕ 字段长度归一化（短字段命中权重更高）。

【面试追问】term query 和 match query 区别？→ term 精确匹配不分词，match 会分词再匹配。`,
      source: '大厂八股文 / ES'
    },
    {
      id: 'db-083', category: 'database', tags: ['列式存储'], difficulty: 2,
      question: '什么是列式存储？和行式存储有什么区别？',
      answer: `一句话结论：行式按行存储（一行数据连续），列式按列存储（一列数据连续）；列式适合分析聚合，行式适合事务读写。

【行式】一行所有字段连续存储，适合按行读写（OLTP，如订单整行存取）。

【列式】同一列数据连续存储，适合按列聚合（OLAP，如 sum/avg），压缩率高、只读所需列。

【代表】行式：MySQL、PostgreSQL；列式：ClickHouse、HBase、Parquet/ORC。

【面试追问】为什么列式压缩率高？→ 同列数据类型一致、值相近，压缩效果好。`,
      source: '数据库八股文'
    },
    {
      id: 'db-084', category: 'database', tags: ['ClickHouse', 'OLAP'], difficulty: 2,
      question: 'ClickHouse 适合什么场景？为什么分析查询快？',
      answer: `一句话结论：ClickHouse 是列式 OLAP 数据库，适合海量数据实时分析；快在列式存储、向量化执行、数据压缩、分布式并行。

【为什么快】
1. 列式存储：只读相关列，减少 IO；
2. 向量化执行：批量处理数据（SIMD）；
3. 数据压缩：降低 IO；
4. 分布式：多节点并行；
5. 稀疏索引 + 分区裁剪。

【适用】日志分析、实时报表、用户行为分析、监控指标聚合。

【不适用】频繁的单行更新删除、事务、高并发点查（OLTP）。

【面试追问】为什么不适合频繁更新？→ 面向批量写入与追加，更新需重写数据部分。`,
      source: '大厂八股文 / ClickHouse'
    },
    {
      id: 'db-085', category: 'database', tags: ['HBase', 'LSM'], difficulty: 2,
      question: 'HBase 的 LSM 树是什么？它如何实现高效写入？',
      answer: `一句话结论：LSM 树把写入先放到内存（MemTable），达到阈值后顺序刷到磁盘（SSTable），把随机写变成顺序写，提升写性能。

【结构】内存 MemTable + 磁盘 SSTable（分层）+ WAL 日志。

【写入流程】写 WAL（防丢）→ 写 MemTable → 满了 flush 成 SSTable → 后台合并（Compaction）。

【读流程】先查 MemTable，再查磁盘 SSTable（可能多层），可用布隆过滤器加速。

【为什么写快】顺序写 + 批量刷盘，避免随机 IO；读需合并多层，读放大是其代价。

【应用】HBase、Cassandra、RocksDB、LevelDB。`,
      source: '大厂八股文 / LSM'
    },
    {
      id: 'db-086', category: 'database', tags: ['存储引擎'], difficulty: 2,
      question: 'LSM 树和 B+ 树有什么区别？各自的优劣？',
      answer: `一句话结论：B+ 树读快写慢（原地更新、随机 IO），LSM 树写快读慢（顺序写、多层读）；前者适合 OLTP，后者适合写密集。

【B+ 树】
· 写：原地更新，可能页分裂，随机 IO；
· 读：单层查询，快；
· 适合：事务型数据库（MySQL）。

【LSM 树】
· 写：顺序追加，快；
· 读：需查内存+多层磁盘，读放大；
· 适合：写多读少、日志、时序（HBase、RocksDB）。

【面试追问】为什么 LSM 读会放大？→ 一个 key 可能分布在多层 SSTable，需逐层查找（配合布隆过滤优化）。`,
      source: '数据库八股文'
    },
    {
      id: 'db-087', category: 'database', tags: ['时序数据库'], difficulty: 1,
      question: '什么是时序数据库？InfluxDB 适合什么场景？',
      answer: `一句话结论：时序数据库专门存储「带时间戳」的指标数据，优化按时间范围的写入与聚合查询。

【特点】按时间有序写入、高压缩、时间窗口聚合、自动过期清理。

【适用】监控指标、IoT 传感器、金融行情、日志趋势。

【代表】InfluxDB、TimescaleDB、Prometheus。

【与关系型区别】时序库针对「append-only + 时间范围查询」优化，比通用数据库更高效。`,
      source: '数据库八股文'
    },
    {
      id: 'db-088', category: 'database', tags: ['图数据库'], difficulty: 1,
      question: '图数据库（Neo4j）适合什么场景？为什么关系型不适合做关系查询？',
      answer: `一句话结论：图数据库用「节点 + 边」模型存储，适合多跳关系查询（社交、推荐、风控），比关系型 join 高效。

【为什么关系型不适合】多跳关系需多次 join，随跳数增加性能急剧下降；图数据库直接按边遍历，天然高效。

【适用场景】社交关系（好友的好友）、知识图谱、欺诈检测（关联分析）、推荐系统、路径规划。

【代表】Neo4j、JanusGraph。

【面试追问】图数据库的查询语言？→ Cypher（Neo4j）、Gremlin。`,
      source: '数据库八股文'
    },
    {
      id: 'db-089', category: 'database', tags: ['缓存', '一致性'], difficulty: 2,
      question: '从数据库角度看，缓存与数据库一致性如何保证？',
      answer: `一句话结论：缓存一致性核心是「以数据库为准，缓存跟随更新」，用 Cache Aside（旁路缓存）或订阅 binlog 保证。

【Cache Aside】读：先查缓存，未命中查库并回填；写：先更新 DB，再删除缓存。

【订阅 binlog】数据库变更 → Canal 订阅 binlog → 异步删除/更新缓存，缓存严格跟随 DB。

【关键】顺序与失败重试：更新 DB 后删缓存，删除失败要重试（消息队列）；缓存设 TTL 兜底。

【避坑】不要「先删缓存再更新 DB」，高并发下易产生脏数据；优先「先更 DB 再删缓存」。`,
      source: '大厂八股文 / 缓存一致性'
    },
    {
      id: 'db-090', category: 'database', tags: ['分布式', 'ACID'], difficulty: 3,
      question: '分布式环境下如何保证 ACID？有哪些挑战？',
      answer: `一句话结论：分布式下 ACID 无法靠单机机制实现，需引入分布式事务/一致性协议，核心挑战是网络分区与多节点协调。

【挑战】网络不可靠、节点故障、时钟不同步、没有全局锁，原子性和隔离性都难保证。

【方案】
· 原子性/一致性：2PC/3PC/TCC/Saga、Raft 副本；
· 隔离性：分布式锁、乐观并发（版本号）；
· 持久性：多副本 + 多数派确认。

【现实】多数分布式系统放弃强一致，用 BASE（最终一致）换取可用性与性能。`,
      source: '大厂八股文 / 分布式'
    },
    {
      id: 'db-091', category: 'database', tags: ['性能', '指标'], difficulty: 1,
      question: 'TPS、QPS、RT、并发数分别指什么？它们有什么关系？',
      answer: `一句话结论：QPS 每秒查询数、TPS 每秒事务数、RT 响应时间、并发数同时在处理的请求数，关系是并发数 = QPS × RT。

【定义】
· QPS：每秒处理的查询/请求数；
· TPS：每秒完成的事务数（写场景）；
· RT：单次请求响应时间；
· 并发数：同一时刻在处理的请求数。

【关系（Little 定律）】并发数 = QPS × 平均 RT。

【应用】容量规划：已知目标 QPS 与单机 RT，可推所需并发与机器数。

【避坑】区分「并发连接数」与「并发处理数」，前者含等待连接。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-092', category: 'database', tags: ['压测'], difficulty: 1,
      question: '如何用 sysbench 做数据库压测？',
      answer: `一句话结论：sysbench 通过模拟并发读写压测数据库，输出 TPS/QPS/延迟，用于评估容量与调优对比。

【流程】
1. prepare：创建压测表与数据；
2. run：指定线程数、读写比例、时间，执行压测；
3. 观察 TPS/QPS、95/99 分位延迟；
4. cleanup 清理。

【要点】压测要贴近真实业务（读写比、数据量），单次时间足够长；观察数据库连接数、CPU、锁等待。

【避坑】压测结果受机器、参数影响，要多次取稳定值；避免在线上直接压测。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-093', category: 'database', tags: ['容量'], difficulty: 1,
      question: '如何估算一张表的数据量和索引大小？',
      answer: `一句话结论：用 information_schema 或 SHOW TABLE STATUS 查看表的数据长度与索引长度，也可按行大小估算。

【方法】
1. SHOW TABLE STATUS 看 Data_length（数据）+ Index_length（索引）；
2. information_schema.tables 查同样字段；
3. 估算：总行数 × 平均行大小（含索引列）。

【用途】容量规划、磁盘监控、判断是否需要归档/分表。

【避坑】Data_length 不含碎片与未回收空间，实际占用可能更大；估算值用于趋势判断即可。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-094', category: 'database', tags: ['优化', '排查'], difficulty: 2,
      question: '大表查询慢的通用排查思路是什么？',
      answer: `一句话结论：大表慢查询排查按「慢日志定位 → explain 分析 → 索引/改写 → 数据量治理」层层推进。

【思路】
1. 定位：慢查询日志/监控找到慢 SQL；
2. 分析：explain 看 type、rows、Extra，判断是否走索引、是否 filesort/temporary；
3. 优化：加/改索引、改写 SQL（避免函数/隐式转换/select *）、limit 优化；
4. 治理：数据量太大考虑归档、冷热分离、分库分表。

【避坑】先确认是「查询本身差」还是「数据量太大」，两者解法不同。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-095', category: 'database', tags: ['运维', '连接'], difficulty: 1,
      question: '数据库连接数打满（Too many connections）怎么办？',
      answer: `一句话结论：连接数打满先「临时提高上限止血」，再「定位连接被谁占用」，从连接池配置与慢查询两方面根治。

【应急】
1. 调大 max_connections（临时）；
2. 杀掉空闲/异常连接（kill）。

【根治】
1. 看连接来源：是应用连接池配置过大，还是连接泄漏；
2. 检查慢查询：慢 SQL 占用连接不释放；
3. 合理配置连接池大小（不是越大越好）。

【避坑】连接池大小要结合 QPS×RT 估算，避免「连接池过大」挤爆数据库连接数。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-096', category: 'database', tags: ['连接池', '慢查询'], difficulty: 2,
      question: '连接池耗尽和慢查询之间有什么关系？',
      answer: `一句话结论：慢查询会长时间占用连接，导致连接池耗尽，进而连锁反应（请求排队超时、雪崩），两者互为因果。

【机制】一条慢 SQL 占用连接迟迟不释放，并发下连接池被占满，新请求等待超时，又加重压力。

【排查】连接池耗尽时，先看数据库侧是否有慢查询/锁等待，往往是根因。

【解决】
1. 优化慢 SQL（加索引/改写）；
2. 设置合理的连接超时与池大小；
3. 限流、降级保护。

【避坑】只调大连接池治标不治本，反而把压力传导给数据库。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-097', category: 'database', tags: ['并发', '乐观锁'], difficulty: 1,
      question: '数据库的乐观并发控制（版本号）是如何实现的？',
      answer: `一句话结论：乐观锁不加锁，更新时带版本号，比较版本一致才更新，不一致则重试或失败。

【实现】表加 version 字段：update ... set version = version+1 where id=? and version=旧版本；影响行数为 0 说明版本已变（被并发修改）。

【适用】读多写少、冲突概率低的场景。

【对比悲观锁】悲观锁（select for update）先加锁，冲突高时开销大；乐观锁无锁、冲突时重试。

【避坑】乐观锁在高冲突场景会大量重试失败；CAS 是乐观锁在内存层面的体现。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-098', category: 'database', tags: ['系统设计', '表设计'], difficulty: 2,
      question: '如何设计一个评论系统的数据库表结构？',
      answer: `一句话结论：评论系统核心是「评论表 + 用户/对象关联 + 层级/计数」，用冗余字段与合适索引支撑高并发读写。

【表设计】
1. 评论表 comment：id、对象 id（如文章）、用户 id、内容、父评论 id（支持楼中楼）、点赞数、状态、时间；
2. 冗余对象信息或按对象分表；
3. 计数（评论数、点赞数）可冗余到对象表或 Redis。

【索引】(对象 id, 时间) 联合索引支撑按对象分页查询；用户维度索引。

【扩展】海量评论分库分表（按对象 id 分片）、点赞用 Redis 计数 + 异步落库。

【面试追问】楼中楼怎么存？→ 用 parent_id 自关联，或「根评论 + 子评论」扁平化。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-099', category: 'database', tags: ['锁', '排查'], difficulty: 2,
      question: '如何查看和优化 InnoDB 的锁等待？',
      answer: `一句话结论：用 information_schema 的 innodb_trx、innodb_lock_waits 等表查看当前事务与锁等待关系，定位阻塞源头。

【排查】
1. select * from information_schema.innodb_trx：当前活跃事务；
2. innodb_lock_waits：锁等待关系（谁等谁）；
3. 结合 processlist 找阻塞的 SQL；
4. 必要时 kill 阻塞事务。

【优化】缩短事务、缩小锁范围、按固定顺序加锁、加合适索引减少锁记录数。

【避坑】锁等待往往是「长事务 + 大范围锁」导致，先找阻塞源头，别乱 kill。`,
      source: '牛客面经高频'
    },
    {
      id: 'db-100', category: 'database', tags: ['索引', '失效'], difficulty: 2,
      question: '总结：哪些经典场景会导致索引失效？如何避免？',
      answer: `一句话结论：索引失效的经典场景可归纳为「列被处理、类型不匹配、最左原则被破坏、范围后断、优化器选择全表」几类。

【经典失效】
1. 对索引列用函数/运算（date(col)、col+1）；
2. 隐式类型转换（字符串列和数字比）；
3. 前导通配符 like '%xx'；
4. 违背最左前缀（跳过联合索引首列）；
5. 范围查询后的列失效；
6. or 连接非索引列；
7. 优化器认为全表更快（结果集大）。

【避免】索引列保持原样比较、参数类型一致、联合索引顺序合理、必要时用覆盖索引。

【避坑】explain 是判断索引是否命中的直接手段，遇到慢查询先看执行计划。`,
      source: '大厂八股文 / 索引失效'
    }
  ];

  global.App = global.App || {};
  global.App.db2Bank = DB2;
})(window);
