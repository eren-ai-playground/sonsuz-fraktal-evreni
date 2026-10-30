// @vitest-environment jsdom
import React,{act} from 'react';
import {createRoot,Root} from 'react-dom/client';
import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {NumberField} from '../src/components/NumberField';
import App from '../src/App';
vi.mock('../src/components/FractalView',()=>({FractalView:({kind,camera,onCamera,onStart,onStatus}:any)=>{React.useEffect(()=>onStatus(kind,true),[kind]);return <div data-testid={kind}><span>{camera.span}</span><button onClick={()=>{onStart();onCamera({...camera,span:camera.span/2});}}>Test zoom {kind}</button></div>;}}));
let root:Root,container:HTMLDivElement;
beforeEach(()=>{(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;history.replaceState(null,'','/');container=document.createElement('div');document.body.append(container);root=createRoot(container);});
afterEach(()=>{act(()=>root.unmount());container.remove();});
const click=(text:string)=>{const b=[...container.querySelectorAll('button')].find(b=>b.textContent===text)!;expect(b).toBeTruthy();act(()=>b.click());};
describe('UI davranışı',()=>{
 it('iki küme, bağımsız kamera ve çalışan sekmeler',()=>{act(()=>root.render(<App/>));expect(container.querySelector('[data-testid=mandelbrot]')).toBeTruthy();click('Julia');expect(container.querySelector('[data-testid=julia]')).toBeTruthy();click('Test zoom julia');expect(container.querySelector('[data-testid=julia] span')?.textContent).toBe('1.75');click('Mandelbrot');expect(container.querySelector('[data-testid=mandelbrot] span')?.textContent).toBe('3.8');});
 it('sekiz deney ve deneyden keşfe geçiş',()=>{act(()=>root.render(<App/>));click('Deneyler 08');expect(container.querySelectorAll('.experiment-card')).toHaveLength(8);act(()=>container.querySelector<HTMLButtonElement>('.experiment-card button')!.click());expect(container.querySelector('.experiment-strip')?.textContent).toContain('Bir kıyının içine yolculuk');});
 it('yöntem bilimsel sınırları açıklar',()=>{act(()=>root.render(<App/>));click('Yöntem ve Sınırlar');expect(container.querySelectorAll('.learning-grid article')).toHaveLength(8);expect(container.textContent).toContain('Keyfi hassasiyet veya perturbasyon modu yoktur');});
 it('durdur ve devam et UI durumunu değiştirir',()=>{act(()=>root.render(<App/>));click('Durdur');expect(container.textContent).toContain('Devam et');click('Devam et');expect(container.textContent).toContain('Durdur');});
 it('c seçme ipucu yalnızca Mandelbrot görünümünde çıkar',()=>{act(()=>root.render(<App/>));const hint=()=>container.querySelector('.explorer-bottom p')?.textContent;expect(hint()).toContain('Tıkla: c seç');click('Julia');expect(hint()).not.toContain('Tıkla: c seç');});
 it('sayısal alan hatalı girişi modele göndermez',()=>{const onChange=vi.fn();act(()=>root.render(<NumberField label="Test sayı" value={2} min={-4} max={4} onChange={onChange}/>));const input=container.querySelector('input')!;const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;act(()=>{setter.call(input,'99');input.dispatchEvent(new Event('input',{bubbles:true}));});expect(onChange).not.toHaveBeenCalled();expect(input.getAttribute('aria-invalid')).toBe('true');expect(container.textContent).toContain('arasında bir sayı');});
});
