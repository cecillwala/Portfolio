import { R, still } from './pixel.js';

// Coordinates are local to a floor. Worker scale keeps the crew smaller than Cecil.
export function drawConstruction(c, sheet, x, y, w, h, seconds, {workerScale=1}={}) {
  const t = still ? 0 : seconds;
  R(c,'#101b32',x,y,w,h);
  for (let i=0;i<4;i++) {
    const px=x+3+i*(w-6)/3;
    R(c,'#827b57',px,y,1,h);
    R(c,'#d4bd73',px,y+2,1,3);
  }
  for (const py of [y+h*.42,y+h-4]) {
    R(c,'#c8a853',x,py,w,2);
    for(let sx=x;sx<x+w;sx+=6)R(c,'#303146',sx,py,3,2);
  }
  c.strokeStyle='#5c6171';c.lineWidth=1;
  c.beginPath();c.moveTo(x+3,y+h-6);c.lineTo(x+w/3,y+3);c.moveTo(x+w/3,y+h-6);c.lineTo(x+3,y+3);c.stroke();
  const workerH=Math.min(h*.40,28)*workerScale,workerW=workerH*.75;
  for(let i=0;i<3;i++) {
    const progress=(t*(.10+i*.025)+i*.32)%2;
    const direction=progress<1;
    const px=x+4+(direction?progress:2-progress)*(w-workerW-8);
    const feet=i===2?y+h*.43:y+h-4;
    const f=still?0:3+Math.floor(t*6+i)%4;
    c.save();c.translate(Math.round(px+workerW/2),Math.round(feet-workerH));
    if(!direction)c.scale(-1,1);
    c.drawImage(sheet,f*48,0,48,64,-workerW/2,0,workerW,workerH);
    if(i===1)R(c,'#b77746',workerW/3,workerH*.65,workerW*.32,workerH*.22);
    if(i===0){ R(c,'#b58b58',workerW*.38,workerH*.62,1,workerH*.18); R(c,'#c9d2d8',workerW*.29,workerH*.59,workerW*.3,2); }
    c.restore();
  }
  // A compact workbench, stacked material and a warm work light.
  R(c,'#8a634b',x+w*.65,y+h-9,w*.17,5);
  R(c,'#d3ac6b',x+w*.65,y+h-10,w*.17,1);
  R(c,'#ffe3a5',x+w-6,y+3,3,2);
}
