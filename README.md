# Cecil Lwala: portfolio

A portfolio that opens on a pixel-art street in Nairobi at night. Each building is a place in
Cecil's career. Pixel Cecil walks to whichever one you pick and takes you through the door.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/ (about 160 KB)
```

- The street (home page): `src/pages/index.astro`, drawn by `src/scripts/street.js`
- Musoni: `src/pages/musoni.astro`, `src/scripts/musoni.js`, `src/scripts/ussd.js`
- Everything in plain text: `src/pages/work.astro` (built from `src/content/story.ts`)
- Shared drawing, lettering, sprite and sound helpers: `src/scripts/pixel.js`
- Colours and type: `src/styles/night.css`
- Cecil's sprite: `public/sprites/cecil.png`, drawn by `design/cecil.py`
- Plan and status: `docs/EXECUTION_PLAN.md` and `HANDOFF.md`
