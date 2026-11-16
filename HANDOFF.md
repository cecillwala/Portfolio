# Handoff: Cecil Lwala's portfolio

Read this first if you are picking the work up, whether you are Cecil or a new Claude session.
The plan with tick boxes is `docs/EXECUTION_PLAN.md`.

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

Cecil runs it and reviews. Then Phase 2: the other five doors, starting with LexIMS.

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
