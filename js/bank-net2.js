/**
 * OfferAgent · 扩充题库（网络 · 第二批：net-021 ~ net-100）
 * 挂载到 global.App.net2Bank，由 bank.js 加载时合并。
 * 答案采用「一句话结论 + 完整解答」范式。
 */
(function (global) {
  'use strict';

  var NET2 = [
    {
      id: 'net-021', category: 'network', tags: ['TCP', '可靠性'], difficulty: 2,
      question: 'TCP 如何保证可靠传输？',
      answer: `一句话结论：TCP 靠「序号、确认应答、超时重传、校验和、流量/拥塞控制、连接管理」六大机制保证可靠。

【机制】
1. 序号：每个字节编号，接收方能排序、去重；
2. 确认应答 ACK：收到数据回复确认；
3. 超时重传：未收到 ACK 则重发；
4. 校验和：检测传输错误；
5. 流量控制（滑动窗口）+ 拥塞控制：防止丢包与拥塞；
6. 连接管理（三次握手/四次挥手）。

【面试追问】TCP 可靠是「绝对不丢」吗？→ 不是，是「有序、无差错、不丢失、不重复」的字节流抽象，靠重传兜底。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-022', category: 'network', tags: ['TCP', '重传'], difficulty: 2,
      question: 'TCP 的超时重传和快速重传有什么区别？',
      answer: `一句话结论：超时重传靠「超时定时器」触发（慢），快速重传靠「收到 3 个重复 ACK」触发（快），不用等超时。

【超时重传】发送后启动定时器，超时未收到 ACK 则重发；超时时间（RTO）动态计算（基于 RTT），通常较长。

【快速重传】接收方收到乱序包会重复 ACK 期望的序号，发送方收到 3 个重复 ACK 立即重传丢失的包，不等超时。

【配合】快速重传后常触发快速恢复（快重传 + 快恢复，拥塞窗口减半而非降到 1）。

【面试追问】为什么是 3 个重复 ACK？→ 足够排除「轻微乱序」，确认大概率是丢包。`,
      source: '大厂八股文 / TCP'
    },
    {
      id: 'net-023', category: 'network', tags: ['TCP', '流量控制'], difficulty: 2,
      question: 'TCP 的流量控制（滑动窗口）是如何工作的？什么是零窗口？',
      answer: `一句话结论：流量控制靠「滑动窗口」，接收方通过窗口大小告知发送方还能收多少数据，防止发送过快淹没接收方。

【滑动窗口】发送方维护发送窗口，只能发送窗口内的数据；收到 ACK 后窗口向前滑动。接收方在 ACK 里通告自己的接收窗口（rwnd）。

【零窗口】接收方缓冲区满，通告窗口为 0，发送方停止发送，直到收到窗口更新（或定时探测）。

【与拥塞控制区别】流量控制是「点对点」防止接收方溢出；拥塞控制是「全局」防止网络拥塞。

【面试追问】零窗口死锁怎么解？→ 发送方定时发探测报文（persist timer）询问窗口。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-024', category: 'network', tags: ['TCP', '拥塞控制'], difficulty: 3,
      question: 'TCP 拥塞控制的四大算法是什么？拥塞窗口如何变化？',
      answer: `一句话结论：慢启动、拥塞避免、快重传、快恢复四大算法协同，让发送速率「指数增长 → 线性增长 → 拥塞减半」，动态适应网络。

【慢启动】cwnd 从 1 开始，每收到一个 ACK 指数增长（翻倍），直到阈值 ssthresh。

【拥塞避免】cwnd 超过 ssthresh 后线性增长（每 RTT 加 1）。

【快重传】收到 3 个重复 ACK，立即重传丢失包。

【快恢复】快重传后 cwnd 减半、ssthresh 设为 cwnd，进入拥塞避免，而非降到慢启动。

【避坑】区分「超时」（RTO 触发，回慢启动）与「快重传」（3 个重复 ACK，进快恢复）。`,
      source: '大厂八股文 / TCP'
    },
    {
      id: 'net-025', category: 'network', tags: ['TCP', '状态'], difficulty: 2,
      question: 'TIME_WAIT 和 CLOSE_WAIT 状态分别是什么？为什么会出现？',
      answer: `一句话结论：TIME_WAIT 是主动关闭方等待 2MSL 的状态，CLOSE_WAIT 是被动关闭方收到 FIN 后、未调用 close 的状态。

【TIME_WAIT】主动关闭方在发完最后一个 ACK 后进入，持续 2MSL；作用：保证最后的 ACK 能到达 + 让旧连接报文在网络中消亡。

【CLOSE_WAIT】被动方收到 FIN、回复 ACK 后进入，等待应用调用 close；若应用忘了 close，会一直停留在 CLOSE_WAIT，是「连接泄漏」的典型表现。

【面试追问】CLOSE_WAIT 大量堆积说明什么？→ 应用代码没有正确关闭 socket（如未处理连接关闭事件）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-026', category: 'network', tags: ['TCP', '优化'], difficulty: 2,
      question: 'TIME_WAIT 过多会有什么问题？如何解决？',
      answer: `一句话结论：TIME_WAIT 过多会耗尽端口/连接资源；解决靠端口复用、调整内核参数、改用长连接。

【问题】大量短连接下，主动关闭方积累大量 TIME_WAIT，占用端口（客户端）或连接资源（服务端）。

【解决】
1. 客户端：改用长连接（连接池）；
2. 内核参数：net.ipv4.tcp_tw_reuse（复用）、tcp_tw_recycle（已废弃，慎用）；
3. 服务端：让客户端主动关闭（服务端少产生 TIME_WAIT）；
4. 调整 tcp_fin_timeout。

【避坑】tcp_tw_recycle 在 NAT 场景下会出问题，已不推荐；首选长连接与连接池。`,
      source: '大厂八股文 / TCP'
    },
    {
      id: 'net-027', category: 'network', tags: ['TCP', '保活'], difficulty: 1,
      question: 'TCP keepalive 机制是什么？',
      answer: `一句话结论：TCP keepalive 通过定时发送探测包，检测连接对端是否存活，清理「半开连接」。

【原理】连接空闲一段时间后，定期发送探测报文，若多次无响应则判定对端已死，关闭连接。

【参数】tcp_keepalive_time（空闲多久开始探测）、tcp_keepalive_intvl（探测间隔）、tcp_keepalive_probes（探测次数）。

【应用层】HTTP 的 keep-alive 是连接复用（不同概念）；业务层常用应用层心跳（如 WebSocket ping/pong）更可控。

【避坑】TCP keepalive 默认间隔较长（如 2 小时），实时系统需应用层心跳。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-028', category: 'network', tags: ['TCP', '优化'], difficulty: 2,
      question: 'Nagle 算法和延迟 ACK 是什么？它们交互会导致什么问题？',
      answer: `一句话结论：Nagle 减少小包发送（攒够再发），延迟 ACK 推迟确认（攒 ACK），两者叠加可能造成「延迟 40ms」的交互问题。

【Nagle 算法】发送方在「未确认数据」存在时，把小的后续数据攒起来，凑满 MSS 或收到 ACK 再发，减少小包。

【延迟 ACK】接收方收到数据后不立即 ACK，等 40~200ms 看是否有数据要一起带（捎带确认）。

【交互问题】发送方等 ACK 才发下一小包，接收方等数据才 ACK，互相等待造成延迟。

【解决】实时性要求高的场景关闭 Nagle（TCP_NODELAY）。`,
      source: '大厂八股文 / TCP'
    },
    {
      id: 'net-029', category: 'network', tags: ['安全', 'TCP'], difficulty: 2,
      question: '什么是 SYN 泛洪攻击？SYN Cookie 如何防御？',
      answer: `一句话结论：SYN 泛洪是攻击者伪造大量 SYN 耗尽服务端半连接队列；SYN Cookie 不分配资源、用算法生成序列号验证，抵御泛洪。

【SYN 泛洪】客户端大量发 SYN 不完成握手，服务端为每个 SYN 分配半连接资源，队列被占满，正常请求无法建立连接。

【SYN Cookie】服务端收到 SYN 时不分配资源，而是根据源 IP/端口/时间等算出 cookie 作为 SYN+ACK 的序列号；收到合法 ACK 校验 cookie 通过才分配资源。

【其他防御】增大半连接队列、缩短重试、限流、防火墙清洗。

【避坑】SYN Cookie 会丢失部分 TCP 选项（如窗口缩放），极端情况下影响性能。`,
      source: '大厂八股文 / 安全'
    },
    {
      id: 'net-030', category: 'network', tags: ['UDP', 'QUIC'], difficulty: 2,
      question: 'UDP 如何实现可靠传输？QUIC、KCP 是怎么做的？',
      answer: `一句话结论：UDP 本身不可靠，但可在应用层实现「序号、重传、拥塞控制」等机制，QUIC 和 KCP 是典型代表。

【QUIC】基于 UDP 的传输协议（HTTP/3 底层）：
1. 在应用层实现可靠传输（序号、重传）；
2. 0-RTT 握手、连接迁移、多路复用无队头阻塞。

【KCP】快速可靠传输协议，用「更大重传、快速重传、可选拥塞控制」换取低延迟，适合游戏等实时场景。

【为什么用 UDP 自建可靠】绕过 TCP 的队头阻塞、慢启动等限制，针对场景定制。

【面试追问】为什么 QUIC 不用 TCP？→ TCP 在操作系统内核，迭代难；UDP 在用户态，灵活且可避免 TCP 队头阻塞。`,
      source: '大厂八股文 / QUIC'
    },
    {
      id: 'net-031', category: 'network', tags: ['HTTP', '状态'], difficulty: 1,
      question: 'HTTP 是无状态协议，如何保持登录状态？',
      answer: `一句话结论：HTTP 本身无状态，靠 Cookie、Session、Token 在请求间传递身份信息来「模拟」有状态。

【Cookie】服务端通过 Set-Cookie 让浏览器保存小数据，后续请求自动带上；常存 sessionId 或 token。

【Session】服务端存储用户状态，客户端只存 sessionId（Cookie）；有状态、需存储。

【Token（JWT）】服务端签发的自包含凭证，客户端存 token，服务端无状态验证；适合分布式。

【面试追问】为什么 HTTP 设计成无状态？→ 简化协议、提升扩展性；状态交给应用层管理。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-032', category: 'network', tags: ['HTTP', '缓存'], difficulty: 2,
      question: 'HTTP 缓存机制：强缓存和协商缓存有什么区别？',
      answer: `一句话结论：强缓存不请求服务器直接复用缓存，协商缓存先问服务器「是否过期」，未变则用缓存。

【强缓存】由 Cache-Control/Expires 决定，未过期直接用缓存，不发请求，状态码 200（from cache）。

【协商缓存】强缓存过期后，带 If-Modified-Since / If-None-Match 请求服务器，服务器返回 304（未变，用缓存）或 200（新数据）。

【流程】强缓存命中 → 直接用；未命中 → 协商缓存 → 304 用缓存 / 200 拉新。

【面试追问】强缓存和协商缓存分别用什么头？→ 强：Cache-Control、Expires；协商：ETag/If-None-Match、Last-Modified/If-Modified-Since。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-033', category: 'network', tags: ['HTTP', '缓存'], difficulty: 1,
      question: 'Cache-Control 和 Expires 有什么区别？',
      answer: `一句话结论：Expires 是绝对过期时间（HTTP/1.0，受客户端时钟影响），Cache-Control 是相对时间/更精细的控制（HTTP/1.1），优先级更高。

【Expires】指定具体过期时间点，如 Expires: Wed, 21 Oct 2026 07:28:00 GMT；客户端时钟不准会出问题。

【Cache-Control】用 max-age 相对秒数，如 max-age=3600（1 小时后过期）；还支持 no-cache、no-store、public、private、s-maxage 等。

【优先级】Cache-Control 优先级高于 Expires（同时存在时以 Cache-Control 为准）。

【面试追问】no-cache 和 no-store 区别？→ no-cache 可缓存但每次要协商；no-store 完全不缓存。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-034', category: 'network', tags: ['HTTP', '缓存'], difficulty: 2,
      question: 'ETag 和 Last-Modified 有什么区别？',
      answer: `一句话结论：两者都是协商缓存的校验依据——Last-Modified 用「最后修改时间」，ETag 用「内容标识」，ETag 更精确。

【Last-Modified】服务器返回资源最后修改时间，下次请求带 If-Modified-Since，未变则 304。

【ETag】服务器返回资源内容的唯一标识（哈希），下次带 If-None-Match。

【ETag 优势】
1. 精度到内容级别（Last-Modified 秒级，1 秒内多次修改无法区分）；
2. 内容没变但时间变（如重新生成）不会误判。

【优先级】ETag 优先于 Last-Modified。

【避坑】分布式系统下 ETag 要保证一致性（内容相同 ETag 相同）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-035', category: 'network', tags: ['HTTP', '缓存'], difficulty: 2,
      question: '浏览器缓存策略如何设计（哪些资源强缓存、哪些协商缓存）？',
      answer: `一句话结论：带哈希的静态资源（如 JS/CSS/图片）用强缓存（长期），HTML 用协商缓存，保证更新及时且缓存命中高。

【策略】
1. HTML 入口：no-cache（协商缓存），保证及时拿到最新引用；
2. 带内容哈希的静态资源（app.abc123.js）：Cache-Control: max-age=31536000 长期强缓存（内容变哈希变，天然更新）；
3. 图片/字体：长期强缓存；
4. 接口数据：不缓存或短缓存。

【为什么】哈希文件名让「内容不变则 URL 不变（命中缓存）、内容变则 URL 变（拉新）」，兼顾缓存与更新。

【避坑】HTML 若也强缓存，更新后用户拿不到新资源引用，出现「白屏/旧版」。`,
      source: '大厂八股文 / 缓存'
    },
    {
      id: 'net-036', category: 'network', tags: ['TLS', 'HTTPS'], difficulty: 3,
      question: 'TLS 握手过程是怎样的？TLS 1.2 和 1.3 有什么区别？',
      answer: `一句话结论：TLS 握手协商加密套件、验证证书、交换密钥；TLS 1.2 需 2 个 RTT，1.3 简化到 1 RTT，且强制前向安全。

【TLS 1.2 握手】
1. ClientHello（随机数、支持的套件）；
2. ServerHello（随机数、选定套件）+ 证书 + ServerHelloDone；
3. 客户端验证书、生成预主密钥，用公钥加密发送；
4. 双方用随机数 + 预主密钥算出会话密钥；
5. Finished 确认，开始加密通信。

【TLS 1.3 优化】
1. 握手减到 1 RTT（客户端直接猜密钥参数，发送时即开始加密）；
2. 移除不安全算法，只留 AEAD + 前向安全密钥交换（ECDHE）；
3. 支持 0-RTT 恢复。

【面试追问】为什么 1.2 要 2 RTT？→ 需「ClientHello→ServerHello+证书→客户端密钥交换」多个往返。`,
      source: '大厂八股文 / TLS'
    },
    {
      id: 'net-037', category: 'network', tags: ['TLS'], difficulty: 2,
      question: 'TLS 1.3 相比 TLS 1.2 有哪些改进？',
      answer: `一句话结论：TLS 1.3 更快（1-RTT/0-RTT）、更安全（强制前向安全、移除弱算法）、更简洁。

【改进】
1. 握手更快：1 RTT，去掉不必要的往返；
2. 0-RTT：支持恢复会话时首包即带数据；
3. 安全性：移除 RSA 密钥交换、RC4、SHA-1 等，只保留 AEAD 加密与前向安全；
4. 加密更多握手信息（如证书），减少隐私泄露。

【面试追问】0-RTT 的代价？→ 可能遭受重放攻击，需应用层处理。为什么移除非前向安全算法？→ 防止私钥泄露后历史流量被解密。`,
      source: '大厂八股文 / TLS'
    },
    {
      id: 'net-038', category: 'network', tags: ['HTTPS', '加密'], difficulty: 2,
      question: 'HTTPS 中对称加密和非对称加密分别用在哪里？为什么这样设计？',
      answer: `一句话结论：HTTPS 用非对称加密协商出对称密钥（密钥交换），之后用对称加密传输数据，兼顾安全与性能。

【非对称加密】握手阶段用于密钥交换、身份认证（证书验签）；RSA/ECDHE。

【对称加密】握手后用于加密应用数据；AES 等，速度快。

【为什么混合】非对称加密安全但慢（慢几个数量级），对称加密快但密钥分发难；用非对称「安全地交换对称密钥」，再用对称「高效地加密数据」，取长补短。

【面试追问】为什么不用非对称加密传所有数据？→ 性能太差，无法支撑大数据量。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-039', category: 'network', tags: ['安全', '证书'], difficulty: 2,
      question: '数字签名和数字证书分别是什么？有什么关系？',
      answer: `一句话结论：数字签名用私钥对内容摘要加密，验证完整性与来源；数字证书由 CA 签发，把公钥与身份绑定，解决「公钥是谁的」问题。

【数字签名】对内容哈希，用发送方私钥加密哈希得到签名；接收方用公钥解密比对哈希，验证内容未被篡改且来自发送方。

【数字证书】包含公钥、持有者信息、CA 签名等；CA 用自己的私钥给证书签名，客户端用 CA 公钥验签，信任链保证公钥真实。

【关系】签名是技术手段，证书是把公钥和身份绑定、解决信任问题的载体。

【面试追问】为什么需要 CA？→ 单纯发公钥可能被中间人替换，CA 提供可信第三方背书。`,
      source: '大厂八股文 / 安全'
    },
    {
      id: 'net-040', category: 'network', tags: ['HTTPS', '安全'], difficulty: 1,
      question: '什么是 HSTS？它解决什么问题？',
      answer: `一句话结论：HSTS（HTTP 严格传输安全）强制浏览器只用 HTTPS 访问该站点，防止 SSL 剥离与降级攻击。

【作用】服务端返回 Strict-Transport-Security 头，浏览器在指定时间内对该域名只走 HTTPS，即使输入 http:// 也自动转 https。

【解决】防止「第一次 HTTP 请求被劫持/降级」的中间人攻击（SSL 剥离）。

【配合】还可配合 preload 把域名加入浏览器内置 HSTS 列表。

【避坑】HSTS 首次访问仍是 HTTP（需先访问一次 HTTPS 拿到头），preload 可解决。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-041', category: 'network', tags: ['HTTP/2'], difficulty: 2,
      question: 'HTTP/2 的多路复用是什么？它如何解决队头阻塞？',
      answer: `一句话结论：HTTP/2 在单条 TCP 连接上并行传输多个请求/响应（分帧 + 流），解决 HTTP/1.1 应用层队头阻塞。

【原理】把请求/响应拆成二进制帧，多个「流」（Stream）在一条连接上交错传输，按流 ID 重组。

【解决应用层队头阻塞】HTTP/1.1 一个连接同时只能处理一个请求，前面的慢会阻塞后面；HTTP/2 多流并行，互不阻塞。

【局限】HTTP/2 仍有「TCP 层队头阻塞」——TCP 丢包重传会阻塞整个连接，这由 HTTP/3（QUIC）解决。

【其他特性】头部压缩（HPACK）、服务端推送。`,
      source: '大厂八股文 / HTTP/2'
    },
    {
      id: 'net-042', category: 'network', tags: ['HTTP/3', 'QUIC'], difficulty: 2,
      question: 'HTTP/3 和 QUIC 是什么？相比 HTTP/2 有什么改进？',
      answer: `一句话结论：HTTP/3 基于 QUIC（UDP），用「连接迁移 + 无队头阻塞 + 0-RTT」解决 HTTP/2 在 TCP 上的固有问题。

【QUIC 特性】
1. 基于 UDP：绕开 TCP 内核限制；
2. 多路复用无队头阻塞：每个流独立，丢包只影响对应流；
3. 连接迁移：用连接 ID 而非 IP+端口标识连接，网络切换不断连；
4. 0-RTT：快速恢复会话。

【相比 HTTP/2】HTTP/2 底层 TCP 丢包会阻塞整条连接（TCP 队头阻塞），HTTP/3 用 QUIC 彻底解决。

【面试追问】QUIC 为什么能连接迁移？→ 用独立连接 ID 标识，IP 变了仍可识别同一连接。`,
      source: '大厂八股文 / HTTP/3'
    },
    {
      id: 'net-043', category: 'network', tags: ['RPC', 'gRPC'], difficulty: 2,
      question: 'gRPC 和 Protobuf 是什么？为什么 RPC 常用它？',
      answer: `一句话结论：gRPC 是高性能 RPC 框架，Protobuf 是它的序列化协议，靠「二进制序列化 + HTTP/2 + 强类型」实现高效通信。

【Protobuf】二进制序列化，比 JSON 体积小、解析快，用 .proto 定义接口生成代码（强类型、跨语言）。

【gRPC】基于 HTTP/2 的 RPC，支持流式（普通/客户端流/服务端流/双向流）、负载均衡、拦截器。

【优势】体积小、性能高、接口契约清晰（proto 文件即文档）、适合微服务内部通信。

【对比 REST】REST 用 JSON+HTTP，可读性好、通用；gRPC 性能好、类型安全，但调试不如 JSON 直观。`,
      source: '大厂八股文 / RPC'
    },
    {
      id: 'net-044', category: 'network', tags: ['REST', 'API'], difficulty: 1,
      question: 'RESTful API 的设计规范有哪些？',
      answer: `一句话结论：RESTful 用「资源 + HTTP 方法 + 状态码」表达接口，URL 是名词资源，用 GET/POST/PUT/DELETE 表达操作。

【规范】
1. URL 用名词复数表示资源（/users、/orders），不出现动词；
2. 用 HTTP 方法表达操作：GET 查、POST 增、PUT 改、DELETE 删；
3. 用状态码表达结果：200 成功、201 创建、400 参数错误、404 不存在、500 服务器错误；
4. 分层、无状态；
5. 版本控制（/v1/users）。

【面试追问】PUT 和 POST 区别？→ PUT 幂等、语义是「替换/更新」，POST 非幂等、语义是「创建/处理」。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-045', category: 'network', tags: ['Socket', '编程'], difficulty: 1,
      question: 'Socket（套接字）是什么？TCP Socket 编程的基本流程？',
      answer: `一句话结论：Socket 是应用层与传输层之间的编程接口，封装 TCP/UDP 通信；TCP Socket 流程是「bind→listen→accept」与「connect」配合。

【服务端】socket() → bind() 绑定端口 → listen() 监听 → accept() 接受连接 → read/write → close()。

【客户端】socket() → connect() 连接 → read/write → close()。

【Socket 本质】一个 Socket 由「IP + 端口」标识端点，一条 TCP 连接由「四元组（源IP+源端口+目的IP+目的端口）」唯一确定。

【面试追问】一个端口能建立多少连接？→ 理论上由四元组决定，可建立大量连接（受文件描述符、内存限制）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-046', category: 'network', tags: ['IO 模型'], difficulty: 2,
      question: 'BIO、NIO、AIO 有什么区别？',
      answer: `一句话结论：BIO 阻塞 IO（一连接一线程）、NIO 非阻塞 IO（多路复用，一线程管多连接）、AIO 异步 IO（内核完成后回调）。

【BIO】每个连接一个线程，read/write 阻塞；简单但线程开销大，不适合高并发。

【NIO】非阻塞 + 多路复用（Selector），一个线程管理多个连接，事件驱动；Java NIO、Netty 基于此。

【AIO】异步非阻塞，读写完成由内核通知（回调），真正的异步；Java 支持但应用较少（Netty 用 NIO 为主）。

【面试追问】NIO 和 AIO 核心区别？→ NIO 是「非阻塞 + 主动轮询」，AIO 是「内核完成后回调」，NIO 就够用且更可控。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-047', category: 'network', tags: ['IO 模型'], difficulty: 3,
      question: '五种 IO 模型分别是什么？',
      answer: `一句话结论：五种 IO 模型是「阻塞、非阻塞、IO 多路复用、信号驱动、异步」，区别在「等待数据」和「复制数据」阶段是否阻塞。

【1. 阻塞 IO】发起 IO 后一直等，直到数据就绪并复制完成。

【2. 非阻塞 IO】不断轮询，数据未就绪立即返回（不阻塞），就绪后再复制。

【3. IO 多路复用】select/poll/epoll 同时监听多个 fd，就绪后处理（阻塞在 select 上）。

【4. 信号驱动 IO】数据就绪时内核发信号通知，再复制数据。

【5. 异步 IO】发起后立即返回，数据就绪并复制完成由内核通知（真异步）。

【面试追问】多路复用 vs 非阻塞？→ 多路复用阻塞在「等待任一 fd 就绪」上，用单线程管多连接，是高性能服务器的核心。`,
      source: '大厂八股文 / IO 模型'
    },
    {
      id: 'net-048', category: 'network', tags: ['NAT', '地址'], difficulty: 2,
      question: 'NAT 是什么？它如何实现地址转换和端口映射？',
      answer: `一句话结论：NAT（网络地址转换）把内网私有地址转换成公网地址，解决 IPv4 地址不足，端口映射让内网服务可被外网访问。

【原理】内网主机出网时，NAT 设备把源「私有 IP+端口」替换成「公网 IP+新端口」，记录映射；回包按映射还原。

【类型】静态 NAT（一对一）、动态 NAT、PAT（端口复用，最常用，多内网共用一个公网 IP）。

【端口映射】把公网 IP 的某端口映射到内网主机的某端口，实现外网访问内网服务。

【面试追问】NAT 对 P2P 的影响？→ 需要打洞（STUN/TURN）穿透 NAT。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-049', category: 'network', tags: ['IP 地址'], difficulty: 1,
      question: '公网 IP 和私网 IP 有什么区别？私网地址段有哪些？',
      answer: `一句话结论：公网 IP 全球唯一、可直接在互联网路由；私网 IP 只在局域网内有效，不能直接访问公网，需 NAT。

【私网地址段】
· 10.0.0.0/8；
· 172.16.0.0/12；
· 192.168.0.0/16。

【区别】公网 IP 需向 ISP 申请、全球唯一；私网 IP 各局域网可重复使用、不占用公网资源。

【面试追问】为什么需要私网地址？→ IPv4 地址不足，用 NAT 让大量内网设备共享少量公网 IP。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-050', category: 'network', tags: ['IP 地址', 'IPv6'], difficulty: 1,
      question: 'IPv4 和 IPv6 有什么区别？',
      answer: `一句话结论：IPv6 用 128 位地址解决 IPv4 地址枯竭，且简化头部、支持自动配置、内置安全。

【地址】IPv4 32 位（约 43 亿），IPv6 128 位（海量）。

【其他区别】
1. IPv6 头部更简洁、固定 40 字节；
2. 支持无状态自动配置（SLAAC）；
3. 内置 IPSec（安全）；
4. 无广播，用组播；
5. 简化 NAT 需求。

【过渡】双栈、隧道、NAT64 等技术实现过渡。

【面试追问】IPv6 地址格式？→ 8 组 16 进制，用冒号分隔，可省略前导零与连续零。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-051', category: 'network', tags: ['子网'], difficulty: 2,
      question: '子网掩码和 CIDR 是什么？如何判断两个 IP 是否同网段？',
      answer: `一句话结论：子网掩码划分网络位与主机位，CIDR 用「IP/前缀长度」表示；两个 IP 与掩码相与结果相同则同网段。

【子网掩码】如 255.255.255.0，与 IP 按位与得到网络地址，区分网络号和主机号。

【CIDR】如 192.168.1.0/24，/24 表示前 24 位是网络位。

【判断同网段】IP1 & 掩码 == IP2 & 掩码，则同网段（可直接通信，否则需路由）。

【面试追问】/24 有几个可用 IP？→ 2^8 - 2 = 254（去掉网络地址和广播地址）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-052', category: 'network', tags: ['二层', 'VLAN'], difficulty: 2,
      question: 'VLAN 是什么？它解决什么问题？',
      answer: `一句话结论：VLAN（虚拟局域网）在二层把物理网络划分成多个逻辑隔离的广播域，解决广播泛滥与安全隔离问题。

【作用】
1. 隔离广播域：一个 VLAN 的广播不会扩散到其他 VLAN；
2. 安全：不同 VLAN 逻辑隔离，需三层路由互通；
3. 灵活：不依赖物理位置划分。

【实现】交换机端口划分 VLAN，帧打 802.1Q 标签（VLAN ID）；跨交换机用 Trunk 链路透传多 VLAN。

【面试追问】VLAN 间通信？→ 需三层设备（路由器/三层交换机）做路由（VLAN 间路由）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-053', category: 'network', tags: ['MTU', 'TCP'], difficulty: 2,
      question: 'MTU 和 MSS 分别是什么？它们有什么关系？',
      answer: `一句话结论：MTU 是链路层最大传输单元（含 IP 头，通常 1500 字节），MSS 是 TCP 最大报文段（不含 IP/TCP 头），MSS = MTU - 20（IP）- 20（TCP）。

【MTU】网络接口能传输的最大数据包大小，超过需分片；以太网典型 1500。

【MSS】TCP 层能发送的最大数据段，握手时协商，避免 IP 分片。

【关系】MSS + IP头(20) + TCP头(20) ≤ MTU，保证 TCP 报文不分片。

【面试追问】MTU 过小/不匹配会怎样？→ 分片增多、性能下降，甚至「黑洞」（大包被丢弃）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-054', category: 'network', tags: ['IP', '分片'], difficulty: 2,
      question: 'IP 分片和重组是什么？为什么尽量避免分片？',
      answer: `一句话结论：当数据包超过 MTU，IP 层会分片传输，到达目的端再重组；分片增加开销且一个分片丢失需整包重传，应尽量避免。

【分片】IP 层把大数据包拆成多个小分片（带相同标识 + 偏移量），各自路由。

【重组】目的端根据标识与偏移量重组完整报文。

【问题】分片丢一片则整个包重传；增加头部与处理开销；部分网络对分片不友好（NAT/防火墙）。

【避免】TCP 用 MSS 协商避免分片；UDP 应用层控制包大小；发现 MTU（PMTUD）。

【面试追问】谁负责分片重组？→ IP 层（分片在源端或中间路由器，重组在目的端）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-055', category: 'network', tags: ['ICMP', '工具'], difficulty: 1,
      question: 'ICMP 协议是什么？ping 和 traceroute 的原理？',
      answer: `一句话结论：ICMP 是网络层协议，用于传递错误与控制信息；ping 用 ICMP 回显请求/应答测连通，traceroute 用 TTL 递增探测路径。

【ICMP】封装在 IP 中，如回显请求/应答（Echo）、不可达、超时等类型。

【ping】发 ICMP Echo Request，对方回 Echo Reply，计算 RTT，测连通与延迟。

【traceroute】依次发 TTL=1,2,3... 的包，每个中间路由器 TTL 减到 0 回 ICMP 超时，从而逐跳发现路径。

【面试追问】ping 不通一定是网络不通吗？→ 不一定，可能对方禁 ICMP 或防火墙拦截。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-056', category: 'network', tags: ['DHCP'], difficulty: 1,
      question: 'DHCP 协议是做什么的？如何自动分配 IP？',
      answer: `一句话结论：DHCP 自动给主机分配 IP、子网掩码、网关、DNS 等配置，用 DORA 四步完成。

【流程（DORA）】
1. Discover：客户端广播寻找 DHCP 服务器；
2. Offer：服务器提供 IP 租约；
3. Request：客户端请求使用该 IP；
4. Acknowledge：服务器确认，完成分配。

【好处】集中管理、避免手动配置、IP 复用。

【面试追问】租约到期怎么办？→ 客户端续租（T1 时请求续期），到期不续则释放。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-057', category: 'network', tags: ['WebSocket', '握手'], difficulty: 2,
      question: 'WebSocket 的握手升级过程是怎样的？为什么需要握手？',
      answer: `一句话结论：WebSocket 通过 HTTP 的 Upgrade 机制升级为全双工长连接，握手是为了「借用 HTTP 端口/代理」并做鉴权。

【握手】客户端发 HTTP 请求带 Upgrade: websocket、Connection: Upgrade、Sec-WebSocket-Key；服务端回 101 Switching Protocols + Sec-WebSocket-Accept（基于 key 计算）。

【为什么握手】复用 80/443 端口与 HTTP 基础设施（代理、负载均衡），并通过 key 验证服务端理解 WebSocket 协议。

【握手后】连接升级为全双工，用帧传输（不再走 HTTP）。

【面试追问】Sec-WebSocket-Key 的作用？→ 验证服务端是真正的 WebSocket 服务，防止误连。`,
      source: '大厂八股文 / WebSocket'
    },
    {
      id: 'net-058', category: 'network', tags: ['实时通信'], difficulty: 2,
      question: '短轮询、长轮询、SSE、WebSocket 四种实时方案有什么区别？',
      answer: `一句话结论：短轮询定时请求、长轮询挂起等响应、SSE 服务端单向推送、WebSocket 双向全双工，实时性与资源开销递增。

【短轮询】客户端定时发请求，简单但实时性差、浪费请求。

【长轮询】请求挂起直到有数据或超时，实时性较好，但服务端连接占用多。

【SSE】服务端单向推送（基于 HTTP），客户端只能收，自动重连。

【WebSocket】全双工双向通信，实时性最好、开销最低，适合聊天/游戏。

【选型】实时消息推送 → SSE（单向）或 WebSocket（双向）；低频通知 → 短/长轮询。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-059', category: 'network', tags: ['SSE', '推送'], difficulty: 1,
      question: 'SSE（Server-Sent Events）是什么？和 WebSocket 有什么区别？',
      answer: `一句话结论：SSE 是基于 HTTP 的服务端单向推送技术，客户端建立连接后服务端持续推数据，自动重连；WebSocket 是全双工双向。

【SSE 特点】
1. 单向：服务端 → 客户端；
2. 基于 HTTP，自动重连、支持事件 ID；
3. 简单、易穿透代理。

【WebSocket】双向、帧协议、需握手升级，适合双向交互。

【选型】只需服务端推消息（如行情、通知）→ SSE；需双向（聊天、协作）→ WebSocket。

【面试追问】SSE 的 content-type？→ text/event-stream。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-060', category: 'network', tags: ['DNS', '记录'], difficulty: 2,
      question: 'DNS 的 A 记录、CNAME、NS、MX 分别是什么？',
      answer: `一句话结论：A 记录域名→IPv4 地址，CNAME 域名→另一域名（别名），NS 指定权威 DNS，MX 指定邮件服务器。

【A 记录】域名解析到 IPv4 地址（AAAA 是 IPv6）。

【CNAME】别名记录，把一个域名指向另一个域名（如 www → 主域名），常用于 CDN。

【NS 记录】指定该域名的权威 DNS 服务器。

【MX 记录】指定邮件服务器及优先级。

【面试追问】CNAME 和 A 记录能否共存？→ 同一域名不能同时有 CNAME 和其他记录（CNAME 会遮蔽）。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-061', category: 'network', tags: ['DNS', '解析'], difficulty: 3,
      question: 'DNS 的递归查询和迭代查询有什么区别？完整解析流程是怎样的？',
      answer: `一句话结论：递归查询是「我帮你查到底」，迭代查询是「我给你线索你自己接着查」；本地 DNS 通常以递归方式服务客户端、以迭代方式逐级查询权威服务器。

【递归查询】客户端 → 本地 DNS：本地 DNS 承诺给出最终结果，中间过程由它负责，查不到也返回明确失败。

【迭代查询】本地 DNS → 根/顶级/权威服务器：每级只返回「下一步该问谁」的 NS 线索，本地 DNS 继续发问，直到拿到最终 A 记录。

【完整流程】
1. 浏览器查本地缓存（浏览器 DNS 缓存、hosts 文件）；
2. 未命中 → 向本地 DNS 服务器发递归请求；
3. 本地 DNS 查自身缓存，未命中则向根服务器迭代查询；
4. 根返回顶级域（如 .com）服务器地址；
5. 顶级域返回权威服务器地址；
6. 权威服务器返回 A 记录；
7. 本地 DNS 缓存结果并回给客户端。

【面试追问】DNS 用 TCP 还是 UDP？→ 默认 UDP 53，区域传送与超过 512 字节时用 TCP 53。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-062', category: 'network', tags: ['DNS', '安全'], difficulty: 3,
      question: '什么是 DNS 劫持和 DNS 污染（投毒）？如何防范？',
      answer: `一句话结论：DNS 劫持是「篡改解析结果指向恶意服务器」，DNS 污染是「伪造虚假应答抢先返回」，两者都导致域名解析到错误地址。

【DNS 劫持】攻击者篡改路由器/运营商/本机 hosts 或 DNS 配置，把域名指向钓鱼站。表现：解析结果稳定错误。

【DNS 污染/投毒】攻击者抢在权威应答前，向递归 DNS 发送伪造响应（需命中事务 ID + 端口），让缓存中写入假结果。表现：污染是区域性的、可能偶发。

【防范】
1. 使用 DoH（DNS over HTTPS）/ DoT（DNS over TLS）加密查询；
2. 使用可信公共 DNS（如 1.1.1.1、8.8.8.8）；
3. 开启 DNSSEC 校验签名防篡改；
4. 重要域名通过 HTTPS 证书双向校验（即使被劫持也无法伪造证书）。

【面试追问】DNSSEC 原理？→ 用数字签名链从根到叶子逐级校验记录真实性，防篡改但不加密。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-063', category: 'network', tags: ['CDN', '缓存'], difficulty: 3,
      question: 'CDN 的原理是什么？如何做到就近访问与缓存？',
      answer: `一句话结论：CDN 把静态内容缓存到遍布全球的边缘节点，通过智能 DNS 或调度把用户请求引导到最近的节点，从而降低延迟、减轻源站压力。

【核心组件】
1. 边缘节点：缓存内容、就近响应；
2. 全局调度（GSLB）：智能 DNS 根据用户 IP、节点负载、链路质量选最优节点；
3. 源站：内容源头，回源拉取。

【工作流程】
用户请求域名 → 智能 DNS 返回最近节点 IP → 边缘节点命中缓存则直接返回 → 未命中则回源拉取并缓存 → 后续请求命中。

【关键技术】
1. 智能 DNS：基于 IP 库判断地理位置，返回最近 CNAME；
2. 缓存策略：遵循源站 Cache-Control/Expires，结合 CDN 刷新/预热；
3. 回源：仅缓存未命中时访问源站。

【面试追问】CDN 缓存如何刷新？→ 主动 purge 刷新缓存，或通过版本号/文件名变更（如 app.abc123.js）绕过缓存。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-064', category: 'network', tags: ['ARP', '安全'], difficulty: 3,
      question: 'ARP 协议是什么？ARP 欺骗（中间人）如何运作？',
      answer: `一句话结论：ARP 把 IP 地址解析为 MAC 地址，工作在同一局域网内；ARP 欺骗通过伪造「IP→MAC」映射，让流量被引导到攻击者主机实现中间人。

【ARP 原理】主机要发数据需目标 MAC，先广播 ARP 请求「谁的 IP 是 x.x.x.x」，目标机单播回复自己的 MAC，结果缓存在 ARP 表。

【ARP 欺骗】攻击者持续广播「网关 IP 对应我的 MAC」给受害者，让受害者把发往网关的流量发给攻击者，攻击者转发给真实网关，从而监听/篡改双向流量。

【危害】中间人抓包、会话劫持、断网（把 IP 映射到错误 MAC）。

【防范】
1. 交换机绑定静态 ARP 表；
2. 开启 DAI（动态 ARP 检测）；
3. 划分 VLAN 隔离；
4. 重要通信走 HTTPS/TLS 加密。

【面试追问】ARP 有缓存超时吗？→ 有，通常几分钟，超时后重新解析。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-065', category: 'network', tags: ['网络设备', '分层'], difficulty: 2,
      question: '交换机、路由器、网关分别是什么？工作在哪个层次？',
      answer: `一句话结论：交换机基于 MAC 地址在局域网内转发（数据链路层），路由器基于 IP 在网段间转发（网络层），网关是连接不同网络的「出口」设备/地址。

【交换机】
- 工作层次：数据链路层（L2）；
- 依据：MAC 地址表，学习源 MAC、转发目标 MAC；
- 作用：同一网段内多设备互联、隔离冲突域。

【路由器】
- 工作层次：网络层（L3）；
- 依据：路由表，根据目的 IP 选下一跳；
- 作用：连接不同网段，隔离广播域，实现跨网通信。

【网关】
- 是一个「出口」概念，通常是路由器/三层交换机的一个接口 IP；
- 主机访问其他网段时，把报文交给默认网关转发。

【面试追问】三层交换机与路由器区别？→ 三层交换机硬件转发快、接口多，适合局域网内跨 VLAN；路由器支持广域网接口与更多路由协议。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-066', category: 'network', tags: ['路由协议', 'BGP', 'OSPF'], difficulty: 4,
      question: '路由协议 OSPF 和 BGP 有什么区别？各自适用什么场景？',
      answer: `一句话结论：OSPF 是链路状态型的内部网关协议（IGP），用于自治系统内部；BGP 是路径向量型的外部网关协议（EGP），用于自治系统之间（互联网骨干）。

【OSPF】
- 类型：IGP、链路状态；
- 算法：SPF（Dijkstra）最短路径优先，收敛快；
- 依据：链路带宽/开销；
- 场景：企业网、数据中心内部路由。

【BGP】
- 类型：EGP、路径向量；
- 依据：AS 路径、策略、跳数等多属性选路；
- 特点：注重策略与稳定，收敛相对慢；
- 场景：运营商之间、跨 AS 互联。

【对比】OSPF 追求最优路径、快速收敛；BGP 追求可达性、可策略控制（如选哪条运营商线路）。

【面试追问】为何 BGP 收敛慢还能扛互联网？→ 互联网规模大，稳定性比秒级收敛更重要，且 BGP 有路由聚合与策略过滤。`,
      source: '大厂网络岗真题'
    },
    {
      id: 'net-067', category: 'network', tags: ['负载均衡', 'LVS', 'Nginx'], difficulty: 3,
      question: '四层负载均衡和七层负载均衡有什么区别？LVS 和 Nginx 有何不同？',
      answer: `一句话结论：四层基于 IP+端口转发（不看内容，性能高），七层基于 HTTP 内容（URL/Header）转发（灵活但开销大）；LVS 是四层，Nginx 常做七层。

【四层负载均衡（L4）】
- 依据：IP、端口；
- 代表：LVS、F5、云 SLB；
- 特点：内核态转发、吞吐高、无法按 URL/Header 路由。

【七层负载均衡（L7）】
- 依据：URL、Header、Cookie 等应用层信息；
- 代表：Nginx、HAProxy、Envoy；
- 特点：灵活（灰度、动静分离、会话保持），但需解析协议、性能相对低。

【LVS vs Nginx】
- LVS：工作在四层，DR/NAT/TUN 模式，转发快、适合大流量入口；
- Nginx：工作在七层，反向代理能力强，能做缓存、压缩、限流、健康检查。

【面试追问】实际架构如何选？→ 通常 LVS 或云 SLB 做最外层四层入口，Nginx 集群做七层分发。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-068', category: 'network', tags: ['代理', '架构'], difficulty: 2,
      question: '正向代理和反向代理有什么区别？',
      answer: `一句话结论：正向代理「替客户端访问服务端」（隐藏客户端），反向代理「替服务端接待客户端」（隐藏服务端）。

【正向代理】
- 代理对象：客户端；
- 作用：访问外网、翻墙、缓存、鉴权、隐藏客户端 IP；
- 客户端需显式配置代理地址；
- 例：公司上网代理、科学上网工具。

【反向代理】
- 代理对象：服务端；
- 作用：负载均衡、SSL 卸载、缓存、安全防护、隐藏后端拓扑；
- 客户端无感知，访问的是代理地址；
- 例：Nginx 前置、API 网关。

【对比】
- 位置：正向在客户端一侧，反向在服务端一侧；
- 目标：正向突破访问限制，反向提供服务治理。

【面试追问】透明代理是什么？→ 客户端无感知，网络设备在数据链路/网络层拦截流量转发。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-069', category: 'network', tags: ['Cookie', '安全'], difficulty: 3,
      question: 'Cookie 的 HttpOnly、Secure、SameSite 属性分别是什么？',
      answer: `一句话结论：HttpOnly 禁止 JS 读取（防 XSS 偷 Cookie），Secure 仅 HTTPS 传输（防明文窃听），SameSite 控制跨站请求是否携带（防 CSRF）。

【HttpOnly】设置后 document.cookie 无法读取该 Cookie，仅随请求发送，降低 XSS 窃取会话风险。

【Secure】仅通过 HTTPS 发送，防止 Cookie 在 HTTP 明文链路上被窃听。

【SameSite】
- Strict：完全禁止跨站携带，最安全；
- Lax：仅顶层 GET 导航（如点击链接）携带，平衡体验；
- None：跨站也携带，但必须配合 Secure。

【面试追问】会话 Cookie 与持久 Cookie？→ 未设 Expires/Max-Age 的为会话 Cookie，浏览器关闭即失效；设置后为持久 Cookie，存到本地磁盘。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-070', category: 'network', tags: ['Web安全', 'XSS'], difficulty: 3,
      question: 'XSS 攻击有哪些类型？如何防御？',
      answer: `一句话结论：XSS 是攻击者把恶意脚本注入页面，在受害者浏览器执行；分存储型、反射型、DOM 型三类，防御核心是「对输入转义 + 输出编码 + CSP」。

【类型】
1. 存储型：恶意脚本存入数据库（如评论），其他用户访问时执行，危害最大；
2. 反射型：脚本藏在 URL 参数，诱导点击后反射执行；
3. DOM 型：前端 JS 把不可信数据写入 innerHTML 等危险 API 导致执行。

【防御】
1. 输入校验与输出转义（HTML 转义特殊字符）；
2. 使用安全的 DOM API（textContent 替代 innerHTML）；
3. HttpOnly 保护 Cookie；
4. CSP 限制脚本来源；
5. 使用前端框架默认转义 + 避免 v-html/dangerouslySetInnerHTML。

【面试追问】如何绕过简单转义？→ 事件属性、编码绕过，因此必须分层防御而非单一转义。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-071', category: 'network', tags: ['Web安全', 'CSRF'], difficulty: 3,
      question: 'CSRF 攻击的原理是什么？如何防御？',
      answer: `一句话结论：CSRF 利用浏览器自动携带 Cookie 的机制，诱导已登录用户在不知情时向目标站点发起非本意请求；防御核心是「验证请求是否来自合法页面」。

【原理】用户登录 A 站持有 Cookie，攻击者诱导用户访问恶意页面，页面自动向 A 站发转账等请求，浏览器自动带上 A 站 Cookie，服务端误以为是用户本意操作。

【防御】
1. CSRF Token：服务端签发随机 token，请求必须携带并校验；
2. SameSite Cookie：Lax/Strict 阻止跨站携带；
3. 校验 Referer/Origin 头；
4. 双重 Cookie 验证；
5. 敏感操作二次验证（短信/密码）。

【面试追问】CSRF 和 XSS 区别？→ XSS 是「执行恶意脚本」需注入漏洞；CSRF 是「借用用户身份发请求」无需注入脚本。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-072', category: 'network', tags: ['跨域', 'CORS'], difficulty: 3,
      question: '什么是 CORS 预检请求（Preflight）？为什么需要？',
      answer: `一句话结论：预检请求是跨域「非简单请求」在真正请求前，先发一个 OPTIONS 探测服务端是否允许该跨域，通过后才发实际请求。

【触发条件（非简单请求）】
- 方法非 GET/HEAD/POST；
- 自定义头；
- Content-Type 非表单三种（如 application/json）。

【流程】
1. 浏览器发 OPTIONS 携带 Origin、Access-Control-Request-Method、Access-Control-Request-Headers；
2. 服务端返回 Access-Control-Allow-Origin/Methods/Headers；
3. 校验通过后浏览器才发实际请求。

【为什么需要】复杂请求可能对服务端产生副作用，先探测权限可避免「请求发出去了才发现被拒」。

【面试追问】如何减少预检？→ 使用简单请求、或配置 Access-Control-Max-Age 缓存预检结果。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-073', category: 'network', tags: ['OAuth2', '认证'], difficulty: 4,
      question: 'OAuth 2.0 的授权码模式流程是怎样的？',
      answer: `一句话结论：授权码模式通过「先拿授权码、再换令牌」的两步，让令牌不经过浏览器，是最安全、最常用的 OAuth2 授权方式。

【角色】资源所有者（用户）、客户端（第三方应用）、授权服务器、资源服务器。

【流程】
1. 客户端引导用户跳转授权服务器，附 client_id、redirect_uri、scope；
2. 用户登录并同意授权；
3. 授权服务器重定向回 redirect_uri，携带一次性授权码 code；
4. 客户端用 code + client_secret 向授权服务器换 access_token；
5. 客户端拿 token 访问资源。

【为什么安全】code 在浏览器出现但无法单独使用（需 client_secret 换 token），token 只在服务端之间传输。

【面试追问】为何不用密码模式/隐式模式？→ 密码模式需用户交出密码、隐式模式 token 暴露在 URL，安全性差。`,
      source: '大厂后端真题'
    },
    {
      id: 'net-074', category: 'network', tags: ['Web安全', 'CSP'], difficulty: 3,
      question: 'CSP（内容安全策略）是什么？如何防御 XSS？',
      answer: `一句话结论：CSP 通过 HTTP 头或 meta 标签声明「允许加载哪些来源的脚本/资源」，使浏览器拒绝执行未授权的脚本，从而大幅缓解 XSS。

【作用机制】
- 服务端返回 Content-Security-Policy 头；
- 浏览器解析策略，只加载白名单来源的资源；
- 未列出的脚本、内联事件被阻止。

【常见指令】
- default-src：默认来源；
- script-src：脚本来源；
- img-src/style-src/font-src：各类资源；
- connect-src：XHR/fetch 目标。

【示例】script-src 自己的域加 nonce，即使攻击者注入脚本，因无合法 nonce 也不会执行。

【面试追问】CSP 能完全防 XSS 吗？→ 不能，需与输出转义配合；且配置不当可能误伤正常功能。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-075', category: 'network', tags: ['Web安全', 'SQL注入'], difficulty: 3,
      question: '什么是 SQL 注入？如何防御？',
      answer: `一句话结论：SQL 注入是攻击者把恶意 SQL 拼进查询语句，改变原语义，从而窃取或篡改数据库；防御核心是「参数化查询 + 最小权限」。

【原理】如登录查询拼接用户输入，输入或 1=1 -- 可绕过条件，导致查询所有用户或删库。

【防御】
1. 使用预编译/参数化查询（PreparedStatement、ORM 参数绑定）；
2. 输入校验与白名单过滤；
3. 最小权限原则，数据库账号不授予多余权限；
4. 对敏感信息加密存储；
5. 部署 WAF。

【面试追问】ORM 就一定安全吗？→ 不是，使用原生拼接（如 order by 字段拼接）仍可能注入，需参数化。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-076', category: 'network', tags: ['Web安全', 'SSRF'], difficulty: 4,
      question: '什么是 SSRF（服务端请求伪造）？如何防御？',
      answer: `一句话结论：SSRF 是攻击者诱导服务端向任意内网地址发起请求，从而探测或攻击内网服务；防御核心是「严格校验目标地址 + 禁止访问内网」。

【原理】服务端存在「根据用户输入 URL 拉取内容」的功能（如远程图片加载、URL 预览），攻击者把 URL 改为内网地址（如 127.0.0.1、192.168.x.x、169.254.169.254 云元数据），让服务端代为访问内网。

【危害】探测内网端口、读取云元数据密钥、攻击内网无鉴权服务。

【防御】
1. 校验协议，只允许 http/https；
2. 校验目标 IP，拒绝私网/回环/链路本地地址；
3. 禁用 302 重定向到内网（或校验每一跳）；
4. 使用 DNS 解析后二次校验 IP；
5. 最小权限与网络隔离。

【面试追问】为何要防 DNS rebinding？→ 攻击者让域名第一次解析为公网、第二次解析为内网 IP，绕过一次校验。`,
      source: '大厂安全真题'
    },
    {
      id: 'net-077', category: 'network', tags: ['HTTP', '连接'], difficulty: 2,
      question: '长连接和短连接有什么区别？HTTP keep-alive 如何实现？',
      answer: `一句话结论：短连接每次请求都重新建立/关闭 TCP 连接，长连接复用同一条连接处理多次请求；HTTP keep-alive 通过 Connection: keep-alive 头让连接保持复用。

【短连接】HTTP/1.0 默认，每次请求握手、挥手，开销大（尤其 HTTPS 还要 TLS 握手）。

【长连接】HTTP/1.1 默认 keep-alive，同一条 TCP 连接可顺序处理多个请求，减少握手开销。

【keep-alive 实现】
- 响应头 Connection: keep-alive；
- 配合 Keep-Alive: timeout=N 控制空闲超时；
- 服务端或客户端可主动关闭。

【面试追问】长连接就一定更快吗？→ 顺序复用可能排队，HTTP/2 多路复用进一步解决并发复用问题。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-078', category: 'network', tags: ['RPC', '序列化'], difficulty: 3,
      question: 'RPC 和 HTTP 有什么区别？序列化协议（JSON/Protobuf/Thrift）如何选型？',
      answer: `一句话结论：RPC 是「像调本地方法一样调远程服务」的编程模型（HTTP 也可承载 RPC）；核心差异在协议设计、序列化效率与框架能力；Protobuf 适合高性能内部通信，JSON 适合跨语言/调试友好场景。

【RPC vs HTTP】
- RPC 关注方法/服务语义，有 IDL（接口定义）、自动生成桩代码、连接复用与负载均衡；
- HTTP 是无状态资源协议，通用但偏「资源」语义，如 REST。

【序列化选型】
- JSON：可读性好、跨语言广、易调试，但体积大、解析慢；
- Protobuf：二进制、体积小、性能高、有强 schema，但不可读、需编译；
- Thrift：类似 Protobuf，提供完整 RPC 框架。

【面试追问】为什么内部服务爱用 Protobuf？→ 二进制紧凑、编解码快、字段演进兼容，适合高频 RPC。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-079', category: 'network', tags: ['HTTP', '队头阻塞'], difficulty: 4,
      question: '什么是队头阻塞（HOL blocking）？在 HTTP/1.1 和 HTTP/2 中分别如何体现？',
      answer: `一句话结论：队头阻塞是「前面的请求/包阻塞了后面的处理」；HTTP/1.1 是应用层连接级阻塞，HTTP/2 虽多路复用但仍受 TCP 层丢包引起的传输层阻塞。

【HTTP/1.1 队头阻塞】同一 TCP 连接上请求必须顺序响应，前一个响应慢会阻塞后续所有响应（浏览器用多连接缓解）。

【HTTP/2 多路复用】引入二进制分帧 + stream，多个请求/响应可并发交错，理论上消除应用层队头阻塞。

【HTTP/2 残余问题】所有 stream 跑在同一条 TCP 连接上，若某 TCP 包丢失，整个连接需等待重传，所有 stream 都被阻塞 —— 这是 TCP 层队头阻塞。

【解决】HTTP/3 改用 QUIC（基于 UDP），每个 stream 独立传输，单 stream 丢包不影响其他 stream。

【面试追问】为什么 HTTP/2 无法根治？→ 因 TCP 的可靠有序传输本质，只能靠换传输层协议（QUIC）。`,
      source: '大厂网络真题'
    },
    {
      id: 'net-080', category: 'network', tags: ['TCP', 'TFO'], difficulty: 4,
      question: 'TCP Fast Open（TFO）是什么？如何加速连接？',
      answer: `一句话结论：TFO 允许在 TCP 三次握手的 SYN 包中携带数据，让「首次连接后的再次连接」省去一个 RTT，实现 0-RTT 发送数据。

【原理】
1. 首次连接：客户端请求 TFO Cookie，服务端返回加密 Cookie；
2. 再次连接：客户端在 SYN 中携带 Cookie 和数据；
3. 服务端校验 Cookie 通过，则在握手完成前就开始处理数据。

【加速点】常规 TCP 需三次握手后才能发数据（至少 1 个 RTT），TFO 让重连时数据随 SYN 一起发。

【限制】
- 需双方开启；
- Cookie 有过期时间；
- 存在重放攻击风险（需配合幂等或限流）。

【面试追问】TFO 和 HTTP/3 0-RTT 区别？→ TFO 优化 TCP 握手，QUIC 0-RTT 在 TLS 会话恢复基础上跳过握手。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-081', category: 'network', tags: ['HTTP3', 'QUIC', '0-RTT'], difficulty: 4,
      question: 'HTTP/3 的 0-RTT 是什么？有什么安全风险？',
      answer: `一句话结论：HTTP/3（QUIC）的 0-RTT 允许客户端在首次握手就携带早期数据，省去 1-RTT 握手延迟；风险在于早期数据可被重放。

【原理】基于 TLS 1.3 的会话恢复，客户端缓存会话票据（ticket），重连时用票据直接派生出密钥并附上数据，服务端用票据恢复会话即可解密。

【收益】首包即数据，尤其适合弱网/移动端。

【安全风险：重放攻击】
- 早期数据不具前向保密，且攻击者可截获 0-RTT 包重放；
- 若请求是非幂等的（如扣款），重放会造成重复执行。

【防御】
1. 仅对幂等 GET 请求使用 0-RTT；
2. 服务端对 0-RTT 请求限制敏感操作；
3. 配合应用层防重放（token、时间戳）。

【面试追问】为什么 QUIC 能 0-RTT？→ 因为它把传输握手与 TLS 握手合并，且支持会话恢复密钥复用。`,
      source: '大厂网络真题'
    },
    {
      id: 'net-082', category: 'network', tags: ['移动端', '弱网', '优化'], difficulty: 3,
      question: '移动端弱网环境如何优化网络请求？',
      answer: `一句话结论：弱网优化围绕「减少请求次数、减小传输体积、容忍延迟与失败、提升重试体验」展开。

【策略】
1. 减少请求：接口聚合、资源合并、图片懒加载/压缩/WebP；
2. 减小体积：gzip/brotli 压缩、Protobuf 替代 JSON、缓存静态资源；
3. 连接优化：HTTP/2 多路复用、连接复用与预连接、QUIC 抗弱网；
4. 超时与重试：合理超时、指数退避重试、请求去重/幂等；
5. 降级：弱网下加载低清图、离线缓存（Service Worker）；
6. 用户感知：骨架屏、进度反馈、失败可重试提示。

【面试追问】如何判断弱网？→ 监听网络状态（online/offline）、测量 RTT 与带宽，动态切换策略。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-083', category: 'network', tags: ['HTTP', 'Header'], difficulty: 2,
      question: 'HTTP 常见的请求头和响应头有哪些？Connection 和 Content-Encoding 是什么？',
      answer: `一句话结论：请求头描述「我要什么、我是谁、附什么条件」，响应头描述「返回什么、缓存策略、连接策略」；Connection 控制连接是否复用，Content-Encoding 声明内容压缩算法。

【常见请求头】
- Host：目标主机；
- User-Agent：客户端标识；
- Accept/Accept-Encoding：期望类型与压缩；
- Authorization：认证信息；
- Cookie：携带状态；
- Cache-Control：缓存要求。

【常见响应头】
- Content-Type/Content-Length：类型与长度；
- Content-Encoding：gzip/br 等压缩；
- Set-Cookie：下发 Cookie；
- Cache-Control/ETag：缓存；
- Location：重定向地址。

【Connection】keep-alive 表示复用连接，close 表示用完关闭。

【Content-Encoding】服务端对响应体压缩（gzip、br），浏览器据此解压。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-084', category: 'network', tags: ['网关', '微服务'], difficulty: 3,
      question: '什么是 API 网关？它解决什么问题？',
      answer: `一句话结论：API 网关是微服务架构的统一入口，负责路由、鉴权、限流、熔断、日志、协议转换等横切能力，避免这些逻辑在每个服务重复实现。

【核心能力】
1. 路由转发：按路径/头分发到后端服务；
2. 鉴权认证：统一校验 token；
3. 限流、熔断、降级；
4. 负载均衡；
5. 协议转换（HTTP↔RPC）；
6. 日志、监控、链路追踪；
7. 请求聚合与响应裁剪。

【好处】客户端只需对接一个入口；横切关注点集中管理。

【代价】单点、增加一跳延迟、成为性能与故障瓶颈，需高可用。

【面试追问】常见网关？→ Kong、Zuul、Spring Cloud Gateway、Nginx、云 API 网关。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-085', category: 'network', tags: ['ServiceMesh', '微服务'], difficulty: 4,
      question: '什么是 Service Mesh？数据面和控制面分别是什么？',
      answer: `一句话结论：Service Mesh 把服务间通信（负载均衡、重试、熔断、观测）从业务代码下沉到独立的代理层（sidecar），实现通信治理与业务解耦；数据面负责转发流量，控制面负责下发策略。

【数据面】
- 由每个服务旁的 sidecar 代理（如 Envoy）组成；
- 负责实际的请求转发、负载均衡、熔断、重试、加密（mTLS）、遥测采集。

【控制面】
- 如 Istio 的 Pilot；
- 负责服务发现、配置下发、证书管理、策略编排；
- 通过 xDS 协议把配置推送给数据面。

【价值】业务无需引入 SDK 即可获得统一通信治理，多语言友好、升级无侵入。

【代价】引入复杂度与延迟，运维门槛高。

【面试追问】sidecar 是什么？→ 与业务容器同 Pod 部署的代理容器，拦截进出流量。`,
      source: '大厂架构真题'
    },
    {
      id: 'net-086', category: 'network', tags: ['抓包', '排查'], difficulty: 3,
      question: '网络抓包工具 tcpdump 和 Wireshark 如何使用？如何排查丢包？',
      answer: `一句话结论：tcpdump 是命令行抓包（服务器常用），Wireshark 是图形化分析（人工深入分析）；丢包排查遵循「抓包看现象 + 分段定位」思路。

【tcpdump 常用】
- tcpdump -i eth0 host 1.2.3.4 and port 80：抓指定主机端口；
- -w 写文件、-r 读文件、-nn 不解析域名端口；
- 抓三次握手/重传判断连接问题。

【Wireshark】加载 pcap 文件，按流追踪、过滤（tcp.analysis.retransmission）、统计重传与 RTT。

【丢包排查思路】
1. 抓包观察是否有大量重传（tcp.analysis.retransmission）；
2. 分段 ping/traceroute 定位丢包网段；
3. 检查网卡错误（ifconfig 的 errors/dropped）、交换机端口；
4. 检查服务端 backlog、内核缓冲区、CPU 是否打满导致丢弃；
5. 检查防火墙/限流策略。

【面试追问】如何区分是网络丢包还是应用处理慢？→ 抓包看重传与 ACK 延迟，结合服务端日志与耗时埋点。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-087', category: 'network', tags: ['排查', '工具'], difficulty: 3,
      question: 'netstat、ss、lsof 如何排查网络连接问题？',
      answer: `一句话结论：三者都能查看网络连接与端口占用，ss 性能更好、netstat 兼容更广、lsof 偏「哪个进程打开了什么」；排查连接问题关键是看懂状态与归属进程。

【netstat】
- netstat -antp：所有 TCP 连接（-a 全部、-n 数字、-t tcp、-p 进程）；
- 观察 ESTABLISHED、TIME_WAIT、CLOSE_WAIT、SYN_RECV 数量。

【ss】
- ss -antp：比 netstat 更快；
- ss -s 汇总统计；
- 用于高并发下快速查看连接状态。

【lsof】
- lsof -i:80：查看占用 80 端口的进程；
- lsof -p PID：某进程打开的文件与连接。

【排查要点】
- CLOSE_WAIT 多 → 应用未正确关闭连接（代码 bug）；
- TIME_WAIT 多 → 短连接过多或参数需调优；
- SYN_RECV 多 → 可能被 SYN 泛洪或 backlog 过小。

【面试追问】CLOSE_WAIT 堆积如何定位？→ 找持有连接的进程，检查是否忘了 close 或读返回 0 后未关闭。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-088', category: 'network', tags: ['防火墙', 'iptables'], difficulty: 3,
      question: '什么是防火墙和 iptables？如何配置规则？',
      answer: `一句话结论：防火墙根据规则放行或丢弃进出流量，iptables 是 Linux 内核 Netfilter 的用户态工具，通过表（table）和链（chain）组织规则。

【iptables 结构】
- 表：filter（过滤）、nat（地址转换）、mangle（修改报文）；
- 链：INPUT（入站）、OUTPUT（出站）、FORWARD（转发）、PREROUTING、POSTROUTING。

【常见命令】
- iptables -A INPUT -p tcp --dport 22 -j ACCEPT：放行 22 端口；
- iptables -A INPUT -s 1.2.3.4 -j DROP：拒绝某 IP；
- iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080：端口转发；
- 规则按顺序匹配，-j 为动作（ACCEPT/DROP/REJECT）。

【面试追问】iptables 与 firewalld 关系？→ firewalld 是更上层的动态防火墙管理工具，底层仍调用 iptables/nftables。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-089', category: 'network', tags: ['HTTPS', '证书链'], difficulty: 4,
      question: 'HTTPS 证书链是如何验证的？OCSP 和证书吊销是什么？',
      answer: `一句话结论：证书链验证是从「服务器证书」逐级向上追溯到「受信任的根 CA」；OCSP 用于在线查询证书是否被吊销，解决已签发证书失效后的信任问题。

【证书链结构】根 CA（预置信任）→ 中间 CA → 服务器证书。

【验证流程】
1. 浏览器拿到服务器证书及中间证书；
2. 用中间 CA 公钥验证服务器证书签名；
3. 用根 CA 公钥验证中间证书；
4. 根证书已在系统/浏览器信任库中。

【吊销机制】
- CRL（证书吊销列表）：定期下载的吊销名单，有延迟；
- OCSP：实时在线查询单张证书状态；
- OCSP Stapling：服务器提前获取 OCSP 响应并在握手中附带，减轻客户端查询负担。

【面试追问】为何要吊销？→ 私钥泄露、证书错误签发等场景需让证书提前失效。`,
      source: '大厂安全真题'
    },
    {
      id: 'net-090', category: 'network', tags: ['TLS', 'SNI'], difficulty: 3,
      question: '什么是 SNI（服务器名称指示）？它解决什么问题？',
      answer: `一句话结论：SNI 让客户端在 TLS 握手的 ClientHello 中带上目标域名，使同一 IP 上的多个 HTTPS 站点能返回各自正确的证书。

【背景】一个 IP 可能托管多个域名（虚拟主机）。TLS 握手时服务端需知道访问哪个域名才能选对应证书，但握手早于 HTTP 层，看不到 Host 头。

【原理】客户端在 ClientHello 中扩展字段写入域名，服务端据此选择证书，再继续握手。

【解决的问题】
- 同一 IP 部署多个 HTTPS 域名；
- CDN、云平台多租户证书隔离。

【面试追问】TLS 1.3 中 SNI 加密了吗？→ 默认明文，可用 ESNI/ECH（加密 SNI）保护访问隐私。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-091', category: 'network', tags: ['Anycast', '路由'], difficulty: 4,
      question: '什么是 Anycast（任播）？DNS 根服务器如何用它？',
      answer: `一句话结论：Anycast 让多个地理分布的节点广播同一个 IP，路由器按最短路径把流量导向最近节点，实现天然就近与高可用；DNS 根服务器正是靠它全球部署。

【原理】
- 多个节点使用同一 IP，通过 BGP 向不同地区宣告该 IP 路由；
- 用户访问该 IP 时，路由器选择路由最短的节点；
- 单节点故障时路由收敛自动切换。

【优势】就近低延迟、负载分散、抗 DDoS（攻击被分摊到各节点）、无单点。

【DNS 应用】13 个根服务器 IP 实际对应全球上千个任播节点。

【面试追问】Anycast 的局限？→ 面向连接的 TCP 长连接可能因路由变化中断，故更多用于无状态 UDP 或短连接场景。`,
      source: '大厂网络真题'
    },
    {
      id: 'net-092', category: 'network', tags: ['QoS', '流量控制'], difficulty: 4,
      question: '什么是 QoS（服务质量）？流量整形如何实现？',
      answer: `一句话结论：QoS 是在带宽有限时对流量分级管理、保障关键业务的服务质量；流量整形通过队列与速率控制「削峰填谷」，让突发流量平滑输出。

【QoS 手段】
1. 分类与标记：识别业务类型（如语音、视频、普通数据）；
2. 队列调度：优先级队列（PQ）、加权公平队列（WFQ）；
3. 限速：令牌桶/漏桶；
4. 拥塞管理：WRED 随机丢弃。

【流量整形（Traffic Shaping）】
- 用令牌桶算法：以恒定速率补充令牌，发送需消耗令牌，超出速率则缓存排队；
- 特点：平滑突发，不丢包（缓冲区足够时）。

【对比】流量整形（Shaping）缓冲平滑、流量监管（Policing）超限直接丢弃。

【面试追问】令牌桶和漏桶区别？→ 漏桶固定输出速率，令牌桶允许一定突发（桶内有积累令牌）。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-093', category: 'network', tags: ['VXLAN', '隧道'], difficulty: 4,
      question: '什么是 VXLAN 和隧道技术？如何实现大二层？',
      answer: `一句话结论：VXLAN 把二层以太网帧封装在 UDP 报文中，跨越三层网络传输，实现「大二层」——让不同物理机房的主机处于同一逻辑二层网络。

【背景】传统 VLAN 只有 4096 个，且受限于物理二层；云数据中心需要大规模、跨机房的二层互通。

【VXLAN 原理】
- 在原始以太网帧外封装 VXLAN 头 + UDP + IP + 外层 MAC；
- VNI（24 位，约 1600 万）标识逻辑网络，远超 VLAN；
- VTEP（隧道端点）负责封装/解封装。

【隧道技术】泛指把一种协议封装在另一种协议中传输，如 GRE、VXLAN、IPsec。

【价值】支持虚机迁移保持 IP、多租户隔离、跨三层组网。

【面试追问】VXLAN 用 UDP 为什么？→ 便于硬件卸载、穿透负载均衡，且无需 TCP 连接维护。`,
      source: '大厂网络真题'
    },
    {
      id: 'net-094', category: 'network', tags: ['接口风格', 'REST', 'RPC'], difficulty: 3,
      question: 'REST、RPC、GraphQL 三种接口风格有什么区别？',
      answer: `一句话结论：REST 以「资源 + HTTP 动词」为中心，RPC 以「方法调用」为中心，GraphQL 以「客户端声明所需数据」为中心。

【REST】
- 面向资源，用 URL 标识资源、HTTP 方法操作；
- 无状态、可缓存、通用性强；
- 缺点：可能过度/不足获取（over/under-fetching）。

【RPC】
- 面向动作，像调本地方法；
- 高性能、强类型、有 IDL 与代码生成；
- 缺点：耦合紧、跨语言与调试不如 HTTP 友好。

【GraphQL】
- 客户端用查询语言精确声明需要的字段；
- 一次请求获取多资源、避免多取/少取；
- 缺点：缓存复杂、服务端复杂度与滥用风险。

【面试追问】如何选型？→ 对外开放平台用 REST，内部高性能服务用 RPC，前端多变且需聚合用 GraphQL。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-095', category: 'network', tags: ['GraphQL', '接口'], difficulty: 3,
      question: 'GraphQL 相比 REST 有什么优缺点？',
      answer: `一句话结论：GraphQL 让客户端按需精确取数、一次请求聚合多资源，解决 REST 的 over-fetching/under-fetching；代价是缓存复杂、服务端实现与滥用风险高。

【优点】
1. 按需取字段，减少冗余数据；
2. 单请求聚合多个资源，减少请求数；
3. 强类型 Schema，前后端契约清晰、可自省；
4. 演进友好，客户端自由组合。

【缺点】
1. 无法简单用 HTTP 缓存，需应用层缓存方案；
2. 服务端需解析复杂查询，性能与深嵌套 N+1 风险；
3. 复杂查询可能被滥用（深度、复杂度攻击）；
4. 学习与工具链成本。

【面试追问】如何防深度查询攻击？→ 限制查询深度、复杂度打分、超时控制、白名单。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-096', category: 'network', tags: ['幂等', '重试'], difficulty: 3,
      question: '网络请求如何实现幂等？重试会带来什么问题？',
      answer: `一句话结论：幂等指同一请求执行一次与多次效果相同；通过幂等键、唯一约束、状态机等方式保证；盲目重试可能导致重复扣款、重复下单等副作用。

【实现幂等】
1. 幂等键（Idempotency-Key）：客户端生成唯一 ID，服务端去重；
2. 数据库唯一约束：如订单号唯一；
3. 乐观锁/版本号：重复提交时版本不匹配被拒；
4. 状态机：已处理状态直接返回原结果；
5. 天然幂等方法：GET/PUT/DELETE 语义上幂等。

【重试问题】
- 非幂等 POST 重试导致重复写入；
- 超时重试而服务端实际已成功（需配合幂等键）；
- 重试风暴放大故障。

【面试追问】超时后重试，服务端怎么知道是同一请求？→ 靠幂等键在服务端去重。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-097', category: 'network', tags: ['MQTT', '物联网'], difficulty: 3,
      question: '什么是 MQTT？为什么物联网常用它？',
      answer: `一句话结论：MQTT 是轻量的发布/订阅消息协议，基于 TCP、报文极小、支持弱网与低功耗，是物联网设备的首选通信协议。

【特点】
1. 轻量：头部最小仅 2 字节，适合带宽受限；
2. 发布/订阅：解耦设备与业务；
3. QoS 三级（0 至多一次、1 至少一次、2 恰好一次）；
4. 遗嘱消息与保活心跳，适合不稳定连接；
5. 支持 TLS 加密。

【为什么适合物联网】
- 设备资源受限（内存/电量/带宽）；
- 网络不稳定，需断线重连与离线消息；
- 海量设备需高效 broker 支撑。

【面试追问】MQTT 和 HTTP 在物联网的区别？→ MQTT 更省电省流量、支持双向推送与多级 QoS，HTTP 偏请求/响应且开销大。`,
      source: '大厂物联网真题'
    },
    {
      id: 'net-098', category: 'network', tags: ['文件传输', '优化'], difficulty: 3,
      question: '大文件上传/下载如何优化？（分片、断点续传）',
      answer: `一句话结论：大文件传输通过「分片 + 断点续传 + 秒传 + 并发」优化，把大文件拆成小块分别传输、失败只重传缺失分片。

【分片上传】
1. 客户端把文件切成固定大小分片；
2. 每片独立上传，可并发；
3. 全部完成后请求合并/校验。

【断点续传】
- 记录已传分片，失败后从断点继续，不重传已成功部分；
- 下载用 HTTP Range 头实现。

【秒传】上传前先算文件指纹（如 MD5/SHA），服务端已有则直接返回成功。

【优化点】并发分片、校验完整性、进度回调、服务端分片合并与存储（对象存储分片接口）。

【面试追问】下载断点续传如何实现？→ 客户端发 Range: bytes=start- 请求指定字节范围。`,
      source: '牛客面经高频'
    },
    {
      id: 'net-099', category: 'network', tags: ['HTTP', '断点续传'], difficulty: 3,
      question: 'HTTP 的断点续传是如何实现的？Range 请求如何工作？',
      answer: `一句话结论：HTTP 断点续传通过 Range 请求头请求指定字节区间，服务端返回 206 Partial Content 与 Content-Range，客户端据此下载/恢复部分内容。

【流程】
1. 客户端发送 Range: bytes=0-1023；
2. 服务端支持则返回 206，响应头 Content-Range: bytes 0-1023/总数；
3. 客户端记录已下载区间，断线后从下一字节继续；
4. 服务端不支持则返回 200 全量。

【关键头】
- Range：请求的字节范围，可多段（bytes=0-1023,2048-4095）；
- Accept-Ranges: bytes 表明服务端支持；
- Content-Range：本次返回的范围与总长；
- If-Range：配合 ETag/Last-Modified 判断文件是否变化。

【面试追问】若文件已变还能续传吗？→ 通过 If-Range 校验，变化则返回全量，避免拼接错误数据。`,
      source: '面试鸭高频'
    },
    {
      id: 'net-100', category: 'network', tags: ['性能', 'RTT', '综合'], difficulty: 3,
      question: '网络延迟（RTT）如何影响 HTTP 性能？如何减少往返次数？',
      answer: `一句话结论：RTT 决定每次握手/请求的往返耗时，在 RTT 大的场景（如跨国、移动弱网）握手与往返次数直接决定加载速度；优化核心是「减少 RTT 次数 + 复用连接」。

【RTT 影响点】
- TCP 三次握手 1 RTT，TLS 握手 1-2 RTT；
- HTTP/1.1 每个资源串行往返；
- 冷启动 DNS 查询也是额外往返。

【减少 RTT 次数】
1. 长连接复用（keep-alive）减少握手；
2. HTTP/2 多路复用并发请求；
3. TLS 1.3 减少握手 RTT（1-RTT，会话恢复 0-RTT）；
4. TCP Fast Open / QUIC 0-RTT；
5. CDN 就近部署降低物理 RTT；
6. 预连接（preconnect）、DNS 预解析（dns-prefetch）。

【面试追问】为什么移动网络 RTT 大？→ 无线链路调度、基站切换、信令开销等导致往返延迟高于有线。`,
      source: '牛客面经高频'
    }
  ];

  global.App = global.App || {};
  global.App.net2Bank = NET2;
})(window);
