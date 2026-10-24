const audio=document.getElementById('audio');
const mini=document.getElementById('mini');
const tracks=[
  {name:'Georges Bizet — Carmen: Prelude to Act I',src:'./media/carmen-prelude.ogg'},
  {name:'Georges Bizet — Carmen: Toreador Song',src:'./media/carmen-toreador.ogg'},
  {name:'Retro Demo Track',src:''}
];
let current=0;

function show(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page=document.getElementById(id);
  if(page) page.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function toggleMusic(){
  if(!audio.src){alert('Add a licensed MP3 to media/ and set its path in app.js first.');return;}
  audio.paused?audio.play():audio.pause();
}
audio.addEventListener('play',()=>mini.style.display='flex');
audio.addEventListener('ended',()=>{current=(current+1)%tracks.length;loadTrack(current);audio.play();});
function selectTrack(i){current=i;loadTrack(i);if(tracks[i].src){audio.play().catch(()=>{});}}
function loadTrack(i){
  const t=tracks[i];
  document.getElementById('track').textContent=t.name;
  document.getElementById('miniTrack').textContent=t.name;
  if(t.src) audio.src=t.src;
}
loadTrack(current);

const offlineStatus=document.getElementById('offlineStatus');
function updateOnlineStatus(){
  if(offlineStatus) offlineStatus.textContent=navigator.onLine?'ONLINE':'OFFLINE MODE';
}
window.addEventListener('online',updateOnlineStatus);
window.addEventListener('offline',updateOnlineStatus);
updateOnlineStatus();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
}

/* RETRO SOLITAIRE */
const suits=['♪','♫','♬','♩'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], tableau=[[],[],[],[],[],[],[]], waste=[], selected=null;
function makeDeck(){return suits.flatMap(s=>ranks.map((r,i)=>({s,r,v:i+1,red:s==='♫'||s==='♩',face:false}))).sort(()=>Math.random()-.5);}
function dealSolitaire(){
  deck=makeDeck();waste=[];selected=null;tableau=[[],[],[],[],[],[],[]];
  for(let c=0;c<7;c++)for(let r=0;r<=c;r++){const card=deck.pop();card.face=r===c;tableau[c].push(card);}
  renderSolitaire();document.getElementById('solitaireStatus').textContent='Select a face-up card, then select another column.';
}
function drawSolitaire(){if(!deck.length){deck=waste.reverse();waste=[];selected=null;renderSolitaire();document.getElementById('solitaireStatus').textContent=deck.length?'Draw pile recycled.':'Press DEAL to start.';return;}selected=null;const c=deck.pop();c.face=true;waste.push(c);renderSolitaire();}
function cardText(c){return c.face?c.r+c.s:'🎵';}
function renderSolitaire(){
  const b=document.getElementById('solitaireBoard');if(!b)return;
  b.innerHTML='';
  tableau.forEach((col,ci)=>{const d=document.createElement('div');d.className='sol-col';d.dataset.col=ci;d.style.height=`${Math.max(180,(col.length-1)*23+76)}px`;
    const slot=document.createElement('button');slot.className='sol-slot';slot.textContent='K';slot.setAttribute('aria-label',`Empty column ${ci+1}`);slot.onclick=()=>selectSolitaire(ci,0);d.appendChild(slot);
    col.forEach((c,ri)=>{const el=document.createElement('button');el.className='sol-card '+(c.red?'red ':'')+((selected?.ci===ci&&ri>=selected.ri)?'selected':'');el.textContent=cardText(c);el.style.top=(ri*23)+'px';el.setAttribute('aria-label',c.face?`${c.r} ${c.s}, column ${ci+1}`:'Face down card');el.onclick=()=>selectSolitaire(ci,ri);d.appendChild(el);});b.appendChild(d);});
  const stock=document.getElementById('solitaireStock');stock.innerHTML='';
  const draw=document.createElement('button');draw.textContent=`DRAW (${deck.length})`;draw.onclick=drawSolitaire;stock.appendChild(draw);
  const w=document.createElement('button');w.className='sol-waste'+(selected?.ci===-1?' selected':'');w.textContent=waste.length?'DRAWN: '+cardText(waste[waste.length-1]):'NO DRAWN CARD';w.disabled=!waste.length;w.onclick=()=>{selected={ci:-1,ri:waste.length-1};renderSolitaire();document.getElementById('solitaireStatus').textContent='Choose a column for the drawn card.';};stock.appendChild(w);
}
function selectSolitaire(ci,ri){
  const status=document.getElementById('solitaireStatus');const c=tableau[ci][ri];
  if(!selected){if(!c?.face)return;selected={ci,ri};renderSolitaire();status.textContent='Choose a column: build down in alternating colors.';return;}
  if(selected.ci===ci){selected=null;renderSolitaire();return;}
  const source=selected.ci===-1?waste:tableau[selected.ci];const first=source[selected.ri];const target=tableau[ci].at(-1);
  if(target?(!target.face||target.red===first.red||target.v!==first.v+1):first.v!==13){status.textContent='Use a lower rank and opposite color. Empty columns need a King.';return;}
  tableau[ci].push(...source.splice(selected.ri));if(source.length)source.at(-1).face=true;selected=null;renderSolitaire();status.textContent='Cards moved. Keep building descending alternating colors.';
}
function resetSolitaire(){deck=[];waste=[];tableau=[[],[],[],[],[],[],[]];selected=null;renderSolitaire();document.getElementById('solitaireStatus').textContent='Press DEAL to start.';}
resetSolitaire();

/* BEAT BLOCKS — original synth accompaniment and falling-note puzzle */
const beatCanvas=document.getElementById('beatBoard'), beatCtx=beatCanvas.getContext('2d');
const beatShapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const beatColors=['#68d8cf','#edcb6f','#c99cdd','#94c777','#e99591','#84b9e7','#e9ac73'];
let beatGrid,beatPiece,beatQueued,beatRunning=false,beatPaused=false,beatPoints=0,beatLines=0,beatClock=0,beatFrame=0,beatLast=0,beatSound=false,beatAudio;
function randomBeat(){const kind=Math.floor(Math.random()*7);return {shape:beatShapes[kind].map(r=>r.slice()),kind,x:3,y:0};}
function beatFits(p,dx=0,dy=0,shape=p.shape){return shape.every((row,y)=>row.every((v,x)=>!v||(p.x+x+dx>=0&&p.x+x+dx<10&&p.y+y+dy>=0&&p.y+y+dy<20&&!beatGrid[p.y+y+dy][p.x+x+dx])));}
function beatTone(chord=false){if(!beatSound||!beatAudio)return;const t=beatAudio.currentTime;const notes=chord?[261.63,329.63,392]:[220+beatPiece.kind*55];notes.forEach(f=>{const o=beatAudio.createOscillator(),g=beatAudio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(beatAudio.destination);o.start(t);o.stop(t+.32);});}
function toggleBeatSound(){beatSound=!beatSound;if(beatSound){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){beatSound=false;return;}beatAudio??=new Audio();beatAudio.resume().catch(()=>{});}document.getElementById('beatSound').textContent='SOUND: '+(beatSound?'ON':'OFF');document.getElementById('beatSound').setAttribute('aria-pressed',String(beatSound));}
function beatSpawn(){beatPiece=beatQueued;beatQueued=randomBeat();if(!beatFits(beatPiece)){beatRunning=false;document.getElementById('beatStatus').textContent='Mix complete! Score: '+beatPoints+'. Press REMIX to try again.';document.getElementById('beatPause').disabled=true;}}
function startBeat(){cancelAnimationFrame(beatFrame);beatGrid=Array.from({length:20},()=>Array(10).fill(0));beatPoints=beatLines=beatClock=0;beatQueued=randomBeat();beatRunning=true;beatPaused=false;beatSpawn();beatLast=performance.now();document.getElementById('beatStart').textContent='REMIX';document.getElementById('beatPause').disabled=false;document.getElementById('beatPause').textContent='PAUSE';document.getElementById('beatStatus').textContent='On air. Complete horizontal lines to build the chorus.';drawBeat();beatFrame=requestAnimationFrame(beatLoop);}
function pauseBeat(){if(!beatRunning)return;beatPaused=!beatPaused;document.getElementById('beatPause').textContent=beatPaused?'RESUME':'PAUSE';document.getElementById('beatStatus').textContent=beatPaused?'Mix paused.':'On air. Keep the notes falling.';beatLast=performance.now();}
function beatLock(){beatPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)beatGrid[beatPiece.y+y][beatPiece.x+x]=beatPiece.kind+1;}));const kept=beatGrid.filter(r=>r.some(v=>!v));const cleared=20-kept.length;if(cleared){beatGrid=[...Array.from({length:cleared},()=>Array(10).fill(0)),...kept];beatPoints+=[0,100,300,500,800][cleared]*(1+Math.floor(beatLines/10));beatLines+=cleared;beatTone(true);}else beatTone();beatSpawn();}
function beatAction(action){if(!beatRunning||beatPaused||!document.getElementById('games').classList.contains('active'))return;
 if(action==='left'||action==='right'){const dx=action==='left'?-1:1;if(beatFits(beatPiece,dx))beatPiece.x+=dx;}
 if(action==='rotate'){const shape=beatPiece.shape[0].map((_,x)=>beatPiece.shape.map(r=>r[x]).reverse());for(const dx of [0,-1,1,-2,2])if(beatFits(beatPiece,dx,0,shape)){beatPiece.x+=dx;beatPiece.shape=shape;break;}}
 if(action==='down'){if(beatFits(beatPiece,0,1)){beatPiece.y++;beatPoints++;}else beatLock();beatClock=0;}
 if(action==='drop'){while(beatFits(beatPiece,0,1)){beatPiece.y++;beatPoints+=2;}beatLock();beatClock=0;}drawBeat();}
function beatCell(ctx,x,y,size,kind,ghost=false){ctx.globalAlpha=ghost?.22:1;ctx.fillStyle=beatColors[kind];ctx.fillRect(x+1,y+1,size-2,size-2);ctx.fillStyle='#152b3c';ctx.font=`bold ${size*.65}px serif`;ctx.fillText('♪',x+size*.24,y+size*.76);ctx.globalAlpha=1;}
function drawBeat(){beatCtx.fillStyle='#101e32';beatCtx.fillRect(0,0,240,480);beatCtx.strokeStyle='#20334b';for(let x=0;x<10;x++)for(let y=0;y<20;y++){beatCtx.strokeRect(x*24,y*24,24,24);if(beatGrid?.[y][x])beatCell(beatCtx,x*24,y*24,24,beatGrid[y][x]-1);}
 if(beatPiece){if(beatRunning){let dy=0;while(beatFits(beatPiece,0,dy+1))dy++;beatPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)beatCell(beatCtx,(beatPiece.x+x)*24,(beatPiece.y+y+dy)*24,24,beatPiece.kind,true);}));}beatPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)beatCell(beatCtx,(beatPiece.x+x)*24,(beatPiece.y+y)*24,24,beatPiece.kind);}));}
 const next=document.getElementById('beatNext').getContext('2d');next.clearRect(0,0,100,80);beatQueued?.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)beatCell(next,x*22+6,y*22+12,22,beatQueued.kind);}));document.getElementById('beatScore').textContent=beatPoints;document.getElementById('beatLines').textContent=beatLines;document.getElementById('beatLevel').textContent=1+Math.floor(beatLines/10);}
function beatLoop(time){const delta=Math.min(time-beatLast,100);beatLast=time;if(beatRunning&&!beatPaused){beatClock+=delta;if(beatClock>=Math.max(100,800-Math.floor(beatLines/10)*70)){beatClock=0;beatAction('down');}}if(beatRunning)beatFrame=requestAnimationFrame(beatLoop);}
window.addEventListener('keydown',e=>{if(!document.getElementById('games').classList.contains('active')||!beatRunning||/INPUT|TEXTAREA/.test(e.target.tagName))return;const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'}[e.key];if(action){e.preventDefault();beatAction(action);}if(e.key.toLowerCase()==='p')pauseBeat();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&beatRunning&&!beatPaused)pauseBeat();});
const originalShow=show;show=function(id){if(id!=='games'&&beatRunning&&!beatPaused)pauseBeat();originalShow(id);};
drawBeat();
