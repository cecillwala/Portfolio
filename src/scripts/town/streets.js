// The four streets of the town. Each is a different part of the country, a different view: the stage in
// town (the CBD), Projects in Upper Hill, Experience on Ngong Road in Kilimani, and Education in Njoro,
// out in the Rift Valley. They share the time of day and the weather; the matatu runs between them.
//
// Each street paints itself into a keyframe painter K (see kit.js): `back` is everything behind Cecil
// and the matatu, `front` the little in front of them (a hedge, a railing, tall grass). Materials go
// through K.m (graded to the time), light through K.e. Randomness is seeded and called in the same
// order at every time of day, so a building never changes between keyframes, only its light.
import { W, H, col, lerp, dith, hash, hash2, noise, noise2, fbm, seeded, paintSky, reflect } from './kit.js';

export const GROUND = 292;      // where the buildings meet the pavement
export const FEET = 302;        // where Cecil walks
export const ROAD = [311, 346]; // the carriageway, top to bottom

// ---------- pieces every street uses ----------
const lit = (K, i, share = .62) => hash(i * 7.31 + 3.7) < .06 + share * K.env.dark;           // is this window lit at this hour?
function glass(K, x, y, w, h, i, { share = .62, tint = '#86a8cc', warm = '#ffcf78', frame = '#3a3440', people = true } = {}) {
  const { m, e } = K;
  if (lit(K, i, share)) {
    for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) e.put(k, j, j < y + 2 ? '#ffe4a6' : dith(k, j) < (j - y) / h * .35 ? '#e8a05a' : warm);
    if (people && hash(i * 3.1) < .45) { e.rect(x + 3, y + h - 11, 4, 7, '#4a2c22'); e.rect(x + 3, y + h - 14, 4, 3, '#3a2018'); }
    if (hash(i * 5.7) < .4) { e.rect(x + w - 8, y + h - 9, 5, 5, '#2e3a58'); e.rect(x + w - 7, y + h - 8, 3, 3, '#8ac8ff'); }
  } else {
    for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) m.put(k, j, lerp(tint, '#3a4660', (j - y) / h * .7 + (k - x) / w * .15));
    for (let s = 0; s < Math.min(w, h) - 4; s++) if (dith(x + 3 + s, y + h - 4 - s) < .6) m.put(x + 3 + s, y + h - 4 - s, lerp(tint, '#ffffff', .45));
  }
  m.rect(x - 1, y - 1, w + 2, 1, frame); m.rect(x - 1, y + h, w + 2, 2, frame);
}
function lamp(K, x, top) {
  const { m, e, env } = K;
  m.rect(x, top, 3, GROUND - top, '#3a3644'); m.rect(x - 2, GROUND - 10, 7, 10, '#3a3644'); m.rect(x - 2, GROUND - 10, 7, 1, '#6a6478');
  m.rect(x - 18, top, 39, 3, '#3a3644'); m.rect(x - 21, top + 3, 9, 4, '#3a3644'); m.rect(x + 15, top + 3, 9, 4, '#3a3644');
  [x - 17, x + 19].forEach(lx => {
    if (env.dark > .2) { e.glow(lx, top + 10, 34, '#ffd78a', .7 * env.dark + .1); e.rect(lx - 3, top + 7, 6, 2, '#fff2c8'); }
    else m.rect(lx - 3, top + 7, 6, 2, '#c8c4bc');
  });
  if (env.dark > .2) e.glow(x + 1, GROUND + 8, 54, '#ffcf86', .32 * env.dark, .2);
}
function pavement(K, y0, y1, a = '#b8a8a0', b = '#968a88') {
  const { m } = K;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    let c = lerp(a, b, (y - y0) / (y1 - y0));
    if ((x + (y >> 2) * 9) % 18 === 0 || y === y0 + 7) c = lerp(c, '#4a4048', .45);
    m.put(x, y, c);
  }
}
function kerb(K, y, h = 4) { for (let x = 0; x < W; x++) { K.m.rect(x, y, 1, h, Math.floor(x / 12) % 2 ? '#ece6d4' : '#2a2428'); K.m.put(x, y + h, '#1a1418'); } }
function tarmac(K, wet) {
  reflect(K, ROAD[0], ROAD[1], ROAD[0] - 5, wet ? .5 : .14, wet ? '#36323c' : '#4a4650');
  for (let x = 10; x < W; x += 52) K.m.rect(x, 330, 26, 2, '#e4dcc0', wet ? .45 : .8);
}
function stageSign(K, x, place) {
  const { m } = K;
  m.rect(x, 214, 3, GROUND - 214, '#5a5a66'); m.rect(x - 18, 204, 40, 24, '#1f4fa8'); m.rect(x - 18, 204, 40, 1, '#f4f1e6'); m.rect(x - 18, 227, 40, 1, '#123378');
  m.text('STAGE', x + 2, 206, '#f4f1e6', 11, 'center');
  m.rect(x - 10, 218, 24, 6, '#f4f1e6'); m.rect(x - 8, 219, 20, 3, '#1f4fa8'); m.rect(x - 7, 223, 3, 2, '#141019'); m.rect(x + 8, 223, 3, 2, '#141019');
  if (place) { const w = Math.max(40, place.length * 7 + 8); m.rect(x + 2 - w / 2, 230, w, 12, '#f4f1e6'); m.rect(x + 2 - w / 2, 241, w, 1, '#a8a49a'); m.text(place, x + 2, 231, '#1f4fa8', 11, 'center'); }
}
function haze(K, y0, y1, strength = 1) {
  const { e, env } = K, mid = (y0 + y1) / 2;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (dith(x, y) < env.hazeA * strength * (1 - Math.abs(y - mid) / ((y1 - y0) / 2))) e.put(x, y, env.haze, .35);
}
function rim(K, x, y, h, w = 2) { if (K.env.rim) for (let j = y; j < y + h; j++) for (let i = 0; i < w; i++) if (dith(x + i, j) < .75 - i * .3) K.e.put(x + i, j, K.env.rim, .7); }

// ======================================================================================
// THE STAGE: Kenyatta Avenue, in town. Dense, KICC up close, the post office, a busy stage.
// ======================================================================================
function paintStage(K, F) {
  const { m, e, env } = K, rnd = seeded(101);
  const HZ = 236;
  paintSky(K, HZ, { sunX: { golden: .12, dawn: .9 }[env.key] ?? null, seed: 3 });
  // the far city: towers packed to the horizon
  for (let x = -4; x < W; x += 9 + Math.floor(rnd() * 10)) {
    const top = 150 + Math.floor(rnd() * 70), w = 10 + Math.floor(rnd() * 14), shade = rnd();
    for (let y = top; y < GROUND; y++) for (let i = x; i < x + w; i++) m.put(i, y, lerp(shade < .5 ? '#8c96ac' : '#9e9a96', '#6a7084', (y - top) / 160));
    for (let y = top + 4; y < GROUND - 4; y += 5) for (let i = x + 2; i < x + w - 2; i += 4) if (lit(K, i * 13 + y, .7)) e.rect(i, y, 2, 2, '#ffd27c'); else m.rect(i, y, 2, 2, '#5a6478');
  }
  haze(K, 180, 270, 1.2);
  // Times Tower: a tall slab and its crown
  for (let y = 66; y < GROUND; y++) for (let x = 448; x < 492; x++) m.put(x, y, lerp('#7c90ac', '#5c6880', (x - 448) / 44));
  m.rect(452, 56, 36, 10, '#5c6880'); m.rect(468, 40, 4, 16, '#5c6880'); e.put(469, 39, '#ff4a3a'); e.put(470, 39, '#ff4a3a');
  for (let y = 72; y < GROUND - 4; y += 6) for (let x = 452; x < 488; x += 5) if (lit(K, x * 31 + y, .55)) e.rect(x, y, 3, 3, '#ffd27c'); else m.rect(x, y, 3, 3, '#4a5a74');
  rim(K, 448, 66, GROUND - 66);
  // the Nation Centre's two towers
  [[388, 92], [414, 100]].forEach(([x, top]) => {
    for (let y = top; y < GROUND; y++) for (let i = x; i < x + 22; i++) m.put(i, y, lerp('#a8a49c', '#6c6a68', (i - x) / 22));
    for (let k = 0; k < 11; k++) m.rect(x + k, top - 11 + k, 22 - 2 * k, 1, '#8a867e');
    for (let y = top + 6; y < GROUND - 4; y += 6) for (let i = x + 3; i < x + 20; i += 5) if (lit(K, i * 17 + y, .5)) e.rect(i, y, 3, 3, '#ffcf78'); else m.rect(i, y, 3, 3, '#4e5664');
    rim(K, x, top, GROUND - top);
  });
  // KICC: the drum, its ribs, its saucer crown, and the flag
  const K0 = 196, KW = 52, KT = 96;
  for (let y = KT; y < GROUND; y++) for (let x = K0; x < K0 + KW; x++) {
    const f = (x - K0) / KW, shade = .25 + .75 * Math.sin(f * Math.PI);
    m.put(x, y, (x - K0) % 6 === 0 ? lerp('#7a4434', '#4a2a22', 1 - shade) : lerp('#c48a6c', '#6e4234', 1 - shade));
  }
  for (let y = KT + 8; y < GROUND - 4; y += 7) for (let x = K0 + 3; x < K0 + KW - 3; x += 6) if (lit(K, x * 7 + y * 3, .55)) e.rect(x, y, 3, 4, '#ffd27c'); else m.rect(x, y, 3, 4, '#3e2c2a');
  for (let x = K0 - 24; x < K0 + KW + 24; x++) { const d = Math.abs(x - (K0 + KW / 2)) / (KW / 2 + 24); m.rect(x, KT - 6 + Math.round(d * 4), 1, 6 - Math.round(d * 4), '#9a6a58'); m.put(x, KT - 7 + Math.round(d * 4), '#d8b8a0'); }
  m.rect(K0 + KW / 2 - 1, KT - 30, 2, 24, '#5a4a48');
  [['#1a1a1a', 0], ['#c8302a', 3], ['#2a7a3a', 6]].forEach(([c, dy]) => m.rect(K0 + KW / 2 + 1, KT - 30 + dy, 12, 3, c));
  rim(K, K0, KT, GROUND - KT, 3);
  // street level, left: the post office (the contact door)
  const PX = 6, PW = 150, PT = 186;
  for (let y = PT; y < GROUND; y++) for (let x = PX; x < PX + PW; x++) m.put(x, y, lerp('#e8dcc0', '#cbbd9e', (y - PT) / 106));
  m.rect(PX - 4, PT - 8, PW + 8, 8, '#a8442e'); m.rect(PX - 4, PT - 8, PW + 8, 1, '#d47a5a'); m.rect(PX, PT, PW, 2, '#8a7a60');
  for (let w = 0; w < 5; w++) {
    const wx = PX + 10 + w * 28;
    glass(K, wx, PT + 12, 18, 24, 900 + w, { tint: '#7a96b4', frame: '#6a5c48', share: .5 });
    for (let k = 0; k < 9; k++) m.put(wx + 9 - Math.round(Math.sqrt(81 - k * k)), PT + 12 - Math.round(k / 3), '#8a7a60');
  }
  m.rect(PX, PT + 46, PW, 14, '#b82c24'); m.text('POST OFFICE', PX + PW / 2, PT + 48, '#fff6e0', 11, 'center', 1);
  e.glow(PX + PW / 2, PT + 53, 40, '#ff6a4a', .25 * env.dark);
  for (let w = 0; w < 4; w++) glass(K, PX + 8 + w * 36, PT + 66, 28, 34, 920 + w, { tint: '#8aa6c0', frame: '#6a5c48', share: .8 });
  m.rect(PX + PW / 2 - 12, GROUND - 38, 24, 38, '#5a4030'); m.rect(PX + PW / 2 - 10, GROUND - 36, 9, 36, '#7a5a40'); m.rect(PX + PW / 2 + 1, GROUND - 36, 9, 36, '#7a5a40');
  if (env.dark > .2) e.glow(PX + PW / 2, GROUND - 20, 26, '#ffd890', .4 * env.dark);
  // a red post box on the pavement
  m.rect(PX + PW + 6, GROUND - 26, 12, 26, '#c8302a'); m.rect(PX + PW + 5, GROUND - 30, 14, 5, '#a8241e'); m.rect(PX + PW + 8, GROUND - 20, 8, 2, '#2a1414'); m.rect(PX + PW + 6, GROUND - 26, 2, 26, '#e85a4a');
  // the shopfronts between: a hoteli and a phone repair stall
  const shops = [[262, 108, '#2a7a5a', 'HOTELI · CHAI'], [370, 70, '#c8902a', 'SIMU']];
  shops.forEach(([x, w, c, label], n) => {
    for (let y = 214; y < GROUND; y++) for (let i = x; i < x + w; i++) m.put(i, y, lerp('#d8d0c4', '#b0a698', (y - 214) / 78));
    for (let k = 0; k < 3; k++) glass(K, x + 6 + k * (w / 3), 220, w / 3 - 12, 16, 940 + n * 5 + k, { tint: '#8aa0b8', frame: '#7a7064', share: .7 });
    m.rect(x, 242, w, 12, c); m.text(label, x + w / 2, 242, '#fff6e0', 11, 'center');
    for (let y = 256; y < GROUND; y++) for (let i = x + 4; i < x + w - 4; i++) (env.dark > .2 || lit(K, 960 + n, .9)) ? e.put(i, y, lerp('#ffd890', '#e8a058', (y - 256) / 36 * .6)) : m.put(i, y, lerp('#6a6e7a', '#4a4e5a', (y - 256) / 36));
    for (let k = 0; k < w; k += 8) { m.rect(x + k, 254, 8, 3, n ? '#e8c040' : '#3a9a6a'); m.rect(x + k + 4, 254, 4, 3, '#f4f1e6'); }   // the awning
  });
  // the stage: a long shelter, people waiting under it
  const SX = 452, SW = 188;
  m.rect(SX, 232, SW, 4, '#2e4a8a'); m.rect(SX - 2, 228, SW + 4, 4, '#3c5ca8'); for (let x = SX + 6; x < SX + SW; x += 46) m.rect(x, 236, 3, GROUND - 236, '#5a5a66');
  for (let y = 236; y < GROUND; y++) for (let x = SX; x < SX + SW; x++) if (dith(x, y) < .22) m.put(x, y, '#1a2236', .5);
  m.rect(SX + 20, GROUND - 14, 120, 3, '#7a6a5a'); m.rect(SX + 24, GROUND - 11, 2, 11, '#4a4048'); m.rect(SX + 134, GROUND - 11, 2, 11, '#4a4048');
  if (env.dark > .2) { e.rect(SX + 10, 236, SW - 20, 2, '#e8f4ff'); e.glow(SX + SW / 2, 250, 90, '#e8f4ff', .3 * env.dark, .35); }
  stageSign(K, 432, 'TOWN');
  // pavement, kerb, lamps, road
  pavement(K, GROUND, 306); kerb(K, 306);
  lamp(K, 240, 168); lamp(K, 600, 168);
  tarmac(K, env.overcast);
  // a zebra crossing
  for (let x = 300; x < 380; x += 10) m.rect(x, ROAD[0] + 2, 6, ROAD[1] - ROAD[0] - 4, '#ece6d4', env.overcast ? .4 : .7);
  // in front: the avenue's railing and a bed of flowers
  const f = F.m;
  for (let x = 0; x < W; x++) f.rect(x, ROAD[1], 1, 4, Math.floor(x / 12) % 2 ? '#ece6d4' : '#2a2428');
  for (let x = 0; x < W; x++) { const top = 350 + Math.round(noise(x * .1) * 4); for (let y = top; y < H; y++) f.put(x, y, hash2(x, y) < .2 ? (hash2(y, x) < .5 ? '#e8c040' : '#e04a4a') : y === top ? '#5a8a3a' : '#2e5a2a'); }
  f.rect(0, 338, W, 2, '#202024'); for (let x = 4; x < W; x += 18) { f.rect(x, 338, 2, 14, '#202024'); f.put(x, 337, '#4a4a54'); }
  f.rect(0, 344, W, 1, '#202024');
}

// ======================================================================================
// PROJECTS: Upper Hill at the top of the ridge. Musoni finished and lit, LexIMS under a crane,
// a jacaranda in bloom, the Ngong Hills on the horizon.
// ======================================================================================
function paintProjects(K, F) {
  const { m, e, env, get } = K, rnd = seeded(7);
  const HZ = 228;
  const sun = paintSky(K, HZ, { sunX: { golden: .33, dawn: .86 }[env.key] ?? null, seed: 5 });
  // the Ngong Hills: their knuckles to the west
  const ridge = x => { let h = 7 + noise(x * .05) * 6; [[120, 22, 26], [160, 30, 24], [196, 26, 22], [236, 34, 26], [276, 22, 26]].forEach(([kx, kh, kw]) => { h = Math.max(h, kh * Math.exp(-(((x - kx) / kw) ** 2))); }); return HZ - h; };
  for (let x = 0; x < W; x++) {
    const top = Math.round(ridge(x));
    for (let y = top; y < HZ + 30; y++) {
      let c = lerp('#7a8aa8', '#5a6a88', Math.min(1, (y - top) / 40));
      m.put(x, y, c);
      if (y - top < 2 && sun && env.rim) e.put(x, y, env.rim, Math.max(0, 1 - Math.abs(x - sun[0]) / 110) * .9);
    }
  }
  for (let n = 0; n < 160; n++) { const x = rnd() * W, y = ridge(x) + 4 + rnd() * 24, on = rnd(); if (env.dark > .25 && on < env.dark) e.put(x, y, on < .6 ? '#ffcf7a' : '#ffefb8', .8); }
  haze(K, 196, 252);
  // the far city
  const far = (x, top, w, base, a, share) => {
    for (let y = top; y < base; y++) for (let i = x; i < x + w; i++) m.put(i, y, lerp(a, '#6a7488', (y - top) / 90));
    for (let y = top + 3; y < base - 2; y += 3) for (let i = x + 2; i < x + w - 1; i += 3) { const r = rnd(); if (r < share) (env.dark > .25 ? e.put(i, y, r < share / 2 ? '#ffd27c' : '#ffb35e') : m.put(i, y, '#5a6a80')); }
  };
  for (let x = 0; x < W; x += 8 + Math.floor(rnd() * 10)) { const low = x > 150 && x < 290; far(x, (low ? 236 : 214) + Math.floor(rnd() * 16), 6 + Math.floor(rnd() * 12), 266, '#9aa2b4', .2); }
  for (let x = 4; x < W; x += 12 + Math.floor(rnd() * 16)) { const low = x > 150 && x < 290, top = 196 + Math.floor(rnd() * 22), w = 8 + Math.floor(rnd() * 12); if (!low) far(x, top, w, 266, '#8a92a8', .24); }
  // KICC in the distance, and Britam Tower's glass prism
  const KX = 248;
  m.rect(KX - 9, 156, 18, 108, '#9a6a5a'); for (let y = 160; y < 262; y += 4) for (let x = KX - 7; x < KX + 7; x += 3) { const r = rnd(); if (env.dark > .25 && r < .35) e.put(x, y, '#ffcf78'); }
  for (let x = KX - 19; x < KX + 20; x++) { const d = Math.abs(x - KX) / 19; m.rect(x, 152 + Math.round(d * 2), 1, 4 - Math.round(d * 2), '#9a6a5a'); }
  m.rect(KX, 140, 1, 12, '#6a5a58'); e.put(KX, 139, '#ff5a4a');
  for (let y = 96; y < 266; y++) {
    const cx = 290, half = 11 + (y - 96) * .04;
    for (let x = Math.round(cx - half); x < cx + half; x++) {
      if (y < 96 + (cx + half - x) * .9) continue;
      const sunSide = x < cx - 2, r = rnd();
      m.put(x, y, sunSide ? lerp('#a8c4e0', '#6a88b0', (y - 96) / 170) : lerp('#5a7090', '#3e5070', (y - 96) / 170));
      if (sunSide && env.rim && y % 4 === 0 && dith(x, y) < .5) e.put(x, y, env.rim, .45);
      if (!sunSide && y % 4 === 0 && r < .12 && env.dark > .25) e.put(x, y, '#ffd27c');
    }
  }
  far(602, 112, 22, 266, '#8a92a8', .3); m.rect(612, 98, 2, 14, '#6a7088'); e.put(612, 97, '#ff5a4a');
  // the green city: a band of trees
  for (let x = -6; x < W; x += 5 + Math.floor(rnd() * 6)) {
    const r = 6 + Math.floor(rnd() * 8), cy = 262 + Math.floor(rnd() * 8);
    for (let y = cy - r; y < GROUND; y++) for (let i = x - r; i < x + r; i++) {
      const d = Math.hypot(i - x, Math.max(0, cy - y) * 1.2); if (d > r + (noise2(i * .5, y * .5) - .5) * 4) continue;
      const top = y < cy - r * .4 && i < x + 2;
      m.put(i, y, top ? (dith(i, y) < .5 ? '#7a9a4a' : '#4a6a3a') : dith(i, y) < .3 ? '#3a5a34' : '#2e4a2e');
    }
  }
  // Musoni
  const FLOOR = 34, MX = 304, MW = 184, LOBBY = 62, MT = GROUND - LOBBY - 4 * FLOOR;
  for (let y = MT; y < GROUND; y++) for (let x = MX; x < MX + MW; x++) m.put(x, y, lerp('#c8bcb0', '#a89c94', (y - MT) / 200));
  rim(K, MX, MT, GROUND - MT, 3);
  m.rect(MX - 3, MT - 6, MW + 6, 6, '#6a6470'); m.rect(MX - 3, MT - 6, MW + 6, 1, '#d8d4cc');
  for (let f = 0; f < 4; f++) {
    const fy = MT + 8 + f * FLOOR;
    m.rect(MX + 4, fy - 4, MW - 8, 3, '#8a8088');
    for (let w = 0; w < 6; w++) { const wx = MX + 10 + w * 29; glass(K, wx, fy, 24, 24, 100 + f * 6 + w, { frame: '#5a5460' }); m.rect(wx + 12, fy, 1, 24, '#4a4450'); }
  }
  const LY = GROUND - LOBBY, DX = MX + MW / 2;
  m.rect(MX + 4, LY, MW - 8, LOBBY, '#4a4450');
  const lobbyLit = env.dark > .15;
  for (let y = LY + 14; y < GROUND; y++) for (let x = MX + 8; x < MX + MW - 8; x++) (lobbyLit ? e.put(x, y, y < LY + 17 ? '#fff0c4' : lerp('#ffd890', '#e8a058', (y - LY - 14) / 48 * .7)) : m.put(x, y, lerp('#c8d8e4', '#8a9cb0', (y - LY - 14) / 48)));
  for (let x = MX + 8; x < MX + MW - 8; x += 28) m.rect(x, LY + 14, 2, LOBBY - 14, '#4a4450');
  m.rect(MX + 18, GROUND - 16, 40, 16, '#7a5440'); m.rect(MX + 18, GROUND - 16, 40, 2, '#61bc00');
  m.rect(MX + 30, GROUND - 26, 6, 10, '#3a2a24'); m.rect(MX + 30, GROUND - 30, 6, 4, '#2a1a14');
  m.rect(MX + MW - 34, GROUND - 14, 10, 14, '#8a6a5a'); for (let k = 0; k < 14; k++) m.put(MX + MW - 37 + rnd() * 16, GROUND - 16 - rnd() * 18, rnd() < .5 ? '#3a8a4a' : '#5aa04a');
  m.rect(DX - 18, GROUND - 46, 36, 46, '#4a4450');
  (lobbyLit ? e : m).rect(DX - 16, GROUND - 44, 15, 44, lobbyLit ? '#fff0c8' : '#d8e4ec'); (lobbyLit ? e : m).rect(DX + 1, GROUND - 44, 15, 44, lobbyLit ? '#fff0c8' : '#d8e4ec');
  m.rect(DX - 3, GROUND - 26, 1, 8, '#4a4450'); m.rect(DX + 3, GROUND - 26, 1, 8, '#4a4450');
  m.rect(MX + 4, LY, MW - 8, 14, '#202638'); m.rect(MX + 4, LY + 13, MW - 8, 1, '#61bc00');
  e.text('MUSONI', DX, LY + 2, '#c8f59a', 11, 'center', 2);
  if (lobbyLit) e.glow(DX, GROUND + 4, 70, '#ffd890', .45, .22);
  const SY = MT - 46;
  m.rect(MX + 46, MT - 14, 2, 8, '#3a3a44'); m.rect(MX + MW - 48, MT - 14, 2, 8, '#3a3a44');
  e.glow(DX, SY + 16, 110, '#61bc00', .2 + .35 * env.dark, .42);
  m.rect(MX + 26, SY, MW - 52, 34, '#141a28'); m.rect(MX + 26, SY, MW - 52, 1, '#5a6a80');
  e.text('MUSONI', DX, SY + 7, '#4a9a10', 22, 'center', 3); e.text('MUSONI', DX, SY + 6, '#d9ffb0', 22, 'center', 3);
  m.rect(MX + 8, MT - 16, 18, 10, '#7a7480'); m.rect(MX + MW - 14, MT - 34, 1, 28, '#5a5460'); e.put(MX + MW - 14, MT - 35, '#ff4a3a');
  // LexIMS under construction, and the crane
  const LX = 520, LW = 120, LT = GROUND - 5 * FLOOR;
  for (let f = 0; f < 5; f++) {
    const fy = LT + f * FLOOR;
    for (let y = fy + 4; y < fy + FLOOR; y++) for (let x = LX; x < LX + LW; x++) m.put(x, y, lerp('#4a4250', '#5e5462', (x - LX) / LW));
    m.rect(LX, fy, LW, 4, '#b8b0a8'); m.rect(LX, fy, LW, 1, '#e4dcd4');
    for (let x = LX + 4; x < LX + LW; x += 30) { m.rect(x, fy + 4, 5, FLOOR - 4, '#a8a098'); m.rect(x, fy + 4, 1, FLOOR - 4, '#d4ccc4'); }
  }
  for (let y = LT - 2; y < LT + 2 * FLOOR; y++) for (let x = LX - 2; x < LX + LW; x++) if ((x * 2 + y) % 4 === 0 || dith(x, y) < .2) m.put(x, y, '#3a8a4a', .6);
  for (let y = LT; y < GROUND; y += 12) m.rect(LX - 12, y, 12, 1, '#c8b08a');
  m.rect(LX - 12, LT, 1, GROUND - LT, '#c8b08a'); m.rect(LX - 2, LT, 1, GROUND - LT, '#c8b08a');
  for (let y = LT; y < GROUND - 12; y += 12) for (let k = 0; k < 10; k++) m.put(LX - 12 + k, y + k + 1, '#a8906c');
  [[LX + 50, LT + 2 * FLOOR + 6], [LX + 96, LT + 3 * FLOOR + 6]].forEach(([x, y]) => { if (env.dark > .1) e.glow(x, y + 8, 44, '#eef2ff', .5, .7); e.rect(x - 4, y, 9, 5, env.dark > .1 ? '#f6f8ff' : '#c8ccd4'); m.rect(x, y + 5, 1, 4, '#3a3a44'); });
  m.rect(LX + 70, LT + 3 * FLOOR - 14, 4, 10, '#e8b830'); m.rect(LX + 70, LT + 3 * FLOOR - 18, 4, 4, '#6a4030'); m.rect(LX + 69, LT + 3 * FLOOR - 19, 6, 2, '#ffd23a');
  m.rect(LX - 14, GROUND - 34, LW + 14, 34, '#2452a8'); for (let x = LX - 14; x < W; x += 30) m.rect(x, GROUND - 34, 1, 34, '#3a6ac8');
  m.rect(LX - 14, GROUND - 34, LW + 14, 2, '#f4f1e6'); m.rect(LX - 14, GROUND - 4, LW + 14, 4, '#1a3a7a');
  m.text('LEXIMS', LX + 52, GROUND - 29, '#f4f1e6', 11, 'center', 2); m.text('COMING SOON', LX + 52, GROUND - 17, '#ffcc4a', 11, 'center');
  const CX = 606, CT = 40;
  for (let y = CT; y < GROUND - 34; y++) { m.put(CX, y, '#e8b830'); m.put(CX + 8, y, '#e8b830'); const k = (y - CT) % 10; m.put(CX + 1 + Math.round((k < 5 ? k : 9 - k) * 1.4), y, '#c49020'); }
  m.rect(CX - 190, CT, 236, 2, '#e8b830'); m.rect(CX - 190, CT + 7, 236, 1, '#e8b830');
  for (let x = CX - 190; x < CX + 46; x += 7) for (let k = 0; k < 7; k++) m.put(x + k, CT + 1 + Math.round(k * .85), '#c49020');
  m.rect(CX + 26, CT + 2, 20, 10, '#7a7a82'); m.rect(CX - 3, CT - 12, 14, 12, '#e8b830'); (env.dark > .2 ? e : m).rect(CX - 1, CT - 10, 10, 6, env.dark > .2 ? '#ffd98a' : '#a8c8e0');
  for (let x = CX - 180; x < CX + 4; x++) { const y = CT - 20 + Math.round((x - (CX - 180)) / 184 * 18); if (x % 2) m.put(x, y, '#c49020'); }
  m.rect(CX + 3, CT - 26, 2, 14, '#e8b830'); e.put(CX + 3, CT - 27, '#ff3a2a'); e.put(CX + 4, CT - 27, '#ff3a2a');
  // pavement, lamps, stage, petals
  pavement(K, GROUND, 306, '#c4aaa8', '#9e8a8e'); kerb(K, 306);
  lamp(K, 284, 168); lamp(K, 500, 168);
  stageSign(K, 166, 'UPPER HILL');
  for (let n = 0; n < 340; n++) { const x = Math.floor(rnd() * 260), y = GROUND + Math.floor(rnd() * 14), r = rnd(); if (r < 1 - x / 280) m.put(x, y, rnd() < .5 ? '#a87ad8' : '#8a5ac0'); }
  // the jacaranda
  const bark = (x, y, len, ang, w) => {
    for (let s = 0; s < len; s++) { const px = x + Math.cos(ang) * s + Math.sin(s * .15) * 1.2, py = y - Math.sin(ang) * s, ww = Math.max(1.5, w * (1 - s / len * .65)); for (let k = -ww / 2; k < ww / 2; k++) m.put(px + k, py, k > ww / 2 - 1.5 ? '#8a6a5a' : '#4a3a34'); }
    return [x + Math.cos(ang) * len, y - Math.sin(ang) * len];
  };
  const [ax, ay] = bark(46, GROUND + 4, 128, 1.55, 11);
  const tips = [bark(ax, ay, 64, 2.5, 6), bark(ax, ay, 90, .85, 6), bark(ax + 2, ay + 34, 74, .35, 5), bark(ax, ay + 18, 40, 2.9, 4), bark(ax, ay, 70, 1.5, 5), bark(ax + 30, ay - 40, 50, .6, 3)];
  const mask = new Float32Array(W * H), nx = new Float32Array(W * H), ny = new Float32Array(W * H);
  const clump = (bx, by, r) => { for (let y = Math.floor(by - r); y < by + r; y++) for (let x = Math.floor(bx - r); x < bx + r; x++) { if (x < 0 || y < 0 || x >= W || y >= H) continue; const d = Math.hypot(x - bx, y - by) / r; if (d > 1 - (fbm(x * .25, y * .25) - .5) * .5) continue; const i = y * W + x; mask[i] = 1; nx[i] = (x - bx) / r; ny[i] = (y - by) / r; } };
  tips.forEach(([ex, ey]) => { for (let n = 0; n < 34; n++) clump(ex + (rnd() - .5) * 80, ey + (rnd() - .5) * 46, 4 + rnd() * 9); });
  for (let n = 0; n < 50; n++) clump(rnd() * 190, rnd() * 110, 4 + rnd() * 8);
  const back = !!env.rim;   // with the sun low behind it, the tree is backlit
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!mask[i] || fbm(x * .3 + 50, y * .3) < .28) continue;
    const edge = (x + 1 < W && !mask[i + 1]) || (y > 0 && !mask[i - W]);
    const light = back ? nx[i] * .8 - ny[i] * .4 : -ny[i] * .7 + nx[i] * .3;
    let c = light > .55 ? '#8a5ac0' : light > .1 ? (dith(x, y) < .5 ? '#7048a8' : '#5e3a94') : '#46287a';
    m.put(x, y, c);
    if (edge && light > -.1) (back ? e.put(x, y, light > .5 ? '#f0b4e8' : '#c07ad4') : m.put(x, y, '#b48ae0'));
    else if (hash2(x, y) < .06) m.put(x, y, '#b088e0');
  }
  // the road, wet or dry
  tarmac(K, env.overcast);
  // in front: the near kerb and the bougainvillea
  const f = F.m;
  for (let x = 0; x < W; x++) f.rect(x, ROAD[1], 1, 4, Math.floor(x / 12) % 2 ? '#ece6d4' : '#2a2428');
  const hedge = new Float32Array(W * H), hr = seeded(41);
  for (let x = -10; x < W + 10; x += 9 + hr() * 8) {
    const r = 9 + hr() * 8, cy = ROAD[1] + 6 + hr() * 6 - (x > 360 && x < 470 ? 6 : 0);
    for (let y = Math.floor(cy - r); y < H; y++) for (let i = Math.floor(x - r); i < x + r; i++) { if (i < 0 || i >= W || y < 0) continue; const d = Math.hypot(i - x, Math.min(0, y - cy)) / r; if (d > 1 - (fbm(i * .3, y * .3) - .5) * .5) continue; hedge[y * W + i] = Math.max(hedge[y * W + i], 1 - (y - (cy - r)) / (r * 2.4)); }
  }
  for (let y = ROAD[1] - 14; y < H; y++) for (let x = 0; x < W; x++) {
    const h = hedge[y * W + x]; if (!h) continue;
    const bloom = fbm(x * .35 + 9, y * .35) > .66 - h * .18, top = !hedge[(y - 1) * W + x];
    let c = h > .6 ? '#4a7a3a' : h > .3 ? '#365e2e' : '#24401e';
    if (bloom) c = top ? '#ffa8d8' : h > .55 ? (dith(x, y) < .5 ? '#f05aa8' : '#d83a8e') : '#9a2a6a';
    else if (top) c = '#7aa04a';
    f.put(x, y, c);
  }
}

// ======================================================================================
// EXPERIENCE: Ngong Road in Kilimani. The hills close and green, a forest at their feet, two offices
// (Podii in an old house with a garden, GikTek in glass), a boda boda stage and a mama mboga.
// ======================================================================================
function paintExperience(K, F) {
  const { m, e, env } = K, rnd = seeded(211);
  const HZ = 220;
  const sun = paintSky(K, HZ, { sunX: { golden: .55, dawn: .9, day: .25 }[env.key] ?? null, seed: 9 });
  // the Ngong Hills, close: five knuckles filling the view
  const ridge = x => { let h = 18 + noise(x * .03) * 8; [[110, 52, 44], [210, 70, 46], [310, 62, 42], [410, 78, 50], [520, 58, 46]].forEach(([kx, kh, kw]) => { h = Math.max(h, kh * Math.exp(-(((x - kx) / kw) ** 2))); }); return HZ - h; };
  for (let x = 0; x < W; x++) {
    const top = Math.round(ridge(x));
    for (let y = top; y < 280; y++) {
      const shade = noise2(x * .04, y * .08);
      m.put(x, y, lerp(lerp('#7a9a78', '#5a7a60', Math.min(1, (y - top) / 50)), '#4a6a4e', shade * .4));
      if (y - top < 2 && sun && env.rim) e.put(x, y, env.rim, Math.max(0, 1 - Math.abs(x - sun[0]) / 140) * .9);
    }
  }
  haze(K, 170, 250, 1.1);
  // the forest at their feet: cypress spires and broad crowns
  for (let x = -8; x < W; x += 4 + Math.floor(rnd() * 5)) {
    const tall = rnd() < .3, r = tall ? 4 + rnd() * 3 : 8 + rnd() * 8, top = tall ? 196 + rnd() * 30 : 236 + rnd() * 16;
    for (let y = Math.floor(top); y < GROUND; y++) for (let i = Math.floor(x - r); i < x + r; i++) {
      const w = tall ? r * Math.min(1, (y - top) / 26) : r * Math.sqrt(Math.max(0, 1 - ((y - top - r) / r) ** 2) ) + (y > top + r ? r : 0);
      if (Math.abs(i - x) > w + (noise2(i * .6, y * .6) - .5) * 3) continue;
      const side = i < x;
      m.put(i, y, tall ? (side ? '#3a6a4a' : '#2a5040') : side ? (dith(i, y) < .5 ? '#5a8a4a' : '#4a7a40') : '#3a6438');
    }
  }
  // Podii: an old two-storey house turned office, a red tiled roof, a garden wall and gate
  const PX = 40, PW = 172, PT = 200;
  for (let y = PT; y < GROUND; y++) for (let x = PX; x < PX + PW; x++) m.put(x, y, lerp('#f0e4c8', '#d8c8a8', (y - PT) / 92));
  for (let k = 0; k < 26; k++) m.rect(PX - 8 + k * 1.6, PT - k, PW + 16 - k * 3.2, 1, k % 3 ? '#b8503a' : '#9a3e2c');
  m.rect(PX - 8, PT, PW + 16, 3, '#7a3424'); m.rect(PX + PW - 40, PT - 34, 12, 20, '#a89a8a');
  for (let w = 0; w < 4; w++) { glass(K, PX + 14 + w * 40, PT + 12, 22, 22, 300 + w, { tint: '#8aa8c4', frame: '#ffffff', share: .55 }); m.rect(PX + 12 + w * 40, PT + 36, 26, 2, '#b8a888'); }
  for (let w = 0; w < 4; w++) if (w !== 2) glass(K, PX + 14 + w * 40, PT + 50, 22, 26, 310 + w, { tint: '#8aa8c4', frame: '#ffffff', share: .7 });
  m.rect(PX + 90, PT + 46, 24, 46, '#6a3e2a'); m.rect(PX + 92, PT + 48, 9, 44, '#8a5638'); m.rect(PX + 103, PT + 48, 9, 44, '#8a5638'); m.rect(PX + 86, PT + 42, 32, 4, '#7a3424');
  if (env.dark > .2) e.glow(PX + 102, PT + 70, 30, '#ffd890', .45 * env.dark);
  // the garden wall in front, with bougainvillea over it, and the gate sign
  for (let y = GROUND - 22; y < GROUND; y++) for (let x = PX - 6; x < PX + PW + 6; x++) if (x < PX + 84 || x > PX + 120) m.put(x, y, lerp('#d8ccb4', '#b8aa90', (y - GROUND + 22) / 22));
  for (let x = PX - 6; x < PX + 84; x++) { const top = GROUND - 26 - Math.round(fbm(x * .2, 3) * 10); for (let y = top; y < GROUND - 14; y++) if (fbm(x * .3, y * .3) > .35) m.put(x, y, fbm(x * .5 + 4, y * .5) > .55 ? '#e04a9a' : '#4a7a3a'); }
  m.rect(PX + 120, GROUND - 40, 10, 40, '#c8b8a0'); m.rect(PX + 115, GROUND - 54, 40, 14, '#3a2a5a'); m.text('PODII', PX + 135, GROUND - 52, '#d8b8ff', 11, 'center', 1);
  if (env.dark > .2) e.glow(PX + 135, GROUND - 47, 26, '#c79bff', .4 * env.dark);
  // GikTek: four storeys of glass and white frame, its name on the roof
  const GX = 372, GW = 176, GT = GROUND - 170;
  for (let y = GT; y < GROUND; y++) for (let x = GX; x < GX + GW; x++) m.put(x, y, lerp('#e8ecf0', '#c8ced6', (y - GT) / 170));
  for (let f = 0; f < 4; f++) for (let w = 0; w < 5; w++) glass(K, GX + 8 + w * 34, GT + 10 + f * 32, 28, 24, 400 + f * 5 + w, { tint: '#6c9cc8', frame: '#a8b0bc' });
  rim(K, GX, GT, GROUND - GT, 2);
  for (let y = GROUND - 30; y < GROUND; y++) for (let x = GX + 50; x < GX + GW - 50; x++) (env.dark > .15 ? e.put(x, y, '#fff0c8') : m.put(x, y, '#c8dcec'));
  m.rect(GX + GW / 2, GROUND - 30, 1, 30, '#8a929c');
  m.rect(GX + 30, GT - 30, GW - 60, 24, '#0e1a2a'); e.glow(GX + GW / 2, GT - 18, 90, '#5fe1ff', .15 + .35 * env.dark, .4);
  e.text('GIKTEK', GX + GW / 2, GT - 27, '#2a9ac8', 22, 'center', 3); e.text('GIKTEK', GX + GW / 2, GT - 28, '#c8f6ff', 22, 'center', 3);
  m.rect(GX + 40, GT - 6, 2, 6, '#4a5260'); m.rect(GX + GW - 42, GT - 6, 2, 6, '#4a5260');
  // between them: the boda boda stage, bikes waiting under a sun umbrella
  m.rect(286, 222, 2, GROUND - 222, '#5a5a66'); for (let k = 0; k < 40; k++) m.rect(266 + k, 218 + Math.abs(k - 20) * .3, 1, 3, k % 10 < 5 ? '#e8c040' : '#2a6ab8');
  [[246, '#c8302a'], [278, '#2a2a2a'], [312, '#2a6ab8']].forEach(([x, c]) => {
    for (let y = -6; y <= 6; y++) for (let k = -6; k <= 6; k++) { const d = Math.hypot(k, y); if (d < 6.5) { m.put(x + k, GROUND - 6 + y, d < 3 ? '#a8acb4' : '#1a1a1e'); m.put(x + 30 + k, GROUND - 6 + y, d < 3 ? '#a8acb4' : '#1a1a1e'); } }
    m.rect(x + 2, GROUND - 16, 26, 6, c); m.rect(x + 8, GROUND - 20, 12, 4, '#1a1a1e'); m.rect(x + 26, GROUND - 26, 2, 12, '#5a5a66'); m.rect(x + 22, GROUND - 28, 8, 2, '#3a3a44');
  });
  stageSign(K, 230, 'NGONG RD');
  // the mama mboga: tomatoes, onions and sukuma under a striped umbrella
  const MX0 = 566;
  m.rect(MX0, GROUND - 24, 64, 24, '#8a5a34'); m.rect(MX0, GROUND - 26, 64, 3, '#a87444');
  for (let k = 0; k < 8; k++) { m.disc(MX0 + 6 + k * 4, GROUND - 29, 2.2, '#d8302a'); m.disc(MX0 + 38 + (k % 4) * 5, GROUND - 29 - Math.floor(k / 4) * 3, 2.4, k % 2 ? '#e8d8b8' : '#b87a5a'); }
  m.rect(MX0 + 2, GROUND - 34, 18, 4, '#3a8a3a'); m.rect(MX0 + 30, GROUND - 60, 2, 34, '#5a5a66');
  for (let k = 0; k < 60; k++) { const d = (k - 30) / 30, top = GROUND - 72 + Math.round(d * d * 12); m.rect(MX0 + 1 + k, top, 1, 6 + Math.round((1 - d * d) * 2), Math.floor((k + 3) / 10) % 2 ? '#f4f1e6' : '#c8302a'); m.put(MX0 + 1 + k, top + 7 + Math.round((1 - d * d) * 2), '#7a1a14'); }
  // the walkway, the kerb, lamps, the road
  pavement(K, GROUND, 306, '#b4a490', '#988878'); kerb(K, 306);
  lamp(K, 340, 172); lamp(K, 600, 172);
  tarmac(K, env.overcast);
  // in front: long grass and a few wild flowers, and a eucalyptus to the right
  const f = F.m;
  for (let x = 0; x < W; x++) {
    const top = ROAD[1] + 2 + Math.round(noise(x * .07) * 6);
    for (let y = top; y < H; y++) f.put(x, y, y < top + 2 ? '#8aa04a' : dith(x, y) < .4 ? '#4a6a2e' : '#3a5a26');
    if (hash(x * 1.7) < .4) { const h = 6 + hash(x * 3.3) * 14; for (let k = 0; k < h; k++) f.put(x + Math.round(Math.sin(k * .2 + x) * 1), top - k, k > h - 3 ? '#b8c060' : '#6a8a3a'); }
    if (hash(x * 9.1) < .05) f.disc(x, top - 4, 1.6, hash(x) < .5 ? '#f4d03a' : '#f4f1e6');
  }
  const TX = 622;
  for (let y = 60; y < H; y++) { const w = 7 + Math.round((y - 60) / 60) + Math.round(noise(y * .08) * 2); for (let x = TX - w; x < TX + w; x++) { const peel = fbm(x * .3, y * .08) > .55; f.put(x, y, x < TX - w + 2 ? '#e8dcc8' : peel ? '#b8a088' : x > TX + w - 3 ? '#8a7a6a' : '#d4c8b4'); } }
  [[TX - 4, 120, -1], [TX, 90, 1], [TX - 2, 150, -1]].forEach(([bx, by, d]) => { for (let k = 0; k < 40; k++) f.disc(bx + d * k * 1.1, by - k * .9, 2.2 - k * .03, '#c8bcaa'); });
  for (let n = 0; n < 600; n++) { const x = W - 80 + hash(n * 1.3) * 100, y = hash(n * 2.7) * 100; if (fbm(x * .1, y * .1) > .42) f.disc(x, y, 2.4, hash(n) < .25 ? '#9ab08a' : hash(n * 3) < .5 ? '#5a7a5a' : '#46664a'); }
}

// ======================================================================================
// EDUCATION: Njoro, in the Rift Valley. Wide sky, the Mau escarpment and Menengai crater on the horizon,
// wheat fields, acacias, the gate of Egerton University and its red-roofed halls, a murram road.
// ======================================================================================
function paintEducation(K, F) {
  const { m, e, env, get } = K, rnd = seeded(307);
  const HZ = 236;
  const sun = paintSky(K, HZ, { sunX: { golden: .2, dawn: .78, day: .6 }[env.key] ?? null, seed: 13, cloudiness: .8 });
  // the Mau escarpment, long and blue, rising to the west; Menengai, broad and flat-topped
  for (let x = 0; x < W; x++) {
    const mau = HZ - 8 - (1 - x / W) * 40 - noise(x * .02) * 10, men = HZ - 26 * Math.exp(-(((x - 500) / 70) ** 4));
    for (let y = Math.round(Math.min(mau, men)); y < HZ + 10; y++) {
      const isMen = y >= men - 1 && men < mau;
      m.put(x, y, isMen ? lerp('#8a98b4', '#6a7894', (y - men) / 26) : lerp('#7c8cb0', '#6a7aa0', (y - mau) / 50));
    }
    if (sun && env.rim && Math.abs(x - sun[0]) < 120) e.put(x, Math.round(Math.min(mau, men)), env.rim, (1 - Math.abs(x - sun[0]) / 120) * .8);
  }
  haze(K, 205, 262, 1.5);
  // wheat fields to the foot of the hills, in rows
  for (let y = HZ + 4; y < GROUND; y++) for (let x = 0; x < W; x++) {
    const band = Math.floor((y - HZ) / 9 + noise(x * .01 + y * .02) * 2) % 3;
    let c = band === 0 ? '#d8b860' : band === 1 ? '#c8a050' : '#b8a060';
    if ((x + y * 3) % 7 === 0) c = lerp(c, '#8a6a30', .4);
    m.put(x, y, c);
  }
  // a few farmhouses with tin roofs, and a small herd grazing
  [[70, 246], [148, 252], [560, 250]].forEach(([x, y]) => { m.rect(x, y, 16, 8, '#e8dcc4'); m.rect(x - 2, y - 3, 20, 3, '#a8b4c0'); m.rect(x + 6, y + 3, 4, 5, '#5a4a3a'); if (env.dark > .3) e.rect(x + 2, y + 2, 3, 3, '#ffd27c'); });
  [[196, 270], [212, 272], [236, 268]].forEach(([x, y], n) => { m.rect(x, y, 10, 5, n === 1 ? '#3a2a24' : '#e8dcc8'); m.rect(x + 2, y + 1, 3, 2, '#3a2a24'); m.rect(x + 9, y - 2, 3, 3, n === 1 ? '#3a2a24' : '#e8dcc8'); m.rect(x + 1, y + 5, 1, 3, '#3a2a24'); m.rect(x + 8, y + 5, 1, 3, '#3a2a24'); });
  // acacias: flat-topped, spread wide
  const acacia = (x, base, s) => {
    m.rect(x, base - 26 * s, 3 * s, 26 * s, '#4a3a30'); m.line(x + 1, base - 22 * s, x - 14 * s, base - 34 * s, '#4a3a30'); m.line(x + 2, base - 20 * s, x + 16 * s, base - 33 * s, '#4a3a30');
    for (let y = Math.floor(base - 44 * s); y < base - 30 * s; y++) for (let i = Math.floor(x - 30 * s); i < x + 32 * s; i++) {
      const v = (y - (base - 44 * s)) / (14 * s), half = 31 * s * (1 - Math.abs(v - .55) * .6);
      if (Math.abs(i - x) > half + (noise2(i * .3, y * .3) - .5) * 5 || fbm(i * .2, y * .25) < .32) continue;
      m.put(i, y, v < .35 ? '#6a8a3a' : dith(i, y) < .5 ? '#4a6a2e' : '#3a5a28');
    }
  };
  acacia(40, 280, 1.1); acacia(140, 262, .5); acacia(600, 268, .7); acacia(250, 258, .35);
  // Egerton University: the gate and, behind it, low halls with red roofs
  const HX = 310;
  for (let h = 0; h < 3; h++) {
    const x = HX - 20 + h * 90, y = 242 + (h % 2) * 6, w = 84;
    m.rect(x, y, w, GROUND - y - 24, '#ece2cc'); for (let k = 0; k < 8; k++) m.rect(x - 4 + k, y - 8 + k, w + 8 - 2 * k, 1, '#b84a36');
    for (let k = 0; k < 6; k++) glass(K, x + 6 + k * 13, y + 6, 7, 8, 500 + h * 6 + k, { tint: '#8aa4c0', frame: '#a89a84', people: false, share: .6 });
  }
  for (let n = 0; n < 4; n++) { const x = HX + 60 + n * 46, top = 214 + n % 2 * 8; for (let y = top; y < 266; y++) { const w = 4 * Math.min(1, (y - top) / 14); for (let i = Math.floor(x - w); i < x + w; i++) m.put(i, y, i < x ? '#3a6a4a' : '#2a5040'); } }
  const GX = 370, GW = 150;
  for (const px of [GX, GX + GW - 18]) { m.rect(px, GROUND - 66, 18, 66, '#b8a890'); for (let y = GROUND - 66; y < GROUND; y += 6) for (let x = px + (y % 12 ? 0 : 4); x < px + 18; x += 8) m.rect(x, y, 7, 5, '#c8b8a0'); m.rect(px - 2, GROUND - 70, 22, 4, '#8a7a64'); }
  m.rect(GX + 18, GROUND - 64, GW - 36, 16, '#2a4a2a'); m.rect(GX + 18, GROUND - 64, GW - 36, 1, '#5a8a4a');
  m.text('EGERTON', GX + GW / 2, GROUND - 63, '#f4e8c0', 11, 'center', 2);
  m.rect(GX + 18, GROUND - 48, GW - 36, 15, '#f4e8c0'); m.rect(GX + 18, GROUND - 34, GW - 36, 1, '#8a7a64');
  m.text('UNIVERSITY', GX + GW / 2, GROUND - 47, '#2a4a2a', 11, 'center', 1);
  for (let x = GX + 18; x < GX + 40; x += 4) m.rect(x, GROUND - 32, 1, 32, '#4a4a50'); for (let x = GX + GW - 40; x < GX + GW - 18; x += 4) m.rect(x, GROUND - 32, 1, 32, '#4a4a50');
  m.rect(GX + 18, GROUND - 32, 22, 2, '#4a4a50'); m.rect(GX + GW - 40, GROUND - 32, 22, 2, '#4a4a50');
  if (env.dark > .2) { e.glow(GX + 9, GROUND - 74, 24, '#ffd890', .6 * env.dark); e.glow(GX + GW - 9, GROUND - 74, 24, '#ffd890', .6 * env.dark); e.rect(GX + 6, GROUND - 76, 6, 3, '#fff2c8'); e.rect(GX + GW - 12, GROUND - 76, 6, 3, '#fff2c8'); }
  stageSign(K, 200, 'NJORO');
  // the verge path and the murram road: red earth, ruts, puddles when it rains
  for (let y = GROUND; y < 310; y++) for (let x = 0; x < W; x++) m.put(x, y, hash2(x, y) < .3 ? '#8aa04a' : lerp('#a8906a', '#8a7454', (y - GROUND) / 18));
  for (let y = 310; y < ROAD[1]; y++) for (let x = 0; x < W; x++) {
    let c = lerp('#b4643c', '#9a5434', (y - 310) / 36);
    if (Math.abs(y - 322) < 2 || Math.abs(y - 336) < 2) c = lerp(c, '#7a3e24', .5);
    if (hash2(x, y) < .08) c = lerp(c, '#d88a5a', .5);
    m.put(x, y, c);
  }
  if (env.overcast) {                                                                                          // puddles hold the sky
    for (let n = 0; n < 14; n++) { const px = hash(n * 3.3) * W, py = 314 + hash(n * 7.1) * 28, rw = 14 + hash(n) * 26, rh = 2 + hash(n * 2) * 3;
      for (let y = Math.floor(py - rh); y < py + rh; y++) for (let x = Math.floor(px - rw); x < px + rw; x++) if (((x - px) / rw) ** 2 + ((y - py) / rh) ** 2 < 1) { const s = get(Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.round(HZ - (y - 310) * 3))); e.put(x, y, lerp(s, [80, 60, 50], .35)); } }
  }
  // in front: tall grass, a fence of posts and wire, a sisal plant
  const f = F.m;
  for (let x = 0; x < W; x++) {
    const top = ROAD[1] + Math.round(noise(x * .06) * 5);
    for (let y = top; y < H; y++) f.put(x, y, y < top + 2 ? '#b8b060' : dith(x, y) < .4 ? '#7a7a3a' : '#5a6a2e');
    if (hash(x * 1.3) < .55) { const h = 8 + hash(x * 3.7) * 20; for (let k = 0; k < h; k++) f.put(x + Math.round(Math.sin(k * .15 + x) * 1.5), top - k, k > h - 4 ? '#d8c880' : '#8a8a40'); }
  }
  for (let x = 12; x < W; x += 64) { f.rect(x, 318, 4, 30, '#6a4a34'); f.rect(x + 1, 318, 1, 30, '#8a6a4a'); }
  [326, 336].forEach(y => { for (let x = 0; x < W; x++) if (dith(x, y) < .8) f.put(x, y + Math.round(Math.sin(x * .05) * 1), '#7a7a80'); });
  const sx = 560;
  for (let k = 0; k < 9; k++) { const a = -1.2 + k * .3; for (let s = 0; s < 26; s++) f.put(sx + Math.cos(a - Math.PI / 2) * s * 1.2, H - 4 + Math.sin(a - Math.PI / 2) * s, s > 22 ? '#a8b070' : '#5a8a6a'); }
}

// ---------- the streets, and what is on them ----------
// x: where a place's door (or its stop) is on the street; box: what to click; href: where its door goes.
export const STREETS = {
  stage: {
    id: 'stage', name: 'Town', title: 'The stage', where: 'Kenyatta Avenue, town', accent: '#ffe066', stopX: 432, walkers: 1,
    crowd: [{ look: 0, x: 500, feet: 296 }, { look: 1, x: 532, feet: 295, phone: true }, { look: 3, x: 570, feet: 296 }, { look: 5, x: 612, feet: 295, phone: true }],
    paint: paintStage,
    say: 'Karibu. I’m Cecil, a software developer in Nairobi. This is the stage in town: take a matatu to Projects, Experience or Education. The post office is here if you want to write.',
    places: [
      { id: 'post', title: 'Let’s connect', short: 'Post office', small: 'Say hello', x: 82, box: [6, 178, 150, 114], accent: '#ff6b8b', contact: true,
        say: 'The post office. Have a project or a role in mind? Let’s talk.' },
    ],
  },
  projects: {
    id: 'projects', name: 'Projects', title: 'Projects street', where: 'Upper Hill', accent: '#61bc00', stopX: 166, walkers: .8,
    crowd: [{ look: 2, x: 134, feet: 296, phone: true }],
    crane: { x: 476, y: 48, len: 74, travel: 26 },
    paint: paintProjects,
    say: 'Upper Hill. Musoni is finished and open; LexIMS is still going up next door.',
    places: [
      { id: 'musoni', title: 'Musoni', short: 'Musoni', small: 'Lending platform', x: 396, box: [304, 66, 184, 226], accent: '#61bc00', href: '/projects#musoni',
        say: 'Musoni: a lending platform I redesigned and built. Come in and I’ll walk you through it at the whiteboard.' },
      { id: 'lexims', title: 'LexIMS', short: 'LexIMS', small: 'Coming soon', x: 570, box: [506, 30, 134, 262], accent: '#ffcc4a',
        say: 'LexIMS, an integrated management system for compliance and audits. It’s still going up, so the doors aren’t open yet.' },
    ],
  },
  experience: {
    id: 'experience', name: 'Experience', title: 'Experience street', where: 'Ngong Road, Kilimani', accent: '#5fe1ff', stopX: 230, walkers: .8,
    crowd: [{ look: 1, x: 552, feet: 294 }, { look: 6, x: 336, feet: 295, phone: true }],
    paint: paintExperience,
    say: 'Ngong Road. My first desk was at Podii, in the old house; I’m at GikTek now, across the way.',
    places: [
      { id: 'podii', title: 'Podii', short: 'Podii', small: 'Internship · 2024', x: 142, box: [32, 174, 188, 118], accent: '#c79bff', href: '/experience#podii',
        say: 'Podii, where I learned how a real team designs, tests and ships software. Six months as a technical intern in 2024.' },
      { id: 'giktek', title: 'GikTek', short: 'GikTek', small: 'Developer · now', x: 460, box: [372, 92, 176, 200], accent: '#5fe1ff', href: '/experience#giktek',
        say: 'GikTek, where I work now: web and mobile systems, the services behind them, and keeping them running.' },
    ],
  },
  education: {
    id: 'education', name: 'Education', title: 'Education street', where: 'Njoro, the Rift Valley', accent: '#7dff9a', stopX: 200, walkers: .5,
    crowd: [{ look: 4, x: 342, feet: 296, phone: true }, { look: 7, x: 166, feet: 296 }],
    paint: paintEducation,
    say: 'Njoro, out in the Rift Valley. This is where I studied, at Egerton University.',
    places: [
      { id: 'egerton', title: 'Egerton University', short: 'Egerton', small: 'BSc Computer Science', x: 445, box: [360, 220, 170, 72], accent: '#7dff9a', href: '/education',
        say: 'Egerton University: four years of Computer Science, graduating on 27 November 2026.' },
    ],
  },
};
export const ORDER = ['stage', 'projects', 'experience', 'education'];
