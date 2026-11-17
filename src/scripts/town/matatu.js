// The matatu: a 14-seater with its side painted, LED-lit inside, a route board on the roof. It is
// bigger than Cecil (about one and a half times his height) and is graded to the time of day like
// the streets. Painted once per time of day, weather and route, then simply moved.
import { canvasFor, toCanvas, lerp, dith } from './kit.js';

export const MW = 232, MH = 108;      // the picture; the wheels touch the road at its bottom edge
export const DOOR = 96;               // where, along it, Cecil gets on and off

export function paintMatatu(env, route) {
  const K = canvasFor(env, MW, MH), { m, e } = K, night = env.dark > .3;
  const top = 16, bottom = 94, nose = 224;
  // body: a box with a sloped windscreen and a rounded nose
  for (let y = top; y < bottom; y++) for (let x = 4; x < nose; x++) {
    const slope = y < top + 30 ? nose - 26 + (y - top) * .85 : nose;
    if (x > slope || (y > bottom - 6 && x > nose - 3)) continue;
    m.put(x, y, '#1e1826');
  }
  // the side art, in the matatu way: bands of colour and a name
  for (let y = top + 34; y < bottom - 8; y++) for (let x = 6; x < nose - 4; x++) {
    const a = x * .045 - y * .09, b = Math.sin(a * 2.2) + Math.sin(x * .11 + y * .05) * .4;
    m.put(x, y, b > .9 ? '#ff3d7f' : b > .45 ? '#20c4b8' : b > -.1 ? '#ffd23a' : b > -.6 ? '#7a3cff' : '#221a30');
  }
  m.rect(4, top + 32, nose - 6, 2, '#e4e8f0');
  m.text('NAIROBI', 96, top + 44, '#140c18', 22, 'center', 2); m.text('NAIROBI', 95, top + 42, '#f6f2e6', 22, 'center', 2);
  // windows, with the inside lit in purple
  for (let x = 12; x < nose - 46; x += 30) {
    m.rect(x, top + 6, 26, 22, '#141020');
    if (night) { e.rect(x + 1, top + 7, 24, 20, '#4a2a7a'); e.rect(x + 1, top + 7, 24, 1, '#e0a0ff'); for (let j = top + 8; j < top + 27; j++) for (let i = x + 1; i < x + 25; i++) if (dith(i, j) < .3) e.put(i, j, '#b04aff'); }
    else { for (let j = top + 7; j < top + 27; j++) for (let i = x + 1; i < x + 25; i++) m.put(i, j, lerp('#5a6a88', '#2a3048', (j - top - 7) / 20)); for (let s = 0; s < 12; s++) m.put(x + 6 + s, top + 22 - s, '#a8b8d0'); }
  }
  // the windscreen
  for (let y = top + 6; y < top + 30; y++) for (let x = nose - 44; x < nose - 26 + (y - top) * .85 - 2; x++) m.put(x, y, lerp('#8aa8cc', '#3a4a66', (y - top - 6) / 24));
  m.rect(nose - 30, top + 30, 4, 10, '#141020');                                                                   // mirror
  // roof rack and the route board
  m.rect(10, top - 3, nose - 50, 3, '#3a3448'); for (let x = 14; x < nose - 44; x += 16) m.rect(x, top - 7, 2, 4, '#5a5468');
  m.rect(10, top - 9, nose - 50, 2, '#5a5468');
  m.rect(nose - 92, 0, 74, 14, '#0a080e'); m.rect(nose - 92, 0, 74, 1, '#3a3448');
  e.text(route, nose - 55, 1, '#ffb030', 11, 'center');
  // lights, bumper, wheels
  e.rect(nose - 6, bottom - 26, 6, 7, night ? '#fff6c8' : '#f4ecd0'); e.rect(4, bottom - 28, 3, 7, '#ff3a2a');
  m.rect(4, bottom - 8, nose - 2, 4, '#c8ccd8'); m.rect(4, bottom - 4, nose - 2, 2, '#5a5e6a');
  [46, 176].forEach(wx => {
    for (let y = -14; y <= 14; y++) for (let x = -14; x <= 14; x++) {
      const d = Math.hypot(x, y); if (d > 14.5) continue;
      if (y < -8 && d > 12) { m.put(wx + x, bottom + y, '#0e0a12'); continue; }                                      // the wheel arch
      m.put(wx + x, bottom - 1 + y, d < 5 ? (x + y < 0 ? '#f0f2f8' : '#a8acb8') : d < 6.5 ? '#4a4e5a' : d < 12 ? '#0c0a0e' : '#1e1826');
    }
  });
  return toCanvas(K.data, MW, MH);
}

// ---------- cars ----------
// A saloon and a station wagon (the Nairobi workhorse), clearly bigger than the people: about four of
// them long, the roof well above a head's height off the road. Painted once per time, weather, colour
// and kind, like the matatu.
export const CW = 244, CH = 104;
export function paintCar(env, colour, kind = 'saloon') {
  const K = canvasFor(env, CW, CH), { m, e } = K, night = env.dark > .3;
  const base = CH - 12, roof = 10, belt = 54, front = CW - 6, rear = 6;
  const shade = (c, k) => lerp(c, '#000000', k), shine = (c, k) => lerp(c, '#ffffff', k);
  const wagon = kind === 'wagon';
  const backTop = wagon ? rear + 12 : rear + 56, backFoot = wagon ? rear + 4 : rear + 26;
  const screenTop = 178, screenFoot = 218;
  // the cabin
  for (let y = roof; y < belt; y++) {
    const f = (y - roof) / (belt - roof), x0 = Math.round(backTop + (backFoot - backTop) * f), x1 = Math.round(screenTop + (screenFoot - screenTop) * f);
    for (let x = x0; x < x1; x++) m.put(x, y, y < roof + 2 ? shine(colour, .4) : colour);
  }
  // windows, split by the pillars, catching the sky
  const win = (xa, xb, slopeA, slopeB) => { for (let y = roof + 5; y < belt - 4; y++) { const f = (y - roof - 5) / (belt - roof - 9); for (let x = Math.round(xa + slopeA * f); x < Math.round(xb + slopeB * f); x++) m.put(x, y, lerp('#9ab8d8', '#34445e', f * .9 + (x % 50) / 260)); } };
  win(backTop + 7, 118, (backFoot - backTop) * .85, 0);
  win(125, screenTop - 2, 0, (screenFoot - screenTop) * .85);
  for (let s2 = 0; s2 < 18; s2++) { m.put(136 + s2, belt - 8 - s2, '#e4eef8'); m.put(70 + s2, belt - 8 - s2, '#e4eef8'); m.put(71 + s2, belt - 8 - s2, '#c8dcf0'); }
  m.rect(118, roof + 3, 7, belt - roof - 3, shade(colour, .35));
  // the body
  for (let y = belt; y < base - 4; y++) {
    const inset = y < belt + 5 ? 7 : y > base - 10 ? 2 : 0;
    for (let x = rear + inset; x < front - inset - (y < belt + 5 ? 4 : 0); x++) m.put(x, y, y < belt + 2 ? shine(colour, .3) : y > base - 14 ? shade(colour, .25) : colour);
  }
  m.rect(rear + 5, belt + 15, front - rear - 10, 1, shade(colour, .3)); m.rect(rear + 5, belt + 16, front - rear - 10, 1, shine(colour, .2));
  // doors, handles, a mirror, an aerial
  [118, 178].concat(wagon ? [64] : []).forEach(x => m.rect(x, belt, 1, base - belt - 8, shade(colour, .4)));
  m.rect(104, belt + 9, 9, 2, shade(colour, .5)); m.rect(164, belt + 9, 9, 2, shade(colour, .5));
  m.rect(178, belt - 8, 9, 6, shade(colour, .3)); m.rect(wagon ? 20 : 66, roof - 8, 1, 8, '#2a2a30');
  if (wagon) { m.rect(backTop, roof - 3, 150, 2, '#3a3a44'); for (let x = backTop + 8; x < backTop + 150; x += 30) m.rect(x, roof - 2, 2, 3, '#3a3a44'); }
  // bumpers, plates (white at the front, yellow at the back, as in Kenya), lights
  m.rect(rear, base - 14, 12, 10, '#3a3a40'); m.rect(front - 12, base - 14, 14, 10, '#3a3a40');
  m.rect(rear + 1, base - 13, 10, 6, '#f2c230'); m.rect(front - 11, base - 13, 11, 6, '#f4f4f0');
  e.rect(front - 7, belt + 5, 7, 8, night ? '#fff6c8' : lerp('#f4ecd0', colour, .2)); e.rect(rear, belt + 5, 5, 9, '#ff3a2a');
  // wheels in their arches
  [rear + 50, front - 52].forEach(wx => {
    for (let y = -20; y <= 20; y++) for (let x = -20; x <= 20; x++) {
      const d = Math.hypot(x, y), py = base - 9 + y; if (d > 20.5 || py >= CH) continue;
      if (y < -11 && d > 17.5) { m.put(wx + x, py, '#121014'); continue; }
      m.put(wx + x, py, d < 6 ? (x + y < 0 ? '#e8eaf0' : '#a8acb8') : d < 9 ? '#6a6e7a' : d < 16.5 ? '#141216' : '#1e1c22');
    }
  });
  return toCanvas(K.data, CW, CH);
}
