/* ---------- Simple SPA routing & interactions ---------- */
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');
const backButtons = document.querySelectorAll('[data-back]');
const splash = document.getElementById('splash');
const splashStart = document.getElementById('splash-start');
const splashDismiss = document.getElementById('splash-dismiss');
const themeToggle = document.getElementById('theme-toggle');

function showPage(name, push=true){
  pages.forEach(p => {
    if(p.id === name){
      p.classList.add('active');
      p.setAttribute('aria-hidden','false');
    } else {
      p.classList.remove('active');
      p.setAttribute('aria-hidden','true');
    }
  });
  // push history for back button
  if(push) history.pushState({page:name}, '', `#${name}`);
  window.scrollTo({top:0,behavior:'smooth'});
}

/* nav clicks using data-page */
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-page]');
  if(target){
    e.preventDefault();
    const page = target.getAttribute('data-page');
    if(page) showPage(page);
  }
});

/* back buttons */
backButtons.forEach(b => {
  b.addEventListener('click', ()=> history.back());
});
window.addEventListener('popstate', (e) => {
  const page = (location.hash && location.hash.replace('#','')) || 'dashboard';
  showPage(page, false);
});

/* default */
showPage((location.hash && location.hash.replace('#','')) || 'dashboard', false);

/* splash behavior */
if(!localStorage.getItem('splashSeen')){
  splash.style.display = 'flex';
} else {
  splash.style.display = 'none';
}
splashStart.addEventListener('click', () => { splash.style.display='none'; localStorage.setItem('splashSeen','1'); });
splashDismiss.addEventListener('click', ()=> { splash.style.display='none'; localStorage.setItem('splashSeen','1'); });

/* theme toggle */
function applyTheme(){
  const t = localStorage.getItem('sc_theme') || 'dark';
  if(t === 'light') document.documentElement.classList.add('light'); else document.documentElement.classList.remove('light');
}
themeToggle.addEventListener('click', ()=> {
  const cur = localStorage.getItem('sc_theme') || 'dark';
  localStorage.setItem('sc_theme', cur === 'dark' ? 'light' : 'dark');
  applyTheme();
});
applyTheme();

/* ---------- Modal (login/signup) ---------- */
const backdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
document.getElementById('open-login').addEventListener('click', ()=> openModal('login'));
document.getElementById('open-signup').addEventListener('click', ()=> openModal('signup'));
document.getElementById('modal-close').addEventListener('click', closeModal);
backdrop.addEventListener('click', (e)=> { if(e.target === backdrop) closeModal(); });

function openModal(type){
  backdrop.style.display = 'flex';
  if(type === 'login'){
    modalContent.innerHTML = `
      <h2 id="modal-title">Log in</h2>
      <div class="form-row"><label>Email<input id="login-email" type="email" required placeholder="you@example.com"></label></div>
      <div class="form-row"><label>Password<input id="login-pass" type="password" required placeholder="••••••"></label></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">Sign in</button>
      </div>`;
  } else {
    modalContent.innerHTML = `
      <h2 id="modal-title">Sign up</h2>
      <div class="form-row"><label>Full name<input id="signup-name" type="text" required placeholder="Jane Doe"></label></div>
      <div class="form-row"><label>Email<input id="signup-email" type="email" required placeholder="you@example.com"></label></div>
      <div class="form-row"><label>Password<input id="signup-pass" type="password" required placeholder="Choose a password"></label></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">Create</button>
      </div>`;
  }
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-submit').addEventListener('click', ()=> { alert('Demo only — no backend.'); closeModal(); });
}
function closeModal(){ backdrop.style.display='none'; modalContent.innerHTML=''; }

/* ---------- Contact form ---------- */
document.getElementById('contact-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  document.getElementById('contact-status').textContent = 'Thank you — message simulated (demo).';
  e.target.reset();
});

/* ---------- Sound sample generator (WebAudio) ---------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playGenerated(type, duration = 1.2){
  const now = audioCtx.currentTime;
  if(type === 'sine'){
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.22, now+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now+duration);
    osc.connect(gain).connect(audioCtx.destination); osc.start(now); osc.stop(now+duration+0.05);
  } else if(type === 'square'){
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.25, now+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now+duration);
    osc.connect(gain).connect(audioCtx.destination); osc.start(now); osc.stop(now+duration+0.05);
  } else if(type === 'noise'){
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2 - 1) * Math.exp(-i/(bufferSize/3));
    const src = audioCtx.createBufferSource(); src.buffer = buffer;
    const gain = audioCtx.createGain(); gain.gain.value = 0.5; src.connect(gain).connect(audioCtx.destination); src.start();
  }
}
document.querySelectorAll('.play-sample').forEach(btn => {
  btn.addEventListener('click', ()=>{
    if(audioCtx.state === 'suspended') audioCtx.resume();
    playGenerated(btn.dataset.sample);
  });
});
document.getElementById('play-first-clip').addEventListener('click', ()=>{
  const firstAudio = document.querySelector('.clips audio');
  if(firstAudio) firstAudio.play(); else alert('No clips recorded yet. Record on Audio page.');
});

/* ---------- Audio Recorder & waveform + timeline ---------- */
let mediaStream = null, mediaRecorder = null, recordedChunks = [];
const recBtn = document.getElementById('rec-btn'), stopBtn = document.getElementById('stop-btn'),
      playbackBtn = document.getElementById('playback-btn'), exportBtn = document.getElementById('export-btn'),
      recTimer = document.getElementById('rec-timer'), clipsEl = document.getElementById('clips'),
      waveCanvas = document.getElementById('rec-wave'), waveCtx = waveCanvas.getContext('2d');

let analyser = null, sourceNode = null, recInterval = null, recSeconds = 0;

function updateTimer(){ const mm = String(Math.floor(recSeconds/60)).padStart(2,'0'); const ss = String(recSeconds%60).padStart(2,'0'); recTimer.textContent=`${mm}:${ss}`; }

async function startRecording(){
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio:true });
  } catch(e){ alert('Microphone access denied or not available.'); return; }
  if(audioCtx.state === 'suspended') await audioCtx.resume();
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
  recordedChunks = [];
  mediaRecorder.ondataavailable = e => { if(e.data.size) recordedChunks.push(e.data); };
  mediaRecorder.onstop = onRecorderStop;
  mediaRecorder.start();
  analyser = audioCtx.createAnalyser(); analyser.fftSize = 2048;
  sourceNode = audioCtx.createMediaStreamSource(mediaStream);
  sourceNode.connect(analyser);
  recSeconds = 0; updateTimer();
  recInterval = setInterval(()=> { recSeconds++; updateTimer(); drawWaveform(); }, 250);
  recBtn.textContent = '● Recording...'; recBtn.classList.add('recording');
}
function stopRecording(){
  if(mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; }
  if(recInterval){ clearInterval(recInterval); recInterval=null; }
  recBtn.textContent = '● Record'; recBtn.classList.remove('recording');
  recTimer.textContent = '00:00';
}
function onRecorderStop(){ const blob = new Blob(recordedChunks, { type: recordedChunks[0].type }); addClip(blob); }

function addClip(blob){
  const url = URL.createObjectURL(blob);
  const name = `clip-${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;
  const li = document.createElement('li');
  li.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><strong>${name}</strong><audio controls src="${url}"></audio></div>
                  <div style="display:flex;gap:8px"><button class="btn btn-sm download">Download</button><button class="btn btn-sm remove">Remove</button></div>`;
  clipsEl.prepend(li);
  li.querySelector('.download').addEventListener('click', ()=> { const a=document.createElement('a'); a.href=url; a.download=name; a.click(); });
  li.querySelector('.remove').addEventListener('click', ()=> { URL.revokeObjectURL(url); li.remove(); });
}

function drawWaveform(){
  if(!analyser) return;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
  waveCtx.fillStyle = '#031425';
  waveCtx.fillRect(0,0,waveCanvas.width,waveCanvas.height);
  waveCtx.lineWidth = 2; waveCtx.strokeStyle = '#ff9b4a';
  waveCtx.beginPath();
  const slice = waveCanvas.width / bufferLength;
  let x=0;
  for(let i=0;i<bufferLength;i++){
    const v = dataArray[i]/128.0; const y = v * waveCanvas.height/2;
    if(i===0) waveCtx.moveTo(x,y); else waveCtx.lineTo(x,y);
    x += slice;
  }
  waveCtx.lineTo(waveCanvas.width, waveCanvas.height/2); waveCtx.stroke();
}

/* button wiring */
recBtn.addEventListener('click', ()=> { if(mediaRecorder && mediaRecorder.state==='recording') stopRecording(); else startRecording(); });
stopBtn.addEventListener('click', ()=> stopRecording());
playbackBtn.addEventListener('click', ()=> { const firstAudio = document.querySelector('.clips audio'); if(firstAudio) firstAudio.play(); else alert('No clip to play'); });

exportBtn.addEventListener('click', ()=>{
  if(recordedChunks.length>0){
    const blob = new Blob(recordedChunks, { type: recordedChunks[0].type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='recording.webm'; a.click(); URL.revokeObjectURL(url); return;
  }
  // fallback silent WAV demo
  const sampleRate=44100,duration=1,numSamples=sampleRate*duration;
  const buffer=new ArrayBuffer(44+numSamples*2), view=new DataView(buffer);
  function wstr(v,o){ for(let i=0;i<v.length;i++) view.setUint8(o+i,v.charCodeAt(i)); }
  wstr('RIFF',0); view.setUint32(4,36+numSamples*2,true); wstr('WAVE',8); wstr('fmt ',12); view.setUint32(16,16,true);
  view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,sampleRate,true); view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true); view.setUint16(34,16,true); wstr('data',36); view.setUint32(40,numSamples*2,true);
  let off=44; for(let i=0;i<numSamples;i++){ view.setInt16(off,0,true); off+=2; }
  const blob = new Blob([view],{type:'audio/wav'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='silent-demo.wav'; a.click(); URL.revokeObjectURL(url);
});

/* Keyboard shortcuts */
window.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){ e.preventDefault(); const firstAudio=document.querySelector('.clips audio'); if(firstAudio){ if(firstAudio.paused) firstAudio.play(); else firstAudio.pause(); } }
  else if(e.key.toLowerCase()==='r') recBtn.click();
  else if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='e'){ e.preventDefault(); exportBtn.click(); }
});
const themeSwitch = document.getElementById("theme-switch"); // Add a button in navbar

themeSwitch.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});
