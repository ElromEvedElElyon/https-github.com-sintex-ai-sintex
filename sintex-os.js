/* =============================================
   SintexOS — AI-Native Operating System
   Windows 11 + Perplexity + OpenClaw
   ============================================= */
(function(){
'use strict';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const h=(t,a={})=>{const e=document.createElement(t);Object.assign(e,a);return e};

// ===== SVG ICONS =====
const ICO={
  search:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  terminal:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  folder:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="rgba(252,185,0,.15)"/></svg>`,
  browser:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  note:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  monitor:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  settings:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  copilot:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3-3-3c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  agent:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 15c1 1 5 1 6 0"/></svg>`,
  file:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  folderFill:`<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(252,185,0,.2)" stroke="#FCB900" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  fileFill:`<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(96,205,255,.08)" stroke="rgba(96,205,255,.5)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
};

// ===== APPS =====
const APPS=[
  {id:'search',name:'Sintex AI',icon:ICO.search,pin:true,w:900,h:620,color:'#60CDFF'},
  {id:'terminal',name:'Terminal',icon:ICO.terminal,pin:true,w:780,h:480,color:'#6CCB5F'},
  {id:'files',name:'Explorer',icon:ICO.folder,pin:true,w:800,h:520,color:'#FCB900'},
  {id:'browser',name:'Browser',icon:ICO.browser,pin:true,w:950,h:620,color:'#B4A0FF'},
  {id:'notepad',name:'Notepad',icon:ICO.note,pin:false,w:680,h:460,color:'#60CDFF'},
  {id:'monitor',name:'Task Manager',icon:ICO.monitor,pin:true,w:600,h:500,color:'#FF6B6B'},
  {id:'settings',name:'Settings',icon:ICO.settings,pin:false,w:800,h:540,color:'#999'},
  {id:'agents',name:'OpenClaw',icon:ICO.agent,pin:true,w:740,h:520,color:'#B4A0FF'},
];

// ===== STATE =====
const S={
  wins:new Map(),zi:20,focused:null,startOpen:false,searchOpen:false,
  cfg:load('cfg')||{theme:'dark',wp:'mesh',accent:'#60CDFF'},
  isMob:innerWidth<=768
};
function load(k){try{return JSON.parse(localStorage.getItem('sos-'+k))}catch{return null}}
function save(k,v){localStorage.setItem('sos-'+k,JSON.stringify(v))}

// ===== BOOT =====
function boot(){
  const c=$('#boot-fx'),ctx=c.getContext('2d');
  c.width=innerWidth;c.height=innerHeight;
  const cols=Math.floor(c.width/16);
  const drops=Array(cols).fill(0).map(()=>Math.random()*-40);
  const chars='-1 0 +1'.split(' ');
  let frame=0;
  const draw=()=>{
    ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(0,0,c.width,c.height);
    ctx.font='12px "JetBrains Mono"';
    for(let i=0;i<cols;i++){
      const ch=chars[Math.floor(Math.random()*3)];
      ctx.fillStyle=`rgba(96,205,255,${.05+Math.random()*.12})`;
      ctx.fillText(ch,i*16,drops[i]*16);
      if(drops[i]*16>c.height&&Math.random()>.97)drops[i]=0;
      drops[i]+=.4+Math.random()*.3;
    }
    if(++frame<65)requestAnimationFrame(draw);
  };
  draw();
  setTimeout(()=>{
    $('#boot').classList.add('out');
    setTimeout(()=>{$('#boot').remove();showLock()},600);
  },2500);
}

// ===== LOCK SCREEN =====
function showLock(){
  const ls=$('#lockscreen');ls.classList.remove('hidden');
  const updateTime=()=>{
    const now=new Date();
    $('#lock-time').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    $('#lock-date').textContent=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
  };
  updateTime();const ti=setInterval(updateTime,30000);
  const unlock=()=>{ls.classList.add('hidden');clearInterval(ti);initDesktop();
    ls.removeEventListener('click',unlock);document.removeEventListener('keydown',unlock)};
  ls.addEventListener('click',unlock);
  document.addEventListener('keydown',unlock);
}

// ===== DESKTOP =====
function initDesktop(){
  initWallpaper();initIcons();initTaskbar();initStart();initSearch();
  initCtx();initClock();initCopilot();
  toast('SintexOS — BitNet 1.58-bit Engine Online');
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopWP();else initWallpaper();
  });
}

// ===== WALLPAPER =====
let wpRAF=null;
function initWallpaper(){
  const c=$('#wallpaper'),ctx=c.getContext('2d');
  c.width=innerWidth;c.height=innerHeight;
  window.addEventListener('resize',()=>{c.width=innerWidth;c.height=innerHeight});
  if(S.cfg.wp==='mesh'){
    // Animated gradient mesh
    let t=0;
    const draw=()=>{
      t+=.003;
      const g=ctx.createRadialGradient(
        c.width*.5+Math.sin(t)*c.width*.2,c.height*.4+Math.cos(t*.7)*c.height*.2,c.width*.1,
        c.width*.5,c.height*.5,c.width*.7
      );
      g.addColorStop(0,'#0a1628');g.addColorStop(.4,'#0d0d2b');g.addColorStop(.7,'#1a0a2e');g.addColorStop(1,'#000');
      ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
      // Subtle particle field
      ctx.fillStyle='rgba(96,205,255,.015)';
      for(let i=0;i<30;i++){
        const x=(Math.sin(t*2+i*1.3)*0.5+0.5)*c.width;
        const y=(Math.cos(t*1.5+i*0.9)*0.5+0.5)*c.height;
        ctx.beginPath();ctx.arc(x,y,1+Math.sin(t+i)*1,0,Math.PI*2);ctx.fill();
      }
      wpRAF=requestAnimationFrame(draw);
    };
    draw();
  } else {
    ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
    const g=ctx.createRadialGradient(c.width/2,c.height/2,0,c.width/2,c.height/2,c.width*.6);
    g.addColorStop(0,'#0a1628');g.addColorStop(1,'#000');
    ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
  }
}
function stopWP(){if(wpRAF){cancelAnimationFrame(wpRAF);wpRAF=null}}

// ===== DESKTOP ICONS =====
function initIcons(){
  const el=$('#desk-icons');el.innerHTML='';
  const desk=['search','terminal','files','browser','agents','notepad'];
  desk.forEach(id=>{
    const app=APPS.find(a=>a.id===id);if(!app)return;
    const d=h('div',{className:'d-icon'});
    d.innerHTML=`<div class="d-icon-img">${app.icon}</div><div class="d-icon-name">${app.name}</div>`;
    d.ondblclick=()=>openApp(id);
    d.onclick=()=>{$$('.d-icon').forEach(x=>x.classList.remove('sel'));d.classList.add('sel')};
    if(S.isMob)d.onclick=()=>openApp(id);
    el.appendChild(d);
  });
}

// ===== TASKBAR =====
function initTaskbar(){
  // Start button
  $('#tb-start').onclick=()=>toggleStart();
  // Search button
  $('#tb-search-btn').onclick=()=>toggleSearch();
  // Copilot button
  $('#tb-copilot').onclick=()=>toggleCopilot();
  // Pinned apps
  const tb=$('#tb-apps');tb.innerHTML='';
  APPS.filter(a=>a.pin).forEach(app=>{
    const btn=h('button',{className:'tb-app-btn',title:app.name});
    btn.innerHTML=app.icon;btn.dataset.app=app.id;
    btn.onclick=()=>openApp(app.id);
    tb.appendChild(btn);
  });
}

function updateTB(){
  // Update taskbar app buttons state
  $$('.tb-app-btn').forEach(btn=>{
    const id=btn.dataset.app;
    const wins=[...S.wins.entries()].filter(([,w])=>w.appId===id);
    btn.classList.toggle('running',wins.length>0);
    btn.classList.toggle('active',wins.some(([k])=>k===S.focused));
  });
}

// ===== CLOCK =====
function initClock(){
  const el=$('#tb-clock');
  const up=()=>{
    const now=new Date();
    el.innerHTML=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+
      '<br>'+now.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});
  };
  up();setInterval(up,30000);
}

// ===== START MENU =====
function initStart(){
  const grid=$('#start-apps');
  APPS.forEach(app=>{
    const el=h('div',{className:'s-app'});
    el.innerHTML=`<div class="s-app-icon">${app.icon}</div><div class="s-app-name">${app.name}</div>`;
    el.onclick=()=>{openApp(app.id);toggleStart(false)};
    grid.appendChild(el);
  });
  // Recent
  const rec=$('#start-recent');
  const recents=[
    {name:'Welcome to SintexOS',time:'Just now',icon:ICO.note},
    {name:'BitNet Research',time:'Today',icon:ICO.file},
    {name:'Terminal Session',time:'Yesterday',icon:ICO.terminal}
  ];
  recents.forEach(r=>{
    const el=h('div',{className:'s-recent'});
    el.innerHTML=`<div class="s-recent-icon">${r.icon}</div><div class="s-recent-info"><div class="s-recent-name">${r.name}</div><div class="s-recent-time">${r.time}</div></div>`;
    rec.appendChild(el);
  });
  // Search filter
  $('#start-search').oninput=e=>{
    const q=e.target.value.toLowerCase();
    $$('.s-app').forEach((el,i)=>{
      el.style.display=APPS[i].name.toLowerCase().includes(q)?'':'none';
    });
  };
  // Power
  $('#start-power').onclick=()=>{if(confirm('Exit SintexOS?'))location.href='/'};
  // Close on outside
  document.addEventListener('click',e=>{
    if(S.startOpen&&!$('#start').contains(e.target)&&!$('#tb-start').contains(e.target))toggleStart(false);
    if(S.searchOpen&&!$('#search-flyout').contains(e.target)&&!$('#tb-search-btn').contains(e.target))toggleSearch(false);
  });
}
function toggleStart(force){
  S.startOpen=typeof force==='boolean'?force:!S.startOpen;
  if(S.startOpen)toggleSearch(false);
  $('#start').classList.toggle('hidden',!S.startOpen);
  $('#tb-start').classList.toggle('active',S.startOpen);
  if(S.startOpen){$('#start-search').value='';$('#start-search').focus()}
}

// ===== SEARCH FLYOUT =====
function initSearch(){
  const list=$('#sf-apps-list');
  APPS.forEach(app=>{
    const el=h('div',{className:'sf-item'});
    el.innerHTML=`${app.icon}<div><div class="sf-item-name">${app.name}</div></div>`;
    el.onclick=()=>{openApp(app.id);toggleSearch(false)};
    list.appendChild(el);
  });
  const quick=$('#sf-quick');
  ['What is BitNet?','SintexOS features','OpenClaw agents','Bitcoin energy'].forEach(q=>{
    const el=h('div',{className:'sf-item'});
    el.innerHTML=`${ICO.search}<div class="sf-item-name">${q}</div>`;
    el.onclick=()=>{openApp('search');toggleSearch(false)};
    quick.appendChild(el);
  });
  $('#sf-input').oninput=e=>{
    const q=e.target.value.toLowerCase();
    $$('#sf-apps-list .sf-item').forEach((el,i)=>{
      el.style.display=APPS[i].name.toLowerCase().includes(q)?'':'none';
    });
  };
  $('#sf-input').onkeydown=e=>{
    if(e.key==='Escape')toggleSearch(false);
  };
}
function toggleSearch(force){
  S.searchOpen=typeof force==='boolean'?force:!S.searchOpen;
  if(S.searchOpen)toggleStart(false);
  $('#search-flyout').classList.toggle('hidden',!S.searchOpen);
  if(S.searchOpen){$('#sf-input').value='';$('#sf-input').focus()}
}

// ===== CONTEXT MENU =====
function initCtx(){
  const ctx=$('#ctx');
  $('#desktop').addEventListener('contextmenu',e=>{
    e.preventDefault();ctx.classList.remove('hidden');
    ctx.style.left=Math.min(e.clientX,innerWidth-240)+'px';
    ctx.style.top=Math.min(e.clientY,innerHeight-200)+'px';
  });
  document.addEventListener('click',()=>ctx.classList.add('hidden'));
  $$('.ctx-item').forEach(it=>it.onclick=()=>{
    const a=it.dataset.a;
    if(a==='terminal')openApp('terminal');
    if(a==='notepad')openApp('notepad');
    if(a==='display'||a==='personalize')openApp('settings');
    if(a==='refresh'){stopWP();initWallpaper();toast('Desktop refreshed')}
    ctx.classList.add('hidden');
  });
}

// ===== COPILOT SIDEBAR =====
function initCopilot(){
  $('#copilot-close').onclick=()=>toggleCopilot(false);
  // Welcome message
  const body=$('#copilot-body');
  const welcome=h('div',{className:'co-msg ai'});
  welcome.innerHTML=`<strong>Welcome to Copilot</strong><br><br>I'm your AI assistant powered by the BitNet 1.58-bit ternary engine. I can help you with:<br><br>
• Search and research any topic<br>• Explain code and technology<br>• Manage your OpenClaw agents<br>• Navigate SintexOS<br><br>
<em style="color:var(--text3)">BitNet → Groq → Together → Local Knowledge</em>`;
  body.appendChild(welcome);

  // Send message
  const send=async()=>{
    const input=$('#copilot-ask');
    const text=input.value.trim();if(!text)return;input.value='';
    // User msg
    const um=h('div',{className:'co-msg user'});um.textContent=text;body.appendChild(um);
    // Typing
    const typing=h('div',{className:'co-typing'});
    typing.innerHTML='<span></span><span></span><span></span>';body.appendChild(typing);
    body.scrollTop=body.scrollHeight;
    // Query
    try{
      const result=typeof BitNetClient!=='undefined'?await BitNetClient.search(text):{answer:'BitNet engine loading...'};
      typing.remove();
      const am=h('div',{className:'co-msg ai'});
      let html=(result.answer||'No response').replace(/\n/g,'<br>');
      if(result.sources&&result.sources.length){
        html+='<div class="src">';
        result.sources.slice(0,3).forEach(s=>{
          html+=`<a href="${s.url||'#'}" target="_blank">${s.title||'Source'}</a>`;
        });
        html+='</div>';
      }
      am.innerHTML=html;body.appendChild(am);
    }catch{
      typing.remove();
      const em=h('div',{className:'co-msg ai'});em.innerHTML='<span style="color:var(--red)">Connection error. Using local knowledge base.</span>';
      body.appendChild(em);
    }
    body.scrollTop=body.scrollHeight;
  };
  $('#copilot-send').onclick=send;
  $('#copilot-ask').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
  // Auto-resize textarea
  $('#copilot-ask').oninput=function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'};
}
function toggleCopilot(force){
  const co=$('#copilot');
  const isOpen=!co.classList.contains('closed');
  const next=typeof force==='boolean'?force:!isOpen;
  co.classList.toggle('closed',!next);
  if(next)$('#copilot-ask').focus();
}

// ===== TOAST =====
function toast(msg,dur){
  const el=$('#toast');el.textContent=msg;el.classList.remove('hidden');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.add('hidden'),dur||3500);
}

// ===== WINDOW MANAGER =====
let wid=0;
function openApp(appId){
  // Focus existing
  for(const[id,w]of S.wins){
    if(w.appId===appId){w.el.classList.remove('min');focus(id);updateTB();return}
  }
  const app=APPS.find(a=>a.id===appId);if(!app)return;
  const id='w'+(++wid);
  const el=h('div',{className:'win',id});
  const mob=innerWidth<=768;
  if(mob){
    el.style.cssText='top:0;left:0;width:100vw;height:calc(100vh - var(--tb-h))';
  }else{
    const off=(S.wins.size%5)*24;
    const w=Math.min(app.w,innerWidth-60);
    const ht=Math.min(app.h,innerHeight-90);
    const x=Math.max(30,(innerWidth-w)/2+off);
    const y=Math.max(10,(innerHeight-ht-48)/2+off);
    el.style.cssText=`width:${w}px;height:${ht}px;transform:translate(${x}px,${y}px)`;
  }
  // Title bar
  el.innerHTML=`
    <div class="win-title">
      <div class="win-title-icon">${app.icon}</div>
      <div class="win-title-text">${app.name}</div>
      <div class="win-ctrls">
        <button class="win-ctrl-btn min-btn" title="Minimize"><svg width="12" height="12" viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/></svg></button>
        <button class="win-ctrl-btn max-btn" title="Maximize"><svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button>
        <button class="win-ctrl-btn close" title="Close"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      </div>
    </div>
    <div class="win-body"></div>
    <div class="win-resize"></div>`;
  const body=el.querySelector('.win-body');
  const content=renderApp(appId);
  if(content)body.appendChild(content);
  el.querySelector('.min-btn').onclick=e=>{e.stopPropagation();el.classList.add('min');updateTB()};
  el.querySelector('.max-btn').onclick=e=>{e.stopPropagation();el.classList.toggle('max')};
  el.querySelector('.close').onclick=e=>{e.stopPropagation();closeWin(id)};
  el.querySelector('.win-title').ondblclick=()=>el.classList.toggle('max');
  el.onmousedown=()=>focus(id);el.ontouchstart=()=>focus(id);
  if(!mob){initDrag(el);initResize(el)}
  $('#win-layer').appendChild(el);
  S.wins.set(id,{el,appId,icon:app.icon,name:app.name,cleanup:content?._cleanup});
  focus(id);updateTB();
}
function closeWin(id){
  const w=S.wins.get(id);if(!w)return;
  if(w.cleanup)w.cleanup();w.el.remove();S.wins.delete(id);
  if(S.focused===id)S.focused=null;updateTB();
}
function focus(id){
  S.wins.forEach((w,k)=>w.el.classList.toggle('focused',k===id));
  const w=S.wins.get(id);if(w){w.el.style.zIndex=++S.zi;S.focused=id}
  updateTB();
}

// ===== DRAG =====
function initDrag(el){
  const bar=el.querySelector('.win-title');
  let drag=false,sx,sy,ox,oy;
  const getT=()=>{
    const m=getComputedStyle(el).transform;
    if(m==='none')return{x:0,y:0};
    const v=m.match(/matrix.*\((.+)\)/);
    if(v){const p=v[1].split(',');return{x:+p[4],y:+p[5]}}return{x:0,y:0};
  };
  bar.onpointerdown=e=>{
    if(e.target.closest('.win-ctrls')||el.classList.contains('max'))return;
    drag=true;const p=getT();ox=p.x;oy=p.y;sx=e.clientX;sy=e.clientY;
    el.style.willChange='transform';$$('iframe').forEach(f=>f.style.pointerEvents='none');
    bar.setPointerCapture(e.pointerId);
  };
  bar.onpointermove=e=>{if(!drag)return;
    el.style.transform=`translate(${ox+e.clientX-sx}px,${oy+e.clientY-sy}px)`};
  const stop=()=>{drag=false;el.style.willChange='';$$('iframe').forEach(f=>f.style.pointerEvents='')};
  bar.onpointerup=stop;bar.onpointercancel=stop;
}

// ===== RESIZE =====
function initResize(el){
  const handle=el.querySelector('.win-resize');
  let rs=false,sx,sy,sw,sh;
  handle.onpointerdown=e=>{
    if(el.classList.contains('max'))return;
    rs=true;sx=e.clientX;sy=e.clientY;sw=el.offsetWidth;sh=el.offsetHeight;
    $$('iframe').forEach(f=>f.style.pointerEvents='none');
    handle.setPointerCapture(e.pointerId);e.stopPropagation();
  };
  handle.onpointermove=e=>{if(!rs)return;
    el.style.width=Math.max(360,sw+e.clientX-sx)+'px';
    el.style.height=Math.max(240,sh+e.clientY-sy)+'px'};
  const stop=()=>{rs=false;$$('iframe').forEach(f=>f.style.pointerEvents='')};
  handle.onpointerup=stop;handle.onpointercancel=stop;
}

// ===== APP RENDERERS =====
function renderApp(id){
  switch(id){
    case 'search':return renderSearch();
    case 'terminal':return renderTerm();
    case 'files':return renderExplorer();
    case 'browser':return renderBrowser();
    case 'notepad':return renderNotepad();
    case 'monitor':return renderMonitor();
    case 'settings':return renderSettings();
    case 'agents':return renderAgents();
  }
}

// --- SINTEX AI SEARCH ---
function renderSearch(){
  const f=h('iframe');f.src='/search.html';f.className='br-frame';
  f.style.cssText='width:100%;height:100%;border:none;border-radius:0 0 8px 8px';
  return f;
}

// --- TERMINAL ---
function renderTerm(){
  const w=h('div',{className:'app-term'});
  const tabs=h('div',{className:'term-tabs'});
  tabs.innerHTML='<div class="term-tab active">Terminal</div>';
  const out=h('div',{className:'term-out'});
  out.innerHTML=`<span class="t-info">SintexOS Terminal v1.0</span>\n<span class="t-dim">BitNet 1.58-bit Ternary Engine — {-1, 0, +1}</span>\n<span class="t-dim">Type </span><span class="t-cmd">help</span><span class="t-dim"> for commands</span>\n\n`;
  const hist=[];let hi=-1,cwd='/home/sintex';
  const FS={'/':['boot','etc','home','usr','var','sys'],'/home':['sintex'],
    '/home/sintex':['Desktop','Documents','Downloads','.bitnet','.openclaw'],
    '/home/sintex/.bitnet':['models','config.json'],'/home/sintex/.bitnet/models':['bitnet-b1.58-2B-4T.gguf','bitnet-b1.58-700M.gguf'],
    '/home/sintex/.openclaw':['agents','workspace','node.json'],'/home/sintex/.openclaw/agents':['jarvis.json'],
    '/home/sintex/Documents':['BitNet-Research.pdf','Sovereign-Stack.md','DeFi-Playbook.md'],
    '/home/sintex/Desktop':['README.md'],'/home/sintex/Downloads':[],
    '/boot':['vmlinuz-bitnet','initrd.img'],'/etc':['hostname','fstab','sintexos-release'],
    '/usr':['bin','lib'],'/usr/bin':['bitnet','openclaw','node','python3']};
  const resolve=p=>{
    if(!p||p==='~')return'/home/sintex';if(p==='/')return'/';
    if(p.startsWith('/'))return p.replace(/\/+$/,'')||'/';
    if(p==='..'){const pts=cwd.split('/').filter(Boolean);pts.pop();return'/'+pts.join('/')||'/'}
    return(cwd==='/'?'/':cwd+'/')+p;
  };
  const CMDS={
    help:()=>`<span class="t-info">Commands:</span>  ls  cd  pwd  whoami  date  clear  neofetch  bitnet  openclaw  echo  history  uname  free  top  cat  exit`,
    ls:a=>{const p=a[0]?resolve(a[0]):cwd;const items=FS[p];
      if(!items)return`<span class="t-err">ls: '${a[0]||p}': No such directory</span>`;
      return items.map(f=>{const fp=p==='/'?'/'+f:p+'/'+f;return FS[fp]?`<span class="t-info">${f}/</span>`:f}).join('  ')},
    cd:a=>{const p=resolve(a[0]);if(FS[p]!==undefined){cwd=p;return null}return`<span class="t-err">cd: ${a[0]}: not found</span>`},
    pwd:()=>cwd,whoami:()=>'sintex',date:()=>new Date().toString(),
    clear:()=>{out.innerHTML='';return null},
    neofetch:()=>`<span class="t-info">
  ███████╗ ██████╗ ███████╗
  ██╔════╝██╔═══██╗██╔════╝
  ███████╗██║   ██║███████╗
  ╚════██║██║   ██║╚════██║
  ███████║╚██████╔╝███████║
  ╚══════╝ ╚═════╝ ╚══════╝</span>
  <span class="t-dim">OS</span>      SintexOS 1.0 x86_64
  <span class="t-dim">Kernel</span>  BitNet 1.58-bit (ternary)
  <span class="t-dim">Shell</span>   sintex-sh 1.0
  <span class="t-dim">Engine</span>  {-1, 0, +1} Matrix
  <span class="t-dim">CPU</span>     ${navigator.hardwareConcurrency||'?'}x cores
  <span class="t-dim">Memory</span>  ${navigator.deviceMemory||'?'} GB
  <span class="t-dim">Display</span> ${screen.width}x${screen.height}
  <span class="t-dim">Agent</span>   OpenClaw JARVIS (opus-4-6)`,
    bitnet:a=>{
      if(!a[0]||a[0]==='--status')return`<span class="t-info">BitNet Engine</span>  <span class="t-prompt">ONLINE</span>
  Model     bitnet-b1.58-2B-4T
  Weights   {-1, 0, +1} ternary
  Speedup   6.17x vs FP16
  Energy    -82% reduction
  Backend   Groq → Together → Cache`;
      return'Usage: bitnet [--status|--version]'},
    openclaw:()=>`<span class="t-info">OpenClaw Agent Hub</span>
  Agent     JARVIS <span class="t-dim">(claude-opus-4-6)</span>
  Gateway   ws://127.0.0.1:18789
  Status    <span class="t-warn">STANDBY</span>
  Browser   CDP :18800
  Backup    */30 auto-backup <span class="t-prompt">ACTIVE</span>`,
    echo:a=>esc(a.join(' ')),history:()=>hist.map((c,i)=>`  ${i+1}  ${c}`).join('\n'),
    uname:a=>a[0]==='-a'?'SintexOS 1.0 bitnet-1.58 x86_64':'SintexOS',
    free:()=>`              total    used     free
Mem:          ${navigator.deviceMemory||8}G       2.1G     ${((navigator.deviceMemory||8)-2.1).toFixed(1)}G
BitNet:       ∞        1.4G     ∞`,
    top:()=>`  PID  CPU%  MEM%  COMMAND
    1   0.1   0.5  bitnet-kernel
   42   2.3   1.2  sintex-compositor
  128   1.1   0.8  sintex-search
  256   0.4   0.3  openclaw-agent`,
    cat:a=>{
      if(!a[0])return'<span class="t-err">cat: missing file</span>';
      if(a[0].includes('release'))return'SintexOS 1.0.0 (BitNet Edition)';
      if(a[0].includes('hostname'))return'sintex-os';
      return`<span class="t-err">cat: ${esc(a[0])}: No such file</span>`},
    exit:()=>null
  };
  function exec(cmdStr){
    const[cmd,...args]=cmdStr.trim().split(/\s+/);
    out.innerHTML+=`<span class="t-prompt"><span class="t-user">sintex</span>@os</span>:<span class="t-path">${cwd}</span>$ <span class="t-cmd">${esc(cmdStr)}</span>\n`;
    if(cmd==='exit'){for(const[id,w]of S.wins)if(w.appId==='terminal'){closeWin(id);return}return}
    const fn=CMDS[cmd];
    const r=fn?fn(args):`<span class="t-err">${esc(cmd)}: command not found</span>`;
    if(r!==null&&r!==undefined)out.innerHTML+=r+'\n';
    out.scrollTop=out.scrollHeight;
  }
  const inRow=h('div',{className:'term-in'});
  const prompt=h('span');
  prompt.innerHTML=`<span class="t-prompt"><span class="t-user">sintex</span>@os</span>:<span class="t-path">${cwd}</span>$`;
  const input=h('input');input.type='text';input.autocomplete='off';input.spellcheck=false;
  input.onkeydown=e=>{
    if(e.key==='Enter'){const c=input.value.trim();if(!c)return;hist.unshift(c);hi=-1;input.value='';exec(c);
      prompt.innerHTML=`<span class="t-prompt"><span class="t-user">sintex</span>@os</span>:<span class="t-path">${cwd}</span>$`}
    else if(e.key==='ArrowUp'){e.preventDefault();hi=Math.min(hi+1,hist.length-1);if(hi>=0)input.value=hist[hi]}
    else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.max(hi-1,-1);input.value=hi>=0?hist[hi]:''}
    else if(e.key==='Tab'){e.preventDefault();const p=input.value;
      const m=Object.keys(CMDS).filter(c=>c.startsWith(p));if(m.length===1)input.value=m[0]+' '}
    else if(e.key==='l'&&e.ctrlKey){e.preventDefault();out.innerHTML=''}
  };
  inRow.append(prompt,input);
  w.append(tabs,out,inRow);
  w.onclick=()=>input.focus();
  setTimeout(()=>input.focus(),100);
  return w;
}

// --- EXPLORER ---
function renderExplorer(){
  const w=h('div',{className:'app-explorer'});
  let cwd='/home/sintex';
  const FS={'/':{'boot':'d','etc':'d','home':'d','usr':'d'},'/home':{'sintex':'d'},
    '/home/sintex':{'Desktop':'d','Documents':'d','Downloads':'d','.bitnet':'d','.openclaw':'d'},
    '/home/sintex/Desktop':{'README.md':'f'},
    '/home/sintex/Documents':{'BitNet-Research.pdf':'f','Sovereign-Stack.md':'f','DeFi-Playbook.md':'f','zero-to-1m-book.md':'f'},
    '/home/sintex/Downloads':{},
    '/home/sintex/.bitnet':{'models':'d','config.json':'f'},'/home/sintex/.bitnet/models':{'bitnet-b1.58-2B-4T.gguf':'f'},
    '/home/sintex/.openclaw':{'agents':'d','workspace':'d','node.json':'f'},
    '/home/sintex/.openclaw/agents':{'jarvis.json':'f'},
    '/home/sintex/.openclaw/workspace':{'MEMORY.md':'f','HEARTBEAT.md':'f'}};
  const toolbar=h('div',{className:'exp-toolbar'});
  const backBtn=h('button',{className:'exp-btn',textContent:'←'});
  const homeBtn=h('button',{className:'exp-btn',textContent:'⌂'});
  const pathEl=h('div',{className:'exp-path'});
  toolbar.append(backBtn,homeBtn,pathEl);
  const body=h('div',{className:'exp-body'});
  // Sidebar
  const sidebar=h('div',{className:'exp-sidebar'});
  const navItems=[{name:'Home',path:'/home/sintex'},{name:'Desktop',path:'/home/sintex/Desktop'},
    {name:'Documents',path:'/home/sintex/Documents'},{name:'Downloads',path:'/home/sintex/Downloads'},
    {name:'.bitnet',path:'/home/sintex/.bitnet'},{name:'.openclaw',path:'/home/sintex/.openclaw'}];
  navItems.forEach(n=>{
    const el=h('div',{className:'exp-nav',textContent:n.name});
    el.onclick=()=>{cwd=n.path;render()};
    sidebar.appendChild(el);
  });
  const grid=h('div',{className:'exp-grid'});
  const status=h('div',{className:'exp-status'});
  body.append(sidebar,grid);w.append(toolbar,body,status);
  backBtn.onclick=()=>{if(cwd!=='/'){cwd=cwd.split('/').slice(0,-1).join('/')||'/';render()}};
  homeBtn.onclick=()=>{cwd='/home/sintex';render()};
  function render(){
    pathEl.textContent=cwd;grid.innerHTML='';
    const dir=FS[cwd]||{};
    if(cwd!=='/'){
      const up=h('div',{className:'exp-item'});up.innerHTML=`${ICO.folderFill}<div class="exp-item-name">..</div>`;
      up.ondblclick=()=>{cwd=cwd.split('/').slice(0,-1).join('/')||'/';render()};grid.appendChild(up);
    }
    const entries=Object.entries(dir).sort(([,a],[,b])=>a==='d'&&b!=='d'?-1:1);
    entries.forEach(([name,type])=>{
      const el=h('div',{className:'exp-item'});
      el.innerHTML=`${type==='d'?ICO.folderFill:ICO.fileFill}<div class="exp-item-name">${name}</div>`;
      el.onclick=()=>{$$('.exp-item',grid).forEach(x=>x.classList.remove('sel'));el.classList.add('sel')};
      if(type==='d')el.ondblclick=()=>{cwd=cwd==='/'?'/'+name:cwd+'/'+name;render()};
      grid.appendChild(el);
    });
    status.textContent=`${entries.length} items — ${cwd}`;
    $$('.exp-nav',sidebar).forEach((n,i)=>n.classList.toggle('active',navItems[i].path===cwd));
  }
  render();return w;
}

// --- BROWSER ---
function renderBrowser(){
  const w=h('div',{className:'app-browser'});
  const bar=h('div',{className:'br-bar'});
  const back=h('button',{className:'br-btn',textContent:'←'});
  const fwd=h('button',{className:'br-btn',textContent:'→'});
  const ref=h('button',{className:'br-btn',textContent:'↻'});
  const url=h('input',{className:'br-url',value:'https://sintex.ai'});
  const frame=h('iframe',{className:'br-frame',src:'https://sintex.ai'});
  frame.sandbox='allow-scripts allow-same-origin allow-forms allow-popups';
  url.onkeydown=e=>{if(e.key==='Enter'){let u=url.value.trim();
    if(!u.startsWith('http')&&!u.startsWith('/'))u='https://'+u;frame.src=u}};
  back.onclick=()=>{try{frame.contentWindow.history.back()}catch{}};
  fwd.onclick=()=>{try{frame.contentWindow.history.forward()}catch{}};
  ref.onclick=()=>{frame.src=frame.src};
  bar.append(back,fwd,ref,url);w.append(bar,frame);return w;
}

// --- NOTEPAD ---
function renderNotepad(){
  const w=h('div',{className:'app-notepad'});
  const tb=h('div',{className:'np-toolbar'});
  const newBtn=h('button',{textContent:'New'});
  const openBtn=h('button',{textContent:'Open'});
  const st=h('span',{className:'np-status',textContent:'Ready'});
  tb.append(newBtn,openBtn,st);
  const area=h('textarea',{className:'np-area',spellcheck:true,
    placeholder:'Start typing here...\n\nYour notes auto-save to this browser.'});
  area.value=load('notepad')||'';
  let timer;area.oninput=()=>{st.textContent='Editing...';clearTimeout(timer);
    timer=setTimeout(()=>{save('notepad',area.value);st.textContent=`Saved · ${area.value.length} chars`},500)};
  newBtn.onclick=()=>{if(area.value&&!confirm('Clear?'))return;area.value='';save('notepad','');st.textContent='New'};
  w.append(tb,area);setTimeout(()=>area.focus(),100);return w;
}

// --- SYSTEM MONITOR ---
function renderMonitor(){
  const w=h('div',{className:'app-monitor'});
  const header=h('div',{className:'mon-header',textContent:'Performance'});
  const grid=h('div',{className:'mon-grid'});
  const stats={cpu:12,mem:35,gpu:0,net:1.5};
  const hist={cpu:[],mem:[],gpu:[],net:[]};
  const cells=[
    {k:'cpu',label:'CPU',color:'#60CDFF',unit:'%'},
    {k:'mem',label:'Memory',color:'#B4A0FF',unit:'%'},
    {k:'gpu',label:'BitNet Engine',color:'#6CCB5F',unit:'%'},
    {k:'net',label:'Network',color:'#FCB900',unit:' MB/s'}
  ];
  const els={};
  cells.forEach(c=>{
    const cell=h('div',{className:'mon-cell'});
    cell.innerHTML=`<div class="mon-cell-title">${c.label}</div>
      <div class="mon-cell-val" style="color:${c.color}">0${c.unit}</div>
      <div class="mon-bar"><div class="mon-bar-fill" style="background:${c.color};width:0%"></div></div>
      <canvas class="mon-spark" width="200" height="48"></canvas>`;
    grid.appendChild(cell);
    els[c.k]={val:cell.querySelector('.mon-cell-val'),bar:cell.querySelector('.mon-bar-fill'),
      canvas:cell.querySelector('.mon-spark'),color:c.color,unit:c.unit};
  });
  function spark(cvs,data,color){
    const ctx=cvs.getContext('2d'),w=cvs.width,ht=cvs.height;
    ctx.clearRect(0,0,w,ht);if(data.length<2)return;
    // Fill
    ctx.beginPath();data.forEach((v,i)=>{const x=i/(data.length-1)*w,y=ht-v/100*ht;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
    ctx.lineTo(w,ht);ctx.lineTo(0,ht);ctx.closePath();ctx.fillStyle=color+'10';ctx.fill();
    // Line
    ctx.beginPath();data.forEach((v,i)=>{const x=i/(data.length-1)*w,y=ht-v/100*ht;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
    ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();
  }
  function tick(){
    stats.cpu=Math.max(2,Math.min(98,stats.cpu+(Math.random()-.5)*16));
    stats.mem=Math.max(20,Math.min(85,stats.mem+(Math.random()-.5)*4));
    stats.gpu=Math.max(0,Math.min(100,stats.gpu+(Math.random()-.5)*30));
    stats.net=Math.max(0,stats.net+(Math.random()-.5)*5);
    cells.forEach(c=>{
      const e=els[c.k],v=Math.round(stats[c.k]*10)/10;
      e.val.textContent=v+c.unit;e.bar.style.width=Math.min(stats[c.k],100)+'%';
      hist[c.k].push(stats[c.k]);if(hist[c.k].length>60)hist[c.k].shift();
      spark(e.canvas,hist[c.k],c.color);
    });
  }
  tick();const iv=setInterval(tick,1200);
  w.append(header,grid);w._cleanup=()=>clearInterval(iv);return w;
}

// --- SETTINGS ---
function renderSettings(){
  const w=h('div',{className:'app-settings'});
  const nav=h('div',{className:'set-nav'});
  nav.innerHTML=`<div class="set-nav-title">Settings</div>`;
  const sections=[
    {id:'system',label:'System',icon:ICO.monitor},
    {id:'personalize',label:'Personalization',icon:ICO.settings},
    {id:'about',label:'About',icon:ICO.copilot}
  ];
  const body=h('div',{className:'set-body'});
  const content={
    system:`<div class="set-section"><div class="set-title">System</div>
      <div class="set-card"><div class="set-row"><div><div class="set-label">Theme</div><div class="set-desc">Switch between dark and light mode</div></div>
        <button class="set-toggle ${S.cfg.theme==='light'?'on':''}" id="s-theme"></button></div></div>
      <div class="set-card"><div class="set-row"><div><div class="set-label">BitNet Engine</div><div class="set-desc">1.58-bit ternary neural engine</div></div>
        <span style="color:var(--green);font-size:13px">ONLINE</span></div></div>
      <div class="set-card"><div class="set-row"><div><div class="set-label">OpenClaw Agent</div><div class="set-desc">JARVIS — claude-opus-4-6</div></div>
        <span style="color:var(--orange);font-size:13px">STANDBY</span></div></div></div>`,
    personalize:`<div class="set-section"><div class="set-title">Personalization</div>
      <div class="set-card"><div class="set-row"><div><div class="set-label">Wallpaper</div></div>
        <div style="display:flex;gap:8px">${['mesh','solid'].map(wp=>
          `<div style="width:48px;height:32px;border-radius:4px;cursor:pointer;border:2px solid ${S.cfg.wp===wp?'var(--accent)':'transparent'};
            background:${wp==='mesh'?'linear-gradient(135deg,#0a1628,#1a0a2e)':'#111'}" data-wp="${wp}"></div>`
        ).join('')}</div></div></div>
      <div class="set-card"><div class="set-row"><div><div class="set-label">Accent Color</div></div>
        <div style="display:flex;gap:6px">${['#60CDFF','#B4A0FF','#6CCB5F','#FF6B6B','#FCB900'].map(c=>
          `<div style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;
            border:2px solid ${S.cfg.accent===c?'#fff':'transparent'}" data-accent="${c}"></div>`
        ).join('')}</div></div></div></div>`,
    about:`<div class="set-section"><div class="set-title">About SintexOS</div>
      <div class="set-card" style="line-height:2">
        <div style="font-size:22px;font-weight:600;margin-bottom:8px"><span style="color:var(--accent)">Sintex</span>OS</div>
        <span class="set-label">Version</span> <span style="color:var(--text)">1.0.0 (Build 158-ternary)</span><br>
        <span class="set-label">Engine</span> <span style="color:var(--text)">BitNet 1.58-bit {-1, 0, +1}</span><br>
        <span class="set-label">Agent</span> <span style="color:var(--text)">OpenClaw JARVIS (claude-opus-4-6)</span><br>
        <span class="set-label">Platform</span> <span style="color:var(--text)">${navigator.platform}</span><br>
        <span class="set-label">Display</span> <span style="color:var(--text)">${screen.width}×${screen.height}</span><br>
        <span class="set-label">CPU Cores</span> <span style="color:var(--text)">${navigator.hardwareConcurrency||'N/A'}</span><br>
        <span class="set-label">Memory</span> <span style="color:var(--text)">${navigator.deviceMemory||'N/A'} GB</span><br><br>
        <span style="color:var(--text3);font-style:italic">"The sovereign AI operating system.<br>Windows 11 design. Perplexity intelligence. OpenClaw agents."</span>
      </div></div>`
  };
  function show(id){
    body.innerHTML=content[id]||'';
    $$('.set-nav-item',nav).forEach(n=>n.classList.toggle('active',n.dataset.s===id));
    // Bind events
    const theme=$('#s-theme',w);
    if(theme)theme.onclick=()=>{S.cfg.theme=S.cfg.theme==='dark'?'light':'dark';save('cfg',S.cfg);
      document.body.classList.toggle('light-os',S.cfg.theme==='light');show('system')};
    $$('[data-wp]',w).forEach(el=>el.onclick=()=>{S.cfg.wp=el.dataset.wp;save('cfg',S.cfg);stopWP();initWallpaper();show('personalize')});
    $$('[data-accent]',w).forEach(el=>el.onclick=()=>{S.cfg.accent=el.dataset.accent;save('cfg',S.cfg);
      document.documentElement.style.setProperty('--accent',el.dataset.accent);show('personalize')});
  }
  sections.forEach(s=>{
    const el=h('div',{className:'set-nav-item'});el.dataset.s=s.id;
    el.innerHTML=`${s.icon}<span>${s.label}</span>`;
    el.onclick=()=>show(s.id);nav.appendChild(el);
  });
  w.append(nav,body);show('system');return w;
}

// --- OPENCLAW AGENTS ---
function renderAgents(){
  const w=h('div');
  w.style.cssText='height:100%;display:flex;flex-direction:column;background:#191919;overflow-y:auto';
  w.innerHTML=`
    <div style="padding:24px;border-bottom:1px solid #333">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--purple));
          display:flex;align-items:center;justify-content:center">${ICO.agent}</div>
        <div><div style="font-size:20px;font-weight:600">OpenClaw</div>
          <div style="font-size:12px;color:var(--text3)">Sovereign AI Agent Framework</div></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${[['1','Active','var(--green)'],['JARVIS','Primary','var(--accent)'],['BitNet','Engine','var(--orange)']].map(([v,l,c])=>
          `<div style="padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:var(--radius);text-align:center">
            <div style="font-size:22px;font-weight:600;color:${c}">${v}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px">${l}</div></div>`
        ).join('')}
      </div>
    </div>
    <div style="padding:16px;flex:1">
      ${[
        {name:'JARVIS',model:'claude-opus-4-6',status:'STANDBY',statusColor:'var(--orange)',
          desc:'Primary orchestrator. Task execution, memory management, multi-agent coordination. Connected via WebSocket gateway.'},
        {name:'Skynet (Ethical)',model:'swarm-mode',status:'IDLE',statusColor:'var(--text3)',
          desc:'Ethical swarm intelligence for parallel task execution. Bounties, content generation, and revenue optimization.'},
        {name:'BitNet Search',model:'bitnet-1.58',status:'ONLINE',statusColor:'var(--green)',
          desc:'AI search engine on 1.58-bit ternary weights. Fallback chain: BitNet → Groq → Together → Local Cache.'}
      ].map(a=>`
        <div style="padding:16px;background:rgba(255,255,255,.025);border:1px solid var(--border);
          border-radius:var(--radius);margin-bottom:8px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:15px;font-weight:600">${a.name}</span>
            <span style="font-size:11px;padding:3px 10px;border-radius:12px;background:${a.statusColor}15;color:${a.statusColor}">${a.status}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px;font-family:var(--mono)">Model: ${a.model}</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5">${a.desc}</div>
        </div>`).join('')}
      <div style="padding:14px;background:var(--accent-bg);border:1px solid rgba(96,205,255,.15);border-radius:var(--radius);margin-top:12px">
        <div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:6px">Connection</div>
        <div style="font-size:11px;color:var(--text3);font-family:var(--mono);line-height:1.8">
          Gateway: ws://127.0.0.1:18789<br>Browser CDP: port 18800<br>
          Every user will have their own sovereign AI agent.<br>OpenClaw is the framework that makes it possible.
        </div>
      </div>
    </div>`;
  return w;
}

// ===== UTILITY =====
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}

// ===== KEYBOARD =====
document.addEventListener('keydown',e=>{
  if(e.key==='Meta'||(e.ctrlKey&&e.key===' ')){e.preventDefault();toggleStart()}
  if(e.key==='Escape'){if(S.startOpen)toggleStart(false);if(S.searchOpen)toggleSearch(false)}
});

// ===== INIT =====
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();

})();
