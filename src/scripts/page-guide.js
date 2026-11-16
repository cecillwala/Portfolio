import { still } from './pixel.js';

// One Cecil travels between reserved spaces, never over the article or its controls.
export function initPageGuide() {
  const story = document.querySelector('.guided-story');
  const guide = document.getElementById('page-guide');
  const toggle = document.getElementById('guide-toggle');
  if (!story || !guide || !toggle) return;
  guide.hidden = false;
  toggle.hidden = false;
  const notes = {
    brief: 'I started by listening to the client and understanding what borrowers needed.',
    'the-app': 'These are illustrations of the app. Follow the journey from sign-up to repayment.',
    ussd: 'Try this one yourself. Press Send on the phone to begin the USSD demo.',
    behind: 'The app and USSD share a backend. Staff have their own portal to review customers.',
    safeguards: 'These safeguards protect the borrower, the phone and the transaction.',
    running: 'Logs, metrics and alerts help me see how the platform is behaving.',
    now: 'The build is in testing ahead of its Play Store release, with over 130 active users.',
  };
  const route = [
    { id: 'the-app', position: 0.72 },
    { id: 'ussd', position: 0.16 },
    { id: 'safeguards', position: 0.62 },
  ];
  const stops = route.map(stop => {
    const section = story.querySelector('#' + stop.id);
    const slot = document.createElement('div');
    slot.className = 'guide-stop';
    section.prepend(slot);
    return { ...stop, section, slot };
  });
  const sprite = guide.querySelector('.page-guide__sprite');
  let current = null, walkingTimer, scheduled = false, animation;
  function update() {
    scheduled = false;
    const line = Math.max(120, innerHeight * 0.55);
    let next = null;
    for (const stop of stops) {
      if (stop.section.getBoundingClientRect().top <= line) next = stop;
    }
    if (!next) { guide.hidden = true; current = null; return; }
    const changed = next !== current;
    const previous = current;
    current = next;
    guide.hidden = false;
    if (guide.parentElement !== next.slot) next.slot.append(guide);
    guide.querySelector('.page-guide__words').textContent = notes[next.id];
    guide.dataset.section = next.id;
    const available = Math.max(0, next.slot.clientWidth - 60);
    const x = available * next.position;
    const bubbleLeft = Math.max(0, Math.min(next.slot.clientWidth - 290, x - 115));
    guide.style.setProperty('--stop-x', x + 'px');
    guide.style.setProperty('--speech-x', bubbleLeft + 'px');
    guide.style.setProperty('--speech-tail', (x + 30 - bubbleLeft) + 'px');
    if (!changed) return;
    clearTimeout(walkingTimer);
    animation?.cancel();
    guide.classList.remove('walking');
    const startX = available * (previous?.position ?? 0);
    const distance = x - startX;
    guide.style.setProperty('--facing', distance < 0 ? '-1' : '1');
    // Jump straight to the stop after a large scroll, anchor jump or reduced-motion request.
    const nearby = !previous || (Math.abs(stops.indexOf(next) - stops.indexOf(previous)) === 1
      && Math.abs(previous.section.getBoundingClientRect().top) < innerHeight * 2);
    if (!still && nearby && Math.abs(distance) > 8) {
      const duration = Math.max(350, Math.min(1000, Math.abs(distance) / 0.3));
      guide.classList.add('walking');
      animation = sprite.animate([
        { transform: `translateX(${-distance}px)` },
        { transform: 'translateX(0)' },
      ], { duration, easing: 'linear' });
      walkingTimer = setTimeout(() => guide.classList.remove('walking'), duration);
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  toggle.addEventListener('click', () => {
    const hidden = story.classList.toggle('guide-hidden');
    toggle.setAttribute('aria-pressed', String(!hidden));
    toggle.textContent = hidden ? 'Show Cecil’s guide' : 'Hide Cecil’s guide';
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}
