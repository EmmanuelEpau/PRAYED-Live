// ===== ONBOARDING (5-Screen Flow) =====
var onbFamilyMode = '';
var onbInviteCode = '';

function generateInviteCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function detectBrowserLanguage() {
  var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (lang.indexOf('es') === 0) return 'es';
  if (lang.indexOf('fil') === 0 || lang.indexOf('tl') === 0) return 'fil';
  if (lang.indexOf('pt') === 0) return 'pt';
  if (lang.indexOf('fr') === 0) return 'fr';
  if (lang.indexOf('pl') === 0) return 'pl';
  return 'en';
}

function renderOnboardingStep() {
  var c = document.getElementById('onbContent');
  var progress = document.getElementById('onbProgress');
  var backBtn = document.getElementById('onbBack');
  var nextBtn = document.getElementById('onbNext');
  var footer = document.getElementById('onbFooter');
  var checkSvg = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  // Progress dots (skip welcome & verification screens from progress count)
  progress.innerHTML = '';
  var progressSteps = totalSteps - 2; // Exclude welcome (0) and verification (7)
  for (var i = 0; i < progressSteps; i++) {
    var cls = 'onb-dot';
    var mappedStep = i + 1; // Steps 1-6 map to dots 0-5
    if (mappedStep === onbStep) cls += ' active';
    else if (mappedStep < onbStep) cls += ' completed';
    progress.innerHTML += '<div class="' + cls + '"></div>';
  }
  // Hide progress and footer on welcome (0) and verification (7) screens
  if (onbStep === 0 || onbStep === 7) { progress.style.display = 'none'; footer.style.display = 'none'; }
  else { progress.style.display = 'flex'; footer.style.display = 'flex'; }
  // Back button (hide on step 0, 1, and 7)
  backBtn.style.display = (onbStep > 1 && onbStep < 7) ? 'flex' : 'none';
  // Next button text
  nextBtn.textContent = (onbStep === totalSteps - 2) ? 'Finish' : 'Next';
  // Hide Next on sign-up step (step 1) — auth buttons handle advancement
  if (onbStep === 1) { nextBtn.style.display = 'none'; }
  else { nextBtn.style.display = ''; }

  var html = '';
  switch(onbStep) {
    // ---- STEP 0: WELCOME ----
    case 0:
      html = '<div class="onb-welcome">' +
        '<div class="onb-welcome-illustration">' +
        '<svg viewBox="0 0 140 120" width="140" height="120" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<!-- Parent figure -->' +
        '<circle cx="55" cy="22" r="8"/>' +
        '<path d="M55 30 C55 30 55 48 55 52 C55 56 50 58 48 70"/>' +
        '<path d="M55 52 C55 56 60 58 62 70"/>' +
        '<path d="M55 38 C50 40 44 44 42 48 C40 50 42 52 44 52 L55 48"/>' +
        '<path d="M55 38 C60 40 66 44 68 48 C70 50 68 52 66 52 L55 48"/>' +
        '<!-- Hands together -->' +
        '<path d="M44 52 C46 50 54 46 55 48 C56 46 64 50 66 52" stroke-width="1.8"/>' +
        '<!-- Child figure -->' +
        '<circle cx="85" cy="38" r="6.5"/>' +
        '<path d="M85 44.5 C85 44.5 85 58 85 62 C85 65 81 66 80 74"/>' +
        '<path d="M85 62 C85 65 89 66 90 74"/>' +
        '<path d="M85 50 C81 52 77 55 76 58 C75 59 76 60 77.5 60 L85 57"/>' +
        '<path d="M85 50 C89 52 93 55 94 58 C95 59 94 60 92.5 60 L85 57"/>' +
        '<path d="M77.5 60 C79 58.5 84 56 85 57 C86 56 91 58.5 92.5 60" stroke-width="1.8"/>' +
        '<!-- Light rays -->' +
        '<path d="M70 8 L70 2" stroke="rgba(198,138,46,0.6)" stroke-width="1"/>' +
        '<path d="M58 6 L54 1" stroke="rgba(198,138,46,0.4)" stroke-width="1"/>' +
        '<path d="M82 14 L88 10" stroke="rgba(198,138,46,0.4)" stroke-width="1"/>' +
        '<path d="M70 12 C66 10 64 6 66 4" stroke="rgba(198,138,46,0.3)" stroke-width="0.8"/>' +
        '</svg>' +
        '</div>' +
        '<h1>The Family That Prays Together Stays Together</h1>' +
        '<p class="onb-welcome-sub">Join families around the world in daily prayer with PRAYED.</p>' +
        '<button class="onb-get-started" onclick="onbStep=1;renderOnboardingStep()">Create Account</button>' +
        '<p class="onb-signin-link">Already have an account? <a onclick="showAuthModal(\'signin\')">Sign In</a></p>' +
        '</div>';
      break;

    // ---- STEP 1: SIGN UP / SIGN IN ----
    case 1:
      html = '<h2>Create Your Account</h2>' +
        '<p class="onb-subtitle">Sync your prayers across all your devices</p>' +
        '<input id="onbAuthEmail" type="email" placeholder="Email address" class="onb-input" autocomplete="email">' +
        '<input id="onbAuthPass" type="password" placeholder="Password" class="onb-input" oninput="checkPassStrength()" autocomplete="new-password">' +
        '<div id="passStrength" style="font-size:12px;margin:-8px 0 8px 4px;display:none">' +
        '<div style="display:flex;gap:4px;margin-bottom:4px"><div id="psBar1" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar2" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar3" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div><div id="psBar4" style="flex:1;height:3px;border-radius:2px;background:#E5E7EB"></div></div>' +
        '<div id="psText" style="color:var(--text-light)">Password requirements</div>' +
        '<div style="margin-top:4px;color:var(--text-light);line-height:1.6">' +
        '<div id="psLen">&#9675; At least 8 characters</div>' +
        '<div id="psUpper">&#9675; One uppercase letter</div>' +
        '<div id="psNum">&#9675; One number</div>' +
        '<div id="psSpecial">&#9675; One special character</div>' +
        '</div></div>' +
        '<input id="onbAuthPass2" type="password" placeholder="Confirm password" class="onb-input" autocomplete="new-password">' +
        '<div id="onbAuthError" style="color:#E85D4A;font-size:13px;margin-bottom:12px;display:none"></div>' +
        '<button class="onb-get-started" onclick="onbCreateAccount()" style="margin-top:8px">Create Account</button>' +
        '<div style="text-align:center;color:var(--text-light);font-size:13px;margin:16px 0">or</div>' +
        '<button class="onb-google-btn" onclick="onbGoogleSignIn()">' +
        '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' +
        ' Continue with Google</button>' +
        '<span class="onb-skip" onclick="onbSkipAuth()">Skip for Now</span>';
      break;

    // ---- STEP 2: NAME & LOCATION ----
    case 2:
      html = '<h2>Tell Us About You</h2>' +
        '<p class="onb-subtitle">This helps connect you with local prayer communities</p>' +
        '<div class="onb-name-row">' +
        '<input id="onbFirstName" type="text" placeholder="First Name" class="onb-input" value="' + escapeHtml(userData.firstName || '') + '" oninput="updateOnbNameState()">' +
        '<input id="onbLastName" type="text" placeholder="Last Name" class="onb-input" value="' + escapeHtml(userData.lastName || '') + '" oninput="updateOnbNameState()">' +
        '</div>' +
        '<select id="onbCountry" class="onb-input onb-select" onchange="updateOnbNameState()">' +
        '<option value="">Select Your Country</option>';
      var countryList = ['United States','Philippines','Mexico','Brazil','Colombia','Argentina','Peru','Chile','Spain','France','Poland','Italy','Ireland','Portugal','Canada','United Kingdom','Australia','India','Nigeria','Kenya','Ghana','South Africa','Germany','Austria','Ecuador','Venezuela','Guatemala','Honduras','Dominican Republic','Puerto Rico','El Salvador','Costa Rica','Panama','Bolivia','Paraguay','Uruguay','Cuba','Haiti','Nicaragua','Other'];
      countryList.forEach(function(cn) {
        var sel = userData.country === cn ? ' selected' : '';
        html += '<option value="' + cn + '"' + sel + '>' + cn + '</option>';
      });
      html += '</select>' +
        '<input id="onbState" type="text" placeholder="State / Province" class="onb-input" value="' + escapeHtml(userData.state || '') + '" oninput="updateOnbNameState()">' +
        '<input id="onbCity" type="text" placeholder="City" class="onb-input" value="' + escapeHtml(userData.city || '') + '" oninput="updateOnbNameState()">';
      nextBtn.disabled = !(userData.firstName && userData.country);
      break;

    // ---- STEP 3: WHO ARE YOU? (was step 1) ----
    case 3:
      html = '<h2>Who Are You?</h2>' +
        '<p class="onb-subtitle">This customizes your home screen \u2014 you can change later</p>';
      var types = [
        {id:'parent',icon:'\uD83D\uDE4F',title:'Parent / Guardian',desc:'Unlock family & kids content'},
        {id:'student',icon:'\uD83D\uDCD6',title:'Student / Youth',desc:'Night prayer, reflections, daily habits'},
        {id:'single',icon:'\u271D\uFE0F',title:'Single Adult',desc:'Default experience'},
        {id:'priest',icon:'\u26EA',title:'Priest / Religious',desc:'Liturgy of the Hours, HC Community'}
      ];
      types.forEach(function(tp) {
        var sel = userData.userType === tp.id ? ' selected' : '';
        html += '<div class="onb-type-card' + sel + '" onclick="selectOnbType(\'' + tp.id + '\',this)">' +
          '<div class="onb-type-icon">' + tp.icon + '</div>' +
          '<div class="onb-type-info"><div class="onb-type-title">' + tp.title + '</div>' +
          '<div class="onb-type-desc">' + tp.desc + '</div></div>' +
          '<div class="onb-type-check">' + checkSvg + '</div></div>';
      });
      nextBtn.disabled = !userData.userType;
      break;

    // ---- STEP 4: LANGUAGE (was step 2) ----
    case 4:
      html = '<h2>Choose Your Language</h2>' +
        '<p class="onb-subtitle">You can change this anytime in Settings</p>' +
        '<div class="onb-lang-grid">';
      var langs = [
        {code:'en',flag:'\uD83C\uDDFA\uD83C\uDDF8',name:'English'},
        {code:'es',flag:'\uD83C\uDDEA\uD83C\uDDF8',name:'Espa\u00f1ol'},
        {code:'fil',flag:'\uD83C\uDDF5\uD83C\uDDED',name:'Filipino'},
        {code:'pt',flag:'\uD83C\uDDE7\uD83C\uDDF7',name:'Portugu\u00eas'},
        {code:'fr',flag:'\uD83C\uDDEB\uD83C\uDDF7',name:'Fran\u00e7ais'},
        {code:'pl',flag:'\uD83C\uDDF5\uD83C\uDDF1',name:'Polski'}
      ];
      langs.forEach(function(l) {
        var sel = userData.language === l.code ? ' selected' : '';
        html += '<div class="onb-lang-btn' + sel + '" onclick="selectOnbLang(\'' + l.code + '\',this)">' +
          '<span class="onb-lang-flag">' + l.flag + '</span>' +
          '<span class="onb-lang-name">' + l.name + '</span></div>';
      });
      html += '</div>';
      nextBtn.disabled = !userData.language;
      break;

    // ---- STEP 5: PRAYER TIME (was step 3) ----
    case 5:
      html = '<h2>Set Your Prayer Time</h2>' +
        '<p class="onb-subtitle">We\'ll gently remind you. You can change these anytime.</p>' +
        '<div class="onb-time-grid">';
      var times = [
        {id:'morning',icon:'\uD83C\uDF05',label:'Morning',range:'5am \u2013 12pm'},
        {id:'afternoon',icon:'\u2600\uFE0F',label:'Afternoon',range:'12pm \u2013 5pm'},
        {id:'evening',icon:'\uD83C\uDF07',label:'Evening',range:'5pm \u2013 9pm'},
        {id:'night',icon:'\uD83C\uDF19',label:'Night',range:'9pm \u2013 12am'}
      ];
      times.forEach(function(tm) {
        var sel = userData.prayerTimes && userData.prayerTimes.indexOf(tm.id) > -1 ? ' selected' : '';
        html += '<div class="onb-time-pill' + sel + '" onclick="toggleOnbTime(\'' + tm.id + '\',this)">' +
          '<div class="onb-time-icon">' + tm.icon + '</div>' +
          '<div class="onb-time-info"><div class="onb-time-label">' + tm.label + '</div>' +
          '<div class="onb-time-range">' + tm.range + '</div></div>' +
          '<div class="onb-time-check">' + checkSvg + '</div></div>';
      });
      html += '</div>';
      nextBtn.disabled = !userData.prayerTimes || userData.prayerTimes.length === 0;
      break;

    // ---- STEP 6: CREATE OR JOIN FAMILY (was step 4) ----
    case 6:
      html = '<h2>Create or Join Family</h2>' +
        '<p class="onb-subtitle">Pray together, even when apart</p>' +
        '<div class="onb-family-grid">';
      html += '<div class="onb-family-card' + (onbFamilyMode==='create'?' selected':'') + '" onclick="selectFamilyMode(\'create\')">' +
        '<div class="onb-family-icon">\uD83C\uDFE0</div>' +
        '<div class="onb-family-title">Create a Family</div>' +
        '<div class="onb-family-desc">Start a family group and invite your loved ones</div></div>';
      html += '<div class="onb-family-card' + (onbFamilyMode==='join'?' selected':'') + '" onclick="selectFamilyMode(\'join\')">' +
        '<div class="onb-family-icon">\uD83E\uDD1D</div>' +
        '<div class="onb-family-title">Join a Family</div>' +
        '<div class="onb-family-desc">Enter a 6-character code from a family member</div></div>';
      html += '</div>';
      if (onbFamilyMode === 'create' && onbInviteCode) {
        html += '<div class="onb-invite-code-display">' +
          '<p style="font-size:15px;color:var(--color-text-secondary);margin-bottom:12px">Your family invite code:</p>' +
          '<div class="onb-invite-code">' + onbInviteCode + '</div>' +
          '<div class="onb-invite-actions">' +
          '<button class="onb-invite-btn copy" onclick="copyInviteCode()">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' +
          ' Copy Code</button>' +
          '<button class="onb-invite-btn whatsapp" onclick="shareViaWhatsApp()">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
          ' WhatsApp</button></div></div>';
      }
      if (onbFamilyMode === 'join') {
        html += '<div class="onb-family-code-area">' +
          '<input class="onb-family-code-input" id="joinCodeInput" type="text" maxlength="6" placeholder="ABC123" ' +
          'oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,\'\');updateOnbNextState()"></div>';
      }
      html += '<span class="onb-skip" onclick="skipFamily()">Skip for Now</span>';
      nextBtn.disabled = false;
      nextBtn.textContent = 'Finish';
      break;

    // ---- STEP 7: EMAIL VERIFICATION ----
    case 7:
      var userEmail = (currentUser && currentUser.email) ? currentUser.email : (userData.email || 'your email');
      var isVerified = currentUser && currentUser.emailVerified;
      html = '<div class="onb-welcome" style="padding-top:60px">' +
        '<div class="onb-verification-icon">' +
        '<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="' + (isVerified ? '#10B981' : 'var(--color-primary, #2563EB)') + '" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="2" y="4" width="20" height="16" rx="2"/>' +
        '<path d="M22 4L12 13 2 4"/>' +
        (isVerified ? '<circle cx="18" cy="16" r="4" fill="#10B981" stroke="#10B981"/><path d="M16.5 16l1 1 2-2" stroke="#fff" stroke-width="1.5"/>' : '') +
        '</svg></div>' +
        '<h1 style="font-size:24px;margin-top:20px">' + (isVerified ? 'Email Verified!' : 'Check Your Email') + '</h1>' +
        '<p class="onb-welcome-sub" style="color:var(--color-text-secondary)">' +
        (isVerified ? 'Your account is ready. Welcome to PRAYED!' : 'We sent a verification link to <strong>' + escapeHtml(userEmail) + '</strong>. Please verify to sync your prayers across devices.') +
        '</p>';
      if (!isVerified) {
        html += '<button class="onb-get-started" onclick="onbCheckVerification()" style="margin-top:16px">I\'ve Verified My Email</button>' +
          '<button class="onb-google-btn" onclick="onbResendVerification()" style="margin-top:8px">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>' +
          ' Resend Verification Email</button>';
      } else {
        html += '<button class="onb-get-started" onclick="completeOnboarding()" style="margin-top:16px">Start Praying</button>';
      }
      html += '<span class="onb-skip" onclick="completeOnboarding()" style="margin-top:16px">' + (isVerified ? '' : 'Skip for Now') + '</span>' +
        '</div>';
      break;
  }

  // Add step-specific background illustration class
  var onbContainer = document.getElementById('onboarding');
  if(onbContainer) {
    onbContainer.className = 'onb-step-' + onbStep;
  }
  c.innerHTML = '<div style="animation:fadeIn 0.3s ease-out">' + html + '</div>';

  // Auto-detect language on first render of language screen
  if (onbStep === 4 && !userData.language) {
    userData.language = detectBrowserLanguage();
    renderOnboardingStep();
  }
}

// --- Onboarding Selection Handlers ---
function selectOnbType(typeId, el) {
  userData.userType = typeId;
  document.querySelectorAll('.onb-type-card').forEach(function(c) { c.classList.remove('selected'); });
  if (el) el.classList.add('selected');
  document.getElementById('onbNext').disabled = false;
}

function selectOnbLang(code, el) {
  userData.language = code;
  document.querySelectorAll('.onb-lang-btn').forEach(function(b) { b.classList.remove('selected'); });
  if (el) el.classList.add('selected');
  document.getElementById('onbNext').disabled = false;
}

function toggleOnbTime(timeId, el) {
  if (!userData.prayerTimes) userData.prayerTimes = [];
  var idx = userData.prayerTimes.indexOf(timeId);
  if (idx > -1) { userData.prayerTimes.splice(idx, 1); if (el) el.classList.remove('selected'); }
  else { userData.prayerTimes.push(timeId); if (el) el.classList.add('selected'); }
  document.getElementById('onbNext').disabled = userData.prayerTimes.length === 0;
}

function selectFamilyMode(mode) {
  onbFamilyMode = mode;
  if (mode === 'create' && !onbInviteCode) {
    onbInviteCode = generateInviteCode();
    if (currentUser && db) {
      try { db.collection('families').doc(onbInviteCode).set({code:onbInviteCode,createdBy:currentUser.uid,createdAt:new Date().toISOString(),members:[currentUser.uid]}); }
      catch(e) { console.warn('Family creation failed:', e); }
    }
  }
  renderOnboardingStep();
}

function copyInviteCode() {
  if (navigator.clipboard && onbInviteCode) {
    navigator.clipboard.writeText(onbInviteCode).then(function() { showToast('Code copied!'); }).catch(function() { fallbackCopyCode(onbInviteCode); });
  } else { fallbackCopyCode(onbInviteCode); }
}
function fallbackCopyCode(text) {
  var t = document.createElement('textarea'); t.value = text; t.style.position='fixed'; t.style.opacity='0';
  document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); showToast('Code copied!'); } catch(e) { showToast('Could not copy'); }
  document.body.removeChild(t);
}
function shareViaWhatsApp() {
  var msg = 'Join our family on PRAYED! Use code: ' + onbInviteCode + '\nhttps://emmanuelepau.github.io/PRAYED-Live/';
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// --- Onboarding Account Creation (Step 1) ---
function onbCreateAccount() {
  var email = document.getElementById('onbAuthEmail').value.trim();
  var pass = document.getElementById('onbAuthPass').value;
  var pass2 = document.getElementById('onbAuthPass2').value;
  var errEl = document.getElementById('onbAuthError');
  if (!email || !pass) { if(errEl){errEl.textContent='Please fill in all fields';errEl.style.display='block';} return; }
  if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) {
    if(errEl){errEl.textContent='Password must be 8+ chars with uppercase, number & special character';errEl.style.display='block';} return;
  }
  if (pass !== pass2) { if(errEl){errEl.textContent='Passwords do not match';errEl.style.display='block';} return; }
  if (!auth) { if(errEl){errEl.textContent='Authentication service not available';errEl.style.display='block';} return; }
  auth.createUserWithEmailAndPassword(email, pass)
    .then(function(cred) {
      currentUser = cred.user;
      userData.email = email;
      userData.authUid = cred.user.uid;
      if (cred.user.sendEmailVerification) { cred.user.sendEmailVerification().catch(function(e){ console.warn('Verification email:', e); }); }
      showToast('Account created!');
      onbStep = 2;
      renderOnboardingStep();
    })
    .catch(function(err) { if(errEl){errEl.textContent=err.message;errEl.style.display='block';} });
}

function onbGoogleSignIn() {
  if (!auth) return;
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(function(result) {
      currentUser = result.user;
      userData.email = result.user.email || '';
      userData.authUid = result.user.uid;
      if (result.user.displayName) {
        var parts = result.user.displayName.split(' ');
        userData.firstName = parts[0] || '';
        userData.lastName = parts.slice(1).join(' ') || '';
      }
      showToast('Signed in with Google!');
      onbStep = 2;
      renderOnboardingStep();
    })
    .catch(function(err) {
      var errEl = document.getElementById('onbAuthError');
      if(errEl){errEl.textContent=err.message;errEl.style.display='block';}
    });
}

function onbSkipAuth() {
  onbStep = 2;
  renderOnboardingStep();
}

function updateOnbNameState() {
  var fn = document.getElementById('onbFirstName');
  var country = document.getElementById('onbCountry');
  var nextBtn = document.getElementById('onbNext');
  if (nextBtn) {
    nextBtn.disabled = !(fn && fn.value.trim() && country && country.value);
  }
}

function onbCheckVerification() {
  if (!currentUser) { completeOnboarding(); return; }
  currentUser.reload().then(function() {
    // Re-fetch user to get updated emailVerified
    currentUser = auth.currentUser;
    if (currentUser.emailVerified) {
      showToast('Email verified!');
      renderOnboardingStep(); // Re-render to show verified state
      setTimeout(completeOnboarding, 1500);
    } else {
      showToast('Email not yet verified. Please check your inbox.');
    }
  }).catch(function() {
    showToast('Could not check verification status. Please try again.');
  });
}

function onbResendVerification() {
  if (!currentUser) return;
  currentUser.sendEmailVerification()
    .then(function() { showToast('Verification email sent!'); })
    .catch(function(err) { showToast(err.message || 'Could not send email'); });
}
function skipFamily() {
  onbFamilyMode = '';
  if (currentUser && !currentUser.emailVerified) {
    onbStep = 7;
    renderOnboardingStep();
  } else {
    completeOnboarding();
  }
}
function updateOnbNextState() {
  var inp = document.getElementById('joinCodeInput');
  if (inp) document.getElementById('onbNext').disabled = inp.value.length < 6;
}

// --- Onboarding Navigation ---
function onbNext() {
  // Save name & location data from step 2
  if (onbStep === 2) {
    var fn = document.getElementById('onbFirstName');
    var ln = document.getElementById('onbLastName');
    var country = document.getElementById('onbCountry');
    var state = document.getElementById('onbState');
    var city = document.getElementById('onbCity');
    if (fn) userData.firstName = fn.value.trim();
    if (ln) userData.lastName = ln.value.trim();
    if (country) userData.country = country.value;
    if (state) userData.state = state.value.trim();
    if (city) userData.city = city.value.trim();
    if (!userData.firstName || !userData.country) return;
  }
  if (onbStep === 3 && !userData.userType) return;
  if (onbStep === 4 && !userData.language) return;
  if (onbStep === 5 && (!userData.prayerTimes || userData.prayerTimes.length === 0)) return;
  if (onbStep === 6) {
    if (onbFamilyMode === 'join') {
      var joinInput = document.getElementById('joinCodeInput');
      if (joinInput && joinInput.value.length === 6) {
        userData.familyCode = joinInput.value;
        if (currentUser && db) {
          try { db.collection('families').doc(joinInput.value).get().then(function(doc) {
            if (doc.exists) { var d=doc.data(); var m=d.members||[]; if(m.indexOf(currentUser.uid)===-1){m.push(currentUser.uid);db.collection('families').doc(joinInput.value).update({members:m});} showToast('Joined family!'); }
            else { showToast('Family code not found'); }
          }).catch(function(){}); } catch(e){}
        }
      }
    } else if (onbFamilyMode === 'create') { userData.familyCode = onbInviteCode; }
    // Go to verification step if user has an account, otherwise complete
    if (currentUser && !currentUser.emailVerified) {
      onbStep = 7;
      renderOnboardingStep();
    } else {
      completeOnboarding();
    }
    return;
  }
  if (onbStep < totalSteps - 1) { onbStep++; renderOnboardingStep(); }
}
function onbBack() {
  if (onbStep === 7) { onbStep = 6; renderOnboardingStep(); return; }
  if (onbStep > 1) { onbStep--; renderOnboardingStep(); }
}

function completeOnboarding() {
  // Map prayer time selections to actual times
  if (userData.prayerTimes) {
    if (userData.prayerTimes.indexOf('morning') > -1) userData.morningTime = '07:00';
    if (userData.prayerTimes.indexOf('afternoon') > -1) userData.afternoonTime = '15:00';
    if (userData.prayerTimes.indexOf('evening') > -1) userData.eveningTime = '20:00';
    if (userData.prayerTimes.indexOf('night') > -1) userData.nightTime = '21:30';
  }
  userData.completed = true;
  userData.firstName = userData.firstName || 'Friend';
  userData.lastName = userData.lastName || '';
  userData.initials = (userData.firstName || 'F').charAt(0) + (userData.lastName || 'R').charAt(0);
  if (!userData.interests) userData.interests = [];
  if (!userData.morningTime) userData.morningTime = '07:00';
  if (!userData.eveningTime) userData.eveningTime = '20:00';
  // Mark onboarding complete
  localStorage.setItem('prayedOnboarded', 'true');
  try { localStorage.setItem('prayedUserData', JSON.stringify(userData)); } catch(e) {}
  if (typeof schedulePrayerNotifications === 'function') schedulePrayerNotifications();
  if (typeof syncToCloud === 'function') syncToCloud();
  // Transition to main app
  var ob = document.getElementById('onboarding');
  ob.style.transition = 'opacity 0.5s';
  ob.style.opacity = '0';
  setTimeout(function() {
    ob.style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';
    personalizeApp();
    showScreen('home');
  }, 500);
}

function personalizeApp() {
  if(!userData) {
    userData = {
      firstName: 'Friend',
      lastName: '',
      initials: 'FR',
      greeting: 'Good Morning',
      city: '',
      cityDisplay: '',
      country: '',
      morningTime: '07:00',
      eveningTime: '20:00',
      frequency: '',
      userType: [],
      interests: [],
      habits: habits
    };
  }
  // Set greeting based on time
  var h = new Date().getHours();
  var greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  var city = userData.city || userData.country || '';
  userData.greeting = greeting;
  userData.cityDisplay = city;
  userData.initials = (userData.firstName||'J').charAt(0) + (userData.lastName||'D').charAt(0);
}

// ===== NAVIGATION =====
function showScreen(name) {
  currentScreen = name;
  logEvent('screen_view', {screen_name: name});
  // Close any open overlays
  var sp = document.getElementById('subPage'); if(sp) sp.style.display='none';
  var br = document.getElementById('browserOverlay'); if(br) br.style.display='none';
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
  document.querySelectorAll('.nav-tab').forEach(function(t){t.classList.remove('active');t.setAttribute('aria-selected','false')});
  var scr = document.getElementById('screen'+name.charAt(0).toUpperCase()+name.slice(1));
  if(scr){scr.classList.add('active')}
  var tab = document.querySelector('[data-tab="'+name+'"]');
  if(tab){tab.classList.add('active');tab.setAttribute('aria-selected','true')}
  // Ensure screen is rendered (lazy rendering on first visit)
  if(typeof ensureScreenRendered === 'function') {
    ensureScreenRendered(name);
  }
  // Re-render for dynamic content updates (home always refreshes for greeting/weather)
  switch(name){
    case 'home': renderHome(); break;
    case 'pray': renderPray(); break;
    case 'bible': renderBible(); break;
    case 'circles': renderCircles(); break;
    case 'habits': if(typeof renderHabits === 'function') renderHabits(); break;
    case 'profile': renderProfile(); break;
  }
}

// ===== OVERLAYS =====
function showVideoPlayer(title, videoId) {
  document.getElementById('voTitle').textContent = title;
  var frame = document.getElementById('voFrame');
  var fallback = document.getElementById('voFallback');
  var directLink = document.getElementById('voDirectLink');
  fallback.style.display = 'none';
  frame.style.display = 'block';
  directLink.href = 'https://www.youtube.com/watch?v=' + videoId;
  var isFile = window.location.protocol === 'file:';
  var params = 'rel=0&modestbranding=1&playsinline=1&enablejsapi=0';
  if (!isFile) { params += '&autoplay=1&origin=' + encodeURIComponent(window.location.origin); }
  frame.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params;
  document.getElementById('videoOverlay').style.display = 'flex';
  frame.onload = function() {
    setTimeout(function(){
      try {
        var doc = frame.contentDocument || frame.contentWindow.document;
        if(doc && doc.body && (doc.body.innerHTML.indexOf('error') > -1 || doc.body.innerHTML === '')) {
          frame.style.display = 'none';
          fallback.style.display = 'block';
        }
      } catch(e) {}
    }, 2000);
  };
  frame.onerror = function() {
    frame.style.display = 'none';
    fallback.style.display = 'block';
  };
}
function closeVideoPlayer() {
  document.getElementById('voFrame').src = '';
  document.getElementById('voFallback').style.display = 'none';
  document.getElementById('voFrame').style.display = 'block';
  document.getElementById('videoOverlay').style.display = 'none';
}
function showInAppBrowser(title, url) {
  document.getElementById('boUrl').textContent = title || url;
  document.getElementById('boFrame').src = url;
  document.getElementById('browserOverlay').style.display = 'flex';
}
function closeInAppBrowser() {
  document.getElementById('boFrame').src = '';
  document.getElementById('browserOverlay').style.display = 'none';
}
function showSubPage(name, title) {
  // Intercept Bible tab navigation
  if(name === 'bible-tab') { showScreen('bible'); return; }
  logEvent('subpage_view', {page_name: name});
  document.getElementById('spTitle').textContent = title || name;
  document.getElementById('spBody').innerHTML = getSubPageContent(name);
  document.getElementById('subPage').style.display = 'flex';
  document.getElementById('spBody').scrollTop = 0;
  if(name === 'hc-community') { if(currentUser) { setTimeout(function(){ hcLogin(); }, 100); } }
}
function closeSubPage() { document.getElementById('subPage').style.display = 'none'; }

// ===== AUDIO PLAYER =====
var audioEl = null;
var audioSources = {
  'default': 'https://mcdn.podbean.com/mf/web/9fayt7c3qkfuwuz9/TTM_EP_9.mp3',
  'rosary': 'https://mcdn.podbean.com/mf/web/jht57y5n4xmxstvu/TTM_EP_19.mp3',
  'lent': 'https://mcdn.podbean.com/mf/web/e6qk3ikqczpdxy74/THROUGH_THE_MYSTERIES_EP_3_EDITED.mp3'
};
function formatTime(s) {
  if(!s || isNaN(s)) return '0:00';
  var m = Math.floor(s/60); var sec = Math.floor(s%60);
  return m + ':' + (sec<10?'0':'') + sec;
}
function playContent(title, image, src) {
  audioEl = document.getElementById('audioElement');
  playerState.title = title;
  playerState.image = image;
  playerState.playing = true;
  document.getElementById('abThumb').src = image;
  document.getElementById('abTitle').textContent = title;
  document.getElementById('afArt').src = image;
  document.getElementById('afTitle').textContent = title;
  document.getElementById('audioBar').style.display = 'flex';
  // Load and play real audio
  var audioSrc = src || audioSources['default'];
  if(audioEl.getAttribute('data-src') !== audioSrc) {
    audioEl.src = audioSrc;
    audioEl.setAttribute('data-src', audioSrc);
    audioEl.load();
  }
  audioEl.play().catch(function(e){ console.log('Audio play blocked:', e); });
  updatePlayIcons();
  startProgressUpdater();
}
function togglePlay(e) {
  if(e) e.stopPropagation();
  audioEl = document.getElementById('audioElement');
  playerState.playing = !playerState.playing;
  if(playerState.playing) {
    audioEl.play().catch(function(){});
  } else {
    audioEl.pause();
  }
  updatePlayIcons();
}
function updatePlayIcons() {
  document.getElementById('abPlayIcon').innerHTML = playerState.playing ? '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>' : '<path d="M8 5v14l11-7z"/>';
  document.getElementById('afPlayIcon').innerHTML = playerState.playing ? '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>' : '<path d="M8 5v14l11-7z"/>';
}
function closePlayer(e) {
  if(e) e.stopPropagation();
  audioEl = document.getElementById('audioElement');
  audioEl.pause();
  document.getElementById('audioBar').style.display = 'none';
  document.getElementById('audioFull').style.display = 'none';
  playerState.playing = false;
  playerState.expanded = false;
}
function togglePlayerExpand() {
  playerState.expanded = !playerState.expanded;
  document.getElementById('audioFull').style.display = playerState.expanded ? 'flex' : 'none';
}
function seekToTime(sec) {
  audioEl = document.getElementById('audioElement');
  if(audioEl && audioEl.duration) {
    audioEl.currentTime = Math.max(0, Math.min(audioEl.duration, audioEl.currentTime + sec));
  }
}
function startProgressUpdater() {
  audioEl = document.getElementById('audioElement');
  if(window._progressInterval) clearInterval(window._progressInterval);
  window._progressInterval = setInterval(function() {
    if(!audioEl || !audioEl.duration) return;
    var pct = (audioEl.currentTime / audioEl.duration) * 100;
    var fill = document.getElementById('afFill');
    if(fill) fill.style.width = pct + '%';
    var timeEl = document.getElementById('afTime');
    if(timeEl) timeEl.textContent = formatTime(audioEl.currentTime);
    var durEl = document.getElementById('afDur');
    if(durEl) durEl.textContent = formatTime(audioEl.duration);
    // Update bar subtitle with time
    var sub = document.querySelector('#audioBar .ab-sub');
    if(sub) sub.textContent = formatTime(audioEl.currentTime) + ' / ' + formatTime(audioEl.duration);
  }, 500);
}
function shareContent(type) {
  var shareUrl = 'https://emmanuelepau.github.io/PRAYED-Live/';
  var shareText = 'Join me in prayer on PRAYED! A beautiful app that brings families together through the Rosary.';
  if(type === 'prayer') {
    shareText = 'I just prayed the Rosary on PRAYED. Join families around the world in prayer!';
  } else if(type === 'circle') {
    shareText = 'Join our prayer community on PRAYED!';
  }
  if(navigator.share) {
    navigator.share({ title: 'PRAYED - A World at Prayer', text: shareText, url: shareUrl }).catch(function(e) {
      if(e.name !== 'AbortError') console.warn('Share failed:', e);
    });
  } else {
    var temp = document.createElement('textarea');
    temp.value = shareText + '\n' + shareUrl;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); showToast('Link copied to clipboard!'); }
    catch(e) { showToast('Could not copy link'); }
    document.body.removeChild(temp);
  }
}

// ===== DARK MODE =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  var isDark = document.body.classList.contains('dark-mode');
  if(userData){ userData.darkMode = isDark; syncToCloud(); }
}

var distanceUnit = localStorage.getItem('prayedDistUnit') || 'mi';

function toggleDistanceUnit() {
  distanceUnit = distanceUnit === 'mi' ? 'km' : 'mi';
  localStorage.setItem('prayedDistUnit', distanceUnit);
  var label = document.getElementById('distUnitLabel');
  if(label) label.textContent = distanceUnit === 'mi' ? 'Miles' : 'Kilometers';
}

function signOut() {
  if(auth) { try { auth.signOut(); } catch(e) {} }
  currentUser = null;
  localStorage.removeItem('prayedLiveUser');
  location.reload();
}

function showToast(msg) {
  var existing = document.getElementById('appToast');
  if(existing) existing.remove();
  var t = document.createElement('div');
  t.id = 'appToast';
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.classList.add('show'); }, 10);
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2500);
}

// ===== REAL NOTIFICATIONS =====
var notifTimers = [];
function schedulePrayerNotifications() {
  // Clear existing timers
  notifTimers.forEach(function(t){ clearTimeout(t); });
  notifTimers = [];
  if(!('Notification' in window)) return;
  if(Notification.permission === 'default') {
    Notification.requestPermission();
  }
  if(Notification.permission !== 'granted') return;
  var now = new Date();
  var times = [];
  if(userData.morningTime) times.push({label:'Morning Prayer', time:userData.morningTime});
  if(userData.middayTime && userData.middayReminder !== false) times.push({label:'Midday Prayer (Angelus)', time:userData.middayTime});
  if(userData.afternoonTime && userData.afternoonReminder !== false) times.push({label:'Afternoon Prayer (Divine Mercy)', time:userData.afternoonTime});
  if(userData.eveningTime) times.push({label:'Evening Prayer', time:userData.eveningTime});
  if(userData.customReminders) {
    userData.customReminders.forEach(function(cr) {
      if(cr.time && cr.label) times.push({label:cr.label, time:cr.time});
    });
  }
  times.forEach(function(t) {
    var parts = t.time.split(':');
    var target = new Date();
    target.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    if(target <= now) target.setDate(target.getDate() + 1);
    var ms = target.getTime() - now.getTime();
    var timer = setTimeout(function() {
      try {
        new Notification('PRAYED - ' + t.label, {
          body: 'It\'s time for ' + t.label.toLowerCase() + '. The family that prays together stays together.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%232563EB"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-weight="bold">P</text></svg>',
          tag: 'prayer-' + t.label.replace(/\s/g,'-').toLowerCase(),
          requireInteraction: false
        });
      } catch(e) { console.warn('Notification error:', e); }
      // Reschedule for next day
      schedulePrayerNotifications();
    }, ms);
    notifTimers.push(timer);
  });
}

// Auto-schedule on load if user completed onboarding
if(typeof userData !== 'undefined' && userData && userData.completed) {
  setTimeout(schedulePrayerNotifications, 2000);
}

// ===== BACKGROUND AUDIO =====
// Keep audio playing when tab loses focus
document.addEventListener('visibilitychange', function() {
  if(document.hidden && playerState.playing) {
    var audio = document.getElementById('audioElement');
    if(audio && audio.paused) {
      audio.play().catch(function(){});
    }
  }
});

// ===== NOTIFICATION PERMISSION =====
function requestNotifPermission() {
  if(!('Notification' in window)) {
    showToast('Notifications not supported in this browser');
    return;
  }
  if(Notification.permission === 'granted') {
    showToast('Notifications already enabled! \u2705');
    schedulePrayerNotifications();
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if(perm === 'granted') {
      showToast('Notifications enabled! You\'ll be reminded to pray.');
      schedulePrayerNotifications();
    } else {
      showToast('Please allow notifications in your browser settings');
    }
  });
}

function submitChallengeAnswer(el, correct) {
  document.querySelectorAll('.trivia-option').forEach(function(btn){ btn.disabled = true; });
  el.classList.add(correct ? 'correct' : 'wrong');
  if (correct) {
    document.querySelectorAll('.trivia-option')[2].classList.add('correct');
  } else {
    document.querySelectorAll('.trivia-option')[2].classList.add('correct');
  }
  var result = document.getElementById('triviaResult');
  if (correct) {
    result.innerHTML = '<div style="padding:12px;background:rgba(13,148,136,0.1);border-radius:12px;margin-top:12px;color:var(--teal);font-size:14px">' +
      svgIcons.check + ' Correct! The Resurrection is the first Glorious Mystery.</div>';
  } else {
    result.innerHTML = '<div style="padding:12px;background:rgba(232,93,74,0.1);border-radius:12px;margin-top:12px;color:var(--coral);font-size:14px">' +
      'Not quite. The Resurrection is the first Glorious Mystery. Keep learning!</div>';
  }
}

// ===== OVERLAY HELPERS =====
function showOverlay(html) {
  closeOverlay();
  var overlay = document.createElement('div');
  overlay.id = 'contentOverlay';
  overlay.className = 'bible-picker-overlay';
  overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  var inner = document.createElement('div');
  inner.style.cssText = 'background:var(--color-surface, #fff);border-radius:16px;width:90%;max-width:360px;box-shadow:0 8px 32px rgba(0,0,0,0.2);position:relative;max-height:80vh;overflow-y:auto;';
  inner.innerHTML = html;
  overlay.appendChild(inner);
  overlay.addEventListener('click', function(e) { if(e.target === overlay) closeOverlay(); });
  document.body.appendChild(overlay);
}

function closeOverlay() {
  var overlay = document.getElementById('contentOverlay');
  if(overlay) overlay.remove();
}

// ===== CONTENT MODERATION =====
function reportContent(contentType, contentId, reportedUserId) {
  // contentType: 'chat_message', 'reflection', 'circle_post', 'prayer_room'
  if(!currentUser) { alert('Please sign in to report content.'); return; }

  var reasons = ['Inappropriate content', 'Spam', 'Harassment', 'Safety concern'];
  // Show a simple modal with reason selection
  var html = '<div class="report-modal">' +
    '<h3>Report Content</h3>' +
    '<p>Why are you reporting this?</p>';
  reasons.forEach(function(reason, i) {
    html += '<button class="report-reason-btn" onclick="submitReport(\'' + contentType + '\', \'' + contentId + '\', \'' + reportedUserId + '\', \'' + reason + '\')">' + reason + '</button>';
  });
  html += '<button class="report-cancel-btn" onclick="closeOverlay()">Cancel</button></div>';

  showOverlay(html);
}

function submitReport(contentType, contentId, reportedUserId, reason) {
  if(!db || !currentUser) return;
  db.collection('reports').add({
    reportedBy: currentUser.uid,
    reportedUser: reportedUserId || '',
    contentType: contentType,
    contentId: contentId,
    reason: reason,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending',
    reviewedBy: null,
    action: null
  }).then(function() {
    closeOverlay();
    showToast('Report submitted. Thank you for keeping our community safe.');
  }).catch(function(err) {
    console.warn('Report failed:', err);
    showToast('Could not submit report. Please try again.');
  });
}

// ===== USER BLOCKING =====
function blockUser(userId, userName) {
  if(!currentUser || !db) return;
  if(!confirm('Block ' + (userName || 'this user') + '? They won\'t be able to see your content.')) return;

  db.collection('users').doc(currentUser.uid).collection('blockedUsers').doc(userId).set({
    blockedAt: firebase.firestore.FieldValue.serverTimestamp(),
    userName: userName || ''
  }).then(function() {
    showToast(userName + ' has been blocked.');
    // Refresh current screen
    var activeScreen = document.querySelector('.screen.active');
    if(activeScreen) {
      var screenId = activeScreen.id.replace('Screen', '');
      if(typeof window['render' + screenId.charAt(0).toUpperCase() + screenId.slice(1)] === 'function') {
        window['render' + screenId.charAt(0).toUpperCase() + screenId.slice(1)]();
      }
    }
  });
}

function isUserBlocked(userId) {
  // Check local cache of blocked users
  var blocked = [];
  try { blocked = JSON.parse(localStorage.getItem('prayedBlockedUsers') || '[]'); } catch(e) {}
  return blocked.indexOf(userId) > -1;
}

// ===== PROFANITY FILTER =====
var moderationWordList = ['fuck','shit','damn','ass','bitch','bastard','crap','dick','piss','hell'];

function filterProfanity(text) {
  var filtered = text;
  moderationWordList.forEach(function(word) {
    var regex = new RegExp('\\b' + word + '\\b', 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
}

function containsProfanity(text) {
  var lower = text.toLowerCase();
  return moderationWordList.some(function(word) {
    return new RegExp('\\b' + word + '\\b', 'i').test(lower);
  });
}
