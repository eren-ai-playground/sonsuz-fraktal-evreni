import { home } from './camera';
import type { Session, Camera, Settings } from './types';
import { palettes } from './palettes';
export const defaults: Settings={iterations:400,radius:2,palette:'aurora',cycle:0,brightness:1,resolution:1,samples:1,optimize:true};
export const defaultSession=(): Session=>({version:1,mode:'mandelbrot',camera:home('mandelbrot'),juliaCamera:home('julia'),c:{re:-.8,im:.156},settings:{...defaults}});
const finite=(v: unknown,min:number,max:number): v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function validCamera(v: any): v is Camera {return v&&finite(v.re,-Number.MAX_VALUE,Number.MAX_VALUE)&&finite(v.im,-Number.MAX_VALUE,Number.MAX_VALUE)&&finite(v.span,1e-14,12);}
export function parseSession(value: unknown): Session {
  const v=value as any,s=v?.settings;
  if(v?.version!==1||!['mandelbrot','julia','split'].includes(v.mode)||!validCamera(v.camera)||!validCamera(v.juliaCamera)||!finite(v.c?.re,-4,4)||!finite(v.c?.im,-4,4)||!s||!finite(s.iterations,50,3000)||!Number.isInteger(s.iterations)||!finite(s.radius,2,32)||!palettes.some(p=>p.id===s.palette)||!finite(s.cycle,0,1)||!finite(s.brightness,.3,2)||![.5,.75,1,1.5].includes(s.resolution)||![1,4].includes(s.samples)||typeof s.optimize!=='boolean')throw new Error('Geçersiz parametre dosyası. Sürüm 1 ve izin verilen sayısal aralıklar gerekli.');
  return {version:1,mode:v.mode,camera:{...v.camera},juliaCamera:{...v.juliaCamera},c:{re:v.c.re,im:v.c.im},settings:{...s}};
}
export function sessionFromURL(hash=window.location.hash): Session {
  try { return parseSession(JSON.parse(decodeURIComponent(hash.replace(/^#s=/,'')))); }catch{return defaultSession();}
}
export const sessionHash=(s: Session)=>'#s='+encodeURIComponent(JSON.stringify(s));
export function download(name:string,data:Blob) {const url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
