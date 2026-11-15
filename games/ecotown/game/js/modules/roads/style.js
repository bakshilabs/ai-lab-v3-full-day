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
`;
