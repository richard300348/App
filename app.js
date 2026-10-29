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
  const scoreEl=document.getElementById('score'); if(scoreEl) scoreEl.textContent=points;
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
const scoreEl=document.getElementById('score'); if(scoreEl) scoreEl.textContent=points;
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

/* BEAT STREET — EASY MUSIC PLATFORM GAME */
const pg=document.getElementById('platformGame');
const pctx=pg?pg.getContext('2d'):null;
const beatNotes=[{x:135,y:205,got:false},{x:245,y:155,got:false},{x:355,y:205,got:false},{x:465,y:155,got:false},{x:555,y:205,got:false}];
let pGame={x:35,y:220,vy:0,onGround:true,notes:0,running:true,won:false};
function startPlatformGame(){
 if(!pctx)return;
 pGame={x:35,y:220,vy:0,onGround:true,notes:0,running:true,won:false};
 beatNotes.forEach(n=>n.got=false);
 const n=document.getElementById('noteCount');if(n)n.textContent='0';
 drawPlatform();
}
function platformMove(dir){
 if(!pGame.running||!pctx)return;
 pGame.x=Math.max(8,Math.min(600,pGame.x+dir*28));
 if(pGame.onGround&&Math.random()<0.22){pGame.vy=-5;pGame.onGround=false;}
 checkBeatNotes();drawPlatform();
}
function platformJump(){if(pGame.running&&pGame.onGround){pGame.vy=-10;pGame.onGround=false;}}
function checkBeatNotes(){
 beatNotes.forEach(n=>{if(!n.got&&Math.abs(pGame.x-n.x)<32&&Math.abs(pGame.y-n.y)<65){n.got=true;pGame.notes++;const el=document.getElementById('noteCount');if(el)el.textContent=pGame.notes;}});
 if(pGame.x>=585){pGame.won=true;pGame.running=false;drawPlatform('YOU ROCK! BEAT RESTORED!');}
}
function platformLoop(){
 if(!pctx)return;
 if(pGame.running&&!pGame.onGround){pGame.vy+=0.55;pGame.y+=pGame.vy;if(pGame.y>=220){pGame.y=220;pGame.vy=0;pGame.onGround=true;}checkBeatNotes();drawPlatform();}
 requestAnimationFrame(platformLoop);
}
function drawPlatform(message){
 if(!pctx)return;
 pctx.clearRect(0,0,pg.width,pg.height);
 const bg=pctx.createLinearGradient(0,0,0,300);bg.addColorStop(0,'#07112b');bg.addColorStop(1,'#32104f');pctx.fillStyle=bg;pctx.fillRect(0,0,640,300);
 pctx.strokeStyle='rgba(0,229,255,.22)';pctx.lineWidth=1;
 for(let y=52;y<=92;y+=10){pctx.beginPath();pctx.moveTo(0,y);pctx.lineTo(640,y);pctx.stroke();}
 pctx.fillStyle='#ff32c8';pctx.font='25px serif';pctx.fillText('♫',28,75);pctx.fillText('♪',590,72);pctx.fillText('♬',520,110);
 pctx.fillStyle='#00d8ff';pctx.fillRect(0,255,640,45);pctx.fillStyle='#0754d6';pctx.fillRect(0,265,640,35);
 pctx.fillStyle='#ff32c8';pctx.fillRect(85,222,92,10);pctx.fillStyle='#ffe600';pctx.fillRect(205,175,90,10);pctx.fillStyle='#56e39f';pctx.fillRect(320,222,92,10);pctx.fillStyle='#b56bff';pctx.fillRect(425,175,92,10);
 beatNotes.forEach(n=>{if(!n.got){pctx.save();pctx.shadowColor='#ffe600';pctx.shadowBlur=12;pctx.fillStyle='#ffe600';pctx.font='bold 29px serif';pctx.fillText('♪',n.x,n.y);pctx.restore();}});
 pctx.fillStyle='#00e5ff';pctx.fillRect(pGame.x,pGame.y+5,25,25);
 pctx.fillStyle='#ffd1a3';pctx.beginPath();pctx.arc(pGame.x+12,pGame.y,10,0,Math.PI*2);pctx.fill();
 pctx.strokeStyle='#ff32c8';pctx.lineWidth=4;pctx.beginPath();pctx.arc(pGame.x+12,pGame.y,11,Math.PI,Math.PI*2);pctx.stroke();
 pctx.fillStyle='#07112b';pctx.fillRect(pGame.x+5,pGame.y-2,4,3);pctx.fillRect(pGame.x+15,pGame.y-2,4,3);
 pctx.fillStyle='#ffe600';pctx.font='bold 15px monospace';pctx.fillText(message||(pGame.running?'FOLLOW THE BEAT → COLLECT NOTES!':'LEVEL COMPLETE!'),14,25);
 pctx.fillStyle='#fff';pctx.font='12px monospace';pctx.fillText('♫ '+pGame.notes+' / 5 NOTES',490,25);
}
if(pg){startPlatformGame();platformLoop();}

/* MUSIC-THEMED KLONDIKE SOLITAIRE */
const suits=['♪','♫','♬','♩'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[], tableau=[[],[],[],[],[],[],[]], waste=[], foundations=[[],[],[],[]], selected=null;
function makeDeck(){return suits.flatMap((s,si)=>ranks.map((r,i)=>({s,r,v:i+1,suit:si,red:si%2===1,face:false,id:si*13+i}))).sort(()=>Math.random()-.5);}
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
function tetrisToggle(){if(!tPiece){startTetris();return;}tRunning=!tRunning;if(tRunning){clearInterval(tTimer);tTimer=setInterval(tetrisTick,Math.max(100,650-(tLevel-1)*45));}else clearInterval(tTimer);drawTetris();}
window.addEventListener('keydown',e=>{if(!document.getElementById('games')?.classList.contains('active'))return;if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')tetrisMove(-1);else if(e.key==='ArrowRight')tetrisMove(1);else if(e.key==='ArrowUp')tetrisRotate();else if(e.key==='ArrowDown')tetrisTick();else if(e.key===' ')tetrisDrop();else if(e.key.toLowerCase()==='p')tetrisToggle();});
dealSolitaire();
if(tx){tBoard=Array.from({length:TH},()=>Array(TW).fill(0));drawTetris();}


/* Music-themed Pac-Melody maze */
const pacCanvas=document.getElementById('pacCanvas');
const pacCtx=pacCanvas?pacCanvas.getContext('2d'):null;
const pacMap=[
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
let pacState={x:1,y:1,score:0,dirs:[{x:19,y:1},{x:19,y:15},{x:10,y:9}],running:true};
function startPacman(){pacState={x:1,y:1,score:0,dirs:[{x:19,y:1},{x:19,y:15},{x:10,y:9}],running:true};document.getElementById('pacScore').textContent='0';drawPacman();}
function pacMove(dx,dy){if(!pacCtx)return;const nx=pacState.x+dx,ny=pacState.y+dy;if(pacMap[ny]&&pacMap[ny][nx]&&pacMap[ny][nx]!=='#'){pacState.x=nx;pacState.y=ny;if(pacMap[ny][nx]!=='.'&&pacMap[ny][nx]!==' '&&pacMap[ny][nx]!=='#'){}if(pacMap[ny][nx]==='.'||pacMap[ny][nx]==='o'){const row=pacMap[ny].split('');row[nx]=' ';pacMap[ny]=row.join('');pacState.score+=pacMap[ny][nx]==='o'?10:10;document.getElementById('pacScore').textContent=pacState.score;}}
pacState.dirs.forEach((g,i)=>{if(Math.random()<.75){const opts=[[1,0],[-1,0],[0,1],[0,-1]].sort(()=>Math.random()-.5);for(const [gx,gy] of opts){const xx=g.x+gx,yy=g.y+gy;if(pacMap[yy]&&pacMap[yy][xx]&&pacMap[yy][xx]!=='#'){g.x=xx;g.y=yy;break;}}}if(g.x===pacState.x&&g.y===pacState.y){pacState.x=1;pacState.y=1;}});drawPacman();}
function drawPacman(){if(!pacCtx)return;const cell=20;pacCtx.fillStyle='#020814';pacCtx.fillRect(0,0,pacCanvas.width,pacCanvas.height);pacMap.forEach((row,y)=>[...row].forEach((ch,x)=>{const px=x*cell,py=y*cell;if(ch==='#'){pacCtx.fillStyle='#0754d6';pacCtx.fillRect(px+1,py+1,cell-2,cell-2);pacCtx.strokeStyle='#62f4ff';pacCtx.strokeRect(px+3,py+3,cell-6,cell-6);}else if(ch==='.'||ch==='o'){pacCtx.fillStyle=ch==='o'?'#ff32c8':'#ffe600';pacCtx.font='14px serif';pacCtx.textAlign='center';pacCtx.fillText(ch==='o'?'♫':'♪',px+10,py+15);}}));pacCtx.fillStyle='#ffe600';pacCtx.beginPath();pacCtx.arc(pacState.x*cell+10,pacState.y*cell+10,8,0.25,Math.PI*1.8);pacCtx.lineTo(pacState.x*cell+10,pacState.y*cell+10);pacCtx.fill();pacState.dirs.forEach((g,i)=>{pacCtx.fillStyle=['#ff32c8','#00d8ff','#56e39f'][i];pacCtx.beginPath();pacCtx.arc(g.x*cell+10,g.y*cell+10,7,Math.PI,0);pacCtx.lineTo(g.x*cell+17,g.y*cell+16);pacCtx.lineTo(g.x*cell+13,g.y*cell+13);pacCtx.lineTo(g.x*cell+9,g.y*cell+16);pacCtx.lineTo(g.x*cell+3,g.y*cell+13);pacCtx.closePath();pacCtx.fill();});}
window.addEventListener('keydown',e=>{if(!document.getElementById('games')?.classList.contains('active'))return;const dirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};if(dirs[e.key]&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();pacMove(...dirs[e.key]);}});
if(pacCtx)drawPacman();

/* Easy keyboard controls for Beat Street */
window.addEventListener('keydown',e=>{if(!document.getElementById('games')?.classList.contains('active'))return;if(['a','A','ArrowLeft'].includes(e.key)){e.preventDefault();platformMove(-1);}if(['d','D','ArrowRight'].includes(e.key)){e.preventDefault();platformMove(1);}if(['w','W','ArrowUp',' '].includes(e.key)){e.preventDefault();platformJump();}});

/* NEON FREQUENCY — open-world music adventure with cinematic cutscenes */
let pathStep='start',pathSoundOn=true,pathAudioCtx=null,pathSceneMode='explore';
const pathState={unlockedItem:false,itemUsed:false,miniBosses:{club:false,studio:false,subway:false},currentArea:'plaza',ending:null,playerX:2,playerY:2,health:100,treasures:{},quests:{mixTape:false,repairBot:false,streetCrew:false},questRewards:{},storyBranch:'undecided',checkpoint:{area:'plaza',playerX:2,playerY:2}};
const pathSaveKey='richie-neon-adventure-v2';
function pathSnapshot(){return {unlockedItem:pathState.unlockedItem,itemUsed:pathState.itemUsed,miniBosses:pathState.miniBosses,currentArea:pathState.currentArea,ending:pathState.ending,playerX:pathState.playerX,playerY:pathState.playerY,health:pathState.health,treasures:pathState.treasures,quests:pathState.quests,questRewards:pathState.questRewards,storyBranch:pathState.storyBranch,checkpoint:pathState.checkpoint}}
function pathApplySnapshot(d){if(!d||typeof d!=='object')return false;pathState.unlockedItem=!!d.unlockedItem;pathState.itemUsed=!!d.itemUsed;for(const id of ['club','studio','subway'])pathState.miniBosses[id]=!!d.miniBosses?.[id];pathState.currentArea=['plaza','club','studio','subway','tower'].includes(d.currentArea)?d.currentArea:'plaza';if(pathState.currentArea==='tower'&&!pathAllMiniBosses())pathState.currentArea='plaza';pathState.playerX=Number.isInteger(d.playerX)?Math.max(0,Math.min(4,d.playerX)):2;pathState.playerY=Number.isInteger(d.playerY)?Math.max(0,Math.min(4,d.playerY)):2;pathState.ending=['bass','crowd','vex','solo'].includes(d.ending)?d.ending:null;pathState.health=Number.isFinite(d.health)?Math.max(1,Math.min(100,d.health)):100;pathState.treasures=d.treasures&&typeof d.treasures==='object'?d.treasures:{};pathState.quests=Object.assign({mixTape:false,repairBot:false,streetCrew:false},d.quests||{});pathState.questRewards=Object.assign({},d.questRewards||{});pathState.storyBranch=['hope','truth','undecided'].includes(d.storyBranch)?d.storyBranch:'undecided';pathState.checkpoint=d.checkpoint&&['plaza','club','studio','subway','tower'].includes(d.checkpoint.area)?d.checkpoint:{area:'plaza',playerX:2,playerY:2};return true}
function pathSave(){try{localStorage.setItem(pathSaveKey,JSON.stringify(pathSnapshot()))}catch(e){}}
function pathLoad(){try{return pathApplySnapshot(JSON.parse(localStorage.getItem(pathSaveKey)||'null'))}catch(e){return false}}
function pathSaveSlot(slot){try{localStorage.setItem('richie-neon-slot-'+slot,JSON.stringify(pathSnapshot()));pathRender('SAVE SLOT '+slot+' UPDATED','Your adventure, quest choices, health, and checkpoint have been saved to slot '+slot+'.', [['↩ Continue adventure',pathState.currentArea]]);pathBeep('win')}catch(e){pathRender('SAVE FAILED','This browser could not store the save file. Check available device storage.',[['↩ Continue adventure',pathState.currentArea]])}}
function pathLoadSlot(slot){try{const raw=localStorage.getItem('richie-neon-slot-'+slot);if(!raw){pathRender('SLOT '+slot+' IS EMPTY','Save your current adventure to this slot first.',[['↩ Continue adventure',pathState.currentArea]]);return}if(pathApplySnapshot(JSON.parse(raw))){pathTravel(pathState.currentArea);pathPlayCutscene('SAVE SLOT '+slot+' LOADED','Welcome back, hero. Your quest progress and story decisions have been restored.',pathState.currentArea)}}catch(e){pathRender('SAVE COULD NOT LOAD','This slot may be damaged. Your current adventure has not been overwritten.',[['↩ Continue adventure',pathState.currentArea]])}}
function pathCheckpoint(){pathState.checkpoint={area:pathState.currentArea,playerX:pathState.playerX,playerY:pathState.playerY};pathSave();pathRender('CHECKPOINT LOCKED IN','Checkpoint saved at '+pathState.currentArea.toUpperCase()+'. If the signal drops, you can return here without losing quest progress.',[['↩ Keep exploring',pathState.currentArea]])}
function pathRestoreCheckpoint(){const cp=pathState.checkpoint||{area:'plaza',playerX:2,playerY:2};pathState.currentArea=cp.area;pathState.playerX=cp.playerX;pathState.playerY=cp.playerY;pathState.health=100;pathSave();pathTravel(cp.area);pathPlayCutscene('BACK TO THE LAST CHECKPOINT','You reboot at your last checkpoint. Your quest decisions and cleared bosses remain saved.',cp.area)}
const neonWorld={x:360,y:210,speed:3.2,keys:{},raf:0,last:0,canvas:null,ctx:null,host:null,joystick:{x:0,y:0},objects:[],anim:0,enemies:[],attackUntil:0,lyreUntil:0,lastDamage:0};
function pathMove(dx,dy){if(pathState.ending)return;neonWorld.x=Math.max(28,Math.min(1172,neonWorld.x+dx*34));neonWorld.y=Math.max(28,Math.min(772,neonWorld.y+dy*34));pathState.playerX=Math.round(neonWorld.x/293);pathState.playerY=Math.round(neonWorld.y/193);pathSave();neonWorldDraw()}
document.addEventListener('keydown',e=>{if(!document.getElementById('pathStory')||!document.getElementById('pathStory').offsetParent)return;if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const dirs={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};if(dirs[e.key]){e.preventDefault();neonWorld.keys[dirs[e.key]]=true}if([' ','e','E'].includes(e.key)){if(e.key===' '&&document.activeElement?.tagName==='BUTTON')return;e.preventDefault();neonWorldInteract()}});
document.addEventListener('keyup',e=>{const dirs={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};if(dirs[e.key])neonWorld.keys[dirs[e.key]]=false});
function neonWorldLayout(area){const data={plaza:[{x:150,y:160,e:'🚪',n:'Bassline Club Gate',a:'enter-club'},{x:1030,y:160,e:'🎹',n:'Echo Lab Gate',a:'enter-studio'},{x:260,y:650,e:'🚇',n:'Static Subway Gate',a:'enter-subway'},{x:900,y:650,e:'💿',n:'Music Terminal',a:'terminal'},{x:570,y:140,e:'🧰',n:'Neon Treasure Cache',a:'chest-plaza'},{x:570,y:330,e:'🧑‍🎤',n:'Mika the DJ',a:'npc-mika'},{x:770,y:500,e:'🤖',n:'Patch the Helper Bot',a:'npc-patch'},{x:390,y:500,e:'🛹',n:'Street Crew',a:'npc-crew'}],club:[{x:200,y:200,e:'🔊',n:'Power Speaker',a:'speaker'},{x:850,y:210,e:'🎚️',n:'DJ Mixer',a:'mixer'},{x:600,y:680,e:'👹',n:'Bass Beast',a:'boss-club'},{x:430,y:360,e:'🧰',n:'Bass Vault Chest',a:'chest-club'}],studio:[{x:220,y:210,e:'💿',n:'Sample Disc',a:'disc'},{x:900,y:230,e:'🎛️',n:'Sampler Console',a:'console'},{x:600,y:680,e:'👻',n:'Sample Phantom',a:'boss-studio'},{x:430,y:360,e:'🧰',n:'Echo Lab Chest',a:'chest-studio'}],subway:[{x:200,y:180,e:'🚦',n:'Signal Switch',a:'signal'},{x:950,y:200,e:'🎵',n:'Lost Melody',a:'melody'},{x:600,y:690,e:'🤖',n:'Tempo Warden',a:'boss-subway'},{x:430,y:360,e:'🧰',n:'Subway Supply Cache',a:'chest-subway'}],tower:[{x:600,y:400,e:'🌀',n:'Director Vex Portal',a:'boss-enter'}]};return data[area]||data.plaza}
function pathRenderExplorer(box,scene){
 const area=pathState.currentArea||'plaza',panel=document.createElement('section');panel.className='path-explorer path-world-play';panel.innerHTML='<div class="path-world-head"><div><h4>🌌 NEON FREQUENCY • LIVE WORLD</h4><p>Explore freely. Move with WASD / arrow keys or the touch pad. Get close to a glowing object and press INTERACT (E).</p></div><span class="path-world-coord">AREA: '+area.toUpperCase()+'</span></div><canvas class="neon-world-canvas" width="720" height="420" aria-label="Playable top-down futuristic music adventure world"></canvas><div class="path-world-hud"><span class="path-world-nearby">✦ Scanning nearby signals…</span><span>🎼 '+(pathState.unlockedItem?'ECHO LYRE READY':'ECHO LYRE LOCKED')+'</span></div><div class="path-world-controls"><div class="path-joystick" aria-label="Movement controls"><button type="button" data-move="up" aria-label="Move up">▲</button><div><button type="button" data-move="left" aria-label="Move left">◀</button><button type="button" data-move="down" aria-label="Move down">▼</button><button type="button" data-move="right" aria-label="Move right">▶</button></div></div><div class="path-action-buttons"><button type="button" class="path-attack">⚔ ATTACK</button><button type="button" class="path-lyre">🎼 ECHO LYRE</button><button type="button" class="path-interact">✦ INTERACT</button></div></div>';
 const c=panel.querySelector('canvas');neonWorld.canvas=c;neonWorld.ctx=c.getContext('2d');neonWorld.host=panel;neonWorld.objects=neonWorldLayout(area);neonWorld.enemies=area==='plaza'||area==='tower'?[]:[{x:370,y:260,hp:3,maxHp:3,e:'👾',name:'Glitch Drone',speed:22,phase:0},{x:900,y:500,hp:3,maxHp:3,e:'🤖',name:'Mute Bot',speed:18,phase:1}];neonWorld.keys={};if(neonWorld.area!==area){neonWorld.area=area;neonWorld.x=area==='plaza'?360:360;neonWorld.y=area==='plaza'?340:340}neonWorld.anim=neonWorld.anim||0;
 panel.querySelectorAll('[data-move]').forEach(b=>{const d=b.dataset.move;const down=e=>{e.preventDefault();neonWorld.keys[d]=true};const up=e=>{e.preventDefault();neonWorld.keys[d]=false};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);b.addEventListener('click',()=>{if(!('PointerEvent'in window))pathMove(d==='left'?-1:d==='right'?1:0,d==='up'?-1:d==='down'?1:0)})});
 panel.querySelector('.path-interact').onclick=neonWorldInteract;panel.querySelector('.path-attack').onclick=neonWorldAttack;panel.querySelector('.path-lyre').onclick=neonWorldLyre;box.appendChild(panel);neonWorldDraw();if(neonWorld.raf)cancelAnimationFrame(neonWorld.raf);neonWorld.last=0;neonWorld.raf=requestAnimationFrame(neonWorldLoop);
}
function neonWorldLoop(ts){if(!neonWorld.canvas||!neonWorld.canvas.isConnected)return;const dt=Math.min(32,ts-(neonWorld.last||ts));neonWorld.last=ts;const k=neonWorld.keys,dx=(k.right?1:0)-(k.left?1:0),dy=(k.down?1:0)-(k.up?1:0);if(dx||dy){const mag=Math.hypot(dx,dy)||1;neonWorld.x=Math.max(26,Math.min(1194,neonWorld.x+dx/mag*neonWorld.speed*dt/16));neonWorld.y=Math.max(26,Math.min(774,neonWorld.y+dy/mag*neonWorld.speed*dt/16));pathState.playerX=Math.round(neonWorld.x/293);pathState.playerY=Math.round(neonWorld.y/193);pathSave()}neonWorld.anim+=dt/1000;neonWorld.enemies.forEach(e=>{e.phase+=dt/1000;const dx=neonWorld.x-e.x,dy=neonWorld.y-e.y,dist=Math.hypot(dx,dy);if(dist<210&&dist>28){e.x+=dx/dist*e.speed*dt/1000;e.y+=dy/dist*e.speed*dt/1000}if(dist<29&&ts-neonWorld.lastDamage>1100){pathState.health=Math.max(1,pathState.health-8);neonWorld.lastDamage=ts;pathSave()}});neonWorldDraw();neonWorld.raf=requestAnimationFrame(neonWorldLoop)}
function neonWorldDraw(){const c=neonWorld.canvas,g=neonWorld.ctx;if(!c||!g||!c.isConnected)return;const w=1200,h=800,scale=Math.min(c.width/720,c.height/420),area=pathState.currentArea||'plaza',ox=Math.max(0,Math.min(w-720,neonWorld.x-360)),oy=Math.max(0,Math.min(h-420,neonWorld.y-210)),t=neonWorld.anim||0;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.save();g.scale(c.width/720,c.height/420);g.translate(-ox,-oy);
 const bg=area==='subway'?'#071426':area==='studio'?'#18113c':area==='club'?'#160b32':area==='tower'?'#230b2a':'#071a36';g.fillStyle=bg;g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=48)for(let x=0;x<w;x+=48){g.fillStyle=(x+y)%96?'rgba(33,231,255,.055)':'rgba(255,50,200,.07)';g.fillRect(x+2,y+2,43,43)}
 for(let i=0;i<45;i++){let x=(i*173+37)%w,y=(i*97+19)%h;g.fillStyle=i%2?'#22e8ff':'#ff38c9';g.globalAlpha=.3+.25*Math.sin(t*2+i);g.fillRect(x,y,2,2)}g.globalAlpha=1;
 // city blocks and glowing roads
 g.fillStyle='#0a1230';for(let y=80;y<760;y+=210)for(let x=80;x<1160;x+=260){g.fillRect(x,y,170,105);g.strokeStyle='#2059a3';g.lineWidth=3;g.strokeRect(x,y,170,105);for(let a=0;a<5;a++){g.fillStyle=(a%2?'#ff32c8':'#20dfff');g.globalAlpha=.35;g.fillRect(x+14+a*29,y+15,12,7);g.globalAlpha=1}}
 g.strokeStyle=area==='subway'?'#ff32c8':'#075cff';g.lineWidth=22;g.beginPath();g.moveTo(0,400);g.lineTo(1200,400);g.moveTo(600,0);g.lineTo(600,800);g.stroke();g.strokeStyle='#20e7ff';g.lineWidth=2;g.setLineDash([15,14]);g.beginPath();g.moveTo(0,400);g.lineTo(1200,400);g.moveTo(600,0);g.lineTo(600,800);g.stroke();g.setLineDash([]);
 const objs=neonWorld.objects||[];objs.forEach((o,i)=>{if(o.a&&o.a.startsWith('chest-')&&pathState.treasures[o.a])return;const pulse=1+Math.sin(t*3+i)*.09;g.save();g.translate(o.x,o.y);g.scale(pulse,pulse);g.fillStyle='rgba(0,229,255,.15)';g.beginPath();g.arc(0,0,36,0,Math.PI*2);g.fill();g.strokeStyle='#24e7ff';g.lineWidth=2;g.beginPath();g.arc(0,0,28+Math.sin(t*2+i)*3,0,Math.PI*2);g.stroke();g.fillStyle='#fff';g.font='30px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.e,0,0);g.fillStyle='#ffe600';g.font='bold 12px monospace';g.fillText(o.n.toUpperCase(),0,47);g.restore()});
 // roaming enemy drones and health bars
 (neonWorld.enemies||[]).forEach(e=>{g.save();g.translate(e.x,e.y+Math.sin(t*7+e.phase)*3);g.fillStyle='rgba(255,23,79,.2)';g.beginPath();g.arc(0,0,27,0,Math.PI*2);g.fill();g.font='27px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(e.e,0,0);g.fillStyle='#240617';g.fillRect(-20,-27,40,5);g.fillStyle='#ff174f';g.fillRect(-20,-27,40*(e.hp/e.maxHp),5);g.restore()});
 // animated hero with shadow, jacket and visor
 g.save();g.translate(neonWorld.x,neonWorld.y+Math.sin(t*9)*2);g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(0,13,17,8,0,0,Math.PI*2);g.fill();g.fillStyle='#ff32c8';g.fillRect(-12,1,9,15);g.fillRect(3,1,9,15);g.fillStyle='#087cff';g.fillRect(-14,-14,28,25);g.strokeStyle='#24e7ff';g.lineWidth=2;g.strokeRect(-14,-14,28,25);g.fillStyle='#d9f7ff';g.beginPath();g.arc(0,-23,13,0,Math.PI*2);g.fill();g.fillStyle='#03102e';g.fillRect(-9,-27,18,8);g.fillStyle='#24e7ff';g.fillRect(-7,-25,14,3);g.fillStyle='#ffe600';g.fillRect(-19,-7,5,12);g.fillRect(14,-7,5,12);g.restore();
 // Echo Lyre pulse and player health HUD
 if(t<neonWorld.lyreUntil){g.strokeStyle='#ffe600';g.lineWidth=4;g.beginPath();g.arc(neonWorld.x,neonWorld.y,38+Math.sin(t*18)*12,0,Math.PI*2);g.stroke()}
 g.fillStyle='rgba(2,8,24,.9)';g.fillRect(12,44,190,30);g.strokeStyle='#24e7ff';g.strokeRect(12,44,190,30);g.fillStyle='#24101d';g.fillRect(22,54,130,10);g.fillStyle=pathState.health>35?'#56e39f':'#ff174f';g.fillRect(22,54,130*(pathState.health/100),10);g.fillStyle='#fff';g.font='bold 11px monospace';g.fillText('HP '+pathState.health+'/100',160,63);
 // viewport HUD compass
 g.fillStyle='rgba(2,8,24,.86)';g.fillRect(12,12,170,28);g.strokeStyle='#24e7ff';g.strokeRect(12,12,170,28);g.fillStyle='#fff';g.font='bold 12px monospace';g.textAlign='left';g.fillText(area.toUpperCase()+' // SECTOR '+(Math.floor(neonWorld.x/300)+1),22,30);g.restore();
 const nearest=objs.slice().sort((a,b)=>Math.hypot(a.x-neonWorld.x,a.y-neonWorld.y)-Math.hypot(b.x-neonWorld.x,b.y-neonWorld.y))[0],distance=nearest?Math.hypot(nearest.x-neonWorld.x,nearest.y-neonWorld.y):999;const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent=nearest&&distance<95?'✦ IN RANGE: '+nearest.n+' — PRESS INTERACT':'✦ Explore and follow the glowing signals';
}
function neonWorldAttack(){const t=neonWorld.anim||0;neonWorld.attackUntil=t+.35;pathBeep('boss');const enemy=neonWorld.enemies.slice().sort((a,b)=>Math.hypot(a.x-neonWorld.x,a.y-neonWorld.y)-Math.hypot(b.x-neonWorld.x,b.y-neonWorld.y))[0];if(enemy&&Math.hypot(enemy.x-neonWorld.x,enemy.y-neonWorld.y)<105){enemy.hp-=1;if(enemy.hp<=0){neonWorld.enemies=neonWorld.enemies.filter(e=>e!==enemy);pathState.health=Math.min(100,pathState.health+10);pathSave();const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='✦ '+enemy.name+' defeated! +10 HP'}else{const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='⚔ Hit! '+enemy.name+' HP: '+enemy.hp+'/'+enemy.maxHp}}else{const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='Swing missed — get closer to a drone!'}neonWorldDraw()}
function neonWorldLyre(){if(!pathState.unlockedItem){const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='Echo Lyre locked. Defeat a dungeon guardian first.';pathBeep('choice');return}neonWorld.lyreUntil=(neonWorld.anim||0)+2.5;pathState.itemUsed=true;neonWorld.enemies=neonWorld.enemies.filter(e=>{if(Math.hypot(e.x-neonWorld.x,e.y-neonWorld.y)<170){pathState.health=Math.min(100,pathState.health+5);return false}return true});pathSave();pathBeep('magic');const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='🎼 ECHO PULSE! Nearby drones are disrupted and hidden signals glow.';neonWorldDraw()}
function neonWorldInteract(){const area=pathState.currentArea||'plaza',objs=neonWorldLayout(area),o=objs.slice().sort((a,b)=>Math.hypot(a.x-neonWorld.x,a.y-neonWorld.y)-Math.hypot(b.x-neonWorld.x,b.y-neonWorld.y))[0];if(!o||Math.hypot(o.x-neonWorld.x,o.y-neonWorld.y)>95){const label=neonWorld.host?.querySelector('.path-world-nearby');if(label)label.textContent='Move closer to a glowing object before interacting.';return}pathBeep(pathState.unlockedItem?'magic':'choice');if(o.a.startsWith('enter-')){pathTravel(o.a.slice(6));return}if(o.a==='boss-enter'||o.a.startsWith('boss-')){pathChoose(o.a);return}if(o.a&&o.a.startsWith('chest-')){if(pathState.treasures[o.a])return;pathState.treasures[o.a]=true;pathState.health=Math.min(100,pathState.health+25);pathSave();pathBeep('win');pathRender('TREASURE FOUND!','You opened '+o.n+' and found a Neon Heart battery. Health restored by 25 points. The cache stays open when you return.',[['↩️ Continue exploring',area]],area);return}if(o.a==='npc-mika'){pathRender('MIKA • THE DJ','MIKA: “Vex stole my community mixtape. Bring back the three sound fragments and I can rally the whole city.”',pathState.quests.mixTape?[['🎤 Tell Mika the mixtape is restored','quest-mika-done'],['↩ Keep exploring','plaza']]:[['🎵 Accept: Recover the mixtape','quest-mika'],['🕵 Ask about Director Vex','branch-truth'],['↩ Not now','plaza']],'plaza');pathSpeak('Mika the DJ says: Vex stole my community mixtape. Bring back the three sound fragments and I can rally the whole city.');return}if(o.a==='npc-patch'){pathRender('PATCH • HELPER BOT','PATCH: “BEEP! My navigation chip is scrambled. A Neon Heart battery should get my memory back online.”',pathState.quests.repairBot?[['🤖 Check on Patch','quest-patch-done'],['↩ Later','plaza']]:[['🧰 Accept: Repair Patch','quest-patch'],['↩ Later','plaza']],'plaza');pathSpeak('Patch the helper bot says: My navigation chip is scrambled. A Neon Heart battery should get my memory back online.');return}if(o.a==='npc-crew'){pathRender('THE NEON STREET CREW','CREW LEADER: “The city needs a voice. Help us set up a street concert, or go straight for Vex.”',pathState.quests.streetCrew?[['📣 Rally the crew','quest-crew-done'],['↩ Later','plaza']]:[['🎸 Accept: Build the street concert','quest-crew'],['💥 Promise to defeat Vex alone','branch-hope'],['↩ Later','plaza']],'plaza');pathSpeak('The street crew says: The city needs a voice. Help us set up a street concert, or go straight for Vex.');return}if(o.a==='terminal'){pathRender('CITY MUSIC TERMINAL','Choose a route to travel across Neon City.',[['🎧 Bassline Club','enter-club'],['🎹 Echo Lab','enter-studio'],['🚇 Static Subway','enter-subway']],'plaza');return}if(!pathState.unlockedItem){pathRender('DORMANT MUSIC TECH','This device needs the Echo Lyre. Defeat a mini-boss to unlock the magic music item.',[['⚔️ Face the mini-boss','boss-'+area],['↩️ Return to plaza','plaza']],area);return}const effects={speaker:'Your Echo Lyre resonates with the speaker. A hidden bridge rises from the floor.',mixer:'You remix the DJ console and the neon lights reveal a secret passage.',disc:'The Lyre repairs the sample disc and opens a concealed door.',console:'A chord rearranges the sampler platforms into a staircase.',signal:'The Lyre retunes the subway signal and opens a sealed tunnel.',melody:'The lost melody follows your notes, lighting a hidden path.'};pathState.itemUsed=true;pathRender('ECHO LYRE — SCENE REMIX',effects[o.a]||'The music reshapes this area and reveals a new path.',[['🎼 Remix the scene again','magic-'+area],['⚔️ Face the mini-boss','boss-'+area],['↩️ Return to plaza','plaza']],area)}
const pathAreas={plaza:{name:'NEON PLAZA',emoji:'🌆',desc:'A lively crossroads. Three sealed dungeon entrances pulse with stolen music.',scene:'plaza'},club:{name:'BASSLINE CLUB DUNGEON',emoji:'🎧',desc:'A rhythm dungeon guarded by the Bass Beast.',scene:'club'},studio:{name:'ECHO LAB DUNGEON',emoji:'🎹',desc:'A puzzle dungeon haunted by the Sample Phantom.',scene:'studio'},subway:{name:'STATIC SUBWAY DUNGEON',emoji:'🚇',desc:'A shadowy tunnel where the Tempo Warden guards a lost melody.',scene:'subway'},tower:{name:'VEX TOWER',emoji:'🏰',desc:'The final gate. Director Vex is protected until every mini-boss is defeated.',scene:'tower'}};
function pathBeep(kind='click'){if(!pathSoundOn)return;try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;pathAudioCtx=pathAudioCtx||new Ctx();if(pathAudioCtx.state==='suspended')pathAudioCtx.resume();const now=pathAudioCtx.currentTime,notes=kind==='boss'?[110,165,220]:kind==='win'?[523,659,784]:kind==='magic'?[440,660,880]:kind==='choice'?[330,440]:[220,330];notes.forEach((freq,i)=>{const osc=pathAudioCtx.createOscillator(),gain=pathAudioCtx.createGain();osc.type=kind==='boss'?'sawtooth':'triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,now+i*.09);gain.gain.exponentialRampToValueAtTime(.12,now+i*.09+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.22);osc.connect(gain);gain.connect(pathAudioCtx.destination);osc.start(now+i*.09);osc.stop(now+i*.09+.24);});}catch(e){}}
function pathSpeak(text){if(!pathSoundOn||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=pathStep==='boss'?.72:1.08;u.volume=.9;speechSynthesis.speak(u);}catch(e){}}
function pathAllMiniBosses(){return Object.values(pathState.miniBosses).every(Boolean)}
function pathArt(scene){
 const boss=scene==='boss',ending=scene==='ending',club=scene==='club',studio=scene==='studio',subway=scene==='subway',tower=scene==='tower',magic=pathState.unlockedItem;
 const title=({plaza:'NEON PLAZA',club:'BASSLINE CLUB',studio:'ECHO LAB',subway:'STATIC SUBWAY',tower:'VEX TOWER',boss:'DIRECTOR VEX',ending:'THE CITY SINGS'})[scene]||'NEON FREQUENCY';
 let landmarks='';
 if(club)landmarks='<g><rect x="92" y="120" width="110" height="100" rx="8" fill="#17113f" stroke="#ff32c8" stroke-width="5"/><circle cx="147" cy="170" r="33" fill="#00e5ff"/><circle cx="147" cy="170" r="13" fill="#101638"/><rect x="485" y="120" width="110" height="100" rx="8" fill="#17113f" stroke="#00e5ff" stroke-width="5"/><circle cx="540" cy="170" r="33" fill="#ff32c8"/><circle cx="540" cy="170" r="13" fill="#101638"/><path d="M240 190v-45h20v45h20v-68h20v68h20v-32h20v32h20v-52h20v52h20v-40h20v40" stroke="#ffe600" stroke-width="5" fill="none"/></g>';
 else if(studio)landmarks='<g transform="translate(245 120)"><circle r="56" fill="#151a43" stroke="#ff32c8" stroke-width="5"/><circle r="16" fill="#00e5ff"/><path d="M0 0L-35 -30" stroke="#fff" stroke-width="5"/><rect x="90" y="-25" width="150" height="105" rx="7" fill="#0d2050" stroke="#00e5ff" stroke-width="4"/>'+Array.from({length:8},(_,i)=>'<rect x="'+(104+(i%4)*32)+'" y="'+(i<4?-10:30)+'" width="20" height="20" rx="3" fill="'+(i%2?'#ff32c8':'#ffe600')+'"/>').join('')+'</g>';
 else if(subway)landmarks='<path d="M100 235V120Q100 55 165 55H555Q620 55 620 120V235" fill="#11182f" stroke="#00e5ff" stroke-width="7"/><path d="M145 235V130Q145 95 180 95H540Q575 95 575 130V235" fill="#080e22" stroke="#ff32c8" stroke-width="3"/><path d="M160 175h400M160 195h400" stroke="#ffe600" stroke-width="3"/><circle cx="360" cy="155" r="28" fill="#ff32c8"/>';
 else if(boss||tower)landmarks='<path d="M270 240V100L310 70V40H410V70L450 100V240Z" fill="#10142f" stroke="#ff32c8" stroke-width="5"/><circle cx="360" cy="130" r="45" fill="#270d3a" stroke="#00e5ff" stroke-width="5"/><path d="M338 120l15 5m15 0 15-5M345 150q15-13 30 0" stroke="#ff32c8" stroke-width="5" fill="none"/><path d="M210 185q45-50 90 0t90 0t90 0t90 0" fill="none" stroke="#00e5ff" stroke-width="4"/>';
 else if(ending)landmarks='<g fill="#ff32c8"><circle cx="130" cy="90" r="8"/><circle cx="590" cy="75" r="8"/><circle cx="525" cy="45" r="6"/></g><g fill="#00e5ff"><path d="M180 65l8 18 18 8-18 8-8 18-8-18-18-8 18-8z"/><path d="M565 125l7 15 15 7-15 7-7 15-7-15-15-7 15-7z"/></g>';
 else landmarks='<g fill="#0a1027" stroke="#087cff" stroke-width="3"><path d="M50 225V130H95V95H140V225Z"/><path d="M165 225V145H215V105H255V225Z"/><path d="M470 225V130H520V80H570V225Z"/><path d="M590 225V145H640V110H690V225Z"/></g><path d="M0 225Q100 210 200 225T400 225T720 225V250H0Z" fill="#101633"/>';
 const stars=Array.from({length:24},(_,i)=>'<circle cx="'+((i*89+17)%720)+'" cy="'+((i*41+11)%170)+'" r="'+(i%3+1)+'" fill="#fff" opacity=".6"/>').join('');
 return '<div class="path-art cinematic-art" role="img" aria-label="'+title+' scene"><svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cinbg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#030817"/><stop offset=".6" stop-color="'+(boss?'#5b123d':ending?'#0754d6':'#10245a')+'"/><stop offset="1" stop-color="#160720"/></linearGradient></defs><rect width="720" height="260" rx="12" fill="url(#cinbg)"/>'+stars+'<g class="scene-parallax">'+landmarks+'</g><text x="24" y="34" fill="#00e5ff" font-size="15" font-family="monospace" letter-spacing="3">RICHIE HUB • OPEN WORLD</text><text x="24" y="62" fill="#ffe600" font-size="23" font-family="monospace" font-weight="bold">'+title+'</text>'+(magic?'<g transform="translate(625 48)"><circle r="20" fill="#ffe600" opacity=".2"/><text text-anchor="middle" y="8" font-size="27">🎼</text></g>':'')+'<text x="696" y="242" text-anchor="end" fill="#ff32c8" font-size="13" font-family="monospace">'+(boss?'FINAL BOSS':ending?'FREEDOM RESTORED':'EXPLORE • DISCOVER • PLAY')+'</text></svg></div>';
}
function pathRender(title,body,choices,scene){
 const box=document.getElementById('pathStory');if(!box)return;box.innerHTML='';pathSave();
 const actualScene=scene||pathAreas[pathState.currentArea]?.scene||'plaza';box.insertAdjacentHTML('beforeend',pathArt(actualScene));
 const top=document.createElement('div');top.className='path-audio-tools';
 const saveTools=document.createElement('div');saveTools.className='path-save-tools';saveTools.innerHTML='<span>💾 SAVE SLOTS</span><button type="button" data-slot-save="1">Save 1</button><button type="button" data-slot-load="1">Load 1</button><button type="button" data-slot-save="2">Save 2</button><button type="button" data-slot-load="2">Load 2</button><button type="button" data-slot-save="3">Save 3</button><button type="button" data-slot-load="3">Load 3</button><button type="button" data-checkpoint>📍 Checkpoint</button><button type="button" data-restore>↩ Respawn</button>';saveTools.querySelectorAll('[data-slot-save]').forEach(b=>b.onclick=()=>pathSaveSlot(b.dataset.slotSave));saveTools.querySelectorAll('[data-slot-load]').forEach(b=>b.onclick=()=>pathLoadSlot(b.dataset.slotLoad));saveTools.querySelector('[data-checkpoint]').onclick=pathCheckpoint;saveTools.querySelector('[data-restore]').onclick=pathRestoreCheckpoint;box.appendChild(saveTools);
 const sound=document.createElement('button');sound.type='button';sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';sound.onclick=()=>{pathSoundOn=!pathSoundOn;sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';if(!pathSoundOn&&'speechSynthesis'in window)speechSynthesis.cancel();else pathBeep('choice')};top.appendChild(sound);
 const voice=document.createElement('button');voice.type='button';voice.textContent='🗣️ HEAR SCENE';voice.onclick=()=>pathSpeak(title+'. '+body);top.appendChild(voice);
 const film=document.createElement('button');film.type='button';film.textContent='🎬 WATCH CUTSCENE';film.onclick=()=>pathPlayCutscene(title,body,actualScene);top.appendChild(film);box.appendChild(top);
 const h=document.createElement('h4');h.textContent=title;box.appendChild(h);const p=document.createElement('p');p.className='path-cutscene-text';p.textContent=body;box.appendChild(p);
 if(choices&&choices.length){const wrap=document.createElement('div');wrap.className='path-choices';choices.forEach(item=>{const b=document.createElement('button');b.textContent=item[0];b.onclick=()=>{pathBeep('choice');pathChoose(item[1]);};wrap.appendChild(b)});box.appendChild(wrap)}
 pathRenderExplorer(box,actualScene);pathRenderMap(box);
}
function pathPlayCutscene(title,body,scene){
 const box=document.getElementById('pathStory');if(!box)return;pathSceneMode='cutscene';
 const overlay=document.createElement('div');overlay.className='path-cinematic-overlay';
 overlay.innerHTML='<div class="path-cinematic-frame">'+pathArt(scene)+'<div class="cinema-bars"></div><div class="cinema-caption"><span>NOW PLAYING • STORY CINEMATIC</span><h3></h3><p></p><div class="cinema-controls"><button type="button" class="cinema-speak">🗣️ Narrate</button><button type="button" class="cinema-skip">⏭ Close cutscene</button></div></div></div>';
 overlay.querySelector('h3').textContent=title;overlay.querySelector('p').textContent=body;overlay.querySelector('.cinema-speak').onclick=()=>pathSpeak(title+'. '+body);overlay.querySelector('.cinema-skip').onclick=()=>{pathSceneMode='explore';overlay.remove()};box.appendChild(overlay);pathBeep('magic');
}

function pathRenderExplorer(box,scene){
 if(scene==='boss'||scene==='ending')return;
 const area=pathState.currentArea||'plaza';
 const layouts={plaza:[{x:0,y:1,e:'🚪',n:'Club Gate',a:'enter-club'},{x:4,y:1,e:'🎹',n:'Echo Lab',a:'enter-studio'},{x:1,y:4,e:'🚇',n:'Subway Gate',a:'enter-subway'},{x:3,y:4,e:'💿',n:'Music Terminal',a:'terminal'}],club:[{x:1,y:1,e:'🔊',n:'Power Speaker',a:'speaker'},{x:3,y:1,e:'🎚️',n:'DJ Mixer',a:'mixer'},{x:2,y:4,e:'👹',n:'Bass Beast',a:'boss-club'}],studio:[{x:1,y:1,e:'💿',n:'Sample Disc',a:'disc'},{x:3,y:1,e:'🎛️',n:'Sampler',a:'console'},{x:2,y:4,e:'👻',n:'Sample Phantom',a:'boss-studio'}],subway:[{x:1,y:1,e:'🚦',n:'Signal Switch',a:'signal'},{x:3,y:1,e:'🎵',n:'Lost Melody',a:'melody'},{x:2,y:4,e:'🤖',n:'Tempo Warden',a:'boss-subway'}],tower:[{x:2,y:2,e:'🌀',n:'Boss Portal',a:'boss-enter'}]};
 const objects=layouts[area]||[],panel=document.createElement('section');panel.className='path-explorer';
 panel.innerHTML='<h4>🎮 EXPLORE THIS WORLD</h4><p>Use arrows / WASD or tap controls. Press E / INTERACT near objects. The Echo Lyre changes the environment after you unlock it.</p><div class="path-grid"></div><div class="path-explorer-controls"><button data-dir="up">▲</button><div><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div><button class="path-interact">✦ INTERACT</button></div><p class="path-explorer-status">Use the arrows to explore.</p>';
 const grid=panel.querySelector('.path-grid');
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){const b=document.createElement('button');b.type='button';b.className='path-tile';const o=objects.find(v=>v.x===x&&v.y===y);if(pathState.playerX===x&&pathState.playerY===y){b.classList.add('path-player-tile');b.textContent='🧑‍🚀'}else if(o){b.classList.add('path-object-tile');b.innerHTML='<span>'+o.e+'</span><small></small>';b.querySelector('small').textContent=o.n}else b.textContent=(x+y)%2?'·':'✧';b.onclick=()=>{if(Math.abs(pathState.playerX-x)+Math.abs(pathState.playerY-y)<=1){pathState.playerX=x;pathState.playerY=y;pathRender(pathTitle(area),pathBody(area),pathChoices(area),scene)}else panel.querySelector('.path-explorer-status').textContent='Move one square at a time with the arrows.'};grid.appendChild(b)}
 function pathTitle(a){return ({plaza:'NEON PLAZA — EXPLORE',club:'BASSLINE CLUB DUNGEON',studio:'ECHO LAB DUNGEON',subway:'STATIC SUBWAY DUNGEON',tower:'VEX TOWER'})[a]||'EXPLORE'}
 function pathBody(a){return ({plaza:'Roam the city hub and find the three dungeon entrances.',club:'Explore speaker halls and face the Bass Beast.',studio:'Explore the sampler lab and face the Sample Phantom.',subway:'Follow the rail signals and face the Tempo Warden.',tower:'All dungeon locks are broken. Find the portal to Director Vex.'})[a]||''}
 function pathChoices(a){if(a==='plaza')return [['🎧 Bassline Club','enter-club'],['🎹 Echo Lab','enter-studio'],['🚇 Static Subway','enter-subway']];if(a==='tower')return [['⚔️ Enter final boss chamber','boss-enter']];const id=a==='club'?'club':a==='studio'?'studio':'subway';return [['⚔️ Challenge mini-boss','boss-'+id],...(pathState.unlockedItem?[['🎼 Use Echo Lyre','magic-'+id]]:[]),['↩️ Return to plaza','plaza']]}
 const near=objects.find(o=>Math.abs(o.x-pathState.playerX)+Math.abs(o.y-pathState.playerY)<=1);if(near)panel.querySelector('.path-explorer-status').textContent='Within reach: '+near.n+'. Press INTERACT.';
 panel.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{const d=b.dataset.dir;pathMove(d==='left'?-1:d==='right'?1:0,d==='up'?-1:d==='down'?1:0)});
 panel.querySelector('.path-interact').onclick=()=>{const o=objects.find(v=>Math.abs(v.x-pathState.playerX)+Math.abs(v.y-pathState.playerY)<=1);if(!o){panel.querySelector('.path-explorer-status').textContent='No object nearby. Move closer first.';return}pathBeep(pathState.unlockedItem?'magic':'choice');if(o.a.startsWith('enter-')){pathTravel(o.a.slice(6));return}if(o.a==='boss-enter'||o.a.startsWith('boss-')){pathChoose(o.a);return}if(o.a==='terminal'){pathRender('CITY MUSIC TERMINAL','Choose a route to travel across Neon City.',pathChoices('plaza'),'plaza');return}if(!pathState.unlockedItem){pathRender('DORMANT MUSIC TECH','This device needs the Echo Lyre. Defeat a mini-boss to unlock the magic music item.',[['⚔️ Face the mini-boss','boss-'+area],['↩️ Return to plaza','plaza']],area);return}const effects={speaker:'Your Echo Lyre resonates with the speaker. A hidden bridge rises from the floor.',mixer:'You remix the DJ console and the neon lights reveal a secret passage.',disc:'The Lyre repairs the sample disc and opens a concealed door.',console:'A chord rearranges the sampler platforms into a staircase.',signal:'The Lyre retunes the subway signal and opens a sealed tunnel.',melody:'The lost melody follows your notes, lighting a hidden path.'};pathState.itemUsed=true;pathBeep('magic');pathRender('ECHO LYRE — SCENE REMIX',effects[o.a]||'The music reshapes this area and reveals a new path.',[['🎼 Remix the scene again','magic-'+area],['⚔️ Face the mini-boss','boss-'+area],['↩️ Return to plaza','plaza']],area)};
 box.appendChild(panel);
}

function pathRenderMap(box){
 const map=document.createElement('div');map.className='path-world-map';map.innerHTML='<h4>🗺️ NEON CITY — WORLD MAP</h4><p>Explore freely. Defeat all three dungeon mini-bosses to unlock Vex Tower.</p><div class="path-map-grid"></div><div class="path-progress"></div>';
 const grid=map.querySelector('.path-map-grid');
 ['plaza','club','studio','subway','tower'].forEach(id=>{const a=pathAreas[id],b=document.createElement('button');b.type='button';b.className='path-map-location';if(id==='tower'&&!pathAllMiniBosses())b.disabled=true;if(pathState.currentArea===id)b.classList.add('current');b.innerHTML='<span class="map-emoji">'+a.emoji+'</span><strong></strong><small></small>';b.querySelector('strong').textContent=a.name;b.querySelector('small').textContent=id==='tower'?(pathAllMiniBosses()?'UNLOCKED':'🔒 '+Object.values(pathState.miniBosses).filter(Boolean).length+'/3 MINI-BOSSES'):id==='plaza'?'SAFE HUB':pathState.miniBosses[id]?'✓ MINI-BOSS DEFEATED':'DUNGEON • EXPLORE';b.onclick=()=>pathTravel(id);grid.appendChild(b)});
 map.querySelector('.path-progress').textContent='DUNGEONS CLEARED: '+Object.values(pathState.miniBosses).filter(Boolean).length+' / 3'+(pathState.unlockedItem?' • 🎼 ECHO LYRE UNLOCKED':' • 🎼 Find the Echo Lyre in your first dungeon');box.appendChild(map);
}
function pathTravel(area){
 if(area==='tower'&&!pathAllMiniBosses()){pathRender('THE TOWER IS SEALED','Director Vex is protected by three sound locks. Defeat the Bass Beast, Sample Phantom, and Tempo Warden first.',[['🗺️ Return to Neon Plaza','plaza']],'tower');return}
 if(pathState.currentArea!==area){pathState.playerX=2;pathState.playerY=2}pathState.currentArea=area;
 if(area==='plaza'){pathStep='explore';pathRender('NEON PLAZA — YOUR ADVENTURE','The city is yours to explore. Choose any open dungeon. The Echo Lyre is hidden in the first dungeon you clear.',[['🎧 Enter Bassline Club Dungeon','enter-club'],['🎹 Enter Echo Lab Dungeon','enter-studio'],['🚇 Enter Static Subway Dungeon','enter-subway']],'plaza');return}
 if(area==='tower'){pathStep='boss';pathRender('VEX TOWER — FINAL DUNGEON','All three mini-bosses are defeated. The tower gates open. Director Vex waits in the Mega-Mute chamber.',[['⚔️ Enter the boss chamber','boss-enter']],'tower');return}
 const data={club:['BASSLINE CLUB DUNGEON','Navigate glowing speaker halls and face the Bass Beast.',['🥁 Challenge the Bass Beast','boss-club'],['🎼 Use the Echo Lyre','magic-club']],studio:['ECHO LAB DUNGEON','Solve the sampler puzzle and face the Sample Phantom.',['🎹 Challenge the Sample Phantom','boss-studio'],['🎼 Use the Echo Lyre','magic-studio']],subway:['STATIC SUBWAY DUNGEON','Follow sound waves through the tunnels and face the Tempo Warden.',['🚇 Challenge the Tempo Warden','boss-subway'],['🎼 Use the Echo Lyre','magic-subway']]}[area];
 const choices=[data[2]];if(pathState.unlockedItem)choices.push(data[3]);choices.push(['↩️ Return to Neon Plaza','plaza']);pathStep=area;pathRender(data[0],data[1],choices,area);
}
function pathChoose(choice){
 if(pathAreas[choice]){pathTravel(choice);return}
 if(choice==='plaza'){pathTravel('plaza');return}if(choice==='quest-mika'){pathState.quests.mixTape=true;pathSave();pathRender('QUEST ACCEPTED: THE LOST MIXTAPE','Mika marks three audio fragments on your map. Clear the Club, Echo Lab, and Subway guardians to recover them. Your choice will shape the final concert.',[['🎧 Start the hunt','club'],['↩ Explore the plaza','plaza']],'plaza');pathSpeak('Quest accepted. Find the three audio fragments and restore Mika’s lost mixtape.');return}if(choice==='quest-patch'){pathState.quests.repairBot=true;pathSave();pathRender('QUEST ACCEPTED: PATCH ME UP','Patch needs a Neon Heart battery. Open any glowing treasure chest, then return to the helper bot in Neon Plaza.',[['🧰 Find a treasure cache','plaza'],['↩ Continue','plaza']],'plaza');return}if(choice==='quest-crew'){pathState.quests.streetCrew=true;pathSave();pathRender('QUEST ACCEPTED: STREET SYMPHONY','The crew needs all three sound locks broken before the concert can overpower Vex’s silence field.',[['🎧 Head to Bassline Club','club'],['↩ Keep exploring','plaza']],'plaza');return}if(choice==='quest-mika-done'){if(pathAllMiniBosses()){pathState.questRewards.mixtape=true;pathState.storyBranch='hope';pathSave();pathRender('MIXTAPE RESTORED!','Mika samples the three recovered fragments into a city-wide anthem. The crowd will answer if you ask them to stand together.',[['📣 Return to the street crew','plaza']],'plaza')}else pathRender('THE MIXTAPE IS STILL INCOMPLETE','Mika needs all three guardians defeated before the fragments can be remixed.',[['🎧 Visit a dungeon','club'],['↩ Back to plaza','plaza']],'plaza');return}if(choice==='quest-patch-done'){if(Object.keys(pathState.treasures).some(k=>pathState.treasures[k])){pathState.questRewards.patch=true;pathState.health=100;pathSave();pathRender('PATCH IS BACK ONLINE','PATCH: “BEEP! I remember every safe route. Take this shield boost—your health is restored!”', [['⚡ Continue','plaza']],'plaza');pathSpeak('Patch says: I remember every safe route. Your health is restored!')}else pathRender('PATCH NEEDS A BATTERY','Open a treasure chest somewhere in Neon City, then return to Patch.',[['🧰 Find a cache','plaza']],'plaza');return}if(choice==='quest-crew-done'){if(pathAllMiniBosses()){pathState.questRewards.crew=true;pathSave();pathRender('THE STREET CONCERT IS READY','The crew builds a giant speaker stage in Neon Plaza. With this alliance, you can unlock the Unity ending.',[['📣 Prepare the city','plaza']],'plaza');pathSpeak('The street crew is ready. Together, we can make the city sing.')}else pathRender('THE CREW NEEDS THE SOUND KEYS','Clear all three dungeon guardians to power the concert speakers.',[['🎧 Enter a dungeon','club'],['↩ Return','plaza']],'plaza');return}if(choice==='branch-truth'){pathState.storyBranch='truth';pathSave();pathRender('MIKA REVEALS THE TRUTH','MIKA: “Vex was a sound engineer before the city abandoned his work. He is trying to erase music so nobody can feel left out again.” You can confront him with empathy—or fight for the city.',[['🤝 Remember Vex’s story','boss-enter'],['📣 Rally the city anyway','branch-hope'],['↩ Think on it','plaza']],'plaza');pathSpeak('Mika reveals that Vex once built music for the city, before it abandoned him.');return}if(choice==='branch-hope'){pathState.storyBranch='hope';pathSave();pathRender('A PROMISE TO NEON CITY','You promise the crew that music will belong to everyone. The city remembers your words.',[['📣 Return to the crew','plaza'],['⚔️ Continue the mission','club']],'plaza');return}if(choice==='branch-vex'){pathState.storyBranch='truth';pathSave();pathRender('VEX LOWERS HIS GUARD','Vex: “You heard what happened to me. Then prove this city can make room for everyone.”', [['🤝 Offer Vex a second chance','vex'],['🔊 End it with a Bass Drop','bass'],['📣 Let the city answer','crowd']],'boss');pathSpeak('Director Vex says: Prove this city can make room for everyone.');return}if(choice==='enter-club'){pathTravel('club');return}if(choice==='enter-studio'){pathTravel('studio');return}if(choice==='enter-subway'){pathTravel('subway');return}
 if(choice==='boss-enter'){pathStep='boss';pathRender('FINAL BOSS: DIRECTOR VEX','Vex powers up the MEGA-MUTE machine. Your choices matter: reveal his past, bring the city together, or overpower the core.',[['🎼 Remix the arena with the Echo Lyre','magic-final'],['🗣️ Talk to Vex about his past','branch-vex'],['🔊 Bass Drop Attack','bass'],['📣 Rally the City','crowd']],'boss');pathPlayCutscene('VEX TOWER: THE LAST TRACK','Director Vex: “When I needed this city, it turned the volume down on me. Now everyone will hear silence.”', 'boss');return}
 if(['boss-club','boss-studio','boss-subway'].includes(choice)){const id=choice==='boss-club'?'club':choice==='boss-studio'?'studio':'subway';const names={club:'BASS BEAST',studio:'SAMPLE PHANTOM',subway:'TEMPO WARDEN'};pathStep='mini-boss';pathRender('MINI-BOSS BATTLE: '+names[id],'The dungeon guardian attacks with a corrupted sound wave. Choose a counter-melody to break its shield.',[['🎵 Play the counter-melody','win-'+id],['🌀 Dodge and strike','win-'+id]],id);pathBeep('boss');return}
 if(choice.startsWith('win-')){const id=choice.slice(4);pathState.miniBosses[id]=true;pathStep='explore';let reward='';if(!pathState.unlockedItem){pathState.unlockedItem=true;reward=' You discover the ECHO LYRE, a magic music item! It lets you remix the environment and interact with special scene objects.';pathBeep('magic')}const remaining=3-Object.values(pathState.miniBosses).filter(Boolean).length;pathRender('MINI-BOSS DEFEATED!','The guardian dissolves into musical sparks. Dungeon cleared!'+reward+(remaining?' '+remaining+' mini-boss'+(remaining===1?' remains':'es remain')+' before Vex Tower unlocks.':' All three sound locks are broken. Vex Tower is now open.'),[['🗺️ Explore Neon Plaza','plaza'],['🔁 Explore this dungeon again',id]],id);pathBeep('win');return}
 if(choice.startsWith('magic-')){if(!pathState.unlockedItem){pathRender('THE ECHO LYRE IS STILL LOCKED','Defeat a dungeon mini-boss to find the Echo Lyre.',[['⚔️ Return to dungeon','club']]);return}pathState.itemUsed=true;pathBeep('magic');if(choice==='magic-final'){pathRender('ECHO LYRE: REALITY REMIX','You strum the Echo Lyre. The arena bends into a giant living soundboard; the Mega-Mute shield flickers, exposing Vex.',[['🔊 Finish with a Bass Drop','bass'],['📣 Rally the City','crowd']],'boss');return}const id=choice.slice(6);pathRender('MAGIC MUSIC ITEM ACTIVATED','The Echo Lyre reshapes the dungeon: hidden bridges appear, speakers open secret doors, and glowing notes reveal a new route. The mini-boss is still waiting.',[['⚔️ Face the mini-boss','boss-'+id],['🗺️ Return to Neon Plaza','plaza']],id);return}
 if(['bass','crowd','vex','solo'].includes(choice)){pathState.ending=choice;pathStep='ending';pathBeep('win');let ending;if(choice==='bass')ending=['ENDING: BASS BREAKER','Your Echo Lyre-powered bass drop shatters the Mega-Mute core. Music floods Neon City, and you become its legendary Bass Breaker.'];else if(choice==='crowd'||(choice==='vex'&&pathState.questRewards.crew))ending=['ENDING: THE CITY SINGS','You bring Neon City together in one unstoppable chorus. The streets come alive with music again.'];else if(choice==='vex'&&pathState.storyBranch==='truth')ending=['ENDING: SECOND CHANCES','You acknowledge Vex’s pain and invite him back to the community. He dismantles the Mega-Mute and helps build a studio where nobody is left unheard.'];else ending=['ENDING: THE LAST SOLO','You defeat Vex alone. The city is free, but the final song sounds different without the voices you could have brought together.'];pathRender(ending[0],ending[1],[['🏆 Play the adventure again','again']],'ending');pathPlayCutscene(ending[0],ending[1],'ending');pathSpeak(ending[0]+'. '+ending[1]);return}
 if(choice==='again')if(pathLoad()){if(pathState.ending){pathRender('ADVENTURE COMPLETE','Your music restored Neon City. Play again to explore another ending.',[['🏆 Play again','again']],'ending')}else pathTravel(pathState.currentArea)}else pathRestart();
}
function pathRestart(){try{localStorage.removeItem(pathSaveKey)}catch(e){}pathState.playerX=2;pathState.playerY=2;pathStep='start';pathSceneMode='explore';pathState.unlockedItem=false;pathState.itemUsed=false;pathState.miniBosses={club:false,studio:false,subway:false};pathState.currentArea='plaza';pathState.ending=null;pathState.health=100;pathState.treasures={};pathState.quests={mixTape:false,repairBot:false,streetCrew:false};pathState.questRewards={};pathState.storyBranch='undecided';pathState.checkpoint={area:'plaza',playerX:2,playerY:2};pathTravel('plaza');pathPlayCutscene('THE CITY LOST ITS BEAT','It is 2004. Neon City has fallen silent. Explore the open world, clear three dungeons, find the Echo Lyre, and unlock the final boss.','plaza')}
pathRestart();
