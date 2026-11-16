from PIL import Image
SHEET = Image.open('tiles/roguelikeSheet_transparent.png').convert('RGBA')
T, P = 16, 17
def tile(c, r):
    return SHEET.crop((c * P, r * P, c * P + T, r * P + T))
class Map:
    def __init__(s, w, h, base=(5, 0)):
        s.w, s.h = w, h
        s.im = Image.new('RGBA', (w * T, h * T), (0, 0, 0, 0))
        g = tile(*base)
        for y in range(h):
            for x in range(w):
                s.im.paste(g, (x * T, y * T))
    def put(s, x, y, c, r):
        if 0 <= x < s.w and 0 <= y < s.h:
            s.im.alpha_composite(tile(c, r), (x * T, y * T))
    def nine(s, x, y, w, h, c0, r0):
        for j in range(h):
            for i in range(w):
                cc = c0 + (0 if i == 0 else 2 if i == w - 1 else 1)
                rr = r0 + (0 if j == 0 else 2 if j == h - 1 else 1)
                s.put(x + i, y + j, cc, rr)
    def fill(s, x, y, w, h, c, r):
        for j in range(h):
            for i in range(w):
                s.put(x + i, y + j, c, r)
    def tree(s, x, y, c):  # tall tree, y is the trunk tile
        s.put(x, y - 1, c, 10); s.put(x, y, c, 11)
    def building(s, x, y, w, roof, wall, door=None, wins=(), roof_h=3):
        # roof: column of a flat 3x3 roof set (rows 21-23); wall: first column of a 4-wide wall set (rows 16-17)
        s.nine(x, y, w, roof_h, roof, 21)
        for j, r in enumerate((16, 17)):
            for i in range(w):
                cc = wall + (0 if i == 0 else 3 if i == w - 1 else 1 + (i % 2))
                s.put(x + i, y + roof_h + j, cc, r)
        for i in wins:
            s.put(x + i, y + roof_h, *WIN)
        if door is not None:
            s.put(x + door, y + roof_h + 1, *DOOR)
WIN = (41, 0); DOOR = (32, 0)
