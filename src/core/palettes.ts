import type { Palette } from './types';
import type { Escape } from './fractal';
export const palettes: {id: Palette;name:string;stops:number[][]}[]=[
  {id:'aurora',name:'Kutup ışıkları',stops:[[5,8,22],[28,37,85],[63,93,155],[56,205,178],[203,252,208],[235,201,125],[80,52,129]]},
  {id:'spectral',name:'Spektral',stops:[[14,13,34],[103,56,182],[223,89,128],[255,188,104],[254,242,186],[90,221,209],[44,83,168]]},
  {id:'ember',name:'Kor',stops:[[12,6,19],[64,21,56],[162,46,64],[238,102,58],[255,198,124],[255,248,206],[104,51,114]]},
  {id:'classic',name:'Klasik bantlar',stops:[[15,24,70],[32,78,160],[68,168,234],[255,246,197],[245,164,53],[81,30,11]]},
  {id:'mono',name:'Siyah ve beyaz',stops:[[15,18,25],[230,238,243]]}
];
export function color(value: Escape,palette: Palette,cycle=0,brightness=1): [number,number,number] {
  if(!value.escaped)return [0,0,0];
  const stops=palettes.find(p=>p.id===palette)!.stops;
  const v=palette==='classic'?value.iterations:value.smooth;
  const t=((v/64+cycle)%1+1)%1*(stops.length-1),i=Math.floor(t),f=t-i;
  return stops[i].map((a,k)=>Math.round(Math.max(0,Math.min(255,(a+(stops[Math.min(i+1,stops.length-1)][k]-a)*f)*brightness)))) as [number,number,number];
}
export const gradient=(palette: Palette)=>`linear-gradient(90deg,${palettes.find(p=>p.id===palette)!.stops.map(s=>`rgb(${s.join(',')})`).join(',')})`;
