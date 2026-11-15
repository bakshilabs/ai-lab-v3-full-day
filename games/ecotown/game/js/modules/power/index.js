// Placeholder for the "power" module (docs/MODULES.md). The module's builder replaces this file and adds its own
// files beside it. It is not on the board or the start page until the real module is merged.
export default {
  id: 'power', icon: '⚡',
  title: { j: 'Power control room', s: 'Power control room' },
  blurb: { j: 'Keep the lights on. Then write rules so the system runs itself.', s: 'Run the town’s power by hand, then write rules for it and test them.' },
  css: '#module[data-module="power"] .mod-soon { position: absolute; inset: 0; display: grid; place-items: center; font: 800 1.4rem Inter, system-ui, sans-serif; color: #3b2a1e; background: #fff9ec; }',
  async run(ctx) {
    ctx.report({ stage: 'Not built yet' });
    ctx.root.innerHTML = '<div class="mod-soon"><p>This part of the town of the future is still being built.</p></div>';
    await ctx.left;
    return { finished: false };
  },
};
