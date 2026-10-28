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

/* CHOOSE-YOUR-OWN-PATH MUSIC ADVENTURE — illustrated scenes + sound */
let pathStep='start',pathSoundOn=true,pathAudioCtx=null;
function pathBeep(kind='click'){
 if(!pathSoundOn)return;
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  pathAudioCtx=pathAudioCtx||new Ctx();if(pathAudioCtx.state==='suspended')pathAudioCtx.resume();
  const now=pathAudioCtx.currentTime,notes=kind==='boss'?[110,165,220]:kind==='win'?[523,659,784]:kind==='choice'?[330,440]:[220,330];
  notes.forEach((freq,i)=>{const osc=pathAudioCtx.createOscillator(),gain=pathAudioCtx.createGain();osc.type=kind==='boss'?'sawtooth':'triangle';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,now+i*.09);gain.gain.exponentialRampToValueAtTime(.12,now+i*.09+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.22);osc.connect(gain);gain.connect(pathAudioCtx.destination);osc.start(now+i*.09);osc.stop(now+i*.09+.24);});
 }catch(e){}
}
function pathSpeak(text){
 if(!pathSoundOn||!('speechSynthesis' in window))return;
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=pathStep==='boss'?.72:1.08;u.volume=.9;speechSynthesis.speak(u);}catch(e){}
}
function pathSceneArt(){
 const scene=pathStep;
 const config={
 start:['THE CITY LOST ITS BEAT','NEON CITY • 2004','club lights, a music-note skyline and a silent city'],
 club:['THE UNDERGROUND CLUB','BASSLINE DISTRICT','DJ booth, neon speakers and a dance floor'],
 studio:['THE ABANDONED STUDIO','OLD SCHOOL SOUND LAB','turntables, sampler pads and dusty records'],
 clue:['SECRET FREQUENCY FOUND','A NEW CLUE IN THE MIX','glowing waveform and a vinyl record'],
 tower:['VEX TOWER','THE SIGNAL IS GETTING LOUDER','tower skyline with pulsing sound waves'],
 boss:['FINAL BOSS','DIRECTOR VEX • MEGA-MUTE','villain silhouette in a neon sound machine'],
 ending:['THE CITY SINGS','THE BEAT RETURNS','crowd silhouettes, music notes and fireworks']
 }[scene]||['NEON FREQUENCY','MUSIC ADVENTURE','neon city'];
 const boss=scene==='boss',studio=scene==='studio',club=scene==='club',ending=scene==='ending';
 return `<div class="path-art" role="img" aria-label="${config[2]}">
 <svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
 <defs><linearGradient id="pathbg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07112b"/><stop offset=".55" stop-color="${boss?'#4b104c':ending?'#0754d6':'#10245a'}"/><stop offset="1" stop-color="#090519"/></linearGradient><linearGradient id="pathglow"><stop stop-color="#00e5ff"/><stop offset="1" stop-color="#ff32c8"/></linearGradient></defs>
 <rect width="720" height="250" rx="12" fill="url(#pathbg)"/>
 ${Array.from({length:30},(_,i)=>'<circle cx="'+((i*97+31)%720)+'" cy="'+((i*43+17)%190)+'" r="'+(i%3+1)+'" fill="#fff" opacity=".55"/>').join('')}
 <path d="M0 208 L0 170 48 170 48 130 88 130 88 184 126 184 126 110 166 110 166 174 205 174 205 145 246 145 246 205 286 205 286 150 324 150 324 183 366 183 366 125 404 125 404 190 445 190 445 142 487 142 487 204 530 204 530 165 570 165 570 110 610 110 610 182 650 182 650 145 690 145 690 205 720 205 720 250 0 250Z" fill="#080d24" opacity=".9"/>
 ${club?'<g fill="#ff32c8"><rect x="95" y="150" width="65" height="48" rx="4"/><rect x="560" y="150" width="65" height="48" rx="4"/></g><g fill="#00e5ff"><circle cx="128" cy="174" r="17"/><circle cx="593" cy="174" r="17"/></g><rect x="260" y="155" width="200" height="42" rx="5" fill="#1a2461" stroke="#00e5ff" stroke-width="3"/><path d="M275 185v-10h10v-15h10v25h10v-18h10v18h10v-30h10v30h10v-12h10v12h10v-22h10v22h10v-15h10v15h10v-20h10v20" stroke="#ff32c8" stroke-width="4" fill="none"/>':''}
 ${studio?'<g transform="translate(245 100)"><circle cx="0" cy="35" r="55" fill="#151a43" stroke="#ff32c8" stroke-width="5"/><circle cx="0" cy="35" r="15" fill="#00e5ff"/><circle cx="0" cy="35" r="4" fill="#07112b"/><path d="M0 35L-33 3" stroke="#fff" stroke-width="5"/><rect x="90" y="15" width="130" height="90" rx="7" fill="#0d2050" stroke="#00e5ff" stroke-width="4"/>'+Array.from({length:8},(_,i)=>'<rect x="'+(103+(i%4)*28)+'" y="'+(28+Math.floor(i/4)*30)+'" width="18" height="18" rx="3" fill="'+(i%2?'#ff32c8':'#ffe600')+'"/>').join('')+'</g>':''}
 ${boss?'<g transform="translate(360 120)"><circle r="57" fill="#130e28" stroke="#ff32c8" stroke-width="5"/><path d="M-36 -12L-12 -2M12 -2L36 -12" stroke="#ff32c8" stroke-width="8"/><path d="M-20 25Q0 5 20 25" stroke="#00e5ff" stroke-width="5" fill="none"/><path d="M-85 55L-60 8 60 8 85 55Z" fill="#1b2454" stroke="#00e5ff" stroke-width="4"/><path d="M-125 80Q-80 55 -45 80T35 80T125 80" stroke="#ff32c8" stroke-width="5" fill="none"/></g><text x="360" y="222" text-anchor="middle" fill="#ffe600" font-size="20" font-family="monospace">MEGA-MUTE ACTIVATED</text>':''}
 ${ending?'<g fill="#ff32c8"><circle cx="110" cy="110" r="8"/><circle cx="600" cy="95" r="8"/><circle cx="530" cy="55" r="6"/></g><g fill="#00e5ff"><path d="M150 65l8 18 18 8-18 8-8 18-8-18-18-8 18-8z"/><path d="M565 125l7 15 15 7-15 7-7 15-7-15-15-7 15-7z"/></g><g fill="#07112b" stroke="#00e5ff" stroke-width="3"><circle cx="270" cy="190" r="18"/><circle cx="325" cy="185" r="18"/><circle cx="380" cy="190" r="18"/><path d="M245 245v-35h50v35M300 245v-40h50v40M355 245v-35h50v35"/></g>':''}
 ${!studio&&!club&&!boss&&!ending?'<g transform="translate(355 130)" fill="none" stroke="url(#pathglow)" stroke-width="5"><path d="M-200 0q25 -70 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0"/><circle cx="0" cy="0" r="68" stroke-dasharray="8 8"/><circle cx="0" cy="0" r="40"/><circle cx="0" cy="0" r="8" fill="#ffe600" stroke="none"/></g>':''}
 <text x="24" y="35" fill="#00e5ff" font-size="15" font-family="monospace" letter-spacing="3">RICHIE HUB • INTERACTIVE STORY</text>
 <text x="24" y="64" fill="#ffe600" font-size="23" font-family="monospace" font-weight="bold">${config[0]}</text>
 <text x="696" y="235" text-anchor="end" fill="#ff32c8" font-size="13" font-family="monospace">${config[1]}</text>
 </svg></div>`;
}
function pathRender(title,body,choices){
 const box=document.getElementById('pathStory');if(!box)return;box.innerHTML='';
 box.insertAdjacentHTML('beforeend',pathSceneArt());
 const toolbar=document.createElement('div');toolbar.className='path-audio-tools';
 const sound=document.createElement('button');sound.type='button';sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';sound.setAttribute('aria-pressed',String(pathSoundOn));sound.onclick=()=>{pathSoundOn=!pathSoundOn;sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';sound.setAttribute('aria-pressed',String(pathSoundOn));if(!pathSoundOn&&'speechSynthesis'in window)speechSynthesis.cancel();else pathBeep('choice');};toolbar.appendChild(sound);
 const voice=document.createElement('button');voice.type='button';voice.textContent='🗣️ HEAR SCENE';voice.onclick=()=>pathSpeak(title+'. '+body);toolbar.appendChild(voice);box.appendChild(toolbar);
 const h=document.createElement('h4');h.textContent=title;box.appendChild(h);
 const p=document.createElement('p');p.textContent=body;box.appendChild(p);
 const wrap=document.createElement('div');wrap.className='path-choices';
 choices.forEach(function(item){const b=document.createElement('button');b.textContent=item[0];b.onclick=function(){pathBeep(pathStep==='boss'?'boss':'choice');pathChoose(item[1]);};wrap.appendChild(b);});box.appendChild(wrap);
 if(pathStep==='boss')pathBeep('boss');
}
function pathChoose(choice){
 if(pathStep==='start'){if(choice==='club'){pathStep='club';pathRender('THE UNDERGROUND CLUB','DJ Static reveals that Vex’s enforcers guard the stolen beat. Choose stealth or challenge the DJ.',[['🕶️ Sneak through the sound booth','sneak'],['🥁 Win the rhythm duel','duel']]);}else if(choice==='studio'){pathStep='studio';pathRender('THE ABANDONED STUDIO','A dusty sampler reveals a clue, but security drones wake up. Decode the sample or escape over the rooftops.',[['🎛️ Decode the sample','decode'],['🏃 Escape across rooftops','roof']]);}return;}
 if(['sneak','duel','decode','roof'].includes(choice)){pathStep='clue';let story={sneak:['SECRET FREQUENCY FOUND','You slip past the guards and learn Vex’s hideout frequency.'],duel:['THE CROWD JOINS YOUR BEAT','You win the rhythm duel and gain an amp that weakens Vex’s shield.'],decode:['THE MASTER TRACK CLUE','You decode the melody and discover the weakness in Vex’s sound shield.'],roof:['ROOFTOP ALLY','You escape the drones and a beat-maker gives you a backup soundboard.']}[choice];pathRender(story[0],story[1],[['➡️ Head to Vex Tower','tower']]);return;}
 if(choice==='tower'){pathStep='boss';pathRender('FINAL BOSS: DIRECTOR VEX','Vex activates the MEGA-MUTE machine. Choose your final move.',[['🔊 Bass Drop Attack','bass'],['🎚️ Remix the Signal','remix'],['📣 Rally the City','crowd']]);return;}
 if(['bass','remix','crowd'].includes(choice)){pathStep='ending';let endings={bass:['ENDING: BASS BREAKER','Your massive bass drop shatters Vex’s shield. Music returns to every street, and you become the Bass Breaker of Neon City.'],remix:['ENDING: MASTER REMIXER','You flip Vex’s signal into a citywide remix. His machine becomes the biggest speaker in town, and the city dances again.'],crowd:['ENDING: THE CITY SINGS','You rally the whole city into one unstoppable chorus. Vex cannot mute thousands of voices and surrenders.']}[choice];pathBeep('win');pathRender(endings[0],endings[1],[['🏆 Play again','again']]);pathSpeak(endings[0]+'. '+endings[1]);return;}
 if(choice==='again')pathRestart();
}
function pathRestart(){pathStep='start';pathRender('THE CITY LOST ITS BEAT','It is 2004. Every speaker in Neon City suddenly goes silent. Director Vex stole the master track. How will you begin?',[['🎧 Search the underground club','club'],['🎹 Break into the old studio','studio']]);}
