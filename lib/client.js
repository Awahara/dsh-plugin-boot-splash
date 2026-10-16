window.__ModuleLoader__.load({
	id: "dsh-plugin-boot-splash",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const ReactDOM = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;
		//#region styles
		/**
		 * Every rule is namespaced under `dshbsp-` and injected once by `apply`, so
		 * the plugin owns no global selector and leaves nothing behind on unload.
		 * The visual language is a dark HUD: a floor grid receding into the
		 * distance, concentric instrument rings, a self-drawing hexagon, a
		 * monospace boot log, and one cyan accent that carries the whole panel.
		 */
		const CSS = `
.dshbsp-root{
  --dshbsp-cyan:#22d3ee;
  --dshbsp-cyan-dim:rgba(34,211,238,.42);
  --dshbsp-violet:#8b7cff;
  --dshbsp-green:#34d399;
  --dshbsp-ink:#dcf3ff;
  --dshbsp-muted:rgba(150,205,232,.62);
  position:fixed;inset:0;z-index:9000;overflow:hidden;pointer-events:auto;cursor:default;
  background:#02050b;color:var(--dshbsp-ink);
  font-family:ui-monospace,SFMono-Regular,"Cascadia Mono",Consolas,"Liberation Mono",Menlo,monospace;
  font-variant-ligatures:none;-webkit-font-smoothing:antialiased;
  user-select:none;-webkit-user-select:none;
  animation:dshbsp-fadein 300ms ease-out both;
}
.dshbsp-root[data-phase="exit"]{animation:dshbsp-out var(--dshbsp-exit,680ms) cubic-bezier(.4,0,.2,1) forwards;}

/* ---------- backdrop ---------- */
.dshbsp-bg{position:absolute;inset:0;background:
  radial-gradient(120% 80% at 50% 42%,rgba(16,52,74,.85) 0%,rgba(4,10,20,.92) 45%,#02050b 100%);}
.dshbsp-grid{position:absolute;inset:-10% -10% 45% -10%;opacity:.55;
  background-image:
    linear-gradient(rgba(120,200,255,.075) 1px,transparent 1px),
    linear-gradient(90deg,rgba(120,200,255,.075) 1px,transparent 1px);
  background-size:48px 48px;
  animation:dshbsp-grid 5s linear infinite;
  mask-image:radial-gradient(90% 70% at 50% 40%,#000 0%,transparent 78%);
  -webkit-mask-image:radial-gradient(90% 70% at 50% 40%,#000 0%,transparent 78%);}
.dshbsp-floor{position:absolute;left:-60%;right:-60%;bottom:0;height:46%;opacity:.5;
  background-image:
    linear-gradient(rgba(34,211,238,.28) 1px,transparent 1px),
    linear-gradient(90deg,rgba(34,211,238,.18) 1px,transparent 1px);
  background-size:64px 64px;
  transform:perspective(360px) rotateX(76deg);transform-origin:50% 100%;
  animation:dshbsp-floor 2.4s linear infinite;
  mask-image:linear-gradient(to top,#000 0%,transparent 72%);
  -webkit-mask-image:linear-gradient(to top,#000 0%,transparent 72%);}
.dshbsp-glow{position:absolute;left:50%;top:46%;width:132vmin;height:132vmin;transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(34,211,238,.14) 0%,rgba(34,211,238,.05) 34%,transparent 62%);
  pointer-events:none;}
.dshbsp-streams{position:absolute;inset:0;pointer-events:none;}
.dshbsp-stream{position:absolute;top:0;width:1px;height:26vh;opacity:0;
  background:linear-gradient(180deg,transparent,rgba(160,240,255,.9),transparent);
  animation:dshbsp-stream 2.6s linear infinite;pointer-events:none;}
.dshbsp-scan{position:absolute;left:0;right:0;height:24vh;pointer-events:none;
  background:linear-gradient(180deg,transparent 0%,rgba(34,211,238,.08) 44%,rgba(190,245,255,.5) 50%,rgba(34,211,238,.08) 56%,transparent 100%);
  mix-blend-mode:screen;animation:dshbsp-scan 2.9s cubic-bezier(.45,0,.55,1) infinite;}
.dshbsp-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(125% 95% at 50% 50%,transparent 38%,rgba(0,0,0,.72) 100%);}

/* ---------- HUD furniture ---------- */
.dshbsp-top{position:absolute;top:max(20px,3.2vh);left:max(22px,3vw);right:max(22px,3vw);
  display:flex;justify-content:space-between;gap:16px;
  font-size:10.5px;letter-spacing:.3em;color:rgba(140,190,215,.5);
  opacity:0;animation:dshbsp-fadein 600ms 260ms ease-out forwards;}
.dshbsp-top b{color:rgba(196,238,255,.86);font-weight:500;}
.dshbsp-corner{position:absolute;width:30px;height:30px;opacity:0;
  animation:dshbsp-corner 420ms cubic-bezier(.2,.8,.2,1) forwards;}
.dshbsp-corner[data-at="tl"]{top:16px;left:16px;border-top:1px solid var(--dshbsp-cyan-dim);border-left:1px solid var(--dshbsp-cyan-dim);}
.dshbsp-corner[data-at="tr"]{top:16px;right:16px;border-top:1px solid var(--dshbsp-cyan-dim);border-right:1px solid var(--dshbsp-cyan-dim);}
.dshbsp-corner[data-at="bl"]{bottom:16px;left:16px;border-bottom:1px solid var(--dshbsp-cyan-dim);border-left:1px solid var(--dshbsp-cyan-dim);}
.dshbsp-corner[data-at="br"]{bottom:16px;right:16px;border-bottom:1px solid var(--dshbsp-cyan-dim);border-right:1px solid var(--dshbsp-cyan-dim);}

/* ---------- instrument rig ---------- */
.dshbsp-rig{position:absolute;left:50%;top:44%;width:min(58vmin,420px);aspect-ratio:1;
  transform:translate(-50%,-50%);}
.dshbsp-rig > svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
.dshbsp-ring-a,.dshbsp-ring-b,.dshbsp-ring-c{transform-origin:120px 120px;}
.dshbsp-ring-a{animation:dshbsp-spin 9s linear infinite;}
.dshbsp-ring-b{animation:dshbsp-spin-rev 15s linear infinite;}
.dshbsp-ring-c{animation:dshbsp-spin 26s linear infinite;}
.dshbsp-ticks{opacity:0;animation:dshbsp-fadein 700ms 700ms ease-out forwards;}
.dshbsp-hex{stroke-dasharray:408;stroke-dashoffset:408;
  animation:dshbsp-draw 1500ms 240ms cubic-bezier(.34,0,.2,1) forwards;
  filter:drop-shadow(0 0 6px rgba(34,211,238,.45));}
.dshbsp-arc{filter:drop-shadow(0 0 7px rgba(34,211,238,.95));}
.dshbsp-core{position:absolute;left:50%;top:50%;display:grid;place-items:center;
  color:#a9f1ff;
  filter:drop-shadow(0 0 16px rgba(34,211,238,.8)) drop-shadow(0 0 40px rgba(34,211,238,.35));
  animation:dshbsp-core-in 620ms 180ms cubic-bezier(.2,.8,.2,1) both,
            dshbsp-core-pulse 2.6s 900ms ease-in-out infinite;}
.dshbsp-shadowmark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:88px;height:88px;border-radius:50%;
  background:radial-gradient(circle,rgba(34,211,238,.22),transparent 68%);
  animation:dshbsp-breathe 2.6s 900ms ease-in-out infinite;pointer-events:none;}

/* ---------- wordmark ---------- */
.dshbsp-wordmark{position:absolute;left:50%;top:calc(44% + min(29vmin,210px) + 22px);width:max-content;max-width:92vw;
  transform:translateX(-50%);text-align:center;
  filter:drop-shadow(0 0 22px rgba(34,211,238,.35));}
.dshbsp-overline{font-size:10.5px;letter-spacing:.66em;text-indent:.66em;color:rgba(150,215,240,.6);
  opacity:0;animation:dshbsp-fadein 620ms 940ms ease-out forwards;}
.dshbsp-word{display:flex;justify-content:center;margin-top:12px;
  font-size:clamp(26px,5.2vmin,46px);font-weight:600;line-height:1;
  letter-spacing:.16em;text-indent:.16em;}
.dshbsp-letter{color:transparent;
  background-image:linear-gradient(100deg,#5fd8f5 0%,#eafcff 40%,#ffffff 50%,#7fe6ff 62%,#22d3ee 100%);
  background-size:300% 100%;background-position:170% 0;
  -webkit-background-clip:text;background-clip:text;
  opacity:0;animation:dshbsp-letter 560ms cubic-bezier(.2,.75,.2,1) forwards,
            dshbsp-sheen 2.6s 1200ms ease-in-out infinite;}
.dshbsp-rule{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;
  opacity:0;animation:dshbsp-fadein 700ms 1500ms ease-out forwards;}
.dshbsp-rule i{display:block;height:1px;width:14vmin;max-width:120px;
  background:linear-gradient(90deg,transparent,var(--dshbsp-cyan-dim),transparent);}
.dshbsp-tagline{font-size:10.5px;letter-spacing:.34em;text-indent:.34em;color:var(--dshbsp-muted);white-space:nowrap;}

/* ---------- boot log ---------- */
.dshbsp-log{position:absolute;left:max(22px,3vw);bottom:calc(max(30px,5.4vh) + 30px);
  display:flex;flex-direction:column;gap:5px;
  font-size:11.5px;line-height:1.45;color:rgba(150,205,232,.7);}
.dshbsp-logline{display:flex;align-items:center;gap:9px;white-space:nowrap;
  opacity:0;transform:translateX(-7px);animation:dshbsp-line 340ms ease-out forwards;}
.dshbsp-caret{color:rgba(34,211,238,.85);}
.dshbsp-logstatus{color:var(--dshbsp-green);border:1px solid rgba(52,211,153,.34);border-radius:2px;
  padding:0 5px;font-size:10px;letter-spacing:.14em;}
.dshbsp-logstatus[data-tone="info"]{color:rgba(178,214,235,.8);border-color:rgba(178,214,235,.24);}
.dshbsp-logstatus[data-tone="warn"]{color:#fbbf24;border-color:rgba(251,191,36,.3);}
.dshbsp-logsuffix{margin-left:auto;color:rgba(130,180,210,.45);letter-spacing:.12em;}

/* ---------- progress HUD ---------- */
.dshbsp-hud{position:absolute;left:50%;bottom:max(30px,5.4vh);transform:translateX(-50%);
  width:min(620px,78vw);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;
  font-size:10.5px;letter-spacing:.24em;color:rgba(140,190,215,.55);
  opacity:0;animation:dshbsp-fadein 600ms 420ms ease-out forwards;}
.dshbsp-bar{position:relative;height:2px;background:rgba(120,200,255,.14);overflow:hidden;}
.dshbsp-bar span{position:absolute;top:0;bottom:0;left:0;
  background:linear-gradient(90deg,#0e7490,#22d3ee 70%,#bdf3ff);
  box-shadow:0 0 12px rgba(34,211,238,.9);transition:width 90ms linear;}
.dshbsp-readout{display:flex;align-items:baseline;gap:8px;justify-content:flex-end;
  font-variant-numeric:tabular-nums;color:rgba(196,238,255,.82);}
.dshbsp-readout em{font-style:normal;font-size:9.5px;color:rgba(140,190,215,.5);letter-spacing:.2em;}
.dshbsp-skip{position:absolute;right:max(22px,3vw);bottom:calc(max(30px,5.4vh) + 30px);
  font-size:10.5px;letter-spacing:.22em;color:rgba(140,190,215,.5);
  opacity:0;animation:dshbsp-fadein 600ms 1400ms ease-out forwards,
            dshbsp-blink 2s 1800ms ease-in-out infinite;}

/* ---------- exit ---------- */
.dshbsp-wipe{position:absolute;left:-10%;right:-10%;top:50%;height:38vh;
  transform:translateY(-50%) scaleY(0);opacity:0;pointer-events:none;mix-blend-mode:screen;
  background:linear-gradient(180deg,transparent 0%,rgba(34,211,238,.75) 34%,rgba(235,253,255,.96) 50%,rgba(34,211,238,.75) 66%,transparent 100%);
  filter:blur(2px);}
.dshbsp-root[data-phase="exit"] .dshbsp-wipe{animation:dshbsp-wipe var(--dshbsp-exit,680ms) cubic-bezier(.5,0,.6,1) forwards;}
.dshbsp-root[data-phase="exit"] .dshbsp-log,
.dshbsp-root[data-phase="exit"] .dshbsp-skip,
.dshbsp-root[data-phase="exit"] .dshbsp-wordmark{animation:dshbsp-fadeout 240ms ease-in forwards;}

/* ---------- keyframes ---------- */
@keyframes dshbsp-fadein{from{opacity:0}to{opacity:1}}
@keyframes dshbsp-fadeout{to{opacity:0}}
@keyframes dshbsp-out{to{opacity:0;transform:scale(1.045);filter:blur(3px)}}
@keyframes dshbsp-grid{from{background-position:0 0,0 0}to{background-position:0 48px,48px 0}}
@keyframes dshbsp-floor{from{background-position:0 0,0 0}to{background-position:0 64px,64px 0}}
@keyframes dshbsp-scan{0%{transform:translateY(-26vh);opacity:0}
  10%{opacity:1}90%{opacity:1}100%{transform:translateY(108vh);opacity:0}}
@keyframes dshbsp-stream{0%{transform:translateY(-30vh);opacity:0}
  12%{opacity:.9}88%{opacity:.9}100%{transform:translateY(114vh);opacity:0}}
@keyframes dshbsp-spin{to{transform:rotate(360deg)}}
@keyframes dshbsp-spin-rev{to{transform:rotate(-360deg)}}
@keyframes dshbsp-draw{to{stroke-dashoffset:0}}
@keyframes dshbsp-core-in{from{opacity:0;transform:translate(-50%,-50%) scale(.78)}
  to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes dshbsp-core-pulse{0%,100%{opacity:.88}50%{opacity:1}}
@keyframes dshbsp-breathe{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.94)}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}}
@keyframes dshbsp-letter{from{opacity:0;transform:translateY(11px);filter:blur(5px)}
  to{opacity:1;transform:none;filter:blur(0)}}
@keyframes dshbsp-sheen{0%{background-position:170% 0}100%{background-position:-70% 0}}
@keyframes dshbsp-line{to{opacity:1;transform:none}}
@keyframes dshbsp-corner{from{opacity:0;transform:scale(.55)}to{opacity:.9;transform:none}}
@keyframes dshbsp-blink{0%,100%{opacity:.35}50%{opacity:.85}}
@keyframes dshbsp-wipe{0%{transform:translateY(-50%) scaleY(0);opacity:0}
  22%{transform:translateY(-50%) scaleY(.22);opacity:.95}
  46%{transform:translateY(-50%) scaleY(1);opacity:1}
  100%{transform:translateY(-50%) scaleY(1);opacity:0}}

@media (prefers-reduced-motion: reduce){
  .dshbsp-grid,.dshbsp-floor,.dshbsp-scan,.dshbsp-stream,
  .dshbsp-ring-a,.dshbsp-ring-b,.dshbsp-ring-c,.dshbsp-core,
  .dshbsp-shadowmark,.dshbsp-letter{animation:none !important}
  .dshbsp-letter{opacity:1;background-position:50% 0}
  .dshbsp-hex{stroke-dashoffset:0}
}
`;
		//#endregion
		//#region boot log
		/**
		 * The log reads as machine output: ASCII only, so the panel looks the same
		 * in every locale while the tagline and hint still translate.
		 */
		const LOG_LINES = [
			{ at: 0.05, text: "dsh kernel", suffix: "cold start", status: "ok", tone: "ok" },
			{ at: 0.16, text: "resolve plugin graph", suffix: "42 modules", status: "linked", tone: "info" },
			{ at: 0.27, text: "mount ui.renderer", suffix: "root slot", status: "ok", tone: "ok" },
			{ at: 0.38, text: "attach session bus", suffix: "sse", status: "online", tone: "ok" },
			{ at: 0.49, text: "agent loop", suffix: "standby", status: "armed", tone: "info" },
			{ at: 0.6, text: "sandbox policy", suffix: "workspace-write", status: "ok", tone: "ok" },
			{ at: 0.71, text: "context window", suffix: "128k", status: "nominal", tone: "ok" },
			{ at: 0.82, text: "all systems", suffix: "handshake", status: "ready", tone: "ok" }
		];
		const WORDMARK = "HARNESS";
		//#endregion
		//#region runtime flags
		/** Session flag: the intro is an opening sequence, so one tab plays it once. */
		const SEEN_KEY = "dsh.bootSplash.seen";
		/** `?dshBootSplash=1` forces a replay without clearing storage. */
		const FORCE_PARAM = "dshBootSplash";
		/** A hard off switch for a machine that never wants the intro. */
		const DISABLE_KEY = "dsh.bootSplash.disabled";

		function prefersReducedMotion() {
			try {
				return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			} catch {
				return false;
			}
		}
		function readFlag(storeName, key) {
			try {
				return window[storeName].getItem(key) === "1";
			} catch {
				return false;
			}
		}
		function writeFlag(storeName, key) {
			try {
				window[storeName].setItem(key, "1");
			} catch {
				/* storage denied: the intro simply plays again next load */
			}
		}
		function forced() {
			try {
				return new URLSearchParams(window.location.search).has(FORCE_PARAM);
			} catch {
				return false;
			}
		}
		/** Whether this page load should play the intro at all. */
		function shouldPlay() {
			if (readFlag("localStorage", DISABLE_KEY) && !forced()) return false;
			if (readFlag("sessionStorage", SEEN_KEY) && !forced()) return false;
			return true;
		}
		//#endregion
		//#region helpers
		/** Monotonic ease so the readout never stalls or steps backwards. */
		function easeOutCubic(t) {
			return 1 - Math.pow(1 - t, 3);
		}
		function pad3(value) {
			return String(Math.max(0, Math.min(value, 999))).padStart(3, "0");
		}
		function ticks() {
			const marks = [
				[120, 4, 120, 18],
				[120, 222, 120, 236],
				[4, 120, 18, 120],
				[222, 120, 236, 120]
			];
			return marks.map(([x1, y1, x2, y2], index) =>
				h("line", { key: index, x1, y1, x2, y2 })
			);
		}
		function streams(reduced) {
			const lanes = [
				{ left: "17%", delay: "0ms", duration: "2.4s" },
				{ left: "34%", delay: "620ms", duration: "3.1s" },
				{ left: "63%", delay: "280ms", duration: "2.7s" },
				{ left: "78%", delay: "980ms", duration: "3.4s" },
				{ left: "91%", delay: "460ms", duration: "2.2s" }
			];
			return lanes.map((lane, index) =>
				h("i", {
					key: index,
					className: "dshbsp-stream",
					style: {
						left: lane.left,
						animationDelay: lane.delay,
						animationDuration: reduced ? "0s" : lane.duration
					}
				})
			);
		}
		//#endregion
		//#region component
		/**
		 * The intro itself. It owns one timeline, one progress readout, and one
		 * exit transition, and it disappears entirely once the sequence ends:
		 * there is no idle animation left running over the application.
		 * @param props - framework props; `t` is the registered locale namespace.
		 * @returns the portal-rendered overlay, or null when the intro is over.
		 */
		function BootSplash(props) {
			const t = props.t;
			const reduced = React.useMemo(prefersReducedMotion, []);
			const [active] = React.useState(shouldPlay);
			const [phase, setPhase] = React.useState("enter");
			const [pct, setPct] = React.useState(0);
			const [clock, setClock] = React.useState(0);
			const [skipped, setSkipped] = React.useState(false);
			const [done, setDone] = React.useState(false);
			const duration = reduced ? 1400 : 3800;
			const exitMs = skipped ? 190 : reduced ? 340 : 700;

			React.useEffect(() => {
				if (!active || done) return;
				writeFlag("sessionStorage", SEEN_KEY);
				const start = performance.now();
				let raf = 0;
				/**
				 * Read the clock instead of the frame timestamp: a frame's timestamp
				 * marks the frame's start, which can precede this effect, and a
				 * negative first delta would drive the readout below zero.
				 */
				const step = () => {
					const elapsedMs = Math.max(performance.now() - start, 0);
					const progress = Math.min(elapsedMs / duration, 1);
					setPct(Math.round(easeOutCubic(progress) * 100));
					setClock(elapsedMs / 1000);
					if (progress < 1) raf = requestAnimationFrame(step);
					else setPhase("exit");
				};
				raf = requestAnimationFrame(step);
				return () => cancelAnimationFrame(raf);
			}, [active, done, duration]);

			React.useEffect(() => {
				if (!active || done || phase === "exit") return;
				const skip = (event) => {
					if (event.type === "keydown" && event.code !== "Escape" && event.code !== "Space" && event.code !== "Enter") return;
					event.preventDefault();
					event.stopPropagation();
					setSkipped(true);
					setPhase("exit");
				};
				document.addEventListener("pointerdown", skip, true);
				document.addEventListener("keydown", skip, true);
				return () => {
					document.removeEventListener("pointerdown", skip, true);
					document.removeEventListener("keydown", skip, true);
				};
			}, [active, done, phase]);

			React.useEffect(() => {
				if (phase !== "exit") return;
				const timer = setTimeout(() => setDone(true), exitMs);
				return () => clearTimeout(timer);
			}, [phase, exitMs]);

			if (!active || done) return null;

			const arc = 2 * Math.PI * 68;
			const elapsed = clock.toFixed(1);
			const overlay = h(
				"div",
				{
					className: "dshbsp-root",
					"data-phase": phase,
					"aria-hidden": "true",
					style: { "--dshbsp-exit": exitMs + "ms" }
				},
				h("div", { className: "dshbsp-bg" }),
				h("div", { className: "dshbsp-grid" }),
				h("div", { className: "dshbsp-floor" }),
				h("div", { className: "dshbsp-glow" }),
				h.apply(null, ["div", { className: "dshbsp-streams" }].concat(streams(reduced))),
				h("div", { className: "dshbsp-scan" }),
				h("div", { className: "dshbsp-vignette" }),
				["tl", "tr", "bl", "br"].map((at, index) =>
					h("i", {
						key: at,
						className: "dshbsp-corner",
						"data-at": at,
						style: { animationDelay: 120 + index * 90 + "ms" }
					})
				),
				h(
					"div",
					{ className: "dshbsp-top" },
					h("span", null, "DEEPSEEK HARNESS ", h("b", null, "// WEB RUNTIME")),
					h("span", null, "T+", elapsed, "s")
				),
				h(
					"div",
					{ className: "dshbsp-rig" },
					h(
						"svg",
						{ viewBox: "0 0 240 240", fill: "none" },
						h("g", { className: "dshbsp-ticks", stroke: "rgba(34,211,238,.6)", strokeWidth: "1" }, ticks()),
						h("circle", {
							className: "dshbsp-ring-c",
							cx: 120,
							cy: 120,
							r: 110,
							stroke: "rgba(34,211,238,.16)",
							strokeWidth: 1,
							strokeDasharray: "58 26"
						}),
						h("circle", {
							className: "dshbsp-ring-b",
							cx: 120,
							cy: 120,
							r: 96,
							stroke: "rgba(139,124,255,.45)",
							strokeWidth: 1,
							strokeDasharray: "22 12"
						}),
						h("circle", {
							className: "dshbsp-ring-a",
							cx: 120,
							cy: 120,
							r: 82,
							stroke: "rgba(34,211,238,.42)",
							strokeWidth: 1,
							strokeDasharray: "3 7"
						}),
						h("circle", { cx: 120, cy: 120, r: 68, stroke: "rgba(34,211,238,.13)", strokeWidth: 6 }),
						h("circle", {
							className: "dshbsp-arc",
							cx: 120,
							cy: 120,
							r: 68,
							stroke: "#22d3ee",
							strokeWidth: 2.5,
							strokeLinecap: "round",
							strokeDasharray: String(arc),
							strokeDashoffset: String(arc * (1 - pct / 100)),
							transform: "rotate(-90 120 120)"
						}),
						h("path", {
							className: "dshbsp-hex",
							d: "M120 52 L178.9 86 L178.9 154 L120 188 L61.1 154 L61.1 86 Z",
							stroke: "rgba(34,211,238,.85)",
							strokeWidth: 1.5,
							strokeLinejoin: "round"
						})
					),
					h("div", { className: "dshbsp-shadowmark" }),
					h("div", { className: "dshbsp-core" }, h(primitives.FishLogo, { size: 62 }))
				),
				h(
					"div",
					{ className: "dshbsp-wordmark" },
					h("div", { className: "dshbsp-overline" }, "DEEPSEEK"),
					h(
						"div",
						{ className: "dshbsp-word" },
						WORDMARK.split("").map((letter, index) =>
							h("span", {
								key: index,
								className: "dshbsp-letter",
								style: { animationDelay: 620 + index * 62 + "ms, " + (1200 + index * 62) + "ms" },
								children: letter
							})
						)
					),
					h(
						"div",
						{ className: "dshbsp-rule" },
						h("i", null),
						h("span", { className: "dshbsp-tagline" }, t("tagline")),
						h("i", null)
					)
				),
				h(
					"div",
					{ className: "dshbsp-log" },
					LOG_LINES.map((line, index) =>
						h(
							"div",
							{
								key: index,
								className: "dshbsp-logline",
								style: { animationDelay: Math.round(line.at * duration) + "ms" }
							},
							h("span", { className: "dshbsp-caret" }, ">"),
							h("span", null, line.text),
							h("span", { className: "dshbsp-logsuffix" }, line.suffix),
							h("span", { className: "dshbsp-logstatus", "data-tone": line.tone }, line.status)
						)
					)
				),
				h("div", { className: "dshbsp-skip" }, t("skip")),
				h(
					"div",
					{ className: "dshbsp-hud" },
					h("span", null, t("sequence")),
					h("span", { className: "dshbsp-bar" }, h("span", { style: { width: pct + "%" } })),
					h(
						"span",
						{ className: "dshbsp-readout" },
						h("span", null, pad3(pct)),
						h("em", null, "%")
					)
				),
				h("div", { className: "dshbsp-wipe" })
			);
			const host = typeof document === "undefined" ? null : document.body;
			if (host === null || ReactDOM === undefined || typeof ReactDOM.createPortal !== "function") return overlay;
			return ReactDOM.createPortal(overlay, host);
		}
		//#endregion
		//#region locales
		/** Copy owned by this plugin; the log lines above stay locale-independent. */
		const zh = {
			tagline: "智能体运行时 · 已就绪",
			skip: "点击任意位置跳过",
			sequence: "序列 07 · 冷启动"
		};
		const en = {
			tagline: "AGENT RUNTIME · READY",
			skip: "CLICK ANYWHERE TO SKIP",
			sequence: "SEQ 07 · COLD BOOT"
		};
		//#endregion
		//#region plugin
		/** Required services: the slot registry and the locale seat. */
		const inject = ["slots", "locale"];
		/**
		 * Client plugin body: inject the stylesheet, register the dictionary, and
		 * occupy the layout's root-scoped overlay list. The overlay waits on the
		 * declaration, so the intro works however the shell orders its rows.
		 * @param ctx - Client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.dshPlugin = "boot-splash";
				style.textContent = CSS;
				document.head.append(style);
				return () => style.remove();
			}, "boot-splash: styles");
			ctx.effect(() => ctx.locale.register("bootSplash", { zh, en }), "boot-splash: dictionary");
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register(
					{
						name: "shell.overlay",
						id: "boot-splash",
						order: 1000,
						locale: "bootSplash"
					},
					BootSplash
				)
			);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
