// Shared pixel-art helpers for every scene: seeded random, ordered dithering, layers,
// the neon lettering, Cecil's sprite sheet, and sound.

export const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const rng = (s) => () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
/** Ordered dither: should the pixel at (x, y) be drawn for a coverage of a (0 to 1)? */
export const dth = (x, y, a) => a * 16 > BAYER[y & 3][x & 3] + 0.5;

export function layer(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}

export const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => {
  const A = hexRgb(a), B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

/** Dithered fill over a box; alpha(x, y) returns coverage 0 to 1. */
export function shade(c, col, x0, y0, x1, y1, alpha) {
  c.fillStyle = col;
  for (let y = Math.floor(y0); y < y1; y++)
    for (let x = Math.floor(x0); x < x1; x++) if (dth(x, y, alpha(x, y))) c.fillRect(x, y, 1, 1);
}

// ---------- pixel lettering (5 rows; most letters 3 wide, M N W wider) ----------
const F = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', O: '010101101101010', P: '110101110100100', Q: '010101101110011',
  R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
  X: '101101010101101', Y: '101101010010010', Z: '111001010100111', ' ': '000000000000000',
  M: '1000111011101011000110001', N: '10011101101110011001', W: '1000110001101011101110001',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001',
  5: '111100110001110', 6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110',
};
const glyph = (ch) => { const s = F[ch] ?? F[' ']; const w = s.length / 5; return { w, at: (cx, cy) => s[cy * w + cx] === '1' }; };
export const textW = (t, k = 1) => [...t].reduce((n, ch) => n + (glyph(ch).w + 1) * k, -k);
/** Draw text with the pixel font. k = size of one font pixel; skip = index of a letter to leave dark. */
export function text(c, t, x, y, k, col, skip = -1) {
  c.fillStyle = col;
  let cx = x;
  [...t].forEach((ch, i) => {
    const gl = glyph(ch);
    if (i !== skip) for (let r = 0; r < 5; r++) for (let q = 0; q < gl.w; q++) if (gl.at(q, r)) c.fillRect(cx + q * k, y + r * k, k, k);
    cx += (gl.w + 1) * k;
  });
}
/** A neon sign: dim halo one pixel out, bright letters on top. */
export function neon(c, t, x, y, k, col, back = '#080a1e', skip = -1, hot = false) {
  const dim = mix(col, back, 0.55);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) text(c, t, x + dx, y + dy, k, dim, skip);
  text(c, t, x, y, k, hot ? '#ffffff' : col, skip);
}

// ---------- Cecil ----------
// Frames in public/sprites/cecil.png (drawn by design/cecil.py), 30x37 each:
// 0 idle, 1 blink, 2 talk, 3-6 walk (side on, facing right), 7 point, 8 wave, 9 wave and talk.
export const SPRITE = { w: 30, h: 37, idle: 0, blink: 1, talk: 2, walk: 3, point: 7, wave: 8, waveTalk: 9 };
export function loadCecil() {
  const img = new Image();
  img.src = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/sprites/cecil.png';
  return img;
}
/** Draw one frame with his feet centred on (x, feetY). */
export function drawCecil(c, img, frame, x, feetY, flip = false) {
  if (!img.complete || !img.naturalWidth) return;
  c.save();
  c.translate(Math.round(x), Math.round(feetY) - 35);
  if (flip) c.scale(-1, 1);
  c.drawImage(img, frame * SPRITE.w, 0, SPRITE.w, SPRITE.h, -15, 0, SPRITE.w, SPRITE.h);
  c.restore();
}

// ---------- sound: synthesised blips, off until the visitor turns it on ----------
let ac = null;
let on = false;
try { on = localStorage.getItem('cecil-sound') === '1'; } catch { /* storage may be unavailable */ }
function wake() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { on = false; } }
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}
export function blip(f, d = 0.05, type = 'square', vol = 0.035, to = 0) {
  if (!on || !ac) return;
  try {
    const t = ac.currentTime, o = ac.createOscillator(), a = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    a.gain.setValueAtTime(vol, t);
    a.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(a).connect(ac.destination);
    o.start(t); o.stop(t + d + 0.02);
  } catch { /* sound is optional */ }
}
export const chime = () => [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.05), i * 90));
export const step = () => blip(120 + Math.random() * 30, 0.03, 'triangle', 0.03);
export const key = () => blip(880, 0.03, 'square', 0.025);
export const door = () => { blip(220, 0.18, 'triangle', 0.05, 110); setTimeout(() => blip(330, 0.12, 'triangle', 0.04), 120); };
/** Wire a "Sound: on/off" button. Audio can only start from a click, so a saved "on" wakes on the first one. */
export function soundButton(btn) {
  const show = () => { btn.setAttribute('aria-pressed', String(on)); btn.textContent = 'Sound: ' + (on ? 'on' : 'off'); };
  show();
  btn.addEventListener('click', () => {
    on = !on;
    if (on) wake();
    try { localStorage.setItem('cecil-sound', on ? '1' : '0'); } catch { /* ignore */ }
    show();
    if (on) chime();
  });
  if (on) addEventListener('pointerdown', wake, { once: true });
}

// ---------- typewriter speech bubble ----------
/** bubble: element containing .typed and .rest spans (and optionally .chips). */
export function speech(bubble) {
  const typed = bubble.querySelector('.typed'), rest = bubble.querySelector('.rest'), chips = bubble.querySelector('.chips');
  let line = '', at = 0, shown = 0, pending = null;
  const showChips = () => { if (chips && pending) { chips.replaceChildren(...pending); pending = null; } };
  return {
    get line() { return line; },
    get talking() { return !!line && shown < line.length; },
    /** chipEls: buttons or links to show under the line once it has finished typing. */
    say(t, chipEls = []) {
      line = t; at = performance.now(); shown = 0;
      bubble.classList.toggle('off', !t);
      if (chips) chips.replaceChildren();
      pending = chipEls;
      if (still || !t) { typed.textContent = t; rest.textContent = ''; shown = t.length; showChips(); }
    },
    tick(now) {
      if (!line || shown >= line.length) return;
      const n = Math.min(line.length, Math.floor((now - at) / 22));
      if (n === shown) return;
      shown = n;
      typed.textContent = line.slice(0, n);
      rest.textContent = line.slice(n);
      if (n % 3 === 0 && n < line.length) blip(540 + ((n * 37) % 180), 0.02, 'square', 0.015);
      if (n >= line.length) showChips();
    },
  };
}

/** Size a pixel stage to the largest whole-number scale that fits; fractional only when tiny. */
export function fitStage(stage, w, h, maxW = () => innerWidth, maxH = () => innerHeight) {
  const fit = () => {
    const k = Math.min(maxW() / w, maxH() / h);
    const s = k >= 1 ? Math.floor(k) : k;
    stage.style.width = w * s + 'px';
    stage.style.height = h * s + 'px';
    stage.style.setProperty('--px', s + 'px');
  };
  addEventListener('resize', fit);
  fit();
  return fit;
}
