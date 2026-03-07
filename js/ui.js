// ===== ONBOARDING =====
function renderOnboardingStep() {
  var c = document.getElementById('onbContent');
  var dots = document.getElementById('onbDots');
  var backBtn = document.getElementById('onbBack');
  var nextBtn = document.getElementById('onbNext');
  backBtn.style.display = onbStep > 0 ? 'block' : 'none';
  nextBtn.textContent = onbStep === totalSteps - 1 ? 'Start Praying' : 'Next';
  dots.innerHTML = '';
  for (var i = 0; i < totalSteps; i++) {
    dots.innerHTML += '<div class="onb-dot' + (i === onbStep ? ' active' : '') + '"></div>';
  }
  var html = '';
  switch(onbStep) {
    case 0:
      html = '<div style="position:fixed;top:0;left:0;right:0;bottom:60px;max-width:500px;margin:0 auto;z-index:0;display:flex;align-items:center;justify-content:center">' +
        '<div style="position:absolute;inset:0;background:url('+imgMap['family_table_prayer']+') center/cover no-repeat"></div>' +
        '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(27,58,92,0.7) 0%,rgba(27,58,92,0.82) 50%,rgba(27,58,92,0.92) 100%)"></div>' +
        '<div style="position:relative;z-index:1;text-align:center;padding:0 32px">' +
        '<img src="'+imgMap['hcfm_symbol_white']+'" alt="HCFM" style="width:72px;height:72px;object-fit:contain;margin:0 auto 20px">' +
        '<h2 style="color:#fff;font-size:36px;font-weight:800;margin-bottom:14px;text-shadow:0 2px 12px rgba(0,0,0,0.4);line-height:1.15">Welcome to PRAYED</h2>' +
        '<p style="color:#fff;font-size:18px;margin-bottom:28px;font-weight:500;text-shadow:0 1px 8px rgba(0,0,0,0.3)">Join millions of families worldwide in daily prayer.</p>' +
        '<p style="font-family:Crimson Text,serif;font-style:italic;color:rgba(255,255,255,0.95);font-size:20px;line-height:1.4;text-shadow:0 1px 8px rgba(0,0,0,0.3)">' +
        '\u201cThe family that prays together stays together.\u201d</p>' +
        '<p style="color:rgba(255,255,255,0.7);font-size:15px;margin-top:8px;font-weight:500">\u2014 Fr. Patrick Peyton</p>' +
        '</div></div>';
      break;
    case 1:
      // Auth step — sign in or create account
      if(currentUser) {
        html = '<div style="text-align:center">' +
          '<div style="width:64px;height:64px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
          '<h2>Welcome Back!</h2><p class="subtitle">Signed in as ' + currentUser.email + '</p>' +
          '<p style="font-size:13px;color:var(--text-light);margin-top:8px">Tap Next to continue to your prayer journey.</p></div>';
      } else {
        html = '<div style="text-align:center;margin-bottom:20px">' +
          '<div style="font-size:40px;margin-bottom:8px">&#10013;&#65039;</div>' +
          '<h2>Join the Community</h2>' +
          '<p class="subtitle">Create an account or sign in to save your prayer life across devices</p></div>' +
          '<div id="onbAuthForm">' +
          '<div id="onbAuthToggle" style="display:flex;gap:0;margin-bottom:16px;background:var(--light-gray);border-radius:10px;padding:3px">' +
          '<button id="onbAuthSignup" onclick="switchOnbAuth(\'signup\')" style="flex:1;padding:10px;border-radius:8px;font-size:14px;font-weight:600;background:var(--primary-blue);color:#fff;border:none">Create Account</button>' +
          '<button id="onbAuthSignin" onclick="switchOnbAuth(\'signin\')" style="flex:1;padding:10px;border-radius:8px;font-size:14px;font-weight:600;background:transparent;color:var(--text-light);border:none">Sign In</button></div>' +
          '<input class="onb-input" id="onbAuthEmail" type="email" placeholder="Email address">' +
          '<input class="onb-input" id="onbAuthPass" type="password" placeholder="Password">' +
          '<div id="onbAuthPass2Wrap"><input class="onb-input" id="onbAuthPass2" type="password" placeholder="Confirm password"></div>' +
          '<div id="onbAuthError" style="color:#E85D4A;font-size:13px;margin-bottom:8px;display:none"></div>' +
          '<button onclick="onbDoAuth()" style="width:100%;padding:14px;background:var(--primary-blue);color:#fff;border-radius:12px;font-size:15px;font-weight:600;margin-bottom:10px" id="onbAuthBtn">Create Account</button>' +
          '<div style="text-align:center;color:var(--text-light);font-size:13px;margin:8px 0">or</div>' +
          '<button onclick="googleSignIn()" style="width:100%;padding:14px;background:#fff;border:2px solid #E5E7EB;border-radius:12px;font-size:15px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--text)">' +
          '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' +
          'Continue with Google</button>' +
          '<p style="text-align:center;margin-top:12px;font-size:13px;color:var(--text-light)"><a href="#" onclick="skipOnbAuth();return false" style="color:var(--primary-blue);font-weight:500">Skip for now</a></p></div>';
      }
      break;
    case 2:
      html = '<h2>Tell Us About You</h2><p class="subtitle">We will personalize your prayer experience</p>' +
        '<input class="onb-input" id="inpFirst" placeholder="Enter your first name" value="' + (userData.firstName||'') + '">' +
        '<input class="onb-input" id="inpLast" placeholder="Enter your last name" value="' + (userData.lastName||'') + '">' +
        '<input class="onb-input" type="email" id="inpEmail" placeholder="your@email.com" value="' + (userData.email||'') + '">';
      break;
    case 3:
      html = '<h2>Your Location</h2><p class="subtitle">Help us connect you with nearby prayer communities</p>' +
        '<button class="geo-btn" onclick="detectGeolocation()"><svg viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> Use My Location</button>' +
        '<div id="geoResult"></div>' +
        '<select class="onb-select" id="selCountry" onchange="onCountryChange()">' + countryOptions() + '</select>' +
        '<select class="onb-select" id="selState"><option value="">Select State/Province</option></select>' +
        '<input class="onb-input" id="inpCity" placeholder="City/Town" value="' + (userData.city||'') + '">';
      break;
    case 4:
      html = '<h2>Your Parish</h2><p class="subtitle">Connect with your local faith community</p>' +
        '<div id="parishList">' + renderParishes() + '</div>' +
        '<span class="skip-link" onclick="onbNext()">Skip for now</span>';
      break;
    case 5:
      html = '<h2>How Often Do You Pray?</h2><p class="subtitle">No wrong answer \u2014 we meet you where you are</p>';
      ['Daily','A Few Times a Week','Weekly','Occasionally','Just Starting'].forEach(function(f){
        html += '<div class="onb-card' + (userData.frequency===f?' selected':'') + '" onclick="selectFrequency(this,\''+f+'\')">'+f+'</div>';
      });
      break;
    case 6:
      html = '<h2>What Describes You?</h2><p class="subtitle">Select all that apply</p>';
      ['Individual','Parent / Guardian','Young Adult (18-30)','Religious / Clergy','Educator / Catechist','Student'].forEach(function(t){
        var sel = userData.userType.indexOf(t) > -1;
        html += '<div class="onb-card' + (sel?' selected':'') + '" onclick="toggleUserType(this,\''+t.replace(/'/g,"\\\'")+'\')">'+t+'</div>';
      });
      break;
    case 7:
      var isParent = userData.userType.indexOf('Parent / Guardian') > -1;
      var isEducator = userData.userType.indexOf('Educator / Catechist') > -1;
      if (isParent) {
        html = '<h2>Your Family</h2><p class="subtitle">Tell us about your family</p>' +
          '<label style="font-size:13px;color:var(--text-light);margin-bottom:4px;display:block">How many children?</label>' +
          '<select class="onb-select" id="selChildren"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select>' +
          '<label style="font-size:13px;color:var(--text-light);margin-bottom:4px;display:block">Spouse/partner name (optional)</label>' +
          '<input class="onb-input" id="inpSpouse" placeholder="Name">';
      } else if (isEducator) {
        html = '<h2>Ambassador Setup</h2><p class="subtitle">Tell us about your role</p>' +
          '<input class="onb-input" id="inpSchool" placeholder="School/Parish name">' +
          '<select class="onb-select" id="selRole"><option>Teacher</option><option>Principal</option><option>Catechist</option><option>Director</option></select>' +
          '<input class="onb-input" type="number" id="inpGroupSize" placeholder="Group size">';
      } else {
        html = '<h2>What Interests You?</h2><p class="subtitle">Select all that apply</p>';
        ['The Holy Rosary','Daily Mass & Readings','Family Prayer','Adoration & Meditation','Catholic Community','Youth & Children'].forEach(function(i){
          var sel = userData.interests.indexOf(i) > -1;
          html += '<div class="onb-card' + (sel?' selected':'') + '" onclick="toggleInterest(this,\''+i.replace(/&/g,'&amp;')+'\')">'+i+'</div>';
        });
      }
      break;
    case 8:
      var isConditional = userData.userType.indexOf('Parent / Guardian') > -1 || userData.userType.indexOf('Educator / Catechist') > -1;
      if (isConditional && onbStep === 8) {
        html = '<h2>What Interests You?</h2><p class="subtitle">Select all that apply</p>';
        ['The Holy Rosary','Daily Mass & Readings','Family Prayer','Adoration & Meditation','Catholic Community','Youth & Children'].forEach(function(i){
          var sel = userData.interests.indexOf(i) > -1;
          html += '<div class="onb-card' + (sel?' selected':'') + '" onclick="toggleInterest(this,\''+i.replace(/&/g,'&amp;')+'\')">'+i+'</div>';
        });
      } else {
        html = renderPrayerTimeStep();
      }
      break;
  }
  if (onbStep >= totalSteps) {
    html = renderPrayerTimeStep();
  }
  c.innerHTML = '<div style="animation:fadeIn 0.3s ease-out">' + html + '</div>';
  if (onbStep === 3 && userData.country) {
    var sel = document.getElementById('selCountry');
    if(sel) sel.value = userData.country;
    onCountryChange();
  }
}

function renderPrayerTimeStep() {
  var middayTime = userData.middayTime || '12:00';
  var afternoonTime = userData.afternoonTime || '15:00';
  var middayOn = userData.middayReminder !== false;
  var afternoonOn = userData.afternoonReminder !== false;
  var customReminders = userData.customReminders || [];
  var html = '<h2>Set Your Prayer Times</h2><p class="subtitle">We\'ll gently remind you when it\'s time to pray</p>';
  // Morning
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:14px 16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
    '<div style="width:36px;height:36px;border-radius:50%;background:rgba(198,138,46,0.1);display:flex;align-items:center;justify-content:center">' +
    svgIcons.sun.replace('viewBox','style="width:20px;height:20px;fill:var(--gold)" viewBox') + '</div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">Morning Prayer</div><div style="font-size:11px;color:var(--text-light)">Start your day with God</div></div>' +
    '<input type="time" value="' + userData.morningTime + '" id="timeMorning" style="border:none;font-size:14px;color:var(--primary-blue);font-weight:500;background:transparent"></div>';
  // Midday
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:14px 16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
    '<div style="width:36px;height:36px;border-radius:50%;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center">' +
    '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--primary-blue)"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM4 10.5H1v2h3zm9-9.95h-2V3.5h2zM20 10.5v2h3v-2zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg></div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">Midday Prayer</div><div style="font-size:11px;color:var(--text-light)">Angelus / Pause at noon</div></div>' +
    '<input type="time" value="' + middayTime + '" id="timeMidday" style="border:none;font-size:14px;color:var(--primary-blue);font-weight:500;background:transparent">' +
    '<div onclick="togglePrayerReminder(this,\'midday\')" class="toggle-switch' + (middayOn ? ' on' : '') + '" style="width:40px;height:22px;flex-shrink:0"><div class="toggle-knob" style="width:18px;height:18px"></div></div></div>';
  // Afternoon
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:14px 16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
    '<div style="width:36px;height:36px;border-radius:50%;background:rgba(13,148,136,0.1);display:flex;align-items:center;justify-content:center">' +
    svgIcons.cross.replace('viewBox','style="width:20px;height:20px;fill:var(--teal)" viewBox') + '</div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">Afternoon Prayer</div><div style="font-size:11px;color:var(--text-light)">Divine Mercy / 3 o\'clock</div></div>' +
    '<input type="time" value="' + afternoonTime + '" id="timeAfternoon" style="border:none;font-size:14px;color:var(--primary-blue);font-weight:500;background:transparent">' +
    '<div onclick="togglePrayerReminder(this,\'afternoon\')" class="toggle-switch' + (afternoonOn ? ' on' : '') + '" style="width:40px;height:22px;flex-shrink:0"><div class="toggle-knob" style="width:18px;height:18px"></div></div></div>';
  // Evening
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:14px 16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
    '<div style="width:36px;height:36px;border-radius:50%;background:rgba(27,58,92,0.1);display:flex;align-items:center;justify-content:center">' +
    svgIcons.moon.replace('viewBox','style="width:20px;height:20px;fill:var(--navy)" viewBox') + '</div>' +
    '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">Evening Prayer</div><div style="font-size:11px;color:var(--text-light)">Compline / Night prayer</div></div>' +
    '<input type="time" value="' + userData.eveningTime + '" id="timeEvening" style="border:none;font-size:14px;color:var(--primary-blue);font-weight:500;background:transparent"></div>';
  // Custom reminders
  html += '<div id="customRemindersList">';
  customReminders.forEach(function(cr, idx) {
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:14px 16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:rgba(232,93,74,0.1);display:flex;align-items:center;justify-content:center">' +
      svgIcons.bell.replace('viewBox','style="width:20px;height:20px;fill:var(--coral)" viewBox') + '</div>' +
      '<div style="flex:1"><input value="' + escapeHtml(cr.label) + '" onchange="updateCustomReminder('+idx+',\'label\',this.value)" placeholder="Reminder name" style="border:none;font-size:14px;font-weight:600;color:var(--navy);background:transparent;width:100%"></div>' +
      '<input type="time" value="' + cr.time + '" onchange="updateCustomReminder('+idx+',\'time\',this.value)" style="border:none;font-size:14px;color:var(--primary-blue);font-weight:500;background:transparent">' +
      '<div onclick="removeCustomReminder('+idx+')" style="cursor:pointer;opacity:0.4;font-size:16px">&times;</div></div>';
  });
  html += '</div>';
  html += '<button onclick="addCustomReminder()" style="width:100%;padding:12px;border:2px dashed var(--gray);border-radius:12px;color:var(--text-light);font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;background:transparent;cursor:pointer">' +
    svgIcons.plus.replace('viewBox','style="width:16px;height:16px;fill:var(--gray)" viewBox') + ' Add Custom Reminder</button>';
  return html;
}

function togglePrayerReminder(el, type) {
  el.classList.toggle('on');
  if(type === 'midday') userData.middayReminder = el.classList.contains('on');
  if(type === 'afternoon') userData.afternoonReminder = el.classList.contains('on');
}
function addCustomReminder() {
  if(!userData.customReminders) userData.customReminders = [];
  userData.customReminders.push({label:'Custom Prayer', time:'09:00'});
  renderOnboardingStep();
}
function removeCustomReminder(idx) {
  if(userData.customReminders) { userData.customReminders.splice(idx, 1); renderOnboardingStep(); }
}
function updateCustomReminder(idx, field, val) {
  if(userData.customReminders && userData.customReminders[idx]) { userData.customReminders[idx][field] = val; }
}

function countryOptions() {
  var countries = ['','United States','Canada','Mexico','United Kingdom','Ireland','France','Germany','Italy','Spain','Portugal','Poland','Philippines','India','Bangladesh','Sri Lanka','South Korea','Japan','Indonesia','Nigeria','Ghana','Kenya','Uganda','Tanzania','South Africa','Brazil','Argentina','Chile','Colombia','Peru','Australia','New Zealand'];
  return countries.map(function(c){ return '<option value="'+c+'">'+(c||'Select Country')+'</option>'; }).join('');
}

function onCountryChange() {
  var c = document.getElementById('selCountry');
  var s = document.getElementById('selState');
  if(!c||!s) return;
  var val = c.value;
  var states = {'United States':['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],'Canada':['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],'United Kingdom':['England','Scotland','Wales','Northern Ireland'],'India':['Andhra Pradesh','Delhi','Goa','Gujarat','Karnataka','Kerala','Maharashtra','Tamil Nadu','Uttar Pradesh','West Bengal'],'Philippines':['Cebu','Davao','Laguna','Manila','Pampanga','Quezon'],'Nigeria':['Abuja','Lagos','Ogun','Rivers'],'Brazil':['Bahia','Minas Gerais','Rio de Janeiro','Sao Paulo']};
  var opts = '<option value="">Select State/Province</option>';
  if (states[val]) { states[val].forEach(function(st){ opts += '<option>'+st+'</option>'; }); }
  s.innerHTML = opts;
  userData.country = val;
}

function detectGeolocation() {
  var el = document.getElementById('geoResult');
  if(!el) return;
  el.innerHTML = '<div style="color:var(--text-light);font-size:13px;display:flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31" stroke-dashoffset="10"/></svg> Detecting your location...</div>';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos){
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      geoDetected = true;
      el.innerHTML = '<div style="background:#ECFDF5;border:1px solid #6EE7B7;border-radius:12px;padding:12px 16px;color:#065F46;font-size:13px;display:flex;align-items:center;gap:8px">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>' +
        '<div><strong>Location detected!</strong><br><span id="geoLocationName" style="font-size:12px;opacity:0.8">Finding your area...</span></div></div>';
      // Reverse geocode to show friendly location name
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+userLat+'&lon='+userLng+'&zoom=10')
        .then(function(r){ return r.json(); })
        .then(function(data){
          var addr = data.address || {};
          var city = addr.city || addr.town || addr.village || addr.suburb || '';
          var state = addr.state || '';
          var locName = document.getElementById('geoLocationName');
          if(locName && city) { locName.textContent = city + (state ? ', ' + state : ''); }
          else if(locName) { locName.textContent = state || 'Location found'; }
        }).catch(function(){ var locName = document.getElementById('geoLocationName'); if(locName) locName.textContent = 'Location found'; });
      var pl = document.getElementById('parishList');
      if(pl) pl.innerHTML = renderParishes();
      var cityInp = document.getElementById('inpCity');
      if(cityInp && !cityInp.value) { reverseGeocode(userLat, userLng); }
      fetchWeather(userLat, userLng);
      userData.lat = userLat;
      userData.lng = userLng;
      syncToCloud();
      searchNearbyChurches(userLat, userLng);
    }, function(err){
      var msg = 'Location access denied.';
      if(err.code === 2) msg = 'Location unavailable.';
      if(err.code === 3) msg = 'Location request timed out.';
      el.innerHTML = '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px 16px;color:#991B1B;font-size:13px">' + msg + ' Please select your location manually below.</div>';
    }, {enableHighAccuracy:true, timeout:10000, maximumAge:60000});
  } else {
    el.innerHTML = '<div style="color:var(--coral);font-size:13px">Geolocation not supported by your browser. Please select manually.</div>';
  }
}

function reverseGeocode(lat, lng) {
  fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&zoom=10')
    .then(function(r){ return r.json(); })
    .then(function(data){
      var addr = data.address || {};
      var city = addr.city || addr.town || addr.village || '';
      var state = addr.state || '';
      var country = addr.country || '';
      var cityInp = document.getElementById('inpCity');
      if(cityInp && city) cityInp.value = city;
      if(city) userData.city = city;
      if(state) userData.state = state;
      if(country) userData.country = country;
    }).catch(function(){});
}

function calculateDistance(lat1,lng1,lat2,lng2) {
  var R = 6371;
  var dLat = (lat2-lat1)*Math.PI/180;
  var dLng = (lng2-lng1)*Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderParishes() {
  // Use Google Places data if available
  if(nearbyChurchesCache && nearbyChurchesCache.length > 0) {
    return nearbyChurchesCache.slice(0,8).map(function(ch) {
      return '<div class="parish-card' + (userData.parish===ch.name?' selected':'') + '" onclick="selectParish(this,\''+ch.name.replace(/'/g,"\\\'")+'\')"><div>' +
        '<div class="p-name">'+ch.name+'</div><div class="p-dist">'+ch.address+' \u2014 '+ch.dist+' mi'+(ch.rating?' \u2B50 '+ch.rating:'')+'</div></div></div>';
    }).join('');
  }
  var sorted = parishes.map(function(p){
    p.dist = calculateDistance(userLat, userLng, p.lat, p.lng);
    return p;
  }).sort(function(a,b){ return a.dist - b.dist; }).slice(0,8);
  return sorted.map(function(p){
    return '<div class="parish-card' + (userData.parish===p.name?' selected':'') + '" onclick="selectParish(this,\''+p.name.replace(/'/g,"\\\'")+'\')"><div>' +
      '<div class="p-name">'+p.name+'</div><div class="p-dist">'+p.city+' \u2014 '+(distanceUnit==='mi'?(p.dist*0.621371).toFixed(1)+' mi':p.dist.toFixed(1)+' km')+'</div></div></div>';
  }).join('');
}

function selectParish(el,name) { userData.parish=name; document.querySelectorAll('.parish-card').forEach(function(c){c.classList.remove('selected')}); el.classList.add('selected'); }
function selectFrequency(el,f) { userData.frequency=f; document.querySelectorAll('.onb-card').forEach(function(c){c.classList.remove('selected')}); el.classList.add('selected'); }
function toggleUserType(el,t) { var i=userData.userType.indexOf(t); if(i>-1){userData.userType.splice(i,1);el.classList.remove('selected')}else{userData.userType.push(t);el.classList.add('selected')} }
function toggleInterest(el,t) { var i=userData.interests.indexOf(t); if(i>-1){userData.interests.splice(i,1);el.classList.remove('selected')}else{userData.interests.push(t);el.classList.add('selected')} }

function onbNext() {
  // Step 1 is auth — handled by onbDoAuth/skipOnbAuth/googleSignIn, just advance if already signed in
  if(onbStep===1 && currentUser) { onbStep++; renderOnboardingStep(); return; }
  if(onbStep===1 && !currentUser) { onbStep++; renderOnboardingStep(); return; }
  if(onbStep===2){
    var f=document.getElementById('inpFirst'),l=document.getElementById('inpLast'),e=document.getElementById('inpEmail');
    if(f)userData.firstName=f.value; if(l)userData.lastName=l.value; if(e)userData.email=e.value;
    if(!userData.firstName||!userData.lastName){alert('Please enter your name');return;}
  }
  if(onbStep===3){
    var city=document.getElementById('inpCity'); if(city)userData.city=city.value;
    var st=document.getElementById('selState'); if(st)userData.state=st.value;
  }
  if(onbStep===6 && userData.userType.length===0){ userData.userType=['Individual']; }

  var isConditional = userData.userType.indexOf('Parent / Guardian')>-1 || userData.userType.indexOf('Educator / Catechist')>-1;
  var lastStep = isConditional ? totalSteps : totalSteps - 1;

  if(onbStep >= lastStep) {
    completeOnboarding();
    return;
  }
  // Skip step 7 conditional if not parent/educator
  if(onbStep === 6 && !isConditional) {
    // step 7 will show interests directly
  }
  onbStep++;
  renderOnboardingStep();
}
function onbBack() { if(onbStep>0){onbStep--;renderOnboardingStep()} }

function completeOnboarding() {
  var mt = document.getElementById('timeMorning');
  var et = document.getElementById('timeEvening');
  var md = document.getElementById('timeMidday');
  var at = document.getElementById('timeAfternoon');
  if(mt) userData.morningTime = mt.value;
  if(et) userData.eveningTime = et.value;
  if(md) userData.middayTime = md.value;
  if(at) userData.afternoonTime = at.value;
  userData.completed = true;
  // Schedule notifications if permitted
  schedulePrayerNotifications();
  syncToCloud();
  var ob = document.getElementById('onboarding');
  ob.style.transition = 'opacity 0.5s';
  ob.style.opacity = '0';
  setTimeout(function(){
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
  // Close any open overlays
  var sp = document.getElementById('subPage'); if(sp) sp.style.display='none';
  var br = document.getElementById('browserOverlay'); if(br) br.style.display='none';
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
  document.querySelectorAll('.nav-tab').forEach(function(t){t.classList.remove('active')});
  var scr = document.getElementById('screen'+name.charAt(0).toUpperCase()+name.slice(1));
  if(scr){scr.classList.add('active')}
  var tab = document.querySelector('[data-tab="'+name+'"]');
  if(tab){tab.classList.add('active')}
  // Render screen content
  switch(name){
    case 'home': renderHome(); break;
    case 'pray': renderPray(); break;
    case 'bible': renderBible(); break;
    case 'circles': renderCircles(); break;
    case 'habits': renderHabits(); break;
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
