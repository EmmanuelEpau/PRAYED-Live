// ===== RENDER HOME =====
function renderHome() {
  personalizeApp();
  var u = userData || {greeting:'Good Morning',cityDisplay:'',initials:'FR',firstName:'Friend'};
  var html = '';

  // === HEADER ===
  html += '<div class="app-header"><div class="header-left">' +
    '<img src="'+imgMap['hcfm_logo_blue']+'" alt="HCFM" style="width:32px;height:32px;object-fit:contain">' +
    '<div class="greeting">' + (u.greeting||'Good Morning') + ', ' + (u.firstName||'Friend') +
    '<small>The family that prays together stays together</small></div>' +
    '</div>' +
    '<div class="header-right"><button class="notif-btn" onclick="showSubPage(\'notifications\',\'Notifications\')">' +
    svgIcons.bell + '<div class="notif-badge">2</div></button>' +
    '<div class="avatar" onclick="showScreen(\'profile\')">'+(u.initials||'FR')+'</div></div></div>';

  // === TOP: FAMILY PRAYER ROOM CARD ===
  var familyName = (u.lastName ? u.lastName + ' Family' : 'Your Family');
  var familyStreak = getFamilyStreak();
  var familyMembers = getFamilyMembers();
  var onlineMembers = familyMembers.filter(function(m) { return m.online; });

  html += '<div class="family-room-card" onclick="openPrayerRoomUI()">' +
    '<div class="family-room-card__header">' +
    '<div class="family-room-card__title">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2 20v-1c0-2.5 3-4 7-4s7 1.5 7 4v1"/><path d="M16.5 12.5c2.5.3 5 1.5 5 3.5v1"/></svg>' +
    '<h3>' + escapeHtml(familyName) + '</h3></div>' +
    (familyStreak > 0 ? '<span class="streak-badge">\uD83D\uDD25 ' + familyStreak + ' days</span>' : '') +
    '</div>' +
    '<div class="family-room-card__members">';

  familyMembers.forEach(function(m) {
    html += '<div class="member-avatar' + (m.online ? ' online' : '') + '" style="background:' + (m.color || 'var(--color-primary)') + '">' + m.initials + '</div>';
  });

  html += '</div>';

  if(onlineMembers.length > 0) {
    var onlineNames = onlineMembers.map(function(m) { return m.firstName; }).join(', ');
    html += '<p class="family-room-card__status"><span class="live-dot"></span> ' + onlineNames + ' online</p>';
  } else {
    html += '<p class="family-room-card__status" style="color:var(--color-text-muted)">No one online right now</p>';
  }

  html += '<button class="family-room-card__join" onclick="event.stopPropagation();openPrayerRoomUI()">Enter Prayer Room</button>';

  // Last prayer together
  var lastPrayer = getLastFamilyPrayer();
  if(lastPrayer) {
    html += '<p class="family-room-card__last">Last prayer together: ' + lastPrayer + '</p>';
  }
  html += '</div>';

  // === QUICK HABITS ROW ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' +
    ' Today\'s Habits</div>';
  html += '<div class="habits-quick-row">';
  var qh = habits || [];
  qh.forEach(function(h, i) {
    html += '<div class="habit-chip' + (h.done ? ' done' : '') + '" onclick="quickToggleHabit('+i+')">' +
      '<div class="habit-chip__check">' +
      '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></div>' +
      '<span>' + h.name.split(' ').slice(0,2).join(' ') + '</span></div>';
  });
  html += '</div>';
  var doneH = habits.filter(function(h){return h.done}).length;
  html += '<div class="habits-quick-meta">' +
    '<span>' + doneH + '/' + habits.length + ' completed</span>' +
    '<button onclick="showSubPage(\'my-habits\',\'My Habits\')">View All \u203A</button></div>';

  // === MIDDLE: TODAY'S PRAYER SUGGESTIONS ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
    ' Today\'s Prayers</div>';

  // Primary prayer cards (large)
  var primaryPrayers = [
    {key:'rosary_stock',name:'Daily Rosary',page:'rosary',desc:'Pray with families worldwide'},
    {key:'mass_01',name:'Daily Mass',page:'mass',desc:'Today\'s readings & celebration'},
    {key:'family_table_prayer',name:'Family Prayers',page:'family-prayers',desc:'Grace, bedtime & more'}
  ];
  html += '<div class="prayer-cards-primary">';
  primaryPrayers.forEach(function(c) {
    html += '<div class="prayer-card-lg" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'">' +
      '<div class="prayer-card-lg__overlay"><h3>'+c.name+'</h3><p>'+c.desc+'</p></div></div>';
  });
  html += '</div>';

  // Secondary prayer grid (smaller)
  var secondaryPrayers = [
    {key:'stained_glass',name:'Adoration',page:'adoration'},
    {key:'prayer_stock1',name:'Reflections',page:'reflections'},
    {key:'church_interior',name:'Gospel',page:'gospel-today'},
    {key:'prayer_stock3',name:'Night Prayer',page:'compline'}
  ];
  html += '<div class="prayer-grid-secondary">';
  secondaryPrayers.forEach(function(c) {
    html += '<div class="prayer-card-sm" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'">' +
      '<div class="prayer-card-sm__overlay"><h3>'+c.name+'</h3></div></div>';
  });
  html += '</div>';

  // === LENT BANNER (seasonal) ===
  html += '<div class="lent-banner" onclick="showSubPage(\'challenge\',\'Lent Prayer Challenge\')">' +
    '<div class="lent-banner__icon"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#fff"/></svg></div>' +
    '<div class="lent-banner__text"><h3>Lent Family Prayer Challenge</h3><p>Join families in 40 days of prayer together</p></div></div>';

  // === VERSE OF THE DAY ===
  var votd = getVerseOfTheDay();
  html += '<div class="votd-card" onclick="openVotdChapter()">' +
    '<div class="votd-label">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/></svg>' +
    ' Verse of the Day</div>' +
    '<div class="votd-text">\u201c' + escapeHtml(votd.text) + '\u201d</div>' +
    '<div class="votd-ref">\u2014 ' + votd.ref + ' (' + currentBibleVersion + ')</div>' +
    '<div class="votd-action">' +
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="var(--color-primary)"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
    ' Read Full Chapter</div></div>';

  // === BOTTOM: CIRCLE ACTIVITY FEED ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' Circle Activity</div>';
  html += '<div class="activity-feed">';
  feedUsers.forEach(function(f){
    html += '<div class="feed-item" onclick="showSubPage(\'circle-detail-daily-rosary\',\'Daily Rosary\')">' +
      '<div class="av" style="background:'+f.color+'">'+f.initials+'</div><div class="fi-body">' +
      '<div class="fi-name">'+f.name+' <span class="flag">'+flagSVG(f.flag)+'</span></div>' +
      '<div class="fi-text">'+f.action+'</div><div class="fi-time">'+f.time+'</div></div></div>';
  });
  html += '</div>';

  // === FR. PEYTON QUOTE ===
  html += '<div class="quote-card" onclick="showSubPage(\'fr-peyton\',\'Fr. Patrick Peyton\')">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-accent)"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>' +
    '<blockquote class="crimson">\u201cThe family that prays together stays together.\u201d</blockquote>' +
    '<cite>\u2014 Fr. Patrick Peyton, C.S.C.</cite></div>';

  // === WORLD MAP (compact) ===
  html += '<div class="world-section" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')">' +
    '<h3>' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' A World at Prayer</h3>' +
    '<p>PRAYED families in ' + countryCount + ' countries unite in faith every day.</p></div>';

  document.getElementById('screenHome').innerHTML = html;
}

// === HELPER FUNCTIONS ===
function getFamilyStreak() {
  // Check Firestore for real streak, fallback to localStorage
  try {
    var streak = localStorage.getItem('prayedFamilyStreak');
    return streak ? parseInt(streak) : 0;
  } catch(e) { return 0; }
}

function getFamilyMembers() {
  // Return real family members from userData, or default
  if(userData && userData.familyMembers && userData.familyMembers.length > 0) {
    return userData.familyMembers;
  }
  // Show just the current user
  var u = userData || {};
  return [
    {firstName: u.firstName || 'You', initials: u.initials || 'ME', color: 'var(--color-primary)', online: true}
  ];
}

function getLastFamilyPrayer() {
  try {
    var last = localStorage.getItem('prayedLastFamilyPrayer');
    if(last) {
      var d = new Date(parseInt(last));
      var now = new Date();
      var diffDays = Math.floor((now - d) / 86400000);
      if(diffDays === 0) {
        return 'Today at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } else if(diffDays === 1) {
        return 'Yesterday at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } else {
        return diffDays + ' days ago';
      }
    }
  } catch(e) {}
  return null;
}

// === SPLASH ANIMATION ===
function runSplashAnimation() {
  var logo = document.getElementById('splashLogo');
  var globe = document.getElementById('splashGlobe');
  var title = document.getElementById('splashTitle');
  var tag = document.getElementById('splashTagline');
  var btn = document.getElementById('splashBtn');
  logo.classList.add('spinning');
  setTimeout(function(){ logo.style.opacity='0'; globe.style.opacity='1'; }, 1000);
  setTimeout(function(){ globe.style.opacity='0'; logo.style.opacity='1'; logo.classList.remove('spinning'); logo.classList.add('spin-slow'); }, 3000);
  setTimeout(function(){ title.style.opacity='1'; }, 3800);
  setTimeout(function(){ tag.style.opacity='1'; }, 4300);
  setTimeout(function(){ btn.style.opacity='1'; }, 4800);
}

function onGetStarted() {
  var s = document.getElementById('splash');
  s.style.transition = 'opacity 0.5s';
  s.style.opacity = '0';
  setTimeout(function(){
    s.style.display = 'none';
    document.getElementById('onboarding').style.display = 'flex';
    userData = {onbStep:0, firstName:'', lastName:'', email:'', country:'', state:'', city:'', parish:'', frequency:'', userType:[], interests:[], morningTime:'07:00', eveningTime:'20:00', familyData:{}, ambassadorData:{}};
    renderOnboardingStep();
  }, 500);
}
