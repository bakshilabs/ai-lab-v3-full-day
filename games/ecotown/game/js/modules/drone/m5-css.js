// Drones at work, mission 5: the styles of the photo review. No three.js here, so the module's index can import it.
const M = '#module[data-module="drone"]';
export const M5_CSS = `
${M} .dk-photos { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
${M} .dk-photo { display: grid; gap: 6px; padding: 6px; border: 0; border-radius: 14px; background: #f3e6cc; color: #3b2a1e; font: 700 .95em Inter, system-ui, sans-serif; text-align: left; box-shadow: inset 0 0 0 2px #b08a55, 0 3px 0 #7a5a33; cursor: pointer; }
${M} .dk-photo svg { width: 100%; height: auto; border-radius: 10px; }
${M} .dk-photo.right { background: #e6f5df; box-shadow: inset 0 0 0 3px #2e9b5a, 0 3px 0 #17592f; }
${M} .dk-photo.nope { background: #ffe9b8; box-shadow: inset 0 0 0 3px #c98a1e, 0 3px 0 #8a5d10; }
`;
