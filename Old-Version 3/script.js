// SPLASH
const splash = document.getElementById('splash');
document.getElementById('splash-start').addEventListener('click', () => splash.style.display='none');
document.getElementById('splash-dismiss').addEventListener('click', () => splash.style.display='none');

// NAVIGATION
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = e.target.dataset.page;
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    navLinks.forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
  });
});
document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', () => {
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('dashboard').classList.add('active');
  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector('[data-page="dashboard"]').classList.add('active');
}));

// CONTACT FORM (Demo)
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  document.getElementById('contact-status').innerText = "Message sent! (Demo)";
  e.target.reset();
});

// AUDIO RECORDER
let mediaRecorder, audioChunks = [], audioBlob;
const recBtn = document.getElementById('rec-btn');
const stopBtn = document.getElementById('stop-btn');
const playbackBtn = document.getElementById('playback-btn');
const exportBtn = document.getElementById('export-btn');
const timerDisplay = document.getElementById('rec-timer');
let seconds = 0, timerInterval;

recBtn.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();
  timerInterval = setInterval(() => {
    seconds++;
    let m = String(Math.floor(seconds/60)).padStart(2,'0');
    let s = String(seconds%60).padStart(2,'0');
    timerDisplay.textContent = `${m}:${s}`;
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  };
  clearInterval(timerInterval);
  seconds = 0;
  timerDisplay.textContent = "00:00";
});

playbackBtn.addEventListener('click', () => {
  if (!audioBlob) return;
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
});

exportBtn.addEventListener('click', () => {
  if (!audioBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(audioBlob);
  a.download = 'recording.webm';
  a.click();
});

// SAMPLE SOUNDS
document.querySelectorAll('.play-sample').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.sample;
    const audioCtx = new AudioContext();
    if(type==='sine'||type==='square'){
      const osc = audioCtx.createOscillator();
      osc.type = type;
      osc.frequency.value = type==='sine'?440:200;
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime+1);
    } else if(type==='noise'){
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
      const noise = audioCtx.createBufferSource();
      noise.buffer=buffer;
      noise.connect(audioCtx.destination);
      noise.start();
    }
  });
});
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

document.getElementById('open-login').addEventListener('click', () => {
  modalContent.innerHTML = `
    <h2 id="modal-title">Log In</h2>
    <form class="modal-form">
      <label>Email
        <input type="email" name="email" placeholder="you@example.com" required>
      </label>
      <label>Password
        <input type="password" name="password" placeholder="Enter password" required>
      </label>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Log In</button>
      </div>
    </form>
  `;
  modalBackdrop.classList.add('active');
});

document.getElementById('open-signup').addEventListener('click', () => {
  modalContent.innerHTML = `
    <h2 id="modal-title">Sign Up</h2>
    <form class="modal-form">
      <label>Name
        <input type="text" name="name" placeholder="Your Name" required>
      </label>
      <label>Email
        <input type="email" name="email" placeholder="you@example.com" required>
      </label>
      <label>Password
        <input type="password" name="password" placeholder="Enter password" required>
      </label>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Sign Up</button>
      </div>
    </form>
  `;
  modalBackdrop.classList.add('active');
});

// Close modal
modalClose.addEventListener('click', () => modalBackdrop.classList.remove('active'));
modalBackdrop.addEventListener('click', (e) => {
  if(e.target === modalBackdrop) modalBackdrop.classList.remove('active');
});

// Optional: prevent form submission (demo)
modalBackdrop.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Form submitted! (Demo)");
  modalBackdrop.classList.remove('active');
});
