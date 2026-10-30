import type { RenderSpec,TileMessage } from '../core/types';
const bandRows=64;
// Bands are handed out on demand because rows near the set cost far more than empty ones.
export function exportImage(spec:RenderSpec,onProgress:(value:number)=>void) {
  const canvas=document.createElement('canvas');canvas.width=spec.width;canvas.height=spec.height;
  const ctx=canvas.getContext('2d')!,workers:Worker[]=[],count=Math.max(1,Math.min(8,(navigator.hardwareConcurrency||2)-1));
  let nextRow=0,rowsDone=0,settled=false,settle:(blob:Blob|null)=>void=()=>{},fail:(error:Error)=>void=()=>{};
  const stop=()=>{settled=true;workers.forEach(w=>w.terminate());};
  const assign=(worker:Worker)=>{if(nextRow>=spec.height)return;const from=nextRow,to=Math.min(spec.height,from+bandRows);nextRow=to;worker.postMessage({id:1,spec,preview:false,from,to});};
  const promise=new Promise<Blob|null>((resolve,reject)=>{
    settle=resolve;fail=reject;
    for(let i=0;i<count;i++){
      const worker=new Worker(new URL('./fractal.worker.ts',import.meta.url),{type:'module'});workers.push(worker);
      worker.onerror=()=>{if(settled)return;stop();fail(new Error('Görsel işçisi çalışmadı.'));};
      worker.onmessage=(event:MessageEvent<TileMessage>)=>{
        if(settled)return;const t=event.data;
        ctx.putImageData(new ImageData(new Uint8ClampedArray(t.pixels),t.width,t.rows),0,t.y);rowsDone+=t.rows;onProgress(rowsDone/spec.height);
        if(rowsDone===spec.height){stop();canvas.toBlob(blob=>blob?settle(blob):fail(new Error('PNG oluşturulamadı.')),'image/png');}
        else if(t.done)assign(worker);
      };
      assign(worker);
    }
  });
  return {promise,cancel:()=>{if(settled)return;stop();settle(null);}};
}
