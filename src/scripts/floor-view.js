// A floor as a walk. The room is much wider than the screen; Cecil walks the visitor along the wall
// one stop at a time and talks about the project, and the wall at each stop shows what he is talking
// about. It is played like a game: arrow keys or the two arrow buttons walk, Space or a tap gives
// his next line, and the A button does what the stop offers (look closer at a real screen, or pick
// up the thing that works). Each floor's room and words live in src/scripts/floors/<name>.js.
// A room with a `board` is one screen instead: Cecil stands at a whiteboard, and moving to the next
// stop means he rubs the board clean and writes the next one (stop.board: SVG marks in board units).
// Rules it keeps: the view only moves when the visitor asks; one line from him at a time; no scores
// or timers; and every control is a real button, so the keyboard and screen readers reach it.
import { still, cecilActor, cecilScale, key, step as footstep } from './pixel.js';

const H = 270;
const WALK_MS = 700;        // one stop to the next
const ERASE_MS = 520;       // rubbing the board clean

export function createFloorView({ onLeave }) {
  const view = document.getElementById('floor-view');
  if (!view) return null;
  const el = id => document.getElementById(id);
  const make = (tag, className) => { const node = document.createElement(tag); if (className) node.className = className; return node; };
  const windowEl = el('floor-window'), world = el('floor-world'), canvas = el('floor-scene'), thingsEl = el('floor-things');
  const pips = el('floor-pips'), says = el('floor-says'), line = el('floor-line'), page = el('floor-page'), actions = el('floor-actions');
  const prev = el('floor-prev'), next = el('floor-next'), aButton = el('floor-a'), aLabel = el('floor-a-label');
  const viewer = el('floor-viewer'), picture = el('floor-viewer-image');
  const closeup = el('floor-closeup'), holder = el('floor-closeup-body'), done = el('floor-closeup-done');
  const c = canvas.getContext('2d');
  const actors = {};
  let floor = null, actor = null, scale = 1, narrow = false;
  let index = 0, lineAt = 0;          // which stop, and which of its lines
  let camera = 0, cecilX = 0;         // scene pixels: what the view is centred on, and where he stands
  let walking = false, facingLeft = false, talkUntil = 0, raf = 0, serial = 0;
  let looking = null;                 // { shots, index, from } while a real screen is held up close
  let live = null, using = false;     // the thing that works, and whether it is in the visitor's hands
  let boardEl = null, boardInk = null, eraser = null, writing = false, writeTimer = 0, running = [];

  const stand = i => floor.at(i) + (narrow ? floor.cecil.narrow : floor.cecil.wide);
  const cecilSize = () => (narrow && floor.cecil.narrowSize) || floor.cecil.size;
  const busy = () => walking || !!looking || using;

  // ---------- layout ----------
  // A wide window is covered by the room, as in the lobby. A window too narrow to show a whole stop
  // that way (a phone held upright) shows `floor.narrowWidth` scene pixels instead, with the room
  // above and Cecil's words and the buttons underneath. Those need about 300 px below the room, so
  // on a window that is narrow but not tall (a tablet, half a laptop screen) the room is drawn
  // smaller and shows more of the wall to either side. A short phone gets a tighter box as well.
  function layout() {
    if (!floor) return;
    const w = windowEl.clientWidth, h = windowEl.clientHeight;
    const cover = Math.max(w / 480, h / H);
    const wasNarrow = narrow; narrow = w / cover < 300;
    const tight = narrow && h < 620;
    // a board room is one screen: fit its height, as long as Cecil, the board and the handset stay in view
    const fit = floor.board ? Math.max(w / floor.width, Math.min(h / H, w / floor.board.core)) : cover;
    scale = narrow ? Math.max(.9, Math.min(w / floor.narrowWidth, (h - 58 - (tight ? 262 : 300)) / H)) : fit;
    if (narrow !== wasNarrow && !walking) cecilX = stand(index);
    const top = narrow ? 58 : Math.round((h - H * scale) / 2);
    world.style.width = floor.width * scale + 'px'; world.style.height = H * scale + 'px';
    world.style.top = top + 'px';
    view.classList.toggle('is-narrow', narrow);
    view.classList.toggle('is-tight', tight);
    view.style.setProperty('--scale', scale);
    view.style.setProperty('--room-top', top + 'px');
    view.style.setProperty('--room-bottom', Math.round(top + H * scale) + 'px');
    if (live) live.slot.style.setProperty('--fit', live.rect[2] * scale / 300);
    const left = aim();
    // his words sit beside him: just right of Cecil in a board room, under the exhibit on a walk
    const saysLeft = floor.board ? left + (stand(index) + 38) * scale : w / 2 - 104 * scale;
    view.style.setProperty('--says-left', Math.max(24, Math.round(saysLeft)) + 'px');
  }
  /** Point the view at `camera` and put Cecil at `cecilX`. */
  function aim() {
    const w = windowEl.clientWidth;
    const left = Math.round(Math.min(0, Math.max(w - floor.width * scale, w / 2 - camera * scale)));
    world.style.left = left + 'px';
    actor.place(cecilX * scale, ((narrow && floor.cecil.narrowFeet) || floor.cecil.feet) * scale, cecilScale(scale * cecilSize()));
    return left;
  }
  new ResizeObserver(layout).observe(windowEl);

  // ---------- Cecil: which frame of his sheet to show ----------
  function tick(now) {
    if (!floor) return;
    const t = now / 1000;
    let frame = 0, flip = false;
    if (walking) { frame = 3 + Math.floor(t * 8) % 4; flip = facingLeft; }
    else if (looking || using || writing) frame = 7;
    else if (!still && now < talkUntil) frame = Math.floor(t * 7) % 2 ? 2 : 0;
    else if (!still) frame = t % 6 < .12 ? 1 : 0;
    actor.draw(frame, flip);
    if (!still && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function restart() { cancelAnimationFrame(raf); if (floor) tick(performance.now()); }
  document.addEventListener('visibilitychange', restart);

  // ---------- his words ----------
  function say(text, buttons = [], counter = '') {
    line.textContent = text;
    page.textContent = counter;
    actions.replaceChildren(...buttons.map(({ label, run }) => {
      const b = make('button'); b.type = 'button'; b.textContent = label;
      b.addEventListener('click', event => { event.stopPropagation(); run(); });
      return b;
    }));
    actions.hidden = !buttons.length;
    talkUntil = performance.now() + 1200;
    restart();
  }
  /** Show the current stop's current line, and set the controls to match. */
  function show() {
    const stop = floor.stops[index], last = floor.stops.length - 1;
    const more = lineAt < stop.lines.length - 1;
    say(stop.lines[lineAt], [], `${lineAt + 1} / ${stop.lines.length}`);
    says.classList.toggle('has-more', more || index < last);
    says.setAttribute('aria-label', `Cecil, at stop ${index + 1} of ${last + 1}: ${stop.title}`);
    prev.disabled = index === 0; next.disabled = index === last;
    const offer = stop.live ? stop.live.pick : stop.shots ? 'Look closer' : '';
    aButton.hidden = !offer; aLabel.textContent = offer; aLabel.hidden = !offer;
    [...pips.children].forEach((pip, i) => {
      pip.classList.toggle('is-here', i === index); pip.classList.toggle('is-seen', i < index);
      if (i === index) pip.setAttribute('aria-current', 'step'); else pip.removeAttribute('aria-current');
    });
  }
  /** Space, Enter or a tap on his words: the next line, and after the last one, the next stop. */
  function advance() {
    if (writing) { finishBoard(); return; }
    if (busy()) return;
    const stop = floor.stops[index];
    if (lineAt < stop.lines.length - 1) { key(); lineAt++; show(); }
    else walkTo(index + 1);
  }

  // ---------- walking ----------
  function walkTo(target) {
    if (floor.board) { changeBoard(target); return; }
    if (busy() || target < 0 || target >= floor.stops.length || target === index) return;
    const token = ++serial, fromCamera = camera, fromCecil = cecilX, toCamera = floor.at(target), started = performance.now();
    const duration = still ? 0 : WALK_MS + Math.min(3, Math.abs(target - index) - 1) * 180;
    index = target; lineAt = 0;
    const toCecil = stand(index);
    facingLeft = toCecil < fromCecil; walking = true;
    view.classList.add('is-walking'); restart();
    let lastStep = 0;
    const move = now => {
      if (token !== serial || !floor) return;
      const p = duration ? Math.min(1, (now - started) / duration) : 1, e = p < .5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p);
      camera = fromCamera + (toCamera - fromCamera) * e; cecilX = fromCecil + (toCecil - fromCecil) * e;
      aim();
      if (now - lastStep > 190) { lastStep = now; footstep(); }
      if (p < 1) { requestAnimationFrame(move); return; }
      walking = false; view.classList.remove('is-walking');
      show();
    };
    move(started);
  }

  // ---------- the whiteboard: rub it clean, write the next board ----------
  /** Put stop i's marks on the board, and pin up its real screens. Written mark by mark if `animate`. */
  function renderBoard(i, animate) {
    const stop = floor.stops[i], { svg, marks } = stop.board, [bw, bh] = floor.board.size;
    boardInk.innerHTML = `<svg viewBox="0 0 ${bw} ${bh}" aria-hidden="true">${svg}</svg>`;
    (stop.shots || []).forEach((shot, n) => {
      if (!shot.pin) return;
      const [x, y, w, h] = shot.pin, b = make('button', 'floor-pin'); b.type = 'button';
      b.setAttribute('aria-label', shot.label + ', pinned to the board');
      Object.assign(b.style, { left: x / bw * 100 + '%', top: y / bh * 100 + '%', width: w / bw * 100 + '%', height: h / bh * 100 + '%' });
      b.style.setProperty('--i', marks + n); b.style.setProperty('--tilt', (n % 2 ? 2 : -2) + 'deg');
      const img = new Image(); img.src = shot.src; img.alt = ''; img.draggable = false; b.append(img);
      b.addEventListener('click', () => { finishBoard(); look(stop.shots, n, b); });
      boardInk.append(b);
    });
    boardEl.setAttribute('aria-label', `The whiteboard, board ${i + 1} of ${floor.stops.length}: ${stop.title}`);
    boardEl.style.setProperty('--gap', Math.min(70, 1000 / (marks + 2)) + 'ms');
    boardEl.classList.toggle('is-writing', !!animate);
    return marks * Math.min(70, 1000 / (marks + 2)) + 300;
  }
  function stopRunning() { running.forEach(a => a.cancel()); running = []; clearTimeout(writeTimer); }
  /** Show the whole of the current board now: a key pressed while he writes. */
  function finishBoard() {
    if (!writing) return;
    serial++; stopRunning();
    renderBoard(index, false); boardInk.style.opacity = '';
    writing = false; view.classList.remove('is-writing'); restart();
  }
  function changeBoard(target) {
    if (looking || using || target < 0 || target >= floor.stops.length || target === index) return;
    const token = ++serial; stopRunning();
    index = target; lineAt = 0;
    key(); show();
    if (still) { renderBoard(index, false); return; }
    writing = true; view.classList.add('is-writing'); restart();
    // the eraser goes across the board three times, and the old board fades with it
    const rows = ['4%', '38%', '72%'], frames = [];
    rows.forEach((top, n) => { const [a, b] = n % 2 ? ['94%', '-4%'] : ['-4%', '94%']; frames.push({ left: a, top }, { left: b, top }); });
    eraser.hidden = false;
    running = [
      eraser.animate(frames, { duration: ERASE_MS, easing: 'linear' }),
      boardInk.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ERASE_MS, easing: 'steps(4, end)', fill: 'forwards' }),
    ];
    running[0].onfinish = () => {
      if (token !== serial) return;
      eraser.hidden = true; running.forEach(a => a.cancel()); running = [];
      const takes = renderBoard(index, true);
      writeTimer = setTimeout(() => { if (token === serial) finishBoard(); }, takes);
    };
  }

  // ---------- a real screen held up close ----------
  function look(shots, at, from) {
    if (walking || using) return;
    key();
    const shot = shots[at];
    looking = { shots, index: at, from: from || looking?.from };
    picture.src = shot.src; picture.alt = shot.alt;
    viewer.setAttribute('aria-label', shot.label);
    viewer.hidden = false; view.classList.add('is-using');
    const more = shots.length > 1 ? [{ label: 'Next screen', run: () => turn(1) }] : [];
    say(shot.line, [...more, { label: 'Step back', run: stepBack }], `${at + 1} / ${shots.length}`);
    says.classList.remove('has-more');
  }
  function turn(by) {
    if (!looking) return;
    const { shots, index: at } = looking;
    look(shots, (at + by + shots.length) % shots.length);
  }
  function stepBack() {
    if (!looking) return;
    const from = looking.from; looking = null;
    viewer.hidden = true; picture.removeAttribute('src'); view.classList.remove('is-using');
    show();
    (from || aButton).focus({ preventScroll: true });
  }
  picture.addEventListener('click', () => turn(1));

  // ---------- the thing that works: off the wall, into the visitor's hands ----------
  function pickUp() {
    if (busy() || !live) return;
    key();
    using = true; view.classList.add('is-using');
    holder.replaceChildren(live.node, Object.assign(make('p', 'closeup-note'), { textContent: live.thing.note }));
    closeup.setAttribute('aria-label', live.thing.title);
    done.textContent = live.thing.done;
    closeup.hidden = false;
    say(live.hint); says.classList.remove('has-more');
    live.node.querySelector('[tabindex]')?.focus({ preventScroll: true });
  }
  function putDown() {
    if (!using) return;
    using = false; view.classList.remove('is-using');
    live.slot.firstElementChild.append(live.node);
    closeup.hidden = true; holder.replaceChildren();
    show();
    aButton.focus({ preventScroll: true });
  }
  /** The A button: whatever this stop offers. */
  function act() {
    const stop = floor.stops[index];
    if (stop.live) pickUp(); else if (stop.shots) { finishBoard(); look(stop.shots, 0, aButton); }
  }

  // ---------- controls: buttons, keys, swipes ----------
  prev.addEventListener('click', () => walkTo(index - 1));
  next.addEventListener('click', () => walkTo(index + 1));
  aButton.addEventListener('click', act);
  says.addEventListener('click', advance);
  done.addEventListener('click', putDown);
  el('floor-leave').addEventListener('click', () => onLeave());
  document.addEventListener('keydown', event => {
    if (!floor || event.altKey || event.ctrlKey || event.metaKey) return;
    if (using) { if (event.key === 'Escape') putDown(); return; }       // every other key belongs to the handset
    if (looking) {
      if (event.key === 'Escape') stepBack();
      else if (event.key === 'ArrowRight') turn(1);
      else if (event.key === 'ArrowLeft') turn(-1);
      return;
    }
    const onControl = event.target.closest?.('button, a, input, textarea, select');
    if (event.key === 'ArrowRight') { event.preventDefault(); walkTo(index + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); walkTo(index - 1); }
    else if ((event.key === ' ' || event.key === 'Enter') && !onControl) { event.preventDefault(); advance(); }
    else if (event.key.toLowerCase() === 'a' && !onControl) act();
  });
  let touchX = null;
  windowEl.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, { passive: true });
  windowEl.addEventListener('touchend', event => {
    if (touchX === null) return;
    const dx = event.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 48) walkTo(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /** A button laid over something in the room. `rect` is [x, y, w, h] in scene pixels. */
  function place(node, [x, y, w, h]) {
    node.style.left = x / floor.width * 100 + '%'; node.style.top = y / H * 100 + '%';
    node.style.width = w / floor.width * 100 + '%'; node.style.height = h / H * 100 + '%';
  }
  function thing(id, label, rect, run, className = '') {
    const b = make('button', 'floor-thing ' + className); b.type = 'button';
    b.dataset.thing = id; b.setAttribute('aria-label', label);
    place(b, rect);
    b.addEventListener('click', () => run(b));
    return b;
  }
  function reset() {
    serial++; walking = false; looking = null; using = false; writing = false;
    running.forEach(a => a.cancel()); running = []; clearTimeout(writeTimer);
    viewer.hidden = true; closeup.hidden = true; holder.replaceChildren();
    view.classList.remove('is-using', 'is-walking', 'is-writing');
  }

  return {
    isOpen: () => !!floor,
    /** Show a room, starting at its first stop. */
    open(room) {
      if (floor === room) return;
      floor = room; reset();
      index = 0; lineAt = 0;
      actor = actors[room.sheet] ||= cecilActor(el('floor-cecil'), room.sheet);
      actor.img.decode().then(restart, () => {});
      canvas.width = room.width; canvas.height = H; c.imageSmoothingEnabled = false;
      room.paint(c, room.width);
      canvas.setAttribute('aria-label', room.sceneLabel);
      // one pip per stop, like stages on a level map
      pips.replaceChildren(...room.stops.map((stop, i) => {
        const pip = make('button', 'floor-pip'); pip.type = 'button';
        pip.setAttribute('aria-label', `Stop ${i + 1}: ${stop.title}`);
        pip.addEventListener('click', () => walkTo(i));
        return pip;
      }));
      // on the wall: the real screens, each a button, and the thing that works
      const nodes = []; live = null;
      room.stops.forEach((stop, i) => {
        (stop.shots || []).forEach((shot, n) => {
          if (!shot.rect) return;
          const b = thing(shot.id, shot.label, shot.rect, from => { if (i === index) look(stop.shots, n, from); else walkTo(i); }, 'floor-thing--screen');
          const img = new Image(); img.src = shot.src; img.alt = ''; img.draggable = false;
          b.append(img); nodes.push(b);
        });
        if (stop.live) {
          const slot = make('div', 'floor-slot'); place(slot, stop.live.rect);
          const shrunk = make('div', 'floor-slot__fit'); shrunk.inert = true; slot.append(shrunk);
          const node = make('div', 'floor-live'); shrunk.append(node);
          live = { node, slot, rect: stop.live.rect, thing: stop.live, hint: '' };
          thingsEl.replaceChildren(slot);            // it must be in the page before it is wired
          stop.live.mount(node, text => { live.hint = text; if (using) say(text); });
          nodes.push(slot, thing(stop.live.id, stop.live.label, stop.live.rect, () => { if (i === index) pickUp(); else walkTo(i); }));
        }
      });
      // the whiteboard, if the room has one: the marks, the pinned screens and the eraser
      boardEl = boardInk = eraser = null;
      if (room.board) {
        boardEl = make('div', 'floor-board'); boardEl.setAttribute('role', 'img'); place(boardEl, room.board.rect);
        boardInk = make('div', 'floor-board__ink'); eraser = make('div', 'floor-board__eraser'); eraser.hidden = true;
        boardEl.append(boardInk, eraser); nodes.push(boardEl);
      }
      // the wall's lettering: real text, so it is sharp and a screen reader can read it
      for (const { t, x, y, size, col, align } of room.labels || []) {
        const label = make('span', 'floor-label floor-label--' + align); label.textContent = t;
        label.style.left = x / room.width * 100 + '%'; label.style.top = y / H * 100 + '%';
        label.style.color = col; label.style.setProperty('--size', size);
        nodes.push(label);
      }
      thingsEl.replaceChildren(...nodes);
      view.hidden = false;
      narrow = windowEl.clientWidth / Math.max(windowEl.clientWidth / 480, windowEl.clientHeight / H) < 300;
      camera = room.at(0); cecilX = stand(0);
      if (room.board) renderBoard(0, false);      // the first board is already written when you arrive
      // the arrows move between boards in a board room, and say so
      const walkLabel = view.querySelector('.floor-pad__label');
      if (walkLabel) walkLabel.textContent = room.board ? 'Boards' : 'Walk';
      prev.setAttribute('aria-label', room.board ? 'Back to the previous board' : 'Walk back to the previous stop');
      next.setAttribute('aria-label', room.board ? 'On to the next board' : 'Walk on to the next stop');
      layout(); show();
    },
    close() {
      if (!floor) return;
      floor = null; live = null; cancelAnimationFrame(raf);
      reset(); thingsEl.replaceChildren();
      view.hidden = true;
    },
  };
}
