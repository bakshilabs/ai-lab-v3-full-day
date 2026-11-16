// Power control room: the module's styles (every rule starts with #module[data-module="power"], docs/MODULES.md).
const P = '#module[data-module="power"]';
export const css = `
${P} { --pw-fs: 16px; }
${P}.pw-large { --pw-fs: 19px; }
${P} .pw-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; font-size: var(--pw-fs); touch-action: manipulation; }
${P} .pw-win { position: relative; flex: 1 1 auto; min-height: 150px; }
${P} .pw-win::before { content: ''; position: absolute; inset: 0; border: 12px solid #8a6238; border-bottom-width: 16px; border-radius: 0 0 22px 22px; box-shadow: inset 0 0 0 3px #5e4124, inset 0 0 0 6px #c79a62; pointer-events: none; }
${P} .pw-plate { position: absolute; right: 26px; top: 24px; display: grid; justify-items: end; gap: 0; padding: 6px 14px 8px; min-width: 7.2em; border-radius: 14px; background: #2b3358; color: #fff; box-shadow: inset 0 0 0 2px #151a33, 0 4px 0 #151a33; }
${P} .pw-label { position: absolute; left: 26px; bottom: 26px; padding: 4px 12px; border-radius: 9px; background: #c79a62; color: #3b2a1e; font: 800 .8em Bricolage, Inter, system-ui, sans-serif; letter-spacing: .04em; text-transform: uppercase; box-shadow: inset 0 0 0 2px #8a6238, 0 2px 0 #5e4124; }
${P} .pw-plate b { font: 800 .85em Inter, system-ui, sans-serif; letter-spacing: .02em; color: #ffd66b; }
${P} .pw-plate span { font: 800 1.45em Bricolage, Inter, system-ui, sans-serif; font-variant-numeric: tabular-nums; line-height: 1.15; white-space: nowrap; }
${P} .pw-prog { justify-self: stretch; margin-top: 3px; display: block; height: 6px; border-radius: 3px; background: #4a5384; overflow: hidden; } ${P} .pw-prog u { display: block; height: 100%; width: 0; background: #ffd66b; }
${P} .pw-prog[hidden] { display: none; }
${P} .pw-top { position: absolute; left: 230px; right: 200px; top: 22px; max-width: 720px; display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 4px 0 #7a5a33; font-size: var(--pw-fs); }
${P} .pw-top b.who { flex: none; padding: 2px 10px; border-radius: 10px; background: #2e9b5a; color: #fff; font-weight: 800; font-size: .85em; }
${P} .pw-top p { margin: 0; flex: 1; font-size: 1em; line-height: 1.35; font-weight: 600; }
${P} .pw-top p small { display: block; margin-top: 4px; font-size: .88em; font-weight: 600; color: #5e4936; }
${P} button { font: 800 1em Inter, system-ui, sans-serif; color: #3b2a1e; cursor: pointer; border: 0; border-radius: 12px; min-height: 44px; padding: 6px 12px; background: #fffaf0; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; }
${P} button:focus-visible { outline: 3px solid #1c6fd0; outline-offset: 2px; }
${P} button[disabled] { color: #8a7a6a; box-shadow: inset 0 0 0 2px #d2c4ac; cursor: default; }
${P} button.go { background: #2e9b5a; color: #fff; box-shadow: inset 0 0 0 2px #1f7442, 0 3px 0 #1a5a34; }
${P} button.go[disabled] { background: #c9d6c6; color: #5c6b5c; box-shadow: inset 0 0 0 2px #aab8a8; }
${P} .pw-say { flex: none; min-width: 44px; padding: 6px; }
${P} .pw-desk { --side: minmax(210px, 250px); flex: none; display: grid; grid-template-columns: var(--side) minmax(0, 1fr) minmax(190px, 236px); gap: 10px; padding: 10px 12px 12px; max-height: 58vh; background: #e7cf9f; box-shadow: inset 0 3px 0 #f6e6c2, inset 0 0 0 2px #b08a55; border-top: 4px solid #7a5a33; }
${P} .pw-desk > div { min-width: 0; min-height: 0; border-radius: 14px; background: #f3e4c6; box-shadow: inset 0 0 0 2px #c9a871; padding: 8px 10px; }
${P} .pw-dials { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-content: start; }
${P} .pw-dial { display: grid; justify-items: center; padding: 4px 2px 5px; border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; text-align: center; }
${P} .pw-dial svg { width: 74px; height: auto; display: block; }
${P} .pw-dial b { font-size: .8em; line-height: 1.1; color: #5e4936; }
${P} .pw-dial span { font: 800 1em Bricolage, Inter, system-ui, sans-serif; line-height: 1.15; white-space: nowrap; }
${P} .pw-dial.alert { box-shadow: inset 0 0 0 3px #b5432c; } ${P} .pw-dial.alert span { color: #9a3220; }
${P} .pw-needle, ${P} .pw-arc { transition: transform .45s ease, stroke-dashoffset .45s ease; transform-origin: 50px 54px; }
${P}.pw-still .pw-needle, ${P}.pw-still .pw-arc, ${P}.pw-still .pw-bars u, ${P}.pw-fast .pw-needle, ${P}.pw-fast .pw-arc, ${P}.pw-fast .pw-bars u { transition: none; }
${P} .pw-bars { grid-column: 1 / -1; display: grid; gap: 4px; padding: 6px 8px; border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; }
${P} .pw-bars div { display: grid; grid-template-columns: 7.8em 1fr auto; align-items: center; gap: 6px; font-size: .8em; font-weight: 700; color: #5e4936; }
${P} .pw-bars i { display: block; height: 12px; border-radius: 6px; background: #e6d3b0; overflow: hidden; } ${P} .pw-bars u { display: block; height: 100%; width: 0; border-radius: 6px; transition: width .45s ease; }
${P} .pw-bars em { font-style: normal; font-weight: 800; color: #3b2a1e; min-width: 1.5em; text-align: right; font-variant-numeric: tabular-nums; }
${P} .pw-bars p { margin: 0; font-size: .8em; font-weight: 800; text-align: center; } ${P} .pw-bars p.spare { color: #1f7442; } ${P} .pw-bars p.short { color: #9a3220; }
${P} .pw-screen { overflow: auto; display: flex; flex-direction: column; gap: 6px; }
${P} .pw-screen h3 { margin: 0; font: 800 1.05em Bricolage, Inter, system-ui, sans-serif; }
${P} .pw-screen h3 small { font: 700 .8em Inter, system-ui, sans-serif; color: #5e4936; margin-left: 8px; }
${P} .pw-chart { border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; padding: 6px 6px 2px; }
${P} .pw-chart svg { display: block; width: 100%; height: auto; max-height: 30vh; }
${P} .pw-key svg { display: block; width: min(100%, 420px); height: auto; }
${P} .pw-lines { margin: 0; padding: 0; list-style: none; font-size: .95em; font-weight: 600; line-height: 1.35; } ${P} .pw-lines li + li { margin-top: 2px; }
${P} .pw-lines li.fix { color: #1f5f8a; font-weight: 800; } ${P} .pw-lines li.note { color: #5e4936; font-size: .92em; }
${P} .pw-ctl { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
${P} .pw-ctl h4 { margin: 0; font: 800 .95em Bricolage, Inter, system-ui, sans-serif; text-align: center; }
${P} .pw-ctl p { margin: 0; font-size: .85em; font-weight: 600; color: #5e4936; text-align: center; line-height: 1.3; }
${P} .pw-modes { display: flex; flex-direction: column; gap: 7px; }
${P} .pw-modes button { display: grid; grid-template-columns: 1.9em 1fr 1.2em; align-items: center; column-gap: 6px; text-align: left; min-height: 58px; padding: 6px 10px; font-size: 1.1em; }
${P} .pw-modes button i { font-style: normal; font-size: 1.35em; grid-row: 1 / span 2; }
${P} .pw-modes button small { grid-column: 2; display: block; font-size: .7em; font-weight: 600; color: #5e4936; line-height: 1.2; }
${P} .pw-modes button u { grid-row: 1 / span 2; grid-column: 3; text-decoration: none; font-size: 1em; visibility: hidden; }
${P} .pw-modes button[aria-pressed="true"] { transform: translateY(2px); } ${P} .pw-modes button[aria-pressed="true"] u { visibility: visible; }
${P} .pw-modes button[data-mode="charge"][aria-pressed="true"] { background: #e7dcfa; box-shadow: inset 0 0 0 4px #7a48c9, 0 1px 0 #4f2b8c; }
${P} .pw-modes button[data-mode="hold"][aria-pressed="true"] { background: #e4e7ee; box-shadow: inset 0 0 0 4px #5a6480, 0 1px 0 #3b4258; }
${P} .pw-modes button[data-mode="use"][aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 4px #c8553d, 0 1px 0 #8a3a2a; }
${P} .pw-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; } ${P} .pw-row.end { justify-content: flex-end; } ${P} .pw-row > button { flex: 1 1 auto; }
${P} .pw-how { margin: 0; font-size: .88em; font-weight: 600; color: #5e4936; }
${P} ol.pw-rules { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
${P} ol.pw-rules li { display: grid; grid-template-columns: 1.7em minmax(0, 1.25fr) auto minmax(0, 1fr) auto; align-items: center; gap: 6px; }
${P} .pw-n { display: grid; place-items: center; width: 1.7em; height: 1.7em; border-radius: 50%; background: #3b2a1e; color: #fff; font-weight: 800; font-size: .9em; }
${P} .pw-tile { display: flex; align-items: center; gap: 8px; text-align: left; min-height: 50px; padding: 5px 10px; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; line-height: 1.2; }
${P} .pw-tile i { font-style: normal; font-size: 1.25em; flex: none; } ${P} .pw-tile small { display: block; font-size: .68em; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #46617f; }
${P} .pw-tile.then { background: #fff3cf; box-shadow: inset 0 0 0 2px #d9a441, 0 3px 0 #b07f22; } ${P} .pw-tile.then small { color: #7a5a1e; }
${P} .pw-arrow { font-weight: 800; color: #5e4936; }
${P} .pw-ops { display: flex; gap: 4px; } ${P} .pw-ops button { min-width: 44px; padding: 4px; }
${P} ol.pw-rules li.pw-else { grid-template-columns: 1.7em 1fr; font-size: .9em; font-weight: 700; color: #5e4936; } ${P} li.pw-else .pw-n { background: #b9a888; }
${P} .pw-pick { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 7px; }
${P} .pw-pick button { display: grid; grid-template-columns: 1.6em 1fr; column-gap: 6px; align-items: center; text-align: left; min-height: 54px; padding: 5px 10px; line-height: 1.2; background: #e3effb; box-shadow: inset 0 0 0 2px #7fb0e6, 0 3px 0 #5b8dc4; }
${P} .pw-pick.then button { background: #fff3cf; box-shadow: inset 0 0 0 2px #d9a441, 0 3px 0 #b07f22; }
${P} .pw-pick button i { font-style: normal; font-size: 1.3em; grid-row: 1 / span 2; } ${P} .pw-pick button small { grid-column: 2; font-size: .72em; font-weight: 600; color: #5e4936; }
${P} .pw-pick button[aria-current="true"] { box-shadow: inset 0 0 0 4px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-toggle { display: grid; grid-template-columns: 1.6em 1fr auto; align-items: center; gap: 6px; text-align: left; line-height: 1.2; font-size: .92em; }
${P} .pw-toggle small { display: block; font-size: .82em; font-weight: 600; color: #5e4936; margin-top: 2px; }
${P} .pw-toggle em { font-style: normal; padding: 2px 8px; border-radius: 9px; background: #d2c4ac; color: #3b2a1e; font-size: .9em; }
${P} .pw-toggle[aria-pressed="true"] { background: #dff3e4; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #1a5a34; } ${P} .pw-toggle[aria-pressed="true"] em { background: #2e9b5a; color: #fff; }
${P} .pw-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
${P} .pw-tabs button { display: grid; gap: 1px; padding: 5px 8px; text-align: left; line-height: 1.2; font-size: .92em; } ${P} .pw-tabs button small { font-size: .82em; font-weight: 700; color: #5e4936; }
${P} .pw-tabs button[aria-pressed="true"] { background: #ffe9a8; box-shadow: inset 0 0 0 3px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-tabs button .tag { font-weight: 800; } ${P} .pw-tabs button .tag.ok { color: #1f7442; } ${P} .pw-tabs button .tag.dark { color: #2b3358; }
${P} .pw-hour { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; } ${P} .pw-hour b { min-width: 5.2em; text-align: center; font: 800 1.05em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-hour button { min-width: 48px; }
${P} .pw-hour span { font-size: .85em; font-weight: 700; color: #5e4936; }
${P} .pw-cmp { display: grid; gap: 6px; } ${P} .pw-cmp div { display: grid; grid-template-columns: minmax(9em, auto) 1fr 5.6em; align-items: center; gap: 8px; font-weight: 800; font-size: .95em; }
${P} .pw-cmp i { display: block; height: 20px; border-radius: 10px; background: #2b3358; overflow: hidden; box-shadow: inset 0 0 0 2px #151a33; } ${P} .pw-cmp u { display: block; height: 100%; background: #f6c453; border-radius: 10px 0 0 10px; }
${P} .pw-cmp em { font-style: normal; text-align: right; font-variant-numeric: tabular-nums; }
@media (max-width: 900px) {
  ${P} .pw-top { left: 22px; right: 22px; top: calc(4.2 * var(--pw-fs) + 26px); } ${P} .pw-plate { top: 20px; right: 22px; padding: 4px 12px 6px; }
  ${P} .pw-desk { grid-template-columns: 1fr; grid-auto-rows: max-content; gap: 8px; max-height: 68vh; overflow: auto; }
  ${P} .pw-dial svg { width: 58px; } ${P} .pw-chart svg { max-height: 21vh; } ${P} .pw-label { display: none; }
  ${P} .pw-ctl { flex-direction: row; flex-wrap: wrap; align-items: stretch; } ${P} .pw-ctl > * { flex: 1 1 200px; } ${P} .pw-ctl > .pw-modes, ${P} .pw-ctl > h4, ${P} .pw-ctl > p { flex-basis: 100%; }
  ${P} .pw-dials { grid-template-columns: repeat(4, 1fr); } ${P} .pw-modes { flex-direction: row; } ${P} .pw-modes button { flex: 1 1 0; grid-template-columns: 1.6em 1fr; } ${P} .pw-modes button u { display: none; }
  ${P} .pw-screen { overflow: visible; }
}
@media (max-width: 560px) { ${P} .pw-prep { grid-template-columns: 1fr; } ${P} .pw-dials { grid-template-columns: 1fr 1fr; } ${P} ol.pw-rules li { grid-template-columns: 1.7em 1fr; } ${P} .pw-arrow { display: none; } ${P} .pw-modes button small { display: none; } }
@media (max-height: 640px) { ${P} .pw-dial svg { width: 54px; } ${P} .pw-modes button { min-height: 48px; } ${P} .pw-desk { padding: 6px 8px 8px; } }

${P} .pw-desk[data-mode="full"] { display: block; overflow: auto; } ${P} .pw-desk[data-mode="full"] > :not(.pw-full) { display: none; } ${P} .pw-desk[data-mode="desk"] > .pw-full { display: none; }
${P} .pw-desk:has(> .pw-side.scale) { --side: minmax(250px, 290px); } ${P} .pw-desk:has(> .pw-side.jobs) { --side: minmax(250px, 320px); } ${P} .pw-desk:has(> .pw-side.switches) { --side: minmax(240px, 300px); } ${P} .pw-desk:has(> .pw-side.notes) { --side: minmax(200px, 250px); }
${P} .pw-side { overflow: auto; display: flex; flex-direction: column; gap: 6px; } ${P} .pw-side h3 { margin: 0; font: 800 1.02em Bricolage, Inter, system-ui, sans-serif; }
${P} .pw-desk > .pw-full { padding: 10px 14px; }
${P} .pw-maphead { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; } ${P} .pw-maphead h2 { margin: 0; font: 800 1.25em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-maphead p { margin: 0; font-weight: 700; color: #5e4936; }
${P} ol.pw-map { margin: 0 0 8px; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
${P} ol.pw-map button { width: 100%; height: 100%; display: grid; grid-template-columns: 2em 2em 1fr; column-gap: 6px; align-items: center; text-align: left; padding: 8px 10px; min-height: 92px; }
${P} ol.pw-map button .pw-mnum { grid-row: 1; display: grid; place-items: center; width: 1.8em; height: 1.8em; border-radius: 50%; background: #3b2a1e; color: #fff; font-size: .9em; }
${P} ol.pw-map button i { grid-row: 1; font-style: normal; font-size: 1.5em; } ${P} ol.pw-map button b { grid-row: 1; font: 800 1.05em Bricolage, Inter, system-ui, sans-serif; }
${P} ol.pw-map button small { grid-column: 1 / -1; font-size: .8em; font-weight: 600; color: #5e4936; line-height: 1.25; margin-top: 3px; }
${P} ol.pw-map button em { grid-column: 1 / -1; font-style: normal; font-size: .85em; font-weight: 800; margin-top: 4px; color: #5e4936; }
${P} ol.pw-map button.done { background: #e4f4e8; box-shadow: inset 0 0 0 2px #2e9b5a, 0 3px 0 #1a5a34; } ${P} ol.pw-map button.done em { color: #1f7442; }
${P} ol.pw-map button.next { background: #fff3cf; box-shadow: inset 0 0 0 4px #d9a441, 0 3px 0 #b07f22; } ${P} ol.pw-map button.next em { color: #8a3a2a; }
${P} ol.pw-map button[disabled] { background: #efe6d6; } ${P} ol.pw-map button[disabled] .pw-mnum { background: #b9a888; } ${P} ol.pw-map button[disabled] i { filter: grayscale(1); opacity: .6; }
${P} .pw-brief { display: flex; gap: 16px; align-items: flex-start; max-width: 860px; margin: 0 auto; } ${P} .pw-brief > i { font-style: normal; font-size: 3.2em; line-height: 1; }
${P} .pw-brief h2 { margin: 0 0 6px; font: 800 1.35em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-kicker { margin: 0; font-weight: 800; color: #8a3a2a; letter-spacing: .03em; text-transform: uppercase; font-size: .82em; }
${P} .pw-job, ${P} .pw-howto { margin: 0 0 8px; font-size: 1.05em; line-height: 1.4; font-weight: 600; } ${P} .pw-brief.done .pw-kicker { color: #1f7442; } ${P} .pw-brief .pw-lines { margin-bottom: 10px; }
${P} .pw-lines li.ok { color: #1f7442; font-weight: 800; } ${P} .pw-goal { margin: 0; font-weight: 800; color: #2b3358; font-size: .92em; }
${P} .pw-note { margin: 0; font-size: .9em; font-weight: 600; color: #5e4936; line-height: 1.35; } ${P} .pw-msg { margin: 4px 0 0; font-weight: 800; line-height: 1.35; color: #2b3358; }
${P} .pw-modes button em.pw-guide { grid-column: 2; font-style: normal; font-size: .72em; font-weight: 800; color: #8a3a2a; }
${P} .pw-scale { display: block; width: 100%; max-width: 280px; height: auto; margin: 0 auto; } ${P} .pw-beam, ${P} .pw-pan { transition: transform .35s ease; } ${P}.pw-still .pw-beam, ${P}.pw-still .pw-pan { transition: none; }
${P} .pw-state { margin: 0; text-align: center; font: 800 1.15em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-state.ok { color: #1f7442; } ${P} .pw-state.bad { color: #9a3220; }
${P} .pw-hz { margin: 0; text-align: center; font-weight: 800; font-variant-numeric: tabular-nums; } ${P} .pw-hz small { font-weight: 600; color: #5e4936; margin-left: 4px; }
${P} .pw-blocks { display: flex; flex-wrap: wrap; gap: 4px 10px; justify-content: center; font-size: .78em; font-weight: 700; color: #5e4936; } ${P} .pw-blocks span { display: inline-flex; align-items: center; gap: 4px; }
${P} .pw-blocks i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; } ${P} .pw-blocks i.line { height: 4px; width: 16px; } ${P} .pw-blocks.left { justify-content: flex-start; font-size: .85em; } ${P} .pw-blocks i.spare { background: #dff3e4; box-shadow: inset 0 0 0 2px #2e9b5a; } ${P} .pw-blocks i.clean { background: #2e9b5a; } ${P} .pw-blocks i.gas { background: #b5432c; }
${P} ol.pw-steps { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 4px; }
${P} ol.pw-steps li { display: grid; justify-items: center; padding: 4px 2px; border-radius: 8px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; font-size: .78em; font-weight: 700; color: #5e4936; }
${P} ol.pw-steps li span { font-size: 1.3em; font-weight: 800; min-height: 1.2em; } ${P} ol.pw-steps li.ok span { color: #1f7442; } ${P} ol.pw-steps li.bad span { color: #b5432c; }
${P} ol.pw-steps li.now { box-shadow: inset 0 0 0 3px #3b2a1e; background: #fff3cf; }
${P} .pw-now { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; font-weight: 700; } ${P} .pw-now b { font: 800 1.2em Bricolage, Inter, system-ui, sans-serif; } ${P} .pw-event { color: #8a3a2a; font-weight: 800; }
${P} .pw-was { margin: 0; font-size: .9em; font-weight: 700; color: #5e4936; }
${P} .pw-table { border-collapse: collapse; font-size: .9em; font-variant-numeric: tabular-nums; } ${P} .pw-table th, ${P} .pw-table td { padding: 2px 10px; text-align: right; border-bottom: 1px solid #d2c4ac; } ${P} .pw-table th { color: #5e4936; }
${P} .pw-flex { display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 6px 8px; align-items: stretch; }
${P} .pw-flex button[data-flex="1"] { grid-column: 1; grid-row: 1; } ${P} .pw-flex button[data-flex="-1"] { grid-column: 1; grid-row: 2; } ${P} .pw-flex button { min-height: 52px; font-size: 1.1em; }
${P} .pw-track { grid-column: 2; grid-row: 1 / span 2; display: grid; grid-auto-rows: 1fr; gap: 2px; width: 30px; }
${P} .pw-track i { display: grid; place-items: center; border-radius: 4px; background: #ebdcc0; font-style: normal; font-size: .7em; font-weight: 800; color: #5e4936; min-height: 9px; } ${P} .pw-track i.neg { background: #e1d6ef; }
${P} .pw-track i.on { background: #8e5cd9; color: #fff; box-shadow: 0 0 0 2px #3b2a1e; } ${P} .pw-track i.guide { outline: 2px dashed #c8553d; outline-offset: 1px; color: #8a3a2a; } ${P} .pw-track i.on.guide { color: #fff; }
${P} .pw-flexword { margin: 0; text-align: center; font-weight: 800; }
${P} .pw-hours { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; margin-top: 6px; }
${P} .pw-hours button { display: grid; gap: 0; justify-items: center; align-content: center; min-height: 48px; padding: 2px; font-size: .85em; border-radius: 9px; }
${P} .pw-hours button b small { font-size: .75em; margin-left: 1px; } ${P} .pw-hours button span { font-size: .72em; font-weight: 800; min-height: 1.1em; }
${P} .pw-hours button[aria-pressed="true"] { background: #2b3358; color: #fff; box-shadow: inset 0 0 0 2px #151a33, 0 2px 0 #151a33; transform: translateY(1px); }
${P} .pw-hours button.ring { outline: 3px dashed #e8772e; outline-offset: 1px; }
${P} .pw-jobs { display: grid; gap: 6px; } ${P} .pw-jobs button { display: grid; grid-template-columns: 1.6em 1fr auto; gap: 6px; align-items: center; text-align: left; padding: 6px 8px; line-height: 1.2; }
${P} .pw-jobs button i { font-style: normal; font-size: 1.3em; } ${P} .pw-jobs button small { display: block; font-size: .74em; font-weight: 600; color: #5e4936; } ${P} .pw-jobs button em { font-style: normal; font-size: .76em; font-weight: 800; text-align: right; }
${P} .pw-jobs button.clean em { color: #1f7442; } ${P} .pw-jobs button.gas em, ${P} .pw-jobs button.part em { color: #9a3220; }
${P} .pw-jobs button[aria-pressed="true"] { background: #fff3cf; box-shadow: inset 0 0 0 4px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-slots { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 4px; align-items: end; }
${P} .pw-slots button { position: relative; display: grid; grid-template-rows: 1fr auto; padding: 4px 2px; min-height: 150px; border-radius: 9px; font-size: .8em; }
${P} .pw-slots button.out { background: #ece3d2; box-shadow: inset 0 0 0 2px #d2c4ac; } ${P} .pw-slots button.out b { color: #6f604f; }
${P} .pw-slots button.here { box-shadow: inset 0 0 0 3px #c8553d, 0 3px 0 #7a5a33; }
${P} .pw-col { display: flex; flex-direction: column-reverse; gap: 2px; align-items: stretch; justify-content: flex-start; }
${P} .pw-col i { display: grid; place-items: center; height: 26px; border-radius: 5px; font-style: normal; font-size: 1em; } ${P} .pw-col i.spare { background: #dff3e4; box-shadow: inset 0 0 0 2px #2e9b5a; }
${P} .pw-col i.clean { background: #2e9b5a; } ${P} .pw-col i.gas { background: #b5432c; } ${P} .pw-col i.sel { outline: 2px solid #3b2a1e; outline-offset: -2px; }
${P} .pw-star { position: absolute; top: 2px; right: 4px; font-style: normal; color: #c8553d; font-size: 1.2em; } ${P} .pw-sum { margin: 0; font-weight: 800; text-align: center; } ${P} .pw-sum.ok { color: #1f7442; }
${P} .pw-net { display: block; width: 100%; height: auto; max-height: 34vh; border-radius: 10px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d2c4ac; }
${P} .pw-switches, ${P} .pw-cards { display: grid; gap: 5px; } ${P} .pw-switches button { display: grid; grid-template-columns: 1.5em 1fr auto; gap: 6px; align-items: center; text-align: left; padding: 4px 8px; min-height: 44px; font-size: .92em; line-height: 1.2; }
${P} .pw-switches button i { font-style: normal; } ${P} .pw-switches button small { font-size: .78em; color: #8a3a2a; } ${P} .pw-switches button em { font-style: normal; padding: 2px 8px; border-radius: 9px; background: #d2c4ac; }
${P} .pw-switches button[aria-pressed="true"] em { background: #2e9b5a; color: #fff; }
${P} .pw-cards button { text-align: left; line-height: 1.25; font-size: .92em; } ${P} ol.pw-order { margin: 0; padding-left: 1.6em; display: grid; gap: 4px; font-weight: 700; } ${P} ol.pw-order span { color: #8a7a6a; }
${P} .pw-prep { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; } ${P} .pw-prep button { display: grid; grid-template-columns: 1.4em 1fr; gap: 6px; align-items: center; text-align: left; line-height: 1.25; font-size: .92em; }
${P} .pw-prep button i { font-style: normal; display: grid; place-items: center; width: 1.3em; height: 1.3em; border-radius: 5px; box-shadow: inset 0 0 0 2px #b08a55; background: #fff; } ${P} .pw-prep button[aria-pressed="true"] { background: #e4f4e8; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #1a5a34; } ${P} .pw-prep button[aria-pressed="true"] i { background: #2e9b5a; color: #fff; box-shadow: none; }
${P} .pw-meter { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; font-weight: 800; margin-top: 4px; } ${P} .pw-meter i { display: block; height: 16px; border-radius: 8px; background: #e6d3b0; overflow: hidden; } ${P} .pw-meter u { display: block; height: 100%; background: #8e5cd9; }
@media (max-width: 900px) {
  ${P} ol.pw-map { grid-template-columns: repeat(2, minmax(0, 1fr)); } ${P} .pw-brief > i { font-size: 2.4em; }
  ${P} .pw-desk[data-mode="desk"] { grid-template-columns: 1fr; } ${P} .pw-side { overflow: visible; } ${P} .pw-scale { max-width: 240px; } ${P} .pw-net { max-height: 28vh; }
  ${P} .pw-flex { grid-template-columns: 1fr 1fr auto; grid-template-rows: auto; } ${P} .pw-flex button[data-flex="1"] { grid-column: 2; grid-row: 1; } ${P} .pw-flex button[data-flex="-1"] { grid-column: 1; grid-row: 1; } ${P} .pw-track { grid-column: 3; grid-row: 1; height: 90px; }
  ${P} .pw-switches { grid-template-columns: 1fr 1fr; } ${P} .pw-jobs { grid-template-columns: 1fr 1fr; } ${P} .pw-slots button { min-height: 120px; }
  ${P} .pw-side.scale { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; } ${P} .pw-side.scale .pw-scale { grid-row: span 3; }
}
@media (max-width: 560px) { ${P} .pw-prep { grid-template-columns: 1fr; } ${P} .pw-hours { grid-template-columns: repeat(6, minmax(0, 1fr)); } ${P} ol.pw-map { grid-template-columns: 1fr; } ${P} .pw-switches, ${P} .pw-jobs { grid-template-columns: 1fr; } }
`;
