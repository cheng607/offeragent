/**
 * OfferAgent · 扩充题库（算法 · 第三批：高频真题 / 经典题型进阶）
 * 挂载到 global.App.al3Bank，由 bank.js 加载时合并。
 */
(function (global) {
  'use strict';

  var AL3 = [
    {
      id: 'al-101', category: 'algorithm', tags: ['滑动窗口', '字符串'], difficulty: 2,
      question: '如何求「无重复字符的最长子串」的长度？（滑动窗口经典）',
      answer: `一句话结论：用双指针维护一个无重复字符的窗口，右指针扩展，遇到重复就移动左指针收缩，同时记录窗口最大长度。

【思路】
1. 左指针 left、右指针 right 表示当前窗口 [left, right]；
2. 用 Set 或 Map 记录窗口内字符；
3. right 右移，若字符不在窗口则加入，更新最大长度；
4. 若重复，则 left 右移并删除字符，直到无重复；
5. 遍历结束返回 maxLen。

【代码骨架】
function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) { set.delete(s[left]); left++; }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}

【复杂度】时间 O(n)（每个字符最多进出 set 各一次），空间 O(min(n, 字符集大小))。

【优化】用 Map 存「字符 → 下标」，重复时 left 直接跳到重复字符后一位，省去循环收缩。

【追问】为什么能用滑动窗口？→ 因为「窗口越大越可能重复」，具有单调性，可用双指针维护连续区间。

【避坑】别忘了在收缩后更新答案；用 while 而非 if 收缩，因为可能连续多个重复。`,
      source: 'LeetCode 3'
    },
    {
      id: 'al-102', category: 'algorithm', tags: ['字符串', '回文', '双指针'], difficulty: 2,
      question: '如何求「最长回文子串」？（中心扩展法）',
      answer: `一句话结论：回文串关于中心对称，枚举每个「中心」向两边扩展，取最长；中心有单字符和双字符两种情况。

【中心扩展法】
1. 遍历每个位置 i，分别以 i（奇数长度）和 i,i+1（偶数长度）为中心；
2. 向左右扩展，直到字符不相等或越界；
3. 记录当前最长回文的起止位置。

【代码骨架】
function longestPalindrome(s) {
  let start = 0, maxLen = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
  }
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return s.slice(start, start + maxLen);
}

【复杂度】时间 O(n^2)，空间 O(1)。

【进阶】Manacher（马拉车）算法可做到 O(n)，通过记录每个位置的回文半径，利用对称性跳过重复计算，面试能提即加分。

【追问】如何用动态规划解？→ dp[i][j] 表示 s[i..j] 是否回文，dp[i][j] = s[i]===s[j] && dp[i+1][j-1]，但空间 O(n^2)。

【避坑】扩展时注意边界；偶数长度的中心是两个字符之间，别漏了。`,
      source: 'LeetCode 5'
    },
    {
      id: 'al-103', category: 'algorithm', tags: ['链表', '堆', '分治'], difficulty: 3,
      question: '如何合并 K 个升序链表？有哪几种做法？',
      answer: `一句话结论：常见三种做法——逐个合并、分治两两合并、用最小堆（优先队列）每次取最小值。

【做法一：优先队列（最小堆）】
1. 把所有链表的头节点放入最小堆（按节点值）；
2. 每次弹出最小值节点接到结果链表，再把它的 next 入堆；
3. 直到堆空。时间 O(N log k)，空间 O(k)。

【做法二：分治两两合并】
1. 类似归并排序，把 k 个链表两两合并，合并后数量减半；
2. 递归直到只剩一个。时间 O(N log k)，空间 O(log k)（递归栈）。

【做法三：逐个合并】
1. 拿第一个链表依次和后面每个合并；
2. 时间 O(k*N)，最差，不推荐。

【代码骨架（堆）】
用伪代码：维护 minHeap，初始入各链表头，循环 pop 最小节点，若 next 非空则 push next。

【追问】为什么堆的复杂度是 O(N log k)？→ 共 N 个节点，每个节点进出堆一次，堆操作 log k。

【避坑】JS 无内置优先队列，需手写最小堆（用数组实现二叉堆，注意上浮/下沉）。`,
      source: 'LeetCode 23'
    },
    {
      id: 'al-104', category: 'algorithm', tags: ['动态规划', '股票'], difficulty: 3,
      question: '「买卖股票的最佳时机」系列题怎么解？（含冷冻期、手续费、多次交易）',
      answer: `一句话结论：用状态机 DP，核心是定义「持有/不持有」两个状态，每天根据能否交易转移，系列题都在此框架上加限制。

【通用状态定义】
· dp[i][0]：第 i 天结束时不持有股票的最大收益；
· dp[i][1]：第 i 天结束时持有股票的最大收益。

【基础转移】
dp[i][0] = max(dp[i-1][0], dp[i-1][1] + price[i])  // 不动 或 卖出
dp[i][1] = max(dp[i-1][1], dp[i-1][0] - price[i])  // 不动 或 买入

【系列变体】
1. 只能一次交易：只需记录历史最低价，ans = max(price - minPrice)；
2. 多次交易：上面的通用转移，可无限次；
3. 含冷冻期：买入只能来自「前天」不持有，dp[i][1] = max(dp[i-1][1], dp[i-2][0] - price[i])；
4. 含手续费：卖出时扣 fee，dp[i][0] = max(dp[i-1][0], dp[i-1][1] + price[i] - fee)；
5. 最多 k 次：加一维「已交易次数」，状态变成三维。

【追问】为什么要区分「持有/不持有」而非「买/卖」动作？→ 因为状态只关心当前是否持有股票，这样每天两种状态即可覆盖所有决策。

【避坑】冷冻期题里，买入要参考 i-2 的状态，因为卖出后次日不能买。`,
      source: 'LeetCode 121/122/309/714'
    },
    {
      id: 'al-105', category: 'algorithm', tags: ['动态规划', '二分', 'LIS'], difficulty: 3,
      question: '如何求「最长递增子序列（LIS）」？如何优化到 O(n log n)？',
      answer: `一句话结论：基础做法是 O(n^2) 的 DP；贪心 + 二分用「维护一个递增数组 tails」可优化到 O(n log n)。

【O(n^2) DP】
dp[i] 表示以 nums[i] 结尾的最长递增子序列长度；
dp[i] = max(dp[j] + 1)，其中 j < i 且 nums[j] < nums[i]。

【O(n log n) 贪心 + 二分】
1. 维护 tails 数组，tails[k] 表示长度为 k+1 的递增子序列的最小结尾元素；
2. 遍历 nums：若 x 大于 tails 末尾，追加；否则二分找到第一个 >= x 的位置替换；
3. tails 的长度即 LIS 长度。

【代码骨架】
const tails = [];
for (const x of nums) {
  let l = 0, r = tails.length;
  while (l < r) {
    const m = (l + r) >> 1;
    if (tails[m] < x) l = m + 1; else r = m;
  }
  tails[l] = x;
}
return tails.length;

【关键理解】tails 并非真实的子序列，替换是为了让后续元素更容易接上（贪心：结尾越小越有利）。

【追问】如何还原具体序列？→ 需要额外记录每个元素的前驱索引，或用 patience sorting 记录「牌堆」位置。

【避坑】二分边界要「第一个 >= x」，保证严格递增；若允许非严格递增则找第一个 > x。`,
      source: 'LeetCode 300'
    },
    {
      id: 'al-106', category: 'algorithm', tags: ['动态规划', '字符串'], difficulty: 3,
      question: '如何求两个字符串的「编辑距离」（最少操作次数）？',
      answer: `一句话结论：用二维 DP，dp[i][j] 表示 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数，支持插入、删除、替换。

【状态与转移】
dp[i][j] = min(
  dp[i-1][j] + 1,      // 删除 word1[i-1]
  dp[i][j-1] + 1,      // 插入 word2[j-1]
  dp[i-1][j-1] + (word1[i-1] === word2[j-1] ? 0 : 1)  // 替换或相等不动
)

【初始化】
dp[i][0] = i（全删除），dp[0][j] = j（全插入）。

【代码骨架】
const m = w1.length, n = w2.length;
const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
for (let i = 0; i <= m; i++) dp[i][0] = i;
for (let j = 0; j <= n; j++) dp[0][j] = j;
for (let i = 1; i <= m; i++)
  for (let j = 1; j <= n; j++)
    dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1,
      dp[i-1][j-1] + (w1[i-1]===w2[j-1]?0:1));
return dp[m][n];

【复杂度】时间与空间均为 O(m*n)，可用滚动数组把空间降到 O(n)。

【应用】拼写纠错、DNA 比对、相似度计算（如 Elasticsearch 的 fuzzy 查询）。

【避坑】下标偏移：字符串从 0 开始，DP 用 1 开始，注意 w1[i-1] 的对应。`,
      source: 'LeetCode 72'
    },
    {
      id: 'al-107', category: 'algorithm', tags: ['动态规划', '矩阵'], difficulty: 2,
      question: '如何求「最小路径和」（从矩阵左上到右下）？如何做空间优化？',
      answer: `一句话结论：用二维 DP，dp[i][j] = grid[i][j] + min(左边, 上边)，表示到达 (i,j) 的最小路径和。

【状态转移】
dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
第一行/第一列只能单向累加。

【空间优化】
1. 每一行只依赖上一行，可用一维数组滚动；
2. 甚至原地修改 grid 做 DP，空间 O(1)。

【代码骨架（原地）】
for (let i = 0; i < m; i++)
  for (let j = 0; j < n; j++) {
    if (i === 0 && j === 0) continue;
    const top = i > 0 ? grid[i-1][j] : Infinity;
    const left = j > 0 ? grid[i][j-1] : Infinity;
    grid[i][j] += Math.min(top, left);
  }
return grid[m-1][n-1];

【追问】能否走对角线？→ 若允许斜着走，转移里再加 dp[i-1][j-1]；带障碍物则在障碍处置 Infinity。

【避坑】第一行第一列的边界要单独处理，避免访问 dp[-1] 越界。`,
      source: 'LeetCode 64'
    },
    {
      id: 'al-108', category: 'algorithm', tags: ['双指针', '贪心'], difficulty: 2,
      question: '「盛最多水的容器」如何用双指针求解？为什么正确？',
      answer: `一句话结论：左右双指针，每次移动「较矮」的一侧，记录过程中的最大面积，O(n) 求解。

【思路】
1. 面积 = 宽度(右-左) × 高度(min(左高, 右高))；
2. 左右指针从两端开始，计算面积更新最大值；
3. 移动较矮的指针（因为面积受限于矮边，移动高边只会让宽度减小、高度不变或更小，不可能更大）。

【代码骨架】
let l = 0, r = height.length - 1, max = 0;
while (l < r) {
  max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
  if (height[l] < height[r]) l++; else r--;
}
return max;

【正确性证明（贪心）】
移动高的一侧，宽度变窄，而高度受矮边限制不会变高，所以面积必然不增；因此最优解只会出现在「移动矮边」的过程中，不会漏掉。

【复杂度】时间 O(n)，空间 O(1)。

【避坑】别用两层循环暴力（O(n^2) 会超时）；移动条件是比较 height[l] 和 height[r]，不是比较面积。`,
      source: 'LeetCode 11'
    },
    {
      id: 'al-109', category: 'algorithm', tags: ['双指针', '单调栈'], difficulty: 3,
      question: '「接雨水」如何求解？（双指针 / 单调栈两种思路）',
      answer: `一句话结论：每个位置能接的雨水量 = min(左边最高, 右边最高) - 当前高度；可用双指针或单调栈 O(n) 求解。

【思路一：双指针】
1. 维护 leftMax 和 rightMax，分别记录左右两侧已扫描到的最大高度；
2. 左右指针相向移动，哪边矮就先结算哪边：
   若 leftMax < rightMax，则 left 位置能接 leftMax - height[left]，left 右移；
   否则结算 right 位置；
3. 累加得到总水量。

【思路二：单调栈】
1. 维护一个「单调递减」的栈，存下标；
2. 遇到比栈顶高的柱子，说明形成凹槽，弹出栈顶，用「两侧最小值 - 弹出高度」× 宽度计算该层水量；
3. 逐层累加。

【代码骨架（双指针）】
let l = 0, r = n-1, leftMax = 0, rightMax = 0, ans = 0;
while (l < r) {
  if (height[l] < height[r]) {
    leftMax = Math.max(leftMax, height[l]);
    ans += leftMax - height[l]; l++;
  } else {
    rightMax = Math.max(rightMax, height[r]);
    ans += rightMax - height[r]; r--;
  }
}

【追问】为什么双指针「哪边矮结算哪边」是对的？→ 因为矮的一侧其「对面最高」一定 >= 当前 rightMax，所以该位置的储水量由本侧确定。

【避坑】注意 leftMax/rightMax 要「先更新再结算」，否则会减出负数。`,
      source: 'LeetCode 42'
    },
    {
      id: 'al-110', category: 'algorithm', tags: ['二叉树', '递归', 'LCA'], difficulty: 3,
      question: '如何求二叉树两个节点的「最近公共祖先（LCA）」？',
      answer: `一句话结论：自底向上递归，若当前节点等于 p 或 q 则返回该节点，否则看左右子树是否分别命中，两边都命中则当前节点就是 LCA。

【递归思路】
1. 递归函数返回「当前子树中包含 p 或 q 的结果节点」；
2. 终止：root 为 null 或等于 p/q 时返回 root；
3. 分别递归左右子树得到 left、right；
4. 若 left 和 right 都非空，说明 p、q 分居两侧，root 即 LCA；
5. 若只有一侧非空，返回该侧结果（p、q 都在同一侧）。

【代码骨架】
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}

【复杂度】时间 O(n)，空间 O(h)（递归栈）。

【变体】二叉搜索树的 LCA：利用有序性，若 p、q 都在一侧就往该侧走，分叉点即 LCA，O(h)。

【避坑】注意 p、q 本身可能是祖先关系，此时终止条件 root===p 直接返回即可正确处理。`,
      source: 'LeetCode 236'
    },
    {
      id: 'al-111', category: 'algorithm', tags: ['二叉树', '序列化'], difficulty: 3,
      question: '如何实现二叉树的「序列化与反序列化」？',
      answer: `一句话结论：序列化用「先序遍历 + 空节点标记」把树转成字符串，反序列化按同样顺序用队列/索引重建，空节点用特殊符（如 #）。

【序列化（先序）】
1. 递归：节点为空输出 '#'，否则输出值 + 递归左 + 递归右；
2. 用逗号拼接，如 [1,2,null,null,3] 得到 "1,2,#,#,3,#,#"。

【反序列化】
1. 把字符串 split 成数组，用一个全局索引 i 依次消费；
2. 遇到 '#' 返回 null 并 i++；否则 new 节点，递归建左右子树。

【代码骨架】
function serialize(root) {
  if (!root) return '#';
  return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);
}
function deserialize(data) {
  const arr = data.split(',');
  let i = 0;
  function build() {
    if (arr[i] === '#') { i++; return null; }
    const node = new TreeNode(+arr[i++]);
    node.left = build();
    node.right = build();
    return node;
  }
  return build();
}

【追问】为什么必须存空节点？→ 不存空节点就无法唯一还原树的结构（同样的前序+中序才唯一，单前序不行）。

【变体】层序遍历序列化：用队列按层输出，空节点也输出。

【避坑】反序列化要用「引用类型的索引」或闭包变量保持消费进度，别在每层递归里重置。`,
      source: 'LeetCode 297'
    },
    {
      id: 'al-112', category: 'algorithm', tags: ['二叉树', '动态规划', 'hard'], difficulty: 4,
      question: '如何求「二叉树中的最大路径和」？（路径可以不经过根）',
      answer: `一句话结论：递归求「以每个节点为最高点的单边最大贡献」，同时更新经过该节点的最大路径和（左贡献 + 右贡献 + 节点值）。

【思路】
1. 定义单边贡献：从某节点向下延伸（只能选左或右一条）的最大和；
2. 单边贡献 = node.val + max(0, 左单边, 右单边)（负贡献直接取 0 舍弃）；
3. 全局最大路径和 = max(全局, node.val + max(0,左单边) + max(0,右单边))，即经过该节点的完整路径；
4. 递归返回单边贡献，同时更新全局答案。

【代码骨架】
let maxSum = -Infinity;
function maxGain(node) {
  if (!node) return 0;
  const left = Math.max(0, maxGain(node.left));
  const right = Math.max(0, maxGain(node.right));
  maxSum = Math.max(maxSum, node.val + left + right);
  return node.val + Math.max(left, right);
}

【关键区分】「返回的单边贡献」和「更新的全局路径」是两个不同的量，别混淆。

【复杂度】时间 O(n)，空间 O(h)。

【避坑】节点值可能为负，所以单边贡献要和 0 取 max 截断负分支；全局初始化为负无穷。`,
      source: 'LeetCode 124'
    },
    {
      id: 'al-113', category: 'algorithm', tags: ['二分', '旋转数组'], difficulty: 2,
      question: '如何在「旋转排序数组」中搜索目标值？（O(log n)）',
      answer: `一句话结论：旋转数组二分后必有一半有序，先判断目标是否在有序半边，据此收缩区间。

【思路】
1. 每次二分取 mid，比较 nums[mid] 与 nums[left]；
2. 若 nums[left] <= nums[mid]，左半有序：目标在 [left, mid] 内则搜左，否则搜右；
3. 否则右半有序：目标在 [mid, right] 内则搜右，否则搜左；
4. 循环直到找到或区间为空。

【代码骨架】
let l = 0, r = nums.length - 1;
while (l <= r) {
  const m = (l + r) >> 1;
  if (nums[m] === target) return m;
  if (nums[l] <= nums[m]) {
    if (nums[l] <= target && target < nums[m]) r = m - 1;
    else l = m + 1;
  } else {
    if (nums[m] < target && target <= nums[r]) l = m + 1;
    else r = m - 1;
  }
}
return -1;

【变体】若数组有重复元素，nums[l] === nums[m] 时无法判断哪边有序，需 l++ 跳过（最坏退化为 O(n)）。

【追问】旋转数组找最小值怎么做？→ 比较 nums[mid] 与 nums[right]，收缩到最小值所在区间。

【避坑】用 nums[l] <= nums[m]（带等号）判断左半有序，边界条件要仔细，否则 mid==left 时出错。`,
      source: 'LeetCode 33'
    },
    {
      id: 'al-114', category: 'algorithm', tags: ['回溯', '树', 'DFS'], difficulty: 2,
      question: '「路径总和 II」如何找出所有和为 target 的根到叶路径？',
      answer: `一句话结论：DFS 回溯，遍历到叶子时判断当前路径和是否等于 target，等于则把路径加入结果，回溯时撤销选择。

【思路】
1. 用 path 记录当前路径，sum 记录路径和（或 target - node.val 递减）；
2. 到达叶子节点且剩余值为 0，则复制 path 加入结果；
3. 递归左右子树后，path.pop() 回溯。

【代码骨架】
const res = [];
function dfs(node, remain, path) {
  if (!node) return;
  path.push(node.val);
  if (!node.left && !node.right && remain === node.val) {
    res.push([...path]);
  }
  dfs(node.left, remain - node.val, path);
  dfs(node.right, remain - node.val, path);
  path.pop();
}
dfs(root, target, []);
return res;

【关键】用「remain = target - 累计和」技巧，避免单独维护 sum。

【追问】为什么 push 结果时要 [...path] 拷贝？→ path 是引用，后续回溯会修改它，直接 push 会得到被改后的空数组。

【避坑】回溯必须在递归返回后 pop，否则路径会残留；叶子判断要在 path.push 之后。`,
      source: 'LeetCode 113'
    },
    {
      id: 'al-115', category: 'algorithm', tags: ['图', '拓扑排序', 'BFS'], difficulty: 3,
      question: '「课程表」问题如何用拓扑排序判断是否有环？',
      answer: `一句话结论：把课程依赖建成有向图，用「入度 + BFS」做拓扑排序，若能完成所有课程的排序则无环，否则有环。

【思路】
1. 建图：pre → cur 的边（先修课指向后续课），并统计每个节点的入度；
2. 把所有入度为 0 的节点入队；
3. BFS：出队一个节点（完成一门课），把它指向的节点入度减一，入度变为 0 的入队；
4. 最后若完成课程数 == 总课程数，则无环（可修完），否则有环。

【代码骨架】
const indeg = new Array(n).fill(0);
const adj = Array.from({length:n}, () => []);
for (const [a, b] of prerequisites) { adj[b].push(a); indeg[a]++; }
const q = [];
for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
let count = 0;
while (q.length) {
  const cur = q.shift(); count++;
  for (const next of adj[cur]) if (--indeg[next] === 0) q.push(next);
}
return count === n;

【关键】拓扑排序只适用于 DAG（有向无环图），有环则无法全部入队。

【追问】还能用 DFS 判断环吗？→ 用三色标记（未访问/访问中/已访问），DFS 遇到「访问中」的节点即发现环。

【避坑】注意 prerequisites 的边方向（[a,b] 表示学 a 要先学 b），入度方向别建反。`,
      source: 'LeetCode 207'
    },
    {
      id: 'al-116', category: 'algorithm', tags: ['动态规划', '字符串', '记忆化'], difficulty: 2,
      question: '「单词拆分」如何判断字符串能否由字典中的单词组成？',
      answer: `一句话结论：用 DP，dp[i] 表示 s 的前 i 个字符能否被拆分，若存在 j 使 dp[j] 为真且 s[j..i) 在字典中，则 dp[i] 为真。

【状态转移】
dp[i] = OR(dp[j] && dict.has(s.slice(j, i)))，j 从 0 到 i-1。

【代码骨架】
const dp = new Array(s.length + 1).fill(false);
dp[0] = true;
const set = new Set(wordDict);
for (let i = 1; i <= s.length; i++) {
  for (let j = 0; j < i; j++) {
    if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }
  }
}
return dp[s.length];

【复杂度】时间 O(n^2 * L)（slice 的 L 是平均子串长），空间 O(n)。

【优化】
· 用字典里单词的最长长度 maxLen 限制内层 j 的搜索范围；
· 或用记忆化 DFS（自顶向下）避免重复计算。

【追问】若要输出所有拆分方案？→ 改为 DFS + 回溯，在可行转移处记录路径。

【避坑】dp[0] = true 是空串基准，别忘初始化；内层找到即可 break 优化。`,
      source: 'LeetCode 139'
    },
    {
      id: 'al-117', category: 'algorithm', tags: ['数据结构', '前缀树', 'Trie'], difficulty: 3,
      question: '如何实现前缀树（Trie）？它有哪些典型应用？',
      answer: `一句话结论：Trie 是一种多叉树，按字符逐层存储，用于高效的前缀查询；每个节点用「子节点映射 + 结束标记」表示。

【结构】
节点：{ children: Map/Object, isEnd: boolean }；
插入/查询按字符逐层走，到末尾标记 isEnd。

【核心操作】
1. insert(word)：逐字符建节点，最后 isEnd = true；
2. search(word)：逐字符查，最后返回是否 isEnd（完整单词）；
3. startsWith(prefix)：逐字符查，都能找到即返回 true（前缀存在）。

【代码骨架】
class Trie {
  constructor() { this.root = {}; }
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) node[c] = {};
      node = node[c];
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const c of word) { if (!node[c]) return false; node = node[c]; }
    return !!node.isEnd;
  }
}

【应用】自动补全、拼写检查、IP 路由最长前缀匹配、敏感词过滤（可扩展为 AC 自动机）。

【复杂度】插入/查询 O(L)（L 为单词长度），与词库规模无关。

【避坑】search 和 startsWith 的区别：前者要求 isEnd，后者只要求路径存在；节点用对象/map 都要注意字符键。`,
      source: 'LeetCode 208'
    },
    {
      id: 'al-118', category: 'algorithm', tags: ['数据结构', '并查集', '图'], difficulty: 3,
      question: '并查集（Union-Find）的原理是什么？如何实现？',
      answer: `一句话结论：并查集维护若干「不相交集合」，支持快速判断两元素是否同属一个集合（find）与合并两个集合（union）。

【核心思想】
1. 每个元素指向一个父节点，构成森林；
2. find(x)：沿父指针找到根（集合代表元）；
3. union(x, y)：把两个根合并（一个根指向另一个根）。

【两个优化】
1. 路径压缩：find 时把沿途节点直接指向根，摊还后接近 O(1)；
2. 按秩合并：把矮树挂到高树上，避免树退化成链。

【代码骨架】
class DSU {
  constructor(n) {
    this.parent = Array.from({length:n}, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x, y) {
    let rx = this.find(x), ry = this.find(y);
    if (rx === ry) return;
    if (this.rank[rx] < this.rank[ry]) [rx, ry] = [ry, rx];
    this.parent[ry] = rx;
    if (this.rank[rx] === this.rank[ry]) this.rank[rx]++;
  }
}

【应用】判断图的连通性、朋友圈数量、岛屿数量、Kruskal 最小生成树、判断图中是否有环。

【避坑】find 递归要加路径压缩；union 前先 find 到根再合并，不能直接挂父节点。`,
      source: 'LeetCode 547 / 并查集模板'
    },
    {
      id: 'al-119', category: 'algorithm', tags: ['单调栈', '数组'], difficulty: 2,
      question: '单调栈是什么？如何用它求「每日温度 / 下一个更大元素」？',
      answer: `一句话结论：单调栈维护一个「单调递增或递减」的栈，用于快速求每个元素左边/右边第一个比它大或小的元素。

【每日温度问题】
求每个元素右边第一个比它高的天数差。

【思路（单调递减栈）】
1. 遍历数组，栈里存「下标」，且栈顶对应的高度保持递减；
2. 当前元素比栈顶高时，说明找到了栈顶的「下一个更大值」，弹出并记录距离；
3. 当前元素入栈继续。

【代码骨架】
const res = new Array(n).fill(0);
const stack = [];
for (let i = 0; i < n; i++) {
  while (stack.length && T[i] > T[stack[stack.length-1]]) {
    const top = stack.pop();
    res[top] = i - top;
  }
  stack.push(i);
}
return res;

【本质】栈内元素始终单调，出栈时即为「找到更优解」的时刻，每个元素入栈出栈各一次，O(n)。

【应用】下一个更大元素、柱状图最大矩形、接雨水、滑动窗口最大值（配合双端队列）。

【避坑】注意存下标还是存值；单调方向（增/减）取决于要找「更大」还是「更小」，别记反。`,
      source: 'LeetCode 739'
    },
    {
      id: 'al-120', category: 'algorithm', tags: ['堆', '排序', '手写'], difficulty: 3,
      question: '如何手写一个最小堆（二叉堆）？堆排序怎么做？',
      answer: `一句话结论：二叉堆用数组存储，满足「父节点 <= 子节点」（最小堆）；通过上浮（插入）和下沉（删除堆顶）维护堆性质。

【数组表示】
· 下标 i 的父节点是 (i-1)>>1，左右子节点是 2*i+1、2*i+2；
· 堆顶是数组第一个元素（最小值）。

【核心操作】
1. 插入（push）：放到末尾，不断与父节点比较上浮（bubbleUp）；
2. 删除堆顶（pop）：用末尾元素替换堆顶，然后下沉（sinkDown）到正确位置。

【代码骨架】
class MinHeap {
  constructor() { this.heap = []; }
  push(v) {
    this.heap.push(v);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p] <= this.heap[i]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      let i = 0;
      while (true) {
        let l = 2*i+1, r = 2*i+2, min = i;
        if (l < this.heap.length && this.heap[l] < this.heap[min]) min = l;
        if (r < this.heap.length && this.heap[r] < this.heap[min]) min = r;
        if (min === i) break;
        [this.heap[i], this.heap[min]] = [this.heap[min], this.heap[i]];
        i = min;
      }
    }
    return top;
  }
}

【堆排序】建堆（O(n)）后反复 pop 堆顶得到有序序列，时间 O(n log n)，空间 O(1)（原地），不稳定。

【避坑】上浮/下沉的下标计算别错；JS 无内置堆，TopK、优先队列常需手写。`,
      source: '大厂手写题 / 堆排序'
    }
  ];

  global.App = global.App || {};
  global.App.al3Bank = AL3;
})(window);
