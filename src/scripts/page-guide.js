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
  const stops = [...story.querySelectorAll('section[id]')].map(section => {
    const slot = document.createElement('div');
    slot.className = 'guide-stop';
    section.prepend(slot);
    return { section, slot };
  });
  let current = null, walkingTimer, scheduled = false, animation;
  function update() {
    scheduled = false;
    const line = Math.max(120, innerHeight * 0.32);
    let next = stops[0];
    for (const stop of stops) {
      if (stop.section.getBoundingClientRect().top <= line) next = stop;
    }
    if (next === current) return;
    const oldTop = current ? guide.getBoundingClientRect().top : null;
    current = next;
    next.slot.append(guide);
    guide.querySelector('.page-guide__words').textContent = notes[next.section.id];
    guide.dataset.section = next.section.id;
    clearTimeout(walkingTimer);
    animation?.cancel();
    guide.classList.remove('walking');
    if (!still && oldTop !== null) {
      guide.classList.add('walking');
      // On phones Cecil takes his place beside the bubble without crossing the text.
      if (matchMedia('(min-width: 861px)').matches) {
        const dy = Math.max(-160, Math.min(160, oldTop - guide.getBoundingClientRect().top));
        animation = guide.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
      }
      walkingTimer = setTimeout(() => guide.classList.remove('walking'), 650);
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
