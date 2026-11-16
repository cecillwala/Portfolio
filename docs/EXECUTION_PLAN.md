# Portfolio execution plan (night street)

Owner: Cecil Lwala. This plan replaces the first one, whose design Cecil rejected on 2026-11-15.
The direction below was approved on 2026-11-16 after he saw the night street scene test.
Tick items off as they land and keep `HANDOFF.md` in step.

## What we are building

A portfolio that opens on a pixel-art street in Nairobi at night. Each building is a place in
Cecil's career, with a neon sign: Egerton, Podii, GikTek, Musoni, LexIMS and a post office for
contact. Pixel Cecil is the guide: he walks to whatever the visitor picks, talks, and takes them
through the door. Behind every door is a full page: an interior scene with things to click, then
long-form content in large type.

Source of truth for facts and copy: `src/content/story.ts` (facts) and the page files themselves
(long-form copy). Confirmed facts are listed in `HANDOFF.md`.

## Rules that do not change

- **One world, one palette.** Night navy, warm window light, one neon colour per place. No new
  colour schemes per page.
- **Type.** Departure Mono for all text; place names as large pixel neon. No other typefaces
  without Cecil's say-so.
- **Art is drawn by code** on canvas at whole-number pixel scale. The only image file is Cecil's
  sprite sheet (`design/cecil.py` draws it). If Cecil commissions a better sheet it drops in.
- **Cecil guides.** He reacts to clicks, hover, keys and idleness, not only to scrolling.
- **Depth.** Every job and project gets a full page. No card with a title and two lines.
- **LexIMS:** never name a partner or client, never describe architecture.
- **Musoni:** name features and safeguards, never how they are built. Nothing from internal
  reviews. Demo figures in the USSD simulation are labelled as made up.
- **Honesty:** every claim traces to the CV, the repos or Cecil's words. Estimates show an
  "est." tag until confirmed. Illustrations are labelled as illustrations, not screenshots.
- **Sound** is off until the visitor turns it on, and the choice is remembered.
- Reduced motion is respected. Every place is reachable by keyboard and screen reader.
- British English.

## Stack

Astro (static) with plain JavaScript modules for the scenes. Canvas 2D. Web Audio for sound
(synthesised, no audio files). Departure Mono self-hosted. No animation or 3D library yet.

## Phases

### Phase 1. The street and the first door
- [x] Street scene as the home page, with name, role and a way to skip to plain text
- [x] Cecil offers reply buttons; "Go in" at a doorway; doorway transition
- [x] Musoni page: interior scene with clickable props, neon title, facts, figures, full
      sections, pixel phone illustrations, playable USSD menu
- [x] Plain work index (`/work`): everything in text for visitors in a hurry
- [ ] First run on Cecil's machine and his review

### Phase 2. The other doors
- [ ] LexIMS: the archive. Workflows, interface, intelligence layer (ask-a-question demo with
      canned answers and sources), guardrails, what is next
- [ ] GikTek: the tower. Six floors, one per skill; a small cluster that heals itself
- [ ] Podii: the first desk. Stand-ups, shadowing, QA, Elixir
- [ ] Egerton: the campus hall. Degree, graduation on 27 November 2026
- [ ] Post office: the business card as its own scene (large card, turn it, flip it, QR, save
      contact, copy email, CV)

### Phase 3. Cecil as a fuller guide
- [ ] He follows the visitor down long pages and points at the next thing to try
- [ ] Idle behaviours (checks his phone, stretches), reactions to hover
- [ ] First-visit greeting that depends on the visitor's local time
- [ ] More sprite poses: sit, type, carry

### Phase 4. Content from Cecil
- [ ] Phone number for the card
- [ ] Real Musoni figures in place of the two estimates
- [ ] Real app screenshots to sit beside the illustrations
- [ ] CV PDF
- [ ] Confirm Stanbic Ghana may be named; confirm the fine-tuning wording
- [ ] One paragraph per place on what he learnt (his words)

### Phase 5. Polish and launch
- [ ] Phone layout and touch controls on the street
- [ ] Day and night versions of the street by local time
- [ ] GitHub contributions grid (both accounts merged), fetched at build time
- [ ] Performance check, page titles, social preview image
- [ ] Git repository, hosting, domain, final confidentiality read-through

## How to verify a phase

1. `npm run build` passes.
2. `npm run dev`; walk to every door with the mouse and with the arrow keys; go in and come back.
3. On each inner page: click every prop in the interior, run the USSD menu to the end.
4. Turn sound on and listen. Turn on reduced motion and check nothing moves on its own.
5. Check at 390 px wide.
6. Update the tick boxes here and the status block in `HANDOFF.md`.
