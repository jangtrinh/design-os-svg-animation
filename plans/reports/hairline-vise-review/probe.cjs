const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('playground/vise.html','utf8'), code=fs.readFileSync('playground/vise.js','utf8');
class El {constructor(tag){this.tag=tag;this.attrs={};this.children=[];this.writes=0;this.classList={toggle:(c,v)=>{const a=new Set((this.attrs.class||'').split(' ').filter(Boolean));v?a.add(c):a.delete(c);this.attrs.class=[...a].join(' ')}}} setAttribute(k,v){this.writes++;this.attrs[k]=String(v)} appendChild(e){this.children.push(e)} replaceChildren(){this.children=[]}}
const ctx=vm.createContext({document:{createElementNS:(_,tag)=>new El(tag)},console});
vm.runInContext(html.match(/<script id="hl-kernel">([\s\S]*?)<\/script>/)[1],ctx);
let tick,on,config,C; const realCam=ctx.HL.Cam;
const H={...ctx.HL,Cam:(...a)=>(C=realCam(...a)),register:(s,t)=>{tick=t;t(0);return {wake(){},unregister(){}}},pointer:(s,o)=>{on=o;return ()=>{}}};
ctx.HL=H;ctx.hairline=f=>config=f;vm.runInContext(code,ctx);
const svg=new El('svg'),read={textContent:''};const handle=config.mount({stage:{},svg,read},38);
function all(el){return [el,...el.children.flatMap(all)]}function paths(){return all(svg).filter(e=>e.tag==='path')}function settle(){let n=0;while(tick(1/60)&&n++<600){}return n}function target(x,y=0,z=0){const p=H.proj(C)(x,y,z);on.move(p);settle();return {read:read.textContent,hi:paths().filter(p=>(p.attrs.class||'').split(' ').includes('hi')).length}}
const out={sourceMatchesEmbedded:html.match(/<script type="module" id="hl-figure">([\s\S]*?)<\/script>/)[1].trim()===code.trim(),lines:code.trimEnd().split('\n').length,restHi:paths().filter(p=>(p.attrs.class||'').split(' ').includes('hi')).length,restRead:read.textContent,pathCount:paths().length,minimum:target(-26),topHit:{world:[-4,0,46],groundHit:H.unproj(C,...H.proj(C)(-4,0,46),0),...target(-4,0,46)},closedFaceSeparation:(-26)-(-28)};
handle.set(56);out.maximum={...target(30),jawInterval:[30,50],bearingInterval:[38,48],overlap:Math.min(50,48)-Math.max(30,38)};
const before=paths().reduce((n,p)=>n+p.writes,0);out.idleTickReturns=tick(0);out.unchangedFramePathWrites=paths().reduce((n,p)=>n+p.writes,0)-before;
H.setReducedMotion(true);out.reduced=target(-26);handle.destroy();out.destroyChildren=svg.children.length;
console.log(JSON.stringify(out,null,2));
