import sys; sys.path.insert(0,'.')
from PIL import Image, ImageDraw
import town
from tiles import tile, T
hx=lambda h:(int(h[1:3],16),int(h[3:5],16),int(h[5:7],16))
def nearest(p,pal): return min(pal,key=lambda c:(c[0]-p[0])**2+(c[1]-p[1])**2+(c[2]-p[2])**2)
def remap(im,fn):
    out=im.copy(); px=out.load(); cache={}
    for y in range(out.height):
        for x in range(out.width):
            r,g,b,a=px[x,y]
            if a==0: continue
            k=(r,g,b)
            if k not in cache: cache[k]=fn(k)
            px[x,y]=cache[k]+(a,)
    return out
src=Image.open('town.png').convert('RGBA')
GRASS=set(tile(5,0).convert('RGB').getdata())
lum=lambda p:(0.3*p[0]+0.59*p[1]+0.11*p[2])/255
sand=lambda p:p[0]>205 and p[1]>190 and 150<p[2]<215
# A: daylight. Kenney's own colours, roofs tinted with the accent set.
src.save('town_a.png')
# B: night. Everything pulled into a blue ramp, then windows and lamps lit.
NIGHT=[hx(c) for c in '#1a1c2c #29366f #333c57 #3b5dc9 #566c86 #5d275d #257179 #94b0c2'.split()]
def night(p):
    if p==(244,244,244) or p==(26,28,44): return p
    if p in GRASS: return hx('#1a1c2c') if (p[0]+p[1])%3 else hx('#29366f')
    if sand(p): return hx('#333c57')
    return nearest((p[0]*0.42+6,p[1]*0.50+10,p[2]*0.78+34),NIGHT)
B=remap(src,night); pb=B.load(); ps=src.load()
LIT=hx('#ffcd75')
for name,x,y,w,roof,wall,door,wins,col in town.B:
    for i in wins:
        for yy in range((y+3)*T,(y+4)*T):
            for xx in range((x+i)*T,(x+i+1)*T):
                if lum(ps[xx,yy])<0.36: pb[xx,yy]=LIT+(255,)
d=ImageDraw.Draw(B)
for lx in (7,13,22):
    cx,cy=lx*T+8,5*T+4
    d.rectangle((cx-2,cy-2,cx+1,cy+1),fill=LIT+(255,)); d.rectangle((cx-1,cy-4,cx,cy-3),fill=hx('#f4f4f4')+(255,))
B.save('town_b.png')
# C: two inks on yellow paper, like a printed game manual.
def duo(p):
    if p==(244,244,244): return p
    if p in GRASS: return hx('#ffcd75')
    if sand(p): return hx('#f4f4f4')
    l=lum(p)
    return hx('#1a1c2c') if l<0.34 else hx('#3b5dc9') if l<0.74 else hx('#f4f4f4')
C=remap(src,duo); pc=C.load()
for name,x,y,w,roof,wall,door,wins,col in town.B:      # walls: keep them light so doors and windows read
    for yy in range((y+3)*T,(y+5)*T):
        for xx in range(x*T,(x+w)*T):
            p=ps[xx,yy][:3]
            if p==(244,244,244) or p==(26,28,44): continue
            l=lum(p)
            pc[xx,yy]=(hx('#1a1c2c') if l<0.3 else hx('#3b5dc9') if l<0.56 else hx('#f4f4f4'))+(255,)
C.save('town_c.png')
out=Image.new('RGB',(960,490*2),(255,255,255))
for i,im in enumerate((B,C)): out.paste(im.resize((960,480),Image.NEAREST).convert('RGB'),(0,i*490))
out.save('/tmp/dl/variants.png')
