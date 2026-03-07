// ===== AUTH =====
function showAuthModal(mode) {
  var m = document.getElementById('authModal');
  var c = document.getElementById('authContent');
  m.style.display = 'block';
  var isSignUp = mode === 'signup';
  c.innerHTML = '<div style="text-align:center;margin-bottom:24px">' +
    '<div style="font-size:40px;margin-bottom:8px">&#10013;&#65039;</div>' +
    '<h2 style="font-size:22px;font-weight:700;color:var(--navy)">' + (isSignUp ? 'Create Account' : 'Welcome Back') + '</h2>' +
    '<p style="font-size:13px;color:var(--text-light);margin-top:4px">' + (isSignUp ? 'Join the PRAYED community' : 'Sign in to sync your prayer life') + '</p></div>' +
    '<input id="authEmail" type="email" placeholder="Email address" class="onb-input">' +
    '<input id="authPass" type="password" placeholder="Password" class="onb-input"' + (isSignUp ? ' oninput="checkPassStrength()"' : '') + '>' +
    (isSignUp ? '<div id="passStrength" style="font-size:12px;margin:-8px 0 8px 4px;display:none">' +
      '<div style="display:flex;gap:4px;margin-bottom:4px"><div id="psBar1" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar2" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar3" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar4" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div></div>' +
      '<div id="psText" style="color:var(--text-light)">Password requirements</div>' +
      '<div style="margin-top:4px;color:var(--text-light);line-height:1.6">' +
      '<div id="psLen">&#9675; At least 8 characters</div>' +
      '<div id="psUpper">&#9675; One uppercase letter</div>' +
      '<div id="psNum">&#9675; One number</div>' +
      '<div id="psSpecial">&#9675; One special character</div>' +
      '</div></div>' +
      '<input id="authPass2" type="password" placeholder="Confirm password" class="onb-input">' : '') +
    '<div id="authError" style="color:#E85D4A;font-size:13px;margin-bottom:12px;display:none"></div>' +
    '<button onclick="emailAuth(\'' + mode + '\')" style="width:100%;padding:14px;background:var(--primary-blue);color:#fff;border-radius:12px;font-size:15px;font-weight:600;margin-bottom:12px">' + (isSignUp ? 'Create Account' : 'Sign In') + '</button>' +
    '<div style="text-align:center;color:var(--text-light);font-size:13px;margin:12px 0">or</div>' +
    '<button onclick="googleSignIn()" style="width:100%;padding:14px;background:#fff;border:2px solid #E5E7EB;border-radius:12px;font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--text)">' +
    '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' +
    'Continue with Google</button>' +
    '<p style="text-align:center;margin-top:16px;font-size:13px;color:var(--text-light)">' +
    (isSignUp ? 'Already have an account? <a href="#" onclick="showAuthModal(\'signin\');return false" style="color:var(--primary-blue);font-weight:600">Sign In</a>' : 'New here? <a href="#" onclick="showAuthModal(\'signup\');return false" style="color:var(--primary-blue);font-weight:600">Create Account</a>') + '</p>';
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function showAuthError(msg) {
  var e = document.getElementById('authError');
  if(e) { e.textContent = msg; e.style.display = 'block'; }
}

function checkPassStrength() {
  var p = document.getElementById('authPass');
  if(!p) return;
  var v = p.value;
  var box = document.getElementById('passStrength');
  if(box) box.style.display = v.length > 0 ? 'block' : 'none';
  var checks = {len: v.length >= 8, upper: /[A-Z]/.test(v), num: /[0-9]/.test(v), special: /[^A-Za-z0-9]/.test(v)};
  var pass = [checks.len, checks.upper, checks.num, checks.special].filter(Boolean).length;
  var colors = ['#E85D4A','#F59E0B','#F59E0B','#10B981'];
  var labels = ['Weak','Fair','Good','Strong'];
  var bars = ['psBar1','psBar2','psBar3','psBar4'];
  for(var i=0;i<4;i++) {
    var b = document.getElementById(bars[i]);
    if(b) b.style.background = i < pass ? colors[Math.max(0,pass-1)] : '#E5E7EB';
  }
  var txt = document.getElementById('psText');
  if(txt && pass > 0) { txt.textContent = labels[pass-1]; txt.style.color = colors[pass-1]; }
  else if(txt) { txt.textContent = 'Password requirements'; txt.style.color = 'var(--text-light)'; }
  var mark = function(id,ok) { var el = document.getElementById(id); if(el) el.innerHTML = (ok ? '&#9679;' : '&#9675;') + ' ' + el.textContent.substring(2); el.style.color = ok ? '#10B981' : 'var(--text-light)'; };
  mark('psLen', checks.len);
  mark('psUpper', checks.upper);
  mark('psNum', checks.num);
  mark('psSpecial', checks.special);
}

function emailAuth(mode) {
  var email = document.getElementById('authEmail').value.trim();
  var pass = document.getElementById('authPass').value;
  if(!email || !pass) { showAuthError('Please fill in all fields'); return; }
  if(mode === 'signup') {
    if(pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) { showAuthError('Password must be 8+ chars with uppercase, number & special character'); return; }
    var pass2 = document.getElementById('authPass2');
    if(pass2 && pass !== pass2.value) { showAuthError('Passwords do not match'); return; }
    auth.createUserWithEmailAndPassword(email, pass)
      .then(function(cred) {
        // Send email verification
        if(cred.user && cred.user.sendEmailVerification) {
          cred.user.sendEmailVerification().catch(function(e){ console.warn('Verification email:', e); });
        }
        onAuthSuccess(cred.user);
      })
      .catch(function(err) { showAuthError(err.message); });
  } else {
    auth.signInWithEmailAndPassword(email, pass)
      .then(function(cred) { onAuthSuccess(cred.user); })
      .catch(function(err) { showAuthError(err.message); });
  }
}

function googleSignIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(function(result) { onAuthSuccess(result.user); })
    .catch(function(err) { showAuthError(err.message); });
}

function onAuthSuccess(user) {
  currentUser = user;
  closeAuthModal();
  // Check if existing localStorage data belongs to a different user
  if(userData && userData.authUid && userData.authUid !== user.uid) {
    userData = null;
    localStorage.removeItem('prayedLiveUser');
  }
  if(userData && userData.completed) {
    if(!userData.authUid) { userData.authUid = user.uid; localStorage.setItem('prayedLiveUser', JSON.stringify(userData)); }
    syncToCloud();
  } else {
    db.collection('users').doc(user.uid).get().then(function(doc) {
      if(doc.exists) {
        userData = doc.data();
        userData.authUid = user.uid;
        localStorage.setItem('prayedLiveUser', JSON.stringify(userData));
        if(userData.completed) {
          document.getElementById('splash').style.display = 'none';
          document.getElementById('onboarding').style.display = 'none';
          document.getElementById('app').style.display = 'block';
          document.getElementById('bottomNav').style.display = 'flex';
          personalizeApp();
          showScreen(currentScreen);
        }
      }
    }).catch(function(e) { console.warn('Firestore load failed:', e); });
  }
  if(currentScreen === 'profile') renderProfile();
}

// Onboarding auth helpers
var onbAuthMode = 'signup';
function switchOnbAuth(mode) {
  onbAuthMode = mode;
  var signupBtn = document.getElementById('onbAuthSignup');
  var signinBtn = document.getElementById('onbAuthSignin');
  var pass2Wrap = document.getElementById('onbAuthPass2Wrap');
  var authBtn = document.getElementById('onbAuthBtn');
  if(mode === 'signup') {
    if(signupBtn) { signupBtn.style.background='var(--primary-blue)'; signupBtn.style.color='#fff'; }
    if(signinBtn) { signinBtn.style.background='transparent'; signinBtn.style.color='var(--text-light)'; }
    if(pass2Wrap) pass2Wrap.style.display='block';
    if(authBtn) authBtn.textContent='Create Account';
  } else {
    if(signinBtn) { signinBtn.style.background='var(--primary-blue)'; signinBtn.style.color='#fff'; }
    if(signupBtn) { signupBtn.style.background='transparent'; signupBtn.style.color='var(--text-light)'; }
    if(pass2Wrap) pass2Wrap.style.display='none';
    if(authBtn) authBtn.textContent='Sign In';
  }
}
function onbDoAuth() {
  var email = document.getElementById('onbAuthEmail').value.trim();
  var pass = document.getElementById('onbAuthPass').value;
  var errEl = document.getElementById('onbAuthError');
  if(!email || !pass) { if(errEl){errEl.textContent='Please fill in all fields';errEl.style.display='block';} return; }
  if(onbAuthMode === 'signup') {
    if(pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) { if(errEl){errEl.textContent='Password must be 8+ chars with uppercase, number & special character';errEl.style.display='block';} return; }
    var pass2 = document.getElementById('onbAuthPass2');
    if(pass2 && pass !== pass2.value) { if(errEl){errEl.textContent='Passwords do not match';errEl.style.display='block';} return; }
    auth.createUserWithEmailAndPassword(email, pass)
      .then(function(cred) {
        if(cred.user && cred.user.sendEmailVerification) { cred.user.sendEmailVerification().catch(function(){}); }
        showToast('Account created!');
        onbStep++; renderOnboardingStep();
      })
      .catch(function(err) { if(errEl){errEl.textContent=err.message;errEl.style.display='block';} });
  } else {
    auth.signInWithEmailAndPassword(email, pass)
      .then(function() { showToast('Welcome back!'); onbStep++; renderOnboardingStep(); })
      .catch(function(err) { if(errEl){errEl.textContent=err.message;errEl.style.display='block';} });
  }
}
function skipOnbAuth() { onbStep++; renderOnboardingStep(); }
