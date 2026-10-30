import { useEffect,useRef,useState } from 'react';
import type { RenderSpec,TileMessage } from '../core/types';
import { download } from '../core/session';
type Row={width:number;height:number;iterations:number;ms:number};
export function BenchmarkPanel({spec}:{spec:RenderSpec}) {
  const [rows,setRows]=useState<Row[]>([]),[running,setRunning]=useState(false),[error,setError]=useState('');const worker=useRef<Worker|null>(null),token=useRef(0);
  const cancel=()=>{token.current++;worker.current?.terminate();worker.current=null;setRunning(false);};
  useEffect(()=>()=>{worker.current?.terminate();token.current++;},[]);
  const run=()=>{
    cancel();setRows([]);setError('');setRunning(true);const id=++token.current;
    const renderer=new Worker(new URL('../engine/fractal.worker.ts',import.meta.url),{type:'module'});worker.current=renderer;
    const conditions=[.5,1].flatMap(scale=>[100,400,1200].map(iterations=>({width:Math.round(360*scale),height:Math.round(240*scale),iterations})));
    let index=0;
    const next=()=>{const q=conditions[index];renderer.postMessage({id,spec:{...spec,width:q.width,height:q.height,settings:{...spec.settings,iterations:q.iterations,samples:1}},preview:false});};
    renderer.onerror=()=>{setError('Ölçüm işçisi çalışmadı.');cancel();};
    renderer.onmessage=(event:MessageEvent<TileMessage>)=>{if(event.data.id!==token.current||!event.data.done)return;const measured={...conditions[index],ms:event.data.ms};setRows(r=>[...r,measured]);index++;if(index<conditions.length)next();else{renderer.terminate();worker.current=null;setRunning(false);}};next();
  };
  const max=Math.max(1,...rows.map(r=>r.ms));
  return <div className="benchmark"><p className="muted">Aynı kamera ve paletle 2 çözünürlük × 3 iterasyon. Ayrı işçi, tek örnek/piksel. Süreye işçi zamanlayıcısı dahildir.</p><button className="wide primary" onClick={running?cancel:run}>{running?'Ölçümü iptal et':'6 koşullu karşılaştırmayı başlat'}</button>{error&&<p role="alert">{error}</p>}<div className="benchmark-chart" role="img" aria-label="Gerçek render sürelerinin sütun karşılaştırması">{rows.map((r,i)=><div className="bar-row" key={i}><span>{r.width}×{r.height} / {r.iterations}</span><div><i style={{width:`${r.ms/max*100}%`}}/></div><b>{Math.round(r.ms)} ms</b></div>)}</div>{!rows.length&&<p className="empty-state">Ölçümler çalıştırıldığında burada görünür.</p>}{rows.length>0&&<button className="wide subtle" onClick={()=>download('fraktal-performans.csv',new Blob(['genislik,yukseklik,iterasyon,ms\n'+rows.map(r=>`${r.width},${r.height},${r.iterations},${r.ms}`).join('\n')],{type:'text/csv'}))}>Ölçümleri CSV kaydet</button>}<p className="tiny muted">Makine ve görünür bölge sonucu etkiler. Bu karşılaştırma ekran boyutunda FPS veya GPU benchmark değildir.</p></div>;
}
