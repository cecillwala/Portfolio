import { still, rng, soundButton, chime } from './pixel.js';
import { roads, landmarks, destinations } from '../data/nairobi-town.js';

// Geographic axes stay fixed; only the camera composition changes on portrait screens.
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export async function initTown() {
  const stage=document.getElementById('stage'), cv=document.getElementById('town');
  const g=cv.getContext('2d');
  const sheet=new Image(); sheet.src=base+'/sprites/cecil-town.png'; await sheet.decode();
  const backdrop=document.createElement('canvas'), c=backdrop.getContext('2d');
  const pins=document.getElementById('town-pins'), panel=document.getElementById('town-conversation');
  const title=document.getElementById('town-title'), words=document.getElementById('town-words'), actions=document.getElementById('town-actions');
  const portrait=document.getElementById('cecil-portrait'); portrait.width=40;portrait.height=36;
  const pg=portrait.getContext('2d');pg.imageSmoothingEnabled=false;
  let portraitCamera=false;
  const project=(x,y,z=0)=>[(x-y)*(portraitCamera?.68:.82),(x+y)*(portraitCamera?.70:.41)-z];
  let width,height,scale,ox,oy,active=null,panX=0,panY=0,zoom=1,closedBy=null,dirty=true;
  let character={x:520,y:730,tx:520,ty:730},last=0,walkTime=0,idleAt=performance.now(),hidden=false;
  let raf,drag=null,suppressClick=false;
  const random=rng(625);
  const common=[];
  function roadDistance(x,y){
    let best=Infinity;
    for(const r of roads)for(let i=1;i<r.points.length;i++){
      const [ax,ay]=r.points[i-1],[bx,by]=r.points[i];const dx=bx-ax,dy=by-ay;
      const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
      best=Math.min(best,Math.hypot(x-ax-t*dx,y-ay-t*dy)-r.width/2);
    }return best;
  }
  for(let y=45;y<950;y+=66)for(let x=340;x<1040;x+=65){
    const bx=x+(random()-.5)*16,by=y+(random()-.5)*16;
    if(roadDistance(bx,by)<29 || [...landmarks,...destinations].some(b=>Math.hypot(b.x-bx,b.y-by)<Math.max(b.w,b.d)*.8+20))continue;
    common.push({x:bx,y:by,w:25+random()*22,d:25+random()*20,h:20+random()*65,color:['#3d5263','#4a5368','#3a5962','#6c625c','#565571'][Math.floor(random()*5)],seed:Math.floor(random()*1000)});
  }
  const trees=Array.from({length:145},()=>({x:75+random()*220,y:240+random()*500,h:12+random()*14}));
  const cars=roads.slice(0,6).map((r,i)=>({road:r,phase:random(),color:['#e6b27c','#7abdb5','#c68291'][i%3]}));
  const pinEls=destinations.map(b=>{
    const el=document.createElement('button');el.type='button';el.className='town-pin';el.style.setProperty('--pin',b.color);
    el.setAttribute('aria-label',b.name+' — '+b.sub);el.setAttribute('aria-expanded','false');el.setAttribute('aria-controls','town-conversation');el.innerHTML='<span class="town-pin__dot" aria-hidden="true"></span><span>'+b.name+'</span>';
    el.addEventListener('click',()=>select(b,el));pins.append(el);return el;
  });
  const nav=document.getElementById('town-nav');
  destinations.forEach(b=>{
    const btn=document.createElement('button');btn.type='button';btn.textContent=b.name;btn.dataset.destination=b.id;
    btn.addEventListener('click',()=>select(b,btn));nav.append(btn);
  });
  function point(x,y,z=0){const p=project(x,y,z);return[p[0]*scale+ox+panX,p[1]*scale+oy+panY];}
  function polygon(ctx,pts,fill,stroke){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
  function groundPoly(pts,fill){polygon(c,pts.map(p=>point(...p)),fill);}
  function line(points,col,w,ctx=c){ctx.beginPath();points.forEach((p,i)=>{const q=point(...p);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.strokeStyle=col;ctx.lineWidth=w*scale;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
  function building(b){
    const {x,y,w,d,h}=b;
    if(b.kind==='kicc'){
      const foot=point(x,y),top=point(x,y,h),rx=23*scale,ry=11*scale;
      const gradient=c.createLinearGradient(top[0]-rx,0,top[0]+rx,0);
      gradient.addColorStop(0,'#b78465');gradient.addColorStop(.4,'#c99b77');gradient.addColorStop(1,'#76554b');
      c.fillStyle=gradient;c.fillRect(top[0]-rx,top[1],rx*2,foot[1]-top[1]);
      c.beginPath();c.ellipse(foot[0],foot[1],rx,ry,0,0,Math.PI);c.fill();
      for(let z=7;z<h;z+=8){const p=point(x,y,z);c.strokeStyle='#654c46';c.lineWidth=Math.max(1,scale);c.beginPath();c.ellipse(p[0],p[1],rx,ry,0,0,Math.PI);c.stroke();}
      for(let k=-.7;k<=.7;k+=.35){c.fillStyle='#e8c392';c.fillRect(top[0]+k*rx,top[1]+10*scale,Math.max(1,scale),h*scale-12*scale);}
      c.fillStyle='#dbad84';c.beginPath();c.ellipse(top[0],top[1]-4*scale,31*scale,14*scale,0,0,Math.PI*2);c.fill();
      c.fillStyle='#6f6253';c.beginPath();c.ellipse(top[0],top[1]-6*scale,22*scale,8*scale,0,0,Math.PI*2);c.fill();
      c.fillStyle='#d9b48c';c.fillRect(top[0]-9*scale,top[1]-13*scale,18*scale,5*scale);
      const hall=point(x-58,y+22);polygon(c,[[hall[0]-28*scale,hall[1]],[hall[0],hall[1]-29*scale],[hall[0]+28*scale,hall[1]]],'#b68361');
      c.fillStyle='#c69e72';c.beginPath();c.ellipse(hall[0],hall[1],28*scale,10*scale,0,0,Math.PI);c.fill();
      return;
    }
    const corners=[[x-w/2,y-d/2],[x+w/2,y-d/2],[x+w/2,y+d/2],[x-w/2,y+d/2]];
    const floor=corners.map(p=>point(...p)),roof=corners.map(p=>point(...p,h));
    polygon(c,[floor[1],floor[2],roof[2],roof[1]],'#28394b','#5a6473');
    polygon(c,[floor[2],floor[3],roof[3],roof[2]],'#35495c','#526476');
    polygon(c,roof,b.color,'#85909b');
    const wr=rng(b.seed??Math.floor(x+y));
    for(let z=9;z<h-5;z+=11)for(let k=0.2;k<1;k+=.24){
      const lit=wr()>.34;
      for(const [a,bb] of [[corners[1],corners[2]],[corners[3],corners[2]]]){
        const p=point(a[0]+(bb[0]-a[0])*k,a[1]+(bb[1]-a[1])*k,z);
        c.fillStyle=lit?(wr()>.2?'#e8bb73':'#91d7cf'):'#1e3041';
        c.fillRect(Math.round(p[0]),Math.round(p[1]),Math.max(1,4*scale),Math.max(1,5*scale));
      }
    }
    if(b.kind==='tower'){
      const a=point(x,y,h+25),bb=point(x,y,h);c.strokeStyle='#c3d2d4';c.lineWidth=1;c.beginPath();c.moveTo(...a);c.lineTo(...bb);c.stroke();
    }else if(b.kind==='station'){
      groundPoly([[x-62,y-16,h],[x+62,y-16,h],[x+62,y,h+13],[x-62,y,h+13]],'#b7856d');
    }else{
      // Rooftop utility room and water tank, recurring details of the town.
      const p=point(x-3,y-3,h);c.fillStyle='#263342';c.fillRect(p[0]-3,p[1]-4,7,5);
      if(w>35){const p2=point(x+w/4,y-d/4,h);c.fillStyle='#111e29';c.fillRect(p2[0],p2[1]-4,4,5);c.fillStyle='#687a88';c.fillRect(p2[0],p2[1]-5,4,1);}
    }
  }
  function renderStatic(){
    c.clearRect(0,0,width,height);
    const bg=c.createLinearGradient(0,0,0,height);bg.addColorStop(0,'#142937');bg.addColorStop(1,'#09151f');c.fillStyle=bg;c.fillRect(0,0,width,height);
    groundPoly([[-180,-220],[1220,-220],[1220,1180],[-180,1180]],'#1a3039');
    // The western green belt: Central Park above, Uhuru Park below Kenyatta Avenue.
    groundPoly([[30,230],[235,260],[285,440],[340,680],[310,820],[85,770],[-5,600]],'#244b44');
    groundPoly([[20,80],[210,80],[245,230],[65,240]],'#294d45');
    groundPoly([[80,560],[140,510],[210,545],[240,650],[195,710],[105,675]],'#294b5c');
    for(const r of roads){line(r.points,'#52626a',r.width+9);line(r.points,'#273c4c',r.width);}
    for(const r of roads.slice(0,4)){
      c.setLineDash([5*scale,12*scale]);line(r.points,'#a69b74',1.4);c.setLineDash([]);
    }
    // Railway sidings south of Haile Selassie Avenue.
    for(let i=0;i<4;i++)line([[650,895+i*12],[1060,895+i*12]],'#576773',2);
    const objects=[...common,...landmarks,...destinations,...trees.map(t=>({...t,kind:'tree'}))].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
    for(const b of objects){if(b.kind==='tree'){
      const p=point(b.x,b.y);c.fillStyle='#152c2a';c.fillRect(p[0]-1,p[1]-b.h*scale,2,b.h*scale);
      const p2=point(b.x,b.y,b.h);c.fillStyle='#376754';c.beginPath();c.ellipse(p2[0],p2[1],8*scale,11*scale,0,0,Math.PI*2);c.fill();c.fillStyle='#477d60';c.fillRect(p2[0]-3*scale,p2[1]-6*scale,4*scale,6*scale);
    }else building(b);}
    // Warm pools along the real street corridors, kept subtle in wallpaper mode.
    for(const r of roads.slice(0,6))for(let i=0;i<r.points.length;i++){
      const p=point(r.points[i][0]+r.width/2+5,r.points[i][1],9);
      const halo=c.createRadialGradient(...p,0,...p,13);halo.addColorStop(0,'#ffda843d');halo.addColorStop(1,'#ffda8400');c.fillStyle=halo;c.fillRect(p[0]-13,p[1]-13,26,26);c.fillStyle='#f5d69b';c.fillRect(p[0],p[1],2,2);
    }
    c.font='9px system-ui';c.fillStyle='#adc0b4';c.textAlign='center';
    for(const [name,x,y] of [['UHURU PARK',160,450],['CENTRAL PARK',140,140]]){const p=point(x,y);c.fillText(name,...p);}
    for(const b of landmarks){const p=point(b.x,b.y,b.h+24);c.font='8px system-ui';c.fillStyle='#d5d5bc';c.fillText(b.name,...p);}
    if(!portraitCamera)for(const [name,x,y] of [['Kenyatta Ave',355,270],['Moi Avenue',745,85],['Haile Selassie Ave',620,745]]){
      const p=point(x,y);c.font='7px system-ui';c.fillStyle='#a8b2a6';c.fillText(name,...p);
    }
    dirty=false;
  }
  function layout(){
    const portraitView=stage.clientWidth<700;portraitCamera=portraitView;
    width=Math.round(stage.clientWidth/1.65);height=Math.round(stage.clientHeight/1.65);
    cv.width=backdrop.width=width;cv.height=backdrop.height=height;
    scale=Math.min(width/(portraitView?1080:1440),height/(portraitView?1030:900))*zoom;
    const centre=project(portraitView?600:570,portraitView?520:470);
    ox=width*(portraitView?.50:.59)-centre[0]*scale;oy=height*(portraitView?.55:.57)-centre[1]*scale;
    g.imageSmoothingEnabled=false;dirty=true;positionPins();
  }
  function positionPins(){
    destinations.forEach((b,i)=>{const p=point(b.x,b.y,b.h+22);pinEls[i].style.left=p[0]/width*100+'%';pinEls[i].style.top=p[1]/height*100+'%';});
  }
  function close(){panel.hidden=true;active=null;pinEls.forEach(el=>el.setAttribute('aria-expanded','false'));closedBy?.focus({preventScroll:true});}
  function select(b,trigger){
    active=b;closedBy=trigger;hidden=false;stage.classList.remove('town-idle');idleAt=performance.now();
    character.tx=b.x;character.ty=b.y+b.d/2+22;
    title.textContent=b.name;words.textContent=b.say;
    document.getElementById('town-category').textContent=b.sub;
    actions.replaceChildren(...b.links.map(([label,href])=>{const a=document.createElement('a');a.textContent=label+' →';a.href=base+href;return a;}));
    panel.hidden=false;pinEls.forEach((el,i)=>el.setAttribute('aria-expanded',String(destinations[i]===b)));
    pg.clearRect(0,0,40,36);pg.drawImage(sheet,5,0,40,36,0,0,40,36);chime();
    // Bring a chosen building into the phone's central view; the dock stays reachable.
    if(stage.clientWidth<700){const p=point(b.x,b.y,b.h);panX+=width*.5-p[0];panY+=height*.44-p[1];dirty=true;positionPins();}
    if(trigger?.closest('#town-nav'))requestAnimationFrame(()=>title.focus({preventScroll:true}));
  }
  document.getElementById('town-close').addEventListener('click',close);
  document.getElementById('wallpaper').addEventListener('click',()=>{
    hidden=!hidden;stage.classList.toggle('wallpaper',hidden);panel.hidden=true;
    document.getElementById('wallpaper').setAttribute('aria-pressed',String(hidden));
    document.getElementById('wallpaper').textContent=hidden?'Show navigation':'Wallpaper mode';
  });
  document.getElementById('town-reset').addEventListener('click',()=>{panX=panY=0;zoom=1;layout();});
  for(const [id,delta] of [['town-zoom-in',.15],['town-zoom-out',-.15]])document.getElementById(id).addEventListener('click',()=>{zoom=Math.max(.7,Math.min(1.7,zoom+delta));layout();});
  soundButton(document.getElementById('snd'));
  function wake(){idleAt=performance.now();stage.classList.remove('town-idle');}
  stage.addEventListener('pointermove',wake,{passive:true});stage.addEventListener('pointerdown',wake,{passive:true});stage.addEventListener('focusin',wake);
  cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,px:panX,py:panY};suppressClick=false;cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x)/1.65,dy=(e.clientY-drag.y)/1.65;if(Math.hypot(dx,dy)>3)suppressClick=true;panX=Math.max(-width*.8,Math.min(width*.8,drag.px+dx));panY=Math.max(-height*.8,Math.min(height*.8,drag.py+dy));dirty=true;positionPins();});
  cv.addEventListener('pointerup',()=>{drag=null;});cv.addEventListener('pointercancel',()=>{drag=null;});
  cv.addEventListener('click',e=>{
    if(suppressClick)return;const rect=cv.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*width,y=(e.clientY-rect.top)/rect.height*height;
    const nearest=destinations.map(b=>({b,p:point(b.x,b.y,b.h/2)})).sort((a,b)=>Math.hypot(a.p[0]-x,a.p[1]-y)-Math.hypot(b.p[0]-x,b.p[1]-y))[0];
    if(Math.hypot(nearest.p[0]-x,nearest.p[1]-y)<35)select(nearest.b,null);
  });
  addEventListener('keydown',e=>{wake();if(e.key==='Escape'){if(!panel.hidden)close();if(hidden){hidden=false;stage.classList.remove('wallpaper');document.getElementById('wallpaper').setAttribute('aria-pressed','false');document.getElementById('wallpaper').textContent='Wallpaper mode';}}
    if(e.target.closest('button,a'))return;
    const steps={ArrowLeft:[20,0],ArrowRight:[-20,0],ArrowUp:[0,20],ArrowDown:[0,-20]};if(steps[e.key]){e.preventDefault();panX+=steps[e.key][0];panY+=steps[e.key][1];dirty=true;positionPins();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=null;}else{last=0;raf=requestAnimationFrame(frame);}});
  new ResizeObserver(layout).observe(stage);layout();
  function frame(now){
    const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(dirty)renderStatic();g.drawImage(backdrop,0,0);
    for(const car of cars){
      const t=(car.phase+(still?0:now/55000))%1,n=car.road.points.length-1,i=Math.min(n-1,Math.floor(t*n)),f=t*n-i;
      const a=car.road.points[i],b=car.road.points[i+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;
      const p=point(x,y,3);g.fillStyle=car.color;g.fillRect(Math.round(p[0]),Math.round(p[1]),6,3);g.fillStyle='#f9e4ae';g.fillRect(Math.round(p[0])+5,Math.round(p[1]),2,1);
    }
    const dx=character.tx-character.x,dy=character.ty-character.y,distance=Math.hypot(dx,dy),moving=distance>2;
    if(moving){const t=still?1:Math.min(1,dt*110/distance);character.x+=dx*t;character.y+=dy*t;walkTime+=dt;}
    const p=point(character.x,character.y);let f=moving?3+Math.floor(walkTime*7)%4:!still&&Math.floor(now/3000)%7===0?1:0;
    const size=stage.clientWidth<700?27:32;
    g.save();g.translate(Math.round(p[0]),Math.round(p[1]));if(moving&&dx-dy<0)g.scale(-1,1);g.drawImage(sheet,f*48,0,48,64,-size*.375,-size,size*.75,size);g.restore();
    // Ambient breathing is limited to the atmosphere; navigation never moves on its own.
    const haze=g.createRadialGradient(width*.5,height*.45,width*.2,width*.5,height*.5,width*.8);haze.addColorStop(0,'#00000000');haze.addColorStop(1,'#020b18aa');g.fillStyle=haze;g.fillRect(0,0,width,height);
    if(!still&&now-idleAt>14000&&!active&&!stage.contains(document.activeElement))stage.classList.add('town-idle');
    raf=requestAnimationFrame(frame);
  }
  await new Promise(resolve=>requestAnimationFrame(now=>{frame(now);resolve();}));
}
