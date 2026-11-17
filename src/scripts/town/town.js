// The home page: a town of four streets joined by a matatu. Interactive mode only (browser mode is
// separate and not on this page). See streets.js for the streets, kit.js for time and weather.
//
// Time follows Nairobi's own clock unless the visitor picks a time (the clock button). Weather drifts
// on its own, a short-rains shower every few minutes, unless the visitor picks clear or rain.
// Each street is painted once per time of day and weather, and crossfaded as the day and the
// weather move. Cecil walks the street; the matatu takes him between streets.
import { W, H, TIMES, overcast, dayAt, canvasFor, toCanvas } from './kit.js';
import { STREETS, ORDER, FEET, ROAD } from './streets.js';
import { paintMatatu, MW, MH, DOOR, paintCar, CW, CH } from './matatu.js';
import { peopleFrom, LOOKS, BOTTOM, SHOES } from './people.js';
import { still, SPRITE, blip, chime, step, door, soundButton } from '../pixel.js';

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const MATATU_FEET = 342;              // the matatu's wheels on the road
const TIME_MODES = ['live', 'dawn', 'day', 'golden', 'night'];
const WEATHER_MODES = ['auto', 'clear', 'rain'];

export async function initTown(onProgress = () => {}) {
  const sheet = new Image(); sheet.src = base + '/sprites/cecil-town.png';
  const font = new FontFace('Departure Mono', `url(${base}/fonts/DepartureMono-Regular.woff2)`);
  let done = 0; const track = p => p.then(() => onProgress(++done * 25));
  await Promise.all([track(sheet.decode()), track(font.load().then(f => document.fonts.add(f))),
    track(document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true })))]);

  const person = peopleFrom(sheet);                     // the townspeople, built on Cecil's frames
  const stage = document.getElementById('stage'), view = document.getElementById('view'), cv = document.getElementById('street');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tg = tmp.getContext('2d');
  const actor = document.createElement('canvas'); actor.width = 48; actor.height = 64; const ac = actor.getContext('2d');
  const fade = document.createElement('canvas'); fade.width = W; fade.height = H; const fg = fade.getContext('2d');
  document.getElementById('street-character')?.remove(); document.getElementById('street-traffic')?.remove();

  // ---------- keyframes: each street at each time and weather, painted on first need ----------
  const frames = new Map();
  function keyframe(id, time, wet) {
    const k = `${id}|${time}|${wet ? 1 : 0}`;
    if (!frames.has(k)) {
      const env = { ...(wet ? overcast(TIMES[time]) : TIMES[time]), key: time };
      const K = canvasFor(env), F = canvasFor(env);
      STREETS[id].paint(K, F);
      frames.set(k, { back: toCanvas(K.data), front: toCanvas(F.data), env });
    }
    return frames.get(k);
  }
  const buses = new Map();
  const cars = new Map();
  const carPic = (time, wet, colour, kind) => { const k = `${time}|${wet}|${colour}|${kind}`; if (!cars.has(k)) cars.set(k, paintCar({ ...(wet ? overcast(TIMES[time]) : TIMES[time]), key: time }, colour, kind)); return cars.get(k); };
  const bus = (time, wet, route) => { const k = `${time}|${wet}|${route}`; if (!buses.has(k)) buses.set(k, paintMatatu({ ...(wet ? overcast(TIMES[time]) : TIMES[time]), key: time }, route)); return buses.get(k); };
  // paint what might be needed next while the visitor looks around
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  const warm = [];
  let warming = false;
  function prewarm() {
    if (warming || !warm.length) return;
    warming = true;
    idle(() => { warming = false; const next = warm.shift(); if (next) keyframe(...next); prewarm(); });
  }

  // ---------- time and weather ----------
  const q = new URLSearchParams(location.search);
  let timeMode = TIME_MODES.includes(q.get('time')) ? q.get('time') : 'live', weatherMode = WEATHER_MODES.includes(q.get('weather')) ? q.get('weather') : 'auto';
  let rain = weatherMode === 'rain' ? 1 : 0, rainTarget = weatherMode === 'rain' ? 1 : 0, nextShower = performance.now() + 40000 + Math.random() * 30000, showerEnds = 0;
  const nairobiHour = () => { const d = new Date(); return ((d.getUTCHours() + 3) % 24) + d.getUTCMinutes() / 60; };
  const times = () => timeMode === 'live' ? dayAt(nairobiHour()) : [timeMode, timeMode, 0];
  const wetWanted = () => rain > 0.001 || rainTarget > 0;
  const weatherLabel = () => (rain > .5 ? 'rain' : rainTarget ? 'rain coming' : 'clear');

  // ---------- the street we are on ----------
  const params = new URLSearchParams(location.search);
  const fromSlug = params.get('from'), asked = params.get('street');
  // back from a building: its street, at the door of the floor the visitor was on (`at`), else its first door
  const fromStreet = { projects: 'projects', experience: 'experience', education: 'education' }[fromSlug];
  const fromPlace = fromStreet && [fromStreet, (STREETS[fromStreet].places.find(p => p.id === params.get('at')) || STREETS[fromStreet].places[0]).id];
  let street = STREETS[asked] || STREETS[fromPlace?.[0]] || STREETS.stage;
  const startX = fromPlace ? street.places.find(p => p.id === fromPlace[1]).x : street.id === 'stage' ? 300 : street.stopX + 40;
  const C = { x: startX, tx: startX, dir: 1, key: 0, hidden: false, at: null, goal: null, step: 0, waveUntil: performance.now() + 2600 };
  const M = { x: -MW - 40, state: 'gone', route: 'TOWN', v: 0, then: null };
  let busy = false, curtain = 0, curtainTarget = 0, cam = C.x, hover = null;

  // ---------- the interface: panel, places bar, status, controls ----------
  const panel = document.getElementById('place-card'), panelTitle = document.getElementById('place-title'), panelActions = panel.querySelector('.place-card__actions');
  const hint = document.getElementById('hint'), status = document.getElementById('street-location'), nav = document.getElementById('places');
  const help = document.getElementById('street-help'), helpOpen = document.getElementById('street-help-open');
  let panelTrigger = null, focusOnArrival = false;
  function closePanel(restore = false) { const had = panel.contains(document.activeElement); panel.classList.add('off'); panel.inert = true; panel.setAttribute('aria-hidden', 'true'); if (restore && had) panelTrigger?.focus(); }
  function showPanel(title, text, eyebrow, actions = [], accent = street.accent) {
    if (!panel.contains(document.activeElement)) panelTrigger = document.activeElement;
    panelTitle.textContent = title; document.getElementById('place-description').textContent = text; document.getElementById('place-category').textContent = eyebrow;
    document.getElementById('place-status').hidden = true;
    panelActions.replaceChildren(...actions); panel.style.setProperty('--accent', accent);
    panel.inert = false; panel.setAttribute('aria-hidden', 'false'); panel.classList.remove('off');
    if (focusOnArrival || panelTrigger?.closest('#places')) requestAnimationFrame(() => { if (!panel.inert) panelTitle.focus({ preventScroll: true }); });
    focusOnArrival = false;
  }
  panel.querySelector('.place-card__close').addEventListener('click', () => closePanel(true));
  const chip = (label, fn, primary = false) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'primary'; b.addEventListener('click', ev => { ev.stopPropagation(); fn(); }); return b; };
  const link = (label, href) => { const a = document.createElement('a'); a.textContent = label; a.href = /^(https?:|mailto:)/.test(href) ? href : base + href; return a; };
  function closeHelp(restore = false) { help.hidden = true; helpOpen.setAttribute('aria-expanded', 'false'); if (restore) helpOpen.focus(); }
  function openHelp() { closePanel(); help.hidden = false; helpOpen.setAttribute('aria-expanded', 'true'); document.getElementById('street-help-title').focus({ preventScroll: true }); }
  helpOpen.addEventListener('click', () => (help.hidden ? openHelp() : closeHelp(true)));
  document.getElementById('street-help-close').addEventListener('click', () => closeHelp(true));
  document.getElementById('street-help-start').addEventListener('click', () => { closeHelp(); nav.querySelector('button')?.focus(); });

  function setStatus(text) {
    const [a, b, t] = times(), label = TIMES[t > .5 ? b : a].label.toLowerCase();
    status.textContent = `${street.where} · ${label}, ${weatherLabel()}` + (text ? ` · ${text}` : '');
  }
  function buildNav() {
    const items = street.places.map(p => ({ id: p.id, name: p.short, small: p.small, go: () => walkTo(p) }));
    items.push({ id: 'stop', name: 'Matatu', small: 'Ride to another street', go: () => walkTo('stop') });
    nav.replaceChildren(...items.map(it => { const b = chip('', it.go); b.dataset.place = it.id; const n = document.createElement('span'); n.textContent = it.name; const s = document.createElement('small'); s.textContent = it.small; b.append(n, s); return b; }));
  }
  const markNav = id => nav.querySelectorAll('button').forEach(b => b.dataset.place === id ? b.setAttribute('aria-current', 'location') : b.removeAttribute('aria-current'));

  // ---------- walking, arriving, going in ----------
  function walkTo(target) {
    if (busy) return;
    closeHelp(); closePanel(true); hint.hidden = true;
    focusOnArrival = !!document.activeElement?.closest('#places, #place-card');
    C.goal = target; C.at = null; C.tx = target === 'stop' ? street.stopX + 14 : target.x; markNav(null);
    setStatus('Walking to ' + (target === 'stop' ? 'the matatu stage' : target.title) + '…'); blip(660, .04);
  }
  function arrive(target) {
    C.at = target; chime();
    if (target === 'stop') { markNav('stop'); return routes(); }
    markNav(target.id); setStatus(target.href ? 'Choose “Go inside” to enter' : '');
    const actions = target.href ? [chip('Go inside ' + target.title + ' →', () => enter(target), true)]
      : target.contact ? [chip('Show my contacts', () => contacts(target), true)] : [chip('Take a matatu', () => walkTo('stop'))];
    showPanel(target.title, target.say, street.title, actions, target.accent);
  }
  function contacts(target) {
    focusOnArrival = panel.contains(document.activeElement);
    showPanel('Let’s connect', 'I’m based in Nairobi. Have a project, a role to discuss, or an idea to build together? You can reach me directly below.', street.title,
      [link('Email Cecil', 'mailto:lwalacecil13@gmail.com'), link('LinkedIn ↗', 'https://www.linkedin.com/in/cecillwala')], target.accent);
  }
  function routes() {
    setStatus('The matatu stage');
    const others = ORDER.filter(id => id !== street.id).map(id => STREETS[id]);
    showPanel('Where to?', 'Pick a street and the next matatu will take you there.', street.title + ' · matatu stage',
      others.map((s, n) => chip(`${s.name} · ${s.where}`, () => ride(s), n === 0)));
  }
  function enter(place) {
    if (busy || !place.href) return;
    busy = true; door();
    const r = cv.getBoundingClientRect(), s = r.width / W, iris = document.getElementById('iris');
    iris.style.left = r.left + place.x * s + 'px'; iris.style.top = r.top + (FEET - 30) * s + 'px'; iris.classList.add('closing');
    setTimeout(() => { location.href = base + place.href; }, still ? 0 : 620);
  }
  function greet() {
    showPanel(street.id === 'stage' ? 'Karibu. I’m Cecil.' : street.title, street.say, street.where,
      street.id === 'stage' ? [chip('Ride to Projects →', () => walkTo('stop'), true), chip('How to explore', openHelp)]
        : [...street.places.filter(p => p.href).slice(0, 1).map(p => chip('Go to ' + p.title, () => walkTo(p), true)), chip('Take a matatu', () => walkTo('stop'))]);
  }

  // ---------- the matatu ride ----------
  function ride(to) {
    if (busy) return;
    busy = true; closePanel(); markNav(null); setStatus('Waiting for the matatu to ' + to.name + '…');
    M.route = to.name.toUpperCase(); M.state = 'arriving'; M.x = -MW - 30; M.target = street.stopX - DOOR + 6;
    M.then = () => {                                                           // Cecil gets on
      C.tx = street.stopX + 6;
      setTimeout(() => {
        C.hidden = true; hoot();
        setTimeout(() => { M.state = 'leaving'; M.v = 30; M.then = () => switchStreet(to); }, still ? 0 : 500);
      }, still ? 0 : 450);
    };
    if (still) { M.x = M.target; M.state = 'waiting'; const then = M.then; M.then = null; then(); }
  }
  function hoot() { blip(392, .12, 'square', .04); setTimeout(() => blip(392, .16, 'square', .04), 170); }
  function switchStreet(to) {
    curtainTarget = 1;
    const go = () => {
      street = to; M.route = (to.id === 'stage' ? 'TOWN' : to.name.toUpperCase());
      setStatus('Arriving');
      buildNav(); seatCrowd(); C.x = C.tx = to.stopX + 6; C.hidden = true; C.at = null;
      M.x = -MW - 30; M.state = 'arriving'; M.target = to.stopX - DOOR + 6; cam = to.stopX;
      queueWarm();
      history.replaceState(null, '', street.id === 'stage' ? location.pathname : `?street=${street.id}`);
      M.then = () => {                                                         // Cecil gets off and steps out
        C.hidden = false; C.tx = to.stopX + 46; hoot();
        setTimeout(() => { M.state = 'leaving'; M.v = 30; M.then = () => { M.state = 'gone'; busy = false; setStatus(''); greet(); }; }, still ? 0 : 700);
      };
      curtainTarget = 0;
      if (still) { M.x = M.target; M.state = 'waiting'; const then = M.then; M.then = null; then(); }
    };
    if (still) go(); else setTimeout(go, 450);
  }
  function queueWarm() {
    const [a, b] = times();
    warm.length = 0;
    [[street.id, a, true], [street.id, b, false], [street.id, b, true]].forEach(k => warm.push(k));
    ORDER.filter(id => id !== street.id).forEach(id => warm.push([id, a, false]));
    prewarm();
  }

  // ---------- controls: walking, clicking, the clock and the weather ----------
  const toScene = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H]; };
  const placeAt = (x, y) => street.places.find(p => x >= p.box[0] && x <= p.box[0] + p.box[2] && y >= p.box[1] && y <= p.box[1] + p.box[3]) ||
    (Math.abs(x - street.stopX - 2) < 24 && y > 200 && y < 296 ? 'stop' : null);
  const onCecil = (x, y) => !C.hidden && Math.abs(x - C.x) < 16 && y > FEET - 64 && y < FEET;
  cv.addEventListener('pointermove', ev => { if (busy || stage.classList.contains('street-wallpaper')) { hover = null; cv.style.cursor = 'default'; return; } const [x, y] = toScene(ev); hover = placeAt(x, y); cv.style.cursor = hover || onCecil(x, y) ? 'pointer' : 'default'; });
  cv.addEventListener('pointerleave', () => { hover = null; });
  cv.addEventListener('click', ev => {
    if (busy || stage.classList.contains('street-wallpaper') || !help.hidden) return;
    const [x, y] = toScene(ev), p = placeAt(x, y);
    if (onCecil(x, y)) { C.waveUntil = performance.now() + 1800; blip(880, .06, 'square', .03, 1320); greet(); return; }
    if (p) { if (C.at === p && p !== 'stop' && p.href) enter(p); else if (C.at === p) arrive(p); else walkTo(p); }
  });
  addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { if (!help.hidden) closeHelp(true); else closePanel(true); setMode(false); return; }
    if (busy || !help.hidden || stage.classList.contains('street-wallpaper')) return;
    if (ev.target instanceof HTMLElement && ((ev.target.closest('button, a') && ev.key === 'Enter') || (ev.target.closest('#place-card') && ev.key.startsWith('Arrow')))) return;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { C.key = ev.key === 'ArrowLeft' ? -1 : 1; C.goal = null; C.at = null; closePanel(); markNav(null); hint.hidden = true; setStatus('Walking'); ev.preventDefault(); }
    if (ev.key === 'Enter') { const near = nearest(); if (near) { if (near !== 'stop' && near.href && C.at === near) enter(near); else arrive(near); } }
  });
  addEventListener('keyup', ev => { if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { C.key = 0; C.tx = C.x; const near = nearest(); if (near) arrive(near); else setStatus(''); } });
  addEventListener('blur', () => { C.key = 0; C.tx = C.x; });
  const nearest = () => { if (Math.abs(C.x - street.stopX - 14) < 22) return 'stop'; return street.places.find(p => Math.abs(p.x - C.x) < 22) || null; };

  const clockBtn = document.getElementById('clock'), weatherBtn = document.getElementById('weather');
  const clockText = () => {
    if (timeMode !== 'live') return TIMES[timeMode].label;
    try { return 'Nairobi ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date()); } catch { return 'Nairobi'; }
  };
  let fadeUntil = 0;
  function snapshot() { fg.clearRect(0, 0, W, H); fg.drawImage(cv, 0, 0); fadeUntil = still ? 0 : performance.now() + 1200; }
  clockBtn?.addEventListener('click', () => {
    snapshot(); timeMode = TIME_MODES[(TIME_MODES.indexOf(timeMode) + 1) % TIME_MODES.length];
    clockBtn.textContent = clockText(); clockBtn.setAttribute('aria-label', `Time of day: ${timeMode === 'live' ? 'Nairobi now' : TIMES[timeMode].label}. Change`);
    queueWarm(); setStatus(''); blip(523, .05);
  });
  weatherBtn?.addEventListener('click', () => {
    weatherMode = WEATHER_MODES[(WEATHER_MODES.indexOf(weatherMode) + 1) % WEATHER_MODES.length];
    if (weatherMode === 'clear') rainTarget = 0; if (weatherMode === 'rain') rainTarget = 1;
    if (weatherMode === 'auto') { rainTarget = 0; nextShower = performance.now() + 20000; }
    weatherBtn.textContent = 'Weather: ' + weatherMode; blip(440, .05);
    if (rainTarget) queueWarm();
  });
  setInterval(() => { if (timeMode === 'live' && clockBtn) clockBtn.textContent = clockText(); }, 20000);
  if (clockBtn) clockBtn.textContent = clockText();
  if (weatherBtn) weatherBtn.textContent = 'Weather: ' + weatherMode;

  const wallpaper = document.getElementById('street-wallpaper'), explore = document.getElementById('street-explore');
  function setMode(on) {
    stage.classList.toggle('street-wallpaper', on); wallpaper.setAttribute('aria-pressed', String(on)); explore.setAttribute('aria-pressed', String(!on));
    if (on) { closePanel(); closeHelp(); C.key = 0; C.tx = C.x; C.goal = null; }
  }
  wallpaper.addEventListener('click', () => setMode(true)); explore.addEventListener('click', () => setMode(false));
  soundButton(document.getElementById('snd'));

  // ---------- life: rain, traffic, birds ----------
  const drops = Array.from({ length: 360 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 260 + Math.random() * 140, l: 3 + Math.random() * 4, floor: 296 + Math.random() * 60 }));
  const splashes = [];
  const car = { on: false, x: 0, v: 0, col: '#c8302a', kind: 'saloon', dir: 1, next: performance.now() + 6000 };
  const CAR_COLOURS = ['#c8302a', '#e8e4dc', '#2a4a8a', '#3a3a40', '#d8a830', '#4a7a5a'];
  const walkers = []; let nextWalker = performance.now() + 1500;
  const boda = { on: false, next: performance.now() + 4000, x: 0 };
  let crowd = [];
  const seatCrowd = () => { crowd = (street.crowd || []).map(c => ({ ...c, onPhone: !!c.phone, next: performance.now() + Math.random() * 6000 })); walkers.length = 0; };
  seatCrowd();
  const birds = Array.from({ length: 4 }, (_, n) => ({ x: Math.random() * W, y: 40 + n * 14 + Math.random() * 10, v: 14 + Math.random() * 10, ph: Math.random() * 6 }));

  // ---------- layout ----------
  let scale = 1;
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    scale = Math.max(w / W, h / H);
    view.style.width = W * scale + 'px'; view.style.height = H * scale + 'px';
  }
  new ResizeObserver(fit).observe(stage); fit();

  // ---------- draw a frame ----------
  function layer(which, a, b, tb, wet) {
    const fa = keyframe(street.id, a, false);
    g.globalAlpha = 1; g.drawImage(fa[which], 0, 0);
    if (wet > 0.001) { g.globalAlpha = wet; g.drawImage(keyframe(street.id, a, true)[which], 0, 0); }
    if (tb > 0.001) {
      tg.clearRect(0, 0, W, H); tg.globalAlpha = 1; tg.drawImage(keyframe(street.id, b, false)[which], 0, 0);
      if (wet > 0.001) { tg.globalAlpha = wet; tg.drawImage(keyframe(street.id, b, true)[which], 0, 0); }
      g.globalAlpha = tb; g.drawImage(tmp, 0, 0);
    }
    g.globalAlpha = 1;
  }
  let last = performance.now(), stepAt = 0, light = () => '#fff';
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
    // weather
    if (weatherMode === 'auto' && !still) {
      if (!rainTarget && now > nextShower) { rainTarget = 1; showerEnds = now + 45000 + Math.random() * 25000; setStatus(''); }
      if (rainTarget && now > showerEnds) { rainTarget = 0; nextShower = now + 150000 + Math.random() * 90000; setTimeout(() => setStatus(''), 7000); }
    }
    rain += Math.sign(rainTarget - rain) * Math.min(Math.abs(rainTarget - rain), still ? 1 : dt / 6);
    const [a, b, tb] = times();
    const env = TIMES[tb > .5 ? b : a];
    const amb = [0, 1, 2].map(i => TIMES[a].amb[i] * (1 - tb) + TIMES[b].amb[i] * tb).map(v => v * (1 - rain * .18));
    light = (lift = 0) => `rgb(${amb.map(v => Math.round(Math.min(1, v + (1 - v) * lift) * 255)).join(',')})`;
    layer('back', a, b, tb, rain);

    // birds by day, when it is dry
    if (env.dark < .5 && rain < .3 && !still) for (const bd of birds) { bd.x += bd.v * dt; if (bd.x > W + 20) bd.x = -20; const flap = Math.sin(t * 8 + bd.ph) > 0; g.fillStyle = '#2a2a3a'; g.fillRect(bd.x | 0, bd.y | 0, 1, 1); g.fillRect((bd.x - 1) | 0, (bd.y - (flap ? 1 : 0)) | 0, 1, 1); g.fillRect((bd.x + 1) | 0, (bd.y - (flap ? 1 : 0)) | 0, 1, 1); g.fillRect((bd.x - 2) | 0, (bd.y - (flap ? 2 : 0)) | 0, 1, 1); g.fillRect((bd.x + 2) | 0, (bd.y - (flap ? 2 : 0)) | 0, 1, 1); }

    // Cecil
    if (C.key) C.tx = Math.max(16, Math.min(W - 24, C.x + C.key * 40));
    const dx = C.tx - C.x, moving = Math.abs(dx) > .6;
    if (moving) { C.dir = dx > 0 ? 1 : -1; C.x += Math.sign(dx) * Math.min(Math.abs(dx), (still ? 9999 : 110) * dt); if (now > stepAt) { stepAt = now + 150; C.step = (C.step + 1) % 4; if (C.step % 2 === 0 && !C.hidden) step(); } }
    else if (C.goal) { const target = C.goal; C.goal = null; arrive(target); }
    const people = [];
    if (!C.hidden) {
      let f = SPRITE.idle;
      if (moving) f = still ? SPRITE.walk : SPRITE.walk + C.step;
      else if (!still && now < C.waveUntil) f = Math.floor(now / 240) % 2 ? SPRITE.wave : SPRITE.waveTalk;
      else f = Math.floor(t * .9) % 6 === 5 ? SPRITE.blink : SPRITE.idle;
      people.push({ feet: FEET, x: C.x, img: sheet, sx: f * 48, flip: moving && C.dir < 0, lift: .4 });
    }
    // the people waiting: they blink, and some keep checking their phones
    for (const c of crowd) {
      if (!still && now > c.next) { c.onPhone = c.phone ? !c.onPhone : false; c.next = now + 4000 + Math.random() * 7000; }
      const look = person(c.look), blinking = !still && (now + c.look * 977) % 4200 < 140;
      const img = c.onPhone ? (env.dark > .3 ? look.phoneLit : look.phone) : blinking ? look.blink : look.idle;
      people.push({ feet: c.feet, x: c.x, img, sx: 0, flip: false, lift: .3 });
    }
    // people walking by, on either side of Cecil's line; under umbrellas when it rains
    if (!still && walkers.length < 3 && now > nextWalker) {
      const dir = Math.random() < .5 ? 1 : -1, wet = rain > .5;
      walkers.push({ x: dir > 0 ? -30 : W + 30, dir, look: Math.floor(Math.random() * LOOKS.length), feet: Math.random() < .5 ? 297 : 305, v: (wet ? 40 : 26) + Math.random() * 12, brolly: wet && Math.random() < .75 ? ['#2a2a34', '#c8302a', '#2a5ab8', '#e8c040'][Math.floor(Math.random() * 4)] : null, d: 0 });
      nextWalker = now + (5000 + Math.random() * 7000) * (env.dark > .5 ? 2.2 : 1) / (street.walkers || 1);
    }
    for (let i = walkers.length - 1; i >= 0; i--) {
      const w = walkers[i]; w.x += w.dir * w.v * dt; w.d += w.v * dt;
      if (w.x < -40 || w.x > W + 40) { walkers.splice(i, 1); continue; }
      people.push({ feet: w.feet, x: w.x, img: person(w.look).walk[Math.floor(w.d / 7) % 4], sx: 0, flip: w.dir < 0, lift: .3, brolly: w.brolly });
    }
    people.sort((p, q) => p.feet - q.feet).forEach(drawPerson);

    // boda bodas, on the far lane, a rider and sometimes a passenger
    if (!still && M.state === 'gone' && !boda.on && now > boda.next) {
      const pick = n => Math.floor(Math.random() * n);
      Object.assign(boda, { on: true, dir: Math.random() < .5 ? 1 : -1, v: 150 + Math.random() * 60, rider: pick(LOOKS.length), pillion: Math.random() < .45 ? pick(LOOKS.length) : -1, col: ['#c8302a', '#2a2a34', '#2a5ab8', '#3a8a4a'][pick(4)] });
      boda.x = boda.dir > 0 ? -60 : W + 60;
    }
    if (boda.on) { boda.x += boda.dir * boda.v * dt; drawBoda(boda, env.dark > .3); if (boda.x < -80 || boda.x > W + 80) { boda.on = false; boda.next = now + 6000 + Math.random() * 10000; } }
    // the crane on Projects street: its trolley creeps along the jib and the load sways on its cable
    if (street.crane) drawCrane(street.crane, t);
    // traffic: a car now and then, when the matatu is not about
    if (!still && M.state === 'gone' && !car.on && now > car.next) { car.on = true; car.dir = Math.random() < .5 ? 1 : -1; car.x = car.dir > 0 ? -CW : W + CW; car.col = CAR_COLOURS[Math.floor(Math.random() * CAR_COLOURS.length)]; car.kind = Math.random() < .45 ? 'wagon' : 'saloon'; car.v = 120 + Math.random() * 60; }
    if (car.x > -CW - 10 && car.x < W + CW + 10 && car.on) {
      car.x += car.dir * car.v * dt; drawCar(car, env.dark > .3, tb > .5 ? b : a, rain > .5);
      if (car.x > W + CW || car.x < -CW) { car.on = false; car.next = now + 7000 + Math.random() * 12000; }
    }

    // the matatu
    if (M.state !== 'gone') {
      if (M.state === 'arriving') { const d = M.target - M.x; M.x += Math.max(Math.min(d, 40 * dt), d * Math.min(1, dt * 2.2)); if (Math.abs(d) < 1) { M.x = M.target; M.state = 'waiting'; const then = M.then; M.then = null; then?.(); } }
      else if (M.state === 'leaving') { M.v = Math.min(320, M.v + 260 * dt); M.x += still ? W : M.v * dt; if (M.x > W + 60) { M.state = 'gone'; const then = M.then; M.then = null; then?.(); } }
      const wetNow = rain > .5, img = bus(tb > .5 ? b : a, wetNow, M.route), bob = M.state === 'waiting' || still ? 0 : Math.round(Math.sin(t * 22) * .6);
      g.drawImage(img, Math.round(M.x), MATATU_FEET - MH + bob);
      if (env.dark > .3) { g.globalAlpha = .25; g.fillStyle = '#b04aff'; g.fillRect(Math.round(M.x) + 10, MATATU_FEET - 2, MW - 20, 3); g.fillStyle = '#fff6c8'; g.globalAlpha = .18; g.beginPath(); g.moveTo(M.x + MW - 2, MATATU_FEET - 24); g.lineTo(M.x + MW + 120, MATATU_FEET - 40); g.lineTo(M.x + MW + 120, MATATU_FEET + 4); g.closePath(); g.fill(); g.globalAlpha = 1; }
    }

    layer('front', a, b, tb, rain);

    // rain, in front of everything
    if (rain > .02) {
      const n = Math.floor(drops.length * rain);
      g.fillStyle = env.dark > .5 ? '#8a9ac8' : '#c8d4e4'; g.globalAlpha = .55;
      for (let i = 0; i < n; i++) {
        const d = drops[i];
        if (!still) { d.y += d.v * dt; d.x -= d.v * dt * .18; if (d.y > d.floor) { if (splashes.length < 80) splashes.push({ x: d.x, y: d.floor, life: .18 }); d.y = -10 - Math.random() * 40; d.x = Math.random() * (W + 60); } }
        g.fillRect(d.x | 0, d.y | 0, 1, d.l); g.fillRect((d.x - 1) | 0, (d.y + d.l) | 0, 1, 1);
      }
      g.globalAlpha = .7;
      for (let i = splashes.length - 1; i >= 0; i--) { const s = splashes[i]; s.life -= dt; if (s.life <= 0) { splashes.splice(i, 1); continue; } g.fillRect((s.x - 1) | 0, s.y | 0, 1, 1); g.fillRect((s.x + 1) | 0, s.y | 0, 1, 1); g.fillRect(s.x | 0, (s.y - 1) | 0, 1, 1); }
      g.globalAlpha = 1;
    }
    // the hover outline on a place
    if (hover && !busy) { const box = hover === 'stop' ? [street.stopX - 22, 200, 48, 96] : hover.box; g.strokeStyle = hover === 'stop' ? '#5fa8ff' : hover.accent; g.setLineDash([3, 3]); g.lineDashOffset = -Math.floor(t * 8); g.strokeRect(box[0] + .5, box[1] + .5, box[2] - 1, box[3] - 1); g.setLineDash([]); }

    // a crossfade from what was on screen (after the clock is changed), and the curtain between streets
    if (now < fadeUntil) { g.globalAlpha = (fadeUntil - now) / 1200; g.drawImage(fade, 0, 0); g.globalAlpha = 1; }
    curtain += Math.sign(curtainTarget - curtain) * Math.min(Math.abs(curtainTarget - curtain), still ? 1 : dt * 2.6);
    if (curtain > 0) { g.globalAlpha = curtain; g.fillStyle = '#05060f'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }

    // the camera follows Cecil, or the matatu while he rides it
    const sw = stage.clientWidth, focus = C.hidden && M.state !== 'gone' ? M.x + DOOR : C.x;
    const camT = Math.max(sw / scale / 2, Math.min(W - sw / scale / 2, focus));
    cam += (camT - cam) * (still ? 1 : Math.min(1, dt * 4));
    view.style.left = Math.round(Math.min(0, Math.max(sw - W * scale, sw / 2 - cam * scale))) + 'px';
    // the panel sits over Cecil
    const r = view.getBoundingClientRect(), sr = stage.getBoundingClientRect(), px = r.left - sr.left + C.x * scale;
    const half = panel.offsetWidth / 2, left = Math.max(half + 16, Math.min(sw - half - 16, px));
    panel.style.setProperty('--panel-x', left + 'px');
    panel.style.setProperty('--tail', Math.max(8, Math.min(92, 50 + (px - left) / (panel.offsetWidth || 1) * 100)) + '%');
    panel.style.setProperty('--panel-bottom', (sr.bottom - r.top - (FEET - 70) * scale) + 'px');
    requestAnimationFrame(frame);
  }
  /** Draw a person lit by the hour: their own colours under the light (a little lifted, as if a lamp were near). */
  function lit(img, sx, sy, sw, sh, lift) {
    ac.clearRect(0, 0, 48, 64); ac.globalCompositeOperation = 'source-over'; ac.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    ac.globalCompositeOperation = 'multiply'; ac.fillStyle = light(lift); ac.fillRect(0, 0, sw, sh);
    ac.globalCompositeOperation = 'destination-in'; ac.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    ac.globalCompositeOperation = 'source-over';
    return actor;
  }
  const tint = (hexc, lift = .2) => { const c = [1, 3, 5].map(i => parseInt(hexc.slice(i, i + 2), 16)), k = light(lift).match(/\d+/g).map(Number); return `rgb(${c.map((v, i) => Math.round(v * k[i] / 255)).join(',')})`; };
  function drawPerson(p) {
    const x = Math.round(p.x);
    g.globalAlpha = .3; g.fillStyle = '#000'; g.fillRect(x - 11, p.feet - 2, 22, 3); g.globalAlpha = 1;
    lit(p.img, p.sx, 0, 48, 64, p.lift);
    g.save(); g.translate(x, p.feet - 64); if (p.flip) g.scale(-1, 1); g.drawImage(actor, 0, 0, 48, 64, -24, 0, 48, 64); g.restore();
    if (p.brolly) {                                                                                  // an umbrella over their head
      g.fillStyle = tint(p.brolly, .25);
      for (let k = -20; k <= 20; k++) { const h = Math.round(9 * Math.sqrt(1 - (k / 21) ** 2)); g.fillRect(x + k, p.feet - 72 - h, 1, h + 2); }
      g.fillStyle = tint('#171a29'); g.fillRect(x - 21, p.feet - 70, 43, 1); g.fillRect(x, p.feet - 70, 1, 22);
    }
  }
  function drawBoda(b, night) {
    const x = Math.round(b.x), y = 326, f = b.dir;
    g.save(); g.translate(x, y); if (f < 0) g.scale(-1, 1);
    const disc = (cx, cy, r, col) => { g.fillStyle = col; for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); g.fillRect(cx - w, cy + j, w * 2 + 1, 1); } };
    // the riders: the top of a person, sitting, legs bent to the pegs
    const seat = (look, dx) => {
      lit(person(look).walk[1], 0, 0, 48, 50, .25); g.drawImage(actor, 0, 0, 48, 50, dx - 24, -79, 48, 50);
      g.fillStyle = tint(BOTTOM(look)); g.fillRect(dx - 6, -31, 18, 7); g.fillRect(dx + 7, -31, 6, 15);
      g.fillStyle = tint(SHOES(look)); g.fillRect(dx + 6, -17, 10, 4);
    };
    if (b.pillion >= 0) seat(b.pillion, -12);
    // the bike: two big wheels, a tank in its colour, a long seat, the fork and a headlight
    [-22, 22].forEach(wx => { disc(wx, -10, 10, tint('#141418')); disc(wx, -10, 4, tint('#8a8e9a')); disc(wx, -10, 1, tint('#2a2a30')); });
    g.fillStyle = tint(b.col); g.fillRect(-12, -28, 30, 10); g.fillRect(10, -34, 12, 8); g.fillRect(-26, -22, 8, 6);
    g.fillStyle = tint('#1e1e24'); g.fillRect(-24, -31, 26, 5); g.fillRect(19, -42, 3, 32); g.fillRect(14, -44, 12, 3);
    g.fillStyle = tint('#c8ccd8'); g.fillRect(-28, -14, 18, 3); g.fillRect(-6, -18, 14, 3);
    seat(b.rider, 4);
    g.fillStyle = night ? '#fff6c8' : tint('#f4ecd0'); g.fillRect(22, -36, 4, 4); g.fillStyle = '#ff3a2a'; g.fillRect(-29, -24, 2, 3);
    if (night) { g.globalAlpha = .14; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(26, -34); g.lineTo(110, -44); g.lineTo(110, -8); g.closePath(); g.fill(); g.globalAlpha = 1; }
    g.restore();
  }
  function drawCrane(c, t) {
    const tx = Math.round(c.x + Math.sin(t * .05) * c.travel), sway = Math.sin(t * .7) * .07 + Math.sin(t * 1.9) * .012;
    const ex = tx + Math.sin(sway) * c.len, ey = c.y + Math.cos(sway) * c.len;
    g.fillStyle = tint('#5a5a62'); g.fillRect(tx - 4, c.y - 6, 9, 5);
    g.fillStyle = tint('#3a3440'); for (let k = 0; k <= c.len; k += 1) g.fillRect(Math.round(tx + (ex - tx) * k / c.len), Math.round(c.y + (ey - c.y) * k / c.len), 1, 1);
    g.fillStyle = tint('#e8b830'); g.fillRect(Math.round(ex) - 2, Math.round(ey), 5, 4);
    g.fillStyle = tint('#a8a098'); g.fillRect(Math.round(ex) - 15, Math.round(ey) + 4, 30, 5); g.fillStyle = tint('#e4dcd4'); g.fillRect(Math.round(ex) - 15, Math.round(ey) + 4, 30, 1);
  }
  function drawCar(c, night, time, wet) {
    const img = carPic(time, wet, c.col, c.kind), x = Math.round(c.x), y = 346;                // wheels on the near lane
    g.globalAlpha = .35; g.fillStyle = '#000'; g.fillRect(x - CW / 2 + 10, y - 3, CW - 20, 4); g.globalAlpha = 1;
    g.save(); g.translate(x, y - CH); if (c.dir < 0) g.scale(-1, 1); g.drawImage(img, -CW / 2, 0);
    if (night) { g.globalAlpha = .16; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(CW / 2 - 4, 60); g.lineTo(CW / 2 + 160, 44); g.lineTo(CW / 2 + 160, CH); g.closePath(); g.fill(); g.globalAlpha = 1; }
    g.restore();
  }


  // first paint: the street now, then everything likely next
  const [a0, b0] = times(); keyframe(street.id, a0, false); if (b0 !== a0) keyframe(street.id, b0, false);
  buildNav(); setStatus(''); queueWarm(); setMode(false);
  if (fromPlace) arrive(street.places.find(p => p.id === fromPlace[1])); else greet();
  await new Promise((resolve, reject) => requestAnimationFrame(now => { try { frame(now); resolve(); } catch (err) { reject(err); } }));
  onProgress(100);
}
