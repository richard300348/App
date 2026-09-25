const audio=document.getElementById('audio');
const mini=document.getElementById('mini');
const tracks=[{name:'Retro Demo Track',src:''}];
let current=0, points=Number(localStorage.getItem('retroScore')||0);

function show(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page=document.getElementById(id);
  if(page) page.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function score(){
  points++;
  localStorage.setItem('retroScore',points);
  document.getElementById('score').textContent=points;
}
function toggleMusic(){
  if(!audio.src){alert('Add a licensed MP3 to media/ and set its path in app.js first.');return;}
  audio.paused?audio.play():audio.pause();
}
audio.addEventListener('play',()=>mini.style.display='flex');
audio.addEventListener('ended',()=>{current=(current+1)%tracks.length;loadTrack(current);audio.play();});
function loadTrack(i){
  const t=tracks[i];
  document.getElementById('track').textContent=t.name;
  document.getElementById('miniTrack').textContent=t.name;
  if(t.src) audio.src=t.src;
}
document.getElementById('score').textContent=points;
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

/* RETRO PLATFORM RUN */
const pg=document.getElementById('platformGame');
const pctx=pg?pg.getContext('2d'):null;
let pGame={x:40,y:235,vx:0,vy:0,onGround:true,coins:0,lives:3,running:false,enemyX:520};
function startPlatformGame(){
  if(!pctx)return;
  pGame={x:40,y:235,vx:0,vy:0,onGround:true,coins:0,lives:3,running:true,enemyX:520};
  document.getElementById('coinCount').textContent=0;
  document.getElementById('lives').textContent=3;
  platformLoop();
}
function platformMove(dir){ if(pGame.running){pGame.vx=dir*4;} }
function platformJump(){ if(pGame.running&&pGame.onGround){pGame.vy=-10;pGame.onGround=false;} }
function platformLoop(){
  if(!pGame.running)return;
  pGame.x=Math.max(8,Math.min(600,pGame.x+pGame.vx)); pGame.vx*=.82;
  pGame.vy+=.5; pGame.y+=pGame.vy;
  if(pGame.y>=235){pGame.y=235;pGame.vy=0;pGame.onGround=true;}
  pGame.enemyX-=1.2;if(pGame.enemyX<0)pGame.enemyX=620;
  if(Math.abs(pGame.x-pGame.enemyX)<28&&pGame.y>205){pGame.lives--;document.getElementById('lives').textContent=pGame.lives;pGame.x=40;pGame.enemyX=520;if(pGame.lives<=0){pGame.running=false;drawPlatform('GAME OVER — PRESS RESTART');return;}}
  if(pGame.x>260&&pGame.x<300&&pGame.y>175){pGame.coins++;document.getElementById('coinCount').textContent=pGame.coins;pGame.x+=30;}
  drawPlatform();
  requestAnimationFrame(platformLoop);
}
function drawPlatform(message){
  pctx.clearRect(0,0,640,300);
  pctx.fillStyle='#111';pctx.fillRect(0,0,640,300);
  pctx.fillStyle='#1717ff';pctx.fillRect(0,260,640,40);
  pctx.fillStyle='#ffe600';pctx.fillRect(250,150,70,15);
  pctx.fillStyle='#ff20b8';pctx.fillRect(90,205,75,15);
  pctx.fillStyle='#ffe600';pctx.beginPath();pctx.arc(285,125,10,0,Math.PI*2);pctx.fill();
  pctx.fillStyle='#ff20b8';pctx.fillRect(pGame.enemyX,225,25,35);
  pctx.fillStyle='#00e5ff';pctx.fillRect(pGame.x,pGame.y,25,25);
  pctx.fillStyle='#fff';pctx.font='16px monospace';pctx.fillText(message||'COLLECT THE COIN!',15,25);
}
if(pg)startPlatformGame();

/* RETRO SOLITAIRE */
const suits=['♠','♥','♦','♣'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], tableau=[[],[],[],[],[],[],[]], waste=[], selected=null;
function makeDeck(){return suits.flatMap(s=>ranks.map((r,i)=>({s,r,v:i+1,red:s==='♥'||s==='♦',face:false}))).sort(()=>Math.random()-.5);}
function dealSolitaire(){
  deck=makeDeck();waste=[];selected=null;tableau=[[],[],[],[],[],[],[]];
  for(let c=0;c<7;c++)for(let r=0;r<=c;r++){const card=deck.pop();card.face=r===c;tableau[c].push(card);}
  renderSolitaire();document.getElementById('solitaireStatus').textContent='Select a face-up card, then select another column.';
}
function drawSolitaire(){if(!deck.length){document.getElementById('solitaireStatus').textContent='No cards left to draw.';return;}const c=deck.pop();c.face=true;waste.push(c);renderSolitaire();}
function cardText(c){return c.face?c.r+c.s:'🂠';}
function renderSolitaire(){
  const b=document.getElementById('solitaireBoard');if(!b)return;
  b.innerHTML='';
  tableau.forEach((col,ci)=>{const d=document.createElement('div');d.className='sol-col';d.dataset.col=ci;
    col.forEach((c,ri)=>{const el=document.createElement('button');el.className='sol-card '+(c.red?'red':'');el.textContent=cardText(c);el.style.top=(ri*28)+'px';el.onclick=()=>selectSolitaire(ci,ri);d.appendChild(el);});b.appendChild(d);});
  const w=document.createElement('div');w.className='sol-waste';w.textContent=waste.length?'DRAWN: '+cardText(waste[waste.length-1]):'DRAW';b.appendChild(w);
}
function selectSolitaire(ci,ri){
  const c=tableau[ci][ri];if(!c.face)return;
  if(!selected){selected={ci,ri};document.getElementById('solitaireStatus').textContent='Now choose a different column.';return;}
  if(selected.ci===ci){selected=null;renderSolitaire();return;}
  const moving=tableau[selected.ci].splice(selected.ri);
  tableau[ci].push(...moving);selected=null;
  const source=tableau.find(col=>col.length&&col[col.length-1]===moving[0]);
  renderSolitaire();
  document.getElementById('solitaireStatus').textContent='Cards moved. Keep building descending alternating colors.';
}
function resetSolitaire(){deck=[];waste=[];tableau=[[],[],[],[],[],[],[]];selected=null;renderSolitaire();document.getElementById('solitaireStatus').textContent='Press DEAL to start.';}
resetSolitaire();
