"""The town's larger, expressive sprite. 48x64 frames; original room sprite stays compatible."""
from PIL import Image, ImageDraw
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INK='#171a29'; HAIR='#242432'; SK='#995f40'; SH='#73442f'; HI='#b67b53'
def frame(pose=0):
 im=Image.new('RGBA',(48,64));d=ImageDraw.Draw(im)
 def r(box,c):d.rectangle(box,fill=c)
 bob=1 if pose in (4,6) else 0
 # trousers and grounded shoes
 shift=[0,0,0,-3,0,3,0,0,0,0][pose]
 r((15-shift,48,22-shift,59),INK);r((25+shift,48,32+shift,59),INK)
 r((16-shift,49,21-shift,57),'#486ab4');r((26+shift,49,31+shift,57),'#355089')
 r((13-shift,58,22-shift,62),INK);r((25+shift,58,35+shift,62),INK)
 r((14-shift,61,22-shift,62),'#cbd5dd');r((26+shift,61,35+shift,62),'#cbd5dd')
 # hoodie, sleeves, kangaroo pocket, folds and drawstrings
 r((12,32+bob,35,49+bob),INK);r((13,33+bob,34,48+bob),'#99a9b6')
 r((13,34+bob,16,46+bob),'#bcc7cf');r((31,34+bob,34,48+bob),'#697d91')
 r((9,34+bob,13,48+bob),INK);r((10,35+bob,12,46+bob),'#a8b8c5');r((10,47+bob,13,50+bob),SK)
 if pose in (8,9):
  # Lift the hand clear of the head; two wrist positions make a gentle wave.
  wrist=1 if pose==9 else 0
  r((34,31+bob,39,38+bob),INK);r((36,20+bob,41,35+bob),INK)
  r((39,12+bob,44,25+bob),INK)
  r((37,21+bob,40,34+bob),'#9aaebc');r((40,13+bob,43,23+bob),'#aebdc7')
  r((40+wrist,6+bob,43+wrist,13+bob),SK)
  r((40+wrist,4+bob,41+wrist,7+bob),HI);r((43+wrist,5+bob,44+wrist,8+bob),SK)
 elif pose==7:
  r((34,35+bob,45,40+bob),INK);r((35,36+bob,42,39+bob),'#9aaebc');r((43,36+bob,47,38+bob),SK)
 else:
  r((34,34+bob,38,48+bob),INK);r((35,35+bob,37,46+bob),'#7e91a3');r((35,47+bob,38,50+bob),SK)
 r((18,42+bob,29,46+bob),'#71879a');r((19,42+bob,28,44+bob),'#9caebb')
 r((20,35+bob,21,40+bob),'#e8e5da');r((27,35+bob,28,40+bob),'#e8e5da')
 # neck / hood
 r((17,30+bob,30,35+bob),'#607183');r((21,29+bob,27,33+bob),SH)
 # larger head silhouette, ears, warm cheek planes
 d.rounded_rectangle((10,4+bob,36,31+bob),radius=5,fill=INK)
 r((8,17+bob,11,23+bob),SH);r((36,17+bob,39,23+bob),SH)
 d.rounded_rectangle((11,8+bob,35,29+bob),radius=4,fill=SK)
 r((12,13+bob,15,23+bob),HI);r((32,11+bob,35,26+bob),SH)
 r((15,28+bob,31,30+bob),SH);r((19,29+bob,28,30+bob),'#8a5138')
 # short textured hair, temples, defined brow line
 d.rounded_rectangle((11,3+bob,35,12+bob),radius=3,fill=HAIR)
 for x,y in [(14,5),(19,4),(25,5),(30,4),(16,8),(28,7)]:r((x,y+bob,x+2,y+1+bob),'#3b3b49')
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
def side(step):
 """Right-facing profile with a contact / passing / contact / passing gait."""
 im=Image.new('RGBA',(48,64));d=ImageDraw.Draw(im)
 def r(box,c):d.rectangle(box,fill=c)
 bob=(0,1,0,1)[step]
 stride=(5,0,-5,0)[step]
 far_lift=3 if step==3 else 0
 near_lift=3 if step==1 else 0
 # Far leg moves opposite the near leg, with lifted passing feet.
 r((22-stride,47,28-stride,58-far_lift),INK);r((23-stride,48,27-stride,57-far_lift),'#355089')
 r((21-stride,58-far_lift,31-stride,61-far_lift),INK);r((22-stride,61-far_lift,31-stride,62-far_lift),'#cbd5dd')
 r((22+stride,47,29+stride,59-near_lift),INK);r((23+stride,48,28+stride,58-near_lift),'#486ab4')
 r((22+stride,59-near_lift,33+stride,62-near_lift),INK);r((23+stride,62-near_lift,33+stride,62-near_lift),'#cbd5dd')
 # Narrower torso, hood at the back and counter-swinging arms.
 r((16,32+bob,31,49+bob),INK);r((17,33+bob,30,48+bob),'#99a9b6')
 r((15,30+bob,22,36+bob),'#607183');r((17,35+bob,19,47+bob),'#71879a')
 arm=(3,0,-3,0)[step]
 r((23-arm,35+bob,28-arm,47+bob),INK);r((24-arm,36+bob,27-arm,45+bob),'#b4c0ca')
 r((24-arm,46+bob,28-arm,49+bob),SK)
 r((24,29+bob,29,34+bob),SH)
 # A real profile: one visible eye, ear behind it, nose and chin facing right.
 d.rounded_rectangle((13,4+bob,35,30+bob),radius=4,fill=INK)
 d.rounded_rectangle((15,9+bob,34,29+bob),radius=3,fill=SK)
 r((34,19+bob,38,22+bob),HI);r((34,23+bob,36,25+bob),SK)
 r((18,18+bob,21,24+bob),SH);r((19,19+bob,20,22+bob),HI)
 r((18,28+bob,32,30+bob),SH)
 d.rounded_rectangle((13,3+bob,34,13+bob),radius=3,fill=HAIR)
 r((14,12+bob,18,20+bob),HAIR)
 for x,y in [(17,5),(23,4),(28,6),(16,9)]:r((x,y+bob,x+2,y+1+bob),'#3b3b49')
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
 d.rounded_rectangle((11,0,36,10),radius=5,fill='#f5b835')
 d.rectangle((9,9,39,11),fill='#e89624');d.rectangle((22,1,25,8),fill='#ffdb70')
 worker.alpha_composite(im,(i*48,0))
worker.save(ROOT/'public/sprites/cecil-worker.png')
