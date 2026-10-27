/* Offline media library: stores user-selected audio/video in IndexedDB for later offline playback. */
(() => {
  const DB_NAME = 'richie-hub-media';
  const STORE = 'files';
  let db;
  const openDB = () => new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onerror = () => reject(request.error);
  });
  const allFiles = async () => {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const request = d.transaction(STORE).objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  };
  const saveFiles = async files => {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, 'readwrite');
      files.forEach(file => tx.objectStore(STORE).add({ name: file.name, type: file.type, blob: file, savedAt: Date.now() }));
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  };
  const removeFile = async id => {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  };
  const style = document.createElement('style');
  style.textContent = `
    .offline-library{margin:18px 0;padding:16px;border:2px solid #0754d6;border-radius:14px;background:rgba(7,84,214,.08)}
    .offline-library h3{margin-top:0}.offline-library p{line-height:1.45}
    .offline-library input{max-width:100%;margin:8px 0}
    .saved-media-list{display:grid;gap:8px;margin-top:12px}
    .saved-media-item{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px;border-radius:9px;background:rgba(127,127,127,.12)}
    .saved-media-item .media-name{flex:1;min-width:120px;overflow-wrap:anywhere}
    .saved-media-item button,.offline-library button{cursor:pointer}
    .saved-media-item audio,.saved-media-item video{width:100%;max-width:560px}
    .offline-help{font-size:.92em;opacity:.85}
  `;
  document.head.appendChild(style);

  function addLibrary(sectionId, kind) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const box = document.createElement('div');
    box.className = 'offline-library';
    box.innerHTML = '<h3>' + (kind === 'audio' ? '🎧 Offline Jukebox' : '📼 Offline Video Shelf') + '</h3>' +
      '<p>Choose files on this device to save them inside Richie Hub. Saved files stay available after you close the app and can play without internet, as long as browser storage is retained.</p>' +
      '<label>Select ' + (kind === 'audio' ? 'audio' : 'video') + ' files<br><input type="file" accept="' + (kind === 'audio' ? 'audio/*' : 'video/*') + '" multiple></label> ' +
      '<button type="button" class="save-media">SAVE FOR OFFLINE</button>' +
      '<p class="offline-help">Use music and videos you own or have permission to store. Storage limits depend on your device and browser.</p>' +
      '<div class="saved-media-list" aria-live="polite"></div>';
    section.appendChild(box);
    const input = box.querySelector('input');
    const list = box.querySelector('.saved-media-list');
    const objectUrls = [];
    box.querySelector('.save-media').addEventListener('click', async () => {
      const files = Array.from(input.files || []);
      if (!files.length) { alert('Choose one or more files first.'); return; }
      try {
        await saveFiles(files);
        input.value = '';
        await render();
        alert('Saved for offline playback on this device.');
      } catch (error) {
        console.error(error);
        alert('Could not save these files. Your device may be low on storage.');
      }
    });
    async function render() {
      objectUrls.forEach(URL.revokeObjectURL);
      objectUrls = [];
      list.replaceChildren();
      try {
        const files = (await allFiles()).filter(f => kind === 'audio' ? f.type.startsWith('audio/') : f.type.startsWith('video/'));
        if (!files.length) {
          const empty = document.createElement('p');
          empty.textContent = 'No saved ' + (kind === 'audio' ? 'tracks' : 'videos') + ' yet.';
          list.appendChild(empty);
          return;
        }
        files.forEach(file => {
          const item = document.createElement('div');
          item.className = 'saved-media-item';
          const name = document.createElement('strong');
          name.className = 'media-name';
          name.textContent = file.name;
          const url = URL.createObjectURL(file.blob);
          objectUrls.push(url);
          const player = document.createElement(kind === 'audio' ? 'audio' : 'video');
          player.controls = true;
          player.preload = 'metadata';
          player.src = url;
          if (kind === 'video') player.playsInline = true;
          const del = document.createElement('button');
          del.type = 'button';
          del.textContent = 'Remove';
          del.addEventListener('click', async () => { await removeFile(file.id); await render(); });
          item.append(name, player, del);
          list.appendChild(item);
        });
      } catch (error) {
        console.error(error);
        list.textContent = 'Offline library storage is unavailable in this browser.';
      }
    }
    render();
  }
  function keyboardControls() {
    window.addEventListener('keydown', event => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
      if (document.getElementById('games')?.classList.contains('active')) {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); if (typeof platformMove === 'function') platformMove(-1); }
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); if (typeof platformMove === 'function') platformMove(1); }
        if (event.key === 'ArrowUp' || event.key === ' ') { event.preventDefault(); if (typeof platformJump === 'function') platformJump(); }
      }
    });
  }
  window.addEventListener('DOMContentLoaded', () => {
    addLibrary('music', 'audio');
    addLibrary('videos', 'video');
    keyboardControls();
    if ('storage' in navigator && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  });
})();