import type { Complex, Kind } from './types';
export type Escape = {escaped: boolean; iterations: number; smooth: number};
// For arbitrary Julia c, R²-R >= |c| is sufficient. R=2 suffices for Mandelbrot.
export const escapeRadius=(kind: Kind,c: Complex,requested: number)=>kind==='julia'?Math.max(requested,(1+Math.sqrt(1+4*Math.hypot(c.re,c.im)))/2):Math.max(2,requested);
export function analyticInterior(x: number,y: number) {
  const q=(x-.25)**2+y*y;
  // Strict, conservative margin avoids rounding a boundary point into the test.
  return q*(q+x-.25)<.25*y*y-1e-14 || (x+1)**2+y*y<.0625-1e-14;
}
export function escape(point: Complex,kind: Kind,c: Complex,max: number,radius=2,optimize=true): Escape {
  let x=kind==='mandelbrot'?0:point.re,y=kind==='mandelbrot'?0:point.im;
  const cx=kind==='mandelbrot'?point.re:c.re,cy=kind==='mandelbrot'?point.im:c.im;
  const r=escapeRadius(kind,c,radius),r2=r*r;
  if(kind==='mandelbrot'&&optimize&&analyticInterior(cx,cy))return {escaped:false,iterations:max,smooth:max};
  let n=0;
  while(n<max&&x*x+y*y<=r2) {
    const next=x*x-y*y+cx; y=2*x*y+cy;x=next;n++;
  }
  const escaped=x*x+y*y>r2;
  const mu=escaped?n+1-Math.log2(Math.log(Math.hypot(x,y))):max;
  return {escaped,iterations:n,smooth:Number.isFinite(mu)?mu:n};
}
