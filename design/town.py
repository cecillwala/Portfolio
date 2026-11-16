import sys; sys.path.insert(0, '.')
from tiles import *
from PIL import ImageDraw
import random
random.seed(7)

FONT = {  # 3x5 pixel letters for building signs
 'E':'111 100 110 100 111','G':'111 100 101 101 111','R':'110 101 110 101 101','T':'111 010 010 010 010',
 'O':'111 101 101 101 111','N':'1001 1101 1011 1001 1001','P':'111 101 111 100 100','D':'110 101 101 101 110',
 'I':'111 010 010 010 111','K':'101 101 110 101 101','M':'10001 11011 10101 10001 10001','U':'101 101 101 101 111',
 'S':'111 100 111 001 111','L':'100 100 100 100 111','X':'101 101 010 101 101',' ':'000 000 000 000 000'}

def sign(im, cx, y, text, bg, fg):
    widths = [len(FONT[ch].split()[0]) for ch in text]
    w = sum(widths) + len(text) - 1 + 4
    x = cx - w // 2
    d = ImageDraw.Draw(im)
    d.rectangle((x, y, x + w - 1, y + 8), fill=bg)
    cur = x + 2
    for ch, cw in zip(text, widths):
        for r, row in enumerate(FONT[ch].split()):
            for c, v in enumerate(row):
                if v == '1': im.putpixel((cur + c, y + 2 + r), fg)
        cur += cw + 1

def tint(im, box, rgb, amt=0.75):
    x0, y0, x1, y1 = box
    px = im.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            if a == 0: continue
            lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255
            t = tuple(int(c * (0.45 + 0.75 * lum)) for c in rgb)
            px[x, y] = tuple(min(255, int(o * (1 - amt) + n * amt)) for o, n in zip((r, g, b), t)) + (a,)

W, H = 30, 15
m = Map(W, H)
# roads (sand): two streets and a connector
for y0 in (6, 13):
    for x in range(W):
        m.put(x, y0, 8, 21); m.put(x, y0 + 1, 8, 23)
for y in range(7, 14):
    m.put(14, y, 7, 22); m.put(15, y, 9, 22)
for x, y in ((14, 7), (15, 7), (14, 13), (15, 13)):
    m.put(x, y, 8, 22)
# pond and park
m.nine(19, 9, 5, 3, 2, 0)
for x, y, c in ((17, 9, 13), (18, 12, 15), (25, 10, 16), (27, 9, 13), (26, 12, 18), (28, 11, 15), (24, 12, 14)):
    m.tree(x, y, c)
for x in (20, 21, 22): m.put(x, 12, 19 + x % 3, 9)
for x, y in ((0, 9), (0, 10), (1, 10), (28, 14 - 6), (29, 9)):
    m.put(x, y, 20, 9)
# top tree line
for x in range(0, W, 1):
    if x % 5 in (0, 3): m.tree(x, 0 + 0, (13, 15, 16, 18)[x % 4]) if False else None
# buildings: (name, x, y, w, roof set, wall set, door, windows, tint)
B = [
 ('EGERTON', 1, 1, 6, 17, 13, 3, (1, 4), (56, 183, 100)),
 ('PODII', 9, 1, 4, 24, 20, 1, (2,), (120, 80, 170)),
 ('GIKTEK', 16, 1, 6, 31, 27, 2, (1, 4), (59, 93, 201)),
 ('MUSONI', 24, 1, 5, 38, 34, 2, (1, 3), (239, 125, 87)),
 ('LEXIMS', 2, 8, 6, 31, 27, 3, (1, 4), (37, 113, 121)),
 ('POST', 9, 8, 4, 17, 13, 2, (1,), (177, 62, 83)),
]
for name, x, y, w, roof, wall, door, wins, col in B:
    m.building(x, y, w, roof, wall, door=door, wins=wins)
    tint(m.im, (x * T, y * T, (x + w) * T, (y + 3) * T), col)
    sign(m.im, x * T + w * T // 2, (y + 3) * T - 11, name, (26, 28, 44, 255), (244, 244, 244, 255))
# rooftop props: water tanks, an aerial, vents
d = ImageDraw.Draw(m.im)
def tank(x, y):
    d.ellipse((x, y, x + 10, y + 10), fill=(26, 28, 44, 255)); d.ellipse((x + 2, y + 2, x + 8, y + 8), fill=(51, 60, 87, 255)); d.point((x + 3, y + 3), fill=(148, 176, 194, 255))
def vent(x, y):
    d.rectangle((x, y, x + 9, y + 6), fill=(86, 108, 134, 255)); d.rectangle((x + 1, y + 1, x + 8, y + 5), fill=(148, 176, 194, 255))
    for i in (2, 4, 6): d.line((x + i, y + 2, x + i, y + 4), fill=(86, 108, 134, 255))
def aerial(x, y):
    d.line((x, y, x, y + 14), fill=(26, 28, 44, 255)); d.line((x - 3, y + 3, x + 3, y + 3), fill=(26, 28, 44, 255)); d.line((x - 2, y + 6, x + 2, y + 6), fill=(26, 28, 44, 255)); d.point((x, y), fill=(239, 125, 87, 255))
tank(1 * T + 6, 1 * T + 6); vent(5 * T, 1 * T + 8); tank(10 * T + 40, 1 * T + 6)
aerial(17 * T, 1 * T + 5); vent(18 * T + 6, 1 * T + 6); vent(19 * T + 4, 1 * T + 6); tank(20 * T + 14, 1 * T + 18)
tank(24 * T + 6, 1 * T + 8); vent(27 * T + 2, 1 * T + 10)
vent(3 * T, 8 * T + 8); vent(4 * T, 8 * T + 8); tank(6 * T + 12, 8 * T + 6); aerial(10 * T, 8 * T + 4); tank(11 * T + 12, 8 * T + 10)
# small details
for x in (7, 13, 22): m.put(x, 5, 17, 7)   # street lamps
m.put(13, 12, 20, 0); m.put(16, 12, 21, 0)  # signposts at the junction
for x in (0, 1): m.put(x, 12, 46 + x, 23)
m.im.save('town.png')
m.im.resize((W * T * 3, H * T * 3), Image.NEAREST).convert('RGB').save('/tmp/dl/town3.png')
print(m.im.size)
