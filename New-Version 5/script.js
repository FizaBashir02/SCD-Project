// Global State for Authentication
let isLoggedIn = false;
// Simple in-memory user database (Added a default user for testing)
const registeredUsers = [
    { email: 'test@user.com', password: 'password', name: 'Test' }
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
    
    if (isLoggedIn) {
        // Logged In: Show a welcome message and Log Out button
        navActions.innerHTML = `<span class="btn btn-ghost" style="border:none; color: #fff;">Hello, ${isLoggedIn.name}!</span><button class="btn btn-ghost" id="logout-btn">Log Out</button>`;
        document.getElementById('logout-btn').addEventListener('click', () => {
            isLoggedIn = false;
            updateNavUI();
            showPage('dashboard');
        });
        
    } else {
        // Logged Out: Restore Login/Signup buttons
        navActions.innerHTML = '';
        const newLogin = document.createElement('button');
        newLogin.className = 'btn btn-ghost';
        newLogin.id = 'open-login';
        newLogin.textContent = 'Log in';
        newLogin.addEventListener('click', openLoginModal);
        
        const newSignup = document.createElement('button');
        newSignup.className = 'btn btn-primary';
        newSignup.id = 'open-signup';
        newSignup.textContent = 'Sign up';
        newSignup.addEventListener('click', openSignupModal);

        navActions.appendChild(newLogin);
        navActions.appendChild(newSignup);
    }

    // Update CTA text/link
    if (heroCta) {
        heroCta.textContent = isLoggedIn ? "Start Mixing Now →" : "Sign Up to Start Mixing →";
    }
}

// Function to render the "locked" message on restricted pages
function showLockedPage(pageId) {
    const pageElement = document.getElementById(pageId);
    // Before showing locked page, save the original content temporarily
    if (!pageElement.dataset.originalContent) {
        pageElement.dataset.originalContent = pageElement.innerHTML; 
    }

    pageElement.innerHTML = `
        <div class="locked">
            <h1>🔒 Access Denied</h1>
            <p class="lead">You must be logged in to view the **${pageId.toUpperCase()}** studio features.</p>
            <button class="btn btn-primary" id="locked-login-btn">Log In</button>
            <button class="btn btn-ghost" id="locked-signup-btn">Sign Up</button>
        </div>
    `;
    // Re-attach listeners for the new buttons in the locked screen
    document.getElementById('locked-login-btn').addEventListener('click', openLoginModal);
    document.getElementById('locked-signup-btn').addEventListener('click', openSignupModal);
}

// Function to restore original content if needed
function restoreOriginalContent(pageId) {
    const pageElement = document.getElementById(pageId);
    if (pageElement.dataset.originalContent) {
        pageElement.innerHTML = pageElement.dataset.originalContent;
        // Clear the saved content once restored (optional, but good practice)
        delete pageElement.dataset.originalContent;
    }
}

function showPage(pageId) {
    // 1. Check access for restricted pages (audio and images)
    if ((pageId === 'audio' || pageId === 'images')) {
        if (!isLoggedIn) {
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            showLockedPage(pageId); // Show the locked state
        } else {
            // IF LOGGED IN: Ensure original content is restored
            restoreOriginalContent(pageId);
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        }
    } else {
        // For unrestricted pages (dashboard, sound, contact)
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }
    
    // 2. Update navigation active link
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
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

// --- NEW PASSWORD VALIDATION FUNCTION ---
function validatePassword(password) {
    // Regex for strong password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}


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
            
            // Check if the user was on a locked page before login attempt
            const currentlyActivePageId = document.querySelector('.page.active').id;
            if (currentlyActivePageId === 'audio' || currentlyActivePageId === 'images') {
                showPage(currentlyActivePageId); // Shows the original content of the previously locked page
            } else {
                showPage('dashboard');
            }

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

    // 1. Duplicate Email Check
    if (registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        authStatus.innerHTML = '<span style="color:#E63946;">❌ Email already registered. Please log in instead.</span>';
        return;
    }

    // 2. Strong Password Validation Check
    if (!validatePassword(password)) {
        authStatus.innerHTML = `
            <span style="color:#FFC300;">⚠️ Weak Password!</span>
            <ul style="color:#FFC300; text-align:left; margin-top:5px; padding-left:20px;">
                <li>Min 8 characters</li>
                <li>At least one capital (A-Z)</li>
                <li>At least one lowercase (a-z)</li>
                <li>At least one number (0-9)</li>
                <li>At least one special character (!@#$...)</li>
            </ul>
        `;
        return;
    }

    // If both checks pass: Register user
    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    isLoggedIn = newUser; // Log in immediately after successful signup

    authStatus.innerHTML = '<span style="color:#33FF33;">🎉 Signup successful! Welcome!</span>';
    setTimeout(() => {
        closeModal();
        updateNavUI();
        
        // Check if the user was on a locked page before signup attempt
        const currentlyActivePageId = document.querySelector('.page.active').id;
        if (currentlyActivePageId === 'audio' || currentlyActivePageId === 'images') {
            showPage(currentlyActivePageId); // Shows the original content of the previously locked page
        } else {
            showPage('dashboard');
        }
        
    }, 1500);
}


function openLoginModal() {
    modalContent.innerHTML = `
        <h2 id="modal-title">Log In</h2>
        <form class="modal-form" id="login-form">
          <label>Email
            <input type="email" name="email" placeholder="you@example.com" value="test@user.com" required>
          </label>
          <label>Password
            <input type="password" name="password" placeholder="Enter password" value="password" required>
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

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateNavUI();
});

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

if(recBtn) {
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
}

if(stopBtn) {
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
}

if(playbackBtn) {
    playbackBtn.addEventListener('click', () => {
      if (!audioBlob) return;
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    });
}

if(exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!audioBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(audioBlob);
      a.download = 'recording.webm';
      a.click();
    });
}


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