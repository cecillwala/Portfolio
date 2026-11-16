// The home page: a street in Nairobi at night. Everything is drawn here, in code.
// The view is 426x240 art pixels; the street is wider and the camera follows Cecil.
import { still, rng, dth, layer, R, mix, shade, textW, neon, loadCecil, drawCecil, SPRITE, blip, chime, step, door, soundButton } from './pixel.js';

const VW = 426, H = 240, GY = 200, W = 704, PAD = 14;
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** The places on the street. href: the page behind the door, or null while it is being built. */
const P = [
  { id: 'EGERTON', title: 'Egerton University', category: 'Education · 2022–2026', status: 'Graduating 27 November 2026', x: 20, w: 104, h: 88, neon: '#7dff9a', kind: 'hall', href: null, say: 'Egerton University. Computer Science, 2022 to 2026. I graduate on 27 November.' },
  { id: 'PODII', title: 'Podii Consultants', category: 'Experience · 2024', status: 'Technical intern · Six months', x: 142, w: 64, h: 104, neon: '#c79bff', kind: 'office', href: null, say: 'Podii Consultants. My first desk: six months as a technical intern in 2024.' },
  { id: 'GIKTEK', title: 'GikTek', category: 'Experience', status: 'Spring Boot · Angular · Kubernetes', x: 228, w: 104, h: 132, neon: '#5fe1ff', kind: 'tower', href: null, say: 'GikTek. Spring Boot, Angular, Kubernetes, and the dashboards that watch them.' },
  { id: 'MUSONI', title: 'Musoni', category: 'Featured project', status: 'In testing · Over 130 active users', x: 356, w: 98, h: 104, neon: '#ff9a5c', kind: 'shop', href: '/musoni', say: 'Musoni. The loan app I led: Flutter app, backend, staff portal and USSD.' },
  { id: 'LEXIMS', title: 'LexIMS', category: 'Project · In development', status: 'Integrated Management System', x: 478, w: 96, h: 126, neon: '#ffe066', kind: 'archive', href: null, say: 'An Integrated Management System for projects, compliance, audits and continual improvement.' },
  { id: 'POST', title: 'Let’s connect', category: 'The post office', status: '', x: 602, w: 76, h: 62, neon: '#ff6b8b', kind: 'post', href: null, say: 'Find my details and links on the work page. I’m a software developer based in Nairobi.' },
];
const BODY = '#12163a', HI = '#262d62', LO = '#0a0d26', TRIM = '#2e3670';

export async function initStreet(onProgress = () => {}) {
  // Keep the loading screen up until the page, typeface and character are ready.
  const sheet = loadCecil();
  // Three asset milestones plus the first complete scene frame. These are readiness
  // percentages, rather than an estimate of downloaded bytes.
  let ready = 0;
  const track = (promise) => promise.then(() => onProgress(++ready * 25));
  await Promise.all([
    track(sheet.decode()),
    track(document.fonts.ready),
    track(document.readyState === 'complete' ? Promise.resolve() : new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true });
    })),
  ]);
  const stage = document.getElementById('stage'), cv = document.getElementById('street');
  cv.width = VW; cv.height = H;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  // Cover the viewport with the fixed-ratio art. Tall screens crop the sides; wide screens can
  // crop the sky. Align the art to the bottom so the pavement stays in frame.
  const view = document.getElementById('view');
  let visW = VW;
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    const s = Math.max(w / VW, h / H);
    view.style.width = VW * s + 'px'; view.style.height = H * s + 'px';
    view.style.left = (w - VW * s) / 2 + 'px';
    visW = w / s;
  }
  new ResizeObserver(fit).observe(stage); fit();

  // ---------- sky ----------
  const [sky, sk] = layer(VW, H);
  const STOPS = [[0, '#060a1c'], [48, '#0a1130'], [88, '#141a48'], [122, '#2a2364'], [148, '#4f2e75'], [170, '#86406f'], [187, '#c96358'], [200, '#f0a25a']];
  for (let y = 0; y < GY; y++) {
    let i = 0; while (i < STOPS.length - 2 && y >= STOPS[i + 1][0]) i++;
    const t = (y - STOPS[i][0]) / (STOPS[i + 1][0] - STOPS[i][0]);
    for (let x = 0; x < VW; x++) R(sk, dth(x, y, t) ? STOPS[i + 1][1] : STOPS[i][1], x, y, 1, 1);
  }
  const MOON = { x: 352, y: 42, r: 13 };
  shade(sk, '#2c3273', MOON.x - 34, MOON.y - 34, MOON.x + 34, MOON.y + 34, (x, y) => { const d = Math.hypot(x - MOON.x, y - MOON.y); return d < MOON.r ? 0 : Math.max(0, 0.5 - (d - MOON.r) / 36); });
  for (let y = -MOON.r; y <= MOON.r; y++) for (let x = -MOON.r; x <= MOON.r; x++) {
    if (Math.hypot(x + 0.5, y + 0.5) > MOON.r) continue;
    R(sk, Math.hypot(x + 5, y + 5) < MOON.r - 1 ? '#f4efd8' : '#cfc7a6', MOON.x + x, MOON.y + y, 1, 1);
  }
  [[-6, -4, 3], [3, 2, 2], [-2, 6, 2], [6, -7, 1], [-9, 3, 1]].forEach(([x, y, r]) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (Math.hypot(i, j) <= r) R(sk, '#ddd5b4', MOON.x + x + i, MOON.y + y + j, 1, 1); });
  const sr = rng(11);
  const stars = Array.from({ length: 120 }, () => ({ x: Math.floor(sr() * VW), y: Math.floor(sr() * sr() * 150), b: 0.35 + sr() * 0.65, sp: 0.6 + sr() * 2.2, ph: sr() * 6.28 }));

  // ---------- clouds ----------
  function cloud(seed, w, h, body, under) {
    const [c, x] = layer(w, h), r = rng(seed), puffs = [];
    for (let i = 0; i < 6; i++) puffs.push([w * (0.14 + 0.72 * (i / 5)) + (r() - 0.5) * 6, h * (0.5 + (r() - 0.5) * 0.3), w * (0.1 + r() * 0.1), h * (0.26 + r() * 0.2)]);
    for (let py = 0; py < h - 1; py++) for (let px = 0; px < w; px++) {
      let inside = false, low = false;
      for (const [cx, cy, rx, ry] of puffs) { const d = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2; if (d <= 1) { inside = true; if (py > cy + ry * 0.25) low = true; } }
      if (inside) R(x, low && dth(px, py, 0.75) ? under : body, px, py, 1, 1);
    }
    return c;
  }
  const clouds = [
    { img: cloud(3, 96, 18, '#1b2052', '#2c2a6a'), x: 40, y: 62, v: 2.2 },
    { img: cloud(5, 70, 14, '#161b4a', '#262662'), x: 230, y: 30, v: 1.4 },
    { img: cloud(8, 120, 20, '#3a2c70', '#6b3f7c'), x: 300, y: 112, v: 3.1 },
    { img: cloud(9, 84, 16, '#553074', '#96506f'), x: 110, y: 146, v: 3.8 },
  ];

  // ---------- skylines behind the street ----------
  function skyline(c, seed, col, o) {
    const r = rng(seed); let x = -PAD;
    while (x < o.span + PAD) {
      const w = o.w[0] + Math.floor(r() * (o.w[1] - o.w[0])), h = o.h[0] + Math.floor(r() * r() * (o.h[1] - o.h[0])), top = GY - h;
      R(c, col, x, top, w, h); R(c, o.edge, x, top, 1, h);
      const k = r();
      if (k < 0.28) R(c, col, x + 3, top - 4, w - 6, 4);
      else if (k < 0.46) { R(c, col, x + (w >> 1), top - 14, 1, 14); o.blink && o.blink.push({ x: x + (w >> 1), y: top - 15, ph: r() * 3 }); }
      else if (k < 0.62) { R(c, col, x + 3, top - 5, 7, 5); R(c, col, x + 4, top - 6, 5, 1); }
      else if (k < 0.72) for (let i = 0; i < 6; i++) R(c, col, x + i, top - 6 + i, w - 2 * i, 1);
      const floorLit = r() < 0.5;
      for (let wy = top + 5; wy < GY - 5; wy += o.win[1] + o.gap[1]) {
        const boost = floorLit && r() < 0.18 ? 0.5 : 0;
        for (let wx = x + 3; wx < x + w - o.win[0] - 1; wx += o.win[0] + o.gap[0])
          if (r() < o.lit + boost) R(c, o.cols[Math.floor(r() * o.cols.length)], wx, wy, o.win[0], o.win[1]);
      }
      x += w + Math.floor(r() * 5) - 1;
    }
  }
  const blinks = [], midBlink = [];
  const FW = VW + Math.ceil((W - VW) * 0.25), MW = VW + Math.ceil((W - VW) * 0.5);
  const [far, fa] = layer(FW + PAD * 2, H); fa.translate(PAD, 0);
  skyline(fa, 21, '#2a2e6c', { span: FW, w: [16, 38], h: [35, 118], edge: '#343a80', win: [1, 1], gap: [3, 4], lit: 0.13, cols: ['#8e8fd6', '#c6a07c', '#8e8fd6'] });
  { // KICC, as a silhouette
    const x = 372, top = GY - 142;
    R(fa, '#2a2e6c', x, top, 18, 142); R(fa, '#343a80', x, top, 1, 142);
    R(fa, '#2a2e6c', x - 9, top + 8, 36, 6); R(fa, '#343a80', x - 9, top + 8, 36, 1); R(fa, '#2a2e6c', x - 5, top + 14, 28, 2);
    R(fa, '#2a2e6c', x + 3, top - 8, 12, 8); R(fa, '#2a2e6c', x - 2, top - 11, 22, 3); R(fa, '#2a2e6c', x + 8, top - 24, 2, 13);
    for (let y = top + 22; y < GY - 6; y += 5) for (let i = 2; i < 16; i += 3) if (((x + y + i) * 7) % 5 < 2) R(fa, '#8e8fd6', x + i, y, 1, 2);
    blinks.push({ x: x + 9 + PAD, y: top - 25, ph: 0.4, layer: 'far' });
  }
  { // Times Tower, as a silhouette
    const x = 104, top = GY - 152;
    R(fa, '#2a2e6c', x, top + 16, 20, 136); R(fa, '#343a80', x, top + 16, 1, 136); R(fa, '#2a2e6c', x + 3, top + 6, 14, 10); R(fa, '#2a2e6c', x + 6, top, 8, 6); R(fa, '#2a2e6c', x + 9, top - 10, 2, 10);
    for (let y = top + 22; y < GY - 6; y += 6) for (let i = 3; i < 17; i += 4) if (((x * 3 + y + i) * 11) % 7 < 2) R(fa, '#c6a07c', x + i, y, 2, 2);
  }
  fa.globalCompositeOperation = 'source-atop';
  shade(fa, '#86406f', -PAD, GY - 64, FW + PAD, GY, (x, y) => 0.5 * (y - (GY - 64)) / 64);
  fa.globalCompositeOperation = 'source-over';
  const [mid, mi] = layer(MW + PAD * 2, H); mi.translate(PAD, 0);
  skyline(mi, 37, '#161a44', { span: MW, w: [28, 58], h: [50, 146], edge: '#20265a', win: [2, 3], gap: [3, 4], lit: 0.2, cols: ['#ffd27a', '#ffb454', '#ffd27a', '#7fd4ff'], blink: midBlink });
  mi.globalCompositeOperation = 'source-atop';
  shade(mi, '#3a2a66', -PAD, GY - 44, MW + PAD, GY, (x, y) => 0.4 * (y - (GY - 44)) / 44);
  mi.globalCompositeOperation = 'source-over';

  // ---------- the six places ----------
  const [near, ne] = layer(W, H);
  const wins = [], wr = rng(77);
  for (const b of P) {
    const top = (b.top = GY - b.h);
    b.door = b.kind === 'shop' ? b.x + b.w - 30 : b.x + (b.w >> 1) - 9;
    b.doorX = b.door + 9;
    R(ne, BODY, b.x, top, b.w, b.h); R(ne, HI, b.x, top, 2, b.h); R(ne, LO, b.x + b.w - 5, top, 5, b.h);
    R(ne, TRIM, b.x - 2, top - 3, b.w + 4, 3); R(ne, '#3c4688', b.x - 2, top - 3, b.w + 4, 1);
    R(ne, TRIM, b.x, GY - 46, b.w, 2);
    if (b.kind === 'hall') {
      for (let i = 17; i >= 0; i--) { const half = (17 - i) * 2.75 + 2; R(ne, '#171c48', b.x + b.w / 2 - half, top - 21 + (17 - i), half * 2, 1); R(ne, '#3c4688', b.x + b.w / 2 - half, top - 21 + (17 - i), 2, 1); }
      R(ne, TRIM, b.x + (b.w >> 1), top - 40, 1, 20); R(ne, '#7dff9a', b.x + (b.w >> 1) + 1, top - 40, 9, 5); R(ne, '#3fae62', b.x + (b.w >> 1) + 1, top - 37, 9, 2);
      for (const cx of [10, 30, b.w - 34, b.w - 14]) { R(ne, TRIM, b.x + cx, GY - 44, 4, 44); R(ne, '#3c4688', b.x + cx, GY - 44, 1, 44); }
    }
    if (b.kind === 'office') { R(ne, '#0a0d26', b.x + 8, top - 17, 20, 12); R(ne, '#1a2052', b.x + 9, top - 16, 18, 2); R(ne, '#0a0d26', b.x + 10, top - 5, 2, 2); R(ne, '#0a0d26', b.x + 24, top - 5, 2, 2); R(ne, TRIM, b.x + 44, top - 9, 10, 6); }
    if (b.kind === 'tower') {
      R(ne, BODY, b.x + 16, top - 28, b.w - 32, 25); R(ne, HI, b.x + 16, top - 28, 2, 25); R(ne, LO, b.x + b.w - 20, top - 28, 4, 25); R(ne, TRIM, b.x + 14, top - 30, b.w - 28, 2);
      R(ne, BODY, b.x + 34, top - 44, b.w - 68, 14); R(ne, TRIM, b.x + 32, top - 46, b.w - 64, 2);
      R(ne, TRIM, b.x + (b.w >> 1), top - 66, 1, 20); R(ne, TRIM, b.x + (b.w >> 1) - 3, top - 58, 7, 1); R(ne, TRIM, b.x + (b.w >> 1) - 2, top - 52, 5, 1);
      blinks.push({ x: b.x + (b.w >> 1), y: top - 67, ph: 0, layer: 'near' });
      for (let x = b.x + 22; x < b.x + b.w - 26; x += 8) wins.push({ x, y: top - 22, w: 5, h: 7, on: wr() < 0.6, col: '#5fe1ff', tv: false });
    }
    if (b.kind === 'archive') {
      for (let j = 0; j < 20; j++) { const half = Math.round(Math.sqrt(400 - (19 - j) * (19 - j))); R(ne, '#171c48', b.x + (b.w >> 1) - half, top - 23 + j, half * 2, 1); R(ne, '#3c4688', b.x + (b.w >> 1) - half, top - 23 + j, 2, 1); }
      R(ne, TRIM, b.x + (b.w >> 1), top - 31, 1, 8);
      for (let cx = 6; cx < b.w - 6; cx += 21) R(ne, '#1a2052', b.x + cx, top + 22, 3, b.h - 68);
    }
    if (b.kind === 'post') { for (let i = 0; i < 10; i++) R(ne, i === 0 ? '#3c4688' : '#171c48', b.x - 2 + i, top - 13 + i, b.w + 4 - i * 2, 1); R(ne, '#171c48', b.x - 2, top - 4, b.w + 4, 1); }
    if (b.kind === 'shop') {
      for (let i = 0; i < b.w - 8; i++) { const col = Math.floor(i / 7) % 2 ? '#f4efd8' : '#ff9a5c'; R(ne, col, b.x + 4 + i, GY - 54, 1, 7); R(ne, mix(col, '#12163a', 0.35), b.x + 4 + i, GY - 47, 1, i % 7 === 0 || i % 7 === 6 ? 1 : 2); }
      R(ne, LO, b.x + 8, GY - 40, b.w - 46, 30); R(ne, TRIM, b.x + 7, GY - 41, b.w - 44, 1); R(ne, TRIM, b.x + 7, GY - 10, b.w - 44, 1);
      b.shop = { x: b.x + 9, y: GY - 39, w: b.w - 48, h: 28 };
    }
    const y0 = top + (b.kind === 'archive' ? 30 : 26), y1 = GY - (b.kind === 'shop' ? 72 : 58);
    for (let y = y0; y <= y1; y += 14) for (let x = b.x + 9; x <= b.x + b.w - 16; x += 12) {
      R(ne, '#090c22', x, y, 7, 9); R(ne, '#1a2156', x, y, 7, 1); R(ne, '#1a2156', x, y, 1, 9);
      wins.push({ x, y, w: 7, h: 9, on: wr() < 0.5, col: ['#ffd27a', '#ffd27a', '#ffb454', '#ffe6a6'][Math.floor(wr() * 4)], tv: wr() < 0.07 });
    }
    R(ne, TRIM, b.door - 2, GY - 35, 22, 35); R(ne, '#3c4688', b.door - 2, GY - 35, 22, 1); R(ne, '#3c4688', b.door - 3, GY - 1, 24, 1);
    b.signW = textW(b.id, 2); b.signX = b.x + ((b.w - b.signW) >> 1); b.signY = top + 9;
    R(ne, '#080a1e', b.signX - 4, b.signY - 3, b.signW + 8, 16);
    shade(ne, mix(b.neon, BODY, 0.45), b.signX - 6, b.signY + 13, b.signX + b.signW + 6, b.signY + 21, (x, y) => 0.45 * (1 - (y - b.signY - 13) / 8));
  }

  // ---------- pavement, road, lamps ----------
  const [street, st] = layer(W, H);
  R(st, '#262b56', 0, GY, W, 18); R(st, '#3a4280', 0, GY, W, 1);
  for (let x = 0; x < W; x += 16) R(st, '#1d2148', x, GY + 1, 1, 16);
  R(st, '#1d2148', 0, GY + 9, W, 1);
  R(st, '#3a4280', 0, GY + 17, W, 1); R(st, '#0a0c22', 0, GY + 18, W, 1);
  R(st, '#0f1230', 0, GY + 19, W, 21);
  shade(st, '#161a3e', 0, GY + 19, W, H, () => 0.25);
  for (let x = 6; x < W; x += 30) R(st, '#6e6a52', x, GY + 30, 15, 1);
  for (const b of P) shade(st, '#ffd27a', b.doorX - 22, GY + 1, b.doorX + 22, GY + 16, (x, y) => { const t = (y - GY) / 16; return Math.abs(x - b.doorX) < 9 + t * 12 ? 0.55 * (1 - t) : 0; });
  for (const x of [133, 344, 588]) {
    st.fillStyle = '#ffe9a8';
    for (let y = GY - 54; y < GY + 12; y++) { const t = (y - (GY - 54)) / 66, half = Math.round(3 + t * 17); st.globalAlpha = 0.07 * (1 - t * 0.3); st.fillRect(x - 6 - half, y, half * 2, 1); st.fillRect(x - 6 - (half >> 1), y, half, 1); }
    st.globalAlpha = 1;
    shade(st, '#ffe9a8', x - 34, GY + 2, x + 22, GY + 16, (px, py) => (((px - x + 6) / 22) ** 2 + ((py - GY - 8) / 5) ** 2 < 1 ? 0.36 : 0));
    R(st, '#39417c', x, GY - 60, 2, 60); R(st, '#39417c', x - 8, GY - 60, 9, 2); R(st, '#fff3c4', x - 10, GY - 58, 6, 3); R(st, '#39417c', x - 1, GY - 2, 4, 2);
  }
  R(st, '#c0354f', 596, GY - 13, 7, 13); R(st, '#e35a73', 596, GY - 13, 7, 2); R(st, '#12163a', 597, GY - 9, 5, 1);

  function matatu(c, x, y) {
    x = Math.round(x);
    shade(c, '#fff3c4', x - 46, y + 2, x + 2, y + 16, (px, py) => { const t = (x - px) / 46; return Math.abs(py - (y + 10)) < 2 + t * 6 ? 0.4 * (1 - t) : 0; });
    R(c, '#f4efd8', x + 2, y, 34, 12); R(c, '#f4efd8', x, y + 4, 4, 8); R(c, '#d9d2b4', x + 2, y + 11, 34, 1);
    R(c, '#ff6b8b', x, y + 7, 36, 2); R(c, '#5fe1ff', x + 6, y + 9, 26, 1); R(c, '#ffe066', x + 20, y - 1, 12, 1);
    R(c, '#1a2156', x + 2, y + 2, 5, 4); for (let i = 0; i < 4; i++) R(c, i === 1 ? '#ffd27a' : '#1a2156', x + 9 + i * 6, y + 2, 5, 4);
    R(c, '#fff3c4', x, y + 9, 2, 2); R(c, '#ff3b4f', x + 35, y + 8, 1, 3);
    for (const wx of [6, 26]) { R(c, '#05060f', x + wx, y + 10, 6, 5); R(c, '#05060f', x + wx - 1, y + 11, 8, 3); R(c, '#8e96c9', x + wx + 2, y + 12, 2, 1); }
  }

  // ---------- Cecil and the readable information panel ----------
  const C = { x: 312, tx: 312, dir: 1, key: 0, mode: 'idle', at: null, goal: null, waveUntil: 0, step: 0 };
  const panel = document.getElementById('place-card');
  const panelTitle = document.getElementById('place-title');
  const panelActions = panel.querySelector('.place-card__actions');
  let panelTrigger = null, focusOnArrival = false;
  function closePanel(restoreFocus = false) {
    const hadFocus = panel.contains(document.activeElement);
    panel.classList.add('off');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    if (restoreFocus && hadFocus) panelTrigger?.focus();
  }
  function showPanel(title, description, category, actions, status = '', accent = '#ffe066') {
    if (!panel.contains(document.activeElement)) panelTrigger = document.activeElement;
    panelTitle.textContent = title;
    document.getElementById('place-description').textContent = description;
    document.getElementById('place-category').textContent = category;
    const statusEl = document.getElementById('place-status');
    statusEl.textContent = status;
    statusEl.hidden = !status;
    panelActions.replaceChildren(...actions);
    panel.style.setProperty('--accent', accent);
    panel.scrollTop = 0;
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.remove('off');
    // Follow keyboard selection into the panel, without stealing pointer focus.
    if (focusOnArrival || panelTrigger?.closest('#places')) {
      // Wait for visibility to update before focusing a previously hidden card.
      requestAnimationFrame(() => {
        if (!panel.inert) panelTitle.focus({ preventScroll: true });
      });
    }
    focusOnArrival = false;
  }
  panel.querySelector('.place-card__close').addEventListener('click', () => closePanel(true));
  const hint = document.getElementById('hint');
  let cam = Math.max(0, Math.min(W - VW, C.x - VW / 2));
  let busX = W + 60, planeX = 90, hover = null, mx = 0, mxS = 0, lastAct = performance.now(), leaving = false;

  const chip = (label, fn, primary = false) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'primary'; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); }); return b; };
  const link = (label, href) => { const a = document.createElement('a'); a.textContent = label; a.href = base + href; return a; };
  const pick = (id) => P.find((p) => p.id === id);

  function go(b) { focusOnArrival = panel.contains(document.activeElement) || !!document.activeElement?.closest('#places'); C.tx = b.doorX; C.at = null; C.goal = b; C.mode = 'walk'; closePanel(true); blip(660, 0.04); lastAct = performance.now(); hint.hidden = true; }
  function arrive(b) {
    C.at = b; chime();
    const actions = b.href
      ? [chip('Explore ' + b.title + ' →', () => enter(b), true)]
      : [link(b.id === 'POST' ? 'View contact details →' : 'Read more on my work →', '/work#' + ({ EGERTON: 'egerton', PODII: 'podii', GIKTEK: 'giktek', LEXIMS: 'lexims', POST: 'contact' }[b.id]))];
    actions[0].classList.add('primary');
    showPanel(b.title, b.say, b.category, actions, b.status, b.neon);
  }
  function enter(b) {
    if (leaving || !b.href) return;
    leaving = true; door();
    const r = cv.getBoundingClientRect(), s = r.width / VW;
    const iris = document.getElementById('iris');
    iris.style.left = r.left + (b.doorX - Math.round(cam)) * s + 'px';
    iris.style.top = r.top + (GY - 16) * s + 'px';
    iris.classList.add('closing');
    setTimeout(() => { location.href = base + b.href; }, still ? 0 : 620);
  }
  function greet() {
    showPanel('Karibu. I’m Cecil.', 'A software developer in Nairobi. This street is my career so far. Choose a building to explore my work.', 'Meet your guide', [
      chip('Explore Musoni →', () => go(pick('MUSONI')), true),
      link('Browse all work', '/work'),
    ]);
  }

  const toArt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW + cam, (e.clientY - r.top) / r.height * H]; };
  const placeAt = (x, y) => P.find((b) => x >= b.x - 2 && x <= b.x + b.w + 2 && y >= b.top - 46 && y <= GY + 8) || null;
  const onCecil = (x, y) => Math.abs(x - C.x) < 14 && y > GY - 26 && y < GY + 14;
  cv.addEventListener('pointermove', (e) => { const [x, y] = toArt(e); hover = placeAt(x, y); mx = ((x - cam) / VW) * 2 - 1; cv.style.cursor = hover || onCecil(x, y) ? 'pointer' : 'default'; });
  cv.addEventListener('pointerleave', () => { hover = null; mx = 0; });
  cv.addEventListener('click', (e) => {
    const [x, y] = toArt(e), b = placeAt(x, y);
    lastAct = performance.now();
    if (onCecil(x, y)) { C.waveUntil = performance.now() + 1800; blip(880, 0.06, 'square', 0.03, 1320); greet(); return; }
    if (b) { if (C.at === b && b.href) enter(b); else go(b); }
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePanel(true); return; }
    if (e.target instanceof HTMLElement && (e.target.closest('button, a') && e.key === 'Enter' || e.target.closest('#place-card') && e.key.startsWith('Arrow'))) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { C.key = e.key === 'ArrowLeft' ? -1 : 1; C.goal = null; C.at = null; C.mode = 'walk'; closePanel(); hint.hidden = true; lastAct = performance.now(); e.preventDefault(); }
    if (e.key === 'Enter' && C.at && C.at.href) enter(C.at);
  });
  addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { C.key = 0; C.tx = C.x; } });
  const nav = document.getElementById('places');
  P.forEach((b) => nav.appendChild(chip('Walk to ' + b.id[0] + b.id.slice(1).toLowerCase(), () => go(b))));
  soundButton(document.getElementById('snd'));
  const clock = document.getElementById('clock');
  const tick = () => { try { clock.textContent = 'Nairobi ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date()); } catch { clock.textContent = 'Nairobi'; } };
  tick(); setInterval(tick, 20000);

  // ---------- frame ----------
  let last = performance.now(), winAt = 0, flick = { b: null, i: -1, until: 0 }, stepAt = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
    mxS += (mx - mxS) * 0.06; const par = still ? 0 : mxS;
    const edge = (VW - visW) / 2;
    const camT = Math.max(-edge, Math.min(W - VW + edge, C.x - VW / 2)); cam += (camT - cam) * (still ? 1 : 0.07); const cr = Math.round(cam);

    g.drawImage(sky, 0, 0);
    for (const s of stars) { const b = still ? s.b : s.b * (0.62 + 0.38 * Math.sin(t * s.sp + s.ph)); if (b > 0.3) R(g, b > 0.82 ? '#f4efd8' : b > 0.55 ? '#9aa1d6' : '#4a5190', s.x - par, s.y, 1, 1); }
    for (const c of clouds) { if (!still) c.x += c.v * dt; if (c.x > VW + 10) c.x = -c.img.width - 10; g.drawImage(c.img, Math.round(c.x - par * 2), c.y); }
    if (!still) { planeX += 13 * dt; if (planeX > VW + 400) planeX = -30; }
    R(g, '#f4efd8', planeX, 30, 2, 1); if (Math.floor(t * 1.6) % 2) R(g, '#ff3b4f', planeX - 2, 30, 1, 1);

    const fx = Math.round(-PAD - cam * 0.25 - par * 2), mxo = Math.round(-PAD - cam * 0.5 - par * 4);
    g.drawImage(far, fx, 0); g.drawImage(mid, mxo, 0);
    for (const b of blinks) if (b.layer === 'far' && Math.sin(t * 2.2 + b.ph) > 0.2) R(g, '#ff3b4f', b.x + fx, b.y, 2, 2);
    for (const b of midBlink) if (Math.sin(t * 1.7 + b.ph) > 0.3) R(g, '#ff3b4f', b.x + PAD + mxo, b.y, 1, 1);

    g.save(); g.translate(-cr, 0);
    g.drawImage(near, 0, 0);
    if (!still && now > winAt) { winAt = now + 500 + Math.random() * 900; const w = wins[Math.floor(Math.random() * wins.length)]; w.on = !w.on; }
    for (const w of wins) if (w.on) {
      const col = w.tv ? (Math.sin(t * 9 + w.x) > 0 ? '#7fd4ff' : '#4fa3d8') : w.col;
      R(g, col, w.x, w.y, w.w, w.h); R(g, '#fff6d6', w.x, w.y, w.w, 1); R(g, mix(col, '#12163a', 0.45), w.x, w.y + w.h - 2, w.w, 2); R(g, mix(col, '#12163a', 0.6), w.x + (w.w >> 1), w.y, 1, w.h);
    }
    if (!still && now > flick.until + 2500 + Math.random() * 4000) { const b = P[Math.floor(Math.random() * P.length)]; flick = { b, i: Math.floor(Math.random() * b.id.length), until: now + 140 }; }
    for (const b of P) {
      const hot = hover === b || C.at === b || C.goal === b;
      if (b.shop) {
        R(g, '#ffd27a', b.shop.x, b.shop.y, b.shop.w, b.shop.h); R(g, '#fff0b8', b.shop.x, b.shop.y, b.shop.w, 2); R(g, '#c98a4b', b.shop.x, b.shop.y + b.shop.h - 5, b.shop.w, 5);
        for (let x = b.shop.x + 12; x < b.shop.x + b.shop.w; x += 13) R(g, '#12163a', x, b.shop.y, 1, b.shop.h);
        R(g, '#12163a', b.shop.x + 6, b.shop.y + 12, 5, 11); R(g, '#12163a', b.shop.x + 20, b.shop.y + 9, 7, 14); R(g, '#12163a', b.shop.x + 34, b.shop.y + 13, 4, 10);
      }
      R(g, hot ? '#fff0b8' : '#ffc866', b.door, GY - 33, 18, 32); R(g, hot ? '#ffd27a' : '#d99a45', b.door, GY - 8, 18, 7); R(g, '#12163a', b.door + 8, GY - 33, 2, 32); R(g, '#12163a', b.door + 13, GY - 17, 2, 2);
      neon(g, b.id, b.signX, b.signY, 2, b.neon, '#080a1e', flick.b === b && now < flick.until ? flick.i : -1, hot);
      if (hot) { g.strokeStyle = b.neon; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -Math.floor(t * 8); g.strokeRect(b.x - 3.5, b.top - 5.5, b.w + 7, b.h + 5); g.setLineDash([]); }
    }
    for (const b of blinks) if (b.layer === 'near' && Math.sin(t * 2.6 + b.ph) > 0) { R(g, '#ff3b4f', b.x - 1, b.y - 1, 3, 3); R(g, '#ffb0b8', b.x, b.y, 1, 1); }
    g.drawImage(street, 0, 0);

    if (C.key) C.tx = Math.max(16, Math.min(W - 16, C.x + C.key * 40));
    const dx = C.tx - C.x, moving = Math.abs(dx) > 0.6;
    if (moving) {
      C.dir = dx > 0 ? 1 : -1; C.x += Math.sign(dx) * Math.min(Math.abs(dx), 74 * dt);
      if (now > stepAt) { stepAt = now + 150; C.step = (C.step + 1) % 4; if (C.step % 2 === 0) step(); }
    } else if (C.mode === 'walk') {
      C.mode = 'idle';
      const b = C.goal || P.find((p) => Math.abs(p.doorX - C.x) < 12);
      C.goal = null;
      if (b && C.at !== b) arrive(b);
    }
    let f = SPRITE.idle;
    if (moving) f = SPRITE.walk + C.step;
    else if (now < C.waveUntil) f = SPRITE.wave;
    else f = Math.floor(t * 0.9) % 6 === 5 ? SPRITE.blink : SPRITE.idle;
    shade(g, '#0a0c22', C.x - 12, GY + 9, C.x + 12, GY + 15, (x, y) => (((x - C.x) / 11) ** 2 + ((y - GY - 12) / 2.6) ** 2 < 1 ? 0.6 : 0));
    drawCecil(g, sheet, f, C.x, GY + 13, moving && C.dir < 0);

    if (!still) { busX -= 52 * dt; if (busX < -520) busX = W + 80; }
    matatu(g, busX, GY + 22);
    g.restore();

    // The panel lives outside the scaled/cropped artwork, so type stays readable.
    const sx = (C.x - cr - edge) / visW * stage.clientWidth;
    const half = panel.offsetWidth / 2;
    const left = Math.max(half + 16, Math.min(stage.clientWidth - half - 16, sx));
    panel.style.setProperty('--panel-x', left + 'px');
    panel.style.setProperty('--panel-bottom', (69 * view.clientHeight / H) + 'px');
    requestAnimationFrame(frame);
  }
  C.waveUntil = performance.now() + 2600;
  greet();
  // Resolve only after a complete frame, so the loader never reveals an empty canvas.
  await new Promise((resolve, reject) => requestAnimationFrame((now) => {
    try { frame(now); resolve(); } catch (error) { reject(error); }
  }));
  onProgress(100);
}
