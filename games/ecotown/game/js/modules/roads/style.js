// The roads module's styles: one string the loader adds to the page once. Every rule starts with #module[data-module="roads"].
import { SLOTS, USE_IDS } from './street.js';

export const P = '#module[data-module="roads"]';
export const css = `
${P} .rd-top { position: absolute; left: 12px; right: 12px; top: 12px; max-width: 760px; display: flex; gap: 10px; align-items: flex-start; padding: 8px 12px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-top b.who { flex: none; padding: 2px 10px; border-radius: 10px; background: #1f7442; color: #fff; font-weight: 800; font-size: .85rem; }
${P} .rd-top p { margin: 0; flex: 1; font-size: 1rem; line-height: 1.3; font-weight: 600; }
${P} .rd-top p small { display: block; margin-top: 3px; font-size: .88rem; font-weight: 600; color: #5e4936; }
${P} button { font: 800 1rem Inter, system-ui, sans-serif; color: #3b2a1e; cursor: pointer; border: 0; border-radius: 12px; min-height: 44px; padding: 6px 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; }
${P} button:focus-visible { outline: 3px solid #1c6fd0; outline-offset: 2px; }
${P} button[disabled] { color: #6f6254; box-shadow: inset 0 0 0 2px #d2c4ac; cursor: default; }
${P} button.go { background: #1f7f49; color: #fff; box-shadow: inset 0 0 0 2px #17603a, 0 3px 0 #124a2d; }
${P} button.go[disabled] { background: #c9d6c6; color: #4c5a4c; box-shadow: inset 0 0 0 2px #aab8a8; }
${P} .rd-say { flex: none; min-width: 44px; padding: 6px; }
${P} .rd-tray { position: absolute; left: 12px; right: 12px; bottom: 12px; margin: 0 auto; max-width: 980px; max-height: 56vh; overflow: auto; padding: 10px 12px; border-radius: 16px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-tray.slim { left: auto; max-width: none; }
${P} .rd-tray h3 { margin: 0 0 6px; font-size: 1rem; line-height: 1.25; }
${P} .rd-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
${P} .rd-row.end { justify-content: flex-end; margin-top: 8px; }
${P} .rd-pal button { display: flex; align-items: center; gap: 6px; }
${P} .rd-pal button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; }
${P} .rd-pal i { font-style: normal; font-weight: 700; color: #5e4936; }
${P} .rd-pal .ico { font-size: max(20px, 1.25rem); line-height: 1; }
${P} .rd-key { display: none; min-width: 1.5em; padding: 0 5px; border-radius: 6px; background: #3b2a1e; color: #fff; font-size: .8rem; font-weight: 800; text-align: center; }
${P}.rd-kbd .rd-key { display: inline-block; }
${P} .rd-keys { display: none; margin-left: 10px; font-weight: 600; }
${P}.rd-kbd .rd-keys { display: inline; }
${P} .chip { display: inline-grid; place-items: center; width: 1.6em; height: 1.6em; border-radius: 50%; color: #fff; font-weight: 800; font-size: .9rem; }
${P} .rd-fleet { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 2px 4px 2px 10px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; font-weight: 800; }
${P} .rd-fleet button { min-width: 44px; padding: 4px; font-size: 1.2rem; }
${P} .rd-strip { margin: 8px 0 0; }
${P} .rd-striphead { margin: 0 0 3px; font-size: .85rem; font-weight: 700; color: #5e4936; }
${P} .rd-marks, ${P} .rd-slots { display: grid; grid-template-columns: repeat(${SLOTS}, minmax(0, 1fr)); gap: 4px; }
${P} .rd-marks span { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 2px 3px; border-radius: 8px 8px 0 0; background: #e2cfa6; font-size: .8rem; font-weight: 800; line-height: 1.05; text-align: center; }
${P} .rd-marks span i { font-style: normal; font-size: max(20px, 1.25rem); line-height: 1; }
${P} .rd-slots { margin-top: 3px; }
${P} .rd-slots button { display: grid; grid-template-rows: auto 1fr; justify-items: center; align-items: center; min-height: 54px; padding: 2px 0 3px; border-radius: 10px; }
${P} .rd-slots .n { font-size: .75rem; font-weight: 700; color: #5e4936; line-height: 1.1; }
${P} .rd-slots .mid { display: flex; align-items: center; gap: 2px; font-size: max(20px, 1.3rem); line-height: 1; color: #6f6254; }
${P} .rd-slots button.has { background: #fff; box-shadow: inset 0 0 0 3px #3b2a1e, 0 3px 0 #7a5a33; }
${P} .rd-slots button.no { background: #cfc6b4; box-shadow: inset 0 0 0 2px #a89c86; }
${P} .rd-hint { margin: 0; flex: 1; min-width: 180px; font-size: .92rem; font-weight: 600; color: #4f3d2d; }
${P} .rd-nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
${P} button.rd-num { display: block; text-align: left; min-height: 0; padding: 7px 10px; border-radius: 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; font-weight: 600; }
${P} .rd-num small { display: block; font-size: .82rem; font-weight: 700; color: #5e4936; }
${P} .rd-num b { display: block; font-size: 1.25rem; font-weight: 800; }
${P} .rd-num em { font-style: normal; font-size: .82rem; font-weight: 800; }
${P} .rd-num.good { box-shadow: inset 0 0 0 3px #2e9b5a; } ${P} .rd-num.good em { color: #1f7442; }
${P} .rd-num.fair { box-shadow: inset 0 0 0 3px #d99a1c; } ${P} .rd-num.fair em { color: #8a5a00; }
${P} .rd-num.poor { box-shadow: inset 0 0 0 3px #c8553d; } ${P} .rd-num.poor em { color: #9a3220; }
${P} button.rd-num[aria-pressed="true"] { background: #ffe9a8; }
${P} .rd-num i { display: block; font-style: normal; font-size: .8rem; color: #5e4936; }
${P} .rd-legend { margin: 6px 0 0; font-size: .85rem; font-weight: 600; color: #5e4936; }
${P} .rd-clock { font-size: 1.3rem; font-weight: 800; min-width: 3.2em; }
${P} .rd-bar { flex: 1; min-width: 100px; height: 12px; border-radius: 6px; background: #d2c4ac; overflow: hidden; } ${P} .rd-bar span { display: block; height: 100%; width: 0; background: #2e9b5a; }
${P} .rd-count { margin: 0; flex: 1 1 100%; font-size: .95rem; font-weight: 700; }
${P} .rd-plots { display: grid; gap: 6px; }
${P} .rd-plot { display: grid; grid-template-columns: 2.6rem repeat(${USE_IDS.length}, minmax(0, 1fr)); gap: 6px; align-items: center; }
${P} .rd-letter { display: grid; place-items: center; height: 2.4rem; border-radius: 10px; background: #1c4fa8; color: #fff; font-size: 1.25rem; font-weight: 800; }
${P} .rd-plot button { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 6px; }
${P} .rd-plot button .ico { font-size: max(20px, 1.3rem); line-height: 1; }
${P} .rd-plot button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; }
${P} .rd-foot { display: flex; gap: 10px; align-items: flex-end; margin-top: 8px; }
${P} .rd-foot .rd-row { margin: 0; flex: none; }
${P} .rd-sum { flex: 1; margin: 0; padding: 0 0 0 18px; font-size: .92rem; font-weight: 600; line-height: 1.3; }
${P} .rd-cap { margin: 0; flex: 1; min-width: 200px; font-size: 1.05rem; font-weight: 700; }
${P}.rd-large .rd-top p, ${P}.rd-large .rd-cap { font-size: 1.15rem; } ${P}.rd-large button { font-size: 1.1rem; }
${P}.rd-large .rd-hint, ${P}.rd-large .rd-sum, ${P}.rd-large .rd-num small, ${P}.rd-large .rd-num em, ${P}.rd-large .rd-num i, ${P}.rd-large .rd-legend, ${P}.rd-large .rd-striphead, ${P}.rd-large .rd-keys, ${P}.rd-large .rd-count { font-size: 1rem; }
${P}.rd-large .rd-marks span { font-size: .95rem; } ${P}.rd-large .rd-marks span i, ${P}.rd-large .rd-slots .mid, ${P}.rd-large .rd-pal .ico, ${P}.rd-large .rd-plot button .ico { font-size: max(24px, 1.5rem); }
${P}.rd-large .rd-slots .n { font-size: .9rem; } ${P}.rd-large .rd-slots button { min-height: 62px; } ${P}.rd-large .chip { font-size: 1.05rem; }
@media (max-width: 820px) { ${P} .rd-marks span { flex-direction: column; gap: 0; } ${P} .rd-plot button { flex-direction: column; gap: 0; font-size: .92rem; } ${P} .rd-foot { flex-direction: column; align-items: stretch; } ${P} .rd-foot .rd-row { justify-content: flex-end; } }
@media (max-height: 620px) { ${P} .rd-tray { max-height: 64vh; padding: 6px 10px; } ${P} .rd-slots button { min-height: 46px; } }
${P} .rd-stage { position: absolute; left: 12px; right: 12px; margin: 0 auto; max-width: 980px; display: flex; flex-direction: column; overflow: auto; padding: 10px 12px; border-radius: 16px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; }
${P} .rd-stage[hidden] { display: none; }
${P} .rd-stage h2 { margin: 2px 0 8px; font-size: 1.35rem; line-height: 1.2; }
${P} .rd-stage h3 { margin: 0 0 8px; font-size: 1.1rem; }
${P} .rd-card { margin: auto; max-width: 640px; text-align: left; } ${P} .rd-card.wide { max-width: 860px; width: 100%; }
${P} .rd-kicker { margin: 0; font-size: .85rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #8a5a00; }
${P} .rd-card.done .rd-kicker { color: #1f7442; }
${P} .rd-job { margin: 0 0 10px; font-size: 1.1rem; font-weight: 600; line-height: 1.4; }
${P} .rd-how, ${P} .rd-now { margin: 0; padding: 10px 12px; border-radius: 12px; background: #f3e4c6; font-size: 1rem; font-weight: 600; line-height: 1.35; }
${P} .rd-now { background: #dff0e2; }
${P} .rd-did { margin: 0 0 10px; padding-left: 20px; font-size: 1rem; font-weight: 600; line-height: 1.4; }
${P} .rd-view, ${P} .rd-map { display: flex; flex-direction: column; flex: 1; min-height: 0; gap: 6px; }
${P} .rd-viewbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
${P} .rd-step { margin-left: auto; font-size: .9rem; font-weight: 800; color: #5e4936; }
${P} .rd-cond { padding: 6px 10px; border-radius: 10px; background: #3b2a1e; color: #fff; font-weight: 800; }
${P} .rd-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
${P} .rd-tabs button[aria-pressed="true"], ${P} .rd-ticks button[aria-pressed="true"], ${P} .rd-labels button[aria-pressed="true"], ${P} .rd-set button[aria-pressed="true"], ${P} .rd-set button[aria-checked="true"], ${P} .rd-opts button[aria-checked="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; }
${P} .rd-tabs .ico, ${P} .rd-ticks .ico, ${P} .rd-labels .ico { font-size: max(20px, 1.2rem); line-height: 1; }
${P} .rd-frame { flex: 1; min-height: 140px; display: flex; justify-content: center; }
${P} .rd-frame svg.rd-pic { width: 100%; height: 100%; max-height: 100%; border-radius: 10px; }
${P} .rd-does { margin: 0; font-size: .95rem; font-weight: 600; color: #4f3d2d; }
${P} .rd-ask { margin: 0 0 8px; font-size: 1.05rem; font-weight: 800; line-height: 1.3; }
${P} .rd-ticks .box { display: inline-block; width: 1.1em; height: 1.1em; border-radius: 4px; box-shadow: inset 0 0 0 2px #3b2a1e; background: #fff; }
${P} .rd-ticks button[aria-pressed="true"] .box { background: #1f7f49; box-shadow: inset 0 0 0 2px #124a2d; }
${P} .rd-ticks button[aria-pressed="true"] .box::after { content: '✓'; display: block; color: #fff; font-size: .9em; line-height: 1.1em; text-align: center; }
${P} .rd-ticks button, ${P} .rd-labels button, ${P} .rd-tabs button { display: inline-flex; align-items: center; gap: 6px; }
${P} .rd-table { width: 100%; border-collapse: separate; border-spacing: 4px; font-size: 1rem; }
${P} .rd-table caption { text-align: left; font-weight: 800; padding-bottom: 4px; }
${P} .rd-table th { text-align: left; font-weight: 800; padding: 6px 8px; }
${P} .rd-table td { text-align: center; padding: 8px; border-radius: 8px; font-weight: 800; background: #f3e4c6; }
${P} .rd-table td.ok { background: #cfe9d6; color: #145a32; } ${P} .rd-table td.no { background: #f6d2c8; color: #8a2a16; }
${P} .rd-table i { font-style: normal; font-weight: 600; font-size: .85rem; color: #5e4936; }
${P} .rd-tests4 tr.ok td:last-child { background: #cfe9d6; color: #145a32; } ${P} .rd-tests4 tr.no td:last-child { background: #f6d2c8; }
${P} .rd-tests4 td button { min-height: 40px; padding: 4px 10px; font-size: .95rem; }
${P} .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
${P} .rd-replay { margin: 8px 0 0; min-height: 1.3em; font-size: 1rem; font-weight: 700; color: #8a2a16; }
${P} .rd-log { margin: 6px 0 0; padding-left: 20px; font-size: .9rem; font-weight: 600; color: #5e4936; }
${P} .rd-hot rect { fill: transparent; stroke: transparent; stroke-width: 4; cursor: pointer; }
${P} .rd-hot.on rect { stroke: #ffd166; stroke-dasharray: 10 6; }
${P} .rd-hot.sel rect { stroke: #1c6fd0; stroke-dasharray: none; stroke-width: 5; }
${P} .rd-hot:focus { outline: none; } ${P} .rd-hot:focus rect { stroke: #1c6fd0; stroke-width: 5; }
${P} .rd-hot text { fill: #fff; paint-order: stroke; stroke: #1f1a17; stroke-width: 5px; }
${P} .rd-count { font-weight: 800; color: #5e4936; }
${P} .rd-tests { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 0; padding: 0; list-style: none; }
${P} .rd-tests li { display: flex; flex-direction: column; gap: 2px; padding: 6px; border-radius: 10px; background: #f3e4c6; }
${P} .rd-tests li.ok { box-shadow: inset 0 0 0 3px #2e9b5a; } ${P} .rd-tests li.no { box-shadow: inset 0 0 0 3px #c8553d; }
${P} .rd-tests li svg { width: 100%; height: 70px; border-radius: 6px; }
${P} .rd-tests li b { font-size: .95rem; } ${P} .rd-tests li small { font-size: .85rem; font-weight: 600; color: #4f3d2d; line-height: 1.25; }
${P} .rd-opts button { display: inline-flex; align-items: center; gap: 6px; }
${P} .rd-rules { margin: 0; padding-left: 24px; font-size: 1.05rem; font-weight: 700; line-height: 1.5; }
${P} .rd-sets { display: grid; gap: 6px; }
${P} .rd-set { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
${P} .rd-set > b { flex: 0 0 13em; font-size: .95rem; }
${P} .rd-set i { font-style: normal; font-size: .8rem; color: #5e4936; }
${P} .rd-big { min-width: 4.5em; text-align: center; font-size: 1.2rem; font-weight: 800; }
${P} .rd-fnums { display: flex; flex-wrap: wrap; gap: 8px; }
${P} .rd-fnums span { flex: 1 1 130px; padding: 6px 10px; border-radius: 10px; background: #f3e4c6; }
${P} .rd-fnums small { display: block; font-size: .82rem; font-weight: 700; color: #5e4936; } ${P} .rd-fnums b { font-size: 1.15rem; }
${P} .rd-map .rd-frame { min-height: 160px; }
${P} svg.rd-chart { width: auto; max-width: 420px; height: 24vh; min-height: 120px; flex: none; align-self: center; border-radius: 8px; }
${P} .rd-hub { margin: auto; width: 100%; max-width: 860px; }
${P} .rd-missions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
${P} .rd-mis { width: 100%; height: 100%; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto 1fr auto; gap: 2px 8px; align-items: center; text-align: left; padding: 10px 12px; }
${P} .rd-mis .rd-mn { grid-row: 1; display: grid; place-items: center; width: 1.8em; height: 1.8em; border-radius: 50%; background: #3b2a1e; color: #fff; font-size: .95rem; }
${P} .rd-mis .ico { grid-row: 1; font-size: max(28px, 1.8rem); line-height: 1; justify-self: start; }
${P} .rd-mis .rd-mt { grid-column: 1 / -1; font-size: 1.02rem; line-height: 1.25; }
${P} .rd-mis .rd-ms { grid-column: 1 / -1; font-size: .9rem; color: #5e4936; }
${P} .rd-mis.done { background: #e4f3e6; box-shadow: inset 0 0 0 2px #2e9b5a, 0 3px 0 #1f6b3e; } ${P} .rd-mis.done .rd-ms { color: #1f7442; }
${P} .rd-mis.next { background: #fff3c9; box-shadow: inset 0 0 0 3px #b23a26, 0 3px 0 #7a5a33; } ${P} .rd-mis.next .rd-ms { color: #9a3220; }
${P} .rd-mis[disabled] { background: #ece3d2; }
${P}.rd-large .rd-job, ${P}.rd-large .rd-how, ${P}.rd-large .rd-now, ${P}.rd-large .rd-did, ${P}.rd-large .rd-ask, ${P}.rd-large .rd-rules { font-size: 1.2rem; } ${P}.rd-large .rd-does, ${P}.rd-large .rd-replay, ${P}.rd-large .rd-log, ${P}.rd-large .rd-tests li small, ${P}.rd-large .rd-set > b, ${P}.rd-large .rd-table { font-size: 1.05rem; } ${P}.rd-large .rd-mis .rd-mt { font-size: 1.15rem; }
@media (max-width: 820px) { ${P} .rd-missions { grid-template-columns: repeat(2, minmax(0, 1fr)); } ${P} .rd-set > b { flex-basis: 100%; } }
${P} .rd-open { display: flex; gap: 16px; align-items: flex-start; }
${P} .rd-bigico { flex: none; display: grid; place-items: center; width: 84px; height: 84px; border-radius: 22px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #b08a55; font-size: 48px; line-height: 1; }
@media (max-width: 600px) { ${P} .rd-bigico { width: 60px; height: 60px; font-size: 34px; } }
`;
