// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {it,expect,vi} from 'vitest';
import {BenchmarkPanel} from '../src/components/BenchmarkPanel';
import {defaultSession} from '../src/core/session';
it('altı tamamlanan ölçüm gecikmeli güncellemede doğru koşulla eşleşir',()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 class FakeWorker {static instance:FakeWorker;onmessage:any;onerror:any;postMessage=vi.fn();terminate=vi.fn();constructor(){FakeWorker.instance=this;}}
 vi.stubGlobal('Worker',FakeWorker);
 const div=document.createElement('div');document.body.append(div);const root=createRoot(div),s=defaultSession();
 try{
  act(()=>root.render(<BenchmarkPanel spec={{kind:'mandelbrot',camera:s.camera,c:s.c,settings:s.settings,width:360,height:240}}/>));
  act(()=>div.querySelector('button')!.click());const w=FakeWorker.instance;
  // All completions precede React's render, exposing mutable-index closure bugs.
  act(()=>{for(let i=0;i<6;i++){const request=w.postMessage.mock.calls[i][0];w.onmessage({data:{id:request.id,done:true,ms:10+i}});}});
  const labels=[...div.querySelectorAll('.bar-row>span')].map(x=>x.textContent);
  expect(labels).toEqual(['180×120 / 100','180×120 / 400','180×120 / 1200','360×240 / 100','360×240 / 400','360×240 / 1200']);
  expect(w.terminate).toHaveBeenCalledOnce();
 }finally{act(()=>root.unmount());div.remove();vi.unstubAllGlobals();}
});
