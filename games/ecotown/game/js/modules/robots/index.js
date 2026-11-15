// Placeholder for the "robots" module (docs/MODULES.md). The module's builder replaces this file and adds its own
// files beside it. It shows the shape a module must have and lets the loader, the board and the tests run meanwhile.
export default {
  id: 'robots', icon: '🤖',
  title: { j: 'Robot training', s: 'Robot training' },
  blurb: { j: 'Teach a robot by showing it examples, then test it.', s: 'Train a sorting robot by example, test it and fill the gaps.' },
  css: '.mod-soon { position: absolute; inset: 0; display: grid; place-items: center; font: 800 1.4rem Inter, system-ui, sans-serif; color: #3b2a1e; background: #fff9ec; }',
  async run(ctx) {
    ctx.report({ stage: 'Not built yet' });
    ctx.root.innerHTML = '<div class="mod-soon"><p>This part of the town of the future is still being built.</p></div>';
    await ctx.left; // resolves when the child presses "Back to my town"
    return { finished: false };
  },
};
