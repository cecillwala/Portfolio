// Pixel Cecil's engine. He walks along the ground as the visitor scrolls, faces the way they
// are going, and says the line that belongs to the part of the page in the middle of the screen.
//
// Frame numbers match the order in scripts/build-sprites.mjs:
// 0-1 idle, 2-3 talk, 4-7 walk, 8-9 wave, 10-11 celebrate, 12 blink.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const stage = document.querySelector<HTMLElement>('.stage')!;
const mascot = document.getElementById('mascot')!;
const bubble = document.getElementById('bubble')!;
const on = bubble.querySelector<HTMLElement>('.on')!;
const off = bubble.querySelector<HTMLElement>('.off')!;
const live = document.getElementById('say-live')!;
const where = document.getElementById('where');
const quietBtn = document.getElementById('quiet');
const levelLinks = [...document.querySelectorAll<HTMLElement>('.levels a')];

type Box = { el: HTMLElement; top: number; height: number };
type BeatBox = Box & { says: string[] };
let chapters: Box[] = [];
let beats: BeatBox[] = [];
let vw = 0;
let vh = 0;
let scale = 4;
let spriteW = 96;
let spriteH = 128;
let groundH = 48;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cssPx = (name: string) => parseFloat(getComputedStyle(root).getPropertyValue(name));

/** Measure everything once per resize instead of on every scroll. */
function measure() {
  vw = innerWidth;
  vh = innerHeight;
  scale = cssPx('--s');
  spriteW = 24 * scale;
  spriteH = 32 * scale;
  groundH = cssPx('--ground-h');
  const stageH = cssPx('--stage-h');
  const hudH = cssPx('--hud-h');
  const box = (el: HTMLElement): Box => {
    const r = el.getBoundingClientRect();
    return { el, top: r.top + scrollY, height: r.height };
  };
  chapters = [...document.querySelectorAll<HTMLElement>('.chapter')].map(box);
  beats = [...document.querySelectorAll<HTMLElement>('.beat')].map((el) => ({
    ...box(el),
    says: JSON.parse(el.dataset.says ?? '[]') as string[],
  }));
  // A panel taller than the free space sticks higher up, so its bottom still clears Cecil.
  for (const pin of document.querySelectorAll<HTMLElement>('.pin')) {
    const free = vh - stageH - pin.offsetHeight - 12;
    // A short panel sits a third of the way down the free space instead of hugging the top.
    const roomy = hudH + 24 + Math.max(0, free - hudH - 24) * 0.33;
    pin.style.top = `${Math.min(roomy, free)}px`;
  }
}

// ---------- state ----------
let x = 32;
let targetX = 32;
let face = 1;
let lastY = scrollY;
let walkUntil = 0;
let celebrateUntil = 0;
let line = '';
let lineAt = 0;
let chapterIx = -1;

function setLine(next: string, now: number) {
  if (next === line) return;
  line = next;
  lineAt = now;
  live.textContent = next;
  bubble.classList.toggle('empty', !next);
  if (reduce || !next) {
    on.textContent = next;
    off.textContent = '';
  }
}

function onScroll() {
  const now = performance.now();
  const y = scrollY;
  const mid = y + vh * 0.5;

  // Which chapter is in the middle of the screen?
  let ci = chapters.findIndex((c) => mid < c.top + c.height);
  if (ci < 0) ci = chapters.length - 1;
  const c = chapters[ci];
  if (ci !== chapterIx) {
    chapterIx = ci;
    document.body.dataset.theme = c.el.dataset.theme;
    mascot.style.setProperty('--p', c.el.dataset.prop ?? '0');
    if (where) where.textContent = c.el.dataset.where ?? '';
    levelLinks.forEach((a, i) => a.setAttribute('aria-current', String(i === ci)));
  }

  // He crosses the screen once per chapter: in from the left, out to the right.
  const p = clamp((y - c.top) / Math.max(1, c.height - vh), 0, 1);
  const margin = vw * 0.04 + 8;
  const inner = (t: number) => lerp(margin, vw - margin - spriteW, t);
  const first = ci === 0;
  const last = ci === chapters.length - 1;
  if (p < 0.06 && !first) targetX = lerp(-spriteW - 8, margin, p / 0.06);
  else if (p > 0.94 && !last) targetX = lerp(vw - margin - spriteW, vw + 8, (p - 0.94) / 0.06);
  else targetX = inner(first ? p * 0.94 : last ? Math.min(0.6, p) : (p - 0.06) / 0.88);

  // Which line is he on?
  const beat = beats.find((b) => mid >= b.top && mid < b.top + b.height);
  if (beat) {
    const q = clamp((mid - beat.top) / beat.height, 0, 0.999);
    setLine(beat.says[Math.floor(q * beat.says.length)] ?? '', now);
  } else {
    setLine('', now);
  }

  if (y !== lastY) {
    face = y > lastY ? 1 : -1;
    walkUntil = now + 140;
    lastY = y;
  }
  if (!reduce) stage.style.setProperty('--gx', `${Math.round(-y * 0.6)}px`);
}

function frame(now: number) {
  const walking = !reduce && now < walkUntil;
  x = reduce ? targetX : lerp(x, targetX, 0.22);
  mascot.style.setProperty('--x', `${Math.round(x)}px`);
  mascot.style.setProperty('--face', walking ? String(face) : '1');

  // Typewriter. The untyped part is laid out but hidden, so the bubble does not resize.
  let typing = false;
  if (!reduce && line) {
    const shown = Math.min(line.length, Math.floor((now - lineAt) / 20));
    typing = shown < line.length;
    if (on.textContent!.length !== shown || off.textContent!.length !== line.length - shown) {
      on.textContent = line.slice(0, shown);
      off.textContent = line.slice(shown);
    }
  }

  let f: number;
  if (now < celebrateUntil) f = 10 + (Math.floor(now / 180) % 2);
  else if (walking) f = 4 + (Math.floor(now / 110) % 4);
  else if (chapterIx === 0 && scrollY < 40 && !reduce) f = 8 + (Math.floor(now / 420) % 2);
  else if (typing) f = 2 + (Math.floor(now / 130) % 2);
  else if (reduce) f = 0;
  else {
    const k = Math.floor(now / 600) % 8;
    f = k === 7 ? 12 : k % 2;
  }
  mascot.style.setProperty('--f', String(f));

  // Bubble: beside him on wide screens, above him on phones, never off the edge.
  const bw = bubble.offsetWidth;
  let bx: number;
  if (vw >= 900) {
    const roomRight = x + spriteW / 2 < vw / 2;
    bx = roomRight ? x + spriteW + 12 : x - bw - 12;
    bubble.dataset.side = roomRight ? 'right' : 'left';
    bubble.style.setProperty('--bb', `${groundH + spriteH * 0.5}px`);
  } else {
    bx = x + spriteW / 2 - bw / 2;
    bubble.dataset.side = 'top';
    bubble.style.setProperty('--bb', `${groundH + spriteH + 10}px`);
  }
  bx = clamp(bx, 10, vw - bw - 10);
  bubble.style.setProperty('--bx', `${Math.round(bx)}px`);
  bubble.style.setProperty('--tail', `${Math.round(clamp(x + spriteW / 2 - bx - 6, 12, bw - 26))}px`);

  requestAnimationFrame(frame);
}

// ---------- controls ----------
function setQuiet(quiet: boolean) {
  document.body.classList.toggle('quiet', quiet);
  quietBtn?.setAttribute('aria-pressed', String(quiet));
  try {
    localStorage.setItem('cecil-quiet', quiet ? '1' : '0');
  } catch {
    /* storage can be unavailable; the choice then lasts for this visit only */
  }
}
quietBtn?.addEventListener('click', () => setQuiet(!document.body.classList.contains('quiet')));
try {
  if (localStorage.getItem('cecil-quiet') === '1') setQuiet(true);
} catch {
  /* see above */
}

window.addEventListener('cecil:celebrate', () => {
  celebrateUntil = performance.now() + 1800;
});

function relayout() {
  measure();
  onScroll();
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', relayout);
addEventListener('load', relayout);
document.fonts?.ready.then(relayout);
relayout();
x = targetX;
requestAnimationFrame(frame);
