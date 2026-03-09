// ===== RENDER HOME (Spec 0G: 3-screen rule, 10 sections) =====
function renderHome() {
  personalizeApp();
  var u = userData || {greeting:'Good Morning',cityDisplay:'',initials:'FR',firstName:'Friend'};
  var html = '';

  // === 1. HEADER ===
  html += renderHomeHeader(u);

  // === 2. FAMILY PRAYER ROOM CARD ===
  html += renderFamilyRoomCard(u);

  // === 3. LIVE NOW CARD (conditional — rendered async below) ===
  html += '<div id="liveCardSlot"></div>';

  // === 4. QUICK HABITS ROW ===
  html += renderQuickHabitsRow();

  // === 5. TODAY'S REFLECTION CARD (async — rendered into slot) ===
  html += '<div id="reflectionSlot"></div>';

  // === 6. TODAY'S PRAYERS ===
  html += renderPrimaryPrayerCards();
  html += renderSecondaryPrayerGrid();

  // === 7. GLOBAL PRAYER COUNTER ===
  html += renderGlobalCounter();

  // === 8. SEASONAL BANNER (conditional) ===
  html += renderSeasonalBanner();

  // === 9. PRAYER WALL PREVIEW (3 recent intentions) ===
  html += '<div id="prayerWallSlot"></div>';

  // === 10. CIRCLE ACTIVITY + FR. PEYTON QUOTE + WORLD MAP ===
  html += renderCircleActivity(3);
  html += renderPeytonQuote();
  html += renderWorldMap();

  document.getElementById('screenHome').innerHTML = html;

  // Async sections: load Firestore data and render into slots
  renderLiveCardAsync();
  renderReflectionAsync();
  renderPrayerWallPreview();
  // Set up counter animation observer
  setupCounterObserver();
}

// ===== 1. HEADER =====
function renderHomeHeader(u) {
  return '<div class="app-header"><div class="header-left">' +
    '<img src="'+imgMap['hcfm_logo_blue']+'" alt="HCFM" style="width:48px;height:48px;object-fit:contain">' +
    '<div class="greeting">' + (u.greeting||'Good Morning') + ', ' + (u.firstName||'Friend') +
    '<small>' + t('ui.tagline') + '</small></div>' +
    '</div>' +
    '<div class="header-right"><button class="notif-btn" onclick="showSubPage(\'notifications\',\'Notifications\')">' +
    svgIcons.bell + '<div class="notif-badge">2</div></button>' +
    '<div class="avatar" onclick="showScreen(\'profile\')">'+(u.initials||'FR')+'</div></div></div>';
}

// ===== 2. FAMILY PRAYER ROOM CARD =====
function renderFamilyRoomCard(u) {
  var familyName = (u.lastName ? u.lastName + ' Family' : 'Your Family');
  var familyStreak = getFamilyStreak();
  var familyMembers = getFamilyMembers();
  var onlineMembers = familyMembers.filter(function(m) { return m.online; });
  var html = '<div class="family-room-card" onclick="openPrayerRoomUI()">' +
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
  var lastPrayer = getLastFamilyPrayer();
  if(lastPrayer) {
    html += '<p class="family-room-card__last">Last prayer together: ' + lastPrayer + '</p>';
  }
  html += '</div></div>';
  return html;
}

// ===== 3. LIVE NOW CARD (Spec 0F) =====
function renderLiveCardAsync() {
  var slot = document.getElementById('liveCardSlot');
  if (!slot) return;
  // Check Firestore live stream status
  if (liveStreamData && liveStreamData.isLive) {
    slot.innerHTML = '<div class="live-card is-live" onclick="openLiveStream()">' +
      '<div class="live-card__icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><circle cx="12" cy="12" r="3"/><path d="M6.34 17.66A8 8 0 014 12a8 8 0 012.34-5.66l1.42 1.42A6 6 0 006 12a6 6 0 001.76 4.24zM17.66 6.34A8 8 0 0120 12a8 8 0 01-2.34 5.66l-1.42-1.42A6 6 0 0018 12a6 6 0 00-1.76-4.24z"/></svg></div>' +
      '<div class="live-card__body">' +
      '<div class="live-card__badge"><span class="live-pulse"></span> LIVE NOW</div>' +
      '<div class="live-card__title">' + escapeHtml(liveStreamData.title || 'Holy Rosary from the Chapel') + '</div>' +
      '<div class="live-card__action">Join Live \u203A</div>' +
      '</div></div>';
  } else {
    // Check schedule for "STARTING SOON"
    var sched = getLiveStreamSchedule();
    if (sched) {
      var now = new Date();
      var minutesUntil = Math.floor((sched.rosaryStart - now) / 60000);
      if (minutesUntil > 0 && minutesUntil <= 15) {
        slot.innerHTML = '<div class="live-card upcoming" onclick="openLiveStream()">' +
          '<div class="live-card__icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="var(--color-accent)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div>' +
          '<div class="live-card__body">' +
          '<div class="live-card__badge upcoming-badge">STARTING SOON</div>' +
          '<div class="live-card__title">Daily Rosary & Mass</div>' +
          '<div class="live-card__action">Starts in ' + minutesUntil + ' min \u203A</div>' +
          '</div></div>';
      }
      // else: don't show anything
    }
  }
}

function openLiveStream() {
  showSubPage('live-stream', 'Live from the Chapel');
}

// ===== 4. QUICK HABITS ROW =====
function renderQuickHabitsRow() {
  var html = '<div class="section-title">' +
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
  return html;
}

// ===== 5. TODAY'S REFLECTION CARD (Spec 0C) =====
function renderReflectionAsync() {
  var slot = document.getElementById('reflectionSlot');
  if (!slot) return;
  getTodaysReflection().then(function(r) {
    if (r) {
      slot.innerHTML = renderReflectionCardFromData(r);
    } else {
      // Fallback to Verse of the Day
      slot.innerHTML = renderFallbackVotd();
    }
  });
}

function renderReflectionCardFromData(r) {
  var season = (r.liturgicalSeason || 'ordinary').toUpperCase();
  var scripture = r.scripture || {};
  var text = scripture.text || scripture.fullText || '';
  var ref = scripture.displayRef || scripture.reference || '';
  var title = (r.reflection && r.reflection.title) || 'Today\'s Gospel';
  // Step indicators
  var html = '<div class="reflection-card" onclick="openDailyReflection()">' +
    '<div class="season-label">' + season + '</div>' +
    '<div class="reflection-card__header">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg>' +
    ' TODAY\'S GOSPEL</div>' +
    '<div class="gospel-text">\u201c' + escapeHtml(text.substring(0, 200)) + (text.length > 200 ? '...' : '') + '\u201d</div>' +
    '<div class="gospel-ref">\u2014 ' + escapeHtml(ref) + '</div>' +
    '<div class="reflection-card__steps">' +
    '<div class="reflection-step"><span class="step-num">1</span> Ponder</div>' +
    '<div class="reflection-step"><span class="step-num">2</span> Pray</div>' +
    '<div class="reflection-step"><span class="step-num">3</span> Pray Together</div>' +
    '</div>' +
    '<div class="reflection-card__cta">Open Today\'s Reflection \u203A</div>' +
    '</div>';
  return html;
}

function renderFallbackVotd() {
  var votd = getVerseOfTheDay();
  var seasonLabel = votd.season ? votd.season.toUpperCase() : 'DAILY GOSPEL';
  return '<div class="reflection-card">' +
    '<div class="season-label">' + seasonLabel + '</div>' +
    '<div class="gospel-text">\u201c' + escapeHtml(votd.text) + '\u201d</div>' +
    '<div class="gospel-ref">\u2014 ' + votd.ref + (votd.season ? ' (Mass Reading)' : '') + '</div>' +
    '<div class="reflection-actions">' +
    '<button class="btn-ponder" onclick="event.stopPropagation();openVotdChapter()">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"/></svg> Ponder</button>' +
    '<button class="btn-pray-together" onclick="event.stopPropagation();openPrayerRoomUI()">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Pray Together</button>' +
    '</div></div>';
}

// Full Daily Reflection sub-page
function openDailyReflection() {
  showSubPage('daily-reflection', 'Today\'s Reflection');
}

// ===== 6. TODAY'S PRAYERS =====
function renderPrimaryPrayerCards() {
  var html = '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
    ' ' + t('ui.todays_prayers') + '</div>';
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
  return html;
}

function renderSecondaryPrayerGrid() {
  var secondaryPrayers = [
    {key:'stained_glass',name:'Adoration',page:'adoration'},
    {key:'prayer_stock1',name:'Reflections',page:'reflections'},
    {key:'church_interior',name:'Gospel',page:'gospel-today'},
    {key:'prayer_stock3',name:'Night Prayer',page:'compline'}
  ];
  var html = '<div class="prayer-grid-secondary">';
  secondaryPrayers.forEach(function(c) {
    html += '<div class="prayer-card-sm" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'" loading="lazy">' +
      '<div class="prayer-card-sm__overlay"><h3>'+c.name+'</h3></div></div>';
  });
  html += '</div>';
  return html;
}

// ===== 7. GLOBAL PRAYER COUNTER (Spec 0H) =====
function renderGlobalCounter() {
  var total = globalPrayerCount || (worldAtPrayerCount + appPrayerCount) || 2738160;
  return '<div class="global-counter" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')">' +
    '<div class="global-counter__live-badge"><span class="gc-live-dot"></span> LIVE</div>' +
    '<div class="counter-number" id="globalCounterNum" data-target="' + total + '">0</div>' +
    '<div class="counter-label">prayers offered worldwide</div>' +
    '<div class="counter-breakdown" id="counterBreakdown">' +
      (worldAtPrayerCount > 0 ? worldAtPrayerCount.toLocaleString() + ' via World at Prayer' : '') +
      (appPrayerCount > 0 ? ' + ' + appPrayerCount.toLocaleString() + ' via PRAYED app' : '') +
    '</div>' +
    '<div class="counter-subtitle gold-shimmer">' + t('ui.a_world_at_prayer') + '</div>' +
    '</div>';
}

// ===== 8. SEASONAL BANNER =====
function renderSeasonalBanner() {
  var now = new Date();
  var month = now.getMonth(); // 0-indexed
  // Lent: roughly Feb-April (varies), October: Month of the Rosary
  // Simple check: show Lent banner during Feb(1), Mar(2), Apr(3); Rosary banner during Oct(9)
  if (month >= 1 && month <= 3) {
    return '<div class="lent-banner" onclick="showSubPage(\'challenge\',\'Lent Prayer Challenge\')">' +
      '<div class="lent-banner__icon"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#fff"/></svg></div>' +
      '<div class="lent-banner__text"><h3>' + t('ui.lent_challenge') + '</h3><p>Join families in 40 days of prayer together</p></div></div>';
  } else if (month === 9) {
    return '<div class="lent-banner" style="background:linear-gradient(135deg,#C68A2E,#A06E1A)" onclick="showSubPage(\'challenge\',\'Month of the Rosary\')">' +
      '<div class="lent-banner__icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.5"><circle cx="12" cy="9" r="6"/><path d="M12 15v3"/><path d="M10.5 19.5h3L12 22l-1.5-2.5z"/></svg></div>' +
      '<div class="lent-banner__text"><h3>Month of the Rosary</h3><p>October: Pray the Rosary daily with your family</p></div></div>';
  }
  return '';
}

// ===== 9. PRAYER WALL PREVIEW (3 recent intentions) =====
function renderPrayerWallPreview() {
  var slot = document.getElementById('prayerWallSlot');
  if (!slot) return;
  loadPrayerIntentions(3).then(function(items) {
    if (items.length === 0) {
      // Show seed data from circleWalls
      slot.innerHTML = renderSeedPrayerWall();
      return;
    }
    var html = '<div class="section-title">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
      ' Prayer Wall</div>';
    // Chapel banner
    html += renderChapelBanner();
    html += '<div class="prayer-wall-list">';
    items.forEach(function(item) {
      html += renderPrayerWallItem(item);
    });
    html += '</div>';
    html += '<button class="btn-sacred-outline" style="width:100%;margin:12px 16px" onclick="showSubPage(\'prayer-wall\',\'Prayer Wall\')">View All Intentions \u203A</button>';
    slot.innerHTML = html;
  });
}

function renderSeedPrayerWall() {
  var seeds = (circleWalls['daily-rosary'] || []).slice(0, 3);
  if (seeds.length === 0) return '';
  var html = '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
    ' Prayer Wall</div>';
  html += renderChapelBanner();
  html += '<div class="prayer-wall-list">';
  seeds.forEach(function(s, i) {
    html += '<div class="prayer-wall-item">' +
      '<div class="pw-header">' +
      '<div class="pw-av" style="background:' + s.color + '">' + s.initials + '</div>' +
      '<div class="pw-meta-wrap"><div class="pw-name">' + s.name + ' <span class="flag">' + flagSVG(s.flag) + '</span></div>' +
      '<div class="pw-meta">' + s.time + '</div></div></div>' +
      '<div class="pw-text">' + escapeHtml(s.text) + '</div>' +
      '<div class="pw-actions">' +
      '<button class="pw-pray-btn" onclick="event.stopPropagation();prayForIntention(\'daily-rosary\',' + i + ',this)">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
      '<span class="pw-count">' + s.count + '</span>' +
      '<span class="pw-cta">PRAY WITH US</span></button>' +
      '</div></div>';
  });
  html += '</div>';
  return html;
}

function renderChapelBanner() {
  return '<div class="chapel-banner" style="margin:0 16px 12px">' +
    '<div class="chapel-banner__icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"><path d="M12 2v3M10 4h4"/><path d="M6 10l6-5 6 5"/><rect x="6" y="10" width="12" height="12"/><path d="M10 22v-4a2 2 0 014 0v4"/></svg></div>' +
    '<div class="chapel-banner__text">' +
    '<strong>We bring your intention to our chapel.</strong>' +
    '<span>Weekdays 11:30 AM ET \u2014 Rosary & Mass at the Father Peyton Center</span>' +
    '</div></div>';
}

function renderPrayerWallItem(item) {
  var d = item.data;
  var prayed = localStorage.getItem('prayed_intention_' + item.id);
  return '<div class="prayer-wall-item">' +
    '<div class="pw-header">' +
    '<div class="pw-av" style="background:' + (d.authorColor || '#1B3A5C') + '">' + (d.authorInitials || '?') + '</div>' +
    '<div class="pw-meta-wrap"><div class="pw-name">' + escapeHtml(d.authorName || 'Anonymous') + '</div>' +
    '<div class="pw-meta">' + timeAgo(d.createdAt) + '</div></div></div>' +
    '<div class="pw-text">' + escapeHtml(d.text) + '</div>' +
    '<div class="pw-actions">' +
    '<button class="pw-pray-btn' + (prayed ? ' prayed' : '') + '" onclick="event.stopPropagation();prayForIntentionGlobal(\'' + item.id + '\',this)">' +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
    '<span class="pw-count">' + (d.prayerCount || 0) + '</span>' +
    '<span class="pw-cta">PRAY WITH US</span></button>' +
    '</div></div>';
}

// Time ago helper
function timeAgo(timestamp) {
  if (!timestamp) return '';
  var date;
  if (timestamp.toDate) date = timestamp.toDate(); // Firestore Timestamp
  else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
  else date = new Date(timestamp);
  var now = new Date();
  var diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return date.toLocaleDateString();
}

// ===== 10. CIRCLE ACTIVITY + PEYTON QUOTE + WORLD MAP =====
function renderCircleActivity(limit) {
  var html = '<div class="section-title">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' ' + t('ui.circle_activity') + '</div>';
  html += '<div class="activity-feed">';
  var items = (feedUsers || []).slice(0, limit || 3);
  items.forEach(function(f){
    html += '<div class="feed-item" onclick="showSubPage(\'circle-detail-daily-rosary\',\'Daily Rosary\')">' +
      '<div class="av" style="background:'+f.color+'">'+f.initials+'</div><div class="fi-body">' +
      '<div class="fi-name">'+f.name+' <span class="flag">'+flagSVG(f.flag)+'</span></div>' +
      '<div class="fi-text">'+f.action+'</div><div class="fi-time">'+f.time+'</div></div></div>';
  });
  html += '</div>';
  return html;
}

function renderPeytonQuote() {
  var dayIndex = new Date().getDate() % peytonQuotes.length;
  var quote = peytonQuotes[dayIndex];
  return '<div class="quote-card" onclick="showSubPage(\'fr-peyton\',\'Fr. Patrick Peyton\')">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-accent)"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>' +
    '<blockquote class="crimson">\u201c' + quote + '\u201d</blockquote>' +
    '<cite>\u2014 Fr. Patrick Peyton, C.S.C.</cite></div>';
}

function renderWorldMap() {
  return '<div class="world-section" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')">' +
    '<h3>' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
    ' ' + t('ui.a_world_at_prayer') + '</h3>' +
    '<p>PRAYED families in ' + countryCount + ' ' + t('ui.countries_connected') + '</p></div>';
}

// ===== HELPER FUNCTIONS =====
function getFamilyStreak() {
  try {
    var streak = localStorage.getItem('prayedFamilyStreak');
    return streak ? parseInt(streak) : 0;
  } catch(e) { return 0; }
}

function getFamilyMembers() {
  var u = userData || {};
  var members = [];
  members.push({
    firstName: u.firstName || 'You',
    initials: (u.initials || (u.firstName ? u.firstName.charAt(0) + (u.lastName ? u.lastName.charAt(0) : '') : 'ME')),
    color: 'var(--color-primary)',
    online: true
  });
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
      if(diffDays === 0) return 'Today at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      else if(diffDays === 1) return 'Yesterday at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      else return diffDays + ' days ago';
    }
  } catch(e) {}
  return null;
}

// ===== SPLASH ANIMATION =====
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
