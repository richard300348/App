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