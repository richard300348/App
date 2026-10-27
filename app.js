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

/* Only the selected arcade cabinet receives keyboard input. */
let activeGame=null;
const heldKeys=new Set();
function gameVisible(){return document.getElementById('games').classList.contains('active')&&!document.hidden;}
function selectGame(game){activeGame=game;heldKeys.clear();document.querySelectorAll('#games .game').forEach(el=>el.classList.toggle('game-active',el===game));}
/* RETRO PLATFORM RUN */
const pg=document.getElementById('platformGame');
const pctx=pg?pg.getContext('2d'):null;
let platformFrame=null,platformLast=0;
const platforms=[{x:90,y:205,w:100},{x:250,y:150,w:100},{x:420,y:105,w:110}];
let platformNotes=[];
let pGame={x:40,y:235,vx:0,vy:0,onGround:true,notes:0,lives:3,running:false,enemyX:520};
function startPlatformGame(){
  if(!pctx)return;
  cancelAnimationFrame(platformFrame);platformLast=0;
  platformNotes=[{x:135,y:180},{x:290,y:125},{x:465,y:80}];
  pGame={x:40,y:235,vx:0,vy:0,onGround:true,notes:0,lives:3,running:true,enemyX:520};
  document.getElementById('noteCount').textContent=0;
  document.getElementById('lives').textContent=3;
  platformFrame=requestAnimationFrame(platformLoop);
}
function platformMove(dir){ if(pGame.running){pGame.vx=dir*4;} }
function platformJump(){ if(pGame.running&&pGame.onGround){pGame.vy=-10;pGame.onGround=false;} }
function platformLoop(time){
  if(!pGame.running)return;
  platformFrame=requestAnimationFrame(platformLoop);
  if(!gameVisible()||activeGame!==pg.closest('.game')){platformLast=time;return;}
  if(time-platformLast<16)return;
  platformLast=time;
  const left=heldKeys.has('ArrowLeft')||heldKeys.has('a');
  const right=heldKeys.has('ArrowRight')||heldKeys.has('d');
  if(left||right)pGame.vx=(Number(right)-Number(left))*4;
  const oldBottom=pGame.y+25;
  pGame.x=Math.max(8,Math.min(600,pGame.x+pGame.vx)); pGame.vx*=.82;
  pGame.vy+=.5; pGame.y+=pGame.vy;pGame.onGround=false;
  for(const platform of platforms){if(pGame.vy>=0&&oldBottom<=platform.y&&pGame.y+25>=platform.y&&pGame.x+25>platform.x&&pGame.x<platform.x+platform.w){pGame.y=platform.y-25;pGame.vy=0;pGame.onGround=true;}}
  if(pGame.y>=235){pGame.y=235;pGame.vy=0;pGame.onGround=true;}
  pGame.enemyX-=1.2;if(pGame.enemyX<0)pGame.enemyX=620;
  if(Math.abs(pGame.x-pGame.enemyX)<28&&pGame.y>205){pGame.lives--;document.getElementById('lives').textContent=pGame.lives;pGame.x=40;pGame.enemyX=520;if(pGame.lives<=0){pGame.running=false;drawPlatform('GAME OVER — PRESS RESTART');return;}}
  platformNotes=platformNotes.filter(note=>{
    if(Math.abs(pGame.x+12-note.x)<23&&Math.abs(pGame.y+12-note.y)<25){pGame.notes++;document.getElementById('noteCount').textContent=pGame.notes;return false;}return true;
  });
  if(!platformNotes.length){pGame.running=false;drawPlatform('YOU WIN! — PRESS RESTART');return;}
  drawPlatform();
}
function drawPlatform(message){
  pctx.clearRect(0,0,640,300);
  pctx.fillStyle='#111';pctx.fillRect(0,0,640,300);
  pctx.fillStyle='#1717ff';pctx.fillRect(0,260,640,40);
  platforms.forEach(platform=>{pctx.fillStyle='#ff20b8';pctx.fillRect(platform.x,platform.y,platform.w,15);});
  platformNotes.forEach(note=>{pctx.fillStyle='#ffe600';pctx.font='28px serif';pctx.fillText('♪',note.x-8,note.y+8);});
  pctx.fillStyle='#f2c29b';pctx.beginPath();pctx.arc(pGame.enemyX+13,212,9,0,Math.PI*2);pctx.fill();
  pctx.fillStyle='#111';pctx.fillRect(pGame.enemyX+3,220,20,40);
  pctx.fillStyle='#fff';pctx.fillRect(pGame.enemyX+11,222,4,16);
  pctx.fillStyle='#d90000';pctx.fillRect(pGame.enemyX+10,224,6,4);
  pctx.fillStyle='#00e5ff';pctx.fillRect(pGame.x,pGame.y,25,25);
  pctx.fillStyle='#ffe600';pctx.font='16px monospace';pctx.fillText(message||'GRAB THE MUSIC NOTES!',15,25);
  pctx.fillStyle='#ff20b8';pctx.font='12px monospace';pctx.fillText('♪ ♫ ♪ BEAT STREET ♪ ♫ ♪',440,25);
}
if(pg){startPlatformGame();drawPlatform();}

/* MUSIC-THEMED KLONDIKE SOLITAIRE */
const suits=['♪','♫','♬','♩'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], tableau=[[],[],[],[],[],[],[]], waste=[], foundations=[[],[],[],[]], selected=null;
function makeDeck(){const cards=suits.flatMap((s,si)=>ranks.map((r,i)=>({s,r,v:i+1,suit:si,red:si%2===1,face:false,id:si*13+i})));for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
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
 const wa=document.createElement('button');wa.className='sol-pile';wa.textContent=waste.length?cardText(waste[waste.length-1]):'WASTE';wa.title='Select waste card';wa.onclick=()=>{if(waste.length){selected={type:'waste'};renderSolitaire();setSolStatus('Waste card selected. Choose a foundation or tableau column.');}};top.appendChild(wa);
 foundations.forEach((f,i)=>{const p=document.createElement('button');p.className='sol-pile sol-foundation';p.textContent=f.length?cardText(f[f.length-1]):['🟦','🟪','🟨','🟩'][i];p.title='Foundation '+(i+1);p.onclick=()=>moveToFoundation(i);top.appendChild(p);});
 b.appendChild(top);
 const cols=document.createElement('div');cols.className='sol-columns';
 tableau.forEach((col,ci)=>{const d=document.createElement('div');d.className='sol-col';d.dataset.col=ci;d.onclick=()=>selectSolitaire(ci,Math.max(0,col.length-1));
 col.forEach((c,ri)=>{const el=document.createElement('button');el.className='sol-card '+(c.red?'red':'')+((selected&&selected.type==='tableau'&&selected.ci===ci&&ri>=selected.ri)?' selected':'');el.classList.toggle('face-down',!c.face);el.setAttribute('aria-label',c.face?c.r+' suit '+(c.suit+1):'Face down card');el.textContent=cardText(c);el.style.top=(ri*clampCardGap())+'px';el.style.zIndex=ri+1;el.onclick=(e)=>{e.stopPropagation();selectSolitaire(ci,ri);};d.appendChild(el);});d.style.height=(Math.max(1,col.length)*clampCardGap()+75)+'px';cols.appendChild(d);});b.appendChild(cols);
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
function resetSolitaire(){dealSolitaire();}

/* PLAYABLE MUSIC-BLOCK TETRIS */
const tc=document.getElementById('tetrisCanvas'),tx=tc?tc.getContext('2d'):null;
const TW=10,TH=20,TS=30;
const tetrisShapes=[
 [[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],
 [[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]
];
const tetrisColors=['#00d8ff','#ffe600','#ff32c8','#2f70ff','#ff7a18','#56e39f','#b56bff'];
let tOver=false;
let tBoard,tPiece,tScore=0,tLines=0,tLevel=1,tRunning=false,tTimer=null,tLast=0,tDropCounter=0;
function newTetrisPiece(){const i=Math.floor(Math.random()*tetrisShapes.length);return {shape:tetrisShapes[i].map(r=>r.slice()),x:Math.floor(TW/2)-Math.ceil(tetrisShapes[i][0].length/2),y:0,color:tetrisColors[i]};}
function startTetris(){if(!tx)return;clearInterval(tTimer);tBoard=Array.from({length:TH},()=>Array(TW).fill(0));tScore=0;tLines=0;tLevel=1;tRunning=true;tOver=false;tPiece=newTetrisPiece();tDropCounter=0;updateTetrisStats();drawTetris();tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));}
function tetrisCollide(piece,dx=0,dy=0,shape=piece.shape){return shape.some((row,y)=>row.some((v,x)=>v&&(piece.x+x+dx<0||piece.x+x+dx>=TW||piece.y+y+dy>=TH||(piece.y+y+dy>=0&&tBoard[piece.y+y+dy][piece.x+x+dx]))));}
function tetrisMerge(){tPiece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&tPiece.y+y>=0)tBoard[tPiece.y+y][tPiece.x+x]=tPiece.color;}));}
function tetrisTick(){if(!tRunning||!gameVisible()||activeGame!==tc.closest('.game'))return;if(!tetrisCollide(tPiece,0,1))tPiece.y++;else{tetrisMerge();tetrisClearLines();tPiece=newTetrisPiece();if(tetrisCollide(tPiece)){tRunning=false;tOver=true;clearInterval(tTimer);drawTetris();return;}}drawTetris();}
function tetrisClearLines(){let cleared=0;for(let y=TH-1;y>=0;y--){if(tBoard[y].every(Boolean)){tBoard.splice(y,1);tBoard.unshift(Array(TW).fill(0));cleared++;y++;}}if(cleared){tLines+=cleared;tScore+=[0,100,300,500,800][cleared]*tLevel;tLevel=1+Math.floor(tLines/10);clearInterval(tTimer);tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));updateTetrisStats();}}
function drawTetris(){if(!tx)return;tx.fillStyle='#050b1a';tx.fillRect(0,0,tc.width,tc.height);tx.strokeStyle='rgba(98,244,255,.13)';for(let x=0;x<=TW;x++){tx.beginPath();tx.moveTo(x*TS,0);tx.lineTo(x*TS,TH*TS);tx.stroke();}for(let y=0;y<=TH;y++){tx.beginPath();tx.moveTo(0,y*TS);tx.lineTo(TW*TS,y*TS);tx.stroke();}
tBoard.forEach((row,y)=>row.forEach((c,x)=>{if(c)tetrisCell(x,y,c);}));if(tPiece)tPiece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&tPiece.y+y>=0)tetrisCell(tPiece.x+x,tPiece.y+y,tPiece.color);}));if(!tRunning){tx.fillStyle='rgba(0,0,0,.65)';tx.fillRect(0,250,300,100);tx.fillStyle='#ffe600';tx.font='bold 17px monospace';tx.textAlign='center';tx.fillText(tOver?'GAME OVER — NEW GAME':tPiece?'PAUSED':'PRESS NEW GAME',150,295);tx.textAlign='start';}}
function tetrisCell(x,y,color){
 const cx=x*TS+TS/2,cy=y*TS+TS/2,r=TS*.43;
 const glow=tx.createRadialGradient(cx-r*.35,cy-r*.4,1,cx,cy,r);
 glow.addColorStop(0,'#ffffff');glow.addColorStop(.18,color);glow.addColorStop(1,color);
 tx.save();tx.shadowColor=color;tx.shadowBlur=7;
 tx.beginPath();tx.arc(cx,cy,r,0,Math.PI*2);tx.fillStyle=glow;tx.fill();
 tx.shadowBlur=0;tx.strokeStyle='#fff';tx.lineWidth=1.5;tx.stroke();
 tx.fillStyle='#071124';tx.font='bold 17px serif';tx.textAlign='center';tx.textBaseline='middle';
 tx.fillText(['♪','♫','♬','♩'][(x+y)%4],cx,cy+1);
 tx.restore();
}
function updateTetrisStats(){[['tetrisScore',tScore],['tetrisLines',tLines],['tetrisLevel',tLevel]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});}
function tetrisMove(dir){if(tRunning&&!tetrisCollide(tPiece,dir,0)){tPiece.x+=dir;drawTetris();}}
function tetrisRotate(){if(!tRunning)return;const shape=tPiece.shape[0].map((_,i)=>tPiece.shape.map(r=>r[i]).reverse());if(!tetrisCollide(tPiece,0,0,shape)){tPiece.shape=shape;drawTetris();}}
function tetrisDrop(){if(!tRunning)return;while(!tetrisCollide(tPiece,0,1))tPiece.y++;tetrisTick();}
function tetrisToggle(){if(!tPiece||tOver){startTetris();return;}tRunning=!tRunning;if(tRunning){clearInterval(tTimer);tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));}else clearInterval(tTimer);drawTetris();}
dealSolitaire();
if(tx){tBoard=Array.from({length:TH},()=>Array(TW).fill(0));drawTetris();}


/* Music-themed Pac-Melody maze */
const pacCanvas=document.getElementById('pacCanvas');
const pacCtx=pacCanvas?pacCanvas.getContext('2d'):null;
const pacTemplate=[
"#####################",
"#.........#.........#",
"#.###.###.#.###.###.#",
"#o#...#...#...#...#o#",
"#.###.#.#####.#.###.#",
"#.....#...#...#.....#",
"#####.###.#.###.#####",
"#......... .........#",
"#.###.##.###.##.###.#",
"#...#....#....#...#.#",
"###.#.##...##.#.###.#",
"#...#....#....#...#.#",
"#.###.#######.###.#.#",
"#.........#.........#",
"#.###.###.#.###.###.#",
"#o..#...........#..o#",
"#####################"
];
let pacMap=pacTemplate.slice();
let pacState={x:1,y:1,score:0,lives:3,power:0,dirs:[{x:19,y:1},{x:19,y:15},{x:10,y:9}],running:true};
function startPacman(){pacMap=pacTemplate.slice();pacState={x:1,y:1,score:0,lives:3,power:0,dirs:[{x:19,y:1},{x:19,y:15},{x:10,y:9}],running:true};document.getElementById('pacScore').textContent='0';drawPacman();}
function pacMove(dx,dy){if(!pacCtx||!pacState.running)return;const originalX=pacState.x,originalY=pacState.y;const nx=pacState.x+dx,ny=pacState.y+dy;if(pacMap[ny]&&pacMap[ny][nx]&&pacMap[ny][nx]!=='#'){pacState.x=nx;pacState.y=ny;if(pacMap[ny][nx]!=='.'&&pacMap[ny][nx]!==' '&&pacMap[ny][nx]!=='#'){}if(pacMap[ny][nx]==='.'||pacMap[ny][nx]==='o'){const power=pacMap[ny][nx]==='o';if(power)pacState.power=20;const row=pacMap[ny].split('');row[nx]=' ';pacMap[ny]=row.join('');pacState.score+=power?50:10;document.getElementById('pacScore').textContent=pacState.score;}}
if(pacState.x===originalX&&pacState.y===originalY)return;
let hit=pacState.dirs.some(g=>g.x===pacState.x&&g.y===pacState.y);
pacState.dirs.forEach((g,i)=>{if(Math.random()<.75){const opts=[[1,0],[-1,0],[0,1],[0,-1]].sort(()=>Math.random()-.5);for(const [gx,gy] of opts){const xx=g.x+gx,yy=g.y+gy;if(pacMap[yy]&&pacMap[yy][xx]&&pacMap[yy][xx]!=='#'){g.x=xx;g.y=yy;break;}}}if(g.x===pacState.x&&g.y===pacState.y)hit=true;});
if(hit&&!pacState.power){pacState.lives--;pacState.x=1;pacState.y=1;pacState.dirs=[{x:19,y:1},{x:19,y:15},{x:10,y:9}];if(!pacState.lives)pacState.running=false;}
if(pacState.power)pacState.power--;
if(!pacMap.some(row=>/[.o]/.test(row)))pacState.running=false;
drawPacman();}
function drawPacman(){if(!pacCtx)return;document.getElementById('pacStatus').textContent=!pacState.running?(pacState.lives?'Maze cleared! Press NEW GAME.':'Game over. Press NEW GAME.'):'Lives: '+pacState.lives+' · '+(pacState.power?'Power notes active!':'Arrow keys or direction buttons. Collect every note.');const cell=20;pacCtx.fillStyle='#020814';pacCtx.fillRect(0,0,pacCanvas.width,pacCanvas.height);pacMap.forEach((row,y)=>[...row].forEach((ch,x)=>{const px=x*cell,py=y*cell;if(ch==='#'){pacCtx.fillStyle='#0754d6';pacCtx.fillRect(px+1,py+1,cell-2,cell-2);pacCtx.strokeStyle='#62f4ff';pacCtx.strokeRect(px+3,py+3,cell-6,cell-6);}else if(ch==='.'||ch==='o'){pacCtx.fillStyle=ch==='o'?'#ff32c8':'#ffe600';pacCtx.font='14px serif';pacCtx.textAlign='center';pacCtx.fillText(ch==='o'?'♫':'♪',px+10,py+15);}}));pacCtx.fillStyle='#ffe600';pacCtx.beginPath();pacCtx.arc(pacState.x*cell+10,pacState.y*cell+10,8,0.25,Math.PI*1.8);pacCtx.lineTo(pacState.x*cell+10,pacState.y*cell+10);pacCtx.fill();pacState.dirs.forEach((g,i)=>{pacCtx.fillStyle=['#ff32c8','#00d8ff','#56e39f'][i];pacCtx.beginPath();pacCtx.arc(g.x*cell+10,g.y*cell+10,7,Math.PI,0);pacCtx.lineTo(g.x*cell+17,g.y*cell+16);pacCtx.lineTo(g.x*cell+13,g.y*cell+13);pacCtx.lineTo(g.x*cell+9,g.y*cell+16);pacCtx.lineTo(g.x*cell+3,g.y*cell+13);pacCtx.closePath();pacCtx.fill();});}
if(pacCtx)drawPacman();


/* Scope desktop and touch input to one game and release held controls safely. */
document.querySelectorAll('#games .game').forEach(game=>{
  game.tabIndex=0;
  game.addEventListener('pointerdown',()=>{if(activeGame!==game)selectGame(game);});
  game.addEventListener('focusin',()=>{if(activeGame!==game)selectGame(game);});
});
window.addEventListener('keydown',e=>{
  if(!gameVisible()||!activeGame||e.target.matches('input,textarea,select,[contenteditable]'))return;
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w','p'].includes(key))return;
  if(activeGame.classList.contains('solitaire'))return;
  // Keep native Enter/Space activation available on buttons.
  if(key===' '&&e.target.tagName==='BUTTON')return;
  e.preventDefault();heldKeys.add(key);
  if(activeGame.classList.contains('pac-melody')){
    const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(dirs[key])pacMove(...dirs[key]);
  }else if(activeGame.classList.contains('retro-platformer')){
    if(['ArrowUp','w',' '].includes(key)&&!e.repeat)platformJump();
  }else if(activeGame.classList.contains('tetris-game')){
    if(key==='ArrowLeft')tetrisMove(-1);if(key==='ArrowRight')tetrisMove(1);
    if(key==='ArrowUp')tetrisRotate();if(key==='ArrowDown')tetrisTick();
    if(key===' '&&!e.repeat)tetrisDrop();if(key==='p'&&!e.repeat)tetrisToggle();
  }
});
window.addEventListener('keyup',e=>heldKeys.delete(e.key.length===1?e.key.toLowerCase():e.key));
function releaseControls(){heldKeys.clear();pGame.vx=0;}
window.addEventListener('blur',releaseControls);
document.addEventListener('visibilitychange',releaseControls);
const platformButtons=pg.closest('.game').querySelectorAll('[data-direction]');
platformButtons.forEach(button=>{
  let repeat=null;
  const stop=()=>{clearInterval(repeat);repeat=null;pGame.vx=0;};
  button.addEventListener('pointerdown',e=>{e.preventDefault();selectGame(button.closest('.game'));button.setPointerCapture(e.pointerId);stop();platformMove(Number(button.dataset.direction));repeat=setInterval(()=>platformMove(Number(button.dataset.direction)),16);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,stop));
});
