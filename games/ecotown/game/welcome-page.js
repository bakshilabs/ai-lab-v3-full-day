// The welcome page (welcome.html): once the film has started, the start page shows the welcome as watched. Nothing is sent.
const v = document.querySelector('[data-welcome]');
if (v) v.addEventListener('play', () => { try { localStorage.setItem('ecotown.welcome', '1'); } catch { /* storage off: the welcome shows as not watched */ } }, { once: true });
