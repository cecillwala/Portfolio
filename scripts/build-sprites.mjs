// Draws pixel Cecil and his props in code and writes PNG sprite sheets to public/sprites/.
// No dependencies: a tiny PNG encoder on top of node:zlib. Run with `npm run sprites`.
// To change how he looks, edit the palette or the front()/side() functions and re-run.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sprites');
mkdirSync(out, { recursive: true });

// ---------- PNG ----------
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, sum]);
};
function png(w, h, rgba) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head[8] = 8; // bit depth
  head[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', head),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- canvas ----------
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = Buffer.alloc(w * h * 4);
  }
  set(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    if (!c) return this.px.fill(0, i, i + 4);
    const [r, g, b] = hex(c);
    this.px[i] = r;
    this.px[i + 1] = g;
    this.px[i + 2] = b;
    this.px[i + 3] = 255;
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  blit(src, dx) {
    for (let y = 0; y < src.h; y++) src.px.copy(this.px, (y * this.w + dx) * 4, y * src.w * 4, (y + 1) * src.w * 4);
  }
}

// ---------- pixel Cecil ----------
export const FRAME_W = 24;
export const FRAME_H = 32;
const P = {
  skin: '#6f4428',
  skinDark: '#573319',
  hair: '#17110e',
  eye: '#120c08',
  white: '#fbfaf5',
  mouth: '#3a1a12',
  tee: '#5d6d80',
  teeDark: '#47556a',
  camo: '#394557',
  shorts: '#717c45',
  shortsDark: '#586236',
  sock: '#f1f1ea',
  shoe: '#17181c',
};

/** Facing the visitor. o = body bob (0 or 1), jump lifts the whole figure. */
function front({ o = 0, mouth = 'smile', blink = false, right = 'down', left = 'down', jump = 0 } = {}) {
  const g = new Grid(FRAME_W, FRAME_H);
  const J = -jump;
  // legs, socks, shoes
  for (const x of [8, 13]) {
    g.rect(x, 25 + J, 3, 4, P.skin);
    g.rect(x, 29 + J, 3, 1, P.sock);
  }
  g.rect(7, 30 + J, 4, 2, P.shoe);
  g.rect(13, 30 + J, 4, 2, P.shoe);
  const y = o + J;
  // torso and sleeves
  g.rect(7, 13 + y, 10, 8, P.tee);
  g.rect(7, 19 + y, 10, 2, P.teeDark);
  for (const [cx, cy] of [[9, 15], [13, 14], [14, 17], [8, 17], [11, 18]]) g.rect(cx, cy + y, 2, 1, P.camo);
  // shorts over the hem
  g.rect(7, 21 + J, 10, 3, P.shorts);
  g.rect(7, 24 + J, 4, 1, P.shortsDark);
  g.rect(13, 24 + J, 4, 1, P.shortsDark);
  // arms
  const arm = (side, pose) => {
    const x = side === 'L' ? 5 : 17;
    g.rect(x, 13 + y, 2, 3, P.teeDark);
    if (pose === 'down') return g.rect(x, 16 + y, 2, 5, P.skin);
    const ox = side === 'L' ? x - 1 : x + 1;
    g.rect(ox, 8 + y, 2, 5, P.skin); // raised forearm
    g.rect(ox, 6 + y, 2, 2, P.skin); // hand
    if (pose === 'peace') {
      g.set(ox - (side === 'L' ? 1 : 0), 4 + y, P.skin);
      g.set(ox - (side === 'L' ? 1 : 0), 5 + y, P.skin);
      g.set(ox + (side === 'L' ? 1 : 2), 4 + y, P.skin);
      g.set(ox + (side === 'L' ? 1 : 2), 5 + y, P.skin);
    }
  };
  arm('L', left);
  arm('R', right);
  // neck and head
  g.rect(11, 12 + y, 2, 1, P.skinDark);
  g.rect(8, 5 + y, 8, 7, P.skin);
  g.set(8, 11 + y, null);
  g.set(15, 11 + y, null);
  g.rect(7, 7 + y, 1, 2, P.skinDark);
  g.rect(16, 7 + y, 1, 2, P.skinDark);
  // short cropped hair with a sharp hairline
  g.rect(9, 1 + y, 6, 1, P.hair);
  g.rect(8, 2 + y, 8, 3, P.hair);
  g.set(8, 5 + y, P.hair);
  g.set(15, 5 + y, P.hair);
  // face
  g.rect(9, 6 + y, 2, 1, P.hair);
  g.rect(13, 6 + y, 2, 1, P.hair);
  if (blink) {
    g.set(10, 8 + y, P.eye);
    g.set(13, 8 + y, P.eye);
  } else {
    g.rect(10, 7 + y, 1, 2, P.eye);
    g.rect(13, 7 + y, 1, 2, P.eye);
  }
  g.rect(11, 9 + y, 2, 1, P.skinDark);
  if (mouth === 'smile') g.rect(10, 10 + y, 4, 1, P.white);
  if (mouth === 'closed') g.rect(10, 10 + y, 4, 1, P.mouth);
  if (mouth === 'open') {
    g.rect(10, 10 + y, 4, 1, P.white);
    g.rect(10, 11 + y, 4, 1, P.mouth);
  }
  return g;
}

/** Walking, facing right. step is the front leg's reach in pixels; lift raises the body. */
function side({ step = 0, lift = 0 } = {}) {
  const g = new Grid(FRAME_W, FRAME_H);
  const y = -lift;
  const leg = (dx, shade) => {
    g.rect(10 + dx, 24, 3, 5, shade ? P.skinDark : P.skin);
    g.rect(10 + dx, 29, 3, 1, P.sock);
    g.rect(10 + dx, 30, 4, 2, P.shoe);
  };
  leg(-step, true);
  // far arm swings with the near leg
  g.rect(11 + step, 16 + y, 2, 4, P.skinDark);
  leg(step, false);
  // torso, shorts
  g.rect(9, 13 + y, 6, 8, P.tee);
  g.rect(9, 19 + y, 6, 2, P.teeDark);
  g.rect(10, 15 + y, 2, 1, P.camo);
  g.rect(12, 17 + y, 2, 1, P.camo);
  g.rect(9, 21 + y, 6, 4, P.shorts);
  g.rect(9, 24 + y, 6, 1, P.shortsDark);
  // near arm swings against the near leg
  g.rect(11, 13 + y, 3, 3, P.teeDark);
  g.rect(11 - step, 16 + y, 2, 4, P.skin);
  // neck, head in profile
  g.rect(11, 12 + y, 3, 1, P.skinDark);
  g.rect(9, 5 + y, 7, 7, P.skin);
  g.set(9, 11 + y, null);
  g.rect(16, 8 + y, 1, 2, P.skin); // nose
  g.rect(10, 1 + y, 5, 1, P.hair);
  g.rect(9, 2 + y, 7, 3, P.hair);
  g.rect(9, 5 + y, 2, 2, P.hair); // fade at the back
  g.rect(11, 7 + y, 1, 2, P.skinDark); // ear
  g.rect(13, 6 + y, 2, 1, P.hair);
  g.rect(14, 7 + y, 1, 2, P.eye);
  g.rect(14, 10 + y, 2, 1, P.white);
  return g;
}

// Frame order is the contract with src/scripts/mascot.ts. Do not reorder without updating it.
const frames = [
  front({ o: 0 }), // 0 idle
  front({ o: 1 }), // 1 idle, breathing out
  front({ o: 0, mouth: 'open' }), // 2 talk
  front({ o: 0, mouth: 'smile' }), // 3 talk
  side({ step: 3 }), // 4 walk: contact
  side({ step: 0, lift: 1 }), // 5 walk: passing
  side({ step: -3 }), // 6 walk: contact
  side({ step: 0, lift: 1 }), // 7 walk: passing
  front({ right: 'peace' }), // 8 wave
  front({ right: 'peace', o: 1 }), // 9 wave
  front({ right: 'up', left: 'up', mouth: 'open' }), // 10 celebrate
  front({ right: 'up', left: 'up', mouth: 'open', jump: 2 }), // 11 celebrate, in the air
  front({ o: 0, blink: true }), // 12 blink
];
const sheet = new Grid(FRAME_W * frames.length, FRAME_H);
frames.forEach((f, i) => sheet.blit(f, i * FRAME_W));
writeFileSync(join(out, 'cecil.png'), png(sheet.w, sheet.h, sheet.px));

// ---------- props: one per chapter, 10x10 each ----------
const K = {
  '.': null, k: '#17181c', w: '#fbfaf5', r: '#d2493a', R: '#9c2f25', y: '#f2b632', Y: '#b9831a',
  g: '#3f9b6b', G: '#2a6c49', b: '#3f78c9', B: '#274f8c', v: '#8a63d2', n: '#8a5a33', s: '#9aa3ad', S: '#636c77',
};
const props = {
  none: ['..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........'],
  backpack: ['...kkkk...', '..k....k..', '.kgggggggk', '.kgGGGGGgk', '.kgggggggk', '.kgkkkkkgk', '.kgkyyykgk', '.kgkkkkkgk', '.kgggggggk', '..kkkkkkk.'],
  notebook: ['.kkkkkkkk.', '.kvvvvvvk.', 'kkvwwwwvk.', '.kvvvvvvk.', 'kkvwwwwvk.', '.kvvvvvvk.', 'kkvwwvvvk.', '.kvvvvvvk.', '.kvvvvvvk.', '.kkkkkkkk.'],
  container: ['..........', 'kkkkkkkkkk', 'kbBbBbBbBk', 'kbBbBbBbBk', 'kbBbBbBbBk', 'kbBbBbBbBk', 'kbBbBbBbBk', 'kbBbBbBbBk', 'kkkkkkkkkk', '..........'],
  phone: ['..kkkkkk..', '..kwwwwk..', '..kyyyyk..', '..kwwwwk..', '..kwgggk..', '..kwwwwk..', '..kwwwwk..', '..kwwwwk..', '..kkssk...', '..kkkkkk..'],
  lamp: ['...kkkk...', '..kyyyyk..', '.kywwwyyk.', '.kywwyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kYYk...', '...kssk...', '...kSSk...', '...kkkk...'],
  card: ['..........', '..........', 'kkkkkkkkkk', 'kwwwwwwwwk', 'kwkkwwwwwk', 'kwkkwsssWk'.replace('W', 'w'), 'kwwwwwwwwk', 'kwssssswwk', 'kkkkkkkkkk', '..........'],
};
const names = Object.keys(props);
const pg = new Grid(10 * names.length, 10);
names.forEach((n, i) => props[n].forEach((row, y) => [...row].forEach((ch, x) => pg.set(i * 10 + x, y, K[ch]))));
writeFileSync(join(out, 'props.png'), png(pg.w, pg.h, pg.px));

// A scaled preview for checking the art by eye: `node scripts/build-sprites.mjs --preview out.png`
const pv = process.argv.indexOf('--preview');
if (pv > 0) {
  const s = 8;
  const big = new Grid(sheet.w * s, (sheet.h + 12) * s);
  big.rect(0, 0, big.w, big.h, '#cfd8e3');
  const copy = (src, oy) => {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (!src.px[i + 3]) continue;
        const c = '#' + [0, 1, 2].map((k) => src.px[i + k].toString(16).padStart(2, '0')).join('');
        big.rect(x * s, (y + oy) * s, s, s, c);
      }
  };
  copy(sheet, 0);
  copy(pg, sheet.h + 1);
  writeFileSync(process.argv[pv + 1], png(big.w, big.h, big.px));
}
console.log(`sprites: ${frames.length} frames of ${FRAME_W}x${FRAME_H}, ${names.length} props`);

// Favicon: Cecil's face, 16x16, cut from the first frame.
const fav = new Grid(16, 16);
for (let y = 0; y < 16; y++) frames[0].px.copy(fav.px, y * 16 * 4, (y * FRAME_W + 4) * 4, (y * FRAME_W + 20) * 4);
writeFileSync(join(out, '..', 'favicon.png'), png(16, 16, fav.px));
