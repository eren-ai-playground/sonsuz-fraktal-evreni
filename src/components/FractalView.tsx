import { useEffect,useRef,useState } from 'react';
import type { Camera,Complex,Kind,Metric,Settings,TileMessage } from '../core/types';
import { pan,precision,toComplex,toPixel,zoomAt } from '../core/camera';
import { RenderGate } from '../engine/render';
import { Icon } from './Icons';
type Props={kind:Kind;camera:Camera;c:Complex;settings:Settings;paused:boolean;revision:number;selecting:boolean;onStart:()=>void;onCamera:(c:Camera)=>void;onSelect?:(c:Complex)=>void;onHover:(c:Complex)=>void;onMetric:(m:Metric)=>void;onStatus:(kind:Kind,done:boolean)=>void;onHome:()=>void;onBack:()=>void;canBack:boolean};
export function FractalView(p:Props) {
  const canvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLDivElement>(null),worker=useRef<Worker|null>(null),gate=useRef(new RenderGate()),latest=useRef(p);latest.current=p;
  const [size,setSize]=useState({w:600,h:520}),[progress,setProgress]=useState(0),[stage,setStage]=useState('Hazırlanıyor'),[error,setError]=useState('');
  const [duration,setDuration]=useState(0);const points=useRef(new Map<number,{x:number;y:number}>()),gesture=useRef({distance:0,moved:false,startX:0,startY:0});
  const wheelTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  useEffect(()=>{const el=container.current!;const observer=new ResizeObserver(([entry])=>{
      // A hidden container reports 0×0; keep the last size so the image is not squeezed to one column.
      const {width,height}=entry.contentRect;if(width<1||height<1)return;
      setSize({w:Math.max(1,Math.round(width)),h:Math.max(1,Math.round(height))});
    });observer.observe(el);return()=>observer.disconnect();},[]);
  useEffect(()=>{
    const el=container.current!;
    const handle=(event:WheelEvent)=>{event.preventDefault();const q=latest.current,r=el.getBoundingClientRect();if(!wheelTimer.current)q.onStart();else clearTimeout(wheelTimer.current);q.onCamera(zoomAt(q.camera,event.clientX-r.left,event.clientY-r.top,r.width,r.height,Math.exp(Math.max(-120,Math.min(120,event.deltaY))*.003)));wheelTimer.current=setTimeout(()=>{wheelTimer.current=undefined;},350);};
    el.addEventListener('wheel',handle,{passive:false});return()=>{el.removeEventListener('wheel',handle);clearTimeout(wheelTimer.current);};
  },[]);
  useEffect(()=>{
    const renderer=new Worker(new URL('../engine/fractal.worker.ts',import.meta.url),{type:'module'});worker.current=renderer;
    renderer.onerror=()=>setError('Hesaplama işçisi çalışmadı. Sayfayı yenileyin ve güncel bir tarayıcı kullanın.');
    return()=>{renderer.terminate();worker.current=null;};
  },[]);
  useEffect(()=>{
    const renderer=worker.current!;const id=gate.current.begin();renderer.postMessage({cancel:true});p.onStatus(p.kind,false);
    if(p.paused){setStage('Durduruldu');return;}
    setProgress(0);setStage('Önizleme');setError('');
    const factor=Math.min(p.settings.resolution,1600/size.w,1200/size.h,Math.sqrt(1800000/(size.w*size.h)));
    const finalW=Math.max(1,Math.round(size.w*factor)),finalH=Math.max(1,Math.round(size.h*factor));
    const target=canvas.current!;
    // Preserve the last real image during gestures and resolution changes.
    if(target.width!==finalW||target.height!==finalH){const old=document.createElement('canvas');old.width=target.width;old.height=target.height;old.getContext('2d')!.drawImage(target,0,0);target.width=finalW;target.height=finalH;target.getContext('2d')!.drawImage(old,0,0,finalW,finalH);}
    const ctx=target.getContext('2d')!;
    let buffer=document.createElement('canvas'),finalTimer:ReturnType<typeof setTimeout>;
    const start=(preview:boolean)=>{
      buffer=document.createElement('canvas');const width=preview?Math.max(1,Math.round(finalW*.28)):finalW,height=preview?Math.max(1,Math.round(finalH*.28)):finalH;buffer.width=width;buffer.height=height;
      renderer.postMessage({id,spec:{kind:p.kind,camera:p.camera,c:p.c,width,height,settings:{...p.settings,samples:preview?1:p.settings.samples}},preview});
      setStage(preview?'Önizleme':'Ayrıntı hesaplanıyor');setProgress(0);
    };
    renderer.onmessage=(event:MessageEvent<TileMessage>)=>{
      const t=event.data;if(!gate.current.accepts(t.id))return;
      buffer.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(t.pixels),t.width,t.rows),0,t.y);
      ctx.imageSmoothingEnabled=false;ctx.drawImage(buffer,0,t.y,t.width,t.rows,0,t.y/t.height*finalH,finalW,t.rows/t.height*finalH);
      setProgress(t.progress);setDuration(t.ms);
      if(t.done&&t.preview){finalTimer=setTimeout(()=>start(false),120);}
      if(t.done&&!t.preview){setStage('Tamamlandı');p.onMetric({id,kind:p.kind,width:t.width,height:t.height,iterations:p.settings.iterations,samples:p.settings.samples,ms:t.ms,span:p.camera.span});p.onStatus(p.kind,true);}
    };
    const timer=setTimeout(()=>start(true),70);
    return()=>{clearTimeout(timer);clearTimeout(finalTimer);gate.current.cancel();renderer.postMessage({cancel:true});};
  },[p.camera,p.kind==='julia'?p.c:null,p.settings,p.paused,p.revision,p.kind,size]);
  const local=(event:React.PointerEvent)=>{const r=container.current!.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};};
  const down=(event:React.PointerEvent)=>{
    if(event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);const v=local(event);points.current.set(event.pointerId,v);p.onStart();gesture.current={distance:0,moved:false,startX:v.x,startY:v.y};
    if(p.selecting&&p.onSelect)p.onSelect(toComplex(v.x,v.y,size.w,size.h,p.camera));
    if(points.current.size===2){const [a,b]=[...points.current.values()];gesture.current.distance=Math.hypot(a.x-b.x,a.y-b.y);}
  };
  const move=(event:React.PointerEvent)=>{
    const v=local(event);p.onHover(toComplex(v.x,v.y,size.w,size.h,p.camera));const prev=points.current.get(event.pointerId);if(!prev)return;
    if(Math.hypot(v.x-gesture.current.startX,v.y-gesture.current.startY)>4)gesture.current.moved=true;
    points.current.set(event.pointerId,v);
    if(points.current.size===2){const [a,b]=[...points.current.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(distance>0&&gesture.current.distance>0)p.onCamera(zoomAt(p.camera,(a.x+b.x)/2,(a.y+b.y)/2,size.w,size.h,gesture.current.distance/distance));gesture.current.distance=distance;}
    else if(p.selecting&&p.onSelect)p.onSelect(toComplex(v.x,v.y,size.w,size.h,p.camera));
    else p.onCamera(pan(p.camera,v.x-prev.x,v.y-prev.y,size.w));
  };
  const up=(event:React.PointerEvent)=>{const v=local(event);if(!gesture.current.moved&&points.current.size===1&&p.onSelect)p.onSelect(toComplex(v.x,v.y,size.w,size.h,p.camera));points.current.delete(event.pointerId);gesture.current.distance=0;};
  const key=(event:React.KeyboardEvent)=>{
    const k=event.key;let c:Camera|undefined;if(k==='+'||k==='=')c=zoomAt(p.camera,size.w/2,size.h/2,size.w,size.h,.6);if(k==='-')c=zoomAt(p.camera,size.w/2,size.h/2,size.w,size.h,1/.6);
    if(k.startsWith('Arrow'))c=pan(p.camera,k==='ArrowLeft'?size.w*.1:k==='ArrowRight'?-size.w*.1:0,k==='ArrowUp'?size.w*.1:k==='ArrowDown'?-size.w*.1:0,size.w);
    if(c){event.preventDefault();p.onStart();p.onCamera(c);}if(k.toLowerCase()==='h')p.onHome();if(k.toLowerCase()==='b')p.onBack();
  };
  const marker=toPixel(p.c,size.w,size.h,p.camera),warn=precision(p.camera,size.w).warning;
  const zoom=(factor:number)=>{p.onStart();p.onCamera(zoomAt(p.camera,size.w/2,size.h/2,size.w,size.h,factor));};
  return <section className="fractal-view" aria-label={p.kind==='mandelbrot'?'Mandelbrot görünümü':'Julia görünümü'}>
    <div className="view-heading"><span><i className={p.kind==='julia'?'violet-dot':'green-dot'}/>{p.kind==='mandelbrot'?'Mandelbrot kümesi':'Julia kümesi'}<small>{p.kind==='mandelbrot'?'PARAMETRE DÜZLEMİ':'BAŞLANGIÇ DÜZLEMİ'}</small></span><span className="view-count">{p.settings.iterations} iterasyon</span></div>
    <div ref={container} className={'canvas-wrap '+(p.selecting?'selecting':'')} tabIndex={0} role="application" aria-label={`${p.kind==='mandelbrot'?'Mandelbrot':'Julia'} fraktal tuvali. Artı ve eksi yakınlaştırır, ok tuşları kaydırır, H sıfırlar, B geri alır.`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={e=>{points.current.delete(e.pointerId);gesture.current.distance=0;}} onKeyDown={key}>
      <canvas ref={canvas} data-kind={p.kind}/>
      <div className="canvas-coordinates"><span>Im</span><span>Re →</span></div>
      {p.kind==='mandelbrot'&&p.onSelect&&marker.x>=0&&marker.x<=size.w&&marker.y>=0&&marker.y<=size.h&&<div className="c-marker" style={{left:marker.x,top:marker.y}}><span/>c</div>}
      <div className="canvas-formula">{p.kind==='mandelbrot'?'z₀ = 0 · zₙ₊₁ = zₙ² + c':'z₀ = piksel · zₙ₊₁ = zₙ² + c'}</div>
      <div className="zoom-label">{((p.kind==='mandelbrot'?3.8:3.5)/p.camera.span).toLocaleString('tr-TR',{maximumFractionDigits:1})}×<span>YAKINLAŞTIRMA</span></div>
      {warn&&<div className="precision-warning">Hassasiyet sınırına yaklaşıldı. Yeni ayrıntılar güvenilir olmayabilir.</div>}
      {error&&<div className="precision-warning" role="alert">{error}</div>}
    </div>
    <div className="view-toolbar"><div className="tool-group"><button aria-label={`${p.kind} yakınlaştır`} title="Yakınlaştır (+)" onClick={()=>zoom(.6)}><Icon name="plus"/></button><button aria-label={`${p.kind} uzaklaştır`} title="Uzaklaştır (−)" onClick={()=>zoom(1/.6)}><Icon name="minus"/></button><span className="separator"/><button aria-label={`${p.kind} ana görünüme dön`} title="Ana görünüm (H)" onClick={p.onHome}><Icon name="home"/></button><button aria-label={`${p.kind} önceki görünüm`} title="Önceki görünüm (B)" disabled={!p.canBack} onClick={p.onBack}><Icon name="undo"/></button></div><span className="render-label"><i className={stage==='Tamamlandı'?'green-dot':'amber-dot'}/>{stage}<b>{Math.round(progress*100)}%</b></span><span className="render-ms">{Math.round(duration)} ms</span></div>
    <div className="progress-track"><div style={{width:`${progress*100}%`}}/></div>
  </section>;
}
