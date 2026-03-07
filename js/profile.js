// ===== PROFILE STAT TRACKING =====
function getPrayerCount() {
  try {
    var count = localStorage.getItem('prayedPrayerCount');
    return count ? parseInt(count) : 0;
  } catch(e) { return 0; }
}

function getPersonalStreak() {
  try {
    var streak = localStorage.getItem('prayedStreak');
    return streak ? parseInt(streak) : 0;
  } catch(e) { return 0; }
}

function incrementPrayerCount() {
  try {
    var count = getPrayerCount() + 1;
    localStorage.setItem('prayedPrayerCount', count);
    // Sync to Firestore
    if(currentUser && db) {
      db.collection('users').doc(currentUser.uid).set({
        prayerCount: count,
        lastPrayerAt: firebase.firestore.FieldValue.serverTimestamp()
      }, {merge: true});
    }
    return count;
  } catch(e) { return getPrayerCount(); }
}

function updateStreak() {
  try {
    var todayStr = new Date().toISOString().slice(0, 10);
    var lastPrayerDate = localStorage.getItem('prayedLastPrayerDate');
    var currentStreak = getPersonalStreak();

    if(lastPrayerDate === todayStr) {
      // Already prayed today, no streak change
      return currentStreak;
    }

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayStr = yesterday.toISOString().slice(0, 10);

    if(lastPrayerDate === yesterdayStr) {
      // Consecutive day - increment streak
      currentStreak++;
    } else if(lastPrayerDate !== todayStr) {
      // Streak broken - reset to 1
      currentStreak = 1;
    }

    localStorage.setItem('prayedStreak', currentStreak);
    localStorage.setItem('prayedLastPrayerDate', todayStr);

    // Sync to Firestore
    if(currentUser && db) {
      db.collection('users').doc(currentUser.uid).set({
        streak: currentStreak,
        lastPrayerDate: todayStr
      }, {merge: true});
    }

    return currentStreak;
  } catch(e) { return getPersonalStreak(); }
}

// ===== INVITE CODE SYSTEM =====
function generateInviteCode() {
  // 6-character alphanumeric code, no I/O/0/1 to avoid confusion
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for(var i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function showInviteModal() {
  var code = generateInviteCode();
  var overlay = document.createElement('div');
  overlay.className = 'bible-picker-overlay';
  overlay.id = 'inviteModalOverlay';
  overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;';

  var html = '<div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-xl);width:90%;max-width:340px;text-align:center;box-shadow:var(--shadow-lg);position:relative">';

  // Close button
  html += '<button onclick="closeInviteModal()" style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;padding:4px">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-text-muted)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>';

  // Header
  html += '<div style="margin-bottom:var(--space-lg)">' +
    '<svg viewBox="0 0 24 24" width="40" height="40" fill="var(--color-primary)" style="margin-bottom:var(--space-sm)"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 7c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm1 4.15C3.57 12.17 2 13.77 2 15.5V19h6v-3.5c0-1.38-.57-2.63-1.48-3.52-.22-.22-.46-.41-.72-.58-.07-.04-.14-.08-.22-.12-.03-.01-.05-.03-.08-.04A3.9 3.9 0 005 11.15zM15 11.15c-.2.05-.4.12-.58.2-.03.01-.05.03-.08.04-.08.04-.15.08-.22.12-.26.17-.5.36-.72.58C12.57 12.87 12 14.12 12 15.5V19h6v-3.5c0-1.73-1.57-3.33-3-4.35z"/></svg>' +
    '<h3 style="font-size:var(--text-lg);font-weight:var(--font-weight-semibold);color:var(--color-text);margin:0">Invite Family Member</h3>' +
    '<p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-top:var(--space-xs)">Share this code with a family member</p></div>';

  // Invite code display
  html += '<div id="inviteCodeDisplay" style="background:var(--color-surface-muted);border-radius:var(--radius-md);padding:var(--space-lg) var(--space-md);margin-bottom:var(--space-lg);letter-spacing:6px;font-size:28px;font-weight:var(--font-weight-bold);color:var(--color-primary);font-family:monospace;user-select:all">' + code + '</div>';

  // Copy button
  html += '<button onclick="copyInviteCode(\'' + code + '\')" style="width:100%;padding:var(--space-md);background:var(--color-primary);color:var(--color-text-on-primary);border:none;border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:var(--font-weight-semibold);cursor:pointer;margin-bottom:var(--space-sm);display:flex;align-items:center;justify-content:center;gap:var(--space-sm)">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>' +
    'Copy Code</button>';

  // WhatsApp share button
  var waMsg = encodeURIComponent('Join our family on PRAYED! Use invite code: ' + code + '\nDownload the app and enter this code to connect with our family prayer circle.');
  html += '<button onclick="window.open(\'https://wa.me/?text=' + waMsg + '\',\'_blank\')" style="width:100%;padding:var(--space-md);background:#25D366;color:#fff;border:none;border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:var(--font-weight-semibold);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:var(--space-sm)">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>' +
    'Share via WhatsApp</button>';

  html += '</div>';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  // Store invite code in Firestore
  if(currentUser && db) {
    try {
      var familyId = (userData && userData.familyId) ? userData.familyId : currentUser.uid;
      db.collection('inviteCodes').doc(code).set({
        familyId: familyId,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) { console.warn('Could not store invite code:', e); }
  }
}

function closeInviteModal() {
  var overlay = document.getElementById('inviteModalOverlay');
  if(overlay) overlay.remove();
}

function copyInviteCode(code) {
  if(navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() {
      showToast('Invite code copied!');
    }).catch(function() {
      showToast('Could not copy code');
    });
  } else {
    var temp = document.createElement('textarea');
    temp.value = code;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); showToast('Invite code copied!'); }
    catch(e) { showToast('Could not copy code'); }
    document.body.removeChild(temp);
  }
}

// ===== RENDER PROFILE =====
function renderProfile() {
  var u = userData || {initials:'JD',firstName:'John',lastName:'David',cityDisplay:'San Francisco, USA'};
  var html = '<div class="profile-header">' +
    '<div class="profile-av">'+(u.initials||'JD')+'</div>' +
    '<div class="ph-name">'+(u.firstName||'John')+' '+(u.lastName||'David')+'</div>' +
    '<div class="ph-loc">'+(u.cityDisplay||u.city||'San Francisco')+', '+(u.country||'USA')+'</div>' +
    '<div class="ph-joined">Joined March 2026</div></div>';

  // Stats - real tracked data
  var prayerCount = getPrayerCount();
  var personalStreak = getPersonalStreak();
  var circleCount = (typeof circles !== 'undefined' && Array.isArray(circles)) ? circles.length : 0;
  var familyStreak = (typeof getFamilyStreak === 'function') ? getFamilyStreak() : 0;

  html += '<div class="profile-stats">' +
    '<div class="ps-item"><div class="ps-val">' + prayerCount + '</div><div class="ps-label">Prayers</div></div>' +
    '<div class="ps-item"><div class="ps-val">' + personalStreak + '</div><div class="ps-label">Streak</div></div>' +
    '<div class="ps-item"><div class="ps-val">' + circleCount + '</div><div class="ps-label">Circles</div></div>' +
    '<div class="ps-item"><div class="ps-val">' + familyStreak + '</div><div class="ps-label">Family Streak</div></div></div>';

  // Auth Status
  if(currentUser) {
    html += '<div style="margin:0 var(--space-md) var(--space-md);padding:var(--space-md);background:var(--color-surface);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border-left:4px solid var(--color-success)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<div style="width:32px;height:32px;border-radius:var(--radius-full);background:var(--color-success);display:flex;align-items:center;justify-content:center">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-on-primary)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
      '<div><div style="font-size:var(--text-sm);font-weight:var(--font-weight-semibold);color:var(--color-text)">Signed In</div>' +
      '<div style="font-size:var(--text-xs);color:var(--color-text-muted)">' + escapeHtml(currentUser.email) + '</div></div></div></div>';
  }

  // Family - real data only
  html += '<div class="family-section"><h3>' + svgIcons.family + ' My Family</h3><div class="family-row">' +
    '<div class="family-member"><div class="fm-av" style="background:var(--color-primary)">'+(u.initials||'JD')+'</div><div class="fm-name">'+(u.firstName||'You')+'</div></div>';
  var famMembers = (userData && userData.familyMembers) ? userData.familyMembers : [];
  if(famMembers.length > 0) {
    famMembers.forEach(function(fm) {
      html += '<div class="family-member"><div class="fm-av" style="background:'+(fm.color||'var(--color-success)')+'">'+escapeHtml(fm.initials)+'</div><div class="fm-name">'+escapeHtml(fm.firstName)+'</div></div>';
    });
  }
  html += '<div class="family-member" onclick="showInviteModal()"><div class="fm-add">' + svgIcons.plus + '</div><div class="fm-name">Add</div></div>' +
    '</div></div>';

  // Giving - Coming Soon overlay
  html += '<div class="giving-section"><h3>' + svgIcons.heart + ' Your Impact</h3>';
  var campaigns = [
    {title:'Build a Chapel in Kampala',img:imgMap['kampala_rosary'],raised:12450,goal:25000},
    {title:'Education for 100 Children',img:imgMap['prayer_stock2'],raised:8200,goal:15000},
    {title:'Clean Water for Haiti Mission',img:imgMap['prayer_stock3'],raised:3100,goal:10000}
  ];
  campaigns.forEach(function(c){
    html += '<div class="campaign-card" style="position:relative;pointer-events:none;opacity:0.65">' +
      '<img src="'+c.img+'" alt="'+escapeHtml(c.title)+'">' +
      '<div class="cc-body"><div class="cc-title">'+escapeHtml(c.title)+'</div>' +
      '<div class="cc-bar"><div class="cc-fill" style="width:0%"></div></div>' +
      '<div class="cc-meta"><span>Campaign details</span><span></span></div></div>' +
      '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);border-radius:var(--radius-md)">' +
      '<span style="background:var(--color-accent);color:var(--color-text-on-primary);padding:var(--space-sm) var(--space-lg);border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:var(--font-weight-bold);letter-spacing:0.5px;box-shadow:var(--shadow-md)">Coming Soon</span></div></div>';
  });
  html += '</div>';

  // Settings
  html += '<div class="section-title">' + svgIcons.gear + ' Settings</div><div class="settings-list">';
  html += '<div class="settings-item" onclick="toggleDarkMode()"><div class="si-left">' + svgIcons.moon + '<span class="si-label">Dark Mode</span></div>' +
    '<div class="toggle-switch'+(document.body.classList.contains('dark-mode')?' on':'')+'"><div class="toggle-knob"></div></div></div>';
  html += '<div class="settings-item" onclick="showSubPage(\'notifications\',\'Notifications\')"><div class="si-left">' + svgIcons.bell + '<span class="si-label">Notifications & Reminders</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showSubPage(\'settings\',\'Settings\')"><div class="si-left">' + svgIcons.gear + '<span class="si-label">Prayer Preferences</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showSubPage(\'my-habits\',\'My Habits\')"><div class="si-left">' + svgIcons.check + '<span class="si-label">My Habits & Streaks</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showSubPage(\'rosary-passport\',\'Rosary Passport\')"><div class="si-left">' + svgIcons.passport + '<span class="si-label">Rosary Passport</span></div>' + svgIcons.chevRight + '</div>';
  html += '</div>';

  // HCFM Ministries
  html += '<div class="section-title">' + svgIcons.church + ' Holy Cross Ministries</div><div class="settings-list">';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'About HCFM\',\'https://www.hcfm.org/about-holy-cross-family-ministries\')"><div class="si-left">' + svgIcons.church + '<span class="si-label">About HCFM</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showSubPage(\'fr-peyton\',\'Father Peyton\')"><div class="si-left">' + svgIcons.heart + '<span class="si-label">Fr. Patrick Peyton, C.S.C.</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'Family Rosary\',\'https://www.familyrosary.org\')"><div class="si-left">' + svgIcons.globe + '<span class="si-label">Family Rosary</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'Family Theater\',\'https://www.familytheater.org\')"><div class="si-left">' + svgIcons.globe + '<span class="si-label">Family Theater Productions</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'Catholic Mom\',\'https://www.catholicmom.com\')"><div class="si-left">' + svgIcons.globe + '<span class="si-label">Catholic Mom</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'Museum of Family Prayer\',\'https://www.museumoffamilyprayer.org\')"><div class="si-left">' + svgIcons.globe + '<span class="si-label">Museum of Family Prayer</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')"><div class="si-left">' + svgIcons.globe + '<span class="si-label">A World at Prayer</span></div>' + svgIcons.chevRight + '</div>';
  html += '</div>';

  // Support
  html += '<div class="section-title">' + svgIcons.heart + ' Support</div><div class="settings-list">';
  html += '<div class="settings-item" onclick="showInAppBrowser(\'Donate\',\'https://www.hcfm.org/donate\')"><div class="si-left">' + svgIcons.heart + '<span class="si-label">Donate to HCFM</span></div>' + svgIcons.chevRight + '</div>';
  html += '<div class="settings-item" onclick="shareContent()"><div class="si-left">' + svgIcons.share + '<span class="si-label">Share PRAYED</span></div>' + svgIcons.chevRight + '</div>';
  html += '</div>';
  html += '<div style="text-align:center;padding:var(--space-md);font-size:var(--text-xs);color:var(--color-text-muted)">PRAYED 1.0.0 &middot; Holy Cross Family Ministries</div>';
  html += '<button class="signout-btn" onclick="signOut()">Sign Out</button>';
  document.getElementById('screenProfile').innerHTML = html;
}
