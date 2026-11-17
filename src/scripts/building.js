import { buildings } from '../content/buildings.js';
import { still, R, neon, layer, soundButton, chime, door, step, cecilActor, cecilScale, CECIL } from './pixel.js';
import { drawConstruction } from './construction.js';
import { createFloorView } from './floor-view.js';
import { musoniFloor } from './floors/musoni.js';

// Floors that are first-person rooms, by the `room` name they carry in src/content/buildings.js.
const ROOMS = { musoni: musoniFloor };

export function initBuilding() {
  const root = document.querySelector('.career-building');
  if (!root) return;
  const data = buildings[root.dataset.building];
  const buttons = [...root.querySelectorAll('[data-floor]')];
  const arrivals = [...root.querySelectorAll('.floor-arrival')];
  const world = document.getElementById('elevator-world');
  const windowEl = root.querySelector('.scene-window');
  const canvas = document.getElementById('building-scene');
  const c = canvas.getContext('2d');
  const actor = cecilActor(document.getElementById('building-cecil'));   // the same Cecil as on the street
  const display = document.getElementById('lift-display');
  const status = document.getElementById('lift-status');
  const travel = document.getElementById('travel-message');
  const plaque = document.getElementById('scene-plaque');
  const plaqueName = document.getElementById('plaque-name');
  const dialog = document.getElementById('floor-details');
  const iris = document.getElementById('iris');
  const crew = new Image(); crew.src = '/sprites/cecil-worker.png';
  // The lift scene and its controls: out of reach while the visitor is standing on a floor.
  const liftParts = [windowEl, plaque, root.querySelector('.elevator-controls'), document.getElementById('elevator-conversation')];
  const floorView = createFloorView({ onLeave: leaveRoom });
  c.imageSmoothingEnabled = false;
  let current = null, busy = false, open = 0, x = 181, feet = 233, inCabin = false, walking = false, facingLeft = false;
  let scale = 1, characterScale = 1, serial = 0, raf;
  // While the lift travels, every floor on the way slides past the cabin: the one it left,
  // any it passes, and the one it is reaching.
  let pan = null, sign = null;
  // How long each part of a ride takes, in milliseconds. A ride between neighbouring floors is about
  // 4.5 seconds; each floor passed on the way adds `perExtraFloor`, long enough to see it go by.
  const RIDE = { doors: 480, walk: 850, travel: 1400, perExtraFloor: 900 };
  const floorNumber = floor => floor ? String(data.floors.indexOf(floor) + 1).padStart(2,'0') : 'G';
  soundButton(document.getElementById('snd'));

  function fit() {
    scale = Math.max(windowEl.clientWidth / 480, windowEl.clientHeight / 270);
    world.style.width = 480 * scale + 'px'; world.style.height = 270 * scale + 'px';
    world.style.left = (windowEl.clientWidth - 480 * scale) / 2 + 'px';
    world.style.top = (windowEl.clientHeight - 270 * scale) / 2 + 'px';
    // Render Cecil from the full-detail source sheet, separate from the room raster.
    characterScale = cecilScale(scale * .55);
    render(performance.now());
  }
  new ResizeObserver(fit).observe(windowEl);

  // The plaque above the lift, the panel display and the floor's accent colour.
  // `floor` is the floor to show: where the lift is, or the one it is passing.
  function plate(floor = current) {
    const number = floorNumber(floor);
    document.getElementById('plaque-number').textContent = number;
    plaqueName.replaceChildren();
    if (floor?.logo) {
      const logo = new Image(); logo.src = floor.logo; logo.alt = floor.name; logo.width = 286; logo.height = 53;
      plaqueName.append(logo);
    } else plaqueName.textContent = floor?.name || data.title + ' / Lobby';
    plaque.style.setProperty('--plaque-bg',floor?.brand?.navy || '#111a31');
    root.style.setProperty('--floor-accent',floor?.color || data.accent);
    return number;
  }
  function updateArrival({focus=false, updateUrl=false}={}) {
    const id = current?.id || 'lobby';
    root.setAttribute('aria-busy','false'); busy = false;
    buttons.forEach(button => {
      button.disabled = false;
      button.classList.remove('is-pending');
      button.setAttribute('aria-pressed', String(button.dataset.floor === id));
    });
    arrivals.forEach(panel => panel.hidden = (panel.dataset.arrival || 'lobby') !== id);
    travel.hidden = true;
    const number = display.textContent = plate();
    status.textContent = current ? 'Arrived at floor ' + number + ': ' + current.name + '.' : 'Ground floor. Choose an elevator button.';
    canvas.setAttribute('aria-label', current?.construction ? 'A pixel-art floor under construction, with scaffolding and mini Cecils wearing hard hats. The elevator opens onto the work site.' : current ? 'Inside the ' + current.name + ' floor: a pixel-art workspace overlooking Nairobi, with an elevator, desks and monitors.' : 'A pixel-art lobby at night, with a central elevator, tiled floor, plants and windows overlooking Nairobi.');
    if (updateUrl) history.pushState(null,'',current ? '#' + current.id : location.pathname);
    if (focus) arrivals.find(panel => !panel.hidden).querySelector('h2').focus({preventScroll:true});
    render(performance.now());
  }
  function tween(ms, change, token) {
    if (still) { change(1); render(0); return Promise.resolve(token === serial); }
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        if (token !== serial) { resolve(false); return; }
        const p = Math.min(1,(now - start) / ms);
        change(p < .5 ? 2*p*p : 1 - (-2*p+2)**2/2);
        if (p === 1) resolve(true); else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  async function ride(id) {
    const target = data.floors.find(f => f.id === id) || null;
    if (busy || target === current) return;
    const token = ++serial;
    busy = true; root.setAttribute('aria-busy','true');
    buttons.forEach(button => { button.disabled = true; button.classList.toggle('is-pending',button.dataset.floor === id); });
    arrivals.forEach(panel => panel.hidden = true);
    travel.hidden = false;
    const message = 'Going to ' + (target ? 'floor ' + floorNumber(target) + ': ' + target.name : 'the lobby') + '…';
    travel.textContent = status.textContent = message;
    dialog.close(); door();
    const wasOpen = open;
    if (!await tween(RIDE.doors * (1 - wasOpen),p => { open = wasOpen + (1-wasOpen)*p; },token)) return;
    const fromX = x;
    walking = true; facingLeft = false;
    if (!await tween(RIDE.walk,p => { x = fromX + (240-fromX)*p; feet = 233 - 17*p; },token)) return;
    walking = false; inCabin = true;
    if (!await tween(RIDE.doors,p => { open = 1-p; },token)) return;
    // Travel: paint every floor from here to there (the lobby is index -1), then slide them past in order.
    const from = current, a = data.floors.indexOf(from), b = data.floors.indexOf(target), up = b > a;
    const stops = [];
    for (let i = a; i !== b + (up ? 1 : -1); i += up ? 1 : -1) stops.push(data.floors[i] || null);
    const last = stops.length - 1;
    display.textContent = (up ? '↑ ' : '↓ ') + floorNumber(target);
    sign = floorNumber(from);
    if (!still) {
      const t = performance.now() / 1000;
      const rooms = stops.map(floor => {
        current = floor; paintRoom(t);
        const [room, roomCtx] = layer(480,270); roomCtx.drawImage(canvas,0,0);
        return room;
      });
      pan = { dir: up ? 1 : -1, p: 0, rooms, at: 0 };
    }
    current = target;
    if (!await tween(RIDE.travel + (last-1)*RIDE.perExtraFloor,p => {
      if (!pan) return;
      pan.p = p;
      // Which floor is level with the cabin now: the sign, the plaque and the message follow it.
      const at = Math.min(last,Math.floor(p*last + .4));
      if (at === pan.at) return;
      pan.at = at; sign = floorNumber(stops[at]); plate(stops[at]);
      travel.textContent = at < last ? 'Passing ' + (stops[at] ? 'floor ' + floorNumber(stops[at]) + ': ' + stops[at].name : 'the lobby') + '…' : message;
    },token)) return;
    pan = null; sign = null; display.textContent = plate();
    if (!await tween(RIDE.doors,p => { open = p; },token)) return;
    chime();
    if (target?.room) { enterRoom(target); return; }
    inCabin = false; walking = true; facingLeft = true;
    if (!await tween(RIDE.walk,p => { x = 240 - 59*p; feet = 216 + 17*p; },token)) return;
    walking = false;
    updateArrival({focus:true,updateUrl:true});
  }
  // A floor with a room. The ride is watched from outside; when the doors open the iris closes on
  // them and opens again on the floor, seen through the visitor's eyes. Cecil is already there,
  // dressed for the project. In the URL, #musoni is the floor and #musoni/lift is beside its lift.
  function showRoom(floor) {
    liftParts.forEach(part => part.inert = true);
    root.classList.add('in-room');
    floorView.open(ROOMS[floor.room], { number: floorNumber(floor), name: floor.name, logo: floor.logo, navy: floor.brand?.navy });
  }
  function hideRoom() {
    if (!floorView?.isOpen()) return;
    floorView.close(); root.classList.remove('in-room');
    liftParts.forEach(part => part.inert = false);
  }
  function enterRoom(floor) {
    const token = ++serial;
    busy = true; root.setAttribute('aria-busy','true');
    buttons.forEach(button => button.disabled = true);
    travel.textContent = 'Floor ' + floorNumber(floor) + '. ' + floor.name + '.';
    if (location.hash !== '#' + floor.id) history.pushState(null,'','#' + floor.id);
    iris?.classList.remove('opening'); iris?.classList.add('closing');
    setTimeout(() => {
      if (token !== serial) return;
      // Behind the room, leave the lift scene as it will be found again: doors open, Cecil beside them.
      current = floor; x = 181; feet = 233; inCabin = walking = false; open = 1; pan = null; sign = null;
      updateArrival();
      status.textContent = 'Floor ' + floorNumber(floor) + ': ' + floor.name + '. You are standing on the floor, and Cecil is in front of you.';
      showRoom(floor);
      if (iris) { iris.classList.remove('closing'); void iris.offsetWidth; iris.classList.add('opening'); }
    }, still ? 0 : 650);
  }
  function leaveRoom() {
    hideRoom();
    history.replaceState(null,'','#' + current.id + '/lift');
    updateArrival({focus:true});
  }
  root.querySelectorAll('[data-enter]').forEach(button => button.addEventListener('click',() => {
    if (!busy && button.dataset.enter === current?.id) enterRoom(current);
  }));
  buttons.forEach((button,index) => {
    button.addEventListener('click',() => ride(button.dataset.floor));
    button.addEventListener('keydown',event => {
      if (!['ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : Math.max(0,Math.min(buttons.length-1,index+(event.key === 'ArrowDown' ? 1 : -1)));
      buttons[next].focus();
    });
  });
  root.querySelectorAll('[data-about]').forEach(button => button.addEventListener('click',() => {
    if (busy || button.dataset.about !== current?.id) return;
    root.querySelectorAll('[data-story]').forEach(story => story.hidden = story.dataset.story !== current.id);
    document.getElementById('details-title').textContent = current.name + ' · Floor ' + floorNumber(current);
    dialog.showModal();
  }));
  document.getElementById('details-close').addEventListener('click',() => dialog.close());
  function restoreFromUrl() {
    serial++;
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
    const [id, where] = hash.split('/');
    const wanted = data.floors.find(f => f.id === id) || null;
    current = wanted;
    x = 181; feet = 233; inCabin = walking = false; open = current ? 1 : 0; pan = null; sign = null;
    iris?.classList.remove('closing');
    dialog.close(); updateArrival();
    // A link to a floor with a room opens on the floor itself.
    if (wanted?.room && where !== 'lift') showRoom(wanted); else hideRoom();
  }
  addEventListener('popstate',restoreFromUrl);
  addEventListener('hashchange',restoreFromUrl);
  // Back to the street: land at the door of the floor you were on (17 Nov 2026: leaving GikTek used to
  // put you at Podii's door). The floor is the first part of the address's hash.
  document.querySelectorAll('a[href*="?from="]').forEach(link => link.addEventListener('click', () => {
    let id = ''; try { id = decodeURIComponent(location.hash.slice(1)).split('/')[0]; } catch {}
    const home = link.getAttribute('href').split('&at=')[0];
    link.setAttribute('href', id ? home + '&at=' + encodeURIComponent(id) : home);
  }));
  // Coming back with the browser's Back button can restore this page mid-ride. Start again in the lobby.
  addEventListener('pageshow',event => {
    if (!event.persisted) return;
    iris?.classList.remove('closing');
    restoreFromUrl(); cancelAnimationFrame(raf); frame(performance.now());
  });

  function windowView(wx,wy,w,h) {
    R(c,'#627184',wx-3,wy-3,w+6,h+6); R(c,'#080f29',wx,wy,w,h);
    for (let y=0;y<h;y+=2) R(c,y<h*.4?'#172648':'#252443',wx,wy+y,w,2);
    R(c,'#f0e7be',wx+w-20,wy+12,8,8); R(c,'#172648',wx+w-23,wy+10,7,7);
    for (let i=0;i<9;i++) {
      const bh=16+(i*17+wx)%44, bx=wx+i*(w/9);
      R(c,'#10172f',bx,wy+h-bh,w/9-1,bh);
      for(let y=wy+h-bh+4;y<wy+h-2;y+=8)for(let xx=bx+3;xx<bx+w/9-2;xx+=5)if((i+y+xx)%4<2)R(c,'#d0b880',xx,y,2,3);
    }
    R(c,'#52647a',wx+w/2-1,wy,2,h);R(c,'#52647a',wx,wy+h*.55,w,2);
    R(c,'#87939c',wx-5,wy+h,w+10,3);
  }
  function plant(px,py) {
    R(c,'#b19479',px-7,py-12,14,12);R(c,'#665361',px-6,py-2,12,3);
    R(c,'#315f52',px-2,py-38,4,26);R(c,'#4e8568',px-11,py-32,10,5);R(c,'#64916e',px+1,py-29,11,5);R(c,'#477a5b',px-8,py-42,7,12);R(c,'#729d73',px+2,py-44,6,13);
  }
  function paintRoom(t) {
    const accent = current?.color || data.accent;
    const navy = current?.brand?.navy || '#19223d';
    R(c,navy,0,0,480,215);
    for(let y=10;y<215;y+=21) { R(c,'#ffffff05',0,y,480,1); for(let xx=(y%2)*15;xx<480;xx+=45)R(c,'#00000018',xx,y,1,21); }
    R(c,'#0a1229',0,0,480,25);R(c,'#4a526c',0,25,480,3);R(c,accent,0,29,480,1);
    R(c,'#10192e',0,191,480,24);R(c,'#576278',0,191,480,2);R(c,accent,0,194,480,1);
    windowView(28,54,122,112);windowView(330,54,122,112);
    // Warm ceiling lights and their broad, stepped pools on the wall.
    for(const lx of [80,240,400]) {
      for(let i=0;i<7;i++) { c.globalAlpha=.025;R(c,'#fff0c4',lx-12-i*5,34+i*8,24+i*10,12); }
      c.globalAlpha=1;R(c,'#060c1e',lx-17,30,34,5);R(c,'#f5e1af',lx-13,34,26,2);
    }
    // Floor tiles converge toward the lift and keep the room's depth.
    R(c,'#29354b',0,215,480,55);
    for(const y of [216,225,242,267]) { R(c,'#536075',0,y,480,1);R(c,'#17233a',0,y+1,480,1); }
    c.strokeStyle='#17233a';c.lineWidth=1;
    for(let i=-8;i<=8;i++){c.beginPath();c.moveTo(240+i*20,215);c.lineTo(240+i*48,270);c.stroke();}
    if (current?.construction && crew.naturalWidth) {
      drawConstruction(c,crew,20,64,440,151,t,{workerScale:.6});
      for(let xx=22;xx<460;xx+=8)R(c,xx%16?'#d1ad55':'#1b2434',xx,214,8,3);
      R(c,'#9e795a',311,228,54,7);R(c,'#d0aa6c',313,226,48,2);
    } else if (current) {
      // Occupied floors have workstations; the lobby has a reception desk and seating.
      for(const dx of [54,332]) {
        R(c,'#9b7e69',dx,184,98,5);R(c,'#39445a',dx+6,189,4,25);R(c,'#39445a',dx+88,189,4,25);
        R(c,'#0a1124',dx+29,151,42,29);R(c,current.brand?.surface || '#c4d6dc',dx+32,154,36,22);
        R(c,current.brand?.navy || '#263b50',dx+35,158,29,3);R(c,accent,dx+35,165,18,2);R(c,'#52647b',dx+48,180,3,4);
        R(c,'#192a3d',dx+34,193,30,18);R(c,'#53647a',dx+44,211,10,4);
      }
      if(current.id === 'musoni')for(const dx of [63,79]){R(c,'#0a1124',dx,165,12,19);R(c,'#fff',dx+2,167,8,14);R(c,accent,dx+3,177,6,3);}
      if(current.category === 'Education') { R(c,'#a58962',46,108,108,37);R(c,'#294f47',49,111,102,31);for(let i=0;i<4;i++)R(c,'#c3cfb2',57,118+i*5,55+i*9,1); }
    } else {
      R(c,'#19263d',38,180,114,30);R(c,'#b59477',34,177,122,6);R(c,'#728095',38,207,114,4);R(c,'#d4be8f',47,184,2,18);
      R(c,'#0c162c',77,154,35,22);R(c,'#8a9da9',80,157,29,16);R(c,accent,83,160,19,2);R(c,'#475c72',91,176,5,2);
      R(c,'#626676',332,187,102,18);R(c,'#3c4b63',337,179,92,13);R(c,'#b39b81',332,201,102,3);R(c,'#131f33',338,204,4,10);R(c,'#131f33',426,204,4,10);
    }
    plant(167,216);plant(310,216);
  }
  function paintLift() {
    const accent = current?.color || data.accent;
    // Central lift: doorstep, bright frame, recessed cabin, split steel doors and call panel.
    R(c,'#101a30',191,222,99,14); R(c,accent,191,222,99,1);
    R(c,'#0a1024',193,74,94,143);R(c,'#8a929c',196,76,88,140);R(c,'#b4b7b8',198,78,2,137);
    R(c,'#333e53',201,81,78,134);R(c,'#19243a',204,85,72,130);R(c,'#a28e6b',205,87,70,2);
    for(const dx of [209,241,271])R(c,'#344258',dx,91,2,112);
    R(c,'#7c756a',205,201,70,2);R(c,'#29374c',205,204,70,10);
    const doorWidth=Math.round(36*(1-open));
    if(doorWidth){
      R(c,'#59687b',204,85,doorWidth,129);R(c,'#748194',205,85,Math.max(0,doorWidth-3),129);R(c,'#8d96a3',206,87,1,124);
      R(c,'#59687b',276-doorWidth,85,doorWidth,129);R(c,'#748194',277-doorWidth,85,Math.max(0,doorWidth-3),129);
      for(let dy=88;dy<212;dy+=7){R(c,'#ffffff0a',205,dy,Math.max(0,doorWidth-3),1);R(c,'#ffffff0a',277-doorWidth,dy,Math.max(0,doorWidth-3),1);}
    }
    R(c,'#d2c4a6',200,215,80,3);R(c,'#788396',202,218,76,1);
    R(c,'#080e20',223,63,34,9);neon(c,sign ?? floorNumber(current),233,65,1,accent);
    R(c,'#8b919b',290,137,7,22);R(c,'#0b1527',292,140,3,7);R(c,busy?'#ffd27a':accent,293,142,1,3);R(c,'#26364d',292,150,3,6);
  }
  let stepAt = 0;
  function render(now) {
    const t = still ? 0 : now / 1000;
    if (pan) {
      // Going up, each floor drops away below and the next one comes down from above.
      const offset = Math.round(pan.p * (pan.rooms.length - 1) * 270);
      const top = k => (offset - k * 270) * pan.dir;
      pan.rooms.forEach((room,k) => { if (top(k) > -270 && top(k) < 270) c.drawImage(room,0,top(k)); });
      // The slab between each floor and the next one on the way, drawn over both.
      for (let k = 0; k < pan.rooms.length - 1; k++) {
        const seam = pan.dir > 0 ? top(k) : top(k) + 270;
        R(c,'#050a18',0,seam-5,480,10); R(c,'#3d4a63',0,seam-5,480,1); R(c,'#3d4a63',0,seam+4,480,1);
      }
    } else paintRoom(t);
    paintLift();
    if (!inCabin) { c.globalAlpha=.22;R(c,'#020a19',x-12,feet-1,24,3);c.globalAlpha=1; }
    // Cecil: side-on while he walks, facing us while he waits, and behind the doors while he rides.
    const walkFrame = Math.floor(t*6)%4;
    actor.draw(walking ? 3+walkFrame : (!still && t%6<.12 ? 1 : 0), walking && facingLeft);
    if (walking && !still && now > stepAt) { stepAt = now + 300; step(); }
    const cx = inCabin ? 240 : x, cy = inCabin ? 216 : feet;
    actor.place(cx*scale, cy*scale, characterScale);
    const widthInScene = CECIL.w * characterScale / scale;
    actor.clip(inCabin ? Math.max(0, .5 - 36*open/widthInScene) : 0);
  }
  function frame(now) { render(now); if(!still && !document.hidden)raf=requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange',() => { cancelAnimationFrame(raf); if(!document.hidden)frame(performance.now()); });
  restoreFromUrl();fit();frame(0);
  Promise.allSettled([crew.decode(),actor.img.decode()]).then(() => render(performance.now()));
}
