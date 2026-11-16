# Design working files (style boards, 2026-11-15)

These scripts made the three style boards Cecil is choosing between (Daylight, Night shift,
Game manual). They are Python with Pillow; the boards are HTML rendered by headless Chrome.

- `tiles.py`: tile-map composer over Kenney's Roguelike pack (CC0, see `tiles/License.txt`;
  fetched from github.com/mapeditor/tiled-resources because kenney.nl was unreachable).
- `town.py`: the town map (six buildings, roads, pond, rooftop props, signs). Writes `town.png`.
- `variants.py`: recolours the town for the night and two-ink directions.
- `cecil.py`: pixel Cecil v2 (grey hoodie, blue trousers, outline, shading). Writes `cecil2.png`.
- `make_boards.py`: builds the six HTML boards in `out/`. Needs the fonts from npm
  (`@fontsource-variable/archivo`, `@fontsource-variable/bricolage-grotesque`,
  `@fontsource/bitcount-grid-double`) and Departure Mono in `fonts/`.
- `boards/`: the rendered boards as PNG.

Some paths still point at the cloud workspace's scratch folders (for example the screenshot
output in `variants.py` and `cecil.py`); adjust them before re-running locally.
Once a direction is chosen, the map, sprite and palette move into the site's build
(`scripts/` in the repo) and this folder becomes history.
