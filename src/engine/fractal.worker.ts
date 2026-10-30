/// <reference lib="webworker" />
import { renderRows } from './render';
import type { RenderRequest, TileMessage } from '../core/types';
const scope=self as unknown as DedicatedWorkerGlobalScope;
let current=0;
scope.onmessage=(event: MessageEvent<RenderRequest|{cancel:true}>)=>{
  const generation=++current;
  if('cancel' in event.data)return;
  const {id,spec,preview}=event.data,started=performance.now();let y=0;
  const next=()=>{
    if(generation!==current)return;
    // A conservative row batch keeps a cancelled worker responsive.
    const rows=Math.min(Math.max(1,Math.min(8,Math.floor(40000/(spec.width*spec.settings.samples)))),spec.height-y);
    const pixels=renderRows(spec,y,rows),done=y+rows===spec.height;
    const tile:TileMessage={id,y,rows,width:spec.width,height:spec.height,pixels:pixels.buffer as ArrayBuffer,progress:(y+rows)/spec.height,done,ms:performance.now()-started,preview};
    scope.postMessage(tile,[tile.pixels]);y+=rows;
    if(!done)setTimeout(next,0);
  };next();
};
