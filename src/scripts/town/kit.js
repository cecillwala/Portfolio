// The drawing kit for the town (the home page): a pixel buffer every scene is painted into, the times of
// day and the weather, and the sky. Scenes are 640 x 360 art pixels. Everything is chosen per pixel and
// dithered, never blurred, so it stays pixel art at any size.
//
// HOW TIME AND WEATHER WORK. A street is painted in daylight colours ("materials"), and every material
// is graded to the time of day as it is drawn: warm at golden hour, cool at dawn, deep blue at night.
// What gives off its own light (lit windows, lamps, signs, the sun) is drawn ungraded. Each street is
// painted once per time of day and weather (a keyframe) and the runner crossfades between keyframes.
export const W = 640, H = 360;

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const CACHE = {};
export const col = h => (typeof h === 'string' ? (CACHE[h] ||= hex(h)) : h);
export const lerp = (a, b, t) => { a = col(a); b = col(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const dith = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
export const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const hash2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
export const noise2 = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x, y) => noise2(x, y) * .55 + noise2(x * 2.1, y * 2.1) * .3 + noise2(x * 4.3, y * 4.3) * .15;
export const seeded = s => () => ((s = (s * 16807) % 2147483647) / 2147483647);

// ---------- the times of day ----------
// sky: colour stops as fractions of the horizon height. amb/add: how a daylight material is graded.
// dark: how much of the city's own light is on (windows, lamps). sun: where the sun or moon sits,
// as fractions of the scene (x) and of the horizon (y). litBelow: clouds lit from underneath.
export const TIMES = {
  dawn: {
    label: 'Dawn', sky: [[0, '#2a3466'], [.35, '#4b4f86'], [.6, '#9a6b98'], [.8, '#e39a8c'], [.93, '#ffc59a'], [1, '#ffe2b8']],
    amb: [.82, .74, .88], add: [10, 6, 16], dark: .5, sun: [.82, .96], sunCol: '#ffe7c0', litBelow: true, stars: .25,
    cloud: ['#5b4f80', '#ffb8a0', '#3c3868'], rim: '#ffc9a8', haze: '#d9a0b0', hazeA: .45,
  },
  day: {
    label: 'Day', sky: [[0, '#2f74c6'], [.45, '#4d93db'], [.8, '#8cc0ec'], [1, '#cfe6f6']],
    amb: [1, 1, 1], add: [0, 0, 0], dark: 0, sun: [.7, .18], sunCol: '#fffbe8', litBelow: false, stars: 0,
    cloud: ['#e8eef6', '#ffffff', '#a9b8cc'], rim: null, haze: '#cfe0ee', hazeA: .3,
  },
  golden: {
    label: 'Golden hour', sky: [[0, '#1b1340'], [.17, '#2b1756'], [.34, '#481f64'], [.49, '#762663'], [.63, '#a8335d'], [.75, '#d24f42'], [.84, '#ec7834'], [.92, '#f9a443'], [.97, '#ffc96a'], [1, '#ffe29a']],
    amb: [1.04, .76, .64], add: [10, 0, 6], dark: .35, sun: [.33, .87], sunCol: '#fff3cc', litBelow: true, stars: 0,
    cloud: ['#4a1f5c', '#ffcf80', '#2a1448'], rim: '#ffb35c', haze: '#ff9a5a', hazeA: .35,
  },
  night: {
    label: 'Night', sky: [[0, '#04081a'], [.4, '#0a1232'], [.75, '#18214c'], [.92, '#2c2c60'], [1, '#463a6e']],
    amb: [.26, .3, .5], add: [2, 4, 14], dark: 1, sun: [.78, .22], sunCol: '#f3efd8', moon: true, litBelow: false, stars: 1,
    cloud: ['#1c2244', '#5a628e', '#0e1430'], rim: null, haze: '#2a2a58', hazeA: .3,
  },
};
/** The same time under rain cloud: greyer, flatter, no sun, wet. */
export function overcast(t) {
  const grey = c => { const [r, g, b] = col(c), l = r * .3 + g * .59 + b * .11; return lerp([l, l, l + 8], c, .3); };
  return {
    ...t, sky: t.sky.map(([f, c]) => [f, grey(c)]), amb: t.amb.map(v => v * .82), add: t.add, sunCol: null, moon: false,
    dark: Math.min(1, t.dark + .2), stars: 0, rim: null, overcast: true,
    cloud: [lerp(grey(t.cloud[0]), '#3a3e4a', .45), lerp(grey(t.cloud[1]), '#5a5e6a', .35), lerp(grey(t.cloud[2]), '#1e2028', .5)],
    desat: .35, haze: grey(t.haze), hazeA: t.hazeA + .1,
  };
}
/** Where Nairobi's day is, as keyframes and a blend: [time A, time B, how far from A to B]. */
export function dayAt(hour) {
  const spans = [[0, 'night'], [5, 'night'], [6, 'dawn'], [7, 'dawn'], [8.5, 'day'], [16.5, 'day'], [17.25, 'golden'], [18.25, 'golden'], [19.25, 'night'], [24, 'night']];
  for (let i = 0; i < spans.length - 1; i++) {
    const [h0, a] = spans[i], [h1, b] = spans[i + 1];
    if (hour >= h0 && hour < h1) return a === b ? [a, a, 0] : [a, b, (hour - h0) / (h1 - h0)];
  }
  return ['night', 'night', 0];
}

// ---------- the pixel buffer ----------
/** A painter for one keyframe: `m` draws materials (graded to the time), `e` draws light (ungraded). */
export function canvasFor(env, BW = W, BH = H) {
  const data = new Uint8ClampedArray(BW * BH * 4);
  const [ar, ag, ab] = env.amb, [dr, dg, db] = env.add, desat = env.desat || 0;
  const grade = c => {
    c = col(c); let r = c[0] * ar + dr, g = c[1] * ag + dg, b = c[2] * ab + db;
    if (desat) { const l = r * .3 + g * .59 + b * .11; r += (l - r) * desat; g += (l - g) * desat; b += (l - b) * desat; }
    return [r, g, b];
  };
  const raw = c => col(c);
  const get = (x, y) => { const i = (y * BW + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const has = (x, y) => data[(y * BW + x) * 4 + 3] > 0;
  const kit = (tone) => {
    const put = (x, y, c, a = 1) => {
      x |= 0; y |= 0; if (x < 0 || y < 0 || x >= BW || y >= BH) return;
      const i = (y * BW + x) * 4; c = tone(c);
      if (a >= 1 || !data[i + 3]) { data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; }
      else { data[i] += (c[0] - data[i]) * a; data[i + 1] += (c[1] - data[i + 1]) * a; data[i + 2] += (c[2] - data[i + 2]) * a; }
      data[i + 3] = 255;
    };
    const k = {
      put,
      rect(x, y, w, h, c, a = 1) { for (let j = y | 0; j < y + h; j++) for (let i = x | 0; i < x + w; i++) put(i, j, c, a); },
      drect(x, y, w, h, c, t) { for (let j = y | 0; j < y + h; j++) for (let i = x | 0; i < x + w; i++) if (dith(i, j) < t) put(i, j, c); },
      vgrad(x0, x1, stops, test) {
        for (let s = 0; s < stops.length - 1; s++) {
          const [ya, ca] = stops[s], [yb, cb] = stops[s + 1];
          for (let y = Math.floor(ya); y < yb; y++) { const t = (y - ya) / (yb - ya); for (let x = x0; x < x1; x++) if (!test || test(x, y)) put(x, y, dith(x, y) < t ? cb : ca); }
        }
      },
      glow(cx, cy, r, c, strength = .5, squash = 1) {
        for (let y = Math.floor(cy - r * squash); y <= cy + r * squash; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
          const d = Math.hypot(x - cx, (y - cy) / squash) / r; if (d >= 1) continue;
          const f = (1 - d) * (1 - d) * strength;
          if (dith(x, y) < f * 1.6) put(x, y, c, Math.min(.85, .25 + f));
        }
      },
      disc(cx, cy, r, c) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) < r) put(x, y, c); },
      line(x0, y0, x1, y1, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (let s = 0; s <= n; s++) put(x0 + (x1 - x0) * s / (n || 1), y0 + (y1 - y0) * s / (n || 1), c); },
      text(s, x, y, c, size = 11, align = 'left', spacing = 0) { return lettering(put, s, x, y, c, size, align, spacing); },
    };
    return k;
  };
  const m = kit(grade), e = kit(raw);
  return { data, m, e, get, has, grade, env, w: BW, h: BH };
}
const fontName = 'Departure Mono';
const letterCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
/** Lettering: the pixel font drawn small, then cut to hard pixels. */
function lettering(put, s, x, y, c, size, align, spacing) {
  const o = letterCanvas.getContext('2d', { willReadFrequently: true });
  letterCanvas.width = 480; letterCanvas.height = size * 2;
  o.font = `${size}px "${fontName}"`; o.textBaseline = 'top'; o.letterSpacing = spacing + 'px';
  const w = Math.max(1, Math.ceil(o.measureText(s).width)); o.fillStyle = '#fff'; o.fillText(s, 0, 0);
  const d = o.getImageData(0, 0, w, size * 2).data, sx = align === 'center' ? x - (w >> 1) : align === 'right' ? x - w : x;
  for (let j = 0; j < size * 2; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 120) put(sx + i, y + j, c);
  return w;
}
/** Turn a painted buffer into a canvas the runner can draw. */
export function toCanvas(data, w = W, h = H) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').putImageData(new ImageData(data, w, h), 0, 0);
  return c;
}

// ---------- the sky ----------
/**
 * Paint the sky down to `horizon`: its colours, the sun or the moon, stars, and clouds.
 * `sunX` lets a street put the sun where its view faces (a fraction of the width), or null for the default.
 */
export function paintSky(K, horizon, { sunX = null, cloudiness = 1, seed = 1 } = {}) {
  const { e, env } = K;
  e.vgrad(0, W, env.sky.map(([f, c]) => [f * (horizon + 1), c]));
  const rnd = seeded(seed * 97 + 13);
  if (env.stars) for (let n = 0; n < 220; n++) {
    const x = rnd() * W, y = rnd() * rnd() * horizon * .8, b = rnd();
    if (b < env.stars) e.put(x, y, b > .85 ? '#f4efd8' : b > .5 ? '#9aa1d6' : '#5a6098');
  }
  let sun = null;
  if (env.sunCol) {
    sun = [(sunX ?? env.sun[0]) * W, env.sun[1] * horizon];
    if (env.moon) {
      e.glow(sun[0], sun[1], 60, '#8a94c8', .35);
      e.disc(sun[0], sun[1], 11, '#f3efd8'); e.disc(sun[0] + 5, sun[1] - 3, 9.5, lerp(env.sky[0][1], env.sky[1][1], .5));   // a crescent
      [[-4, 2], [-6, -3], [-2, 6]].forEach(([dx, dy]) => e.put(sun[0] + dx, sun[1] + dy, '#cfcab4'));
    } else {
      const low = env.sun[1] > .6;
      e.glow(sun[0], sun[1], low ? 230 : 140, low ? '#ffb35a' : '#fff6d8', low ? .45 : .35, .55);
      e.glow(sun[0], sun[1], 70, '#ffe6a2', low ? .9 : .5, .75);
      e.disc(sun[0], sun[1], 14.5, '#ffe8a4'); e.disc(sun[0], sun[1], 11, env.sunCol);
    }
  }
  // clouds: masses cut from noise, lit from the side the light comes from
  const [body, lit, shadow] = env.cloud;
  const bands = env.overcast
    ? [[.06, .1, .016, .3], [.2, .12, .018, .28], [.36, .1, .02, .3], [.52, .08, .024, .32], [.66, .06, .03, .34], [.8, .04, .04, .36]]
    : [[.08, .06, .018, .4], [.21, .04, .022, .41], [.33, .03, .03, .42], [.47, .025, .03, .43], [.62, .02, .035, .44], [.8, .012, .045, .45]];
  bands.forEach(([fy, fh, sc, th], n) => {
    const yc = fy * horizon, h = fh * horizon + 3, sd = seed * 7 + n * 13, thresh = th + (1 - cloudiness) * .25;
    for (let y = Math.max(0, Math.floor(yc - h)); y < yc + h && y < horizon; y++) for (let x = 0; x < W; x++) {
      const v = (y - (yc - h)) / (2 * h), env2 = Math.sin(Math.PI * v);
      const f = (yy) => fbm(x * sc + sd, yy * sc * 2.6 + sd) * env2;
      const cov = f(y); if (cov < thresh) continue;
      const near = sun ? Math.max(0, 1 - Math.hypot(x - sun[0], (y - sun[1]) * 1.6) / 380) : 0;
      const litEdge = env.litBelow ? f(y + 3) < thresh : f(y - 3) < thresh;
      const darkEdge = env.litBelow ? f(y - 2) < thresh : f(y + 3) < thresh;
      let c = lerp(body, lit, env.litBelow ? near * .35 : 0);
      if (litEdge) c = env.litBelow ? lerp(lerp(body, lit, .55), lit, near) : lit;
      else if (darkEdge) c = lerp(c, shadow, .55);
      else if (cov < thresh + .035 && dith(x, y) < .5) c = lerp(c, env.sky[Math.min(env.sky.length - 1, 2)][1], .4);
      e.put(x, y, c);
    }
  });
  return sun;
}

/** Rows of a wet road that hold what stands above them, broken by ripples. */
export function reflect(K, top, bottom, mirror, strength, tarmac = '#2a2630') {
  const { e, get, grade } = K, base = grade(tarmac);
  for (let y = top; y < bottom; y++) {
    const depth = (y - top) / (bottom - top), my = Math.max(0, Math.round(mirror - (y - top) * 2.6 - 2)), ripple = Math.round(Math.sin(y * 1.9) * (1 + depth * 2));
    for (let x = 0; x < W; x++) {
      const src = get(Math.min(W - 1, Math.max(0, x + ripple)), my);
      let c = lerp(base, src, strength * (1 - depth * .5));
      if (dith(x, y) < .1 + depth * .1) c = lerp(c, [16, 12, 22], .5);
      e.put(x, y, c);
    }
  }
}
