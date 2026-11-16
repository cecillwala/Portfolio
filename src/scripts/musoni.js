// The Musoni page: the shop interior at the top, the pixel phone illustrations, and the neon title.
import { still, dth, layer, R, mix, shade, text, textW, neon, loadCecil, drawCecil, SPRITE, blip, chime, step, door, soundButton, speech, fitStage } from './pixel.js';
import { initUssd } from './ussd.js';

const RW = 426, RH = 150, FY = 112;
const TRIM = '#2e3670', TRIM2 = '#3c4688', ORANGE = '#ff9a5c';
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Things in the room Cecil can walk to. x: where he stands; box: what lights up on hover. */
const HOT = [
  { id: 'exit', label: 'Back to the street', box: [6, 28, 30, 84], x: 46, say: 'Back out to the street?', href: '/' },
  { id: 'app', label: 'The app', box: [174, 36, 28, 48], x: 146, say: 'The app. Sign up, verify your ID, get an offer, repay. I built it in Flutter.', target: '#the-app' },
  { id: 'ussd', label: 'The USSD menu', box: [230, 24, 34, 60], x: 204, say: 'No smartphone? Dial in instead. There is a working one further down.', target: '#ussd' },
  { id: 'behind', label: 'Behind the app', box: [284, 40, 46, 30], x: 256, say: 'The engine room: a Spring Boot backend, and a portal for staff.', target: '#behind' },
  { id: 'running', label: 'Seeing it run', box: [344, 20, 66, 46], x: 316, say: 'Logs, metrics and alerts. I can watch the whole thing running.', target: '#running' },
  { id: 'safeguards', label: 'Safeguards', box: [348, 72, 48, 40], x: 322, say: "It is people's money, so security came first.", target: '#safeguards' },
];

function initRoom() {
  const stage = document.getElementById('room-stage'), cv = document.getElementById('room');
  if (!stage || !cv) return;
  cv.width = RW; cv.height = RH;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  fitStage(stage, RW, RH, () => document.documentElement.clientWidth, () => innerHeight * 0.66);

  // ---------- everything that does not move ----------
  const [room, c] = layer(RW, RH);
  R(c, '#151a48', 0, 0, RW, FY); R(c, '#0f1338', 0, 0, RW, 8);
  for (let x = 20; x < RW; x += 42) R(c, '#1a2052', x, 8, 1, FY - 11);
  R(c, TRIM, 0, FY - 3, RW, 3); R(c, TRIM2, 0, FY - 3, RW, 1);
  R(c, '#0e1232', 0, FY, RW, RH - FY);
  [7, 16, 27].forEach((dy, i) => { R(c, '#161a40', 0, FY + dy, RW, 1); for (let x = (i * 37) % 60; x < RW; x += 60) R(c, '#161a40', x, FY + (i ? [7, 16, 27][i - 1] : 0), 1, dy - (i ? [7, 16, 27][i - 1] : 0)); });
  // window on to the street
  R(c, TRIM, 44, 24, 84, 72);
  const bands = ['#0a1130', '#141a48', '#2a2364', '#4f2e75', '#86406f'];
  for (let y = 26; y < 94; y++) { const f = ((y - 26) / 68) * (bands.length - 1), i = Math.min(bands.length - 2, Math.floor(f)); for (let x = 46; x < 126; x++) R(c, dth(x, y, f - i) ? bands[i + 1] : bands[i], x, y, 1, 1); }
  for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) if (Math.hypot(i, j) <= 5) R(c, '#f4efd8', 108 + i, 40 + j, 1, 1);
  [[46, 30, 14], [58, 44, 12], [72, 24, 18], [88, 38, 10], [100, 20, 14], [112, 34, 14]].forEach(([x, h, w], k) => { R(c, '#161a44', x, 94 - h, w, h); for (let y = 96 - h; y < 92; y += 5) for (let i = 2; i < w - 2; i += 4) if ((x + y + i + k) % 3 === 0) R(c, '#ffd27a', x + i, y, 2, 2); });
  R(c, TRIM, 85, 26, 2, 68); R(c, TRIM, 46, 59, 80, 2); R(c, TRIM2, 42, 96, 88, 3);
  // door
  R(c, TRIM, 6, 40, 30, 72); R(c, '#0a0d26', 8, 42, 26, 70); R(c, '#12163a', 20, 42, 2, 70);
  shade(c, '#86406f', 8, 60, 34, 112, (x, y) => 0.5 * (y - 60) / 52);
  R(c, '#f4efd8', 30, 78, 2, 5);
  R(c, '#080a1e', 8, 29, 19, 9); neon(c, 'EXIT', 10, 31, 1, '#7dff9a');
  // hanging lamps
  for (const x of [150, 330]) {
    c.fillStyle = '#ffe9a8';                                   // a soft cone of light, two steps deep
    for (let y = 19; y < FY + 34; y++) { const t = (y - 19) / (FY + 15), half = Math.round(5 + t * 56); c.globalAlpha = 0.06 * (1 - t * 0.35); c.fillRect(x - half, y, half * 2, 1); c.fillRect(x - (half >> 1), y, half, 1); }
    c.globalAlpha = 1;
    R(c, TRIM, x, 0, 1, 12); R(c, TRIM2, x - 5, 12, 11, 2); R(c, TRIM, x - 7, 14, 15, 3); R(c, '#fff3c4', x - 3, 17, 7, 2);
  }
  // sign on the wall
  const kw = textW('KARIBU', 2); R(c, '#080a1e', 240 - kw / 2 - 4, 9, kw + 8, 16);
  // counter
  R(c, '#1f2558', 150, 87, 188, 25); for (let x = 197; x < 338; x += 47) R(c, '#161a44', x, 88, 1, 21);
  R(c, mix(ORANGE, '#1f2558', 0.4), 150, 87, 188, 1); R(c, '#12163a', 150, 109, 188, 3);
  R(c, TRIM2, 146, 82, 196, 5); R(c, '#5560a8', 146, 82, 196, 1);
  // smartphone on a stand
  R(c, '#0a0d26', 178, 40, 20, 42); for (const [x, y] of [[178, 40], [197, 40], [178, 81], [197, 81]]) R(c, '#151a48', x, y, 1, 1);
  R(c, '#f4efd8', 180, 44, 16, 32); R(c, ORANGE, 180, 44, 16, 5); R(c, '#12163a', 182, 46, 6, 1);
  R(c, '#d9d2b4', 182, 52, 12, 8); R(c, '#12163a', 183, 54, 5, 1); R(c, '#9aa1d6', 183, 57, 8, 1);
  R(c, '#9aa1d6', 182, 63, 10, 1); R(c, '#9aa1d6', 182, 66, 7, 1); R(c, '#38b764', 182, 70, 12, 4); R(c, TRIM, 187, 78, 2, 2);
  // feature phone
  R(c, '#39417c', 254, 26, 3, 6); R(c, '#39417c', 234, 32, 26, 50); R(c, '#5560a8', 234, 32, 1, 50); R(c, TRIM, 258, 32, 2, 50);
  R(c, '#12163a', 237, 36, 20, 18); R(c, '#b7e08a', 238, 37, 18, 16);
  R(c, '#1c2a14', 240, 40, 12, 1); R(c, '#1c2a14', 240, 44, 9, 1); R(c, '#1c2a14', 240, 48, 13, 1);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) R(c, '#c9cff0', 238 + k * 7, 58 + r * 6, 4, 3);
  // server on a shelf
  R(c, TRIM2, 284, 66, 46, 2); R(c, TRIM, 290, 68, 2, 6); R(c, TRIM, 322, 68, 2, 6);
  R(c, '#0a0d26', 288, 44, 38, 22); R(c, TRIM, 288, 44, 38, 1); R(c, TRIM, 288, 51, 38, 1); R(c, TRIM, 288, 58, 38, 1);
  // wall monitor
  R(c, TRIM, 346, 22, 62, 42); R(c, '#080a1e', 348, 24, 58, 38);
  // safe
  R(c, TRIM, 350, 74, 44, 38); R(c, TRIM2, 350, 74, 44, 1); R(c, '#39417c', 354, 78, 36, 30); R(c, '#5560a8', 354, 78, 36, 1);
  for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const d = Math.hypot(i, j); if (d <= 6) R(c, d > 4.4 ? '#f4efd8' : '#12163a', 370 + i, 93 + j, 1, 1); }
  R(c, '#f4efd8', 382, 90, 4, 7); R(c, '#12163a', 350, 112 - 2, 6, 2); R(c, '#12163a', 388, 112 - 2, 6, 2);

  // ---------- Cecil and the bubble ----------
  const sheet = loadCecil();
  const C = { x: 96, tx: 96, dir: 1, step: 0, goal: null, at: null, pointUntil: 0, waveUntil: performance.now() + 2400 };
  const bubbleEl = document.getElementById('room-bubble'), tip = document.getElementById('room-tip');
  const talk = speech(bubbleEl);
  let hover = null, leaving = false;
  const chip = (label, fn, primary = false) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'primary'; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); }); return b; };
  const show = (h) => { const el = document.querySelector(h.target); if (el) el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' }); };
  function leave() { if (leaving) return; leaving = true; door(); const iris = document.getElementById('iris'); iris.classList.remove('opening'); iris.classList.add('closing'); setTimeout(() => { location.href = base + '/'; }, still ? 0 : 620); }
  function go(h) { C.goal = h; C.at = null; C.tx = h.x; talk.say(''); blip(660, 0.04); }
  function arrive(h) {
    C.at = h; C.pointUntil = performance.now() + 4000; chime();
    talk.say(h.say, h.href ? [chip('Yes, back outside', leave, true), chip('Stay', () => talk.say('Then pick something on the counter.'))] : [chip('Show me', () => show(h), true)]);
  }
  const toArt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * RW, (e.clientY - r.top) / r.height * RH]; };
  const at = (x, y) => HOT.find((h) => x >= h.box[0] && x <= h.box[0] + h.box[2] && y >= h.box[1] && y <= h.box[1] + h.box[3]) || null;
  cv.addEventListener('pointermove', (e) => {
    const [x, y] = toArt(e); hover = at(x, y); cv.style.cursor = hover ? 'pointer' : 'default';
    tip.hidden = !hover;
    if (hover) { tip.textContent = hover.label; tip.style.left = ((hover.box[0] + hover.box[2] / 2) / RW) * 100 + '%'; tip.style.top = (hover.box[1] / RH) * 100 + '%'; }
  });
  cv.addEventListener('pointerleave', () => { hover = null; tip.hidden = true; });
  cv.addEventListener('click', (e) => { const [x, y] = toArt(e), h = at(x, y); if (h) { if (C.at === h && !h.href) show(h); else go(h); } });
  const nav = document.getElementById('room-places');
  HOT.forEach((h) => nav.appendChild(chip('Walk to: ' + h.label, () => go(h))));

  // ---------- frame ----------
  let last = performance.now(), stepAt = 0;
  const leds = Array.from({ length: 24 }, (_, i) => ({ x: 291 + (i % 8) * 4, y: 47 + Math.floor(i / 8) * 7, ph: i * 1.7, sp: 2 + (i % 5) }));
  const graph = Array.from({ length: 52 }, (_, i) => 10 + Math.sin(i * 0.5) * 5);
  let graphAt = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
    g.drawImage(room, 0, 0);
    neon(g, 'KARIBU', 240 - kw / 2, 12, 2, ORANGE, '#080a1e', !still && Math.floor(t * 0.7) % 9 === 0 && Math.floor(t * 12) % 2 ? 3 : -1);
    for (const l of leds) if (still || Math.sin(t * l.sp + l.ph) > -0.2) R(g, l.ph % 3 < 1 ? '#ffb454' : '#7dff9a', l.x, l.y, 2, 2);
    if (!still && now > graphAt) { graphAt = now + 220; graph.shift(); graph.push(Math.max(3, Math.min(24, graph[graph.length - 1] + (Math.random() - 0.5) * 7))); }
    for (let i = 0; i < graph.length; i++) { R(g, '#5fe1ff', 351 + i, 54 - Math.round(graph[i]), 1, 1); if (i % 6 === 0) R(g, '#1a2156', 351 + i, 55 - Math.round(graph[i]), 1, Math.round(graph[i])); }
    R(g, '#7dff9a', 350, 26, 3, 3); R(g, '#9aa1d6', 356, 27, 14, 1);
    if (Math.floor(t * 2) % 2) R(g, '#1c2a14', 254, 48, 1, 1);
    if (hover) { g.strokeStyle = ORANGE; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -Math.floor(t * 8); g.strokeRect(hover.box[0] - 1.5, hover.box[1] - 1.5, hover.box[2] + 3, hover.box[3] + 3); g.setLineDash([]); }

    const dx = C.tx - C.x, moving = Math.abs(dx) > 0.6;
    if (moving) { C.dir = dx > 0 ? 1 : -1; C.x += Math.sign(dx) * Math.min(Math.abs(dx), 82 * dt); if (now > stepAt) { stepAt = now + 150; C.step = (C.step + 1) % 4; if (C.step % 2 === 0) step(); } }
    else if (C.goal) { const h = C.goal; C.goal = null; arrive(h); }
    talk.tick(now);
    let f = SPRITE.idle;
    if (moving) f = SPRITE.walk + C.step;
    else if (now < C.waveUntil) f = talk.talking ? SPRITE.waveTalk : SPRITE.wave;
    else if (C.at && !C.at.href && now < C.pointUntil) f = SPRITE.point;
    else if (talk.talking) f = Math.floor(t * 8) % 2 ? SPRITE.talk : SPRITE.idle;
    else f = Math.floor(t * 0.9) % 6 === 5 ? SPRITE.blink : SPRITE.idle;
    shade(g, '#070919', C.x - 12, FY + 22, C.x + 12, FY + 28, (x, y) => (((x - C.x) / 11) ** 2 + ((y - FY - 25) / 2.6) ** 2 < 1 ? 0.6 : 0));
    drawCecil(g, sheet, f, C.x, FY + 26, moving && C.dir < 0);

    const sx = (C.x / RW) * 100, aside = C.at && !C.at.href && !moving ? 19 : 0;   // step the bubble aside so it does not cover what he points at
    const left = Math.max(26, Math.min(74, sx - aside));
    bubbleEl.style.left = left + '%';
    bubbleEl.style.top = ((FY + 26 - 35 - 7) / RH) * 100 + '%';
    bubbleEl.style.setProperty('--tail', Math.max(8, Math.min(92, 50 + (sx - left) * 2.1)) + '%');
    requestAnimationFrame(frame);
  }
  talk.say('Welcome to Musoni. Everything on the counter does something. Try the phones.');
  requestAnimationFrame(frame);
}

// ---------- the page title as one big neon sign ----------
function initTitles() {
  for (const cv of document.querySelectorAll('canvas.neon-title')) {
    const t = cv.dataset.text || '', col = cv.dataset.color || ORANGE;
    cv.width = textW(t) + 2; cv.height = 7;
    const g = cv.getContext('2d');
    const draw = (skip = -1) => { g.clearRect(0, 0, cv.width, cv.height); text(g, t, 1, 1, 1, col, skip); };
    draw();
    if (!still) setInterval(() => { const i = Math.floor(Math.random() * t.length); draw(i); setTimeout(draw, 110); }, 5200);
  }
}

// ---------- three pixel phones that explain the app (illustrations, not screenshots) ----------
function phone(cv, paint) {
  const PW = 64, PH = 118;
  cv.width = PW; cv.height = PH;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  R(g, '#0a0d26', 0, 0, PW, PH); for (const [x, y] of [[0, 0], [PW - 1, 0], [0, PH - 1], [PW - 1, PH - 1], [1, 0], [0, 1], [PW - 2, 0], [PW - 1, 1], [0, PH - 2], [1, PH - 1], [PW - 1, PH - 2], [PW - 2, PH - 1]]) g.clearRect(x, y, 1, 1);
  R(g, TRIM, 1, 2, 1, PH - 4); R(g, '#f4efd8', 4, 6, PW - 8, PH - 14); R(g, '#12163a', 4, 6, PW - 8, 4); R(g, '#f4efd8', 46, 7, 6, 2); R(g, TRIM, 27, PH - 6, 10, 2);
  R(g, ORANGE, 4, 10, PW - 8, 12);
  let n = 0; const loop = (now) => { paint(g, now / 1000, n++); if (!still) requestAnimationFrame(loop); }; loop(0);
}
function initPhones() {
  const a = document.getElementById('ph-signup'), b = document.getElementById('ph-offer'), c = document.getElementById('ph-repay');
  if (a) phone(a, (g, t) => {
    text(g, 'VERIFY ID', 8, 14, 1, '#12163a');
    for (let i = 0; i < 4; i++) R(g, i < 2 ? '#38b764' : '#c9cff0', 14 + i * 10, 27, 6, 3);
    R(g, '#c9cff0', 10, 36, 44, 26); R(g, '#9aa1d6', 10, 36, 44, 1); R(g, '#8d5a3b', 14, 41, 12, 13); R(g, '#12163a', 14, 41, 12, 4); R(g, '#12163a', 30, 42, 20, 1); R(g, '#9aa1d6', 30, 46, 16, 1); R(g, '#9aa1d6', 30, 50, 18, 1); R(g, '#9aa1d6', 14, 57, 30, 1);
    for (let j = -11; j <= 11; j++) for (let i = -9; i <= 9; i++) { const d = (i / 9) ** 2 + (j / 11) ** 2; if (d <= 1 && d > 0.72) R(g, '#12163a', 32 + i, 80 + j, 1, 1); else if (d <= 0.72) R(g, '#8d5a3b', 32 + i, 80 + j, 1, 1); }
    R(g, '#12163a', 25, 70, 14, 4); R(g, '#12163a', 28, 79, 2, 2); R(g, '#12163a', 34, 79, 2, 2); R(g, '#f4efd8', 29, 85, 6, 1);
    const scan = still ? 80 : 69 + ((t * 14) % 23); R(g, '#38b764', 20, Math.round(scan), 24, 1);
    R(g, '#38b764', 10, 98, 44, 8); text(g, 'NEXT', 24, 100, 1, '#f4efd8');
  });
  if (b) phone(b, (g) => {
    text(g, 'YOUR OFFER', 8, 14, 1, '#12163a');
    R(g, '#12163a', 10, 28, 44, 20); text(g, 'KES', 14, 31, 1, '#9aa1d6'); text(g, '5000', 14, 38, 1, '#ffe066'); R(g, '#ffe066', 44, 31, 6, 6);
    [['YOU GET', 30], ['FEES', 14], ['YOU REPAY', 34]].forEach(([l, w], i) => { const y = 54 + i * 11; text(g, l, 10, y, 1, i === 2 ? '#12163a' : '#566c86'); R(g, i === 2 ? ORANGE : '#c9cff0', 54 - Math.min(w, 12) - 0, y + 6, Math.min(w, 12), 2); R(g, '#d9d2b4', 10, y + 8, 44, 1); });
    R(g, '#38b764', 10, 92, 44, 8); text(g, 'ACCEPT', 20, 94, 1, '#f4efd8');
    R(g, '#f4efd8', 10, 102, 44, 6); text(g, 'DECLINE', 18, 102, 1, '#9aa1d6');
  });
  if (c) phone(c, (g, t) => {
    text(g, 'REPAYMENT', 8, 14, 1, '#12163a');
    R(g, '#f4efd8', 4, 22, 56, 82);
    const stage = still ? 3 : Math.floor((t % 6) / 1.5);          // 0 sent, 1 confirmed, 2 paid, 3 rest
    for (let j = -13; j <= 13; j++) for (let i = -13; i <= 13; i++) if (Math.hypot(i, j) <= 13) R(g, stage >= 2 ? '#38b764' : '#c9cff0', 32 + i, 44 + j, 1, 1);
    if (stage >= 2) { for (let i = 0; i < 5; i++) R(g, '#f4efd8', 25 + i, 44 + i, 2, 2); for (let i = 0; i < 9; i++) R(g, '#f4efd8', 30 + i, 48 - i, 2, 2); }
    else { const k = Math.floor(t * 6) % 3; for (let i = 0; i < 3; i++) R(g, i === k ? '#12163a' : '#9aa1d6', 25 + i * 6, 43, 3, 3); }
    text(g, stage >= 2 ? 'PAID' : 'WAITING', stage >= 2 ? 25 : 18, 62, 1, '#12163a');
    ['SENT', 'CONFIRMED', 'PAID'].forEach((l, i) => { const y = 74 + i * 9, done = stage > i || stage === 3 || (stage === 2 && i === 2); R(g, done ? '#38b764' : '#c9cff0', 10, y, 5, 5); if (i < 2) R(g, '#c9cff0', 12, y + 5, 1, 4); text(g, l, 19, y, 1, done ? '#12163a' : '#9aa1d6'); });
  });
}

function initToc() {
  const links = [...document.querySelectorAll('.toc a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.story section[id]').forEach((s) => io.observe(s));
}

export function initMusoni() {
  soundButton(document.getElementById('snd'));
  initRoom(); initTitles(); initPhones(); initToc(); initUssd();
}
