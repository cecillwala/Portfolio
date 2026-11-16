// Simulate a short, eased introduction while still waiting for the real street to be ready.
export async function loadStreet(initStreet) {
  const progress = document.getElementById('loading-progress');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const started = performance.now();
  const introDuration = 1500;
  let ready = false, shown = 0, last = started, animation;
  let complete;
  const finished = new Promise((resolve) => { complete = resolve; });

  function frame(now) {
    const dt = Math.max(0, now - last); last = now;
    const elapsed = now - started;
    // Reach 92% gently; reserve completion for actual asset and scene readiness.
    const t = Math.min(1, elapsed / introDuration);
    const simulated = 92 * (1 - Math.pow(1 - t, 2));
    const target = ready && elapsed >= introDuration ? 100 : simulated;
    shown = reducedMotion ? (ready ? 100 : 0) : Math.min(target, shown + dt * 0.1);
    const value = Math.floor(shown);
    progress.textContent = value + '%';
    progress.setAttribute('aria-valuenow', String(value));
    if (value === 100) complete();
    else animation = requestAnimationFrame(frame);
  }
  animation = requestAnimationFrame(frame);

  try {
    await initStreet();
    ready = true;
    await finished;
    // Give 100% a brief readable moment before the CSS crossfade starts.
    if (!reducedMotion) await new Promise((resolve) => setTimeout(resolve, 160));
    document.dispatchEvent(new Event('street:ready'));
  } catch (error) {
    cancelAnimationFrame(animation);
    console.error('The street could not load.', error);
    const status = document.getElementById('loading-status');
    if (status) status.textContent = 'The street could not load. Please refresh, or browse my work below.';
    document.dispatchEvent(new Event('street:error'));
  }
}
