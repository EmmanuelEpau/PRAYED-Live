// ===== RENDER HOME =====
function renderHome() {
  personalizeApp();
  var u = userData || {greeting:'Good Morning',cityDisplay:'',initials:'FR',firstName:'Friend'};
  var html = '';

  // === HEADER ===
  html += '<div class="app-header"><div class="header-left">' +
    '<img src="'+imgMap['hcfm_logo_blue']+'" alt="HCFM" style="width:48px;height:48px;object-fit:contain">' +
    '<div class="greeting">' + (u.greeting||'Good Morning') + ', ' + (u.firstName||'Friend') +
    '<small>' + t('ui.tagline') + '</small></div>' +
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
    '<div class="frc-bg-glow"></div>' +
    '<div class="frc-content">' +
    '<div class="family-room-card__header">' +
    '<div class="family-room-card__title">' +
    '<div class="frc-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="2.5"/><path d="M7.5 20c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5"/><circle cx="5" cy="7" r="2"/><path d="M1.5 16c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4"/><circle cx="19" cy="7" r="2"/><path d="M15.5 16c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4"/></svg></div>' +
    '<div><h3>' + escapeHtml(familyName) + '</h3>' +
    '<span class="frc-subtitle">' + t('ui.family_room') + '</span></div></div>' +
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
    html += '<p class="family-room-card__status" style="color:rgba(255,255,255,0.5)">' + t('ui.no_one_online') + '</p>';
  }

  html += '<button class="family-room-card__join" onclick="event.stopPropagation();openPrayerRoomUI()">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
    ' ' + t('ui.enter_prayer_room') + '</button>';

  // Last prayer together
  var lastPrayer = getLastFamilyPrayer();
  if(lastPrayer) {
    html += '<p class="family-room-card__last">Last prayer together: ' + lastPrayer + '</p>';
  }
  html += '</div></div>';

  // === QUICK HABITS ROW ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' +
    ' ' + t('ui.todays_habits') + '</div>';
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
    '<span>' + doneH + '/' + habits.length + ' ' + t('ui.completed') + '</span>' +
    '<button onclick="showSubPage(\'my-habits\',\'' + t('ui.my_habits') + '\')">' + t('ui.view_all') + ' \u203A</button></div>';

  // === MIDDLE: TODAY'S PRAYER SUGGESTIONS ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
    ' ' + t('ui.todays_prayers') + '</div>';

  // Primary prayer cards (large)
  var primaryPrayers = [
    {key:'rosary_stock',name:'Daily Rosary',page:'rosary',desc:'Pray with families worldwide'},
    {key:'mass_01',name:'Daily Mass',page:'mass',desc:'Today\'s readings & celebration'},
    {key:'family_table_prayer',name:'Family Prayers',page:'family-prayers',desc:'Grace, bedtime & more'}
  ];
  html += '<div class="prayer-cards-primary">';
  primaryPrayers.forEach(function(c) {
    html += '<div class="prayer-card-lg" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'" loading="lazy">' +
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
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'" loading="lazy">' +
      '<div class="prayer-card-sm__overlay"><h3>'+c.name+'</h3></div></div>';
  });
  html += '</div>';

  // === DAILY GOSPEL REFLECTION (Spec 0C) ===
  var votd = getVerseOfTheDay();
  var seasonLabel = votd.season ? votd.season.toUpperCase() : 'DAILY GOSPEL';
  html += '<div class="reflection-card">' +
    '<div class="season-label">' + seasonLabel + '</div>' +
    '<div class="gospel-text">\u201c' + escapeHtml(votd.text) + '\u201d</div>' +
    '<div class="gospel-ref">\u2014 ' + votd.ref + (votd.season ? ' (Mass Reading)' : '') + '</div>' +
    '<div class="reflection-actions">' +
    '<button class="btn-ponder" onclick="openVotdChapter()">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg> Ponder</button>' +
    '<button class="btn-pray-together" onclick="openPrayerRoomUI()">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Pray Together</button>' +
    '</div></div>';

  // === LENT BANNER (seasonal) ===
  html += '<div class="lent-banner" onclick="showSubPage(\'challenge\',\'Lent Prayer Challenge\')">' +
    '<div class="lent-banner__icon"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#fff"/></svg></div>' +
    '<div class="lent-banner__text"><h3>' + t('ui.lent_challenge') + '</h3><p>Join families in 40 days of prayer together</p></div></div>';

  // === BOTTOM: CIRCLE ACTIVITY FEED ===
  html += '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' ' + t('ui.circle_activity') + '</div>';
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

  // === GLOBAL PRAYER COUNTER ===
  html += '<div class="global-counter">' +
    '<div class="counter-number" id="globalCounterNum">' + (globalPrayerCount || 0).toLocaleString() + '</div>' +
    '<div class="counter-label">prayers offered worldwide</div>' +
    '<div class="counter-subtitle gold-shimmer">' + t('ui.a_world_at_prayer') + '</div>' +
    '</div>';

  // === WORLD MAP (compact) ===
  html += '<div class="world-section" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')">' +
    '<h3>' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' ' + t('ui.a_world_at_prayer') + '</h3>' +
    '<p>PRAYED families in ' + countryCount + ' ' + t('ui.countries_connected') + '</p></div>';

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
  var u = userData || {};
  var members = [];
  // Add current user first
  members.push({
    firstName: u.firstName || 'You',
    initials: (u.initials || (u.firstName ? u.firstName.charAt(0) + (u.lastName ? u.lastName.charAt(0) : '') : 'ME')),
    color: 'var(--color-primary)',
    online: true
  });
  // Add family members from userData
  if(u.familyMembers && u.familyMembers.length > 0) {
    var memberColors = ['#7C3AED','#0D9488','#C68A2E','#E74C8B','#3B82F6'];
    u.familyMembers.forEach(function(m, i) {
      members.push({
        firstName: m.firstName || 'Member',
        initials: (m.firstName ? m.firstName.charAt(0) : '?') + (m.lastName ? m.lastName.charAt(0) : ''),
        color: memberColors[i % memberColors.length],
        online: !!m.online
      });
    });
  }
  return members;
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
  var hint = document.getElementById('splashHint');
  logo.classList.add('spinning');
  setTimeout(function(){ logo.style.opacity='0'; globe.style.opacity='1'; }, 1000);
  setTimeout(function(){ globe.style.opacity='0'; logo.style.opacity='1'; logo.classList.remove('spinning'); logo.classList.add('spin-slow'); }, 3500);
  setTimeout(function(){ title.style.opacity='1'; }, 4000);
  setTimeout(function(){ tag.style.opacity='1'; }, 4500);
  setTimeout(function(){ if(hint) hint.style.opacity='1'; }, 5000);
  // Auto-transition after 6 seconds
  setTimeout(function(){ onGetStarted(); }, 6000);
}

var splashDismissed = false;
function onGetStarted() {
  if (splashDismissed) return;
  splashDismissed = true;
  var s = document.getElementById('splash');
  if (!s || s.style.display === 'none') return;
  s.style.transition = 'opacity 0.5s';
  s.style.opacity = '0';
  setTimeout(function(){
    s.style.display = 'none';
    document.getElementById('onboarding').style.display = 'flex';
    onbStep = 0;
    userData = {firstName:'', lastName:'', email:'', country:'', state:'', city:'', userType:'', language:'', prayerTimes:[], interests:[], morningTime:'07:00', eveningTime:'20:00', habits:habits};
    renderOnboardingStep();
  }, 500);
}
