import { buildings } from '../content/buildings.js';
import { still, R, soundButton, chime } from './pixel.js';
import { drawConstruction } from './construction.js';

export async function initBuilding() {
  const root=document.querySelector('.career-building');
  if(!root)return;
  const data=buildings[root.dataset.building];
  const buttons=[...root.querySelectorAll('[data-floor]')];
  const stories=[...root.querySelectorAll('[data-story]')];
  const lift=document.getElementById('building-lift');
  const shaft=root.querySelector('.building-shaft');
  let selected=data.floors[0].id;
  soundButton(document.getElementById('snd'));
  function positionLift(){
    const button=buttons.find(b=>b.dataset.floor===selected);
    const y=button.getBoundingClientRect().top-shaft.getBoundingClientRect().top+button.offsetHeight/2-34;
    lift.style.top=Math.round(y)+'px';
  }
  function select(id,{focus=false,updateUrl=true}={}) {
    if(!data.floors.some(f=>f.id===id))return;
    selected=id;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.floor===id)));
    stories.forEach(s=>{s.hidden=s.dataset.story!==id;});
    const index=data.floors.findIndex(f=>f.id===id);
    document.getElementById('lift-status').textContent='Floor '+(index+1)+': '+data.floors[index].name;
    positionLift();
    if(updateUrl)history.replaceState(null,'','#'+id);
    if(focus){
      chime();
      const heading=document.getElementById('title-'+id);
      if(innerWidth<=880)heading.scrollIntoView({behavior:still?'auto':'smooth',block:'center'});
      heading.focus({preventScroll:true});
    }
  }
  buttons.forEach(button=>{
    button.addEventListener('click',()=>select(button.dataset.floor,{focus:true}));
    button.addEventListener('keydown',event=>{
      if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
      event.preventDefault();
      const at=data.floors.findIndex(f=>f.id===button.dataset.floor);
      const index=event.key==='Home'?0:event.key==='End'?data.floors.length-1:Math.max(0,Math.min(data.floors.length-1,at+(event.key==='ArrowUp'?1:-1)));
      const id=data.floors[index].id;
      select(id);buttons.find(b=>b.dataset.floor===id).focus();
    });
  });
  const hash=decodeURIComponent(location.hash.slice(1));
  select(data.floors.some(f=>f.id===hash)?hash:selected,{updateUrl:false});
  addEventListener('hashchange',()=>select(decodeURIComponent(location.hash.slice(1)),{updateUrl:false}));
  new ResizeObserver(positionLift).observe(root.querySelector('.building-cutaway'));
  const crew=new Image();crew.src='/sprites/cecil-worker.png';
  try{await crew.decode();}catch{ /* Floor stories stay usable if a decorative asset fails. */ }
  const scenes=buttons.map(button=>({button,canvas:button.querySelector('canvas'),floor:data.floors.find(f=>f.id===button.dataset.floor)}));
  function paintRoom(c,floor,t){
    R(c,'#151f3d',0,0,480,176);R(c,'#293650',0,0,480,8);
    for(let x=12;x<480;x+=36)R(c,'#1c2b48',x,8,1,142);
    R(c,'#283044',0,148,480,28);R(c,floor.color,0,148,480,2);
    for(let x=0;x<480;x+=40)R(c,'#151e32',x,150,1,26);
    // Tall windows onto the same Nairobi night.
    for(const x of [24,186,346]){
      R(c,'#45516a',x,25,100,100);R(c,'#0b1530',x+3,28,94,94);
      for(let i=0;i<6;i++){
        const h=20+(i*13+x)%45;R(c,'#212b50',x+4+i*15,122-h,13,h);
        for(let y=124-h;y<119;y+=9)if((i+y)%3!==0)R(c,'#bba16c',x+7+i*15,y,3,3);
      }
      R(c,'#45516a',x+47,28,3,94);R(c,'#45516a',x+3,76,94,3);
    }
    // Desks, workstations and a bookshelf distinguish an occupied floor.
    for(const x of [105,276]){
      R(c,'#a88466',x,115,112,7);R(c,'#2f3043',x+6,122,5,26);R(c,'#2f3043',x+100,122,5,26);
      R(c,'#10172a',x+29,77,51,34);R(c,floor.color,x+32,80,45,27);
      R(c,'#283e52',x+35,84,36,3);R(c,'#355469',x+35,91,24,2);R(c,'#355469',x+35,97,30,2);
      R(c,'#848e9d',x+51,111,5,4);R(c,'#28364c',x+32,125,38,23);
      R(c,'#e0cc9b',x+86,107,6,8);
    }
    if(floor.id==='musoni'){
      for(const x of [55,78]){R(c,'#0a1022',x,91,16,32);R(c,'#f4efd8',x+2,94,12,25);R(c,floor.color,x+2,94,12,5);R(c,'#5f8d70',x+4,111,8,5);}
    }
    if(floor.category==='Education'){
      R(c,'#a78861',247,28,168,72);R(c,'#28423e',251,32,160,64);
      for(let i=0;i<5;i++){R(c,'#c2ccac',263,43+i*9,40+i*15,2);}
      for(let x=58;x<93;x+=6)R(c,['#b78064','#7e9ba8','#c8ae6b'][Math.floor(x/6)%3],x,91+(x%3)*3,5,26);
    }
    R(c,'#906d56',440,131,17,17);R(c,'#46785a',438,116,20,17);R(c,'#5c9970',444,105,9,21);
  }
  let raf;
  function frame(now){
    for(const {canvas,floor} of scenes){
      const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
      if(floor.construction&&crew.naturalWidth)drawConstruction(c,crew,0,0,480,176,now/1000);
      else paintRoom(c,floor,now/1000);
    }
    if(!still)raf=requestAnimationFrame(frame);
  }
  frame(0);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else frame(performance.now());});
}
