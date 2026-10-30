import { useEffect,useId,useLayoutEffect,useRef,useState } from 'react';
import { createPortal } from 'react-dom';
import { helpTopics,type HelpTopic } from '../data/help';
export function Help({topic}:{topic:HelpTopic}) {
  const {title,text}=helpTopics[topic],id=useId();
  const [open,setOpen]=useState(false),[position,setPosition]=useState({left:0,top:0});
  const button=useRef<HTMLButtonElement>(null),popover=useRef<HTMLDivElement>(null),anchor=useRef({left:0,top:0});
  useLayoutEffect(()=>{
    if(!open)return;
    // Fixed and portalled: the side panels clip their overflow.
    const b=button.current!.getBoundingClientRect(),p=popover.current!.getBoundingClientRect(),gap=8,edge=12;
    anchor.current={left:b.left,top:b.top};
    const below=b.bottom+gap,top=below+p.height>innerHeight-edge?Math.max(edge,b.top-gap-p.height):below;
    setPosition({left:Math.max(edge,Math.min(b.left+b.width/2-p.width/2,innerWidth-p.width-edge)),top});
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const close=()=>setOpen(false);
    const pointer=(event:PointerEvent)=>{if(!button.current?.contains(event.target as Node))close();};
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};
    document.addEventListener('pointerdown',pointer);document.addEventListener('keydown',key);
    // A scroll event can arrive just after opening; close only if the button actually moved.
    const scroll=()=>{const b=button.current?.getBoundingClientRect();if(!b||Math.abs(b.left-anchor.current.left)>2||Math.abs(b.top-anchor.current.top)>2)close();};
    window.addEventListener('scroll',scroll,true);window.addEventListener('resize',close);
    return()=>{document.removeEventListener('pointerdown',pointer);document.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',close);};
  },[open]);
  return <>
    <button ref={button} type="button" className={'help-button'+(open?' open':'')} aria-label={`${title}: açıklama`} aria-expanded={open} aria-describedby={open?id:undefined} onBlur={()=>setOpen(false)} onClick={event=>{event.preventDefault();event.stopPropagation();setOpen(v=>!v);}}>?</button>
    {open&&createPortal(<div ref={popover} id={id} role="note" className="help-popover" style={position}><b>{title}</b><p>{text}</p></div>,document.body)}
  </>;
}
