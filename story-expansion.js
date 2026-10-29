/* Neon Frequency story expansion: dialogue, side quests, branching endings, save slots. */
(function(){
'use strict';
pathState.quests=pathState.quests||{};
pathState.storyFlags=pathState.storyFlags||{};
pathState.checkpoint=pathState.checkpoint||null;
const baseRender=pathRender,baseChoose=pathChoose,baseLayout=neonWorldLayout,baseInteract=neonWorldInteract,baseSave=pathSave,baseLoad=pathLoad;
const slotKey='richie-neon-save-slots-v1';
const quests={
courier:{name:'Signal Courier',npc:'Nova',desc:'Travel to Static Subway and stabilize the relay.',reward:'Nova’s relay is stable. +15 health.'},
samples:{name:'Lost Samples',npc:'DJ Byte',desc:'Recover the lost sample by visiting Echo Lab.',reward:'DJ Byte teaches you a counter-beat. +15 health.'},
power:{name:'Power the Plaza',npc:'Pip',desc:'Find a treasure cache to restore the city grid.',reward:'The plaza lights return. +25 health.'}
};
const npcs={
plaza:{x:570,y:270,e:'🧑‍🚀',n:'Nova • City Courier',a:'npc-nova'},
club:{x:360,y:510,e:'🎧',n:'DJ Byte',a:'npc-byte'},
studio:{x:360,y:510,e:'🧑‍🔬',n:'Professor Echo',a:'npc-echo'},
subway:{x:360,y:510,e:'📡',n:'Signal Keeper',a:'npc-signal'},
tower:{x:360,y:510,e:'🧙',n:'Vex Memory Echo',a:'npc-vex'}
};
neonWorldLayout=function(area){const items=baseLayout(area).slice();if(npcs[area])items.push(npcs[area]);return items};
pathSave=function(){baseSave();try{const d=JSON.parse(localStorage.getItem(pathSaveKey)||'{}');d.quests=pathState.quests;d.storyFlags=pathState.storyFlags;d.checkpoint=pathState.checkpoint;localStorage.setItem(pathSaveKey,JSON.stringify(d))}catch(e){}};
pathLoad=function(){const ok=baseLoad();if(ok){try{const d=JSON.parse(localStorage.getItem(pathSaveKey)||'{}');pathState.quests=d.quests||{};pathState.storyFlags=d.storyFlags||{};pathState.checkpoint=d.checkpoint||null}catch(e){}}return ok};
function saveSlot(n){try{pathSave();const all=JSON.parse(localStorage.getItem(slotKey)||'{}'),d=JSON.parse(localStorage.getItem(pathSaveKey)||'{}');d.worldX=neonWorld.x;d.worldY=neonWorld.y;all[n]=d;localStorage.setItem(slotKey,JSON.stringify(all));pathBeep('win');pathSpeak('Save slot '+n+' saved.')}catch(e){pathSpeak('This device could not save the slot.')}}
function loadSlot(n){try{const all=JSON.parse(localStorage.getItem(slotKey)||'{}'),d=all[n];if(!d){pathSpeak('Save slot '+n+' is empty.');return}localStorage.setItem(pathSaveKey,JSON.stringify(d));if(pathLoad()){pathTravel(pathState.currentArea);neonWorld.x=Number.isFinite(d.worldX)?d.worldX:360;neonWorld.y=Number.isFinite(d.worldY)?d.worldY:340;neonWorldDraw();pathSpeak('Save slot '+n+' loaded.')}}catch(e){pathSpeak('Unable to load this save slot.')}}
function addQuestPanel(){
 const box=document.getElementById('pathStory');if(!box)return;
 const panel=document.createElement('section');panel.className='path-quest-panel';
 const done=Object.values(pathState.quests).filter(x=>x==='done').length;
 panel.innerHTML='<h4>📜 QUESTS & SAVE SLOTS</h4><p>Side quests complete: '+done+' / 3. Your main adventure autosaves on this device.</p><div class="path-quest-list"></div><div class="path-save-grid"><strong>💾 SAVE SLOTS</strong><div class="path-slot-buttons"></div></div><button type="button" class="path-checkpoint">📍 Set checkpoint here</button>';
 const list=panel.querySelector('.path-quest-list');
 Object.entries(quests).forEach(([id,q])=>{const state=pathState.quests[id]||'available',row=document.createElement('div');row.className='path-quest-row';const label=document.createElement('span');label.textContent=q.name+' — '+state.toUpperCase();row.appendChild(label);const b=document.createElement('button');b.textContent=state==='available'?'Accept':state==='active'?'Track':'✓ Done';b.disabled=state==='done';b.onclick=()=>pathChoose((state==='available'?'quest-accept-':'quest-track-')+id);row.appendChild(b);list.appendChild(row)});
 const grid=panel.querySelector('.path-slot-buttons');for(let n=1;n<=3;n++){const a=document.createElement('button');a.textContent='Save '+n;a.onclick=()=>saveSlot(n);grid.appendChild(a);const b=document.createElement('button');b.textContent='Load '+n;b.onclick=()=>loadSlot(n);grid.appendChild(b)}
 panel.querySelector('.path-checkpoint').onclick=()=>{pathState.checkpoint={area:pathState.currentArea,x:neonWorld.x,y:neonWorld.y};pathSave();panel.querySelector('p').textContent='Checkpoint set in '+pathState.currentArea.toUpperCase()+'.';pathSpeak('Checkpoint saved.')}
 box.appendChild(panel);
}
pathRender=function(title,body,choices,scene){baseRender(title,body,choices,scene);addQuestPanel()};
function npcTalk(id){const lines={
'npc-nova':['NOVA: The city relays are dying. Can you carry a signal to the subway?','courier'],
'npc-byte':['DJ BYTE: My rare sample is lost in the Echo Lab. Bring it back and I’ll teach you a counter-beat.','samples'],
'npc-echo':['PROFESSOR ECHO: The lost sample contains a weakness in Vex’s shield. Find it in my lab.','samples'],
'npc-signal':['SIGNAL KEEPER: Restore the plaza grid by finding a power cache.','power'],
'npc-vex':['VEX MEMORY: I silenced the city because every song reminded me of what I lost. Will you hear my story?','listen']};
const entry=lines[id];if(!entry)return;
if(entry[1]==='listen'){pathRender('VEX’S MEMORY','Beneath the armor is a musician who lost someone dear. You can answer with compassion or return to battle.',[['💙 Listen and forgive','ending-listen'],['⚡ Overload the core','ending-rush'],['↩️ Leave the memory',pathState.currentArea]],pathState.currentArea);pathSpeak(entry[0]);return}
pathRender('CHARACTER TRANSMISSION',entry[0],[['🤝 Accept '+quests[entry[1]].name,'quest-accept-'+entry[1]],['💬 Ask for more details','dialogue-more'],['↩️ Continue exploring',pathState.currentArea]],pathState.currentArea);pathSpeak(entry[0])}
neonWorldInteract=function(){const area=pathState.currentArea||'plaza',objs=neonWorldLayout(area),o=objs.slice().sort((a,b)=>Math.hypot(a.x-neonWorld.x,a.y-neonWorld.y)-Math.hypot(b.x-neonWorld.x,b.y-neonWorld.y))[0];if(o&&o.a&&o.a.startsWith('npc-')&&Math.hypot(o.x-neonWorld.x,o.y-neonWorld.y)<95){pathBeep('choice');npcTalk(o.a);return}baseInteract()};
pathChoose=function(choice){
 if(choice.startsWith('npc-')){npcTalk(choice);return}
 if(choice==='dialogue-more'){pathRender('A MEMORY IN THE STATIC','The transmission crackles: “The Mega-Mute feeds on fear and unfinished songs. The city can still choose what its music means.”',[['💙 Promise to listen','ending-listen'],['⚔️ Prepare for battle','boss-enter'],['↩️ Leave transmission',pathState.currentArea]],pathState.currentArea);pathSpeak('The transmission reveals a clue about Vex.');return}
 if(choice.startsWith('quest-accept-')){const id=choice.slice(13);if(!quests[id])return;pathState.quests[id]='active';pathSave();pathRender('MISSION ACCEPTED: '+quests[id].name,quests[id].desc,[['🧭 Track mission','quest-track-'+id],['↩️ Explore','plaza']],pathState.currentArea);pathSpeak('Mission accepted: '+quests[id].name);return}
 if(choice.startsWith('quest-track-')){const id=choice.slice(12),q=quests[id];if(!q)return;const done=id==='courier'?pathState.currentArea==='subway':id==='samples'?pathState.currentArea==='studio':Object.values(pathState.treasures||{}).some(Boolean);if(pathState.quests[id]==='active'&&done){pathState.quests[id]='done';pathState.storyFlags[id]=true;pathState.health=Math.min(100,pathState.health+(id==='power'?25:15));pathSave();pathRender('SIDE QUEST COMPLETE: '+q.name,q.reward,[['🎵 Continue exploring',pathState.currentArea],['🗺️ Return to plaza','plaza']],pathState.currentArea);pathBeep('win')}else pathRender('MISSION: '+q.name,q.desc+' Objective: '+(id==='courier'?'travel to Static Subway.':id==='samples'?'visit Echo Lab.':'open any treasure cache.'),[['🧭 Go to objective',id==='courier'?'enter-subway':id==='samples'?'enter-studio':'plaza'],['↩️ Keep exploring',pathState.currentArea]],pathState.currentArea);return}
 if(choice==='ending-listen'){pathState.ending='listen';pathState.storyFlags.vexSpared=true;pathSave();pathRender('ENDING: THE FREQUENCY OF FORGIVENESS','You hear the grief beneath Vex’s silence. Instead of destroying the Mega-Mute, you remix its core into a song of shared memories. Vex stands down, and Neon City begins to heal.',[['🏆 Hear ending narration','ending-listen'],['↻ Start a new adventure','again']],'ending');pathSpeak('Ending: The Frequency of Forgiveness. You turn silence into a song of shared memories.');return}
 if(choice==='ending-repair'){pathState.ending='repair';pathSave();pathRender('ENDING: A CITY REBUILT','You restore the music grid with the Echo Lyre and the recovered signals. Every district contributes a new beat, and Neon City becomes a living symphony.',[['🏆 Hear ending narration','ending-repair'],['↻ Start a new adventure','again']],'ending');pathSpeak('Ending: A City Rebuilt.');return}
 if(choice==='ending-rush'){pathState.ending='rush';pathSave();pathRender('ENDING: SILENCE BREAKER','You overload the Mega-Mute and shatter its core. Music returns to the city, but some of its lost memories vanish with the machine.',[['🏆 Hear ending narration','ending-rush'],['↻ Start a new adventure','again']],'ending');pathSpeak('Ending: Silence Breaker.');return}
 baseChoose(choice);
 if(choice==='boss-enter'){const wrap=document.querySelector('#pathStory .path-choices');if(wrap){[['💙 Hear Vex’s story','ending-listen'],['🛠️ Rebuild the music grid','ending-repair'],['⚡ Overload the core','ending-rush']].forEach(([label,id])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>pathChoose(id);wrap.appendChild(b)})}}
};
})();
