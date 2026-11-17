# Handoff: Cecil Lwala's portfolio

**Start with `docs/PLAN.md`** (written 16 November 2026, 19:30). It states what Cecil wants
now: two separate modes, first-person floors with Cecil as host, and the Musoni floor as the
first task. This file is the history of what was built and why. Several sections below
describe work that the plan now marks for rework, in particular the front page cover and the
Musoni page. `docs/EXECUTION_PLAN.md` is superseded.

## Home is a town of four streets, joined by a matatu (2026-11-17, evening)

Cecil: "bring life into the website": the bus (a matatu) moves between streets; Projects,
Experience and Education become streets, each an entirely different view, not all Nairobi at night;
detail like a 2D riverside sunset he shared; the weather and the time changing; the matatu bigger
than the sprite. Education goes to Njoro. Drawn in code ("let's push ourselves"). He approved the
Projects-street still (`design/streets/`) before this was built.

- **The streets** (`src/scripts/town/streets.js`), 640 x 360 art pixels each:
  - **The stage, town** (Kenyatta Avenue): KICC up close, Times Tower, the Nation Centre, the post
    office (contact), a hoteli and a phone stall, a long matatu shelter with people waiting, the
    avenue's railing in front. Home lands here.
  - **Projects, Upper Hill**: the still, now graded to every time. Musoni (door to
    `/projects#musoni`, the whiteboard), LexIMS under a crane (not open), a jacaranda, the Ngong
    Hills, a bougainvillea hedge.
  - **Experience, Ngong Road, Kilimani**: the Ngong Hills close, forest at their feet, Podii in an old
    house with a garden (`/experience#podii`), GikTek in glass with its name on the roof
    (`/experience#giktek`), a boda boda stage, a mama mboga, a eucalyptus.
  - **Education, Njoro**: the Mau escarpment and Menengai, wheat fields, acacias, a small herd,
    Egerton's gate and red-roofed halls (`/education`), a murram road, tall grass and a fence.
- **Time and weather** (`src/scripts/town/kit.js`): streets are painted in daylight colours and
  graded per time (dawn, day, golden hour, night); lights (windows, lamps, signs) are ungraded and
  come on with the dark. Time follows Nairobi's clock (`dayAt`), crossfading through the day; the
  clock button cycles Nairobi now, Dawn, Day, Golden hour, Night. Weather drifts on its own (a short
  shower every few minutes: grey sky, wet roads, puddles in Njoro, animated rain); the weather
  button cycles auto, clear, rain. Each street, time and weather is one keyframe, painted on first
  need and in idle time. Links: `/?street=projects&time=night&weather=rain`.
- **The matatu** (`src/scripts/town/matatu.js`): 232 x 108, about one and a half times Cecil, side art,
  "NAIROBI", LED-lit inside at night, a route board. Walk to the stage (or choose Matatu in the bar),
  pick a street; it arrives, Cecil gets on, it drives off, the screen dips, it arrives on the other
  street and he steps off. Reduced motion: the street changes at once.
- **The runner** (`src/scripts/town/town.js`, replaces `street.js` on `/`): camera follows Cecil;
  Cecil is drawn into the scene at native size and lit by the hour; a car passes now and then;
  birds by day; the place card, places bar, Directions, Wallpaper and Sound work as before.
  Returning from a building (`/?from=projects|experience|education`) lands at its door.
  `src/scripts/street.js` and the old `src/scripts/town.js` are no longer used by `/`.
- **Checked** in headless Chrome on a production build: all four streets at dawn, day, golden hour,
  night and in rain; a full ride town to Projects; the clock and weather buttons; returning from a
  building; LexIMS; reduced motion; 1280x720, 1920x1080, 390x844. No console errors; first paint in
  about 2 s. Not yet run on Cecil's dev server.
- **Life on the streets (later the same evening, Cecil: "proceed")**:
  - **People as detailed as Cecil** (`src/scripts/town/people.js`). Cecil said the first version
    "missed a lot" in the faces, so each person is now built on Cecil's own frames
    (`cecil-town.png`: standing, blinking, four walking steps), recoloured to their skin, hair and
    clothes, then changed: hairstyle (afro, crop, bun, braids, headwrap, cap, bald), beard (none,
    stubble, moustache, full), thin brows and lashes, lips, earrings, glasses, a neutral mouth or a
    smile, tee, shirt, jacket, dress or kitenge print, a bag. Same eyes, nose, ears and shading as
    Cecil. A phone frame raises a small phone in both hands; its screen lights at night. Ten looks
    in `LOOKS`; the palette letters match Cecil's frame (see the comment at the top).
  - **Waiting people are live** (`crowd` on each street in `streets.js`): four at the town stage, one
    at each other stage, the mama mboga beside her stall, a student at Egerton's gate. They blink
    and some keep checking their phones. The painted figures they replaced are gone.
  - **Passers-by** walk the pavement both ways, in front of and behind Cecil's line; under umbrellas
    in the rain, fewer at night (`walkers` per street sets how busy).
  - **Boda bodas** ride the far lane now and then, a rider and sometimes a passenger, headlight at
    night.
  - **Cars bigger than the people** (Cecil: "the cars must be bigger than the people"): `paintCar` in
    `matatu.js`, 244 x 104, a saloon or a station wagon about four people long and one and a half tall,
    windows that catch the sky, doors, handles, a mirror, Kenyan plates (white front, yellow back),
    big wheels; painted per time, weather and colour and lit like the matatu, a headlight beam at night.
    One passes on the near lane now and then when the matatu is not about.
  - **The crane** on Projects street: its trolley creeps along the jib and the load swings on its
    cable (`crane` on the street; the painted hook was removed).
  - Everyone is lit by the hour, like Cecil (`lit()` in `town.js`).
  - **Back from a building lands at the right door**: the building page's way out now carries the
    floor (`/?from=experience&at=giktek`, set in `building.js` on click), so leaving GikTek lands at
    GikTek, LexIMS at LexIMS.
- **Still open**: a sound for rain; the old street files (`src/scripts/street.js`, the old
  `src/scripts/town.js`) can be deleted once Cecil is happy.

## Home is the street only (2026-11-17, afternoon)

Cecil, again and firmly: "there should be a stark difference between interactive mode and browser
mode. On root there is a confusion ... On root I only want to see the street for now."

- **Removed from `/`:** the professional cover over the street (`#cover`), the "Selected work"
  section under it (`#work`), the "Front page" chip in the street's bar, the loader's "Go straight to
  my work" link, and the front-page script (`initFront`). `setCover` is gone from `street.js`; the
  street starts in Explore. The slow-load and error messages no longer point at "my work below".
- **Kept:** the street's own controls (Explore, Wallpaper, Directions, Sound) and the no-JavaScript
  fallback line, which still links to `/work` (it is only seen without JavaScript).
- **Kept for browser mode, unused by `/` now:** `src/styles/front.css`, `src/scripts/front.js`,
  `src/content/profile.js` (the cover's words, the work tabs and the `sample()` data), the Anybody
  and Atkinson fonts. `/work` and `/musoni` still exist but nothing on the street links to them.
- **Checked** at 1280x720, 390x844 and `/?from=projects`: street only, page exactly one screen tall,
  no console errors.

## The Musoni floor is a whiteboard talk (2026-11-17, afternoon)

Cecil's direction: rethink what the floor says and how, with content that appeals to hiring managers,
and replace the sideways walk with a whiteboard the sprite writes on and rubs out (his idea). He said
"start with the first version, we will polish as we continue".

- **What it is now.** One screen: a meeting room after hours. Cecil stands left of a whiteboard; a
  working USSD handset hangs to its right ("TRY IT"); the visitor sits at the table (near edge at the
  bottom). Nine boards. Moving on, he rubs the board clean (eraser, three passes, 0.5 s) and writes
  the next one mark by mark (about a second). Any key or tap on his words finishes the writing at once.
  Board 1 is already written on arrival, so a recruiter gets role, dates and stack at a glance.
- **The boards are decisions, not a tour.** No one in between (the goal) · Who can borrow · From
  invitation to recognition · Every phone · Faster calls (connection pooling) · Staff handle the
  exceptions · Trust · Knowing it works · The whole system (redrawn from memory). Each has "shows: …"
  in green in its bottom right corner, for the hiring manager.
- **What Cecil confirmed for the words (17 Nov):** he took the project over (May 2026) and redesigned
  it; the goal is that an active Musoni client borrows with no human in between; he mapped the
  eligibility rules (say so, name none); staff used to invite clients through the portal, and now the
  system recognises an active client at sign-up; connection pooling made it faster (no figure yet);
  loan applications are automatic, staff handle PIN resets and device changes; **leave idempotency
  out** (the old "a retry never creates a second loan" line is gone). He built it alone and worries
  that reads as spread thin; he was told the site will not claim help he did not have. Board 1 says
  "I designed it, and I built the app, the USSD menu, the backend and the staff portal." Open.
- **Code.** `src/scripts/floors/musoni.js`: each board is SVG marks drawn with a small marker DSL
  (`text`, `box`, `arrow`, `tick`, `cross`, `shield`, `shows`) in board units (272 x 154), so
  lettering is sharp at any size. Real screens are pinned to boards 4 and 6 (`shots[].pin`); tapping
  one, or A on board 6, holds them up close. A on board 4 picks up the handset. Lettering on the board
  is Patrick Hand (OFL, `public/fonts/PatrickHand-*`).
  `src/scripts/floor-view.js` gained a board mode (`room.board`): the view never moves, `walkTo`
  becomes `changeBoard`, the layout fits the room's height while Cecil, the board and the handset stay
  in view (`board.core`), and his words sit beside him. Walk mode is untouched for other floors.
  Board styles are under "the whiteboard" in `building.css`. The USSD demo now says "You will get an
  SMS with the decision" (it said "once it is reviewed", which contradicted "automatic").
- **Checked** in headless Chrome against a production build at 1280x720, 1440x900, 1920x1080,
  1280x600, 2560x1080, 768x1024, 390x800 and 360x640: every board, the eraser and writing mid-way,
  interrupting a board, pinned screens, the handset, the stop squares and reduced motion. No console
  errors. On phones Cecil stands smaller, under the board's corner, so he never covers the writing.
  Not yet run on Cecil's dev server.
- **Still open.** A figure for "faster" (before and after). Who built what (board 1). Figures from
  September documents (334 tests). The lettering on phones is small (about 10 px for the smallest).
  Marker sounds. The other floors still use the old bubble and pop-up.

## The Musoni floor is a walk, played like a game (2026-11-17, morning)

Cecil's verdict on the showroom below: an improvement, but "we just have screens on the floor ...
we should be talking about the platform". He also asked that the interactive mode be gamified, and
said there is a lot to say on this one floor: his Spring Boot, Flutter, Next.js and observability
work, and setting up USSD. He approved a still of one stop before this was wired.

- **What it is now.** The room is 2880 scene pixels wide, with nine stops along the wall. Cecil walks
  the visitor from stop to stop and talks; the wall at each stop shows what he is talking about.
  The stops: the brief, the app, USSD, the backend, the staff portal, payments, safeguards, seeing
  it run, where it stands. Each has three or four lines.
- **Controls.** Arrow keys or the two arrow buttons walk one stop. Space, Enter or a tap on the
  dialogue box gives the next line, and after the last line walks on. The A button (or the A key)
  does what the stop offers: look closer at real screens (stops 2 and 5) or pick up the working
  USSD handset (stop 3). The squares at the top are the stops and jump to one. A swipe also walks.
  No scores and no timers.
- **Where the words come from.** `src/scripts/floors/musoni.js` holds every line in `STOPS`. They
  restate what Cecil confirmed, or what the Musoni repositories and their `platform-docs` say; he
  gave this session read access to `~/LINUX/code/giktek/musoni` for that. No secrets or `.env`
  files were opened. The figures (52 screens, about 50,000 lines of Dart, 52 migrations, 334 tests,
  56 tables, about 145,000 lines in all) are from documents dated September 2026 and need his check.
- **The balance on detail**, which Cecil asked me to find: say what each part does, what it is built
  with, how big it is, and how it is tested and watched. Do not name the lender's suppliers (M-Pesa
  excepted), any address or key, how a safeguard works inside, or anything the internal review found.
- **Lettering on the wall is real text**, not canvas pixels: the floor's `labels` are laid over the
  scene in Departure Mono, sized in scene pixels. The site's 3x5 canvas letters were unreadable at
  this size. Drawing functions take a pen with `box` (canvas) and `ink` (lettering).
- **Phones and narrow windows.** A screen too narrow for a whole stop shows 270 scene pixels of it,
  with the dialogue box and the buttons underneath. If the window is narrow but not tall (a tablet,
  half a laptop screen) the room is drawn smaller so the box and buttons still fit; before that fix
  they fell off the bottom. Checked at 360x640, 390x800, 640x720, 768x1024, 809x856, 1280x720 and
  1920x1080: everything on screen, and no line overflows its box.
- **Sprite across the site.** Street, lobbies, loader, the key on the front page, the crew and the
  floors all read the new sheets. The tab icon was the last old Cecil; `design/town-cecil.py` now
  writes `public/favicon.png` from the new sprite. `public/sprites/cecil.png` is the old sheet and
  is only referenced by files already listed for deletion.
- **Checked** in a headless Chrome in the cloud workspace against a production build, at 1280x720 and
  390x800: every stop, the lines, looking closer, the handset, and the pips, with no console errors.
  Then loaded on Cecil's dev server. A cloud session can test this way: build a copy, serve `dist`,
  and drive `/usr/bin/google-chrome` with Playwright.
- **For Cecil to confirm.** "On a weak network, a retry never creates a second loan": the September
  review said the app's own loan request lacked that protection then. The five alerts on the wall at
  stop 8 are the rules written in September; are they live? Staff sign-in with a one-time code.
- **Known gaps.** The other floors still use the old arrival bubble and pop-up. Beside the lift on
  floor 01 the old recoloured lobby still stands in for the room. Nothing since 16 November is
  committed.

## The Musoni floor is a showroom (2026-11-16, close to midnight)

Two versions were built the same evening. The first, approved as a still, put a large Cecil in the
middle of a lending office pointing at a drawn laptop and phone. Once it was running Cecil said it
"undersells me greatly": a visitor wants to be impressed by what he built, and got a huge sprite and
two props. The second version, also approved as a still, is what is in the code now.

- **Route.** Street, Projects, press 01. The ride is watched from outside. When the doors open, the
  iris closes on them and opens on the floor, seen from the lift through the visitor's eyes.
- **The room** (`src/scripts/floors/musoni.js`): a dark showroom, 480x270 like the lobby. The work is
  the loud thing. On the far wall hang three real app screens, the staff portal, and the USSD
  handset. Cecil stands small at the left in his shirt, tie and lanyard, with one line at a time.
- **Screens come up close.** Touching a screen holds it up large with Cecil's line about it; "Next
  screen" steps through its set (three app screens, three portal screens). The handset on the wall
  is the real one, shrunk; touching it brings it close to be used, and Cecil says what to press.
  `ussd.js` announces each step with a `ussd:state` event on the handset.
- **Screenshots** are Cecil's own, in `public/work/musoni`. By his instruction his name replaces the
  customer names and the masked number, and the phone number on Home is 254711657476. I also trimmed
  the phone and browser chrome and hid a device id and a server address. The balance, the product
  names, the rate and the fees are as he supplied them. The portal is branded Colektar.
- **The runner** (`src/scripts/floor-view.js`) shows any room described like `musoniFloor`: a
  `paint`, `galleries` of real screens, an optional `live` thing that works, captions, lines, and the
  sprite sheet to dress Cecil in. To add a floor, write `src/scripts/floors/<name>.js`, add it to
  `ROOMS` in `building.js`, and give the floor `room: '<name>'` in `src/content/buildings.js`.
- **Phones.** A screen too narrow to cover with the room gets it as a strip a little over half the
  screen tall, swiped sideways, with the plaque above and Cecil's words below. A wide screenshot held
  up close keeps its height and scrolls sideways.
- **URLs.** `/projects#musoni` is the floor; `/projects#musoni/lift` is beside its lift. The
  browser's Back button returns to the lobby. The `page` mechanism and the hop to `/musoni` are
  gone. `/musoni` still exists, linked from the front page and `/work` only.
- **Passing floors.** A ride of more than one floor slides every floor past the cabin, and the
  plaque and message name the one being passed. Each adds 0.9 seconds (`RIDE.perExtraFloor`).
- **Sprite, decided by Cecil the same evening:** no neck patch in the front view, shaped arms with
  small round hands, a close crop six pixels tall (it was ten). `design/town-cecil.py` takes an
  outfit and writes `cecil-town.png`, `cecil-worker.png` and `cecil-office.png`. Larger redrawn
  Cecils (three smooth, two chunky, one cartoon) were all rejected in favour of this sprite. Do not
  redraw him.
- **Checked** on Cecil's running dev server at 1280x720 and 375x812: direct link, every screen and
  both sets, the handset, stepping back, Back and Forward, and a production build in a copy. The
  ride was driven by a script because the preview pane was hidden; nobody has watched it in real time.
- **Known gaps.** Cecil said more information will be added to this floor after this pass. Beside
  the lift on floor 01 (`#musoni/lift`) the old recoloured lobby still stands in for the room.
  One audit-trail row shows "no attestation header", which may break the rule about not saying how
  safeguards are built; Cecil has been asked. Nothing from 16 November is committed.
- **Writing files back from a cloud session:** wait about ten seconds between copying a file to the
  outputs folder and committing it, then stage it back and compare. A commit made straight after the
  copy once wrote the previous version.

## The front page: a professional opening screen over the street (2026-11-16, 19:00)

Cecil's brief, in his words: a site he can "share with potential employers and get employed";
"a professional visually appealing website that communicates clearly what I have done and my
expertise"; "typography that is composed well, not generic font"; buttons that are not
generic; "none of that listing everything from top to bottom and calling it a portfolio".
Audience: employers in Kenya. Dummy data for now. This is a first checkpoint for his reaction:
only the opening screen and the selected-work panel are built.

- **Structure agreed.** Home is the professional page with the street as its opening screen.
  Still to build after his reaction, in this order: a credentials sheet (one designed object:
  role, years, products shipped, users, stack), experience with tech tags that highlight the
  projects using them, the business card with CV download, and a LexIMS case-study page. The
  street, buildings and lift stay as the playful route into the same case studies.
- **Opening screen** (`#cover` in `index.astro`, styles in `src/styles/front.css`). An indigo
  panel on the right holds role, name, one sentence, two keys and an availability line with
  Nairobi time. Its left edge breaks up into the scene in ordered dither
  (`public/ui/dither-edge.png`). The street idles behind it in wallpaper mode. "Walk the
  street" slides the panel away and starts explore mode; the "Front page" chip in the street's
  bar brings it back (`setCover` at the end of `street.js`). Arriving with `?from=…` (back out
  of a building) skips the cover. The loader now sits inside the scene area only, so the name
  and keys can be read while the street loads. On a phone the words come first, the scene below.
- **Selected work** (`#work`). Three titles in very large type are tabs; the chosen one fills
  with its colour and widens, and its "window" on the right shows a picture, the result in a
  sentence, role, dates, stack and a key to the case study. `src/scripts/front.js`.
- **Type.** Display: Anybody (Etcetera Type Co, OFL), used across its width axis: condensed
  and heavy for names, wide for small labels. Reading: Atkinson Hyperlegible Next (Braille
  Institute, OFL). Files and licences in `public/fonts`. Chosen by rendering the real name
  and sentence in five candidates. So far only the front page uses them; the street's bar,
  the lobbies and `/musoni` still use the system font and the old chips.
- **Keys.** The one button style: a pixel-cut keycap (`.key` in `front.css`) with stepped
  corners, a bevel and a visible side that it presses down over. A small picture is cut into
  its left: an arrow, a door, or Cecil's face, which turns to walk on hover.
- **Sample data.** All front-page content is in `src/content/profile.js`. Invented values are
  written `sample('…')` and print a dashed "sample" tag while `DRAFT` is true. Samples now:
  the availability line, LexIMS's result sentence, and the whole third project ("Chama").
  Real: Musoni's facts. Do not launch with `DRAFT` true or any sample left.
- **Checked** at 1280x720 and 390x844: loading state, cover, both keys, work tabs, explore
  and back, arriving from a building; the lift, guide and reduced-motion runs still pass.

## Lift repaired, and Musoni opens straight from the lift (2026-11-16, evening)

Decided by Cecil on 16 Nov: the lift stays third-person (Cecil is on screen), Musoni is
the first floor to get full depth, and the newest work stays on the highest floor.

- **What was broken.** `[building].astro` had been half-rewritten into a first-person lift
  while `building.js` and `building.css` still belonged to the third-person one. The script
  stopped on a missing `#building-cecil` canvas, so `/projects`, `/experience` and
  `/education` drew nothing. The template is back in step with the script and stylesheet
  and the first-person leftovers are gone. Do not revive first-person without asking Cecil.
- **Floors can now be full pages.** A floor in `src/content/buildings.js` with `page: '/…'`
  is a case study: the lift doors open, the iris closes on them and that page loads. No
  pop-up, no "About this project". The floor is not written to the URL, so the browser's
  Back button returns to the lobby. A direct link such as `/projects#musoni` goes straight
  to the page. Floors without `page` (LexIMS, Podii, GikTek, Egerton) still use the
  arrival bubble and the details pop-up until their pages exist.
- **Musoni is the first such floor.** In `/musoni` the old EXIT door is now the lift
  (`LIFT`, `CABIN` in `musoni.js`). Cecil steps out of it on arrival and walks back into it
  to leave ("Take the lift"), which returns to `/projects`. Links that pointed at
  `/projects#musoni` now point at `/projects`.
- **Route length.** Street, Go inside, press 01, and you are in the Musoni room with the
  case study below it.
- **Checked** in a headless browser at 1280x720 and 390x844: lobby, ride to Musoni, Back
  button, direct link, leaving by the lift, LexIMS floor and its pop-up, Podii, Egerton,
  and the reduced-motion route. No browser errors.
- **Next.** Give LexIMS its own room and page the same way (add `page` to its floor),
  then GikTek, Podii and Egerton. Still open from the review: the home page top bar's
  rounded pills clash with the pixel scene, `/work` is a stale text index, the business
  card is only two links in the post office, and Stanbic Ghana appears nowhere.

### One Cecil everywhere, and a slower lift (2026-11-16, 18:00)

Cecil's feedback on the section above: the sprite inside the building was not the sprite on
the street, and the lobby-to-floor ride was too fast.

- **One sprite.** The Musoni room and the scroll guide were still drawing the older small
  sheet (`cecil.png`, 30x37). Everything now uses the detailed sheet, `cecil-town.png`
  (48x64), through `cecilActor` and `cecilScale` in `pixel.js`: Cecil gets his own canvas
  laid over the scene, as on the street. `cecil.png`, `loadCecil` and `drawCecil` are no
  longer used by any page; do not bring them back. `street.js` still has its own copy of
  the same idea and could move to `cecilActor` later.
- **Slower ride.** Timings are in `RIDE` in `building.js`: doors 480 ms, walk 850 ms, travel
  1400 ms plus 500 ms per extra floor. A one-floor ride is about 4.5 seconds (it was 1.5).
  While the lift travels, the room being left and the room being reached slide past the
  cabin (`paintRoom` into two snapshots, `paintLift` drawn on top), so it reads as going up
  or down. Cecil stands in the cabin and is clipped by the closing doors.
- **Walking pace.** In the Musoni room he walks at 54 room pixels a second (it was 82).
- **The guide on `/musoni` was rebuilt (18:20), agreed with Cecil first.** His words: "I
  said I don't want the sprite to only be on one place, you have instead have him running
  across the screen." The old guide walked sideways along a reserved lane as you scrolled.
  The new one (`page-guide.js`, styles under "Cecil's guide" in `night.css`) stands beside
  the thing he is talking about, points at it, rings it with a dashed outline, and answers
  what the visitor does:
  - Stops: the brief, each of the three phone illustrations, beside the USSD handset, on
    the line above the "Behind the app" and "Safeguards" lists, and at the end buttons.
  - Pointing at or tapping a phone or a list entry brings him to it. Pressing a key on the
    handset makes him say what to press next (`ussd.js` sends a `ussd:state` event; his
    lines are the `USSD` table). Buttons in his bubble and clicking Cecil himself move on.
  - Scrolling only chooses which part of the page he waits in, after the scroll pauses.
    A short hop to a neighbour is walked; anything further and he turns up there.
  - With the guide switched off the page shows its plain written USSD steps again.
  - Every line he says restates something already on the page. Keep it that way.
  - To give another page a guide, add stops in `initPageGuide`; the spots are created by
    the script, so pages need only the `#page-guide` block and `.guided-story` class.

## Career buildings: current first pass (2026-11-16)

### Pixel-art elevator interiors (latest interaction)

- `/projects`, `/experience` and `/education` now open into a full-viewport pixel-art
  lobby, replacing the cutaway overview and immediately visible story cards below.
- A metal elevator panel provides numbered buttons (latest at the top) and G for the
  lobby. Pressing one walks Cecil into the lift, closes the doors, briefly travels,
  opens onto the destination floor, and walks Cecil out. A trip takes about 1.5 seconds;
  reduced motion skips travel. Controls lock during a trip to prevent conflicting rides.
- Each arrival remains a pixel room. Musoni uses verified green/navy branding and its
  real wordmark; LexIMS has scaffolding and a smaller hard-hat crew. Details appear
  only after pressing “About this project”; “Explore Musoni” opens the existing case study.
  (Superseded for Musoni on the evening of 16 Nov: see the section above.)
- Clean routes start at G with every project detail closed. Hashes such as
  `/projects#musoni` restore that floor for return links. Browser history restores floors.
- Scene art and Cecil are pixelated; interface labels, wordmarks and conversation text
  remain smooth. Cecil has his own full-detail canvas. Mobile keeps elevator buttons
  below a cropped room without stretching artwork. No faces appear in conversations.
- Implementation remains in `[building].astro`, `building.js` and `building.css`.
  The historical cutaway notes below describe the superseded first pass.
- Verification: production build and diff checks passed. Browser checks passed for
  clean lobby entry, both project floors, G return, history restoration, keyboard
  selection, opt-in details/Escape, plus GikTek and Egerton arrivals. Phone widths
  390 and 320 showed no horizontal or vertical overflow. No browser errors observed.
  Latest review image: `design/reviews/elevator-lobby.png`.

### Branding correction and exterior signs

- Street exteriors show only the building name and its category emblem. Project
  nameplates, corporate colours and cutaway construction crews are revealed inside
  `/projects`; the Projects facade now has ordinary windows and a rooftop crane.
- Musoni's verified palette is green `#61BC00` and navy `#041447`, from sibling repo
  `giktek/musoni/mobile-onb-musoni/lib/config/constants/colors.dart`. Shared tokens live
  in `src/content/brands.js`; they drive its floor, case study and phone illustrations.
- Original transparent wordmarks were copied unchanged from that app's `assets/logo`
  into `public/brands/musoni`. Use the green/white version on navy and green/navy on
  white, preserve proportions, and keep brand lettering smooth rather than pixelated.
- Other project/employer marks remain provisional until verified from their sources.
- Verification: production build and diff checks passed. Browser checks at 1280px
  and 390px confirmed correct logo assets, navy/green floor styling, no horizontal
  overflow, floor selection, street doorway entry and Musoni entry/return. No
  browser errors observed. Source and copied logo files have identical SHA-256 hashes.

The street now has Projects (first), Work Experience, Education and Contact. This
supersedes the individual-employer/project doors described in the historical notes.

- Projects at `/projects`: Floor 01 Musoni, Floor 02 LexIMS. Floors are oldest-first in
  `src/content/buildings.js`, displayed newest at the top. Floor branding is inside;
  the street has a neutral Projects facade with a building emblem and crane.
- Work Experience at `/experience`: Podii downstairs, GikTek upstairs. Education at
  `/education`: Egerton. All three entrances use the street's doorway transition and
  open an illustrated cutaway interior rather than forwarding to the plain text index.
- `src/pages/[building].astro`, `src/styles/building.css` and `src/scripts/building.js`
  implement the reusable interiors: selectable floors, keyboard arrows/Home/End,
  an animated lift with Cecil, responsive story bubbles, URL hashes and return links.
- LexIMS has scaffolding, materials and three mini Cecils in hard hats and reflective
  vests, walking and carrying equipment. The interior construction scene uses
  `construction.js`; the worker sheet is generated by
  `design/town-cecil.py` into `public/sprites/cecil-worker.png`. Reduced motion freezes it.
- Musoni's room now returns to `/projects#musoni`, preserving the building hierarchy.
- Musoni now uses verified repository branding. Other floors retain portfolio accent
  colours and initial marks. Each directory item has a `logo` path for the interior.
  Do not invent official logos.
- Only the two confirmed named project case studies have floors so far. General GikTek
  platform responsibilities are under Work Experience. More project names, chronology,
  roles and branding are needed from Cecil before adding further project floors.
- Freelance is provisionally a project category, not a separate street building. No
  fabricated client floors have been added. Revisit this once the freelance inventory exists.
- Matatu lighting now has a continuous headlamp beam, lit window edges, roof lighting
  and closely spaced side markers instead of the sparse dithered light cone.
- Production build and metadata checks passed. Browser checks passed for all three
  entrances, floor selection, keyboard floor changes, lift destination, Musoni entry/
  return and phone widths 390 and 320. No console errors or horizontal overflow observed.

## Current home: restored street (2026-11-16)

Cecil rejected the isometric town because its density reduced visual quality and its
links funnelled visitors into the text index. `/` again uses `street.js` and `night.css`.
The town files are retained as an unused experiment; `town.js` and `town.css` are not
loaded by the home page.

- Building selection and “Tell me more” now show details in the street conversation.
  Only the optional “Skip to the work” / loader fallback points at the text index.
  Musoni's “Go inside” retains its interactive room and doorway transition.
- Employers, education, LexIMS and contact have in-scene summaries and conversation
  actions. Contact offers email and LinkedIn directly. Full dedicated interiors for the
  other buildings have not been built.
- The detailed 48×64 character keeps the eyes Cecil liked and now has a closed-mouth
  idle smile. Its generator is `design/town-cecil.py`; the asset remains named
  `public/sprites/cecil-town.png`. `drawCecil` accepts both that and the original sheet.
  The street and loader use the detailed sheet; room/page-guide still use the original.
- Conversation bubbles contain text and actions only; the portrait has been removed.
  Cecil uses a separate native-resolution canvas with whole-number enlargement so
  facial detail is not reduced to the street raster. Front-facing pupils, highlights and eyelids
  use identical geometry. Walking frames now use a true side profile with one visible eye. Visible destination buttons
  make the cropped street usable on phones. Wallpaper mode hides the conversation and destination bar.
- Build passed; desktop and 390×844 rendering, GikTek's in-scene details and keyboard
  focus were checked in the connected browser without console errors.

## Explore / Wallpaper theme and directions (2026-11-16)

- The street is a playable portfolio in Explore mode. Wallpaper mode hides all interface
  elements except the mode selector; Explore or Escape restores navigation.
- The detailed character sheet now has four distinct side-facing walk frames: opposite
  leg strides, lifted passing feet, arm counter-swing and body bob. Walking left mirrors
  the profile, stopping returns to the front-facing idle pose, and the welcome wave has
  an actual raised arm. The face is never inserted into conversation bubbles.
- Directions are available in the HUD and welcome bubble. The panel explains selecting
  stops, conversations, keyboard movement, entering Musoni, Escape and wallpaper mode.
  Its start button focuses the first destination; closing returns focus to Directions.
- Destination buttons show education/experience/project/contact categories and mark the
  current stop. A status line reports walking and arrival, away from Cecil's face.
- Opening directions or wallpaper stops any pending walk, avoiding focus changes behind
  the panel. Movement-key state is cleared when the window loses focus.
- Build passed. Browser checks passed on desktop and 390×844 for directions, focus,
  closing, wallpaper/Explore switching and arrival at Musoni. No console errors observed.
  Asset checks confirm four unique walk frames and matching front-facing eyes.

## Character scale, idle waves and traffic (2026-11-16)

- Cecil is approximately 25% smaller at ordinary desktop/phone sizes, using half-step
  enlargement. Front-eye spacing is now 12 source pixels to keep both pupils aligned.
- He gives a brief, two-pose closed-mouth idle wave at random intervals, typically 10–22
  seconds apart after the initial wave. Walking, open directions, a hidden document and
  reduced motion suppress spontaneous waves; a wave never opens a conversation.
- Traffic now uses a separate foreground canvas above Cecil. The matatu is at least
  2.75 times its original drawing size, scales to stay taller than him, and stays grounded
  on the road. Its passing layer naturally occludes Cecil when it crosses in front.
- Build passed. Timing/guard checks and size comparisons across desktop and phone
  viewports passed; desktop browser inspection confirms the larger foreground vehicle.

## Status (2026-11-16, early morning)

**Direction approved by Cecil on 2026-11-16:** a pixel-art street in Nairobi at night, drawn in
code, with pixel Cecil as the guide. The first design (scroll story, seven colour schemes) and
three later style boards were rejected; their code has been removed from the site.

**Phase 1 is built**, apart from Cecil's own first run and review. It passes a production build
and was walked through in a headless browser at 1280x720 and 390x800 with no console errors.
It has not been run on Cecil's machine, and the sound has not been listened to.

What works now:

- **Home (`/`)**: the street. Six buildings with neon signs. Click one (or use the arrow keys)
  and Cecil walks there and talks. His bubble offers reply buttons. Only Musoni has a page yet,
  so the other doors say "Opening soon" and offer to take you to Musoni. "Go in", Enter, or a
  second click on the building closes a round wipe on the door and opens the page.
- **Musoni (`/musoni`)**: the inside of the shop, with six things to click (the two phones, the
  server, the monitor, the safe, the exit). Cecil walks to each, points, and offers to scroll to
  that section. Below: neon title, facts, figures, seven long sections, three animated pixel
  phones that explain the app, and a playable USSD menu.
- **Work (`/work`)**: every job and project in plain text, for visitors who skip the street.
- Sound toggle on every page (off by default, remembered). Reduced motion respected. Hidden
  buttons give keyboard and screen-reader users every place and every prop.
- On tall phone screens the street fills the height and crops its sides; the camera keeps Cecil
  in view.

Known rough edges:

- On a phone the Musoni room is small and Cecil's bubble covers much of it.
- The room's bubble can still overlap the prop he points at on narrow windows.
- `src/content/story.ts` still carries the first draft's wording; `/work` is built from it. The
  Musoni page has its own, newer copy in `src/pages/musoni.astro`.
- No type-check has been run.

## Interface update (2026-11-16)

- Interface and body text now use the system sans-serif stack; the canvas lettering and
  Cecil remain pixel art. The unused pixel font preload has been removed.
- Home building panels use the original light conversation-bubble styling and tail, with
  readable sans-serif text, close/Escape support and direct project/work links.
- Musoni has a scroll guide in `src/scripts/page-guide.js`. One Cecil moves between three
  reserved horizontal stages above the app, USSD and safeguards content. He walks sideways,
  faces his movement, then points and speaks. Fast jumps and reduced motion skip travel.
  Visitors can hide the guide. Its reserved space avoids covering article content.
- The horizontal guide was checked in the connected browser on desktop and at 390×844:
  app and USSD stops rendered correctly, without horizontal overflow or console errors.
- Next direction: structure the portfolio around experience (employers), project case studies,
  freelance work/company profiles, and about/contact, retaining the street as an exploration
  route. Freelance case details still need to be collected from Cecil.

## Clean-up on Cecil's machine

Files from the rejected draft could not be deleted remotely. They are unused and safe to remove:

```sh
cd ~/LINUX/code/portfolio
rm -rf src/components src/layouts/Base.astro src/scripts/mascot.ts src/styles/global.css \
       scripts public/sprites/props.png
npm install
```

(`npm install` matters: two old font packages and `qrcode` were dropped from `package.json`.)

## Next step

See “Next” in the first section of this file: LexIMS gets its own room and page next.

## Where things are

| What | Where |
| --- | --- |
| Project folder | `~/LINUX/code/portfolio` |
| The street | `src/pages/index.astro`, `src/scripts/street.js` |
| Musoni page | `src/pages/musoni.astro`, `src/scripts/musoni.js`, `src/scripts/ussd.js` |
| Plain text index | `src/pages/work.astro`, from `src/content/story.ts` |
| Shared helpers | `src/scripts/pixel.js` (dither, layers, neon lettering, sprite, sound, bubble) |
| Colours and type | `src/styles/night.css`, `src/layouts/Night.astro` |
| Sprite | `public/sprites/cecil.png`, drawn by `design/cecil.py` (Python with Pillow) |
| Font | `public/fonts/DepartureMono-Regular.woff2` (licence beside it) |
| Design history | `design/` (rejected boards, the scene test) |

How to add a place: give it `href` in the `P` list in `street.js`; copy `musoni.astro` and
`musoni.js` as a starting point; draw its room in the static layer, list its props in `HOT`.
Each place keeps its neon colour as `--accent`.

## Facts confirmed by Cecil

- Musoni: project began January 2026; Cecil picked it up in May and closed the build in late
  July or early August. In testing ahead of a Play Store release. Over 130 active users.
  Device binding, certificate pinning, app attestation and screen protection are in the release
  build. Grafana, Loki and Prometheus are deployed and in use. He also built the staff portal.
  Screenshots are allowed; he will supply them.
- LexIMS may be named. No partner or client, no architecture.
- Graduates from Egerton University on 27 November 2026. Based in Nairobi, Kenya.
- Angular was used on a Stanbic Ghana project at GikTek.
- GitHub: github.com/lwalacecil (work) and github.com/cecillwala (personal).
- The card should carry a phone number (not yet supplied).
- Mascot: grey hoodie, blue trousers.

## Things a reviewer should know

- **Estimates.** Two Musoni figures (250 loan applications, 5 min sign-up) are placeholders
  Cecil asked for. They carry an "est." tag. Do not launch with them unconfirmed.
- **USSD demo.** The steps are real; the amounts, the 10 percent fee and the 30 days are made up
  and labelled as such on the page.
- **Phone illustrations** on the Musoni page are drawn, not screenshots, and say so.
- **Claims taken from the repos, not from Cecil,** and worth his eye: the in-app signed loan
  form, statements, the branch directory, SMS and in-app notifications, photo clean-up after
  upload, and the no-double-application guard.
- **Fine-tuning wording.** Cecil's learning lab showed him early in a course in November 2026,
  so the site says he is working towards fine-tuning.
- **After 27 November 2026**, change "I graduate on 27 November" on the street and in
  `story.ts`.
- **Stanbic Ghana** is named in `story.ts` (shown on `/work`); confirm that is allowed.

## Open items for Cecil

See Phase 4 of the plan.
