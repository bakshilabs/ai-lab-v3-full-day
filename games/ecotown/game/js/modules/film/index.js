// Placeholder for the "film" module (docs/MODULES.md). The module's builder replaces this file and adds its own
// files beside it. It is not on the board or the start page until the real module is merged.
export default {
  id: 'film', icon: '🎬',
  title: { j: 'Town film studio', s: 'Town film studio' },
  blurb: { j: 'Direct a short film of your town with Florence.', s: 'Brief Florence on a film of your town and improve it with feedback.' },
  css: '#module[data-module="film"] .mod-soon { position: absolute; inset: 0; display: grid; place-items: center; font: 800 1.4rem Inter, system-ui, sans-serif; color: #3b2a1e; background: #fff9ec; }',
  async run(ctx) {
    ctx.report({ stage: 'Not built yet' });
    ctx.root.innerHTML = '<div class="mod-soon"><p>This part of the town of the future is still being built.</p></div>';
    await ctx.left;
    return { finished: false };
  },
};
