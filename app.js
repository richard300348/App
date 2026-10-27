const audio=document.getElementById('audio');
const mini=document.getElementById('mini');
const tracks=[
  {name:'Georges Bizet — Carmen: Prelude to Act I',src:'./media/carmen-prelude.ogg'},
  {name:'Georges Bizet — Carmen: Toreador Song',src:'./media/carmen-toreador.ogg'},
  {name:'Retro Demo Track',src:''}
];
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
function selectTrack(i){current=i;loadTrack(i);if(tracks[i].src){audio.play().catch(()=>{});}}
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
let pGame={x:40,y:235,vx:0,vy:0,onGround:true,notes:0,lives:3,running:false,enemyX:520};
function startPlatformGame(){
  if(!pctx)return;
  pGame={x:40,y:235,vx:0,vy:0,onGround:true,notes:0,lives:3,running:true,enemyX:520};
  document.getElementById('noteCount').textContent=0;
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
  if(pGame.x>260&&pGame.x<300&&pGame.y>175){pGame.notes++;document.getElementById('noteCount').textContent=pGame.notes;pGame.x+=30;}
  drawPlatform();
  requestAnimationFrame(platformLoop);
}
function drawPlatform(message){
  pctx.clearRect(0,0,640,300);
  pctx.fillStyle='#111';pctx.fillRect(0,0,640,300);
  pctx.fillStyle='#1717ff';pctx.fillRect(0,260,640,40);
  pctx.fillStyle='#ffe600';pctx.fillRect(250,150,70,15);
  pctx.fillStyle='#ff20b8';pctx.fillRect(90,205,75,15);
  pctx.fillStyle='#ffe600';pctx.font='28px serif';pctx.fillText('♪',278,135);
  pctx.fillStyle='#f2c29b';pctx.beginPath();pctx.arc(pGame.enemyX+13,212,9,0,Math.PI*2);pctx.fill();
  pctx.fillStyle='#111';pctx.fillRect(pGame.enemyX+3,220,20,40);
  pctx.fillStyle='#fff';pctx.fillRect(pGame.enemyX+11,222,4,16);
  pctx.fillStyle='#d90000';pctx.fillRect(pGame.enemyX+10,224,6,4);
  pctx.fillStyle='#00e5ff';pctx.fillRect(pGame.x,pGame.y,25,25);
  pctx.fillStyle='#ffe600';pctx.font='16px monospace';pctx.fillText(message||'GRAB THE MUSIC NOTES!',15,25);
  pctx.fillStyle='#ff20b8';pctx.font='12px monospace';pctx.fillText('♪ ♫ ♪ BEAT STREET ♪ ♫ ♪',440,25);
}
if(pg)startPlatformGame();

/* MUSIC-THEMED KLONDIKE SOLITAIRE */
const suits=['♪','♫','♬','♩'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], tableau=[[],[],[],[],[],[],[]], waste=[], foundations=[[],[],[],[]], selected=null;
function makeDeck(){return suits.flatMap((s,si)=>ranks.map((r,i)=>({s,r,v:i+1,suit:si,red:si%2===1,face:false,id:si*13+i})).sort(()=>Math.random()-.5);}
function dealSolitaire(){
 deck=makeDeck();waste=[];foundations=[[],[],[],[]];selected=null;tableau=[[],[],[],[],[],[],[]];
 for(let c=0;c<7;c++)for(let r=0;r<=c;r++){const card=deck.pop();card.face=r===c;tableau[c].push(card);}
 renderSolitaire();setSolStatus('Deal complete. Move face-up cards in descending alternating colors.');
}
function drawSolitaire(){
 if(!deck.length){if(waste.length){deck=waste.reverse().map(c=>({...c,face:false}));waste=[];setSolStatus('Draw pile recycled.');}else{setSolStatus('No cards left to draw.');return;}}
 else {const c=deck.pop();c.face=true;waste.push(c);}
 selected=null;renderSolitaire();
}
function setSolStatus(t){const el=document.getElementById('solitaireStatus');if(el)el.textContent=t;}
function cardText(c){return c.face?c.r+c.s:'♫';}
function renderSolitaire(){
 const b=document.getElementById('solitaireBoard');if(!b)return;b.innerHTML='';
 const top=document.createElement('div');top.className='sol-top-row';
 const pile=document.createElement('button');pile.className='sol-pile';pile.textContent=deck.length?'♫ '+deck.length:'↻';pile.title='Draw or recycle';pile.onclick=drawSolitaire;top.appendChild(pile);
 const wa=document.createElement('button');wa.className='sol-pile';wa.textContent=waste.length?cardText(waste[waste.length-1]):'WASTE';wa.title='Select waste card';wa.onclick=()=>{if(waste.length){selected={type:'waste'};setSolStatus('Waste card selected. Choose a foundation or tableau column.');}};top.appendChild(wa);
 foundations.forEach((f,i)=>{const p=document.createElement('button');p.className='sol-pile sol-foundation';p.textContent=f.length?cardText(f[f.length-1]):['🟦','🟪','🟨','🟩'][i];p.title='Foundation '+(i+1);p.onclick=()=>moveToFoundation(i);top.appendChild(p);});
 b.appendChild(top);
 const cols=document.createElement('div');cols.className='sol-columns';
 tableau.forEach((col,ci)=>{const d=document.createElement('div');d.className='sol-col';d.dataset.col=ci;d.onclick=()=>selectSolitaire(ci,Math.max(0,col.length-1));
 col.forEach((c,ri)=>{const el=document.createElement('button');el.className='sol-card '+(c.red?'red':'')+((selected&&selected.type==='tableau'&&selected.ci===ci&&ri>=selected.ri)?' selected':'');el.textContent=cardText(c);el.style.top=(ri*clampCardGap())+'px';el.style.zIndex=ri+1;el.onclick=(e)=>{e.stopPropagation();selectSolitaire(ci,ri);};d.appendChild(el);});cols.appendChild(d);});b.appendChild(cols);
}
function clampCardGap(){return window.innerWidth<420?20:27;}
function selectSolitaire(ci,ri){
 const col=tableau[ci];if(!col.length){if(selected)tryMoveSelected(ci);return;}
 const c=col[ri];if(!c.face){setSolStatus('That card is face down.');return;}
 if(!selected){selected={type:'tableau',ci,ri};renderSolitaire();setSolStatus('Selected card stack. Choose a legal destination.');return;}
 if(selected.type==='tableau'&&selected.ci===ci&&selected.ri===ri){selected=null;renderSolitaire();return;}
 tryMoveSelected(ci,ri);
}
function tryMoveSelected(dest,ri){
 if(!selected)return;
 const target=tableau[dest];let moving;
 if(selected.type==='waste')moving=waste.length?[waste[waste.length-1]]:[];
 else moving=tableau[selected.ci].slice(selected.ri);
 if(!moving.length){selected=null;return;}
 const first=moving[0],top=target[target.length-1];
 const legal=!top?first.r==='K':top.face&&top.red!==first.red&&top.v===first.v+1;
 if(selected.type==='tableau'&&selected.ci===dest){selected=null;renderSolitaire();return;}
 if(!legal){setSolStatus('Not a legal move: stack down by one and alternate colors.');return;}
 if(selected.type==='waste')waste.pop();else{tableau[selected.ci].splice(selected.ri);const source=tableau[selected.ci];if(source.length)source[source.length-1].face=true;}
 target.push(...moving);selected=null;renderSolitaire();setSolStatus('Nice move! Keep building alternating-color stacks.');
}
function moveToFoundation(i){
 if(!selected){setSolStatus('Select a card first.');return;}
 let card,source;
 if(selected.type==='waste'){card=waste[waste.length-1];source=waste;}
 else {source=tableau[selected.ci];if(selected.ri!==source.length-1){setSolStatus('Only the top card can move to a foundation.');return;}card=source[source.length-1];}
 if(!card){selected=null;return;}
 const f=foundations[i],top=f[f.length-1];
 if((!top&&card.r==='A')||(top&&top.suit===card.suit&&card.v===top.v+1)){
  source.pop();if(selected.type==='tableau'&&source.length)source[source.length-1].face=true;f.push(card);selected=null;renderSolitaire();
  if(foundations.every(x=>x.length===13))setSolStatus('🎉 YOU WON! All music suits are complete!');else setSolStatus('Card moved to its music-suit foundation.');
 }else setSolStatus('Foundations build upward by suit, starting with Ace.');
}
function resetSolitaire(){deck=[];waste=[];foundations=[[],[],[],[]];tableau=[[],[],[],[],[],[],[]];selected=null;renderSolitaire();setSolStatus('Press DEAL to start a new game.');}

/* PLAYABLE MUSIC-BLOCK TETRIS */
const tc=document.getElementById('tetrisCanvas'),tx=tc?tc.getContext('2d'):null;
const TW=10,TH=20,TS=30;
const tetrisShapes=[
 [[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],
 [[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]
];
const tetrisColors=['#00d8ff','#ffe600','#ff32c8','#2f70ff','#ff7a18','#56e39f','#b56bff'];
let tBoard,tPiece,tScore=0,tLines=0,tLevel=1,tRunning=false,tTimer=null,tLast=0,tDropCounter=0;
function newTetrisPiece(){const i=Math.floor(Math.random()*tetrisShapes.length);return {shape:tetrisShapes[i].map(r=>r.slice()),x:Math.floor(TW/2)-Math.ceil(tetrisShapes[i][0].length/2),y:0,color:tetrisColors[i]};}
function startTetris(){if(!tx)return;clearInterval(tTimer);tBoard=Array.from({length:TH},()=>Array(TW).fill(0));tScore=0;tLines=0;tLevel=1;tRunning=true;tPiece=newTetrisPiece();tDropCounter=0;updateTetrisStats();drawTetris();tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));}
function tetrisCollide(piece,dx=0,dy=0,shape=piece.shape){return shape.some((row,y)=>row.some((v,x)=>v&&(piece.x+x+dx<0||piece.x+x+dx>=TW||piece.y+y+dy>=TH||(piece.y+y+dy>=0&&tBoard[piece.y+y+dy][piece.x+x+dx]))));}
function tetrisMerge(){tPiece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&tPiece.y+y>=0)tBoard[tPiece.y+y][tPiece.x+x]=tPiece.color;}));}
function tetrisTick(){if(!tRunning)return;if(!tetrisCollide(tPiece,0,1))tPiece.y++;else{tetrisMerge();tetrisClearLines();tPiece=newTetrisPiece();if(tetrisCollide(tPiece)){tRunning=false;clearInterval(tTimer);drawTetris();setTimeout(()=>alert('BEAT DROP OVER! Score: '+tScore),10);return;}}drawTetris();}
function tetrisClearLines(){let cleared=0;for(let y=TH-1;y>=0;y--){if(tBoard[y].every(Boolean)){tBoard.splice(y,1);tBoard.unshift(Array(TW).fill(0));cleared++;y++;}}if(cleared){tLines+=cleared;tScore+=[0,100,300,500,800][cleared]*tLevel;tLevel=1+Math.floor(tLines/10);clearInterval(tTimer);tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));updateTetrisStats();}}
function drawTetris(){if(!tx)return;tx.fillStyle='#050b1a';tx.fillRect(0,0,tc.width,tc.height);tx.strokeStyle='rgba(98,244,255,.13)';for(let x=0;x<=TW;x++){tx.beginPath();tx.moveTo(x*TS,0);tx.lineTo(x*TS,TH*TS);tx.stroke();}for(let y=0;y<=TH;y++){tx.beginPath();tx.moveTo(0,y*TS);tx.lineTo(TW*TS,y*TS);tx.stroke();}
tBoard.forEach((row,y)=>row.forEach((c,x)=>{if(c)tetrisCell(x,y,c);}));if(tPiece)tPiece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&tPiece.y+y>=0)tetrisCell(tPiece.x+x,tPiece.y+y,tPiece.color);}));if(!tRunning){tx.fillStyle='rgba(0,0,0,.65)';tx.fillRect(0,250,300,100);tx.fillStyle='#ffe600';tx.font='bold 17px monospace';tx.textAlign='center';tx.fillText(tPiece?'PAUSED / GAME OVER':'PRESS NEW GAME',150,295);tx.textAlign='start';}}
function tetrisCell(x,y,color){tx.fillStyle=color;tx.fillRect(x*TS+1,y*TS+1,TS-2,TS-2);tx.strokeStyle='#fff';tx.lineWidth=1.2;tx.strokeRect(x*TS+2,y*TS+2,TS-4,TS-4);tx.fillStyle='rgba(255,255,255,.25)';tx.fillRect(x*TS+4,y*TS+4,TS-8,4);}
function updateTetrisStats(){[['tetrisScore',tScore],['tetrisLines',tLines],['tetrisLevel',tLevel]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});}
function tetrisMove(dir){if(tRunning&&!tetrisCollide(tPiece,dir,0)){tPiece.x+=dir;drawTetris();}}
function tetrisRotate(){if(!tRunning)return;const shape=tPiece.shape[0].map((_,i)=>tPiece.shape.map(r=>r[i]).reverse());if(!tetrisCollide(tPiece,0,0,shape)){tPiece.shape=shape;drawTetris();}}
function tetrisDrop(){if(!tRunning)return;while(!tetrisCollide(tPiece,0,1))tPiece.y++;tetrisTick();}
function tetrisToggle(){if(!tPiece){startTetris();return;}tRunning=!tRunning;if(tRunning){clearInterval(tTimer);tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));}else clearInterval(tTimer);drawTetris();}
window.addEventListener('keydown',e=>{if(!document.getElementById('games')?.classList.contains('active'))return;if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')tetrisMove(-1);else if(e.key==='ArrowRight')tetrisMove(1);else if(e.key==='ArrowUp')tetrisRotate();else if(e.key==='ArrowDown')tetrisTick();else if(e.key===' ')tetrisDrop();else if(e.key.toLowerCase()==='p')tetrisToggle();});
dealSolitaire();
if(tx){tBoard=Array.from({length:TH},()=>Array(TW).fill(0));drawTetris();}
