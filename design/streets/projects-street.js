// Projects street, Upper Hill, golden hour. A still to test how much detail code-drawn pixel art can carry.
// 640 x 360 art pixels, painted into one pixel buffer so every pixel is chosen (dithered, never blurred).
// Layers back to front: sky and clouds, the sun going down behind the Ngong Hills, the far city with
// KICC and Britam Tower, a band of trees, the street (Musoni finished and lit, LexIMS under a crane),
// the pavement, a road still wet from the afternoon's short rains, a matatu at the stage, and in front
// a jacaranda in bloom and a bougainvillea hedge.
export const W = 640, H = 360;

export function paintProjectsStreet(ctx, { font = 'Departure Mono' } = {}) {
  const img = ctx.createImageData(W, H), buf = img.data;
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const C = {}; const col = h => (C[h] ||= hex(h));
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dith = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
  const get = (x, y) => { const i = (y * W + x) * 4; return [buf[i], buf[i + 1], buf[i + 2]]; };
  function put(x, y, c, a = 1) {
    x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4; c = typeof c === 'string' ? col(c) : c;
    if (a >= 1) { buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; }
    else { buf[i] += (c[0] - buf[i]) * a; buf[i + 1] += (c[1] - buf[i + 1]) * a; buf[i + 2] += (c[2] - buf[i + 2]) * a; }
    buf[i + 3] = 255;
  }
  const rect = (x, y, w, h, c, a = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, c, a); };
  /** Dithered fill: covers a share `t` of the pixels in an ordered pattern. */
  const drect = (x, y, w, h, c, t) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (dith(i, j) < t) put(i, j, c); };
  /** A vertical run of colour stops, dithered between neighbours. stops: [[y, hex], ...] */
  function vgrad(x0, x1, stops, fx = null) {
    for (let k = 0; k < stops.length - 1; k++) {
      const [ya, ca] = stops[k], [yb, cb] = stops[k + 1];
      for (let y = ya; y < yb; y++) {
        const t = (y - ya) / (yb - ya);
        for (let x = x0; x < x1; x++) { if (fx && !fx(x, y)) continue; put(x, y, dith(x, y) < t ? cb : ca); }
      }
    }
  }
  /** Light that falls off from a point, dithered so it stays pixel art. */
  function glow(cx, cy, r, c, strength = .5, squash = 1) {
    for (let y = Math.floor(cy - r * squash); y <= cy + r * squash; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const d = Math.hypot(x - cx, (y - cy) / squash) / r; if (d >= 1) continue;
      const f = (1 - d) * (1 - d) * strength;
      if (dith(x, y) < f * 1.6) put(x, y, c, Math.min(.85, .25 + f));
    }
  }
  /** Lettering: the pixel font drawn small, then cut to hard pixels. */
  function text(s, x, y, c, size = 11, align = 'left', spacing = 0) {
    const off = document.createElement('canvas'); off.width = 400; off.height = size * 2;
    const o = off.getContext('2d'); o.font = `${size}px "${font}"`; o.textBaseline = 'top';
    if (spacing) o.letterSpacing = spacing + 'px';
    const w = Math.ceil(o.measureText(s).width); o.fillStyle = '#fff'; o.fillText(s, 0, 0);
    const d = o.getImageData(0, 0, w, size * 2).data, sx = align === 'center' ? x - (w >> 1) : align === 'right' ? x - w : x;
    for (let j = 0; j < size * 2; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 120) put(sx + i, y + j, c);
    return w;
  }

  const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y) => noise2(x, y) * .55 + noise2(x * 2.1, y * 2.1) * .3 + noise2(x * 4.3, y * 4.3) * .15;

  // ---------- sky ----------
  const HORIZON = 228, SUN = [212, 196];
  vgrad(0, W, [[0, '#1a1240'], [40, '#2b1756'], [78, '#481f64'], [112, '#762663'], [144, '#a8335d'], [170, '#d24f42'], [192, '#ec7834'], [210, '#f9a443'], [222, '#ffc96a'], [HORIZON + 1, '#ffe29a']]);
  glow(SUN[0], SUN[1], 230, col('#ffb35a'), .45, .55);
  glow(SUN[0], SUN[1], 70, col('#ffe6a2'), .9, .75);
  for (let y = SUN[1] - 16; y <= SUN[1] + 16; y++) for (let x = SUN[0] - 16; x <= SUN[0] + 16; x++) {
    const d = Math.hypot(x - SUN[0], y - SUN[1]); if (d < 14.5) put(x, y, d < 11 ? '#fff6d4' : '#ffe8a4');
  }
  // clouds: masses, not lines. Each band is noise cut by an envelope; lit from below, brightest near the sun.
  function clouds(yc, h, x0, x1, sc, thresh, sd) {
    for (let y = Math.floor(yc - h); y < yc + h; y++) for (let x = x0; x < x1; x++) {
      const v = (y - (yc - h)) / (2 * h), env = Math.sin(Math.PI * v) * Math.min(1, (x - x0) / 40, (x1 - x) / 40);
      const n = fbm(x * sc + sd, y * sc * 2.6 + sd);
      const cov = n * env; if (cov < thresh) continue;
      const near = Math.max(0, 1 - Math.hypot(x - SUN[0], (y - SUN[1]) * 1.6) / 380);
      const below = fbm(x * sc + sd, (y + 3) * sc * 2.6 + sd) * env < thresh;     // the underside the sun lights
      const above = fbm(x * sc + sd, (y - 2) * sc * 2.6 + sd) * env < thresh;
      const body = lerp(col('#2e1650'), col('#8a3460'), near * .9 + v * .15);
      let c = body;
      if (below) c = lerp(col('#d0506a'), col('#ffdf8a'), near);
      else if (cov < thresh + .04) c = dith(x, y) < .5 ? lerp(body, col('#c4486a'), .3 + near * .5) : body;
      else if (above) c = lerp(body, col('#1e1040'), .4);
      put(x, y, c);
    }
  }
  clouds(30, 20, -20, 660, .018, .36, 3);
  clouds(76, 14, -20, 660, .022, .38, 11);
  clouds(118, 10, 260, 660, .03, .4, 19);
  clouds(132, 8, -20, 200, .03, .4, 23);
  clouds(168, 6, 80, 560, .035, .42, 31);
  clouds(192, 4, 300, 640, .045, .44, 37);
  [[352, 64], [364, 70], [404, 54], [560, 92], [140, 104]].forEach(([x, y]) => { put(x - 2, y - 1, '#2a1238'); put(x - 1, y, '#2a1238'); put(x, y, '#2a1238'); put(x + 1, y, '#2a1238'); put(x + 2, y - 1, '#2a1238'); });

  // ---------- the Ngong Hills: the sun goes down behind their knuckles ----------
  const ridge = x => {
    const knuckles = [[120, 22, 26], [160, 30, 24], [196, 26, 22], [236, 34, 26], [276, 22, 26]];
    let h = 7 + noise(x * .05) * 6;
    knuckles.forEach(([kx, kh, kw]) => { h = Math.max(h, kh * Math.exp(-(((x - kx) / kw) ** 2))); });
    return HORIZON - h;
  };
  for (let x = 0; x < W; x++) {
    const top = Math.round(ridge(x));
    for (let y = top; y < HORIZON + 30; y++) {
      const d = (y - top) / 40, near = Math.max(0, 1 - Math.abs(x - SUN[0]) / 110);
      let c = lerp(col('#8c3e66'), col('#5a2b5b'), Math.min(1, d));
      if (y - top < 2) c = lerp(c, col('#ffb25c'), near * .95);
      put(x, y, c);
    }
  }
  seed = 3;
  for (let n = 0; n < 160; n++) { const x = rnd() * W, y = ridge(x) + 4 + rnd() * 24; if (dith(x | 0, y | 0) < .9) put(x, y, rnd() < .6 ? '#ffcf7a' : '#ffefb8', .8); }   // homes on the hills, lights coming on
  for (let y = 200; y < HORIZON + 24; y++) for (let x = 0; x < W; x++) if (dith(x, y) < .2 * (1 - Math.abs(y - 224) / 28)) put(x, y, '#ff9a5a', .35);

  // ---------- the far city ----------
  const far = (x, top, w, base, shade = '#4b2552', lit = .25) => {
    for (let y = top; y < base; y++) for (let i = x; i < x + w; i++) put(i, y, lerp(col(shade), col('#7a3460'), Math.max(0, .5 - (y - top) / 80)));
    for (let y = top + 3; y < base - 2; y += 3) for (let i = x + 2; i < x + w - 1; i += 3) if (rnd() < lit) put(i, y, rnd() < .5 ? '#ffd27c' : '#ffb35e');
  };
  seed = 31;
  for (let x = 0; x < W; x += 8 + Math.floor(rnd() * 10)) { const low = x > 150 && x < 290; far(x, (low ? 236 : 214) + Math.floor(rnd() * 16), 6 + Math.floor(rnd() * 12), 266, '#552957', .2); }
  for (let x = 4; x < W; x += 12 + Math.floor(rnd() * 16)) { const low = x > 150 && x < 290; if (!low) far(x, 196 + Math.floor(rnd() * 22), 8 + Math.floor(rnd() * 12), 266, '#47224f', .24); }
  // KICC: the drum and its saucer crown
  const K = 248;
  rect(K - 9, 156, 18, 108, '#3d1f4c'); for (let y = 160; y < 262; y += 4) for (let x = K - 7; x < K + 7; x += 3) if (rnd() < .35) put(x, y, '#ffcf78');
  rect(K + 9, 156, 1, 106, '#ffb862'); for (let x = K - 19; x < K + 20; x++) { const e = Math.abs(x - K) / 19; rect(x, 152 + Math.round(e * 2), 1, 4 - Math.round(e * 2), '#3d1f4c'); }
  rect(K + 10, 153, 8, 1, '#ffb862'); rect(K, 140, 1, 12, '#3d1f4c'); put(K, 139, '#ff5a4a');
  // Britam Tower: a glass prism with a sloped top, its sun-side face holding the sunset
  for (let y = 96; y < 266; y++) {
    const cx = 290, half = 11 + (y - 96) * .04;
    for (let x = Math.round(cx - half); x < cx + half; x++) {
      if (y < 96 + (cx + half - x) * .9) continue;
      const sunSide = x < cx - 2;
      put(x, y, sunSide ? lerp(col('#f6994c'), col('#9a3b63'), (y - 96) / 170) : lerp(col('#4a2659'), col('#321a48'), (y - 96) / 170));
      if (sunSide && y % 4 === 0 && dith(x, y) < .5) put(x, y, '#ffd384', .45);
      if (!sunSide && y % 4 === 0 && rnd() < .12) put(x, y, '#ffd27c');
    }
  }
  far(602, 112, 22, 266, '#3e1f4d', .3); rect(612, 98, 2, 14, '#3e1f4d'); put(612, 97, '#ff5a4a');
  // the green city: a band of trees, their crowns caught by the last light
  seed = 77;
  for (let x = -6; x < W; x += 5 + Math.floor(rnd() * 6)) {
    const r = 6 + Math.floor(rnd() * 8), cy = 262 + Math.floor(rnd() * 8);
    for (let y = cy - r; y < 292; y++) for (let i = x - r; i < x + r; i++) {
      const d = Math.hypot(i - x, Math.max(0, cy - y) * 1.2); if (d > r + (noise2(i * .5, y * .5) - .5) * 4) continue;
      const lit = y < cy - r * .4 && i < x + 2;
      put(i, y, lit ? (dith(i, y) < .5 ? '#8a7434' : '#4a5233') : dith(i, y) < .3 ? '#2f3b31' : '#252f2b');
    }
  }

  // ---------- the street, at Cecil's scale: a floor is half his height again ----------
  const GROUND = 292, FLOOR = 34;
  // Musoni: finished, open, lit
  const MX = 304, MW = 184, LOBBY = 62, FLOORS = 4, MT = GROUND - LOBBY - FLOORS * FLOOR;
  for (let y = MT; y < GROUND; y++) for (let x = MX; x < MX + MW; x++) put(x, y, lerp(col('#4e2c4c'), col('#2e1d38'), (y - MT) / 200));
  rect(MX, MT, 3, GROUND - MT, '#d87a5a'); drect(MX + 3, MT, 4, GROUND - MT, '#b05a58', .5);
  rect(MX - 3, MT - 6, MW + 6, 6, '#2a1a34'); rect(MX - 3, MT - 6, MW + 6, 1, '#e88e5a');
  seed = 5;
  for (let f = 0; f < FLOORS; f++) {
    const fy = MT + 8 + f * FLOOR;
    rect(MX + 4, fy - 4, MW - 8, 3, '#5e3c54'); rect(MX + 4, fy - 4, MW - 8, 1, '#8a5468');
    for (let w = 0; w < 6; w++) {
      const wx = MX + 10 + w * 29, ww = 24, wh = 24, on = rnd() < .5;
      for (let y = fy; y < fy + wh; y++) for (let x = wx; x < wx + ww; x++) {
        if (on) put(x, y, y < fy + 2 ? '#ffe4a6' : dith(x, y) < (y - fy) / wh * .35 ? '#e8a05a' : '#ffcf78');
        else put(x, y, lerp(col('#b0567c'), col('#46295a'), (y - fy) / wh * .9 + (x - wx) / ww * .2));
      }
      rect(wx + ww / 2, fy, 1, wh, '#2a1a30');                                                                   // mullion
      if (on) {                                                                                                 // inside: a lamp, a desk, sometimes someone
        rect(wx + 2, fy + wh - 6, ww - 4, 2, '#7a4a30'); if (rnd() < .5) { rect(wx + 5, fy + wh - 13, 4, 7, '#4a2c22'); rect(wx + 5, fy + wh - 16, 4, 3, '#3a2018'); }
        if (rnd() < .5) { rect(wx + 16, fy + wh - 12, 5, 6, '#2e3a58'); rect(wx + 17, fy + wh - 11, 3, 4, '#8ac8ff'); }
      } else { for (let k = 0; k < 8; k++) if (dith(wx + 4 + k, fy + 16 - k) < .7) put(wx + 4 + k, fy + 16 - k, '#d47c9c'); }
      rect(wx - 1, fy - 1, ww + 2, 1, '#2a1a30'); rect(wx - 1, fy + wh, ww + 2, 2, '#6a4256');                   // frame, sill
    }
  }
  // the lobby: warm glass, a reception desk, a plant, the doors
  const LY = GROUND - LOBBY;
  rect(MX + 4, LY, MW - 8, LOBBY, '#2a1a30');
  for (let y = LY + 14; y < GROUND; y++) for (let x = MX + 8; x < MX + MW - 8; x++) put(x, y, y < LY + 17 ? '#fff0c4' : lerp(col('#ffd890'), col('#e8a058'), (y - LY - 14) / 48 * .7));
  for (let x = MX + 8; x < MX + MW - 8; x += 28) rect(x, LY + 14, 2, LOBBY - 14, '#2a1a30');
  rect(MX + 18, GROUND - 16, 40, 16, '#5a3426'); rect(MX + 18, GROUND - 16, 40, 2, '#61bc00');                    // reception desk with a green edge
  rect(MX + 30, GROUND - 26, 6, 10, '#3a2018'); rect(MX + 30, GROUND - 30, 6, 4, '#2a1410');
  rect(MX + MW - 34, GROUND - 14, 10, 14, '#6a4a3a'); for (let k = 0; k < 14; k++) put(MX + MW - 37 + rnd() * 16, GROUND - 16 - rnd() * 18, rnd() < .5 ? '#2f6b3a' : '#4a8a3a');
  const DX = MX + MW / 2;
  rect(DX - 18, GROUND - 46, 36, 46, '#2a1a30'); rect(DX - 16, GROUND - 44, 15, 44, '#fff0c8'); rect(DX + 1, GROUND - 44, 15, 44, '#fff0c8');
  rect(DX - 3, GROUND - 26, 1, 8, '#2a1a30'); rect(DX + 3, GROUND - 26, 1, 8, '#2a1a30');
  rect(MX + 4, LY, MW - 8, 14, '#141020'); rect(MX + 4, LY + 13, MW - 8, 1, '#61bc00');                         // fascia
  text('MUSONI', DX, LY + 2, '#c8f59a', 11, 'center', 2);
  glow(DX, GROUND + 4, 70, col('#ffd890'), .45, .22);                                                            // lobby light spilling on the pavement
  // the rooftop sign: the one loud thing on the street
  const SY = MT - 46;
  rect(MX + 46, MT - 14, 2, 8, '#1a1a24'); rect(MX + MW - 48, MT - 14, 2, 8, '#1a1a24');
  glow(DX, SY + 16, 110, col('#61bc00'), .5, .42);
  rect(MX + 26, SY, MW - 52, 34, '#0b1220'); rect(MX + 26, SY, MW - 52, 1, '#3a4a60'); rect(MX + 26, SY + 33, MW - 52, 1, '#05080e');
  text('MUSONI', DX, SY + 7, '#5aa818', 22, 'center', 3);
  text('MUSONI', DX, SY + 6, '#d9ffb0', 22, 'center', 3);
  rect(MX + 8, MT - 16, 18, 10, '#3a2a40'); rect(MX + 9, MT - 15, 16, 1, '#5a4256');
  rect(MX + MW - 14, MT - 34, 1, 28, '#3a2a40'); put(MX + MW - 14, MT - 35, '#ff4a3a'); glow(MX + MW - 14, MT - 35, 6, col('#ff4a3a'), .8);

  // LexIMS: going up, under a tower crane
  const LX = 520, LW = 120, LT = GROUND - 5 * FLOOR;
  for (let f = 0; f < 5; f++) {
    const fy = LT + f * FLOOR;
    for (let y = fy + 4; y < fy + FLOOR; y++) for (let x = LX; x < LX + LW; x++) put(x, y, lerp(col('#271828'), col('#3a2436'), (x - LX) / LW));
    rect(LX, fy, LW, 4, '#8f7a74'); rect(LX, fy, LW, 1, '#e0a274');
    for (let x = LX + 4; x < LX + LW; x += 30) { rect(x, fy + 4, 5, FLOOR - 4, '#7a6662'); rect(x, fy + 4, 1, FLOOR - 4, '#c08a6a'); }
  }
  for (let y = LT - 2; y < LT + 2 * FLOOR; y++) for (let x = LX - 2; x < LX + LW; x++) if ((x * 2 + y) % 4 === 0 || dith(x, y) < .2) put(x, y, '#2f6b3a', .6);   // netting
  for (let y = LT; y < GROUND; y += 12) rect(LX - 12, y, 12, 1, '#b39a7a');
  rect(LX - 12, LT, 1, GROUND - LT, '#b39a7a'); rect(LX - 2, LT, 1, GROUND - LT, '#b39a7a');
  for (let y = LT; y < GROUND - 12; y += 12) for (let k = 0; k < 10; k++) put(LX - 12 + k, y + k + 1, '#8a7560');
  [[LX + 50, LT + 2 * FLOOR + 6], [LX + 96, LT + 3 * FLOOR + 6]].forEach(([x, y]) => { glow(x, y + 8, 44, col('#eef2ff'), .5, .7); rect(x - 4, y, 9, 5, '#f6f8ff'); rect(x, y + 5, 1, 4, '#3a3a44'); });
  rect(LX + 70, LT + 3 * FLOOR - 14, 4, 10, '#e8b830'); rect(LX + 70, LT + 3 * FLOOR - 18, 4, 4, '#5a3424'); rect(LX + 69, LT + 3 * FLOOR - 19, 6, 2, '#ffd23a');   // a worker
  rect(LX - 14, GROUND - 34, LW + 14, 34, '#1d3f8a'); for (let x = LX - 14; x < W; x += 30) rect(x, GROUND - 34, 1, 34, '#2b55ab');   // hoarding
  rect(LX - 14, GROUND - 34, LW + 14, 2, '#f4f1e6'); rect(LX - 14, GROUND - 4, LW + 14, 4, '#152d63');
  text('LEXIMS', LX + 52, GROUND - 29, '#f4f1e6', 11, 'center', 2);
  text('COMING SOON', LX + 52, GROUND - 17, '#ffcc4a', 11, 'center');
  const CX = 606, CT = 40;                                                                                       // the tower crane
  for (let y = CT; y < GROUND - 34; y++) { put(CX, y, '#e8b830'); put(CX + 8, y, '#e8b830'); const k = (y - CT) % 10; put(CX + 1 + Math.round((k < 5 ? k : 9 - k) * 1.4), y, '#c49020'); }
  rect(CX - 190, CT, 236, 2, '#e8b830'); rect(CX - 190, CT + 7, 236, 1, '#e8b830');
  for (let x = CX - 190; x < CX + 46; x += 7) for (let k = 0; k < 7; k++) put(x + k, CT + 1 + Math.round(k * .85), '#c49020');
  rect(CX + 26, CT + 2, 20, 10, '#5a5a62'); rect(CX - 3, CT - 12, 14, 12, '#e8b830'); rect(CX - 1, CT - 10, 10, 6, '#ffd98a');
  for (let x = CX - 180; x < CX + 4; x++) { const y = CT - 20 + Math.round((x - (CX - 180)) / 184 * 18); if (x % 2) put(x, y, '#c49020'); }
  rect(CX + 3, CT - 26, 2, 14, '#e8b830'); put(CX + 3, CT - 27, '#ff3a2a'); put(CX + 4, CT - 27, '#ff3a2a'); glow(CX + 4, CT - 27, 6, col('#ff3a2a'), .8);
  rect(CX - 130, CT + 8, 1, 74, '#2a1a30'); rect(CX - 144, CT + 82, 30, 5, '#7a6662'); rect(CX - 144, CT + 82, 30, 1, '#e0a274');

  // ---------- pavement, kerb, lamps, the stage ----------
  for (let y = GROUND; y < 306; y++) for (let x = 0; x < W; x++) {
    let c = lerp(col('#6c4652'), col('#4a2f40'), (y - GROUND) / 14);
    if ((x + (y >> 2) * 9) % 18 === 0 || y === GROUND + 7) c = lerp(c, col('#2a1a28'), .45);
    put(x, y, c);
  }
  drect(0, GROUND, W, 2, '#ffb36a', .35);
  for (let x = 0; x < W; x++) { rect(x, 306, 1, 4, Math.floor(x / 12) % 2 ? '#e8e2d0' : '#22181e'); put(x, 310, '#140c14'); }
  function lamp(x) {
    rect(x, 168, 3, GROUND - 168, '#2a1e2e'); rect(x - 2, GROUND - 10, 7, 10, '#2a1e2e'); rect(x - 2, GROUND - 10, 7, 1, '#5a4256');
    rect(x - 18, 168, 39, 3, '#2a1e2e'); rect(x - 21, 171, 9, 4, '#2a1e2e'); rect(x + 15, 171, 9, 4, '#2a1e2e');
    [x - 17, x + 19].forEach(lx => { glow(lx, 178, 34, col('#ffd78a'), .7); rect(lx - 3, 175, 6, 2, '#fff2c8'); });
    glow(x + 1, GROUND + 8, 54, col('#ffcf86'), .32, .2);
  }
  lamp(284); lamp(500);
  // the matatu stage
  const ST = 166;
  rect(ST, 214, 3, GROUND - 214, '#3a3a44'); rect(ST - 18, 204, 40, 24, '#1d3f8a'); rect(ST - 18, 204, 40, 1, '#f4f1e6'); rect(ST - 18, 227, 40, 1, '#0f2350');
  text('STAGE', ST + 2, 206, '#f4f1e6', 11, 'center');
  rect(ST - 10, 218, 24, 6, '#f4f1e6'); rect(ST - 8, 219, 20, 3, '#1d3f8a'); rect(ST - 7, 223, 3, 2, '#141019'); rect(ST + 8, 223, 3, 2, '#141019');   // a little matatu on the sign
  seed = 99;
  for (let n = 0; n < 340; n++) { const x = Math.floor(rnd() * 260), y = GROUND + Math.floor(rnd() * 14); if (rnd() < 1 - x / 280) put(x, y, rnd() < .5 ? '#9a6ad0' : '#6e44a6'); }

  // ---------- the jacaranda: backlit by the sunset, its edges on fire ----------
  seed = 13;
  const bark = (x, y, len, ang, w) => {
    for (let s = 0; s < len; s++) {
      const px = x + Math.cos(ang) * s + Math.sin(s * .15) * 1.2, py = y - Math.sin(ang) * s, ww = Math.max(1.5, w * (1 - s / len * .65));
      for (let k = -ww / 2; k < ww / 2; k++) put(px + k, py, k > ww / 2 - 1.5 ? '#6a3a3a' : '#22141c');
    }
    return [x + Math.cos(ang) * len, y - Math.sin(ang) * len];
  };
  const [ax, ay] = bark(46, GROUND + 4, 128, 1.55, 11);
  const tips = [bark(ax, ay, 64, 2.5, 6), bark(ax, ay, 90, 0.85, 6), bark(ax + 2, ay + 34, 74, .35, 5), bark(ax, ay + 18, 40, 2.9, 4), bark(ax, ay, 70, 1.5, 5), bark(ax + 30, ay - 40, 50, .6, 3)];
  const mask = new Float32Array(W * H), nx = new Float32Array(W * H), ny = new Float32Array(W * H);
  const clump = (bx, by, r) => {
    for (let y = Math.floor(by - r); y < by + r; y++) for (let x = Math.floor(bx - r); x < bx + r; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const d = Math.hypot(x - bx, y - by) / r; if (d > 1 - (fbm(x * .25, y * .25) - .5) * .5) continue;
      const i = y * W + x; mask[i] = 1; nx[i] = (x - bx) / r; ny[i] = (y - by) / r;
    }
  };
  tips.forEach(([ex, ey]) => { for (let n = 0; n < 34; n++) clump(ex + (rnd() - .5) * 80, ey + (rnd() - .5) * 46, 4 + rnd() * 9); });
  for (let n = 0; n < 50; n++) clump(rnd() * 190, rnd() * 110, 4 + rnd() * 8);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!mask[i]) continue;
    if (fbm(x * .3 + 50, y * .3) < .28) continue;                                                                // gaps the sky shows through
    const edgeSun = (x + 1 < W && !mask[i + 1]) || (y > 0 && !mask[i - W] && nx[i] > -.2);
    const rim = nx[i] * .8 - ny[i] * .4;
    let c = '#2e1c4a';
    if (rim > .55) c = '#5a3488'; else if (rim > .1) c = dith(x, y) < .5 ? '#45286e' : '#3a225c';
    if (edgeSun && rim > -.1) c = rim > .5 ? '#f0b4e8' : '#c07ad4';
    else if (hash2(x, y) < .06) c = '#8a58c0';                                                                  // single blossoms catching light
    put(x, y, c);
  }
  for (let n = 0; n < 40; n++) { const x = 20 + rnd() * 250, y = 120 + rnd() * 168; put(x, y, rnd() < .5 ? '#c08ae0' : '#8a5ac0'); }

  // ---------- the road, wet from the short rains: it holds the street and every light ----------
  const ROAD = 311, NEAR = 346;
  for (let y = ROAD; y < NEAR; y++) {
    const depth = (y - ROAD) / (NEAR - ROAD), my = 306 - (y - ROAD) * 2.6 - 2, ripple = Math.round(Math.sin(y * 1.9) * (1 + depth * 2));
    for (let x = 0; x < W; x++) {
      const src = get(Math.min(W - 1, Math.max(0, x + ripple)), Math.max(0, Math.round(my)));
      let c = lerp(col('#251a2c'), src, .5 - depth * .25);
      if (dith(x, y) < .1 + depth * .1) c = lerp(c, col('#140c1a'), .6);
      put(x, y, c);
    }
  }
  for (let x = 10; x < W; x += 52) rect(x, 330, 26, 2, '#cfc6a8', .45);
  const streak = (x, w, c, a) => { for (let y = ROAD + 1; y < NEAR - 2; y++) { const f = 1 - (y - ROAD) / (NEAR - ROAD) * .7, wob = Math.round(Math.sin(y * 1.7 + x) * 1.5); for (let i = 0; i < w; i++) if (dith(x + i + wob, y) < a * f) put(x + i + wob, y, c, .6); } };
  [[264, 6], [300, 6], [480, 6], [516, 6]].forEach(([x, w]) => streak(x, w, col('#ffd78a'), .55));
  streak(MX + 40, MW - 80, col('#61bc00'), .18); streak(LX + 30, 30, col('#eef2ff'), .2);
  // ---------- the matatu at the stage, half in frame, route board lit ----------
  const TX = -78, TT = 252, TB = 334, TL = 214;
  const tf = TX + TL;                                                                                            // the front
  for (let y = TT; y < TB; y++) for (let x = TX; x < tf; x++) {
    const slope = y < TT + 30 ? tf - 22 + (y - TT) * .73 : tf; if (x > slope) continue;
    put(x, y, '#15101c');
  }
  rect(TX, TT, TL - 22, 3, '#2a2236'); for (let x = TX + 10; x < tf - 30; x += 16) rect(x, TT - 5, 2, 5, '#3a3448'); rect(TX + 6, TT - 6, TL - 50, 2, '#3a3448');   // roof rack
  for (let y = TT + 30; y < TB - 6; y++) for (let x = TX; x < tf - 2; x++) {                                     // the side art
    const a = (x - TX) * .045 - (y - TT) * .09, b = Math.sin(a * 2.2) + Math.sin((x - TX) * .11 + (y - TT) * .05) * .4;
    const art = b > .9 ? '#ff3d7f' : b > .45 ? '#20c4b8' : b > -.1 ? '#ffd23a' : b > -.6 ? '#7a3cff' : '#1a1226';
    put(x, y, lerp(col(art), col('#1a1226'), .38));
  }
  rect(TX, TT + 29, tf - TX, 2, '#d8dce8');
  text('NAIROBI', 66, TT + 40, '#140c18', 22, 'center', 2); text('NAIROBI', 65, TT + 38, '#f4f1e6', 22, 'center', 2);
  for (let x = TX + 8; x < tf - 40; x += 26) { rect(x, TT + 7, 22, 19, '#1c1030'); drect(x, TT + 7, 22, 19, '#b04aff', .4); rect(x, TT + 7, 22, 1, '#e0a0ff'); }   // windows, LED-lit inside
  for (let y = TT + 6; y < TT + 28; y++) for (let x = tf - 36; x < tf - 22 + (y - TT) * .73 - 2; x++) put(x, y, lerp(col('#ffb05a'), col('#3a2a48'), (y - TT - 6) / 22 * .8));   // windscreen catching the sun
  rect(tf - 70, TT - 13, 66, 13, '#0a080e'); rect(tf - 70, TT - 13, 66, 1, '#3a3448');
  glow(tf - 37, TT - 7, 46, col('#ffb030'), .35, .35);
  text('PROJECTS', tf - 37, TT - 12, '#ffb030', 11, 'center');
  rect(tf - 6, TB - 26, 6, 6, '#fff1b8'); glow(tf, TB - 23, 30, col('#fff1b8'), .6, .6);
  rect(TX, TB - 8, TL, 4, '#c0c4d0'); rect(TX, TB - 4, TL, 2, '#5a5e6a');                                        // bumper line
  glow(TX + TL / 2, TB + 6, 130, col('#b04aff'), .45, .12);                                                      // underglow on the wet road
  [TX + 52, tf - 46].forEach(wx => { for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) { const d = Math.hypot(x, y); if (d < 12.5) put(wx + x, TB + y - 2, d < 5 ? (x + y < 0 ? '#eef0f6' : '#a8acb8') : d < 6.5 ? '#4a4e5a' : d < 11 ? '#0a080c' : '#1e1824'); } });

  // ---------- in front: the near kerb and a bougainvillea hedge ----------
  for (let x = 0; x < W; x++) rect(x, NEAR, 1, 4, Math.floor(x / 12) % 2 ? '#d8d0bc' : '#1e161c');
  const hedge = new Float32Array(W * H);
  seed = 41;
  for (let x = -10; x < W + 10; x += 9 + rnd() * 8) {
    const r = 9 + rnd() * 8, cy = NEAR + 6 + rnd() * 6 - (x > 360 && x < 470 ? 6 : 0);
    for (let y = Math.floor(cy - r); y < H; y++) for (let i = Math.floor(x - r); i < x + r; i++) {
      if (i < 0 || i >= W || y < 0) continue;
      const d = Math.hypot(i - x, Math.min(0, y - cy)) / r; if (d > 1 - (fbm(i * .3, y * .3) - .5) * .5) continue;
      hedge[y * W + i] = Math.max(hedge[y * W + i], 1 - (y - (cy - r)) / (r * 2.4));
    }
  }
  for (let y = NEAR - 14; y < H; y++) for (let x = 0; x < W; x++) {
    const h = hedge[y * W + x]; if (!h) continue;
    const bloom = fbm(x * .35 + 9, y * .35) > .66 - h * .18;
    const top = !hedge[(y - 1) * W + x];
    let c = h > .6 ? '#2e4426' : h > .3 ? '#22341e' : '#161f14';
    if (bloom) c = top ? '#ff9ccf' : h > .55 ? (dith(x, y) < .5 ? '#e8489a' : '#c8327e') : '#7a1c4e';
    else if (top) c = '#5a7a3a';
    put(x, y, c);
  }

  ctx.putImageData(img, 0, 0);
}
