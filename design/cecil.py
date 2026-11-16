from PIL import Image
INK=(26,28,44,255); HAIR=(26,28,44,255); HAIR_L=(51,60,87,255)
SK=(141,90,59,255); SK_D=(107,63,38,255); SK_L=(165,109,72,255)
GR=(148,176,194,255); GR_D=(86,108,134,255); GR_L=(200,214,224,255); WH=(244,244,244,255)
BL=(59,93,201,255); BL_D=(41,54,111,255); SH=(51,60,87,255)
W,H=30,37
def cecil(pose='idle', step=0, blink=False, talk=False):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); px=im.load()
    ox,oy=3,2
    def R(x,y,w,h,c):
        for j in range(h):
            for i in range(w):
                X,Y=ox+x+i,oy+y+j
                if 0<=X<W and 0<=Y<H: px[X,Y]=c
    bob = 1 if step in (1,3) else 0
    # legs and shoes (step 1: left forward, step 3: right forward)
    ll = 1 if step==1 else 0; rl = 1 if step==3 else 0
    R(7,23,10,3,BL)
    R(7,26,4,3+ll,BL); R(13,26,4,3+rl,BL)
    R(10,26,1,3+ll,BL_D); R(16,23,1,6+rl,BL_D); R(13,26,1,3+rl,BL_D)
    R(6,29+ll,5,2,SH); R(13,29+rl,5,2,SH); R(6,30+ll,5,1,WH); R(13,30+rl,5,1,WH)
    y=bob
    # hoodie body
    R(6,13+y,12,11,GR); R(16,14+y,2,10,GR_D); R(6,23+y,12,1,GR_D)
    R(8,19+y,8,1,GR_D); R(8,20+y,1,3,GR_D); R(15,20+y,1,3,GR_D)      # pocket
    R(7,13+y,1,3,GR_L)                                                # highlight
    R(10,14+y,1,4,WH); R(13,14+y,1,4,WH)                              # drawstrings
    # arms
    la = 1 if step==3 else 0; ra = 1 if step==1 else 0
    R(3,14+y,3,8+la,GR); R(3,14+y,1,7,GR_L); R(3,22+y+la,3,2,SK)
    if pose=='point':
        R(18,15+y,6,3,GR); R(18,17+y,6,1,GR_D); R(24,15+y,2,3,SK)
    elif pose=='wave':
        R(18,14+y,5,3,GR); R(21,7+y,3,8,GR); R(23,7+y,1,10,GR_D); R(21,4+y,3,3,SK); R(21,2+y,1,2,SK); R(23,2+y,1,2,SK)
    else:
        R(18,14+y,3,8+ra,GR); R(20,14+y,1,8+ra,GR_D); R(18,22+y+ra,3,2,SK)
    # hood collar and neck
    R(6,12+y,12,2,GR_D); R(10,12+y,4,2,SK_D)
    # head
    R(5,4+y,14,8,SK); R(6,12+y-1,12,1,SK); R(7,12+y,10,0,SK)
    R(17,5+y,2,6,SK_D); R(6,11+y,12,1,SK_D)          # side and jaw shadow
    R(5,5+y,1,3,SK_L)
    R(4,7+y,1,2,SK_D); R(19,7+y,1,2,SK_D)            # ears
    # hair: short crop, sharp hairline, fade at the sides
    R(6,0+y,12,1,HAIR); R(5,1+y,14,3,HAIR); R(5,4+y,1,2,HAIR); R(18,4+y,1,2,HAIR)
    R(7,1+y,3,1,HAIR_L); R(6,2+y,1,1,HAIR_L)
    # face
    R(7,5+y,3,1,HAIR); R(14,5+y,3,1,HAIR)            # brows
    if blink:
        R(8,7+y,2,1,INK); R(14,7+y,2,1,INK)
    else:
        R(8,6+y,2,2,INK); R(14,6+y,2,2,INK); R(8,6+y,1,1,WH); R(14,6+y,1,1,WH)
    R(11,8+y,2,1,SK_D)                               # nose
    R(9,9+y,6,1,WH)                                  # smile
    if talk: R(10,10+y,4,1,INK)
    # outline
    out=im.copy(); po=out.load()
    for Y in range(H):
        for X in range(W):
            if px[X,Y][3]==0 and any(0<=X+dx<W and 0<=Y+dy<H and px[X+dx,Y+dy][3] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                po[X,Y]=INK
    return out

def side(step=0):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); px=im.load()
    ox,oy=3,2
    def R(x,y,w,h,c):
        for j in range(h):
            for i in range(w):
                X,Y=ox+x+i,oy+y+j
                if 0<=X<W and 0<=Y<H: px[X,Y]=c
    y = 1 if step in (1,3) else 0
    f = {0:3,1:0,2:-3,3:0}[step]
    lift = 1 if step in (0,2) else 0
    R(10-f,24,4,5-lift,BL_D); R(10-f,29-lift,5,2,SH); R(10-f,30-lift,5,1,WH)      # far leg
    R(9,23,7,2,BL)
    R(10+f,24,4,5,BL); R(13+f,24,1,5,BL_D); R(10+f,29,5,2,SH); R(10+f,30,5,1,WH)  # near leg
    R(8,13+y,8,11,GR); R(8,14+y,1,9,GR_D); R(8,23+y,8,1,GR_D)                      # hoodie
    a = -(f*2)//3
    R(10+a,15+y,3,7,GR_L); R(12+a,15+y,1,7,GR); R(10+a,22+y,3,2,SK)                # near arm
    R(6,11+y,4,3,GR_D)                                                             # hood
    R(11,12+y,3,2,SK_D)
    R(6,4+y,13,8,SK); R(7,11+y,10,1,SK_D); R(19,7+y,1,2,SK)                        # head, nose
    R(7,0+y,11,1,HAIR); R(6,1+y,13,3,HAIR); R(6,4+y,3,3,HAIR); R(6,7+y,1,2,HAIR)   # hair and fade
    R(8,1+y,3,1,HAIR_L)
    R(10,7+y,1,2,SK_D)
    R(14,5+y,3,1,HAIR); R(15,6+y,2,2,INK); R(15,6+y,1,1,WH); R(14,9+y,4,1,WH)
    out=im.copy(); po=out.load()
    for Y in range(H):
        for X in range(W):
            if px[X,Y][3]==0 and any(0<=X+dx<W and 0<=Y+dy<H and px[X+dx,Y+dy][3] for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                po[X,Y]=INK
    return out

if __name__=='__main__':
    frames=[cecil(), cecil(blink=True), cecil(talk=True), side(0), side(1), side(2), side(3), cecil('point'), cecil('wave'), cecil('wave',talk=True)]
    sheet=Image.new('RGBA',(W*len(frames),H),(0,0,0,0))
    for i,f in enumerate(frames): sheet.alpha_composite(f,(i*W,0))
    sheet.save('cecil2.png')
    cecil().save('cecil_idle.png'); cecil('point',talk=True).save('cecil_point.png'); cecil('wave').save('cecil_wave.png'); cecil(talk=True).save('cecil_talk.png')
    big=Image.new('RGBA',(sheet.width*8,sheet.height*8),(140,198,90,255)); big.alpha_composite(sheet.resize((sheet.width*8,sheet.height*8),Image.NEAREST)); big.convert('RGB').save('/tmp/dl/cecil2.png')
