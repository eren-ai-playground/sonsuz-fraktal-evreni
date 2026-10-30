import type { Complex } from './types';
export const add = (a: Complex, b: Complex): Complex => ({ re:a.re+b.re, im:a.im+b.im });
export const multiply = (a: Complex,b: Complex): Complex => ({ re:a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re });
export const magnitude = (a: Complex) => Math.hypot(a.re,a.im);
export const iterate = (z: Complex,c: Complex) => add(multiply(z,z),c);
export const formatComplex = (z: Complex, digits=6) => `${z.re.toFixed(digits)} ${z.im<0?'−':'+'} ${Math.abs(z.im).toFixed(digits)}i`;
export function orbit(start: Complex,c: Complex,steps: number): Complex[] {
  const result=[{...start}]; let z=start;
  for(let n=0;n<Math.max(0,Math.min(100,Math.floor(steps)));n++) {
    z=iterate(z,c); if(!Number.isFinite(z.re)||!Number.isFinite(z.im))break;
    result.push(z); if(magnitude(z)>1e6)break;
  } return result;
}
