// Drones at work: the styles of the flying read-outs and the on-screen pad (fly3d.js). No three.js here, so the
// module's index can import it in Node.
const M = '#module[data-module="drone"]';
export const FLY_CSS = `
${M} .df-hud { position: absolute; left: 12px; bottom: 14px; width: min(400px, calc(100% - 300px)); display: grid; gap: 8px; background: #fffaf0; border-radius: 16px; padding: 10px 14px; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; font-weight: 700; }
${M} .df-hud[hidden], ${M} .df-pad[hidden] { display: none; }
${M} .df-task { font-size: 1.05em; line-height: 1.3; font-weight: 800; }
${M} .df-read { display: grid; gap: 6px; font-size: .95em; }
${M} .df-meter { display: grid; grid-template-columns: 5.5em minmax(0, 1fr) auto; align-items: center; gap: 8px; }
${M} .df-bar { position: relative; height: 16px; border-radius: 8px; background: #f3e6cc; box-shadow: inset 0 0 0 2px #b08a55; overflow: hidden; }
${M} .df-bar i { position: absolute; left: 0; top: 0; bottom: 0; background: #1f6fd0; }
${M} .df-bar .band { position: absolute; top: 0; bottom: 0; background: #7cc06a; opacity: 1; }
${M} .df-bar .mark { position: absolute; top: -2px; bottom: -2px; width: 4px; margin-left: -2px; background: #3b2a1e; }
${M} .df-bar.good i { background: #2e9b5a; } ${M} .df-bar.bad i { background: #d2452d; }
${M} .df-wind { display: flex; align-items: center; gap: 8px; }
${M} .df-wind b { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #e3effb; color: #1f6fd0; font-size: 1.4em; }
${M} .df-warn { padding: 4px 10px; border-radius: 10px; background: #d2452d; color: #fff; }
${M} .df-pad { position: absolute; right: 14px; bottom: 14px; display: grid; grid-template-columns: repeat(3, 64px) 12px 72px; grid-template-rows: repeat(2, 64px); gap: 6px; touch-action: none; user-select: none; -webkit-user-select: none; }
${M} .df-pad button { border: 0; border-radius: 16px; background: #fffaf0; color: #3b2a1e; font-size: 1.6em; line-height: 1; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; cursor: pointer; touch-action: none; display: grid; place-items: center; }
${M} .df-pad button small { display: block; font-size: .45em; font-weight: 800; }
${M} .df-pad button.on, ${M} .df-pad button:active { background: #ffe08a; }
${M} .df-pad [data-df="n"] { grid-column: 2; grid-row: 1; } ${M} .df-pad [data-df="w"] { grid-column: 1; grid-row: 2; }
${M} .df-pad [data-df="s"] { grid-column: 2; grid-row: 2; } ${M} .df-pad [data-df="e"] { grid-column: 3; grid-row: 2; }
${M} .df-pad [data-df="up"] { grid-column: 5; grid-row: 1; background: #e6f5df; } ${M} .df-pad [data-df="down"] { grid-column: 5; grid-row: 2; background: #fdebd2; }
@media (max-width: 760px) {
  ${M} .df-hud { width: auto; right: 12px; bottom: 160px; }
}
`;
