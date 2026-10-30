import { toComplex } from '../core/camera';
import { escape } from '../core/fractal';
import { color } from '../core/palettes';
import type { RenderSpec } from '../core/types';
export function renderRows(spec: RenderSpec,yStart:number,rows:number): Uint8ClampedArray {
  const {width,height,camera,kind,c,settings:s}=spec,pixels=new Uint8ClampedArray(width*rows*4);
  const offsets=s.samples===4?[[.25,.25],[.75,.25],[.25,.75],[.75,.75]]:[[.5,.5]];
  for(let y=0;y<rows;y++)for(let x=0;x<width;x++) {
    const rgb=[0,0,0];for(const [ox,oy]of offsets) {
      const point=toComplex(x+ox,y+yStart+oy,width,height,camera);
      const v=color(escape(point,kind,c,s.iterations,s.radius,s.optimize),s.palette,s.cycle,s.brightness);
      for(let k=0;k<3;k++)rgb[k]+=v[k]/offsets.length;
    }
    const i=(y*width+x)*4;pixels[i]=rgb[0];pixels[i+1]=rgb[1];pixels[i+2]=rgb[2];pixels[i+3]=255;
  } return pixels;
}
export class RenderGate {
  private generation=0;
  begin(){return ++this.generation;}
  cancel(){++this.generation;}
  accepts(id:number){return id===this.generation;}
}
