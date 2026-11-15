// Placeholder for the "roads" module (docs/MODULES.md). The module's builder replaces this file and adds its own
// files beside it. It shows the shape a module must have and lets the loader, the board and the tests run meanwhile.
export default {
  id: 'roads', icon: '🚗',
  title: { j: 'Roads for self-driving cars', s: 'Roads for self-driving cars' },
  blurb: { j: 'Redesign a street for shared self-driving cars.', s: 'Redesign one street for shared autonomous cars and weigh the trade-off.' },
  css: '.mod-soon { position: absolute; inset: 0; display: grid; place-items: center; font: 800 1.4rem Inter, system-ui, sans-serif; color: #3b2a1e; background: #fff9ec; }',
  async run(ctx) {
    ctx.report({ stage: 'Not built yet' });
    ctx.root.innerHTML = '<div class="mod-soon"><p>This part of the town of the future is still being built.</p></div>';
    await ctx.left; // resolves when the child presses "Back to my town"
    return { finished: false };
  },
};
