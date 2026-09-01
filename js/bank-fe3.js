/**
 * OfferAgent · 扩充题库（前端 · 第三批：React / Vue / 工程化 / TS / 性能）
 * 挂载到 global.App.fe3Bank，由 bank.js 加载时合并。
 */
(function (global) {
  'use strict';

  var FE3 = [
    {
      id: 'fe-061', category: 'frontend', tags: ['React', 'Hooks'], difficulty: 2,
      question: 'React Hooks 的核心思想是什么？为什么引入 Hooks？',
      answer: `一句话结论：Hooks 让函数组件也能「拥有状态和生命周期能力」，把逻辑封装成可复用的函数，解决了类组件的状态逻辑难以复用、this 混乱等问题。

【引入动机】
1. 状态逻辑难以复用：类组件靠 HOC/渲染属性，嵌套地狱；
2. 类组件复杂：this 绑定、生命周期分散（同一个逻辑拆到多个生命周期）；
3. 函数组件更简洁，但以前没有状态。

【核心 Hooks】
· useState：状态；
· useEffect：副作用（替代生命周期）；
· useContext：跨组件传值；
· useReducer：复杂状态管理；
· useMemo / useCallback：性能优化；
· useRef：引用可变值/DOM。

【规则】
1. 只在最顶层调用（不能在循环/条件里）；
2. 只在函数组件或自定义 Hook 里调用。

【面试追问】为什么 Hook 不能写在条件里？→ React 靠「调用顺序」对应各 Hook 的状态，顺序变了状态就错乱。

【避坑】自定义 Hook（useXxx）是复用逻辑的核心手段，面试常让写 useDebounce、useLocalStorage 等。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-062', category: 'frontend', tags: ['React', 'Hooks'], difficulty: 2,
      question: 'useEffect 的依赖数组是什么意思？清理函数（cleanup）什么时候执行？',
      answer: `一句话结论：useEffect 在渲染后执行副作用，依赖数组控制「什么时候重新执行」；清理函数在「组件卸载」和「下一次副作用执行前」运行。

【依赖数组】
· 不传：每次渲染后都执行；
· 传 []：只在首次挂载后执行一次；
· 传 [a, b]：a 或 b 变化时执行。

【清理函数】
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer); // 清理
}, []);

· 执行时机：组件卸载时、依赖变化重新执行副作用之前。

【面试追问】为什么用空数组 + 清理函数模拟「挂载/卸载」？→ 空数组只在挂载执行，清理函数只在卸载执行，等价于 componentDidMount + componentWillUnmount。

【避坑】
· 依赖数组漏写会导致「用到旧值」（闭包陷阱）或副作用不更新；
· 依赖是引用类型时要注意，每次渲染都是新引用会无限执行。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-063', category: 'frontend', tags: ['React', 'Hooks'], difficulty: 2,
      question: 'useMemo 和 useCallback 有什么区别？什么时候该用？',
      answer: `一句话结论：useMemo 缓存「计算结果」，useCallback 缓存「函数引用」，都用于避免不必要的重复计算/重复渲染。

【useMemo】
· 缓存复杂计算的结果，依赖不变则不重新计算；
const val = useMemo(() => expensive(a), [a]);

【useCallback】
· 缓存函数引用，依赖不变则返回同一个函数；
const fn = useCallback(() => {...}, [a]);

【为什么需要】
· 父组件重渲染时，传给子组件的「新函数/新对象」会导致子组件（配合 memo）重复渲染；
· useCallback/useMemo 保持引用稳定，配合 React.memo 减少子组件渲染。

【面试追问】两者关系？→ useCallback(fn, deps) 等价于 useMemo(() => fn, deps)。

【避坑】不要「滥用」——简单的计算/函数不需要缓存，加了反而增加开销；只有配合 memo、或计算确实昂贵时才用。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-064', category: 'frontend', tags: ['React', '生命周期'], difficulty: 2,
      question: 'React 类组件的生命周期有哪些？',
      answer: `一句话结论：类组件生命周期分「挂载、更新、卸载」三阶段，核心有 componentDidMount、componentDidUpdate、componentWillUnmount 等。

【挂载阶段】
1. constructor；
2. render；
3. componentDidMount（挂载后，可发请求/订阅）。

【更新阶段】
1. shouldComponentUpdate（是否更新，性能优化）；
2. render；
3. componentDidUpdate（更新后）。

【卸载阶段】
· componentWillUnmount（清理定时器/订阅）。

【即将废弃的生命周期】
· componentWillMount、componentWillReceiveProps、componentWillUpdate（已标废弃）。

【面试追问】componentDidMount 为什么适合发请求？→ 此时组件已挂载、DOM 已就绪，请求回来能安全 setState。

【避坑】shouldComponentUpdate 返回 false 会跳过更新；不要在 render 里 setState（会死循环）。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-065', category: 'frontend', tags: ['React', '表单'], difficulty: 2,
      question: '受控组件和非受控组件有什么区别？',
      answer: `一句话结论：受控组件的值由 React state 控制（value + onChange），非受控组件的值由 DOM 自己管理（用 ref 获取）。

【受控组件】
· 表单值存在 state，onChange 更新 state；
· value 始终等于 state，数据流单向；
· 优点：方便校验、实时响应、统一管理；
· 缺点：每个输入都要写 onChange，代码略多。

【非受控组件】
· 用 defaultValue 设初始值，用 ref 在需要时取值；
· 优点：简单、少代码；
· 缺点：无法实时校验、状态不可控。

【面试追问】什么时候用非受控？→ 简单表单、文件上传（input type=file 只能非受控）。

【避坑】受控组件若设了 value 但不提供 onChange，输入会「无法输入」（因为 value 恒不变）。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-066', category: 'frontend', tags: ['React', '性能'], difficulty: 3,
      question: 'React 有哪些性能优化手段？',
      answer: `一句话结论：React 性能优化围绕「减少不必要的渲染和计算」——React.memo、useMemo/useCallback、key、代码分割、虚拟列表、避免内联对象等。

【优化手段】
1. React.memo：浅比较 props，props 没变就不重新渲染；
2. useMemo/useCallback：缓存结果和函数，保持引用稳定；
3. 合理的 key：列表渲染给稳定唯一 key（避免用 index）；
4. 代码分割 + 懒加载：React.lazy + Suspense；
5. 虚拟列表：长列表只渲染可视区；
6. 状态拆分：把「不相关状态」拆到不同组件，避免牵一发动全身；
7. 避免在 render 里创建新对象/函数（传给 memo 子组件会失效）；
8. 用 Immutable 数据 / 不可变更新。

【面试追问】为什么列表用 index 当 key 不好？→ 增删/排序时会导致错位复用，状态错乱、性能差。

【避坑】性能优化要「先测量再优化」，不要盲目加 memo；Profile 工具定位真正慢的组件。`,
      source: '大厂八股（React 性能）'
    },
    {
      id: 'fe-067', category: 'frontend', tags: ['React', 'Fiber'], difficulty: 3,
      question: 'React Fiber 是什么？它解决了什么问题？',
      answer: `一句话结论：Fiber 是 React 16 重写的协调引擎，把「不可中断的递归渲染」改成「可中断、可恢复的链表遍历」，解决了长任务阻塞主线程导致的卡顿。

【解决的问题】
· 旧架构：递归同步渲染，组件树大时一次渲染占满主线程，页面卡顿/掉帧；
· Fiber：把渲染任务拆成小单元，可暂停、让出主线程处理高优先级任务（如用户输入）。

【核心概念】
1. Fiber 节点：每个组件对应一个 Fiber，构成链表（有 child/sibling/return 指针）；
2. 可中断：用「时间切片」让出主线程，有空再继续；
3. 双缓冲：current 树和 workInProgress 树交替；
4. 优先级：不同更新有不同优先级（用户输入 > 数据更新）。

【两个阶段】
· Render（可中断，找差异）；
· Commit（不可中断，一次性更新 DOM）。

【面试追问】Fiber 和「任务切片」关系？→ 利用浏览器空闲时间（配合 requestIdleCallback 思想）分段完成渲染。

【避坑】「可中断」只在 render 阶段，commit 阶段不可中断（保证 DOM 一致）。`,
      source: '大厂八股（React 原理）'
    },
    {
      id: 'fe-068', category: 'frontend', tags: ['React', '状态管理'], difficulty: 2,
      question: 'React 状态管理：Context、Redux、Zustand 有什么区别？',
      answer: `一句话结论：Context 是 React 内置的跨组件传值；Redux 是「单一数据源 + 纯函数 reducer」的集中式状态管理；Zustand 是更轻量的外部 store。

【Context】
· 用 Provider 提供、useContext 消费；
· 适合主题、语言等「低频更新」的全局数据；
· 缺点：value 变化会导致所有消费者重渲染，高频更新性能差。

【Redux】
· 单一 store、action 派发、reducer 纯函数更新；
· 可预测、可调试（时间旅行）、生态完善（中间件）；
· 缺点：样板代码多（可用 Redux Toolkit 简化）。

【Zustand】
· 极简的外部 store，无需 Provider；
· 按需订阅（只订阅用到的状态），性能好、代码少。

【面试追问】Context 为什么不适合高频更新？→ 它的 value 是整体，任一变化都会通知所有消费者，缺乏「按需订阅」。

【避坑】不要把所有状态都塞全局，能局部就局部；全局只放真正共享的状态。`,
      source: '大厂八股'
    },
    {
      id: 'fe-069', category: 'frontend', tags: ['React', '复用'], difficulty: 2,
      question: '高阶组件（HOC）和 Render Props 分别是什么？',
      answer: `一句话结论：两者都是 React 早期的「逻辑复用」方案；HOC 是「接收组件返回新组件」的函数，Render Props 是「用函数作为 prop 共享状态」。

【高阶组件 HOC】
function withAuth(Component) {
  return function (props) {
    if (!isLogin) return <Login />;
    return <Component {...props} />;
  };
}

【Render Props】
<DataProvider render={(data) => <View data={data} />} />

【对比】
· HOC：逻辑复用 + 增强 props，但会「包装嵌套」、props 命名可能冲突；
· Render Props：更灵活，但会「回调嵌套」、可读性下降。

【面试追问】现在还用它们吗？→ Hooks 出现后，自定义 Hook 成为主流的逻辑复用方式，HOC/Render Props 用得少了。

【避坑】HOC 要透传 ref（用 forwardRef）和静态方法；HOC 不要在 render 里创建（每次渲染都是新组件，导致重挂载）。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-070', category: 'frontend', tags: ['React', '事件'], difficulty: 2,
      question: 'React 的合成事件（SyntheticEvent）是什么？',
      answer: `一句话结论：React 合成事件是「对原生事件的跨浏览器封装」，统一了事件对象接口，并用「事件委托」把所有事件挂到根容器上。

【特点】
1. 跨浏览器：屏蔽浏览器差异，事件对象接口统一；
2. 事件委托：React 17+ 把事件委托到根容器（root），而非 document；
3. 阻止冒泡：e.stopPropagation() 是合成事件层面的。

【为什么用合成事件】
· 统一 API、提高性能（不用每个元素都绑监听）；
· 便于 React 管理事件系统。

【面试追问】合成事件和原生事件执行顺序？→ 原生事件先执行，再执行 React 合成事件（React 17 委托到 root 后行为有变化）。

【避坑】
· 合成事件是「池化」的（旧版），事件回调后属性会被清空，需 e.persist()（新版已取消池化）；
· 用 e.nativeEvent 访问原生事件。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-071', category: 'frontend', tags: ['React', '组件'], difficulty: 2,
      question: 'React 函数组件和类组件有什么区别？',
      answer: `一句话结论：函数组件更简洁、用 Hooks 管理状态；类组件用 this.state 和生命周期；函数组件性能更好、是现在的推荐写法。

【区别】
1. 语法：函数组件是普通函数，类组件继承 React.Component；
2. 状态：函数组件用 useState，类组件用 this.state；
3. 生命周期：函数组件用 useEffect 模拟，类组件用生命周期方法；
4. this：函数组件无 this 问题，类组件要 bind；
5. 性能：函数组件更轻，类组件实例化开销更大。

【面试追问】为什么函数组件现在是主流？→ 简洁、无 this、Hooks 复用逻辑更优雅、React 官方推荐。

【避坑】类组件的 this 丢失是经典坑（事件处理里 this 为 undefined），要 bind 或用箭头函数；函数组件没有实例，不能用 ref 拿组件实例（用 useImperativeHandle）。`,
      source: 'React 官方 / 大厂八股'
    },
    {
      id: 'fe-072', category: 'frontend', tags: ['Vue', '响应式'], difficulty: 3,
      question: 'Vue2 的响应式原理是什么？Object.defineProperty 有什么局限？',
      answer: `一句话结论：Vue2 用 Object.defineProperty 劫持对象的每个属性（getter/setter），在 get 时收集依赖、set 时通知更新，实现数据驱动视图。

【原理】
1. 初始化时遍历 data，用 Object.defineProperty 给每个属性加 getter/setter；
2. getter 里「收集依赖」（记录用到该属性的组件/watcher）；
3. setter 里「通知更新」（触发依赖更新视图）。

【Object.defineProperty 的局限】
1. 无法监听「新增/删除」属性（需 Vue.set / Vue.delete）；
2. 无法监听数组索引变化和 length 变化（数组方法被重写来 patch）；
3. 需要深度遍历每个属性，初始化开销大。

【面试追问】数组为什么能响应？→ Vue2 重写了 push/pop/splice 等 7 个数组方法，在这些方法里手动触发更新。

【避坑】Vue2 直接 this.obj.newKey = x 不响应，要用 this.$set；这也是 Vue3 改用 Proxy 的直接原因。`,
      source: 'Vue2 源码 / 大厂八股'
    },
    {
      id: 'fe-073', category: 'frontend', tags: ['Vue', '响应式'], difficulty: 3,
      question: 'Vue3 的响应式原理是什么？为什么用 Proxy 替代 Object.defineProperty？',
      answer: `一句话结论：Vue3 用 Proxy 直接代理整个对象，能拦截所有操作（含新增/删除属性、数组索引），解决了 Vue2 响应式的诸多局限。

【Proxy 响应式】
· reactive(obj)：用 Proxy 包一层，get 收集依赖、set 触发更新；
· ref：对基本类型包装成 { value } 对象再响应式。

【相比 defineProperty 的优势】
1. 能监听新增/删除属性（无需 $set）；
2. 能监听数组索引和 length；
3. 惰性代理：访问到深层才代理，性能更好；
4. 不用遍历所有属性。

【配套】
· track（收集依赖）、trigger（触发更新）、effect（副作用函数）；
· WeakMap 存「对象 → 依赖映射」。

【面试追问】reactive 和 ref 区别？→ reactive 用于对象，ref 用于基本类型（也可包对象）；模板里 ref 自动解包 .value。

【避坑】Proxy 不能代理基本类型（所以有 ref）；解构 reactive 对象会丢失响应式（要 toRefs）。`,
      source: 'Vue3 源码 / 大厂八股'
    },
    {
      id: 'fe-074', category: 'frontend', tags: ['Vue', '响应式'], difficulty: 2,
      question: 'Vue 中 computed 和 watch 有什么区别？',
      answer: `一句话结论：computed 是「基于依赖的派生值」，有缓存、自动求值；watch 是「监听数据变化执行副作用」，无缓存、用于异步/耗时操作。

【computed】
· 依赖变化时自动重新计算，结果缓存；
· 返回一个「计算属性」，模板里直接当变量用；
· 适合：派生数据、复杂计算、多个数据组合。

【watch】
· 监听某个数据变化，执行回调（可做异步操作）；
· 无缓存；
· 适合：数据变化后发请求、做副作用、监听路由变化。

【面试追问】computed 为什么有缓存？→ 依赖没变时直接返回上次结果，避免重复计算。

【避坑】
· computed 里不要写「修改其他数据」的副作用（应保持纯计算）；
· watch 默认浅监听，深度监听要 deep: true；computed 不能异步、watch 可以。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-075', category: 'frontend', tags: ['Vue', '生命周期'], difficulty: 2,
      question: 'Vue 的生命周期有哪些？各阶段能做什么？',
      answer: `一句话结论：Vue 生命周期分「创建、挂载、更新、卸载」四阶段，常见的有 created、mounted、updated、beforeUnmount 等。

【生命周期钩子】
1. beforeCreate：实例初始化前；
2. created：数据初始化完成，可访问 data（DOM 还没渲染）；
3. beforeMount：挂载前；
4. mounted：DOM 挂载完成，可操作 DOM、发请求；
5. beforeUpdate：数据更新前；
6. updated：数据更新、DOM 重渲染后；
7. beforeUnmount / unmounted：卸载前/后（清理定时器、事件）。

【面试追问】created 和 mounted 区别？→ created 时 DOM 未渲染（不能操作 DOM），mounted 时 DOM 已就绪。

【避坑】Vue3 用 Composition API 后，生命周期对应 onMounted/onBeforeUnmount 等；在 setup 里使用。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-076', category: 'frontend', tags: ['Vue', '异步'], difficulty: 3,
      question: 'Vue 的 nextTick 是什么？它的原理是什么？',
      answer: `一句话结论：nextTick 在「DOM 更新完成后」执行回调，用于拿到更新后的最新 DOM；原理是利用微任务/宏任务在更新队列后执行。

【为什么需要】
· Vue 数据变化后，DOM 更新是「异步批量」的；
· 刚改完数据立刻读 DOM，读到的是旧值；
· nextTick 的回调在 DOM 更新后执行，能拿到新 DOM。

【原理】
· Vue 维护一个「更新队列」，同一轮的数据变化合并成一次更新；
· nextTick 把回调放进队列，等当前更新完成后执行；
· 内部用 Promise.then（微任务）优先，降级 setTimeout。

【面试追问】为什么数据更新是异步的？→ 批量更新避免「改一次数据渲染一次」，提升性能。

【避坑】想获取「更新后的 DOM/组件」，要在 nextTick 里操作，或 await nextTick()。`,
      source: 'Vue 源码 / 大厂八股'
    },
    {
      id: 'fe-077', category: 'frontend', tags: ['Vue'], difficulty: 2,
      question: 'Vue2 和 Vue3 有哪些主要区别？',
      answer: `一句话结论：Vue3 在「响应式、组合式 API、性能、TypeScript 支持、Tree-shaking」等方面全面升级，是 Vue2 的重大重构。

【主要区别】
1. 响应式：Object.defineProperty → Proxy（能监听新增/删除/数组索引）；
2. API：Options API → 新增 Composition API（setup、ref/reactive）；
3. 性能：虚拟 DOM 优化（静态标记、block tree）、更小体积；
4. TypeScript：Vue3 用 TS 重写，类型支持更好；
5. 生命周期：beforeDestroy → beforeUnmount 等改名；
6. 打包：支持 Tree-shaking，按需引入。

【面试追问】Composition API 的好处？→ 逻辑按功能组织（而非按选项拆分）、更易复用（自定义 hook）、类型推导更好。

【避坑】Vue3 兼容 Options API（可渐进迁移）；Vue3 移除了一些 API（如 $on/$off、filters）。`,
      source: '大厂八股（Vue3）'
    },
    {
      id: 'fe-078', category: 'frontend', tags: ['Vue'], difficulty: 2,
      question: 'v-if 和 v-show 有什么区别？什么时候用哪个？',
      answer: `一句话结论：v-if 是「条件渲染」（不满足就不渲染 DOM，切换开销大）；v-show 是「条件显示」（始终渲染，用 display:none 切换，初始渲染开销大）。

【v-if】
· 条件为假时，元素不创建/销毁；
· 切换时触发组件的挂载/卸载；
· 适合：条件很少改变、切换成本高的场景。

【v-show】
· 始终渲染 DOM，只是切 display；
· 初始渲染成本高（无论如何都渲染）；
· 适合：频繁切换显示隐藏的场景（如 tab 切换）。

【面试追问】两者可以一起用吗？→ 可以，v-if 优先判断，v-if 为真时再受 v-show 控制。

【避坑】v-if 和 v-for 不要放在同一元素上（v-for 优先级更高，性能差且易出 bug），应用 template 包裹。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-079', category: 'frontend', tags: ['Vue', '通信'], difficulty: 2,
      question: 'Vue 组件之间有哪些通信方式？',
      answer: `一句话结论：Vue 组件通信有 props/emit、ref、provide/inject、事件总线、Vuex/Pinia 等，选择取决于组件关系。

【常见方式】
1. 父→子：props；
2. 子→父：emit 自定义事件；
3. 父访问子：ref（拿到子组件实例）；
4. 跨层级：provide/inject（祖先向后代注入）；
5. 任意组件：事件总线（mitt）、全局状态 Vuex/Pinia；
6. 兄弟组件：通过共同父级中转，或状态管理。

【面试追问】provide/inject 的缺点？→ 数据来源不明确、难追踪，且不是响应式的（传 ref 才能响应）。

【避坑】
· props 是单向数据流，子组件不应直接改 props；
· 简单场景别上 Vuex，provide/inject 或 props/emit 更合适。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-080', category: 'frontend', tags: ['Vue', '插槽'], difficulty: 2,
      question: 'Vue 的插槽（slot）是什么？作用域插槽是什么？',
      answer: `一句话结论：插槽让父组件向子组件「传模板内容」；作用域插槽还能让子组件把「数据」回传给父组件使用。

【默认插槽】
· 子组件用 <slot></slot> 占位，父组件在标签里写内容；
<child> 这里是插槽内容 </child>

【具名插槽】
· 多个插槽用 name 区分（如 header/footer）。

【作用域插槽】
· 子组件 <slot :data="item"></slot> 把数据传出去；
· 父组件用 <template #default="{ data }"> 接收；
· 典型：封装表格组件，父组件自定义每列渲染。

【面试追问】作用域插槽的本质？→ 一种「回调」，子组件把数据交给父组件的模板函数渲染。

【避坑】Vue3 用 v-slot:#name 语法（Vue2 是 slot-scope）；插槽内容在「父组件作用域」编译，不能访问子组件数据（除非作用域插槽）。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-081', category: 'frontend', tags: ['Vue', '状态管理'], difficulty: 2,
      question: 'Vuex 和 Pinia 有什么区别？',
      answer: `一句话结论：Pinia 是 Vue 官方新一代状态管理，比 Vuex 更简洁、类型更好、去掉了 mutations；Vuex 是经典方案但更繁琐。

【核心区别】
1. 语法：Pinia 更简洁（直接改 state），Vuex 要 commit mutation；
2. 类型：Pinia 对 TypeScript 支持更好；
3. 结构：Pinia 去掉 mutations，只有 state/getters/actions；
4. 模块：Pinia 用「多个 store」，天然模块化；Vuex 用单一 store + 嵌套模块；
5. 官方定位：Pinia 是 Vue3 官方推荐。

【为什么 Pinia 更简洁】
Vuex：dispatch('action') → commit('mutation') → 改 state；
Pinia：store.xxx = ... 直接改，action 也是普通函数。

【面试追问】Pinia 需要 mutations 吗？→ 不需要，直接改 state 也是响应式的，mutations 是 Vuex 的历史负担。

【避坑】Vue3 新项目优先 Pinia；Vuex 维护成本高、样板代码多。`,
      source: '大厂八股（Vue）'
    },
    {
      id: 'fe-082', category: 'frontend', tags: ['工程化', 'Webpack'], difficulty: 3,
      question: 'Webpack 的工作原理是什么？loader 和 plugin 有什么区别？',
      answer: `一句话结论：Webpack 从入口出发，构建「模块依赖图」，通过 loader 转换文件、通过 plugin 扩展构建流程，最终打包输出。

【工作流程】
1. 从 entry 入口开始，递归解析依赖（import/require）；
2. 构建模块依赖图；
3. loader 把非 JS 文件（CSS/图片/TS）转换成可处理模块；
4. plugin 在构建各阶段做额外事（压缩、生成 HTML、注入变量）；
5. 输出 bundle。

【loader vs plugin】
· loader：本质是「转换函数」，处理特定类型文件（如 css-loader、babel-loader），在「加载模块时」工作；
· plugin：本质是「扩展器」，通过钩子介入整个构建流程（如 HtmlWebpackPlugin、DefinePlugin），功能更强大。

【面试追问】loader 的执行顺序？→ 从右到左、从下到上（链式调用）。

【避坑】「loader 管转换、plugin 管流程」是核心区分；理解 module/chunk/bundle 概念是深入的前提。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-083', category: 'frontend', tags: ['工程化', 'Vite'], difficulty: 2,
      question: 'Vite 为什么比 Webpack 快？它的原理是什么？',
      answer: `一句话结论：Vite 开发时利用浏览器原生 ES Module，不打包直接按需加载；并用 esbuild 做依赖预构建和快速转译，所以启动和热更新极快。

【原理】
1. 开发模式：
   · 依赖（node_modules）用 esbuild 预构建成 ESM；
   · 源码以原生 ESM 方式按需提供（浏览器直接请求，不打包）；
   · 改哪个文件就重新加载哪个文件（HMR 精确）。
2. 生产模式：用 Rollup 打包（因为浏览器不能直接用源码）。

【为什么快】
· Webpack 启动要打包整个项目，Vite 不打包、按需加载；
· esbuild 是 Go 写的，转译比 JS 写的 babel 快几十倍。

【面试追问】Vite 生产为什么用 Rollup？→ Rollup 对 ESM 的 tree-shaking 和产物优化更好。

【避坑】Vite 依赖浏览器原生 ESM，需要现代浏览器；大量依赖时首次「依赖预构建」可能稍慢（可缓存）。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-084', category: 'frontend', tags: ['工程化', 'Babel'], difficulty: 2,
      question: 'Babel 的作用和工作原理是什么？',
      answer: `一句话结论：Babel 是 JS 编译器，把新语法（ES6+/JSX/TS）转成兼容旧浏览器的代码，核心是「解析 → 转换 → 生成」三阶段。

【作用】
1. 语法转换：ES6+ → ES5；
2. Polyfill：补充新 API（通过 core-js）；
3. 转译 JSX、TypeScript。

【工作原理（三阶段）】
1. 解析（parse）：源码 → AST（抽象语法树）；
2. 转换（transform）：用插件遍历/修改 AST（@babel/preset-env 等）；
3. 生成（generate）：AST → 目标代码。

【面试追问】preset 和 plugin 区别？→ preset 是一组 plugin 的集合（如 preset-env 包含所有语法转换）；plugin 是单个转换规则。

【避坑】Babel 只转「语法」，不转「新 API」（如 Promise 要用 polyfill）；理解 AST 是理解所有编译工具的基础。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-085', category: 'frontend', tags: ['工程化', '性能'], difficulty: 2,
      question: '什么是代码分割（Code Splitting）？如何实现？',
      answer: `一句话结论：代码分割把大 bundle 拆成多个小 chunk，按需加载，减少首屏体积；用动态 import、路由懒加载、splitChunks 实现。

【为什么需要】
· 单 bundle 太大，首屏加载慢；
· 拆开后首屏只加载必要代码，其他按需加载。

【实现方式】
1. 动态 import：import('./module').then(...)；
2. 路由懒加载：React.lazy / Vue 的 () => import()；
3. Webpack splitChunks：提取公共依赖、第三方库单独分包；
4. 手动分包：把 node_modules 单独打成 vendor。

【面试追问】动态 import 的原理？→ 运行时按需请求对应的 chunk，返回 Promise。

【避坑】拆得太碎会增加请求数，要平衡 chunk 数量和大小；公共库单独缓存可提升缓存命中率。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-086', category: 'frontend', tags: ['微前端', '架构'], difficulty: 3,
      question: '什么是微前端？有哪些实现方案？',
      answer: `一句话结论：微前端把一个大前端应用拆成多个「独立开发、独立部署」的子应用，由主应用统一整合，解决大型前端项目的工程化与协作问题。

【核心价值】
· 独立开发/部署/技术栈，团队解耦；
· 增量升级（老系统逐步替换）；
· 按需加载，降低首屏压力。

【实现方案】
1. qiankun（基于 single-spa）：主应用注册子应用，子应用独立运行，样式/JS 隔离；
2. 模块联邦（Module Federation，Webpack 5）：跨应用共享模块；
3. iframe：最彻底的隔离，但通信/样式/性能差；
4. 原生 Web Components。

【核心技术难点】
· JS 隔离（沙箱）、CSS 隔离、应用间通信、路由分发。

【面试追问】微前端和 iframe 对比？→ iframe 隔离最彻底但体验差（通信难、URL 不共享）；微前端框架隔离 + 共享体验更好。

【避坑】微前端适合「大型多团队项目」，小项目强上反而增加复杂度；要考虑「技术栈统一」是否比「解耦」更重要。`,
      source: '大厂八股（微前端）'
    },
    {
      id: 'fe-087', category: 'frontend', tags: ['监控', '性能'], difficulty: 2,
      question: '前端如何做性能监控？Performance API 能拿到什么？',
      answer: `一句话结论：前端性能监控用 Performance API 采集导航时序、资源加载、核心指标，再上报分析；核心指标有 FCP、LCP、FID/INP、CLS 等。

【Performance API 提供】
· performance.timing：导航各阶段时间戳（DNS、TCP、请求、DOM 解析）；
· performance.getEntriesByType('resource')：各资源加载耗时；
· performance.getEntriesByType('navigation')：导航时序；
· PerformanceObserver：监听 LCP、CLS、FID 等指标。

【核心指标】
· FCP：首次内容绘制；
· LCP：最大内容绘制（首屏主体多久出现）；
· FID/INP：首次输入延迟/交互延迟（响应快不快）；
· CLS：累积布局偏移（视觉稳不稳）。

【面试追问】怎么上报？→ 用 PerformanceObserver 采集 → 定时或页面卸载时用 sendBeacon 上报。

【避坑】核心指标要在真实用户（RUM）而非实验室（Lighthouse）里采集才准；注意采样率，避免上报风暴。`,
      source: '大厂八股（监控）'
    },
    {
      id: 'fe-088', category: 'frontend', tags: ['测试'], difficulty: 2,
      question: '前端测试有哪些类型？单元测试、集成测试、E2E 测试有什么区别？',
      answer: `一句话结论：单元测试测最小单元（函数/组件）、集成测试测模块间协作、E2E 测试模拟真实用户走完整流程，从「快、便宜」到「慢、真实」逐级递进。

【三种测试】
1. 单元测试：测单个函数/组件，快、隔离、数量最多。工具：Jest、Vitest。
2. 集成测试：测多个模块组合（如组件 + store + 接口）。工具：Testing Library。
3. E2E 测试：模拟真实浏览器操作，测完整用户流程。工具：Playwright、Cypress。

【测试金字塔】
· 底层大量单元测试，中间适量集成测试，顶层少量 E2E；
· 越往上越慢、越贵、越接近真实，但越难维护。

【面试追问】什么代码值得写测试？→ 核心业务逻辑、易出错的工具函数、公共组件；纯 UI 展示类优先级低。

【避坑】追求 100% 覆盖率是陷阱，关键是「关键路径」有测试；测试要「可维护、不脆弱」。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-089', category: 'frontend', tags: ['TypeScript', '泛型'], difficulty: 2,
      question: 'TypeScript 的泛型（Generic）是什么？它解决什么问题？',
      answer: `一句话结论：泛型让函数/类/接口在「定义时不指定具体类型，使用时再确定」，实现类型参数化，兼顾类型安全与复用性。

【基本用法】
function identity<T>(arg: T): T { return arg; }
identity<string>('hello');

【解决的问题】
· 不写泛型只能用 any（丢类型安全）或写死类型（不能复用）；
· 泛型让「传入类型」和「返回类型」建立关联，类型可推导。

【常见应用】
1. 泛型函数/类/接口；
2. 泛型约束：<T extends { length: number }> 限制 T 必须有某属性；
3. 工具类型（Partial<T>、Record<K,V>）底层就是泛型。

【面试追问】泛型约束的作用？→ 限制类型参数的范围，从而能访问特定属性/方法。

【避坑】泛型和 any 的区别：any 放弃类型检查，泛型保留类型信息；「泛型 = 类型层面的函数」是核心理解。`,
      source: '大厂八股（TS）'
    },
    {
      id: 'fe-090', category: 'frontend', tags: ['TypeScript', '类型'], difficulty: 2,
      question: 'TypeScript 中 interface 和 type 有什么区别？',
      answer: `一句话结论：interface 主要用于「描述对象结构」、可声明合并、可被继承；type 是「类型别名」，更灵活，能表示联合/交叉/原始类型等。

【主要区别】
1. 声明合并：interface 同名会自动合并，type 不能重复定义；
2. 扩展：interface 用 extends，type 用交叉类型 &；
3. 表达能力：type 能定义联合类型、元组、映射类型等，interface 不能；
4. 适用范围：type 可给任何类型起别名，interface 主要描述对象。

【示例】
interface A { x: number }
interface A { y: number } // 合并成 { x, y }

type B = string | number; // type 能做联合，interface 不行

【面试追问】什么时候用哪个？→ 描述对象结构、需要继承/合并用 interface；需要联合/交叉/工具类型用 type；团队统一风格最重要。

【避坑】interface 只能声明「对象类型」的形态，type 更通用；两者大部分场景可互换，不必纠结。`,
      source: '大厂八股（TS）'
    },
    {
      id: 'fe-091', category: 'frontend', tags: ['TypeScript', '类型'], difficulty: 3,
      question: 'TypeScript 有哪些高级类型？Partial、Pick、Record 等工具类型是什么？',
      answer: `一句话结论：TS 高级类型包括联合/交叉/条件/映射/模板字面量类型；工具类型（Partial、Pick、Record 等）是基于映射类型的「类型变换工具」。

【联合 & 交叉】
· 联合 A | B：满足其一；
· 交叉 A & B：同时满足。

【条件类型】
T extends U ? X : Y（类型层面的三元）。

【映射类型】
基于已有类型，遍历 key 生成新类型：
type Partial<T> = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };

【常用工具类型】
· Partial<T>：全部可选；
· Pick<T, K>：选部分属性；
· Omit<T, K>：排除部分属性；
· Record<K, V>：构造「键 K 值 V」的对象类型；
· ReturnType<T>：取函数返回类型。

【面试追问】keyof 和 typeof 的作用？→ keyof 取对象类型的键联合，typeof 取值的类型。

【避坑】这些工具类型都是「编译期」的，运行时不存在；理解「类型 = 一组值的集合」才能用好高级类型。`,
      source: '大厂八股（TS）'
    },
    {
      id: 'fe-092', category: 'frontend', tags: ['性能', '指标'], difficulty: 2,
      question: 'Web 核心性能指标 LCP、FID/INP、CLS 分别代表什么？',
      answer: `一句话结论：LCP 衡量「加载」速度（最大内容绘制）、FID/INP 衡量「交互」响应速度、CLS 衡量「视觉」稳定性，是 Google 提出的 Core Web Vitals 核心指标。

【LCP（Largest Contentful Paint）】
· 最大内容元素（大图/标题）绘制完成的时间；
· 衡量首屏主体内容多久可见，目标 < 2.5s。

【FID / INP（交互延迟）】
· FID：用户首次交互到浏览器响应的延迟，目标 < 100ms；
· INP：FID 的替代，衡量全程交互响应，更全面。

【CLS（Cumulative Layout Shift）】
· 累积布局偏移，衡量页面元素「跳动」程度，目标 < 0.1；
· 常见原因：图片无尺寸、字体加载、动态插入内容。

【面试追问】如何优化 LCP？→ 预加载关键资源、图片优化、SSR、减少阻塞渲染的 JS/CSS。

【避坑】这三项是「用户感知」指标，比 onload 更贴近真实体验；优化要结合工具测量而非凭感觉。`,
      source: 'Google Core Web Vitals / 大厂八股'
    },
    {
      id: 'fe-093', category: 'frontend', tags: ['浏览器', '性能'], difficulty: 3,
      question: 'requestIdleCallback 是什么？什么是长任务（Long Task）？',
      answer: `一句话结论：requestIdleCallback 让浏览器在「空闲时」执行低优先级任务，避免与高优先级渲染争抢；长任务是执行超过 50ms 的任务，会阻塞交互。

【requestIdleCallback】
· 浏览器每帧渲染后若有余量，执行空闲回调；
· 回调拿到 deadline（剩余时间）和 didTimeout；
· 适合：非紧急的计算、数据上报、预加载。

【长任务（Long Task）】
· 单次执行 > 50ms 的任务；
· 会阻塞主线程，导致掉帧、交互延迟（INP 差）；
· 用 PerformanceObserver 监听 'longtask' 发现。

【面试追问】如何拆长任务？→ 用 requestIdleCallback / 时间切片 / Web Worker 把大任务拆小。

【避坑】requestIdleCallback 兼容性一般（Safari 不支持），可降级 setTimeout；不要把「紧急」任务放空闲回调（可能被无限推迟）。`,
      source: '大厂八股（性能）'
    },
    {
      id: 'fe-094', category: 'frontend', tags: ['渲染', 'SSR'], difficulty: 3,
      question: 'SSR、CSR、SSG 分别是什么？各有什么优缺点？',
      answer: `一句话结论：CSR 在浏览器里渲染（JS 生成 DOM），SSR 在服务器渲染出 HTML，SSG 在构建时生成静态 HTML；三者是「渲染时机」的区别。

【CSR（客户端渲染）】
· 服务器返回空壳 HTML + JS，浏览器执行 JS 渲染；
· 优点：交互流畅、服务器压力小；
· 缺点：首屏慢、SEO 差（爬虫难抓）。

【SSR（服务端渲染）】
· 服务器直接渲染出完整 HTML 返回；
· 优点：首屏快、SEO 好；
· 缺点：服务器压力大、实现复杂。

【SSG（静态生成）】
· 构建时生成静态 HTML；
· 优点：速度最快、SEO 好、可 CDN；
· 缺点：内容不能实时（需重新构建）。

【面试追问】如何选择？→ 内容型/SEO 强（博客、官网）用 SSG/SSR；后台/交互强用 CSR；Next.js/Nuxt 支持混合模式。

【避坑】SSR 的「水合（hydration）」——服务端渲染后客户端再「接管」，若不一致会报错，要保证两端渲染一致。`,
      source: '大厂八股（SSR）'
    },
    {
      id: 'fe-095', category: 'frontend', tags: ['发布', '灰度'], difficulty: 2,
      question: '前端如何做灰度发布和 A/B 测试？',
      answer: `一句话结论：灰度发布是「让部分用户先体验新版本，逐步放量」；A/B 测试是「同时跑多个版本对比效果」；前端靠分流策略 + 开关控制实现。

【灰度发布流程】
1. 按用户 ID/比例分流（如 5% → 20% → 100%）；
2. 新版本只给灰度用户；
3. 观察指标，没问题逐步放量，有问题回滚。

【前端实现】
1. 分流策略：按 userId hash、cookie、白名单；
2. 功能开关（Feature Flag）：配置中心控制功能开/关；
3. 多版本部署：不同 URL 或同一 URL 按分流返回不同资源。

【A/B 测试】
· 对照组 vs 实验组，对比转化率/点击率等指标；
· 关键：随机分流、单一变量、足够样本量。

【面试追问】如何保证灰度可回滚？→ 版本化部署 + 开关，出问题一键切回旧版本/关功能。

【避坑】分流要「稳定」（同一用户始终同一组），避免用户每次刷新跳版本；灰度要监控错误率和性能。`,
      source: '大厂八股（工程化）'
    },
    {
      id: 'fe-096', category: 'frontend', tags: ['Web Components'], difficulty: 2,
      question: '什么是 Web Components？它的核心 API 有哪些？',
      answer: `一句话结论：Web Components 是浏览器原生的组件化标准，用自定义元素、Shadow DOM、模板三件套，创建可复用的封装组件。

【三大核心 API】
1. Custom Elements（自定义元素）：定义新的 HTML 标签；
2. Shadow DOM：封装样式和 DOM，与外部分离（样式不冲突）；
3. HTML Template：声明式的模板片段。

【示例】
class MyButton extends HTMLElement {
  connectedCallback() { this.innerHTML = '<button>点击</button>'; }
}
customElements.define('my-button', MyButton);

【优点】
· 原生支持，无框架依赖；
· 样式/行为真正封装，跨框架复用。

【面试追问】Shadow DOM 的作用？→ 提供「隔离作用域」，组件内部样式不外泄、外部样式不侵入。

【避坑】Web Components 生态不如 React/Vue 成熟，复杂应用用它开发体验一般；但它是「框架无关组件」的基础。`,
      source: '大厂八股'
    },
    {
      id: 'fe-097', category: 'frontend', tags: ['图形'], difficulty: 2,
      question: 'Canvas 和 SVG 有什么区别？各自适合什么场景？',
      answer: `一句话结论：Canvas 是「位图」，用 JS 逐像素绘制，适合大量图形/动画；SVG 是「矢量」，用 XML 描述图形，适合图标/可缩放的静态图形。

【Canvas】
· 基于像素，绘制后是位图；
· 缩放会模糊、无法单独操作已画图形；
· 性能：大量图形/动画时更快（不维护 DOM 节点）；
· 适合：游戏、图表、图像处理、粒子动画。

【SVG】
· 基于矢量，每个图形是独立 DOM 节点；
· 无限缩放不失真、可绑定事件、可 CSS 控制；
· 性能：图形多时（成千上万节点）会卡；
· 适合：图标、logo、数据可视化、可交互图形。

【面试追问】为什么大量图形用 Canvas 更好？→ SVG 每个元素都是 DOM 节点，数量多时重绘和内存开销大。

【避坑】「Canvas 一定比 SVG 快」不对，要看图形数量和是否需要交互/缩放；两者可结合（如 ECharts 可选渲染器）。`,
      source: '大厂八股'
    },
    {
      id: 'fe-098', category: 'frontend', tags: ['国际化'], difficulty: 2,
      question: '前端国际化（i18n）如何实现？有哪些要点？',
      answer: `一句话结论：国际化是让应用适配多语言/地区，核心是「文案抽取、语言包管理、运行时切换、格式化（日期/数字/货币）」。

【实现方案】
1. 文案抽取：把所有显示文案抽成 key（如 t('home.title')）；
2. 语言包：每种语言一个 JSON 资源文件；
3. 运行时切换：根据用户语言/偏好加载对应语言包；
4. 库：vue-i18n、react-intl、i18next。

【要点】
1. 日期/时间/数字/货币格式化（Intl API 或库）；
2. 时区处理；
3. 复数形式、性别等语法差异；
4. 文案长度差异导致的布局问题（预留空间）；
5. RTL（从右到左）语言的布局。

【面试追问】如何处理「语言切换」？→ 切换语言包 + 重新渲染，或配合路由/存储记忆选择。

【避坑】别硬编码文案、别用字符串拼接造句子（不同语言语序不同）；日期时间要按地区格式化。`,
      source: '大厂八股'
    },
    {
      id: 'fe-099', category: 'frontend', tags: ['PWA'], difficulty: 2,
      question: 'PWA 是什么？它由哪些技术组成？',
      answer: `一句话结论：PWA（渐进式 Web 应用）让网页拥有「接近原生 App」的体验，核心是 Service Worker（离线缓存）、Web App Manifest（添加到主屏）、HTTPS。

【三大核心】
1. Service Worker：后台脚本，拦截请求、缓存资源，实现离线访问和推送；
2. Web App Manifest：描述应用的名称、图标、启动方式，支持「添加到主屏幕」；
3. HTTPS：Service Worker 要求安全上下文。

【特性】
· 可安装（添加到主屏，独立窗口打开）；
· 离线可用（缓存关键资源）；
· 推送通知；
· 秒开（缓存 + 预缓存）。

【本项目已实现】
OfferAgent 就加了 manifest.json + sw.js + 图标，支持添加到主屏幕和离线刷题。

【面试追问】Service Worker 的缓存策略？→ 先缓存（cache-first）、先网络（network-first）、预缓存（precache）、运行时缓存。

【避坑】SW 更新要靠「版本号变化触发」，旧缓存要清理；SW 作用域受限，且开发时可能缓存旧代码。`,
      source: 'PWA / 本项目实践'
    },
    {
      id: 'fe-100', category: 'frontend', tags: ['移动端', '适配'], difficulty: 2,
      question: '移动端适配怎么做？rem、vw、1px 问题、安全区分别怎么处理？',
      answer: `一句话结论：移动端适配让页面在不同尺寸屏幕上等比缩放，常用 rem/vw 方案；1px 和刘海屏安全区是移动端的两个特殊问题。

【适配方案】
1. rem：根元素 font-size 随屏幕宽度调整（动态设置），元素用 rem 单位；
2. vw/vh：直接用视口单位（如 750 设计稿下 1px = 0.133vw）；
3. 媒体查询 + 弹性布局；
4. flexible（lib-flexible）方案。

【1px 问题】
· 高清屏（DPR>1）下 1px 边框会显得粗；
· 解决：transform: scale(0.5)、border-image、伪元素。

【安全区】
· 刘海屏底部/顶部有安全区，用 env(safe-area-inset-*) 适配。

【面试追问】rem 的原理？→ 动态设置 html font-size = 屏幕宽度/基准值，元素 rem 值随之缩放。

【避坑】用 viewport meta（width=device-width, initial-scale=1）是基础；布局优先用 flex/grid，别全靠绝对定位。`,
      source: '大厂八股（移动端）'
    },
    {
      id: 'fe-101', category: 'frontend', tags: ['设计模式'], difficulty: 2,
      question: '前端常见的设计模式有哪些？',
      answer: `一句话结论：前端常用单例、观察者/发布订阅、工厂、策略、装饰器、代理等模式，用于解耦、复用、扩展。

【常见模式】
1. 单例模式：全局唯一实例（如全局 store、弹窗管理）；
2. 观察者/发布订阅：事件监听、Vue 响应式、跨组件通信；
3. 工厂模式：统一创建对象（如不同类型表单组件）；
4. 策略模式：把「一组可替换的算法」封装，消除 if/else（如表单校验、支付方式）；
5. 装饰器模式：动态给对象加功能（如 HOC、拦截器）；
6. 代理模式：Vue3 响应式、图片懒加载占位；
7. 模块模式：IIFE、ES Module 封装私有变量。

【面试追问】策略模式能解决什么？→ 大量 if/else 分支，把每个策略抽成独立对象/函数，符合开闭原则。

【避坑】设计模式是「经验总结」不是「教条」，别为了用而用；「发布订阅 vs 观察者」是高频考点。`,
      source: '大厂八股（设计模式）'
    },
    {
      id: 'fe-102', category: 'frontend', tags: ['文件上传'], difficulty: 3,
      question: '前端如何实现大文件上传？分片上传和断点续传怎么做？',
      answer: `一句话结论：大文件上传把文件切成多个「分片」，分别上传（可并发），服务器合并；断点续传记录已传分片，中断后从断点继续。

【分片上传流程】
1. 用 File.slice 把文件切成固定大小的分片（如 5MB）；
2. 计算每个分片的 hash（标识唯一性）；
3. 并发上传分片（控制并发数）；
4. 全部传完后，请求服务器合并分片。

【断点续传】
· 记录已上传的分片（本地或服务器查询）；
· 中断后重传只传未完成的分片。

【秒传（可选）】
· 用整个文件的 hash 判断，服务器已有则直接返回成功。

【面试追问】怎么保证分片顺序/完整性？→ 用分片序号 + 文件 hash，服务器按序号合并并校验。

【避坑】并发上传要限流（太多会拖垮）；进度计算要汇总各分片进度；大文件 hash 计算本身也耗时，可用 web worker。`,
      source: '大厂八股（文件上传）'
    },
    {
      id: 'fe-103', category: 'frontend', tags: ['埋点', '数据'], difficulty: 2,
      question: '前端埋点有哪些方案？代码埋点、可视化埋点、无埋点有什么区别？',
      answer: `一句话结论：埋点用于采集用户行为数据；代码埋点手动调用最灵活准确，可视化埋点配置式无需发版，无埋点全量采集最省事但数据量大。

【三种方案】
1. 代码埋点：在业务代码里手动调用埋点 SDK（如 track('click', {...})）；
   · 优点：灵活、可传业务字段、准确；
   · 缺点：需开发介入、要发版。

2. 可视化埋点：在可视化后台「圈选」元素配置埋点；
   · 优点：运营/产品可自己配，无需发版；
   · 缺点：灵活性有限，复杂逻辑难表达。

3. 无埋点（全埋点）：SDK 自动采集所有点击/曝光；
   · 优点：省事、不漏事件；
   · 缺点：数据量大、噪声多、业务字段缺失。

【核心组成】事件（event）+ 属性（properties）+ 用户标识（user id）。

【面试追问】埋点数据怎么上报？→ 批量 + 压缩 + 采样，页面卸载时 sendBeacon 兜底。

【避坑】埋点要「约定命名规范」，否则数据混乱；注意隐私合规（脱敏、用户授权）。`,
      source: '大厂八股（埋点）'
    },
    {
      id: 'fe-104', category: 'frontend', tags: ['体验', '白屏'], difficulty: 2,
      question: '什么是白屏问题？如何定位和优化？',
      answer: `一句话结论：白屏是页面长时间空白无内容，常见原因是 JS 错误、资源加载失败、渲染阻塞；用监控定位 + 骨架屏/降级优化。

【白屏原因】
1. JS 报错导致渲染中断；
2. 关键资源（JS/CSS）加载失败或超时；
3. 首屏依赖的接口慢/失败；
4. 低端设备性能差。

【定位方法】
1. 前端监控：采集白屏错误（错误信息、堆栈）；
2. 性能分析：看资源加载时序、接口耗时；
3. 复现：用户环境（机型/网络）。

【优化】
1. 骨架屏 / loading 占位（提升感知体验）；
2. 错误降级（接口失败给默认内容/重试）；
3. 关键资源预加载、减少阻塞；
4. 代码分割、CDN、缓存。

【面试追问】如何监测白屏？→ 在页面放「检测点」（如首屏节点），定时检测是否渲染，或对比截图。

【避坑】白屏不等于「接口慢」，先看有没有 JS 报错；监控是定位白屏的关键。`,
      source: '大厂八股（体验优化）'
    },
    {
      id: 'fe-105', category: 'frontend', tags: ['工程化', '优化'], difficulty: 3,
      question: '如何分析并优化前端构建产物体积？',
      answer: `一句话结论：构建优化先「分析 bundle 构成」，再用 tree-shaking、按需引入、代码分割、压缩、去重依赖等手段减小体积。

【分析工具】
· webpack-bundle-analyzer、rollup-plugin-visualizer：可视化看哪些包大；
· source-map-explorer：定位大模块来源。

【优化手段】
1. Tree-shaking：ESM 下自动去除未使用代码；
2. 按需引入：组件库/工具库按需加载（如 babel-plugin-import）；
3. 代码分割：第三方库、路由分包；
4. 压缩：JS 压缩（terser）、CSS 压缩、gzip/brotli；
5. 去重依赖：统一版本（npm dedupe）、external 掉重复包；
6. 替换大依赖：moment → day.js（小得多）；
7. 图片/字体优化：转 base64 或懒加载。

【面试追问】为什么 ESM 能 tree-shaking 而 CJS 难？→ ESM 是静态 import，构建期能确定依赖；CJS 是动态 require，难分析。

【避坑】先分析再优化，别盲目删依赖；注意 tree-shaking 需要「副作用标注」（package.json 的 sideEffects）。`,
      source: '大厂八股（工程化）'
    }
  ];

  global.App = global.App || {};
  global.App.fe3Bank = FE3;
})(window);
