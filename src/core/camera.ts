import type { Camera, Complex, Kind } from './types';
export const home = (kind: Kind): Camera => ({re:kind==='mandelbrot'?-.6:0,im:0,span:kind==='mandelbrot'?3.8:3.5});
export function toComplex(x: number,y: number,w: number,h: number,camera: Camera): Complex {
  return {re:camera.re+(x/w-.5)*camera.span,im:camera.im+(.5-y/h)*camera.span*h/w};
}
export function toPixel(z: Complex,w: number,h: number,camera: Camera) {
  return {x:(.5+(z.re-camera.re)/camera.span)*w,y:h/2-(z.im-camera.im)*w/camera.span};
}
export function precision(camera: Camera,width: number) {
  const step=camera.span/width;
  const ulp=Number.EPSILON*Math.max(1,Math.abs(camera.re),Math.abs(camera.im));
  return {step,ulp,warning:step<64*ulp,blocked:step<8*ulp};
}
export function zoomAt(camera: Camera,x: number,y: number,w: number,h: number,factor: number): Camera {
  const target=toComplex(x,y,w,h,camera);
  const span=Math.min(12,Math.max(16*Number.EPSILON*Math.max(1,Math.abs(camera.re),Math.abs(camera.im))*w,camera.span*factor));
  return {re:target.re-(x/w-.5)*span,im:target.im-(.5-y/h)*span*h/w,span};
}
// Widens the span for a wider target so the whole visible area stays in frame.
export function exportCamera(camera: Camera,viewW: number,viewH: number,w: number,h: number): Camera {
  return {...camera,span:camera.span*Math.max(1,(w/h)/(viewW/viewH))};
}
export function pan(camera: Camera,dx: number,dy: number,w: number): Camera {
  return {...camera,re:camera.re-dx*camera.span/w,im:camera.im+dy*camera.span/w};
}
