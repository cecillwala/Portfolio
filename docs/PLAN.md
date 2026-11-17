# Cecil Lwala's portfolio: plan for the next session

Written 16 November 2026, 19:30 Nairobi time, at Cecil's request, by the session that did the
work described below. Read this first. It replaces `docs/EXECUTION_PLAN.md` and the older
project notes as the statement of what Cecil wants. `HANDOFF.md` in the project root is the
detailed history of what was built and why; use it as reference, not as direction.

You are invited to make your own assessment of the code and of the proposals in section 4.
The decisions in section 3 are Cecil's and are not up for reassessment without asking him.

**Start with the Musoni floor (section 6).**

---

## 1. Who and why

Cecil Lwala is a software developer in Nairobi. He works at GikTek and graduates from Egerton
University (BSc Computer Science) on 27 November 2026. He wants a portfolio he can share with
potential employers **in Kenya** and get employed.

His own words on the goal:

- "I am having a lot of fun creating the pixel art for my portfolio but I want to ensure that
  at the end of the day that I have a portfolio that I could share with potential employers
  and get employed."
- "I want this to be a fun interactive website. It is starting to look complicated and
  confusing."
- "Remember this is still a portfolio website. I should make sure I am selling myself, talking
  about the features I have implemented, my role what the project taught me. All this should
  obviously not communicated word for word."

## 2. How to work with Cecil

These were learnt the hard way over two days. Ignoring them cost several rejected builds.

1. **Do not rush to build.** He said it more than once: "Don't immediately run and start
   changing things" and "Instead of rushing to do exactly what I told you I want you to do
   proper research." When feedback arrives, first say back what you think the problem is and
   let him confirm.
2. **Show one still before wiring anything.** The only two visual directions he approved were
   shown as a single picture first (the night street: "This is the right direction").
3. **Take things away.** His latest verdict on the site: "so over-stimulating. There's too
   much everywhere." The cause, which he confirmed: every round of feedback became an added
   feature, every element was made loud, and nothing was removed. One loud thing per screen,
   everything else quiet. Few colours, little unrequested motion, few textures at once.
4. **He rejects anything that looks generic or AI-made.** Default dark-dashboard styling, card
   lists, rounded pills, stock typography and stock buttons have all been rejected.
5. **Ambiguous feedback: ask, do not guess.** Example: "you have instead have him running
   across the screen" could have meant three things; asking first avoided a wrong rebuild.
6. **Verify before claiming.** Build it, open it, look at it at desktop and phone size.
7. **He writes briefly and corrects readily.** Twice in the last hour a restatement of mine
   was wrong and he corrected it in one line. Restating is cheap; keep doing it.

## 3. What Cecil has decided (16 November, evening)

### 3.1 Two modes, never mixed

"I want a playful, interactive mode of the portfolio and I want a browser mode of the
portfolio." and "I hate mixing a browser view and a story mode view."

- The **interactive mode** is the pixel-art world: the street, the buildings, the lifts, the
  floors.
- The **browser mode** is a calm, professional site an employer can read quickly.
- Each is complete on its own. They do not share a screen, and one does not sit on top of the
  other. Much of the current site breaks this rule (section 5).

### 3.2 The interactive mode should feel like the real world

"Right now we've settled on the street with buildings. Buildings have floors and elevators.
This should resemble a real world feel. As I ascend or descend, I should be able to see that
I am passing through a certain floor. Once I get to a floor I should then see information
about said floor."

### 3.3 A floor is seen in first person, through the visitor's eyes

"I really think changing the view to first person in the floor elevates the interactive mode
a lot." and, correcting a misreading of mine: "The visitor remains a visitor, Cecil is still
a person on the floor. you should be able to see him in first person."

- The camera on a floor is the **visitor's** eyes, not Cecil's.
- Cecil is a person standing on the floor in front of you: your host. He is visible, he talks,
  he shows you things.
- An earlier session began a first-person lift seen through *Cecil's* eyes ("You're Cecil.
  Press your floor"). That is not this. It was removed. Do not bring it back.

### 3.4 Each floor is themed to its project, and Cecil dresses for it

"I am thinking of dressing my sprite different per floor. The floor should have the same theme
as the project. A financial app, financial related details. An audit management system having
audit management-themed."

### 3.5 It must sell him, by showing rather than telling

Each project floor has to get across the features he implemented, his role, and what the
project taught him, without paragraphs of text. The room and the things in it do the talking.

### 3.6 He does not like the current Musoni room

He confirmed all three reasons:

1. It is not a floor: it is a short strip of a room on top of a long scrolling article, which
   is the two modes mixed on one page.
2. It does not match the lobby: smaller, flatter, drawn at a different scale, so stepping out
   of the lift feels like arriving at a different website.
3. Its props are hard to read: a phone, a handset, a server, a monitor and a safe on a counter
   look like a shop shelf, not a place where lending software gets built.

### 3.7 Earlier decisions that still stand

- The approved look for the world: a pixel-art street in Nairobi at night, drawn in code, with
  pixel Cecil as the guide. Cecil wears a grey hoodie and blue trousers.
- Four buildings: Projects, Work Experience, Education, Contact (the post office). The newest
  work is on the highest floor.
- One sprite everywhere (the detailed 48x64 sheet). The lobby-to-floor ride must not be fast.
- Cecil is a guide who stands beside the thing he is talking about and reacts to what the
  visitor does. He must not be parked in one place or sent running across the screen.
- Audience for the browser mode: employers in Kenya. Dummy data is acceptable for now.
- An isometric town was tried and rejected. Do not revisit it.

## 4. Proposals made but NOT yet confirmed by Cecil

He has heard these and has not said yes or no. Treat them as a starting point for your own
assessment, and confirm with him before building on them.

**Assumed, not confirmed:** the street and the lift ride stay third-person, with Cecil
visible, and the view moves to the visitor's eyes when the lift doors open on a floor. Cecil
stepping out ahead of the visitor and turning to face them would join the two.

**The same four things on every floor**, so the pattern is learnt once:

1. What it is: a sign or board naming the project in one line.
2. What I did: something that gives Cecil's role.
3. Something to try: one thing the visitor can use.
4. What came of it: one result on the wall.

One room, one accent colour, five or six large objects at most, and nothing moving except
Cecil and whatever is being used.

**Themes and outfits**

| Floor | Room | Cecil wears | Thing to try |
|---|---|---|---|
| Musoni | A small lending office after hours | Shirt and tie, staff lanyard | The USSD phone |
| LexIMS | An audit records room, part still scaffolded | Hard hat and clipboard while in progress | Stamp a finding closed on a board |
| GikTek | An engineering office | The hoodie (his day job) | Undecided |
| Podii | An intern's corner | Backpack and lanyard | Undecided |
| Egerton | A lecture hall or library | Graduation gown and cap | Undecided |

**The Musoni floor, as last described to him**

The lift doors open and you look out into the lending office from where you stand. Cecil
steps out ahead of you and turns to face you in his shirt, tie and lanyard. He shows you:

- his staff badge ("Lead developer") and a notebook open at notes from sitting with the client
  (his role);
- the feature phone, which runs the USSD menu; the smartphone, which goes from sign-up to an
  offer to repaying; the laptop with the staff portal, where you approve a loan yourself; and
  possibly one safeguard shown the same way (the features);
- two or three sticky notes on the monitor in his handwriting (what it taught him; **the words
  must come from Cecil**);
- a board on the wall with the borrower count and "in testing for the Play Store" (the result).

Each object gets one short line from Cecil when you touch it. When he offers you something, it
comes up close so you can use it without leaving the floor. The long written case study moves
to the browser mode.

**New artwork this needs:** from a visitor's eye level Cecil is closer and larger than the
street sprite, so he must be drawn bigger and in more detail, with the same face, once per
outfit. This is the main thing Cecil should judge in the first still.

## 5. Where the site stands now, against those decisions

Everything below is in `~/LINUX/code/portfolio` (Astro, static output). It builds and was
checked in a headless browser. Nothing from 16 November has been committed to git by me, so
`git status` and `git diff` show the day's changes.

### 5.1 Worth keeping

- **The street** (`src/pages/index.astro`, `src/scripts/street.js`): the approved scene, four
  buildings, traffic, Cecil walking, the doorway transition into buildings.
- **The lobby and third-person lift** (`src/pages/[building].astro`,
  `src/scripts/building.js`, `src/styles/building.css`, floors in
  `src/content/buildings.js`). A ride takes about 4.5 seconds (`RIDE` in `building.js`).
  While it travels, the room being left and the room being reached slide past the cabin.
- **One Cecil** (`cecilActor`, `cecilScale` in `src/scripts/pixel.js`), drawn from
  `public/sprites/cecil-town.png`, generated by `design/town-cecil.py`. That script already
  produces a second outfit (`cecil-worker.png`, the hard-hat crew), so it is the place to add
  outfits for the small sprite.
- **The playable USSD phone** (`src/scripts/ussd.js`). It announces each step with a
  `ussd:state` event. This is the best "something to try" on the site and should move into
  the Musoni floor.
- **Musoni's verified branding** (`src/content/brands.js`, wordmarks in
  `public/brands/musoni`). Do not invent logos for anyone else.
- **Musoni's written case study** (the text in `src/pages/musoni.astro`): good raw material
  for the browser mode.

### 5.2 In conflict with the decisions, to be reworked or removed

- **Passing floors.** The lift slides from the departure room straight to the arrival room. On
  a ride of more than one floor the floors in between do not appear. Cecil wants to see each
  one pass.
- **Floors are not first person.** LexIMS, Podii, GikTek and Egerton are the lobby recoloured
  with a details pop-up. Musoni's floor leaves the building for a separate page.
- **The Musoni page** (`src/pages/musoni.astro`, `src/scripts/musoni.js`,
  `src/scripts/page-guide.js`): a room strip, then an article, then a guide, on one page. It
  is the mixed mode he dislikes. The room goes; the article belongs to the browser mode; the
  guide's behaviour (stand beside the thing, react to the visitor) is worth carrying into the
  floors.
- **The front page cover** (`#cover` and `#work` in `index.astro`, `src/styles/front.css`,
  `src/scripts/front.js`, `src/content/profile.js`): built an hour before this plan. It lays a
  professional panel over the live street with "See the work" and "Walk the street" side by
  side, which is exactly the mix and the over-stimulation he then objected to. Its parts may
  be reusable in the browser mode once that is designed calmly: the data file with visible
  "sample" tags, the type pairing (Anybody for display, Atkinson Hyperlegible Next for
  reading, both OFL, in `public/fonts`), the keycap button. He has not judged those parts
  individually. Do not assume he likes them.
- **Mode switches scattered through the street:** Explore and Wallpaper, "Front page",
  Directions, the hint, the status line, the destination bar, the bubble. Too much chrome.
- **`/work`** (`src/pages/work.astro`, from `src/content/story.ts`): a stale plain-text index
  from the first draft.
- **The `page` mechanism** in `buildings.js` (a floor that loads its own page, used by
  Musoni): a stopgap that will go once floors are first-person rooms.

### 5.3 Unused files, safe to delete

`src/components/Block.astro`, `BusinessCard.astro`, `Stage.astro`, `src/layouts/Base.astro`,
`src/scripts/mascot.ts`, `src/styles/global.css`, `scripts/build-sprites.mjs`,
`public/sprites/props.png`, `public/sprites/cecil.png` (the old small sprite),
`src/scripts/town.js`, `src/styles/town.css`, `src/data/nairobi-town.js`.

## 6. First task: the Musoni floor

1. **Assess.** Read `building.js` and `[building].astro`, run the site, ride the lift, look at
   `/musoni`. Form your own view of section 4 and say where you disagree.
2. **Confirm the open points with Cecil** (section 7), briefly. He prefers a short question to
   a wrong build.
3. **Draw one still** of the Musoni floor from the visitor's eyes: the lending office, the
   larger Cecil in his outfit, the objects in place. Nothing interactive. Show it to him.
4. **Only after he approves the still:** wire it in. The lift arrives, the doors open, the
   view becomes the visitor's, Cecil turns to welcome them, the objects respond, the USSD
   handset comes up close. Retire the `page` hop to `/musoni`.
5. **Make the ride show the floors it passes.**
6. **Keep it calm.** Before showing anything, remove one thing from it.

Then, in whatever order Cecil chooses: LexIMS floor, the other floors, the browser mode, the
contact card.

## 7. Open questions for Cecil

1. Does the lift ride stay third-person, with the view changing only when the doors open?
2. Is "the same four things on every floor" right, or should floors differ more?
3. Are the proposed outfits right?
4. Where does a visitor choose between the two modes, and which one does a shared link open?
   For employers in Kenya the browser mode is the safer landing, but this is his call.
5. What should the browser mode look like? Nothing calm has been shown to him yet.
6. Content only he can supply: what each project taught him (his words), real Musoni figures
   (two are placeholders marked "est."), app screenshots, his phone number for the card, a CV
   PDF, whether Stanbic Ghana may be named, and any freelance work.

## 8. Facts and rules for content

**Confirmed by Cecil**

- Musoni: a lending platform built at GikTek. The project began January 2026; he picked it up
  in May, led it, and closed the build in late July or early August. In testing ahead of a
  Play Store release. Over 130 active users. He built the Flutter app, the Spring Boot
  backend, the staff portal and the USSD channel. Device binding, certificate pinning, app
  attestation and screen protection are in the release build. Grafana, Loki and Prometheus are
  deployed and in use. He sat with the client to understand what borrowers needed.
- LexIMS: an audit management system, in progress. His focus: streamlining workflows,
  improving the interface, adding an intelligence layer.
- Podii Consultants: technical intern, April to September 2024 (Elixir, QA, agile).
- GikTek: software developer, April 2025 to present. Angular was used on a Stanbic Ghana
  project.
- GitHub: github.com/lwalacecil (work), github.com/cecillwala (personal). Public contact
  email: lwalacecil13@gmail.com.

**Rules**

- LexIMS: it may be named. Never mention a partner or client. No architecture details.
- Musoni: name features and safeguards, never how they are built.
- Every claim must trace to Cecil's words, his CV or his repositories. Anything invented is
  sample data and must be visibly marked as such until he replaces it.
- The USSD demo's steps are real; its amounts, fee and dates are made up and labelled so.
- His account email is private. Do not send it to any outside service.
- After 27 November 2026, "I graduate on 27 November" must change.

## 9. Practical notes

- `npm install`, `npm run dev`, `npm run build`. Astro 7, plain JavaScript modules, Canvas 2D.
- All pixel art is drawn in code at whole-pixel scale. Scenes are low-resolution canvases;
  Cecil is a separate full-detail canvas laid over them so his face stays sharp.
- Sound is synthesised, off by default. Reduced motion is respected throughout; keep it so.
- If you are a cloud session linked to his computer, you have no shell there: list and stage
  files from `~/LINUX/code/portfolio`, build and screenshot in your own workspace, and write
  results back file by file. Remote deletion is not possible; give him an `rm` command.
- The claude.ai PORTFOLIO project holds a copy of this plan as `claude/portfolio-plan.md`.
  Its other documents are older and partly superseded; where they disagree with this file,
  this file is right.
