// Floor 01 of the Projects building: Musoni, told at a whiteboard.
// One room, one screen. Cecil stands at a whiteboard and talks the visitor through the platform; for
// each part he rubs the board clean and writes the next one. The visitor moves through the boards like
// a game (arrow keys or buttons, Space for his next line, A for what the board offers). Earlier
// versions Cecil turned down: a large Cecil pointing at drawn props ("undersells me"), a wall of
// screens ("we should be talking about the platform"), and a long wall walked sideways (17 Nov 2026:
// replaced by this board, his idea).
//
// WHAT THE TALK IS FOR. Hiring managers. Each board is a decision or a piece of evidence, not a tour of
// parts, and its bottom corner says what it shows (skills). Board 1 can be read at a glance: role,
// dates, stack.
// WHERE THE WORDS COME FROM. Cecil, on 17 Nov 2026: he took the project over and redesigned it; the
// goal is that an active Musoni client borrows with no human in between; he mapped the eligibility
// rules (say so, but name none); the move from staff invitations to recognising a client at sign-up;
// connection pooling made it faster; staff handle PIN resets and device changes, loan applications are
// automatic. Leave idempotency out. The figures (334 tests) are from September 2026 documents.
// THE BALANCE on detail: name features and safeguards, never how a safeguard is built; no supplier
// names (M-Pesa excepted), no addresses or keys, nothing from an internal review.
import { R, rng } from '../pixel.js';
import { musoniBrand } from '../../content/brands.js';
import { initUssd } from '../ussd.js';

const GREEN = musoniBrand.green, WALL = '#071540', CREAM = '#f4efd8', DIM = '#8fa0d0', EDGE = '#52607c';
/** A see-through rectangle, for light and shadow. */
const A = (c, col, alpha, x, y, w, h) => { c.globalAlpha = alpha; R(c, col, x, y, w, h); c.globalAlpha = 1; };

// ---------- the room: one screen, a little wider so wide windows see more wall, not less room ----------
const WIDTH = 640, MID = 320;
const BOARD = [190, 20, 272, 154];                 // the writing surface, in scene pixels
const HANDSET_RECT = [480, 42, 56, 100];
const SHOTS = '/work/musoni/';
const WALL_FOOT = 200, TABLE = 228;

// ---------- marker on the board ----------
// Each board is drawn in the surface's own units (272 x 154) as SVG, so lines and lettering stay sharp.
// Every mark gets an order number; the runner writes them one after another.
const BLUE = '#2547a6', INK = '#262a35', RED = '#c43a2e', MARK_GREEN = '#3c8a12', GREY = '#7a7f8c';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function marker(seed) {
  const out = [], wob = rng(seed);
  let n = 0;
  const j = (v, k = .7) => +(v + (wob() - .5) * k).toFixed(2);
  const mark = (tag, attrs) => out.push(`<${tag} class="w" style="--i:${n++}" ${attrs}/>`);
  const pen = {
    text(x, y, s, { size = 10, col = INK, anchor = 'start' } = {}) {
      out.push(`<text class="w" style="--i:${n++}" x="${x}" y="${y}" font-size="${size}" fill="${col}" text-anchor="${anchor}">${esc(s)}</text>`);
    },
    line(points, col = INK, width = 1.4) {
      const d = points.map(([x, y], k) => (k ? 'L' : 'M') + j(x) + ' ' + j(y)).join(' ');
      mark('path', `d="${d}" pathLength="1" stroke="${col}" stroke-width="${width}"`);
    },
    box(x, y, w, h, col = INK, label, size = 9, labelCol = INK) {
      const d = `M${j(x)} ${j(y)} L${j(x + w)} ${j(y)} L${j(x + w)} ${j(y + h)} L${j(x)} ${j(y + h)} Z`;
      mark('path', `d="${d}" pathLength="1" stroke="${col}" stroke-width="1.4"`);
      if (label) [].concat(label).forEach((t, k, all) => pen.text(x + w / 2, y + h / 2 + size * .35 + (k - (all.length - 1) / 2) * size * 1.05, t, { size, col: labelCol, anchor: 'middle' }));
    },
    arrow(x1, y1, x2, y2, col = INK, both = false) {
      const a = Math.atan2(y2 - y1, x2 - x1), head = (x, y, ang) => [[x - 5 * Math.cos(ang - .45), y - 5 * Math.sin(ang - .45)], [x, y], [x - 5 * Math.cos(ang + .45), y - 5 * Math.sin(ang + .45)]];
      pen.line([[x1, y1], [x2, y2]], col);
      pen.line(head(x2, y2, a), col);
      if (both) pen.line(head(x1, y1, a + Math.PI), col);
    },
    tick(x, y, col = MARK_GREEN) { pen.line([[x, y], [x + 3, y + 3.5], [x + 9, y - 4]], col, 1.8); },
    cross(x, y, w, h, col = RED) { pen.line([[x, y], [x + w, y + h]], col, 1.8); pen.line([[x + w, y], [x, y + h]], col, 1.8); },
    shield(x, y, col = MARK_GREEN) { pen.line([[x, y + 2], [x + 6, y], [x + 12, y + 2], [x + 12, y + 8], [x + 6, y + 14], [x, y + 8], [x, y + 2]], col, 1.5); pen.tick(x + 3, y + 7, col); },
    /** What this board shows, for the hiring manager: the bottom right corner. */
    shows(s) { pen.text(262, 146, 'shows: ' + s, { size: 8, col: MARK_GREEN, anchor: 'end' }); },
  };
  return { pen, done: () => ({ svg: out.join(''), marks: n }) };
}
const drawn = (seed, draw) => { const m = marker(seed); draw(m.pen); return m.done(); };

// ---------- the boards ----------
// 1. The goal, and everything a recruiter needs in one look.
const goal = drawn(11, p => {
  p.text(10, 24, 'Musoni: no one in between', { size: 18, col: BLUE });
  p.text(10, 39, 'lending platform · my redesign · May to Aug 2026', { size: 9.5 });
  p.box(12, 58, 50, 22, INK, 'client', 10);
  p.arrow(64, 69, 104, 69); p.text(84, 63, 'applies', { size: 8, anchor: 'middle' });
  p.box(106, 58, 58, 22, MARK_GREEN, 'Musoni', 10);
  p.arrow(166, 69, 204, 69); p.text(185, 63, 'pays out', { size: 8, anchor: 'middle' });
  p.box(206, 58, 54, 22, INK, 'M-Pesa', 10);
  // the loan officer, crossed out
  p.line([[135, 92], [135, 92]], INK, 7); p.line([[135, 96], [135, 110], [129, 119]]); p.line([[135, 110], [141, 119]]); p.line([[128, 101], [142, 101]]);
  p.cross(124, 88, 22, 33);
  p.text(151, 108, 'no loan officer', { size: 8.5, col: RED });
  p.text(10, 132, 'Flutter · Spring Boot · Next.js · USSD', { size: 9.5, col: BLUE });
  p.shows('system design · ownership');
});
// 2. Eligibility, mapped from the lender's rules (none named).
const rules = drawn(12, p => {
  p.text(10, 24, 'Who can borrow?', { size: 18, col: BLUE });
  p.line([[44, 54], [78, 72], [44, 90], [10, 72], [44, 54]]); p.text(44, 70, 'active', { size: 8.5, anchor: 'middle' }); p.text(44, 80, 'client?', { size: 8.5, anchor: 'middle' });
  p.arrow(80, 72, 104, 72); p.text(92, 67, 'yes', { size: 7.5, anchor: 'middle', col: MARK_GREEN });
  p.box(106, 58, 76, 28, INK, ['the lender’s', 'rules'], 9);
  p.arrow(184, 72, 204, 72);
  p.box(206, 58, 54, 28, MARK_GREEN, 'an offer', 9.5, MARK_GREEN);
  p.arrow(144, 104, 144, 90, RED); p.text(144, 113, 'mapped with Musoni’s team', { size: 8.5, col: RED, anchor: 'middle' });
  p.text(10, 132, 'decided by rules, not by someone reading a file', { size: 9.5 });
  p.shows('business analysis · domain rules');
});
// 3. From staff invitations to recognising a client at sign-up.
const recognise = drawn(13, p => {
  p.text(10, 24, 'From invitation to recognition', { size: 18, col: BLUE });
  p.text(10, 50, 'before', { size: 9, col: RED });
  p.box(48, 40, 62, 16, GREY, 'staff invite', 8.5, GREY); p.arrow(112, 48, 132, 48, GREY); p.box(134, 40, 70, 16, GREY, 'client signs up', 8.5, GREY);
  p.cross(212, 42, 10, 12); p.text(228, 52, 'gone', { size: 9, col: RED });
  p.text(10, 88, 'now', { size: 9, col: MARK_GREEN });
  p.box(48, 78, 66, 18, INK, 'client signs up', 8.5); p.arrow(116, 87, 132, 87);
  p.box(134, 78, 62, 18, INK, 'system checks', 8.5); p.arrow(198, 87, 212, 87);
  p.text(216, 91, 'known!', { size: 10, col: MARK_GREEN }); p.tick(246, 86);
  p.text(10, 124, 'the last manual step, gone', { size: 10.5, col: BLUE });
  p.shows('process redesign');
});
// 4. Every phone: the app and USSD, one backend. App screens pinned on; the handset hangs beside.
const phones = drawn(14, p => {
  p.text(10, 24, 'Every phone', { size: 18, col: BLUE });
  p.text(10, 46, 'smartphone', { size: 8, col: GREY });
  p.box(10, 50, 64, 18, INK, 'Flutter app', 9);
  p.text(10, 86, 'any phone', { size: 8, col: GREY });
  p.box(10, 90, 64, 18, INK, 'USSD menu', 9);
  p.arrow(76, 59, 104, 72); p.arrow(76, 99, 104, 86);
  p.box(106, 64, 74, 30, MARK_GREEN, ['one backend', 'Spring Boot'], 9);
  p.text(10, 126, 'USSD: ~160 characters a screen, and it hangs up', { size: 8.5, col: RED });
  p.text(10, 136, 'after a short silence', { size: 8.5, col: RED });
  p.arrow(240, 112, 262, 112, RED); p.text(236, 115, 'try it', { size: 8.5, col: RED, anchor: 'end' });
  p.shows('Flutter · USSD · Spring Boot');
});
// 5. Faster calls: connection pooling.
const pooling = drawn(15, p => {
  p.text(10, 24, 'Faster calls', { size: 18, col: BLUE });
  p.box(10, 58, 56, 28, INK, ['our', 'backend'], 9);
  p.arrow(68, 72, 96, 72, INK, true);
  p.box(98, 50, 66, 44, MARK_GREEN);
  [58, 66, 74, 82].forEach(y => p.line([[104, y], [158, y]], MARK_GREEN, 1.2));
  p.text(131, 104, 'pool of open', { size: 8, anchor: 'middle', col: MARK_GREEN }); p.text(131, 113, 'connections', { size: 8, anchor: 'middle', col: MARK_GREEN });
  p.arrow(166, 62, 194, 54, INK, true); p.arrow(166, 82, 194, 90, INK, true);
  p.box(196, 44, 66, 18, INK, 'core banking', 8.5); p.box(196, 82, 66, 18, INK, 'M-Pesa', 8.5);
  p.text(10, 124, 'before:', { size: 9, col: RED }); p.text(42, 124, 'a new connection for every call', { size: 9, col: GREY });
  p.text(10, 136, 'now:', { size: 9, col: MARK_GREEN }); p.text(42, 136, 'reuse an open one and skip the wait', { size: 9 });
  p.shows('Spring Boot · performance');
});
// 6. Staff only handle the exceptions. Portal screens pinned on.
const staff = drawn(16, p => {
  p.text(10, 24, 'Staff handle the exceptions', { size: 18, col: BLUE });
  [['loan application', 'automatic', MARK_GREEN], ['forgotten PIN', 'staff reset it', INK], ['new phone', 'staff approve it', INK], ['every action', 'audit trail', INK]].forEach(([a, b, col], k) => {
    const y = 52 + k * 20;
    p.text(10, y, a, { size: 9.5 }); p.arrow(84, y - 3, 100, y - 3); p.text(104, y, b, { size: 9.5, col });
    if (!k) p.tick(150, y - 5);
  });
  p.text(10, 136, 'Next.js · TypeScript · roles', { size: 9, col: BLUE });
  p.shows('portal · roles · audit');
});
// 7. Trust: the safeguards, by name only.
const trust = drawn(17, p => {
  p.text(10, 24, 'Trust', { size: 18, col: BLUE });
  p.text(10, 42, 'it’s people’s money', { size: 10 });
  [['device binding', 12, 56], ['certificate pinning', 138, 56], ['app attestation', 12, 92], ['screen protection', 138, 92]].forEach(([s, x, y]) => { p.shield(x, y); p.text(x + 18, y + 11, s, { size: 10 }); });
  p.text(10, 132, 'a new phone needs staff approval', { size: 9, col: RED });
  p.shows('mobile security');
});
// 8. Knowing it works: tests and what the alerts watch.
const works = drawn(18, p => {
  p.text(10, 24, 'Knowing it works', { size: 18, col: BLUE });
  p.text(10, 70, '334', { size: 34, col: MARK_GREEN });
  p.text(10, 84, 'automated tests', { size: 9.5 });
  p.text(10, 96, 'on a real database', { size: 8.5, col: GREY });
  p.text(128, 44, 'alerts on what a customer feels', { size: 9, col: RED });
  ['a service is down', 'applications failing', 'payments stuck', 'USSD sessions not finishing', 'a scheduled job gone quiet'].forEach((s, k) => {
    const y = 58 + k * 13; p.box(128, y - 6, 6, 6, RED); p.text(140, y, s, { size: 8.5 });
  });
  p.text(10, 126, 'Grafana · Loki · Prometheus', { size: 9.5, col: BLUE });
  p.shows('testing · observability');
});
// 9. The whole system, redrawn from memory.
const whole = drawn(19, p => {
  p.text(10, 22, 'The whole system', { size: 18, col: BLUE });
  [['app', 10], ['USSD', 58], ['portal', 106]].forEach(([s, x]) => { p.box(x, 34, 42, 16, INK, s, 9); p.arrow(x + 21, 52, 76 + (x - 58) * .25, 66); });
  p.box(42, 68, 70, 22, MARK_GREEN, 'one backend', 9.5, MARK_GREEN);
  p.arrow(77, 92, 77, 102); p.box(48, 104, 58, 16, INK, 'PostgreSQL', 8.5);
  p.arrow(114, 76, 170, 48); p.arrow(114, 79, 170, 70); p.arrow(114, 82, 170, 92);
  p.box(172, 40, 78, 15, INK, 'core banking', 8.5); p.box(172, 62, 78, 15, INK, 'M-Pesa', 8.5); p.box(172, 84, 78, 15, INK, 'SMS', 8.5);
  p.text(172, 116, 'watched by Grafana', { size: 8.5, col: RED });
  p.text(10, 140, '130+ people use it · closed Aug 2026 · Play Store next', { size: 9.5, col: BLUE });
});

// ---------- the room, painted once ----------
function paint(c, width) {
  R(c, WALL, 0, 0, width, WALL_FOOT);
  for (let x = 0; x < width; x += 80) { A(c, '#000000', .14, x, 10, 1, WALL_FOOT - 10); A(c, '#ffffff', .03, x + 1, 10, 1, WALL_FOOT - 10); }
  for (let y = 14; y < WALL_FOOT; y += 3) A(c, '#ffffff', .012, 0, y, width, 1);
  R(c, '#040920', 0, 0, width, 10); R(c, '#2c3658', 0, 10, width, 2);
  // the light over the board
  for (let n = 0; n < 4; n++) A(c, '#dfe8ff', .03, BOARD[0] - 14 - n * 10, 12, BOARD[2] + 28 + n * 20, WALL_FOOT - 12);
  R(c, '#c9d3ea', MID - 40, 10, 80, 2);
  // the whiteboard: frame, surface, tray
  const [bx, by, bw, bh] = BOARD;
  R(c, '#02040d', bx - 6, by - 6, bw + 12, bh + 12); R(c, '#9aa4b6', bx - 4, by - 4, bw + 8, bh + 8);
  R(c, '#c4ccd9', bx - 4, by - 4, bw + 8, 1); R(c, '#6c7588', bx - 4, by + bh + 3, bw + 8, 1);
  R(c, '#e6eaef', bx, by, bw, bh);
  for (let n = 0; n < 7; n++) A(c, '#ffffff', .22, bx + 30 + n * 8, by, 3, bh);            // sheen
  for (let y = by; y < by + bh; y += 2) for (let x = bx + ((y >> 1) & 1); x < bx + bw; x += 2) if ((x * 7 + y * 13) % 29 === 0) A(c, '#8a93a6', .18, x, y, 1, 1);   // ghost marks
  R(c, '#02040d', bx + 2, by + bh + 6, bw - 4, 6); R(c, '#a7b0bf', bx + 4, by + bh + 6, bw - 8, 4); R(c, '#7d8698', bx + 4, by + bh + 10, bw - 8, 1);
  [['#2547a6', 18], ['#c43a2e', 34], ['#3c8a12', 50]].forEach(([col, dx]) => { R(c, '#02040d', bx + dx - 1, by + bh + 3, 14, 5); R(c, col, bx + dx, by + bh + 4, 9, 3); R(c, '#e6e6e6', bx + dx + 9, by + bh + 4, 3, 3); });
  R(c, '#02040d', bx + bw - 44, by + bh + 1, 26, 8); R(c, '#2f3446', bx + bw - 43, by + bh + 2, 24, 4); R(c, '#cfc6b0', bx + bw - 43, by + bh + 6, 24, 2);
  // the handset hangs on a plaque to the right of the board
  const [hx, hy, hw, hh] = HANDSET_RECT;
  R(c, '#02040d', hx - 6, hy - 6, hw + 12, hh + 22); R(c, EDGE, hx - 5, hy - 5, hw + 10, hh + 20); R(c, '#0a1b52', hx - 4, hy - 4, hw + 8, hh + 18);
  // floor, then the near edge of the table the visitor sits at
  R(c, '#0c1636', 0, WALL_FOOT - 4, width, 4); R(c, '#2a3657', 0, WALL_FOOT - 4, width, 1);
  R(c, '#141c36', 0, WALL_FOOT, width, TABLE - WALL_FOOT);
  for (let y = WALL_FOOT + 3; y < TABLE; y += 5) for (let x = (y % 2) * 3; x < width; x += 6) A(c, '#000000', .2, x, y, 2, 1);
  R(c, '#6b5442', 0, TABLE, width, 2); R(c, '#4a382c', 0, TABLE + 2, width, 3); R(c, '#2b2019', 0, TABLE + 5, width, 270 - TABLE - 5);
  for (let y = TABLE + 10; y < 270; y += 7) A(c, '#000000', .25, 0, y, width, 1);
  // a mug on the table
  R(c, '#02040d', 132, 236, 18, 20); R(c, '#e7e2d3', 133, 237, 16, 18); R(c, '#c9c2ae', 133, 249, 16, 6); R(c, '#02040d', 149, 241, 5, 10); R(c, '#e7e2d3', 149, 242, 3, 8);
}
/** Lettering on the walls: real text laid over the scene, so it stays sharp. */
const LABELS = [
  { t: 'MUSONI', x: 104, y: 24, size: 20, col: GREEN, align: 'left' },
  { t: 'FLOOR 01', x: 104, y: 47, size: 7.5, col: DIM, align: 'left' },
  { t: 'TRY IT', x: HANDSET_RECT[0] + HANDSET_RECT[2] / 2, y: HANDSET_RECT[1] + HANDSET_RECT[3] + 4, size: 7.5, col: CREAM, align: 'center' },
];

// ---------- the phone that works ----------
// What Cecil says while the visitor uses the handset, step by step. The steps are the real ones.
const USSD = {
  idle: 'Press Send to dial.',
  pin: 'Enter any four digits as a PIN.',
  menu: 'Press 1 to apply for a loan, or 2 to see your loans.',
  amount: 'Type an amount, then press Send.',
  range: 'It lends from 500 to 50,000 here. Press 0 and try again.',
  cost: 'The full cost shows before you accept. Press 1 to confirm.',
  sent: 'That is a loan application, from any phone. No one has to approve it.',
  loans: 'Press 1 for the balance, or 2 to repay.',
  balance: 'Press 0 to go back.',
  repay: 'Type what you want to repay, then press Send.',
  stk: 'On the real thing, an M-Pesa prompt arrives on the phone and you approve it there.',
  bye: 'Press Send to dial again.',
};
/** Build the working handset. It hangs on the wall and is brought close to be used; `hint` gets Cecil's next line. */
function mountHandset(holder, hint) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  holder.innerHTML = `
    <div class="handset" id="handset" tabindex="0" aria-label="A feature phone running the Musoni USSD menu. Use the buttons or your number keys.">
      <div class="brand">MUSONI DEMO</div>
      <div class="lcd" id="lcd" aria-live="polite"></div>
      <div class="soft"><button type="button" data-k="clear">Clear</button><button type="button" data-k="send">Send</button></div>
      <div class="keys">${keys.map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
    </div>`;
  holder.addEventListener('ussd:state', event => hint(USSD[event.detail.state] || ''));
  initUssd();
}

// ---------- the talk ----------
// One entry per board, in order. `lines` are Cecil's words, one dialogue box each. `board` is what he
// writes. `shots` are real screens, pinned to the board at `pin` (board units) and held up close on A
// or a tap; `live` is the thing that works.
const STOPS = [
  { title: 'No one in between', board: goal,
    lines: [
      'Karibu. Musoni is a microfinance lender here in Kenya, and this is the lending platform I built for them.',
      'I took the project over in May 2026 and redesigned it around one goal.',
      'An active Musoni client should be able to apply for a loan and receive it without waiting on anyone.',
      'I designed it, and I built the app, the USSD menu, the backend and the staff portal.',
    ] },
  { title: 'Who can borrow', board: rules,
    lines: [
      'First I had to pin down who can borrow, and how much.',
      'I worked through the lender’s rules with Musoni’s team and turned them into checks the system runs on its own.',
      'When a client applies, the answer comes from those rules, not from someone reading a file.',
    ] },
  { title: 'From invitation to recognition', board: recognise,
    lines: [
      'When I took it over, staff had to invite each client through the portal before they could sign up.',
      'I changed that. Now the system recognises an active Musoni client during sign-up, on its own.',
      'That removed the last manual step between a client and a loan.',
    ] },
  { title: 'Every phone', board: phones,
    lines: [
      'Smartphone users get a Flutter app. Everyone else dials a USSD code, from any phone.',
      'Both talk to one backend in Java 21 and Spring Boot, so a rule written once behaves the same on both.',
      'USSD is unforgiving: about 160 characters a screen, and the line drops after a short silence.',
      'Pick up the phone on the wall and try it. The app’s real screens are pinned to the board.',
    ],
    shots: [
      { id: 'app-home', label: 'App screen: Home', src: SHOTS + 'app-home.webp', pin: [192, 34, 30, 62],
        alt: 'The Musoni app’s home screen. A card reads “One more step to borrow”, with a button to call Musoni and a link to find the nearest branch.',
        line: 'Home. A new customer’s details are saved, and the app shows the one step left before they can borrow.' },
      { id: 'app-offer', label: 'App screen: Loan offer', src: SHOTS + 'app-offer.webp', pin: [228, 40, 30, 62],
        alt: 'The loan offer screen. A slider sets the amount, and a panel lists the principal, the facilitation fee, the excise duty and the net disbursement.',
        line: 'The loan offer. The full cost is on the screen before you accept: the fee, the duty, and what actually reaches you.' },
      { id: 'app-loans', label: 'App screen: My loans', src: SHOTS + 'app-loans.webp',
        alt: 'The My Loans screen. One active loan shows its outstanding balance, a progress bar and the date it was disbursed.',
        line: 'My Loans. A borrower sees what is outstanding and how much they have repaid.' },
    ],
    live: { id: 'ussd', label: 'The USSD handset', rect: HANDSET_RECT, mount: mountHandset, pick: 'Pick up the phone',
      title: 'The Musoni USSD menu', done: 'Put the phone down',
      note: 'A simulation. The steps are the real ones; the amounts, the fee and the dates are made up.' } },
  { title: 'Faster calls', board: pooling,
    lines: [
      'Every loan depends on outside systems: the lender’s core banking and M-Pesa.',
      'Opening a new connection for every call added a delay to every request.',
      'I set up connection pooling, so calls reuse connections that are already open, and the whole journey got faster.',
    ] },
  { title: 'Staff handle the exceptions', board: staff,
    lines: [
      'Loan applications are automatic. Nobody has to approve them.',
      'Staff are there for the exceptions: resetting a forgotten PIN, or approving a move to a new phone.',
      'They work in a portal I built with Next.js and TypeScript. Each person can do only what their role allows.',
      'Every action goes into an audit trail. The real screens are pinned to the board.',
    ],
    shots: [
      { id: 'portal-devices', label: 'Staff portal: Device changes', src: SHOTS + 'portal-devices.webp', pin: [176, 40, 84, 50],
        alt: 'The staff portal’s device changes page, with no requests waiting.',
        line: 'Device changes. A customer who wants to use the app on a new phone waits here until staff approve it.' },
      { id: 'portal-audit', label: 'Staff portal: Audit trail', src: SHOTS + 'portal-audit.webp', pin: [184, 84, 76, 44],
        alt: 'The staff portal’s audit trail: a log of sign-ins, loan applications, device enrolments and USSD registrations.',
        line: 'The audit trail. Sign-ins, applications and staff actions are all logged.' },
      { id: 'portal-loans', label: 'Staff portal: Loan applications', src: SHOTS + 'portal-loans.webp',
        alt: 'The staff portal’s loan applications page: totals across the top and a table of applications with product, principal, outstanding balance and status.',
        line: 'Loan applications. Staff can see every one and where it stands, but they don’t have to approve them.' },
    ] },
  { title: 'Trust', board: trust,
    lines: [
      'It’s people’s money, so security came first.',
      'Sign-in is tied to the enrolled phone, and a new phone needs staff approval.',
      'The app talks only to the genuine server, the server can tell a genuine app from a tampered one, and sensitive screens can’t be captured.',
    ] },
  { title: 'Knowing it works', board: works,
    lines: [
      'There are 334 automated tests, and the integration tests run against a real database.',
      'Logs, metrics and alerts run on Grafana, Loki and Prometheus.',
      'The alerts watch what a customer would feel: applications failing, payments stuck, USSD sessions dropping.',
    ] },
  { title: 'The whole system', board: whole,
    lines: [
      'Here it is in one picture: three ways in, one backend, and the systems it talks to.',
      'The build closed in August 2026. Over 130 people use it, and it’s in final testing for the Play Store.',
      'That’s Musoni. The lift is behind you, or use the arrows to go back through the boards.',
    ] },
];

export const musoniFloor = {
  sheet: 'cecil-office',
  sceneLabel: 'The Musoni floor: a meeting room after hours. Cecil, in a shirt, tie and staff lanyard, stands at a whiteboard and writes up each part of the platform as he talks. A working feature phone hangs on the wall beside the board.',
  width: WIDTH,
  at: () => MID,                        // one screen: the view never moves
  // Cecil stands this far from the middle: left of the board on a wide screen; on a narrow one, smaller,
  // nearer the visitor and under the board's corner, so he never covers what is written.
  cecil: { feet: 226, size: 1.15, wide: -170, narrow: -126, narrowSize: 1, narrowFeet: 256 },
  // the whiteboard: where it is, its units, and how much of the room must always be in view (Cecil to the handset)
  board: { rect: BOARD, size: [272, 154], core: 440 },
  paint,
  stops: STOPS,
  labels: LABELS,
  narrowWidth: 310,                     // scene pixels kept in view on a screen too narrow for the whole room
};
