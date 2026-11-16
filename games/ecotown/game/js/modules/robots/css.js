// Robots at work: styles for the mission map, the opening and closing cards and missions 1, 2, 3, 5 and 6.
// (The workshop frame and mission 4's bench are styled in bench.js.) Every rule starts with the module's own layer.
const M = '#module[data-module="robots"]';
export const css = `
§ .rb-headin { display: flex; align-items: center; gap: 8px; pointer-events: auto; max-width: 100%; }
§ .rb-mis { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 12px; background: #243447; color: #fff; white-space: nowrap; }
§ .rb-mis[hidden], § .rb-steps[hidden] { display: none; } § .rb-mis i { font-style: normal; } § .rb-mis b { font-weight: 800; } § .rb-mis small { font-weight: 600; opacity: .85; }
§ .rb h2 { margin: 0; font-size: 1.5em; font-weight: 800; line-height: 1.15; }
§ .rb h4 { margin: 10px 0 6px; font-size: .95em; font-weight: 800; color: #5e4936; }
§ .rb-kicker { margin: 0 0 4px; font-weight: 800; color: #1f7a44; font-size: .9em; text-transform: none; }
§ .rb-verdict.ask { box-shadow: inset 0 0 0 3px #c9a13a; }
§ .rb-addhint { margin: 6px 0 0; font-size: .9em; color: #5e4936; }
/* the mission map */
§ .rb-map { display: grid; gap: 12px; padding-bottom: 6px; }
§ .rb-maphead { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 4px 16px; background: #fffaf0; border-radius: 16px; padding: 10px 16px; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; }
§ .rb-maphead p { margin: 0; } § .rb-maphead b { color: #1f7a44; }
§ .rb-progress { grid-column: 1 / 3; height: 12px; border-radius: 999px; background: #efe3c8; overflow: hidden; } § .rb-progress i { display: block; height: 100%; background: #1f7a44; border-radius: 999px; }
§ .rb-mgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
§ .rb-mcard { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto 1fr auto; column-gap: 12px; align-items: start; text-align: left; min-height: 150px; padding: 12px 14px; border: 0; border-radius: 18px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d7bf95, 0 4px 0 #c9ae80; }
§ .rb-mcard .rb-mico { grid-row: 1 / 4; font-size: 2.4em; line-height: 1; padding-top: 18px; }
§ .rb-mnum { position: absolute; top: 8px; left: 10px; width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center; background: #eadcbd; font-weight: 800; font-size: .85em; }
§ .rb-mcard > b { font-weight: 800; font-size: 1.08em; } § .rb-mcard > small { color: #5e4936; font-weight: 600; }
§ .rb-mcard .rb-did { font-size: .86em; line-height: 1.3; }
§ .rb-mcard em { grid-column: 2; justify-self: start; margin-top: 6px; font-style: normal; font-weight: 800; font-size: .86em; padding: 2px 10px; border-radius: 999px; }
§ .rb-tick { background: #1f7a44; color: #fff; } § .rb-now { background: #f4b73b; color: #3b2a1e; } § .rb-lock { background: #e9e0cc; color: #5e4936; }
§ .rb-again { grid-column: 2; font-size: .84em; font-weight: 800; color: #17603a; margin-top: 4px; }
§ .rb-mcard.done { background: #f1faf4; box-shadow: inset 0 0 0 2px #1f7a44, 0 4px 0 #17603a; }
§ .rb-mcard.now { background: #fff7dc; box-shadow: inset 0 0 0 4px #e0a21c, 0 4px 0 #b98312; }
§ .rb-mcard[disabled] { background: #efe8d8; color: #6f5f4c; cursor: default; box-shadow: inset 0 0 0 2px #cdbb99; } § .rb-mcard[disabled] .rb-mico { filter: grayscale(1); opacity: .6; }
/* the opening and closing cards */
§ .rb-brief { display: grid; grid-template-columns: auto 1fr; gap: 18px; align-items: start; max-width: 860px; margin: 8px auto; padding: 20px 24px; }
§ .rb-bico { font-size: 4.2em; line-height: 1; } § .rb-job { font-size: 1.12em; margin: 10px 0 12px; }
§ .rb-how { margin: 6px 0 0; padding-left: 1.4em; display: grid; gap: 6px; font-size: 1.04em; } § .rb-brief h3 { margin-top: 6px; }
§ .rb-can { margin: 0; padding: 10px 14px; border-radius: 12px; background: #e3f4e9; color: #17603a; font-size: 1.06em; }
§ .rb-brief.done { box-shadow: inset 0 0 0 3px #1f7a44, 0 4px 0 #17603a; }
/* mission 1 */
§ .rb-m1a { display: grid; gap: 12px; max-width: 980px; margin: 0 auto; }
§ .rb-job1 { text-align: center; } § .rb-jobtext { margin: 2px 0 8px; font-size: 1.3em; font-weight: 800; }
§ .rb-dots { list-style: none; margin: 0; padding: 0; display: flex; justify-content: center; gap: 6px; } § .rb-dots li { width: 12px; height: 12px; border-radius: 50%; background: #e6d4ad; } § .rb-dots li.done { background: #1f7a44; } § .rb-dots li.on { background: #f4b73b; box-shadow: 0 0 0 2px #3b2a1e; }
§ .rb-sensors { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
§ .rb-sensor { position: relative; display: grid; justify-items: center; align-content: start; gap: 4px; padding: 12px 8px; min-height: 150px; border: 0; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 2px #d7bf95, 0 4px 0 #c9ae80; }
§ .rb-sensor b { font-weight: 800; font-size: 1.05em; } § .rb-sensor small { font-weight: 600; color: #5e4936; text-align: center; line-height: 1.25; }
§ .rb-sensor em { position: absolute; top: 6px; right: 10px; font-style: normal; font-weight: 800; font-size: 1.3em; }
§ .rb-sensor.no { background: #f6ebe3; color: #6f5f4c; box-shadow: inset 0 0 0 2px #e0b9a0; cursor: default; } § .rb-sensor.no em { color: #b3501f; }
§ .rb-sensor.yes { background: #e3f4e9; box-shadow: inset 0 0 0 4px #1f7a44, 0 4px 0 #17603a; cursor: default; } § .rb-sensor.yes em { color: #1f7a44; }
§ .rb-m1b { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
§ .rb-roombox { display: grid; place-items: center; } § .rb-room { width: 100%; height: auto; max-height: min(52vh, 400px); display: block; }
§ .rb:not(.still) .rb-bot { transition: transform .35s ease; }
§ .rb-loop { display: grid; gap: 10px; }
§ .rb-rule { display: grid; gap: 2px; background: #243447; color: #fff; box-shadow: none; } § .rb-rule small { color: #bfeaff; font-weight: 800; } § .rb-rule b { font-size: 1.08em; }
§ .rb-sta { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
§ .rb-sta li { display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 14px; background: #fffaf0; box-shadow: inset 0 0 0 2px #d7bf95; color: #6f5f4c; }
§ .rb-sta li i { font-style: normal; width: 1.8em; height: 1.8em; border-radius: 50%; display: grid; place-items: center; background: #eadcbd; font-weight: 800; }
§ .rb-sta li b { font-weight: 800; min-width: 3.4em; } § .rb-sta li.on { color: #3b2a1e; background: #fff; box-shadow: inset 0 0 0 3px #1f6fd0; } § .rb-sta li.on i { background: #1f6fd0; color: #fff; }
§ .rb-rules { display: grid; gap: 8px; }
§ .rb-rulebtn { position: relative; text-align: left; min-height: 56px; padding: 10px 14px; border: 0; border-radius: 14px; background: #fff; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95, 0 3px 0 #c9ae80; }
§ .rb-rulebtn.on { background: #e3f4e9; box-shadow: inset 0 0 0 4px #1f7a44, 0 3px 0 #17603a; }
§ .rb-rulebtn em { float: right; font-style: normal; font-size: .82em; font-weight: 800; color: #17603a; margin-left: 8px; }
/* mission 2 */
§ .rb-m2 { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 12px; align-items: start; }
§ .rb-task { margin: 0 0 6px; font-weight: 800; } § .rb-armsvg { display: block; width: 100%; height: auto; max-height: min(42vh, 320px); }
§ .rb:not(.still) .rb-armg { transition: transform .3s ease; }
§ .rb-armbox .rb-verdict { margin-top: 8px; }
§ .rb-prog { list-style: none; margin: 0 0 6px; padding: 2px; display: grid; gap: 4px; max-height: max(150px, calc(100vh - 470px)); overflow-y: auto; overscroll-behavior: contain; }
§ .rb-prog li { display: grid; grid-template-columns: 1fr auto; gap: 4px; }
§ .rb-pstep { display: flex; align-items: center; gap: 8px; text-align: left; min-height: 44px; padding: 4px 10px; border: 0; border-radius: 10px; background: #fff; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-pstep i { font-style: normal; width: 1.6em; height: 1.6em; border-radius: 50%; display: grid; place-items: center; background: #eadcbd; font-weight: 800; font-size: .85em; flex: none; }
§ .rb-prog li.sel .rb-pstep { box-shadow: inset 0 0 0 3px #1f6fd0; } § .rb-prog li.run .rb-pstep { background: #fff7dc; box-shadow: inset 0 0 0 3px #e0a21c; } § .rb-prog li.bad .rb-pstep { background: #fde6cf; box-shadow: inset 0 0 0 3px #b3501f; }
§ .rb-pdel { min-width: 44px; min-height: 44px; border: 0; border-radius: 10px; background: #f3e9d2; font-weight: 800; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-pempty { padding: 10px; border-radius: 10px; background: #f6edd8; color: #5e4936; }
§ .rb-repeat { display: flex; align-items: center; gap: 10px; margin: 8px 0; padding: 6px 10px; border-radius: 12px; background: #243447; color: #fff; } § .rb-repeat span { font-weight: 800; min-width: 5.5em; text-align: center; }
§ .rb-rep { min-width: 44px; min-height: 44px; border: 0; border-radius: 10px; background: #fff; color: #3b2a1e !important; font-weight: 800 !important; font-size: 1.3em !important; } § .rb-rep:disabled { opacity: .5; cursor: default; }
§ .rb-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin: 0 0 10px; }
§ .rb-tile { min-height: 48px; padding: 6px 10px; border: 0; border-radius: 12px; background: #16c79a; color: #10322a !important; font-weight: 800 !important; box-shadow: inset 0 -3px 0 #0f9c78, 0 3px 0 #0b6e55; }
/* mission 3 */
§ .rb-m3 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 12px; align-items: start; }
§ .rb-left3 { display: grid; gap: 8px; min-width: 0; } § .rb-planbox { display: grid; gap: 8px; } § .rb-plan { display: block; width: 100%; height: auto; max-height: min(36vh, 300px); } § .rb[data-stage="m3-r3"] .rb-plan { max-height: min(28vh, 240px); }
§ .rb-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
§ .rb-log li { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; padding: 4px 10px; font-size: .94em; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 2px #e6d3b0; }
§ .rb-log li span { font-size: 1.3em; } § .rb-log small { display: block; margin-top: 2px; font-weight: 800; color: #8f3a10; }
§ .rb-log li.unsafe, § .rb-log li.stuck { background: #fdf0e6; } § .rb-log li.late { background: #fff7dc; }
§ .rb-mk { font-style: normal; width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 800; background: #1f7a44; }
§ .rb-mk.unsafe, § .rb-mk.stuck { background: #b3501f; } § .rb-mk.late { background: #8a6200; }
§ .rb-rlist { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
§ .rb-rlist > li { padding: 6px 8px; border-radius: 14px; background: #fff; box-shadow: inset 0 0 0 2px #e6d3b0; }
§ .rb-rif { display: flex; align-items: center; gap: 8px; } § .rb-rif b { font-weight: 800; flex: 1; } § .rb-rif > span:not(.rb-rnum):not(.rb-order) { font-size: 1.3em; }
§ .rb-rnum { width: 1.7em; height: 1.7em; border-radius: 50%; display: grid; place-items: center; background: #243447; color: #fff; font-weight: 800; font-size: .85em; flex: none; }
§ .rb-order { display: flex; gap: 4px; } § .rb-mv { min-width: 44px; min-height: 44px; border: 0; border-radius: 10px; background: #f3e9d2; font-weight: 800; box-shadow: inset 0 0 0 2px #d7bf95; } § .rb-mv:disabled { opacity: .4; cursor: default; }
§ .rb-ract { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 4px; } § .rb-ract small { font-weight: 800; color: #5e4936; }
§ .rb-act { min-height: 44px; padding: 4px 10px; font-size: .9em !important; border: 0; border-radius: 12px; background: #f6edd8; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-act.on { background: #e3f4e9; box-shadow: inset 0 0 0 3px #1f7a44; font-weight: 800; }
/* mission 5 */
§ .rb-m5a { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 12px; align-items: stretch; max-width: 980px; margin: 0 auto; }
§ .rb-bigplant { display: grid; justify-items: center; align-content: center; gap: 4px; text-align: center; } § .rb-bigplant b { font-size: 1.1em; }
§ .rb-robotsays p { margin: 6px 0; } § .rb-surebig .rb-sure { height: 22px; }
§ .rb-sure { position: relative; display: block; width: 100%; height: 12px; border-radius: 999px; background: #e3ecf7; box-shadow: inset 0 0 0 1px #9fb4cf; }
§ .rb-sure i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: linear-gradient(90deg, #f4b73b, #d9533d); }
§ .rb-sure b { position: absolute; top: -5px; bottom: -5px; width: 4px; margin-left: -2px; background: #243447; border-radius: 2px; }
§ .rb-pc { font-weight: 800; color: #2b3a55; }
§ .rb-m5 { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 12px; align-items: start; }
§ .rb-plants { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; } § .rb.large .rb-plants { grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); }
§ .rb-plants li { display: grid; justify-items: center; gap: 3px; padding: 6px; border-radius: 12px; background: #f3ecd9; box-shadow: inset 0 0 0 2px #d7bf95; text-align: center; }
§ .rb-plants li b { font-size: .88em; font-weight: 800; line-height: 1.1; overflow-wrap: anywhere; } § .rb-plants li em { font-style: normal; font-size: .78em; font-weight: 800; line-height: 1.15; padding: 2px 6px; border-radius: 8px; color: #fff; background: #1f7a44; }
§ .rb-plants li em.miss { background: #b3501f; } § .rb-plants li em.ask { background: #8a6200; } § .rb-plants li em.wait { background: #e9e0cc; color: #4a3828; }
§ .rb-plants li.lost { background: #fde6cf; box-shadow: inset 0 0 0 3px #b3501f; } § .rb-plants li.gone .rb-plant { opacity: .45; }
§ .rb-sets { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
§ .rb-set, § .rb-ask { min-height: 46px; padding: 6px 12px; border: 0; border-radius: 12px; background: #f6edd8; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-set.on, § .rb-ask.on { background: #e3f4e9; box-shadow: inset 0 0 0 3px #1f7a44; font-weight: 800; }
§ .rb-setbox .rb-conf { margin-top: 8px; }
/* mission 6 */
§ .rb-m6 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 12px; align-items: start; }
§ .rb-dtop { display: flex; gap: 12px; align-items: center; } § .rb-dtop p { margin: 2px 0; } § .rb-design { flex: none; }
§ .rb-wt { font-weight: 800; color: #3b2a1e; letter-spacing: 1px; } § .rb-wt small { letter-spacing: 0; color: #5e4936; }
§ .rb-opts { display: flex; flex-wrap: wrap; gap: 6px; }
§ .rb-opt { min-height: 46px; padding: 6px 12px; border: 0; border-radius: 12px; background: #f6edd8; font-weight: 700; box-shadow: inset 0 0 0 2px #d7bf95; }
§ .rb-opt small { font-weight: 600; color: #5e4936; } § .rb-opt.on { background: #e3f4e9; box-shadow: inset 0 0 0 3px #1f7a44; font-weight: 800; }
§ .rb-opt:disabled { opacity: .5; cursor: default; }
§ .rb-street2 { display: block; width: 100%; height: auto; max-height: min(34vh, 260px); }
§ .rb-simbox { display: grid; gap: 8px; }
§ .rb-batt { display: block; height: 14px; border-radius: 999px; background: #efe3c8; box-shadow: inset 0 0 0 1px #b49562; overflow: hidden; } § .rb-batt i { display: block; height: 100%; background: #7be0a3; }
@media (max-width: 1100px) { § .rb-mgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } § .rb-sensors { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 820px) {
  § .rb-m1b, § .rb-m2, § .rb-m3, § .rb-m5, § .rb-m5a, § .rb-m6 { grid-template-columns: minmax(0, 1fr); }
  § .rb-mcard { min-height: 0; } § .rb-brief { padding: 14px; gap: 10px; } § .rb-bico { font-size: 2.8em; }
  § .rb-room { max-height: 34vh; } § .rb-plan { max-height: 30vh; } § .rb-armsvg { max-height: 30vh; }
  § .rb-mis small { display: none; }
}
@media (max-height: 640px) { § .rb-mcard { min-height: 0; } § .rb-sensor { min-height: 0; } }
`.replace(/\/\*[^*]*\*\//g, "").replace(/§/g, M);
