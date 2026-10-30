import { useEffect,useId,useState,type ReactNode } from 'react';
export function NumberField({label,value,min,max,step=.001,help,onChange}:{label:string;value:number;min:number;max:number;step?:number;help?:ReactNode;onChange:(v:number)=>void}) {
  const [text,setText]=useState(String(value)),[error,setError]=useState(false),id=useId();useEffect(()=>{setText(String(value));setError(false);},[value]);
  return <div className="number-field"><label htmlFor={id}>{label}</label>{help}<input id={id} aria-label={label} aria-invalid={error} type="number" min={min} max={max} step={step} value={text} onChange={e=>{setText(e.target.value);const v=Number(e.target.value);if(e.target.value!==''&&Number.isFinite(v)&&v>=min&&v<=max){setError(false);onChange(v);}else setError(true);}} onBlur={()=>{if(error){setText(String(value));setError(false);}}}/>{error&&<span className="field-error" role="alert">{min} ile {max} arasında bir sayı girin.</span>}</div>;
}
