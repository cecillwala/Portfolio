// Ease the displayed percentage toward completed readiness milestones, then reveal the street.
export async function loadStreet(initStreet) {
  const progress = document.getElementById('loading-progress');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let target = 0, shown = 0, last = performance.now(), animation;
  let complete;
  const finished = new Promise((resolve) => { complete = resolve; });

  function frame(now) {
    const dt = Math.max(0, now - last); last = now;
    shown = reducedMotion ? target : Math.min(target, shown + dt * 0.16);
    const value = Math.floor(shown);
    progress.textContent = value + '%';
    progress.setAttribute('aria-valuenow', String(value));
    if (value === 100) complete();
    else animation = requestAnimationFrame(frame);
  }
  animation = requestAnimationFrame(frame);

  try {
    await initStreet((value) => { target = Math.max(target, Math.min(100, value)); });
    target = 100;
    await finished;
    // Give 100% a brief readable moment before the CSS crossfade starts.
    if (!reducedMotion) await new Promise((resolve) => setTimeout(resolve, 180));
    document.dispatchEvent(new Event('street:ready'));
  } catch (error) {
    cancelAnimationFrame(animation);
    console.error('The street could not load.', error);
    const status = document.getElementById('loading-status');
    if (status) status.textContent = 'The street could not load. Please refresh, or browse my work below.';
    document.dispatchEvent(new Event('street:error'));
  }
}
