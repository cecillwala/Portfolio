// The people of the town, as detailed as Cecil because they are built on his frames. Each person is
// Cecil's sprite (cecil-town.png) recoloured, with their own skin, hair and clothes, then given what
// makes them someone else: a hairstyle, a beard or none, brows, lashes, lips, earrings, glasses, a
// neutral mouth or a smile, a shirt, a jacket, a dress or a kitenge print, a bag. Same face quality,
// same walk, same outline, many people. The runner lights them by the hour, as it does Cecil.
//
// Cecil's palette (letters as in HANDOFF's pixel map of frame 0): skin D light, E base, F shadow, I mouth,
// J chin; hair A, B; eyes G white, H glint; outline C; hoodie K hood, L body, M lit side, N shade side,
// O lit arm, P shade arm, Q drawstrings, R and S pocket, T cuffs, a and b the walking arm; jeans U, V;
// soles W.
const P = {
  D: '#b67b53', E: '#995f40', F: '#73442f', I: '#603d30', J: '#8a5138',
  A: '#242432', B: '#3b3b49', C: '#171a29', G: '#e5d8c5', H: '#ffffff',
  K: '#607183', L: '#99a9b6', M: '#bcc7cf', N: '#697d91', O: '#a8b8c5', P: '#7e91a3', Q: '#e8e5da', R: '#71879a', S: '#9caebb', T: '#8497a8', a: '#b4c0ca', b: '#8fa0b0',
  U: '#486ab4', V: '#355089', W: '#cbd5dd',
};
const KEY = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]));
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mul = (h, k) => toHex(hex(h).map(v => v * k));
const lighten = (h, k) => toHex(hex(h).map(v => v + (255 - v) * k));
/** A skin ramp in Cecil's proportions, from its base tone. */
const ramp = base => { const e = hex(P.E), b = hex(base), r = t => toHex(hex(P[t]).map((v, i) => v * b[i] / e[i])); return { D: r('D'), E: base, F: r('F'), I: r('I'), J: r('J') }; };
const SKINS = ['#995f40', '#7a4a30', '#5e3826', '#b07450', '#6a3e2a'].map(ramp);
const HAIRS = ['#242432', '#2c2220', '#1c1c24'];

// Each look: skin and hair, a hairstyle, face parts, clothes. Women and men, younger and older.
export const LOOKS = [
  { skin: 1, hair: 0, style: 'afro', beard: 'stubble', mouth: 'smile', top: '#c8302a', kind: 'tee', bottom: '#2e3448', shoes: '#f0ece0' },
  { skin: 2, hair: 1, style: 'wrap', wrap: '#e8a030', lashes: true, lips: '#7a2e2a', earrings: true, mouth: 'smile', top: '#2a8a6a', kind: 'kitenge', print: '#f4d03a', dress: true, shoes: '#3a2a24' },
  { skin: 0, hair: 2, style: 'crop', beard: 'full', glasses: true, mouth: 'neutral', top: '#f4f1e6', kind: 'shirt', bottom: '#3a3f58', shoes: '#2a2224', bag: '#7a4a2a' },
  { skin: 4, hair: 0, style: 'cap', cap: '#2a5ab8', mouth: 'smile', top: '#e8c040', kind: 'tee', bottom: '#1e2a4a', shoes: '#e8e4dc' },
  { skin: 3, hair: 1, style: 'bun', lashes: true, lips: '#8a3a34', earrings: true, mouth: 'neutral', top: '#7a3a8a', kind: 'jacket', inner: '#f4f1e6', bottom: '#2a2a34', shoes: '#141418', bag: '#c8302a' },
  { skin: 1, hair: 0, style: 'braids', lashes: true, lips: '#6a2a2a', mouth: 'smile', top: '#3a7ac8', kind: 'dress', dress: true, shoes: '#e8e0d0' },
  { skin: 2, hair: 2, style: 'crop', beard: 'moustache', mouth: 'neutral', top: '#2a2a34', kind: 'jacket', inner: '#c8302a', bottom: '#4a4a5a', shoes: '#141418' },
  { skin: 0, hair: 1, style: 'wrap', wrap: '#c8302a', lashes: true, lips: '#7a2e2a', glasses: true, mouth: 'neutral', top: '#f4f1e6', kind: 'kitenge', print: '#c8302a', bottom: '#2e3448', shoes: '#3a2a24' },
  { skin: 4, hair: 2, style: 'bald', beard: 'full', mouth: 'smile', top: '#e87a30', kind: 'shirt', bottom: '#5a4a38', shoes: '#2a2224' },
  { skin: 3, hair: 0, style: 'afro', lashes: true, lips: '#8a3a34', earrings: true, mouth: 'smile', top: '#2a8a6a', kind: 'jacket', inner: '#e8c040', bottom: '#1e2a4a', shoes: '#e8e4dc', bag: '#2a2a34' },
];
export const BOTTOM = n => LOOKS[n % LOOKS.length].bottom || LOOKS[n % LOOKS.length].top;
export const SHOES = n => LOOKS[n % LOOKS.length].shoes;

/**
 * Frames of Cecil's sheet, as rows of palette letters (null where empty). Each pixel takes the nearest
 * colour in his palette, not an exact match: browsers that guard against canvas fingerprinting (Brave,
 * Firefox's resist-fingerprinting, some extensions) nudge the values a page reads back, and on
 * 17 Nov 2026 exact matching left holes all over the townspeople on Cecil's own screen.
 */
const SWATCHES = Object.entries(P).map(([k, v]) => [k, hex(v)]);
const nearest = (r, g, b) => { let best = 'C', bd = Infinity; for (const [k, [pr, pg, pb]] of SWATCHES) { const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2; if (d < bd) { bd = d; best = k; } } return best; };
function letters(sheet, frame) {
  const c = document.createElement('canvas'); c.width = 48; c.height = 64;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(sheet, frame * 48, 0, 48, 64, 0, 0, 48, 64);
  const d = x.getImageData(0, 0, 48, 64).data, g = [];
  for (let y = 0; y < 64; y++) { const row = []; for (let i = 0; i < 48; i++) { const k = (y * 48 + i) * 4; row.push(d[k + 3] < 128 ? null : KEY[toHex([d[k], d[k + 1], d[k + 2]])] || nearest(d[k], d[k + 1], d[k + 2])); } g.push(row); }
  return g;
}

/** One person, one frame: Cecil's frame recoloured and changed. `view` is 'front' or 'side'; `top` is where the head starts (the walk bobs). */
function build(base, p, view, { phone = false, glow = false } = {}) {
  const g = base.map(r => r.slice());
  const skin = SKINS[p.skin], hair = HAIRS[p.hair], hairL = lighten(hair, .14);
  const top = view === 'front' ? 7 : g.findIndex(r => r.includes('A'));          // first row of hair
  const at = (x, y) => g[y]?.[x], set = (x, y, v) => { if (x >= 0 && y >= 0 && x < 48 && y < 64) g[y][x] = v; };
  const isHead = (x, y) => y < top + 25;
  // ----- the face -----
  const beard = p.beard || 'none';
  if (view === 'front') {
    if (beard === 'none' || beard === 'moustache') for (let y = 27; y < 31; y++) for (let x = 12; x < 37; x++) { if (at(x, y) === 'J') set(x, y, 'E'); if (at(x, y) === 'F' && y > 27 && x > 14 && x < 34) set(x, y, y === 30 ? 'F' : 'E'); }
    if (beard === 'moustache') for (let x = 19; x < 31; x++) set(x, 24, '#hair');
    if (beard === 'full') { for (let y = 24; y < 31; y++) for (let x = 12; x < 37; x++) if ((at(x, y) === 'F' || at(x, y) === 'J' || (at(x, y) === 'E' && y > 26)) && !(y === 25 || y === 26)) set(x, y, (x + y) % 4 ? '#hair' : '#hairL'); }
    if (beard === 'stubble') for (let y = 27; y < 31; y++) for (let x = 13; x < 36; x++) if ((at(x, y) === 'E' || at(x, y) === 'J' || at(x, y) === 'F') && (x + y) % 2) set(x, y, 'F');
    if (p.mouth === 'neutral') { set(21, 25, 'E'); set(30, 25, 'E'); for (let x = 21; x < 31; x++) if (at(x, 26) === 'I') set(x, 26, x < 23 || x > 28 ? 'E' : 'I'); }
    if (p.lips) { for (let x = 22; x < 30; x++) { if (at(x, 26) === 'I' || p.mouth !== 'neutral') set(x, 26, p.lips); set(x, 27, lighten(p.lips, .2)); } set(21, 25, p.mouth === 'neutral' ? 'E' : p.lips); set(30, 25, p.mouth === 'neutral' ? 'E' : p.lips); }
    if (p.lashes) { for (let x = 15; x < 22; x++) set(x, 14, 'E'); for (let x = 27; x < 34; x++) set(x, 14, 'E'); for (let x = 16; x < 21; x++) set(x, 14, 'C'); for (let x = 28; x < 33; x++) set(x, 14, 'C'); for (let x = 15; x < 22; x++) set(x, 15, x === 15 || x === 21 ? 'E' : 'C'); for (let x = 27; x < 34; x++) set(x, 15, x === 27 || x === 33 ? 'E' : 'C');
      [[15, 15], [14, 16], [33, 15], [34, 16]].forEach(([x, y]) => set(x, y, 'C')); for (let x = 16; x < 21; x++) set(x, 15, 'E'); for (let x = 28; x < 33; x++) set(x, 15, 'E'); }
    if (p.earrings) { set(10, 24, '#gold'); set(10, 25, '#gold'); set(38, 24, '#gold'); set(38, 25, '#gold'); }
    if (p.glasses) { for (let x = 14; x < 23; x++) { set(x, 16, 'C'); set(x, 21, 'C'); } for (let x = 26; x < 35; x++) { set(x, 16, 'C'); set(x, 21, 'C'); } for (let y = 16; y < 22; y++) { set(14, y, 'C'); set(22, y, 'C'); set(26, y, 'C'); set(34, y, 'C'); } for (let x = 23; x < 26; x++) set(x, 18, 'C'); }
    if (phone) { for (let x = 15; x < 34; x++) { if ('GHC'.includes(at(x, 17)) && !(p.glasses && (x === 14 || x === 22 || x === 26 || x === 34))) set(x, 17, 'D'); if (at(x, 18) === 'C' || at(x, 18) === 'H') set(x, 18, 'G'); } set(18, 19, 'C'); set(30, 19, 'C'); }
  } else {
    if (beard === 'none' || beard === 'moustache') for (let y = top + 20; y < top + 24; y++) for (let x = 18; x < 40; x++) if (at(x, y) === 'F' && y > top + 21) set(x, y, y === top + 23 ? 'F' : 'E');
    if (beard === 'full') for (let y = top + 18; y < top + 24; y++) for (let x = 20; x < 40; x++) if ('EFJ'.includes(at(x, y)) && !(y === top + 18 && x > 30)) set(x, y, (x + y) % 4 ? '#hair' : '#hairL');
    if (beard === 'moustache') for (let x = 31; x < 37; x++) set(x, top + 17, '#hair');
    if (p.lips) for (let x = 31; x < 38; x++) if (at(x, top + 18) === 'I') { set(x, top + 18, p.lips); set(x, top + 19, lighten(p.lips, .2)); }
    if (p.lashes) { for (let x = 29; x < 37; x++) if (at(x, top + 7) === 'C') set(x, top + 7, 'E'); set(36, top + 9, 'C'); set(37, top + 9, 'C'); }
    if (p.earrings) { set(21, top + 16, '#gold'); set(21, top + 17, '#gold'); }
    if (p.glasses) { for (let x = 29; x < 37; x++) { set(x, top + 9, 'C'); set(x, top + 14, 'C'); } for (let y = top + 9; y < top + 15; y++) { set(29, y, 'C'); set(36, y, 'C'); } for (let x = 22; x < 29; x++) set(x, top + 11, 'C'); }
  }
  // ----- hair -----
  const fill = (fn, v, under = c => !c || c === 'A' || c === 'B' || (c === 'C')) => { for (let y = 0; y < 64; y++) for (let x = 0; x < 48; x++) if (fn(x, y) && under(at(x, y), x, y)) set(x, y, typeof v === 'function' ? v(x, y) : v); };
  const tex = (x, y) => ((x * 7 + y * 3) % 9 === 0 ? '#hairL' : '#hair');
  const front = view === 'front';
  const headTopC = c => !c || c === 'A' || c === 'B';
  switch (p.style) {
    case 'afro': fill((x, y) => front ? ((x - 24) / 18) ** 2 + ((y - 9) / 10) ** 2 < 1 && y < 16 : ((x - 24) / 15) ** 2 + ((y - top - 2) / 10) ** 2 < 1 && y < top + 12 && x < 36, tex, (c, x, y) => headTopC(c) || (c === 'C' && y < top + 6)); break;
    case 'bun': fill((x, y) => front ? ((x - 24) / 6) ** 2 + ((y - 3) / 4) ** 2 < 1 : ((x - 15) / 4.5) ** 2 + ((y - top - 1) / 4) ** 2 < 1, '#hair', headTopC); break;
    case 'wrap': fill((x, y) => front ? ((x - 24) / 16) ** 2 + ((y - 9) / 8) ** 2 < 1 && y < 14 : ((x - 26) / 14) ** 2 + ((y - top - 3) / 8) ** 2 < 1 && y < top + 7, (x, y) => ((x + y) % 5 === 0 ? lighten(p.wrap, .45) : (x * 3 + y) % 11 === 0 ? mul(p.wrap, .7) : p.wrap), c => !c || c === 'A' || c === 'B' || c === 'C' || c === 'E' || c === 'D' || c === 'F');
      fill((x, y) => front ? x >= 26 && x < 33 && y >= 0 && y < 4 : x >= 14 && x < 19 && y >= top - 4 && y < top, p.wrap, headTopC); break;
    case 'cap': fill((x, y) => front ? y >= 4 && y < 12 && Math.abs(x - 24) < 14 - (y < 6 ? 2 : 0) : y >= top - 2 && y < top + 6 && x > 15 && x < 38, p.cap, c => true);
      fill((x, y) => front ? y >= 11 && y < 13 && x > 8 && x < 40 : y >= top + 5 && y < top + 7 && x > 30 && x < 44, mul(p.cap, .7), c => true);
      fill((x, y) => front ? y >= 6 && y < 8 && x > 21 && x < 27 : false, lighten(p.cap, .5), c => true); break;
    case 'braids': fill((x, y) => front ? (x >= 8 && x < 12 || x >= 36 && x < 40) && y >= 12 && y < 36 : x >= 12 && x < 18 && y >= top + 4 && y < top + 30, (x, y) => (y % 3 ? '#hair' : '#hairL'), c => c !== 'C' || true); break;
    case 'bald': for (let y = 0; y < 64; y++) for (let x = 0; x < 48; x++) if (at(x, y) === 'A' || at(x, y) === 'B') set(x, y, (front ? x < 20 && y < 11 : x > 26 && y < top + 4) ? 'D' : y < top + 2 && (x + y) % 7 === 0 ? 'D' : 'E'); break;
  }
  // ----- clothes -----
  const t = p.top, tL = lighten(t, .25), tS = mul(t, .78), tD = mul(t, .64), tQ = lighten(t, .5);
  const map = { K: tS, L: t, M: tL, N: tS, O: tL, P: tS, Q: p.kind === 'hoodie' ? tQ : t, R: p.kind === 'hoodie' ? tS : t, S: p.kind === 'hoodie' ? t : t, T: tD, a: tL, b: tD };
  for (let y = top + 24; y < 64; y++) for (let x = 0; x < 48; x++) { const c = at(x, y); if (map[c]) set(x, y, map[c]); }
  if (front) {
    if (p.kind === 'tee') for (let x = 21; x < 28; x++) set(x, 32, x === 21 || x === 27 ? tS : 'E');
    if (p.kind === 'shirt') { for (let x = 18; x < 31; x++) set(x, 32, x < 24 ? lighten(t, .6) : lighten(t, .5)); set(24, 33, tD); for (let y = 35; y < 48; y += 3) set(24, y, tD); }
    if (p.kind === 'jacket') for (let y = 32; y < 49; y++) for (let x = 20; x < 29; x++) if (at(x, y) && at(x, y) !== 'C') set(x, y, x === 20 || x === 28 ? tD : p.inner);
    if (p.kind === 'kitenge') for (let y = 33; y < (p.dress ? 58 : 49); y++) for (let x = 11; x < 38; x++) if (at(x, y) && at(x, y) !== 'C' && !'DEF'.includes(at(x, y)) && (x * 3 + y * 5) % 7 === 0) set(x, y, p.print);
  } else {
    if (p.kind === 'jacket') for (let y = top + 26; y < top + 42; y++) for (let x = 30; x < 34; x++) if (at(x, y) && at(x, y) !== 'C') set(x, y, p.inner);
    if (p.kind === 'kitenge') for (let y = top + 26; y < 58; y++) for (let x = 14; x < 36; x++) if (at(x, y) && at(x, y) !== 'C' && !'DEF'.includes(at(x, y)) && (x * 3 + y * 5) % 7 === 0) set(x, y, p.print);
  }
  // a dress: the legs become a skirt down to the calf
  if (p.dress) {
    const legTop = g.findIndex((r, y) => y > top + 30 && r.some(c => c === 'U' || c === 'V'));
    const xs = []; for (let y = legTop; y < 64; y++) for (let x = 0; x < 48; x++) if (at(x, y) === 'U' || at(x, y) === 'V') xs.push(x);
    const x0 = Math.min(...xs) - 2, x1 = Math.max(...xs) + 2;
    for (let y = legTop - 1; y < legTop + 6; y++) for (let x = x0 - (y - legTop) / 2; x <= x1 + (y - legTop) / 2; x++) set(Math.round(x), y, y === legTop + 5 ? 'C' : Math.round(x) > (x0 + x1) / 2 + 3 ? tS : t);
    for (let y = legTop + 6; y < 64; y++) for (let x = 0; x < 48; x++) { if (at(x, y) === 'U') set(x, y, 'E'); if (at(x, y) === 'V') set(x, y, 'F'); }
  }
  const legs = { U: p.bottom || t, V: mul(p.bottom || t, .75), W: lighten(p.shoes, .35) };
  for (let y = top + 40; y < 64; y++) for (let x = 0; x < 48; x++) { const c = at(x, y); if (legs[c]) set(x, y, legs[c]); }
  // shoes: the dark soles' tops in their colour
  for (let y = 59; y < 61; y++) for (let x = 1; x < 47; x++) if (at(x, y) === 'C' && at(x - 1, y) && at(x + 1, y) && at(x, y - 1)) set(x, y, (x + y) % 9 ? p.shoes : lighten(p.shoes, .25));
  // a bag on a strap
  if (p.bag) { if (front) { for (let k = 0; k < 15; k++) set(14 + k, 33 + k, mul(p.bag, .8)); for (let y = 43; y < 50; y++) for (let x = 28; x < 37; x++) set(x, y, y === 43 ? lighten(p.bag, .3) : x === 36 || y === 49 ? 'C' : p.bag); } else { for (let y = top + 30; y < top + 40; y++) for (let x = 13; x < 19; x++) set(x, y, x === 13 || y === top + 39 ? 'C' : p.bag); } }
  // the phone, held up at the chest; its screen lights at night
  if (phone && front) {
    // forearms raised from the elbows to the middle, in the sleeve's colours
    for (let k = 0; k < 7; k++) { set(13 + k, 41 - (k > 3 ? 1 : 0), 'C'); set(13 + k, 42 - (k > 3 ? 1 : 0), tL); set(13 + k, 43 - (k > 3 ? 1 : 0), tL); set(13 + k, 44 - (k > 3 ? 1 : 0), 'C'); }
    for (let k = 0; k < 7; k++) { set(35 - k, 41 - (k > 3 ? 1 : 0), 'C'); set(35 - k, 42 - (k > 3 ? 1 : 0), tS); set(35 - k, 43 - (k > 3 ? 1 : 0), tS); set(35 - k, 44 - (k > 3 ? 1 : 0), 'C'); }
    // the phone, small, and the two hands round it
    for (let y = 35; y < 45; y++) for (let x = 21; x < 28; x++) set(x, y, x === 21 || x === 27 || y === 35 || y === 44 ? 'C' : '#phone');
    for (let y = 36; y < 42; y++) for (let x = 22; x < 27; x++) set(x, y, glow ? (y === 36 ? '#screenHi' : '#screen') : '#screenOff');
    [[18, 39], [26, 39]].forEach(([hx, hy]) => { for (let y = hy; y < hy + 5; y++) for (let x = hx; x < hx + 4; x++) set(x, y, x === hx || x === hx + 3 || y === hy || y === hy + 4 ? 'C' : y === hy + 1 ? 'D' : 'E'); });
  }
  // ----- to pixels, with an outline round anything new -----
  const colour = v => (v === '#hair' ? hair : v === '#hairL' ? hairL : v === '#gold' ? '#e8c040' : v === '#phone' ? '#1e2230' : v === '#screen' ? '#a8e0ff' : v === '#screenHi' ? '#e8f8ff' : v === '#screenOff' ? '#3a4a68'
    : 'DEFIJ'.includes(v) && v.length === 1 ? skin[v] : v === 'A' ? hair : v === 'B' ? hairL : v.length === 1 ? (P[v] || '#ff00ff') : v);
  const out = g.map(r => r.slice());
  for (let y = 0; y < 64; y++) for (let x = 0; x < 48; x++) if (!g[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const n = g[y + dy]?.[x + dx]; return n && n !== 'C'; })) out[y][x] = 'C';
  const c = document.createElement('canvas'); c.width = 48; c.height = 64;
  const cx = c.getContext('2d'), img = cx.createImageData(48, 64);
  out.forEach((row, y) => row.forEach((v, x) => { if (!v || v === '?') return; const [r, gg, b] = hex(colour(v)), i = (y * 48 + x) * 4; img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255; }));
  cx.putImageData(img, 0, 0);
  return c;
}

/** Give it Cecil's sheet once it has loaded; returns person(n): every frame for look n. */
export function peopleFrom(sheet) {
  const base = { idle: letters(sheet, 0), blink: letters(sheet, 1), walk: [3, 4, 5, 6].map(f => letters(sheet, f)) };
  const cache = new Map();
  return n => {
    n %= LOOKS.length;
    if (!cache.has(n)) {
      const p = LOOKS[n];
      cache.set(n, {
        idle: build(base.idle, p, 'front'), blink: build(base.blink, p, 'front'),
        phone: build(base.idle, p, 'front', { phone: true }), phoneLit: build(base.idle, p, 'front', { phone: true, glow: true }),
        walk: base.walk.map(w => build(w, p, 'side')),
      });
    }
    return cache.get(n);
  };
}
