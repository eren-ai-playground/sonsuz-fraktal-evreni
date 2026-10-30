import {describe,it,expect} from 'vitest';
import {add,multiply,magnitude,iterate,orbit} from '../src/core/complex';
import {escape,analyticInterior,escapeRadius} from '../src/core/fractal';
import {home,toComplex,toPixel,zoomAt,pan,precision,exportCamera} from '../src/core/camera';
import {color,palettes} from '../src/core/palettes';
import {defaultSession,parseSession,sessionHash,sessionFromURL} from '../src/core/session';
import {renderRows,RenderGate} from '../src/engine/render';
describe('Görsel dışa aktarma kadrajı',()=>{
 const camera={re:-.5,im:.2,span:3};
 it('dar hedefte yatay kapsam korunur',()=>{const c=exportCamera(camera,800,400,1000,1000);expect(c).toEqual(camera);});
 it('geniş hedefte görünen yükseklik korunur ve merkez sabit kalır',()=>{const c=exportCamera(camera,800,800,1920,1080);expect(c.span*1080/1920).toBeCloseTo(camera.span,12);expect(c.re).toBe(camera.re);expect(c.im).toBe(camera.im);});
 it('görünen alanın tamamı kadrajda kalır',()=>{for(const [w,h] of [[859,535],[356,420],[1600,500]]){const c=exportCamera(camera,w,h,3840,2160);expect(c.span).toBeGreaterThanOrEqual(camera.span);expect(c.span*2160/3840).toBeGreaterThanOrEqual(camera.span*h/w-1e-12);}});
});
describe('Kompleks aritmetik',()=>{
 it('toplar',()=>expect(add({re:2,im:-3},{re:-1,im:5})).toEqual({re:1,im:2}));
 it('çarpar ve i² = −1',()=>{expect(multiply({re:2,im:3},{re:4,im:-5})).toEqual({re:23,im:2});expect(multiply({re:0,im:1},{re:0,im:1})).toEqual({re:-1,im:0});});
 it('modül',()=>expect(magnitude({re:3,im:4})).toBe(5));
 it('iterasyon',()=>expect(iterate({re:1,im:1},{re:0,im:-1})).toEqual({re:0,im:1}));
 it('kritik yörünge 0 ↔ −1',()=>expect(orbit({re:0,im:0},{re:-1,im:0},4)).toEqual([{re:0,im:0},{re:-1,im:0},{re:0,im:0},{re:-1,im:0},{re:0,im:0}]));
 it('kaçan yörünge kontrollü sonlanır',()=>{const a=orbit({re:4,im:4},{re:4,im:4},100);expect(a.length).toBeLessThan(101);expect(a.every(z=>Number.isFinite(z.re)&&Number.isFinite(z.im))).toBe(true);});
});
describe('Kaçış zamanı',()=>{
 for(const optimize of [true,false])for(const re of [0,-1])it(`Mandelbrot c=${re}, optimizasyon=${optimize} kaçmadı`,()=>expect(escape({re,im:0},'mandelbrot',{re:0,im:0},400,2,optimize).escaped).toBe(false));
 it('Mandelbrot c=2 ikinci adımda kaçar',()=>expect(escape({re:2,im:0},'mandelbrot',{re:0,im:0},100)).toMatchObject({escaped:true,iterations:2}));
 it('c=1 ilk adımda radius2 aşılmaz, üçüncüde aşılır',()=>expect(escape({re:1,im:0},'mandelbrot',{re:0,im:0},100)).toMatchObject({escaped:true,iterations:3}));
 it('Julia c=0 disk içi kaçmaz',()=>expect(escape({re:.5,im:.25},'julia',{re:0,im:0},300).escaped).toBe(false));
 it('Julia c=0 disk dışı kaçar',()=>expect(escape({re:1.1,im:0},'julia',{re:0,im:0},300).escaped).toBe(true));
 it('z0 eşiğin dışındaysa sıfır adım',()=>expect(escape({re:3,im:0},'julia',{re:0,im:0},300)).toMatchObject({escaped:true,iterations:0}));
 it('keyfi Julia c için güvenli eşik',()=>{const c={re:-4,im:0},r=escapeRadius('julia',c,2);expect(r*r-r).toBeCloseTo(4);expect(escape({re:2.5,im:0},'julia',c,1,2).escaped).toBe(false);});
 it('sınır eşiği > olarak kullanılır',()=>expect(escape({re:-2,im:0},'mandelbrot',{re:0,im:0},100,2,false).escaped).toBe(false));
 it('yarıçap artışı kaçış adımını geciktirir',()=>{const a=escape({re:2,im:0},'mandelbrot',{re:0,im:0},100,2),b=escape({re:2,im:0},'mandelbrot',{re:0,im:0},100,16);expect(a.escaped&&b.escaped).toBe(true);expect(b.iterations).toBeGreaterThan(a.iterations);});
 it('analitik test güvenli iç noktalar ve sınır',()=>{expect(analyticInterior(0,0)).toBe(true);expect(analyticInterior(-1,0)).toBe(true);expect(analyticInterior(.25,0)).toBe(false);expect(analyticInterior(2,0)).toBe(false);});
 it('optimizasyon genel örnek ızgarasında sonucu korur',()=>{for(let x=-2;x<=1;x+=.1)for(let y=-1;y<=1;y+=.1)expect(escape({re:x,im:y},'mandelbrot',{re:0,im:0},200,2,true)).toEqual(escape({re:x,im:y},'mandelbrot',{re:0,im:0},200,2,false));});
 it('smooth değer sonlu',()=>expect(Number.isFinite(escape({re:2,im:1},'mandelbrot',{re:0,im:0},100).smooth)).toBe(true));
});
describe('Kamera',()=>{
 it('merkez ve sanal eksen yönü',()=>{const c=home('mandelbrot');expect(toComplex(400,300,800,600,c)).toEqual({re:c.re,im:c.im});expect(toComplex(400,0,800,600,c).im).toBeGreaterThan(c.im);});
 it('ters dönüşüm',()=>{for(const [w,h]of [[800,600],[390,844],[1200,300]])for(const [x,y]of [[0,0],[77,92],[w,h]]){const p=toPixel(toComplex(x,y,w,h,home('julia')),w,h,home('julia'));expect(p.x).toBeCloseTo(x);expect(p.y).toBeCloseTo(y);}});
 it('en boy oranı eşit kompleks adım',()=>{const c=home('julia'),a=toComplex(0,0,800,600,c),b=toComplex(1,0,800,600,c),d=toComplex(0,1,800,600,c);expect(b.re-a.re).toBeCloseTo(a.im-d.im,14);});
 it('zoom imleç noktasını sabit tutar',()=>{const c=home('mandelbrot'),z=toComplex(111,234,800,600,c);expect(toComplex(111,234,800,600,zoomAt(c,111,234,800,600,.2))).toEqual(z);});
 it('pan ve tersi',()=>{const c=home('mandelbrot');const p=pan(pan(c,50,-30,800),-50,30,800);expect(p.re).toBeCloseTo(c.re);expect(p.im).toBeCloseTo(c.im);});
 it('hassasiyet uyarısı ve clamp',()=>{expect(precision(home('mandelbrot'),800).warning).toBe(false);const c={re:-.74,im:.13,span:1e-12};expect(precision(c,800).warning).toBe(true);const z=zoomAt(c,400,300,800,600,1e-9);expect(precision(z,800).blocked).toBe(false);});
});
describe('Palet ve render',()=>{
 it('her palet deterministik ve byte aralığında',()=>{for(const p of palettes){const e={escaped:true,iterations:55,smooth:54.67};expect(color(e,p.id)).toEqual(color(e,p.id));expect(color(e,p.id).every(v=>Number.isInteger(v)&&v>=0&&v<=255)).toBe(true);}});
 it('kaçmayan tüm noktalar siyah',()=>{for(const p of palettes)expect(color({escaped:false,iterations:400,smooth:400},p.id)).toEqual([0,0,0]);});
 it('döngü renk değiştirir',()=>{const e={escaped:true,iterations:5,smooth:4.9};expect(color(e,'aurora',.5)).not.toEqual(color(e,'aurora',0));});
 it('sıfır döngü ile bir döngü aynı',()=>{const e={escaped:true,iterations:64,smooth:64};expect(color(e,'aurora',0)).toEqual(color(e,'aurora',1));});
 it('tile birleştirme tam hesapla aynıdır',()=>{const s=defaultSession(),spec={kind:'mandelbrot' as const,camera:s.camera,c:s.c,settings:s.settings,width:20,height:12};const full=renderRows(spec,0,12);const a=renderRows(spec,0,5),b=renderRows(spec,5,7);expect([...a,...b]).toEqual([...full]);expect(full.length).toBe(960);expect(full.filter((_,i)=>i%4===3).every(x=>x===255)).toBe(true);expect(new Set(full).size).toBeGreaterThan(20);});
 it('Julia parametresi pikselleri değiştirir',()=>{const s=defaultSession(),spec={kind:'julia' as const,camera:s.juliaCamera,c:s.c,settings:s.settings,width:24,height:24};expect(renderRows(spec,0,24)).not.toEqual(renderRows({...spec,c:{re:0,im:0}},0,24));});
 it('4 örnek düzgün ve sonlu çıktı üretir',()=>{const s=defaultSession(),bytes=renderRows({kind:'mandelbrot',camera:s.camera,c:s.c,settings:{...s.settings,samples:4},width:8,height:8},0,8);expect(bytes.length).toBe(256);expect(bytes.every(n=>Number.isFinite(n))).toBe(true);});
 it('eski render kimliği iptal edilir',()=>{const gate=new RenderGate(),a=gate.begin();expect(gate.accepts(a)).toBe(true);gate.cancel();expect(gate.accepts(a)).toBe(false);const b=gate.begin();expect(gate.accepts(a)).toBe(false);expect(gate.accepts(b)).toBe(true);});
});
describe('Parametre doğrulama',()=>{
 it('JSON round trip',()=>{const s=defaultSession();expect(parseSession(JSON.parse(JSON.stringify(s)))).toEqual(s);});
 it('URL round trip iki kamerayı korur',()=>{const s=defaultSession();s.mode='split';s.camera={re:-.74,im:.13,span:.001};s.juliaCamera={re:1,im:.5,span:.2};expect(sessionFromURL(sessionHash(s))).toEqual(s);});
 it('kümeden uzağa kaydırılmış sonlu kamera URL ile korunur',()=>{const s=defaultSession();s.camera={re:15,im:-20,span:3.8};expect(sessionFromURL(sessionHash(s))).toEqual(s);});
 it('bozuk URL varsayılana döner',()=>expect(sessionFromURL('#s=%malformed')).toEqual(defaultSession()));
 for(const bad of [null,{},NaN,Infinity,-50,9000,'400'])it(`geçersiz iterasyon ${String(bad)}`,()=>{const s=defaultSession();expect(()=>parseSession({...s,settings:{...s.settings,iterations:bad}})).toThrow();});
 it('kamera ve c sınırları',()=>{const s=defaultSession();expect(()=>parseSession({...s,c:{re:100,im:0}})).toThrow();expect(()=>parseSession({...s,camera:{...s.camera,span:0}})).toThrow();});
 it('bozuk palet, radius, örnekleme',()=>{const s=defaultSession();for(const patch of [{palette:'random'},{radius:1},{samples:3},{resolution:2},{optimize:'yes'}])expect(()=>parseSession({...s,settings:{...s.settings,...patch}})).toThrow();});
});
