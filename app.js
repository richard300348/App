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
const pathState={unlockedItem:false,itemUsed:false,miniBosses:{club:false,studio:false,subway:false},currentArea:'plaza',ending:null};
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
 const box=document.getElementById('pathStory');if(!box)return;box.innerHTML='';
 const actualScene=scene||pathAreas[pathState.currentArea]?.scene||'plaza';box.insertAdjacentHTML('beforeend',pathArt(actualScene));
 const top=document.createElement('div');top.className='path-audio-tools';
 const sound=document.createElement('button');sound.type='button';sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';sound.onclick=()=>{pathSoundOn=!pathSoundOn;sound.textContent=pathSoundOn?'🔊 SOUND ON':'🔇 SOUND OFF';if(!pathSoundOn&&'speechSynthesis'in window)speechSynthesis.cancel();else pathBeep('choice')};top.appendChild(sound);
 const voice=document.createElement('button');voice.type='button';voice.textContent='🗣️ HEAR SCENE';voice.onclick=()=>pathSpeak(title+'. '+body);top.appendChild(voice);
 const film=document.createElement('button');film.type='button';film.textContent='🎬 WATCH CUTSCENE';film.onclick=()=>pathPlayCutscene(title,body,actualScene);top.appendChild(film);box.appendChild(top);
 const h=document.createElement('h4');h.textContent=title;box.appendChild(h);const p=document.createElement('p');p.className='path-cutscene-text';p.textContent=body;box.appendChild(p);
 if(choices&&choices.length){const wrap=document.createElement('div');wrap.className='path-choices';choices.forEach(item=>{const b=document.createElement('button');b.textContent=item[0];b.onclick=()=>{pathBeep('choice');pathChoose(item[1]);};wrap.appendChild(b)});box.appendChild(wrap)}
 pathRenderMap(box);
}
function pathPlayCutscene(title,body,scene){
 const box=document.getElementById('pathStory');if(!box)return;pathSceneMode='cutscene';
 const overlay=document.createElement('div');overlay.className='path-cinematic-overlay';
 overlay.innerHTML='<div class="path-cinematic-frame">'+pathArt(scene)+'<div class="cinema-bars"></div><div class="cinema-caption"><span>NOW PLAYING • STORY CINEMATIC</span><h3></h3><p></p><div class="cinema-controls"><button type="button" class="cinema-speak">🗣️ Narrate</button><button type="button" class="cinema-skip">⏭ Close cutscene</button></div></div></div>';
 overlay.querySelector('h3').textContent=title;overlay.querySelector('p').textContent=body;overlay.querySelector('.cinema-speak').onclick=()=>pathSpeak(title+'. '+body);overlay.querySelector('.cinema-skip').onclick=()=>{pathSceneMode='explore';overlay.remove()};box.appendChild(overlay);pathBeep('magic');
}
function pathRenderMap(box){
 const map=document.createElement('div');map.className='path-world-map';map.innerHTML='<h4>🗺️ NEON CITY — WORLD MAP</h4><p>Explore freely. Defeat all three dungeon mini-bosses to unlock Vex Tower.</p><div class="path-map-grid"></div><div class="path-progress"></div>';
 const grid=map.querySelector('.path-map-grid');
 ['plaza','club','studio','subway','tower'].forEach(id=>{const a=pathAreas[id],b=document.createElement('button');b.type='button';b.className='path-map-location';if(id==='tower'&&!pathAllMiniBosses())b.disabled=true;if(pathState.currentArea===id)b.classList.add('current');b.innerHTML='<span class="map-emoji">'+a.emoji+'</span><strong></strong><small></small>';b.querySelector('strong').textContent=a.name;b.querySelector('small').textContent=id==='tower'?(pathAllMiniBosses()?'UNLOCKED':'🔒 '+Object.values(pathState.miniBosses).filter(Boolean).length+'/3 MINI-BOSSES'):id==='plaza'?'SAFE HUB':pathState.miniBosses[id]?'✓ MINI-BOSS DEFEATED':'DUNGEON • EXPLORE';b.onclick=()=>pathTravel(id);grid.appendChild(b)});
 map.querySelector('.path-progress').textContent='DUNGEONS CLEARED: '+Object.values(pathState.miniBosses).filter(Boolean).length+' / 3'+(pathState.unlockedItem?' • 🎼 ECHO LYRE UNLOCKED':' • 🎼 Find the Echo Lyre in your first dungeon');box.appendChild(map);
}
function pathTravel(area){
 if(area==='tower'&&!pathAllMiniBosses()){pathRender('THE TOWER IS SEALED','Director Vex is protected by three sound locks. Defeat the Bass Beast, Sample Phantom, and Tempo Warden first.',[['🗺️ Return to Neon Plaza','plaza']],'tower');return}
 pathState.currentArea=area;
 if(area==='plaza'){pathStep='explore';pathRender('NEON PLAZA — YOUR ADVENTURE','The city is yours to explore. Choose any open dungeon. The Echo Lyre is hidden in the first dungeon you clear.',[['🎧 Enter Bassline Club Dungeon','enter-club'],['🎹 Enter Echo Lab Dungeon','enter-studio'],['🚇 Enter Static Subway Dungeon','enter-subway']],'plaza');return}
 if(area==='tower'){pathStep='boss';pathRender('VEX TOWER — FINAL DUNGEON','All three mini-bosses are defeated. The tower gates open. Director Vex waits in the Mega-Mute chamber.',[['⚔️ Enter the boss chamber','boss-enter']],'tower');return}
 const data={club:['BASSLINE CLUB DUNGEON','Navigate glowing speaker halls and face the Bass Beast.',['🥁 Challenge the Bass Beast','boss-club'],['🎼 Use the Echo Lyre','magic-club']],studio:['ECHO LAB DUNGEON','Solve the sampler puzzle and face the Sample Phantom.',['🎹 Challenge the Sample Phantom','boss-studio'],['🎼 Use the Echo Lyre','magic-studio']],subway:['STATIC SUBWAY DUNGEON','Follow sound waves through the tunnels and face the Tempo Warden.',['🚇 Challenge the Tempo Warden','boss-subway'],['🎼 Use the Echo Lyre','magic-subway']]}[area];
 const choices=[data[2]];if(pathState.unlockedItem)choices.push(data[3]);choices.push(['↩️ Return to Neon Plaza','plaza']);pathStep=area;pathRender(data[0],data[1],choices,area);
}
function pathChoose(choice){
 if(choice==='plaza'){pathTravel('plaza');return}if(choice==='enter-club'){pathTravel('club');return}if(choice==='enter-studio'){pathTravel('studio');return}if(choice==='enter-subway'){pathTravel('subway');return}
 if(choice==='boss-enter'){pathStep='boss';pathRender('FINAL BOSS: DIRECTOR VEX','Vex powers up the MEGA-MUTE machine. Use the Echo Lyre to change the arena, then choose how to finish the battle.',[['🎼 Remix the arena with the Echo Lyre','magic-final'],['🔊 Bass Drop Attack','bass'],['📣 Rally the City','crowd']],'boss');return}
 if(['boss-club','boss-studio','boss-subway'].includes(choice)){const id=choice==='boss-club'?'club':choice==='boss-studio'?'studio':'subway';const names={club:'BASS BEAST',studio:'SAMPLE PHANTOM',subway:'TEMPO WARDEN'};pathStep='mini-boss';pathRender('MINI-BOSS BATTLE: '+names[id],'The dungeon guardian attacks with a corrupted sound wave. Choose a counter-melody to break its shield.',[['🎵 Play the counter-melody','win-'+id],['🌀 Dodge and strike','win-'+id]],id);pathBeep('boss');return}
 if(choice.startsWith('win-')){const id=choice.slice(4);pathState.miniBosses[id]=true;pathStep='explore';let reward='';if(!pathState.unlockedItem){pathState.unlockedItem=true;reward=' You discover the ECHO LYRE, a magic music item! It lets you remix the environment and interact with special scene objects.';pathBeep('magic')}const remaining=3-Object.values(pathState.miniBosses).filter(Boolean).length;pathRender('MINI-BOSS DEFEATED!','The guardian dissolves into musical sparks. Dungeon cleared!'+reward+(remaining?' '+remaining+' mini-boss'+(remaining===1?' remains':'es remain')+' before Vex Tower unlocks.':' All three sound locks are broken. Vex Tower is now open.'),[['🗺️ Explore Neon Plaza','plaza'],['🔁 Explore this dungeon again',id]],id);pathBeep('win');return}
 if(choice.startsWith('magic-')){if(!pathState.unlockedItem){pathRender('THE ECHO LYRE IS STILL LOCKED','Defeat a dungeon mini-boss to find the Echo Lyre.',[['⚔️ Return to dungeon','club']]);return}pathState.itemUsed=true;pathBeep('magic');if(choice==='magic-final'){pathRender('ECHO LYRE: REALITY REMIX','You strum the Echo Lyre. The arena bends into a giant living soundboard; the Mega-Mute shield flickers, exposing Vex.',[['🔊 Finish with a Bass Drop','bass'],['📣 Rally the City','crowd']],'boss');return}const id=choice.slice(6);pathRender('MAGIC MUSIC ITEM ACTIVATED','The Echo Lyre reshapes the dungeon: hidden bridges appear, speakers open secret doors, and glowing notes reveal a new route. The mini-boss is still waiting.',[['⚔️ Face the mini-boss','boss-'+id],['🗺️ Return to Neon Plaza','plaza']],id);return}
 if(['bass','crowd'].includes(choice)){pathState.ending=choice;pathStep='ending';pathBeep('win');const ending=choice==='bass'?['ENDING: BASS BREAKER','Your Echo Lyre-powered bass drop shatters the Mega-Mute core. Music floods Neon City, and you become its legendary Bass Breaker.']:['ENDING: THE CITY SINGS','You remix the city into one unstoppable chorus. Director Vex cannot silence thousands of voices. The streets come alive with music again.'];pathRender(ending[0],ending[1],[['🏆 Play the adventure again','again']],'ending');pathSpeak(ending[0]+'. '+ending[1]);return}
 if(choice==='again')pathRestart();
}
function pathRestart(){pathStep='start';pathSceneMode='explore';pathState.unlockedItem=false;pathState.itemUsed=false;pathState.miniBosses={club:false,studio:false,subway:false};pathState.currentArea='plaza';pathState.ending=null;pathTravel('plaza');pathPlayCutscene('THE CITY LOST ITS BEAT','It is 2004. Neon City has fallen silent. Explore the open world, clear three dungeons, find the Echo Lyre, and unlock the final boss.','plaza')}
pathRestart();
