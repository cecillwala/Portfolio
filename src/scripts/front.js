// The front page below the street: the clock on the cover and the selected-work index.
import { still, blip } from './pixel.js';

export function initFront() {
  // Nairobi time beside the availability line.
  const clock = document.getElementById('cover-clock');
  if (clock) {
    const tick = () => { try { clock.textContent = 'Nairobi ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date()); } catch { clock.textContent = 'Nairobi'; } };
    tick(); setInterval(tick, 20000);
  }

  // Selected work: the titles are tabs. Choosing one widens its lettering and lights its window.
  const tabs = [...document.querySelectorAll('.work-title')], panels = [...document.querySelectorAll('.work-panel')];
  if (!tabs.length) return;
  const frame = document.querySelector('.work-window');
  function choose(tab, { focus = false, quiet = false } = {}) {
    if (tab.getAttribute('aria-selected') === 'true') { if (focus) tab.focus(); return; }
    for (const t of tabs) { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; }
    for (const p of panels) p.hidden = p.id !== tab.getAttribute('aria-controls');
    if (!still) { frame.classList.remove('is-switching'); void frame.offsetWidth; frame.classList.add('is-switching'); }
    if (!quiet) blip(520, 0.04);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => choose(tab));
    // Pointing at a title is enough on a screen with a mouse; touch screens use the tap above.
    tab.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') choose(tab, { quiet: true }); });
    tab.addEventListener('keydown', (e) => {
      const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault(); choose(tabs[(to + tabs.length) % tabs.length], { focus: true });
    });
  });
}
