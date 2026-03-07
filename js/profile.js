// ===== RENDER PROFILE =====
function renderProfile() {
  var u = userData || {initials:'JD',firstName:'John',lastName:'David',cityDisplay:'San Francisco, USA'};
  var html = '<div class="profile-header">' +
    '<div class="profile-av">'+(u.initials||'JD')+'</div>' +
    '<div class="ph-name">'+(u.firstName||'John')+' '+(u.lastName||'David')+'</div>' +
    '<div class="ph-loc">'+(u.cityDisplay||u.city||'San Francisco')+', '+(u.country||'USA')+'</div>' +
    '<div class="ph-joined">Joined March 2026</div></div>';
  // Stats
  html += '<div class="profile-stats">' +
    '<div class="ps-item"><div class="ps-val">247</div><div class="ps-label">Prayers</div></div>' +
    '<div class="ps-item"><div class="ps-val">12</div><div class="ps-label">Streak</div></div>' +
    '<div class="ps-item"><div class="ps-val">3</div><div class="ps-label">Circles</div></div>' +
    '<div class="ps-item"><div class="ps-val">7</div><div class="ps-label">Badges</div></div></div>';
  // Auth Status
  if(currentUser) {
    html += '<div style="margin:0 16px 16px;padding:16px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow);border-left:4px solid #10B981">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
      '<div><div style="font-size:14px;font-weight:600;color:var(--navy)">Signed In</div>' +
      '<div style="font-size:12px;color:var(--text-light)">' + currentUser.email + '</div></div></div></div>';
  }
  // Family
  html += '<div class="family-section"><h3>' + svgIcons.family + ' My Family</h3><div class="family-row">' +
    '<div class="family-member"><div class="fm-av" style="background:var(--primary-blue)">'+(u.initials||'JD')+'</div><div class="fm-name">'+(u.firstName||'John')+'</div></div>';
  var famMembers = (userData && userData.familyMembers) ? userData.familyMembers : [];
  if(famMembers.length > 0) {
    famMembers.forEach(function(fm) {
      html += '<div class="family-member"><div class="fm-av" style="background:'+(fm.color||'var(--teal)')+'">'+escapeHtml(fm.initials)+'</div><div class="fm-name">'+escapeHtml(fm.firstName)+'</div></div>';
    });
  } else {
    html += '<div class="family-member"><div class="fm-av" style="background:var(--teal)">SR</div><div class="fm-name">Sarah</div></div>' +
      '<div class="family-member"><div class="fm-av" style="background:var(--coral)">EM</div><div class="fm-name">Emma</div></div>';
  }
  html += '<div class="family-member" onclick="showSubPage(\'add-family\',\'Add Family Member\')"><div class="fm-add">' + svgIcons.plus + '</div><div class="fm-name">Add</div></div>' +
    '</div></div>';
  // Giving
  html += '<div class="giving-section"><h3>' + svgIcons.heart + ' Your Impact</h3>';
  var campaigns = [
    {title:'Build a Chapel in Kampala',img:imgMap['kampala_rosary'],raised:12450,goal:25000},
    {title:'Education for 100 Children',img:imgMap['prayer_stock2'],raised:8200,goal:15000},
    {title:'Clean Water for Haiti Mission',img:imgMap['prayer_stock3'],raised:3100,goal:10000}
  ];
  campaigns.forEach(function(c){
    var pct = Math.round(c.raised/c.goal*100);
    html += '<div class="campaign-card" onclick="showSubPage(\'giving-detail\',\'Giving\')">' +
      '<img src="'+c.img+'" alt="'+c.title+'"><div class="cc-body"><div class="cc-title">'+c.title+'</div>' +
      '<div class="cc-bar"><div class="cc-fill" style="width:'+pct+'%"></div></div>' +
      '<div class="cc-meta"><span>$'+c.raised.toLocaleString()+' of $'+c.goal.toLocaleString()+'</span><span>'+pct+'% funded</span></div>' +
      '<button class="cc-donate" onclick="event.stopPropagation();showInAppBrowser(\'Donate\',\'https://www.hcfm.org/donate\')">Donate</button></div></div>';
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
  html += '<div style="text-align:center;padding:12px;font-size:12px;color:var(--gray)">PRAYED 1.0.0 &middot; Holy Cross Family Ministries</div>';
  html += '<button class="signout-btn" onclick="signOut()">Sign Out</button>';
  document.getElementById('screenProfile').innerHTML = html;
}
