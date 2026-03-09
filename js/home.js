// ===== RENDER HOME (Redesigned: 7 sections, 2-screen rule) =====
function renderHome() {
  personalizeApp();
  var u = userData || {greeting:'Good Morning',cityDisplay:'',initials:'FR',firstName:'Friend'};
  var html = '';

  // === 1. HEADER (compact) ===
  html += renderHomeHeader(u);

  // === 2. FAMILY PRAYER ROOM CARD ===
  html += renderFamilyRoomCard(u);

  // === 3. LIVE NOW CARD (conditional — only shows if live/starting) ===
  html += '<div id="liveCardSlot"></div>';

  // === 4. HABITS RINGS (Whoop-style 3-ring summary) ===
  html += renderHabitsRings();

  // === 5. TODAY'S REFLECTION (async) ===
  html += '<div id="reflectionSlot"></div>';

  // === 6. PRIMARY PRAYER CARDS (top 3 only) ===
  html += renderPrimaryPrayerCards();

  // === 7. PRAYER WALL (horizontal, compact cards) ===
  html += '<div id="prayerWallSlot"></div>';

  // === 8. GLOBAL COUNTER (clean, bottom — links to worldatprayer.org) ===
  html += renderGlobalCounterClean();

  document.getElementById('screenHome').innerHTML = html;

  // Async sections
  renderLiveCardAsync();
  renderReflectionAsync();
  renderPrayerWallHorizontal();
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

// ===== 3. LIVE NOW CARD (conditional) =====
function renderLiveCardAsync() {
  var slot = document.getElementById('liveCardSlot');
  if (!slot) return;
  if (liveStreamData && liveStreamData.isLive) {
    slot.innerHTML = '<div class="live-card is-live" onclick="openLiveStream()">' +
      '<div class="live-card__icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><circle cx="12" cy="12" r="3"/><path d="M6.34 17.66A8 8 0 014 12a8 8 0 012.34-5.66l1.42 1.42A6 6 0 006 12a6 6 0 001.76 4.24zM17.66 6.34A8 8 0 0120 12a8 8 0 01-2.34 5.66l-1.42-1.42A6 6 0 0018 12a6 6 0 00-1.76-4.24z"/></svg></div>' +
      '<div class="live-card__body">' +
      '<div class="live-card__badge"><span class="live-pulse"></span> LIVE NOW</div>' +
      '<div class="live-card__title">' + escapeHtml(liveStreamData.title || 'Holy Rosary from the Chapel') + '</div>' +
      '<div class="live-card__action">Join Live \u203A</div>' +
      '</div></div>';
  } else {
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
    }
  }
}

function openLiveStream() {
  showSubPage('live-stream', 'Live from the Chapel');
}

// ===== 4. HABITS RINGS (Whoop-style 3-ring summary) =====
function renderHabitsRings() {
  var prayerPct = getPrayerCategoryPct('prayer');
  var famPct = getPrayerCategoryPct('family');
  var wellPct = getPrayerCategoryPct('wellness');
  var doneH = habits.filter(function(h){return h.done}).length;
  var totalH = habits.length;
  var overallPct = totalH > 0 ? Math.round(doneH/totalH*100) : 0;
  // Ring math: r=20 → circumference=125.66; r=16→100.53; r=12→75.40
  var c1 = 125.66, c2 = 100.53, c3 = 75.40;

  var html = '<div class="habits-rings-home" onclick="showScreen(\'habits\')">';
  html += '<div class="hr-visual">';
  // SVG with 3 concentric rings
  html += '<svg class="hr-svg" viewBox="0 0 56 56">';
  // Outer ring - Family (coral)
  html += '<circle cx="28" cy="28" r="20" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="4.5"/>';
  html += '<circle class="ring-anim" cx="28" cy="28" r="20" fill="none" stroke="var(--coral)" stroke-width="4.5" stroke-dasharray="' + Math.round(c1*famPct/100) + ' ' + c1 + '" stroke-linecap="round" transform="rotate(-90 28 28)"/>';
  // Middle ring - Wellness (teal)
  html += '<circle cx="28" cy="28" r="16" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="4.5"/>';
  html += '<circle class="ring-anim" cx="28" cy="28" r="16" fill="none" stroke="var(--teal)" stroke-width="4.5" stroke-dasharray="' + Math.round(c2*wellPct/100) + ' ' + c2 + '" stroke-linecap="round" transform="rotate(-90 28 28)"/>';
  // Inner ring - Prayer (navy)
  html += '<circle cx="28" cy="28" r="12" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="4.5"/>';
  html += '<circle class="ring-anim" cx="28" cy="28" r="12" fill="none" stroke="var(--color-primary)" stroke-width="4.5" stroke-dasharray="' + Math.round(c3*prayerPct/100) + ' ' + c3 + '" stroke-linecap="round" transform="rotate(-90 28 28)"/>';
  html += '</svg>';
  // Center percentage
  html += '<div class="hr-center"><span class="hr-pct-num">' + overallPct + '</span><span class="hr-pct-sign">%</span></div>';
  html += '</div>';
  // Right side - legend + stats
  html += '<div class="hr-details">';
  html += '<div class="hr-title">Today\'s Progress</div>';
  html += '<div class="hr-legend">' +
    '<div class="hr-leg-item"><span class="hr-dot" style="background:var(--color-primary)"></span>Prayer <strong>' + prayerPct + '%</strong></div>' +
    '<div class="hr-leg-item"><span class="hr-dot" style="background:var(--teal)"></span>Wellness <strong>' + wellPct + '%</strong></div>' +
    '<div class="hr-leg-item"><span class="hr-dot" style="background:var(--coral)"></span>Family <strong>' + famPct + '%</strong></div>' +
    '</div>';
  html += '<div class="hr-meta">' + doneH + '/' + totalH + ' habits \u00B7 <span style="color:var(--color-accent);font-weight:600">View All \u203A</span></div>';
  html += '</div>';
  html += '</div>';
  return html;
}

// ===== 5. TODAY'S REFLECTION (async) =====
function renderReflectionAsync() {
  var slot = document.getElementById('reflectionSlot');
  if (!slot) return;
  getTodaysReflection().then(function(r) {
    if (r) {
      slot.innerHTML = renderReflectionCardFromData(r);
    } else {
      slot.innerHTML = renderFallbackVotd();
    }
  });
}

function renderReflectionCardFromData(r) {
  var season = (r.liturgicalSeason || 'ordinary').toUpperCase();
  var scripture = r.scripture || {};
  var text = scripture.text || scripture.fullText || '';
  var ref = scripture.displayRef || scripture.reference || '';
  return '<div class="reflection-card" onclick="openDailyReflection()">' +
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

function openDailyReflection() {
  showSubPage('daily-reflection', 'Today\'s Reflection');
}

// ===== 6. PRIMARY PRAYER CARDS (top 3 only) =====
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

// ===== 7. PRAYER WALL (horizontal compact cards) =====
// Pool of all available prayers for cycling
var _prayerWallPool = [];
var _prayerWallShown = [];

function renderPrayerWallHorizontal() {
  var slot = document.getElementById('prayerWallSlot');
  if (!slot) return;
  loadPrayerIntentions(9).then(function(items) {
    if (items.length === 0) {
      items = getSeedPrayerData();
    }
    _prayerWallPool = items.slice(3);
    _prayerWallShown = items.slice(0, 3);
    renderPrayerWallCards(slot);
  });
}

function getSeedPrayerData() {
  var seeds = (circleWalls['daily-rosary'] || []).slice(0, 9);
  return seeds.map(function(s, i) {
    return {
      id: 'seed-' + i,
      data: {
        authorName: s.name,
        authorInitials: s.initials,
        authorColor: s.color,
        text: s.text,
        prayerCount: s.count,
        createdAt: null
      }
    };
  });
}

function renderPrayerWallCards(slot) {
  var html = '<div class="pw-h-section">';
  html += '<div class="pw-h-header">' +
    '<div class="section-title-inline"><svg viewBox="0 0 24 24" width="16" height="16" fill="var(--color-accent)"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Prayer Wall</div>' +
    '<button class="pw-h-see-all" onclick="showInAppBrowser(\'World at Prayer\',\'https://worldatprayer.org/\')">See All \u203A</button>' +
    '</div>';
  html += '<div class="pw-h-scroll" id="prayerWallScroll">';
  _prayerWallShown.forEach(function(item, i) {
    html += renderPWHCard(item, i);
  });
  html += '</div>';
  // Chapel micro-banner
  html += '<div class="pw-h-chapel">' +
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-accent)" stroke-width="1.5"><path d="M12 2v3M10 4h4"/><path d="M6 10l6-5 6 5"/><rect x="6" y="10" width="12" height="12"/></svg>' +
    ' <span>Your intentions are prayed for at the Father Peyton Center chapel</span></div>';
  html += '</div>';
  slot.innerHTML = html;
}

function renderPWHCard(item, idx) {
  var d = item.data;
  var prayed = localStorage.getItem('prayed_intention_' + item.id);
  var name = (d.authorName || 'Anonymous');
  if (name.length > 14) name = name.split(' ')[0] + ' ' + (name.split(' ')[1] || '').charAt(0) + '.';
  var textTrunc = (d.text || '').substring(0, 80) + ((d.text || '').length > 80 ? '...' : '');
  return '<div class="pw-h-card' + (prayed ? ' prayed' : '') + '" id="pwCard' + idx + '">' +
    '<div class="pw-h-top">' +
    '<div class="pw-h-av" style="background:' + (d.authorColor || '#1B3A5C') + '">' + (d.authorInitials || '?') + '</div>' +
    '<span class="pw-h-name">' + escapeHtml(name) + '</span></div>' +
    '<div class="pw-h-text">' + escapeHtml(textTrunc) + '</div>' +
    '<button class="pw-h-pray-btn' + (prayed ? ' prayed' : '') + '" onclick="event.stopPropagation();prayAndCycle(' + idx + ',\'' + item.id + '\',this)">' +
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
    ' <span class="pw-h-count">' + (d.prayerCount || 0) + '</span> Pray</button></div>';
}

function prayAndCycle(idx, intentionId, btn) {
  // Increment prayer
  if (intentionId.indexOf('seed-') === 0) {
    prayForIntention('daily-rosary', parseInt(intentionId.replace('seed-', '')), btn);
  } else {
    prayForIntentionGlobal(intentionId, btn);
  }
  localStorage.setItem('prayed_intention_' + intentionId, '1');

  // Animate card out
  var card = document.getElementById('pwCard' + idx);
  if (!card) return;
  card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.85) translateY(-8px)';

  setTimeout(function() {
    // Replace with next from pool
    if (_prayerWallPool.length > 0) {
      var next = _prayerWallPool.shift();
      _prayerWallShown[idx] = next;
      card.outerHTML = renderPWHCard(next, idx);
      // Animate in
      var newCard = document.getElementById('pwCard' + idx);
      if (newCard) {
        newCard.style.opacity = '0';
        newCard.style.transform = 'scale(0.9) translateY(8px)';
        requestAnimationFrame(function() {
          newCard.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          newCard.style.opacity = '1';
          newCard.style.transform = 'scale(1) translateY(0)';
        });
      }
    } else {
      // No more prayers — show thank you
      card.outerHTML = '<div class="pw-h-card pw-h-thankyou" id="pwCard' + idx + '">' +
        '<div class="pw-h-ty-icon">\u2764\uFE0F</div>' +
        '<div class="pw-h-ty-text">Thank you for praying</div></div>';
    }
  }, 350);
}

// ===== 8. GLOBAL COUNTER (clean, premium, bottom) =====
function renderGlobalCounterClean() {
  var total = globalPrayerCount || (worldAtPrayerCount + appPrayerCount) || 2738160;
  return '<div class="gc-clean" onclick="showInAppBrowser(\'World at Prayer\',\'https://worldatprayer.org/\')">' +
    '<div class="gc-clean__inner">' +
    '<div class="gc-clean__count" id="globalCounterNum" data-target="' + total + '">0</div>' +
    '<div class="gc-clean__label">prayers offered worldwide</div>' +
    '<div class="gc-clean__link">View on World at Prayer \u203A</div>' +
    '</div></div>';
}

// Keep old function name for setupCounterObserver compatibility
function renderGlobalCounter() { return ''; }

// Time ago helper
function timeAgo(timestamp) {
  if (!timestamp) return '';
  var date;
  if (timestamp.toDate) date = timestamp.toDate();
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
  setTimeout(function(){ logo.style.opacity='0'; globe.style.opacity='1'; }, 500);
  setTimeout(function(){ globe.style.opacity='0'; logo.style.opacity='1'; logo.classList.remove('spinning'); logo.classList.add('spin-slow'); }, 1750);
  setTimeout(function(){ title.style.opacity='1'; }, 2000);
  setTimeout(function(){ tag.style.opacity='1'; }, 2250);
  setTimeout(function(){ if(hint) hint.style.opacity='1'; }, 2500);
  setTimeout(function(){ onGetStarted(); }, 3000);
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
