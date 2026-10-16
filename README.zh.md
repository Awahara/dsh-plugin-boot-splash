# dsh-plugin-boot-splash

给 DSH Web GUI 的开屏动画插件：应用挂载完成后，在整个界面上播放一段 HUD 风格的引导序列，约 3.8 秒，随时可跳过。

```
┌ DEEPSEEK HARNESS // WEB RUNTIME ─────────────────────── T+1.8s ┐
│                                                                │
│                      ╭─ 三层同心仪表环 ─╮                       │
│                      │   ◈  六边形自绘  │   ← 中心是品牌鲸标    │
│                      ╰─ 进度弧 0→100% ─╯                       │
│                                                                │
│                        D E E P S E E K                         │
│                          H A R N E S S                         │
│                     ── 智能体运行时 · 已就绪 ──                  │
│                                                                │
│ > dsh kernel            冷启动                        [ ok ]    │
│ > resolve plugin graph  42 modules                    [linked]  │
│ > mount ui.renderer     root slot                     [ ok ]    │
│ > attach session bus    sse                           [online]  │
│                                    点击任意位置跳过             │
│  序列 07 · 冷启动   ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░        062 %      │
└────────────────────────────────────────────────────────────────┘
```

## 画面构成

| 层 | 内容 |
|---|---|
| 背景 | 深空渐变 + 缓慢漂移的网格，下半屏是带透视的地板网格 |
| 动效 | 自上而下的扫描光带、五道垂直数据流、暗角 |
| 仪表 | 三层反向旋转的刻度环、进度弧、自绘六边形准星、中心品牌鲸标（呼吸辉光） |
| 字标 | `HARNESS` 逐字浮现，字面上有一道循环掠过的高光 |
| 日志 | 左下角等宽启动日志，逐行滑入，尾部带 `ok / linked / online` 状态标签 |
| 进度 | 底部进度条 + `T+x.xs` 计时 + 三位数百分比，缓动递增 |
| 退场 | 中央一道青色光带纵向展开→白闪→整体放大淡出（跳过时压缩到 190ms） |

## 交互约定

- **点击 / Esc / 空格 / 回车**：立即跳过，退场动画缩短。
- **播放一次**：同一浏览器标签页只播一次（`sessionStorage`），刷新页面不会重播；重开应用窗口会再播。
- **跳过时拦截**：动画期间点击和按键会被捕获阶段拦截，不会误触底下的界面。
- **`prefers-reduced-motion: reduce`**：装饰性动画全部关闭，时长压缩到 1.4 秒，只留静态构图和淡出。
- **不残留**：播完组件直接返回 `null` 卸载，没有常驻的监听器或定时器。

## 想再看一次

在 DevTools 控制台执行：

```js
sessionStorage.removeItem('dsh.bootSplash.seen'); location.reload()
```

浏览器 profile（地址栏可编辑）也可以直接在 URL 后面加 `&dshBootSplash=1` 或 `?dshBootSplash=1` 后回车——注意桌面版 URL 里带 `token=`，所以要接 `&`。

## 永久关闭

```js
localStorage.setItem('dsh.bootSplash.disabled', '1')   // 开启
localStorage.removeItem('dsh.bootSplash.disabled')     // 关闭
```

## 安装

插件是标准的 DSH 双面包：`lib/index.js` 是宿主半边（空 `apply`，只占一个 Loader 行位），`lib/client.js` 是浏览器半边，`dsh.client` 声明让 `dsh-client-modules` 把它作为 `/plugins/<包名>/client.js` 下发。

### 1. 桌面 profile（当前已装，正规 bundle 安装）

desktop profile 由 Electron 独占管理，`dsh plugin` 会拒绝操作，所以用它的包管理器 pnpm 手动完成等价安装：

```powershell
$pnpm = "C:\Users\Awahara\AppData\Local\Programs\DeepSeek Harness\resources\runtime\pnpm\bin\pnpm.cjs"
node $pnpm --dir "C:\Users\Awahara\.dsh\profiles\desktop" add "link:C:/Users/Awahara/Documents/deepseek-harness/default-workspace/dsh-plugin-boot-splash"
```

再把 `dsh-plugin-boot-splash` 追加进 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles`。装完后它是正式 bundle：会出现在侧边栏 **Plugins** 页面的 Installed 列表里，可在 UI 里开关、卸载。卸载就是反向操作：从 bundles 移除、`node $pnpm --dir <profile> remove dsh-plugin-boot-splash`。

> 备选：不想用 pnpm 时，也能只在 `cordis.patch.yml` 里写一行 `file://` 路径加载（见仓库历史/早期版本），但那样不会出现在 Plugins 页面。

### 2. 走官方安装路径（其它 profile，或用 Plugins 页面）

自己管理的 profile 用 CLI：

```powershell
dsh plugin --profile <name> add "C:\Users\Awahara\Documents\deepseek-harness\default-workspace\dsh-plugin-boot-splash"
```

它会把包以 `link:` 装进 profile 的依赖、把 `dsh-plugin-boot-splash` 追加进 `dsh.profile.bundles`，由包自带的 `cordis.patch.yml` 插入 `ui-boot-splash` 行。桌面版则在侧边栏 **Plugins → Add plugin** 里填同一个绝对路径。

### 3. 不安装，先试一下

`_tools/splash-overlay.yml` 是一份临时 overlay，可以把插件挂到系统自带的 `web` profile 上启动，完全不写入任何 profile：

```powershell
dsh web --patch "C:\Users\Awahara\Documents\deepseek-harness\default-workspace\_tools\splash-overlay.yml" --port 19399 --no-open
```

启动后打开它打印的带 token 的 URL 即可。

## 目录

| 文件 | 作用 |
|---|---|
| `package.json` | 包声明：`exports["./client"]`、`dsh.client`（`platform: web`、`immediately: true`）、`dsh.bundle.patch` |
| `cordis.patch.yml` | bundle 补丁：插入 `ui-boot-splash` 行 |
| `lib/index.js` | 宿主半边，空 `apply` |
| `lib/client.js` | 浏览器半边：样式注入、词条注册、`shell.overlay` 槽位占用与动画本体 |
| `locale/{zh,en}.json` | Plugins 页面用的标题与描述 |
| `icon.svg` | Plugins 页面图标 |

## 实现要点

- **挂载点**：注册进 `ui-layout` 在 root 作用域声明的 `shell.overlay` 列表槽（`kind: list`），用 `ctx.slots.inject()` 等声明就绪，不关心 Loader 的行顺序。
- **渲染位置**：组件通过 `react-dom` 的 `createPortal` 直接挂到 `document.body`，因此不会被 AppFrame 的层叠上下文或 `overflow` 裁掉；`z-index: 9000` 高于弹窗层的 1100。
- **样式所有权**：全部规则挂在 `dshbsp-` 前缀下，由 `ctx.effect` 注入 `<style data-dsh-plugin="boot-splash">`，卸载时移除。
- **进度时钟**：用 `performance.now()` 而不是 rAF 回调的时间戳——帧时间戳标记的是帧起点，可能早于 effect 执行时刻，会让第一帧出现负增量、读数为负。
- **文案**：日志行固定为 ASCII 系统输出，随语言变化的只有标语、跳过提示和序列名，走 `ctx.locale.register('bootSplash', { zh, en })`。

## 浏览器侧验证

`_tools/rendertest/smoke.mjs` 用 jsdom + 真 React 18 加载真实的 `lib/client.js`，跑 `apply`、挂载组件、走完跳过与完整播放两条路径：

```powershell
cd _tools\rendertest
node smoke.mjs
```

它检查的内容：bundle 注册与导出、`inject` 声明、样式与词条 effect、注册的槽位名/`order`/`locale`、渲染出的每个 class 都有对应 CSS 规则、日志行与字标数量、进度读数递增到 100、跳过后卸载、同会话不重播、禁用开关生效、卸载后样式移除。

同一目录还有三个真机（headless Chrome）工具，直接渲染 `lib/client.js` 本体：

| 工具 | 作用 |
|---|---|
| `preview.html` | 在浏览器里打开就能完整看一遍动画（用 UMD React + 真实鲸标几何） |
| `shot.mjs` | 用 puppeteer-core 截取 `draw / boot / run / ready` 四个阶段帧到 `shots/` |
| `layout-check.mjs` | 1280×800 / 900×700 / 1440×900 三档视口的几何校验：越界、居中、重叠、进度条与读数一致、鲸标非零尺寸 |

```powershell
cd _tools\rendertest
npm i react@18 react-dom@18 jsdom puppeteer-core   # 首次
node smoke.mjs          # jsdom 逻辑回归
node layout-check.mjs   # 真机几何校验
node shot.mjs           # 出帧
```

`layout-check` 曾抓到过一个真 bug：`.dshbsp-rig svg` 后代选择器把中心鲸标的 `<svg>` 也命中成 `inset:0`，导致鲸标渲染成 0×0——已改为 `.dshbsp-rig > svg` 只作用于刻度环那一层。
