// Global State for Authentication
let isLoggedIn = false;
// Simple in-memory user database
const registeredUsers = [
    { email: 'user@example.com', password: 'password123', name: 'Demo User' }
];

// SPLASH
const splash = document.getElementById('splash');
document.getElementById('splash-start').addEventListener('click', () => splash.style.display='none');
document.getElementById('splash-dismiss').addEventListener('click', () => splash.style.display='none');

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const navActions = document.querySelector('.nav-actions');
const heroCta = document.getElementById('hero-cta');

// --- ACCESS CONTROL FUNCTIONS ---
function updateNavUI() {
    const loginBtn = document.getElementById('open-login');
    const signupBtn = document.getElementById('open-signup');

    if (isLoggedIn) {
        // Logged In: Show a welcome message or Log Out button
        navActions.innerHTML = `<span class="btn btn-ghost" style="border:none; color: #fff;">Hello, ${isLoggedIn.name}!</span><button class="btn btn-ghost" id="logout-btn">Log Out</button>`;
        document.getElementById('logout-btn').addEventListener('click', () => {
            isLoggedIn = false;
            updateNavUI();
            showPage('dashboard');
        });
        
    } else {
        // Logged Out: Show Login/Signup buttons
        navActions.innerHTML = '';
        navActions.appendChild(loginBtn);
        navActions.appendChild(signupBtn);
        // Re-attach event listeners since buttons were re-added
        document.getElementById('open-login').addEventListener('click', openLoginModal);
        document.getElementById('open-signup').addEventListener('click', openSignupModal);
    }

    // Update CTA text/link
    if (heroCta) {
        heroCta.textContent = isLoggedIn ? "Start Mixing Now →" : "Sign Up to Start Mixing →";
    }
}

function showLockedPage(pageId) {
    const pageElement = document.getElementById(pageId);
    pageElement.innerHTML = `
        <div class="locked">
            <h1>🔒 Access Denied</h1>
            <p class="lead">You must be logged in to view the **${pageId.toUpperCase()}** studio features.</p>
            <button class="btn btn-primary" id="locked-login-btn">Log In</button>
            <button class="btn btn-ghost" id="locked-signup-btn">Sign Up</button>
        </div>
    `;
    document.getElementById('locked-login-btn').addEventListener('click', openLoginModal);
    document.getElementById('locked-signup-btn').addEventListener('click', openSignupModal);
    // Remove the temporary locked content when navigating away
    pageElement.addEventListener('transitionend', () => {
        if (!pageElement.classList.contains('active')) {
            // Restore original content when page is hidden (this is complex in a real SPA, 
            // but for this demo, we'll just re-navigate to the correct place)
            // A better solution would be to use a template engine.
            
            // For simplicity, we just won't render locked content on hidden pages.
        }
    });
}

function showPage(pageId) {
    // 1. Check access for restricted pages
    if ((pageId === 'audio' || pageId === 'images') && !isLoggedIn) {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        showLockedPage(pageId); // Show the locked state
        return; 
    }
    
    // 2. Clear current active page and set new one
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // 3. Update navigation active link
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// --- NAVIGATION EVENTS ---
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = e.target.dataset.page;
        showPage(page);
    });
});

document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', () => {
    showPage('dashboard');
}));

if (heroCta) {
    heroCta.addEventListener('click', () => {
        if (isLoggedIn) {
            showPage('audio');
        } else {
            openSignupModal();
        }
    });
}


// --- MODAL & AUTHENTICATION HANDLERS ---
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function closeModal() {
    modalBackdrop.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
    if(e.target === modalBackdrop) closeModal();
});


function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const authStatus = document.getElementById('auth-status');

    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (user) {
        isLoggedIn = user;
        authStatus.innerHTML = '<span style="color:#33FF33;">✅ Log in successful! Redirecting...</span>';
        setTimeout(() => {
            closeModal();
            updateNavUI();
            showPage('dashboard');
            // Re-render audio/images pages if they were showing the locked state
            if (document.getElementById('audio').classList.contains('active')) showPage('audio');
            if (document.getElementById('images').classList.contains('active')) showPage('images');
        }, 1500);
    } else {
        authStatus.innerHTML = '<span style="color:#E63946;">❌ Invalid email or password.</span>';
    }
}

function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const authStatus = document.getElementById('auth-status');

    if (registeredUsers.find(u => u.email === email)) {
        authStatus.innerHTML = '<span style="color:#E63946;">❌ Email already registered. Please log in.</span>';
        return;
    }

    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    isLoggedIn = newUser; // Log in immediately after successful signup

    authStatus.innerHTML = '<span style="color:#33FF33;">🎉 Signup successful! Welcome!</span>';
    setTimeout(() => {
        closeModal();
        updateNavUI();
        showPage('dashboard');
    }, 1500);
}


function openLoginModal() {
    modalContent.innerHTML = `
        <h2 id="modal-title">Log In</h2>
        <form class="modal-form" id="login-form">
          <label>Email
            <input type="email" name="email" placeholder="you@example.com" required>
          </label>
          <label>Password
            <input type="password" name="password" placeholder="Enter password" required>
          </label>
          <div class="form-actions">
            <div id="auth-status"></div>
            <button type="submit" class="btn btn-primary">Log In</button>
          </div>
        </form>
    `;
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    modalBackdrop.classList.add('active');
}

function openSignupModal() {
    modalContent.innerHTML = `
        <h2 id="modal-title">Sign Up</h2>
        <form class="modal-form" id="signup-form">
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
            <div id="auth-status"></div>
            <button type="submit" class="btn btn-primary">Sign Up</button>
          </div>
        </form>
    `;
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    modalBackdrop.classList.add('active');
}

document.getElementById('open-login').addEventListener('click', openLoginModal);
document.getElementById('open-signup').addEventListener('click', openSignupModal);


// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
});

// CONTACT FORM (Demo) - unchanged
document.getElementById('contact-form').addEventListener('submit', async (e) => {
// ... (original contact form code) ...
});

// AUDIO RECORDER, SAMPLE SOUNDS - (Your original audio/sound code here, slightly modified for the new button classes)
// ... (Your original audio/sound code here, unchanged) ...
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