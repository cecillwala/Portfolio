"""The town's larger, expressive sprite. 48x64 frames; original room sprite stays compatible."""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INK='#171a29'; HAIR='#242432'; SK='#995f40'; SH='#73442f'; HI='#b67b53'
# What he wears. The hoodie is the street and lobby Cecil; each project floor can dress him for the job.
# near = his relaxed right arm (our left), far = the other arm relaxed, out/fore = that arm raised or pointing.
OUTFITS={
 'hoodie':dict(body='#99a9b6',lit='#bcc7cf',shade='#697d91',near='#a8b8c5',near_cuff='#8497a8',far='#7e91a3',far_cuff='#697d91',
               out='#9aaebc',out_cuff='#7e91a3',fore='#aebdc7',side='#b4c0ca',side_cuff='#8fa0b0'),
 'office':dict(body='#dfe7ef',lit='#f4f7fa',shade='#b4c2d2',near='#f4f7fa',near_cuff='#b4c2d2',far='#b4c2d2',far_cuff='#9fb0c2',
               out='#b4c2d2',out_cuff='#9fb0c2',fore='#c6d2de',side='#e6edf3',side_cuff='#b4c2d2'),
}
TIE='#0B1F5C'; LANYARD='#61BC00'   # Musoni's navy and green, from src/content/brands.js
def limb(im,parts):
 """Draw an arm from (x0,y0,x1,y1,colour) boxes and give it the same one-pixel outline as the body.
 Arms are shaped, not straight bars: rounded shoulder, cuff, small round hand (Cecil, 16 Nov)."""
 a=Image.new('RGBA',im.size);ad=ImageDraw.Draw(a)
 for x0,y0,x1,y1,c in parts:ad.rectangle((x0,y0,x1,y1),fill=c)
 o=Image.new('RGBA',im.size,INK);o.putalpha(a.getchannel('A').filter(ImageFilter.MaxFilter(3)))
 im.alpha_composite(o);im.alpha_composite(a)
def frame(pose=0,outfit='hoodie'):
 im=Image.new('RGBA',(48,64));d=ImageDraw.Draw(im)
 def r(box,c):d.rectangle(box,fill=c)
 o=OUTFITS[outfit]
 bob=1 if pose in (4,6) else 0
 # trousers and grounded shoes
 shift=[0,0,0,-3,0,3,0,0,0,0][pose]
 r((15-shift,48,22-shift,59),INK);r((25+shift,48,32+shift,59),INK)
 r((16-shift,49,21-shift,57),'#486ab4');r((26+shift,49,31+shift,57),'#355089')
 r((13-shift,58,22-shift,62),INK);r((25+shift,58,35+shift,62),INK)
 r((14-shift,61,22-shift,62),'#cbd5dd');r((26+shift,61,35+shift,62),'#cbd5dd')
 # body and sleeves in the outfit's colours
 r((12,32+bob,35,49+bob),INK);r((13,33+bob,34,48+bob),o['body'])
 r((13,34+bob,16,46+bob),o['lit']);r((31,34+bob,34,48+bob),o['shade'])
 b=bob
 # His right arm (our left) hangs relaxed in every front pose.
 arms=[(11,35+b,12,35+b,o['near']),(10,36+b,12,44+b,o['near']),(10,45+b,12,45+b,o['near_cuff']),
       (10,46+b,12,48+b,SK),(10,49+b,11,49+b,SK),(10,46+b,10,47+b,HI)]
 if pose in (8,9):
  # Lift the hand clear of the head; two wrist positions make a gentle wave.
  w=1 if pose==9 else 0
  arms+=[(35,32+b,38,36+b,o['out']),(37,22+b,40,33+b,o['out']),(40,16+b,43,24+b,o['fore']),(40,14+b,43,15+b,o['near_cuff']),
         (40+w,8+b,43+w,13+b,SK),(41+w,7+b,42+w,7+b,SK),(40+w,8+b,40+w,10+b,HI)]
 elif pose==7:
  # Pointing: the arm slopes down from the shoulder and ends in a finger.
  arms+=[(35,36+b,38,39+b,o['out']),(39,37+b,42,40+b,o['out']),(41,37+b,42,40+b,o['out_cuff']),
         (43,38+b,45,40+b,SK),(46,38+b,47,38+b,SK),(43,37+b,44,37+b,SK)]
 else:
  arms+=[(35,35+b,36,35+b,o['far']),(35,36+b,37,44+b,o['far']),(35,45+b,37,45+b,o['far_cuff']),
         (35,46+b,37,48+b,SK),(36,49+b,37,49+b,SK)]
 limb(im,arms)
 if outfit=='office':
  # belt, collar, tie, staff lanyard and badge
  r((13,47+b,34,48+b),'#1d1f2e');r((23,47+b,24,48+b),'#c9b07a')
  r((17,30+b,30,33+b),o['lit']);r((17,34+b,21,35+b),o['lit']);r((26,34+b,30,35+b),o['body']);r((17,36+b,30,36+b),o['shade'])
  r((22,32+b,25,35+b),TIE);r((22,36+b,25,40+b),TIE);r((22,36+b,22,40+b),'#2443a0')
  r((20,37+b,20,39+b),LANYARD);r((27,37+b,27,39+b),LANYARD)
  r((20,40+b,27,46+b),INK);r((21,41+b,26,45+b),'#f4efd8');r((21,41+b,26,41+b),LANYARD)
  r((22,43+b,23,44+b),SK);r((22,43+b,23,43+b),HAIR);r((25,43+b,25,43+b),'#8a93a3');r((25,44+b,25,44+b),'#8a93a3')
 else:
  # kangaroo pocket, drawstrings and the hood's collar
  r((18,42+bob,29,46+bob),'#71879a');r((19,42+bob,28,44+bob),'#9caebb')
  r((20,35+bob,21,40+bob),'#e8e5da');r((27,35+bob,28,40+bob),'#e8e5da')
  r((17,30+bob,30,35+bob),'#607183')
 # The front view has no neck patch: the chin sits straight on the collar (Cecil, 16 Nov).
 # larger head silhouette, ears, warm cheek planes
 d.rounded_rectangle((10,8+bob,36,31+bob),radius=5,fill=INK)
 r((8,17+bob,11,23+bob),SH);r((36,17+bob,39,23+bob),SH)
 d.rounded_rectangle((11,8+bob,35,29+bob),radius=4,fill=SK)
 r((12,13+bob,15,23+bob),HI);r((32,11+bob,35,26+bob),SH)
 r((15,28+bob,31,30+bob),SH);r((19,29+bob,28,30+bob),'#8a5138')
 # a close crop, six pixels tall (it was ten: Cecil, 16 Nov), temples, defined brow line
 d.rounded_rectangle((11,7+bob,35,12+bob),radius=3,fill=HAIR)
 for x,y in [(14,9),(20,8),(26,9),(30,10)]:r((x,y+bob,x+2,y+1+bob),'#3b3b49')
 r((11,11+bob,13,17+bob),HAIR);r((33,10+bob,35,16+bob),HAIR)
 r((14,14+bob,20,15+bob),INK);r((26,14+bob,32,15+bob),INK)
 if pose==1:
  r((15,18+bob,19,18+bob),INK);r((27,18+bob,31,18+bob),INK)
 else:
  # Draw both eyes with the same coordinates relative to their outer corner.
  for eye_x in (14,26):
   r((eye_x,17+bob,eye_x+6,20+bob),'#e5d8c5')
   r((eye_x+2,17+bob,eye_x+4,20+bob),INK)
   r((eye_x+2,17+bob,eye_x+2,17+bob),'#ffffff')
 # nose bridge, nostril, smile and lower lip
 r((23,18+bob,24,22+bob),HI);r((22,23+bob,26,23+bob),SH)
 if pose==2:
  r((20,25+bob,28,28+bob),INK);r((21,25+bob,27,25+bob),'#f0dfc5');r((23,28+bob,26,28+bob),'#b57568')
 else:
  # Closed, relaxed smile: one warm line, no teeth or dark open cavity.
  r((19,26+bob,28,26+bob),'#603d30');r((19,25+bob,19,25+bob),'#603d30');r((28,25+bob,28,25+bob),'#603d30')
  r((22,28+bob,26,28+bob),HI)
 return im
def side(step,outfit='hoodie'):
 """Right-facing profile with a contact / passing / contact / passing gait."""
 im=Image.new('RGBA',(48,64));d=ImageDraw.Draw(im)
 def r(box,c):d.rectangle(box,fill=c)
 o=OUTFITS[outfit]
 bob=(0,1,0,1)[step]
 stride=(5,0,-5,0)[step]
 far_lift=3 if step==3 else 0
 near_lift=3 if step==1 else 0
 # Far leg moves opposite the near leg, with lifted passing feet.
 r((22-stride,47,28-stride,58-far_lift),INK);r((23-stride,48,27-stride,57-far_lift),'#355089')
 r((21-stride,58-far_lift,31-stride,61-far_lift),INK);r((22-stride,61-far_lift,31-stride,62-far_lift),'#cbd5dd')
 r((22+stride,47,29+stride,59-near_lift),INK);r((23+stride,48,28+stride,58-near_lift),'#486ab4')
 r((22+stride,59-near_lift,33+stride,62-near_lift),INK);r((23+stride,62-near_lift,33+stride,62-near_lift),'#cbd5dd')
 # Narrower torso, hood (or collar and tie) and counter-swinging arms.
 r((16,32+bob,31,49+bob),INK);r((17,33+bob,30,48+bob),o['body'])
 if outfit=='office':
  r((17,35+bob,19,47+bob),o['shade']);r((17,47+bob,30,48+bob),'#1d1f2e')
  r((22,31+bob,30,33+bob),o['lit']);r((29,34+bob,30,42+bob),TIE)
 else:
  r((15,30+bob,22,36+bob),'#607183');r((17,35+bob,19,47+bob),'#71879a')
 arm=(3,0,-3,0)[step]
 limb(im,[(25-arm,35+bob,27-arm,35+bob,o['side']),(24-arm,36+bob,27-arm,43+bob,o['side']),(24-arm,44+bob,27-arm,44+bob,o['side_cuff']),
          (24-arm,45+bob,27-arm,47+bob,SK),(25-arm,48+bob,26-arm,48+bob,SK)])
 r((24,29+bob,29,34+bob),SH)
 # A real profile: one visible eye, ear behind it, nose and chin facing right.
 d.rounded_rectangle((13,8+bob,35,30+bob),radius=4,fill=INK)
 d.rounded_rectangle((15,9+bob,34,29+bob),radius=3,fill=SK)
 r((34,19+bob,38,22+bob),HI);r((34,23+bob,36,25+bob),SK)
 r((18,18+bob,21,24+bob),SH);r((19,19+bob,20,22+bob),HI)
 r((18,28+bob,32,30+bob),SH)
 d.rounded_rectangle((13,7+bob,34,13+bob),radius=3,fill=HAIR)
 r((14,12+bob,18,20+bob),HAIR)
 for x,y in [(17,9),(23,8),(28,10)]:r((x,y+bob,x+2,y+1+bob),'#3b3b49')
 r((27,14+bob,33,15+bob),INK)
 r((27,17+bob,33,20+bob),'#e5d8c5');r((30,17+bob,32,20+bob),INK);r((30,17+bob,30,17+bob),'#ffffff')
 r((29,25+bob,35,25+bob),'#603d30');r((30,27+bob,33,27+bob),HI)
 return im

sheet=Image.new('RGBA',(480,64))
for i in range(10):sheet.alpha_composite(side(i-3) if 3<=i<=6 else frame(i),(i*48,0))
sheet.save(ROOT/'public/sprites/cecil-town.png')

# The same Cecil in construction gear, used only on unfinished project floors.
worker=Image.new('RGBA',(480,64))
for i in range(10):
 im=side(i-3) if 3<=i<=6 else frame(i)
 d=ImageDraw.Draw(im)
 if 3<=i<=6:
  d.rectangle((18,34,30,46),fill='#f3b83f');d.rectangle((18,40,30,42),fill='#f4efd8')
 else:
  d.rectangle((15,34,32,46),fill='#f3b83f');d.rectangle((15,40,32,42),fill='#f4efd8')
  d.rectangle((19,34,20,46),fill='#f4efd8');d.rectangle((28,34,29,46),fill='#f4efd8')
 # the hard hat sits on the lower crop
 d.rounded_rectangle((11,3,36,10),radius=4,fill='#f5b835')
 d.rectangle((9,9,39,11),fill='#e89624');d.rectangle((22,4,25,8),fill='#ffdb70')
 worker.alpha_composite(im,(i*48,0))
worker.save(ROOT/'public/sprites/cecil-worker.png')

# Cecil dressed for the Musoni floor: shirt, tie and staff lanyard.
office=Image.new('RGBA',(480,64))
for i in range(10):office.alpha_composite(side(i-3,'office') if 3<=i<=6 else frame(i,'office'),(i*48,0))
office.save(ROOT/'public/sprites/cecil-office.png')

# The browser-tab icon: his face from the idle frame, so the tab shows the same Cecil as the site.
icon=Image.new('RGBA',(80,80),'#12163f')
icon.alpha_composite(sheet.crop((6,6,42,42)).resize((72,72),Image.NEAREST),(4,8))
icon.save(ROOT/'public/favicon.png')
