// ===== RENDER HABITS =====
function renderHabits() {
  var doneCount = habits.filter(function(h){return h.done}).length;
  var totalCount = habits.length;
  var pct = totalCount > 0 ? Math.round(doneCount/totalCount*100) : 0;
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var today = new Date().getDay();
  var todayIdx = today === 0 ? 6 : today - 1;
  var html = '<div class="app-header"><div class="header-left"><div class="greeting">Habits<small>Track your spiritual growth</small></div></div></div>';

  // === STREAK CALENDAR (GitHub-style) ===
  html += '<div class="streak-calendar">';
  html += '<div class="sc-header"><h3>Prayer Activity</h3><span class="sc-month">' + getMonthLabel() + '</span></div>';
  html += '<div class="sc-grid">';
  // Day labels
  html += '<div class="sc-labels"><span>M</span><span>W</span><span>F</span></div>';
  html += '<div class="sc-cells">';
  var history = getPrayerHistory();
  for(var i = 0; i < 35; i++) {
    var level = history[i] || 0;
    var isToday = i === 34;
    html += '<div class="sc-cell level-' + level + (isToday ? ' today' : '') + '"></div>';
  }
  html += '</div></div>';
  html += '<div class="sc-legend"><span>Less</span>';
  for(var l = 0; l < 5; l++) html += '<div class="sc-cell level-' + l + '" style="width:10px;height:10px"></div>';
  html += '<span>More</span></div></div>';

  // === WEEKLY TREND CHART (SVG) ===
  html += '<div class="trend-chart">';
  html += '<div class="tc-header"><h3>Weekly Trend</h3><span class="tc-label">Minutes prayed</span></div>';
  var weekData = getWeeklyTrend();
  var maxVal = Math.max.apply(null, weekData.map(function(w){return w.val})) || 1;
  var chartH = 80, chartW = 280;
  html += '<svg class="tc-svg" viewBox="0 0 ' + chartW + ' ' + (chartH + 20) + '">';
  // Gradient fill
  html += '<defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.2"/>' +
    '<stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"/>' +
    '</linearGradient></defs>';
  // Build polyline points
  var pts = [];
  var segW = chartW / (weekData.length - 1);
  weekData.forEach(function(w, i) {
    var x = Math.round(i * segW);
    var y = Math.round(chartH - (w.val / maxVal) * (chartH - 10));
    pts.push(x + ',' + y);
  });
  // Area fill
  html += '<polygon points="0,' + chartH + ' ' + pts.join(' ') + ' ' + chartW + ',' + chartH + '" fill="url(#trendGrad)"/>';
  // Line
  html += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  // Dots + labels
  weekData.forEach(function(w, i) {
    var x = Math.round(i * segW);
    var y = Math.round(chartH - (w.val / maxVal) * (chartH - 10));
    html += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="var(--color-surface)" stroke="var(--color-primary)" stroke-width="2"/>';
    html += '<text x="' + x + '" y="' + (chartH + 14) + '" text-anchor="middle" fill="var(--color-text-muted)" font-size="9" font-family="var(--font-body)">' + w.label + '</text>';
  });
  html += '</svg></div>';

  // === PROGRESS RINGS ===
  var prayerPct = getPrayerCategoryPct('prayer');
  var famPct = getPrayerCategoryPct('family');
  var wellPct = getPrayerCategoryPct('wellness');
  html += '<div class="rings-section"><div class="rings-wrap">' +
    '<svg viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="54" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle class="ring-anim" cx="60" cy="60" r="54" fill="none" stroke="var(--coral)" stroke-width="6" stroke-dasharray="' + Math.round(339*famPct/100) + ' 339" stroke-linecap="round" transform="rotate(-90 60 60)"/>' +
    '<circle cx="60" cy="60" r="44" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle class="ring-anim" cx="60" cy="60" r="44" fill="none" stroke="var(--teal)" stroke-width="6" stroke-dasharray="' + Math.round(276*wellPct/100) + ' 276" stroke-linecap="round" transform="rotate(-90 60 60)"/>' +
    '<circle cx="60" cy="60" r="34" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle class="ring-anim" cx="60" cy="60" r="34" fill="none" stroke="var(--primary-blue)" stroke-width="6" stroke-dasharray="' + Math.round(213*prayerPct/100) + ' 213" stroke-linecap="round" transform="rotate(-90 60 60)"/>' +
    '</svg><div class="rings-center"><div class="rc-pct">' + pct + '%</div><div class="rc-label">Today</div></div></div>' +
    '<div class="rings-legend">' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--primary-blue)"></div>Prayer ' + prayerPct + '%</div>' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--teal)"></div>Wellness ' + wellPct + '%</div>' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--coral)"></div>Family ' + famPct + '%</div>' +
    '</div></div>';

  // === STREAK BANNER ===
  var streak = getPersonalStreak ? getPersonalStreak() : 0;
  var longestStreak = getLongestStreak();
  html += '<div class="streak-banner">' + svgIcons.flame +
    '<div><div class="sb-num">' + streak + '</div></div><div><div class="sb-text">Day Streak</div><div class="sb-sub">Your longest: ' + longestStreak + ' days</div></div></div>';

  // === DAILY HABITS (enhanced cards) ===
  html += '<div class="section-title">Daily Habits</div><div class="habit-list">';
  habits.forEach(function(h,i){
    var catColor = h.cat === 'prayer' ? 'var(--primary-blue)' : h.cat === 'family' ? 'var(--coral)' : 'var(--teal)';
    html += '<div class="habit-card" onclick="toggleHabit(' + i + ')">' +
      '<div class="habit-card__indicator" style="background:' + catColor + '"></div>' +
      '<div class="habit-card__check' + (h.done ? ' checked' : '') + '">' + svgIcons.check + '</div>' +
      '<div class="habit-card__body"><div class="habit-card__name">' + h.name + '</div>' +
      '<div class="habit-card__meta">' + h.time + '</div></div></div>';
  });
  html += '</div>';

  // === EXTRA HABITS ===
  html += '<div class="section-title">Habit Bundling</div><div class="habit-list">';
  extraHabits.forEach(function(h,i){
    var catColor = h.cat === 'prayer' ? 'var(--primary-blue)' : h.cat === 'family' ? 'var(--coral)' : 'var(--teal)';
    html += '<div class="habit-card" onclick="toggleExtraHabit(' + i + ')">' +
      '<div class="habit-card__indicator" style="background:' + catColor + '"></div>' +
      '<div class="habit-card__check' + (h.done ? ' checked' : '') + '">' + svgIcons.check + '</div>' +
      '<div class="habit-card__body"><div class="habit-card__name">' + h.name + '</div>' +
      '<div class="habit-card__meta">' + h.time + '</div></div></div>';
  });
  html += '</div>';

  // === BADGES ===
  html += '<div class="section-title">' + svgIcons.star + ' Badges Earned</div>';
  html += '<div class="badges-scroll">';
  var badges = [
    {name:'First Prayer',icon:svgIcons.check,color:'var(--gold)',locked:false},
    {name:'Rosary Master',icon:svgIcons.star,color:'#DB2777',locked:false},
    {name:'7-Day Streak',icon:svgIcons.flame,color:'var(--primary-blue)',locked:false},
    {name:'Family Bond',icon:svgIcons.heart,color:'var(--teal)',locked:false},
    {name:'Faithful Friend',icon:svgIcons.heart,color:'var(--gold)',locked:false},
    {name:'Global Intercessor',icon:svgIcons.globe,color:'',locked:true},
    {name:'100 Days',icon:svgIcons.star,color:'',locked:true},
    {name:'Circle Leader',icon:svgIcons.star,color:'',locked:true}
  ];
  badges.forEach(function(b){
    html += '<div class="badge-item" onclick="showSubPage(\'badges\',\'Badges\')">' +
      '<div class="badge-circle' + (b.locked ? ' locked' : '') + '" style="' + (b.color ? 'background:' + b.color : '') + '">' + b.icon + '</div>' +
      '<div class="bi-name">' + b.name + '</div></div>';
  });
  html += '</div>';

  // Add New Habit button
  html += '<button onclick="showSubPage(\'suggested-habits\',\'Suggested Habits\')" style="width:100%;padding:12px;border:2px dashed var(--primary-blue);border-radius:12px;color:var(--primary-blue);font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;background:transparent;cursor:pointer;margin:8px 0 16px">' +
    svgIcons.plus + ' Add New Habit</button>';

  // === PASSPORT (compact) ===
  var earnedStamps = 8;
  var totalStampsCount = 12;
  var passportPct = Math.round(earnedStamps/totalStampsCount*100);
  html += '<div class="passport-section" onclick="showSubPage(\'passport-detail\',\'Rosary Passport\')">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h3 style="display:flex;align-items:center;gap:8px">' + svgIcons.passport + ' Rosary Passport</h3>';
  html += '<div style="display:flex;align-items:center;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--gold)">' + earnedStamps + '</div><div style="font-size:11px;color:var(--text-light)">/ ' + totalStampsCount + '<br>stamps</div></div>';
  html += '</div>';
  html += '<div style="height:6px;background:var(--light-gray);border-radius:3px;margin-bottom:14px;overflow:hidden"><div style="height:100%;width:' + passportPct + '%;background:linear-gradient(90deg,var(--gold),#E8A838);border-radius:3px;transition:width 0.5s"></div></div>';
  html += '<div class="passport-grid">';
  var stamps = [
    {country:'USA',flag:'usa',earned:true,families:247,border:'#2563EB'},
    {country:'Brazil',flag:'brazil',earned:true,families:156,border:'#009c3b'},
    {country:'Uganda',flag:'uganda',earned:true,families:89,border:'#D90000'},
    {country:'France',flag:'france',earned:true,families:134,border:'#002395'},
    {country:'Kenya',flag:'kenya',earned:true,families:67,border:'#BB0000'},
    {country:'Ireland',flag:'ireland',earned:true,families:45,border:'#169B62'},
    {country:'Peru',flag:'peru',earned:true,families:78,border:'#D91023'},
    {country:'India',flag:'india',earned:true,families:112,border:'#FF9933'},
    {country:'Mexico',flag:'mexico',earned:false,families:0,border:'#ccc'},
    {country:'Italy',flag:'italy',earned:false,families:0,border:'#ccc'},
    {country:'Philippines',flag:'philippines',earned:false,families:0,border:'#ccc'},
    {country:'Egypt',flag:'egypt',earned:false,families:0,border:'#ccc'}
  ];
  stamps.forEach(function(s){
    html += '<div class="stamp-card' + (s.earned ? '' : ' locked') + '" style="border:2px solid ' + s.border + ';position:relative;overflow:hidden">' +
      (s.earned ? '<div style="position:absolute;top:-2px;right:-2px;background:' + s.border + ';color:#fff;font-size:8px;padding:2px 6px;border-radius:0 0 0 8px;font-weight:700">\u2713</div>' : '') +
      '<div class="sc-flag" style="' + (s.earned ? 'filter:none' : 'filter:grayscale(100%) opacity(0.4)') + '">' + flagSVG(s.flag) + '</div><div class="sc-country" style="font-weight:' + (s.earned ? '700' : '400') + '">' + s.country + '</div>' +
      (s.earned ? '<div class="sc-info" style="font-size:10px;color:var(--text-light)">' + s.families + ' families</div>' : '<div class="sc-info">' + svgIcons.lock + '</div>') + '</div>';
  });
  html += '</div>';
  html += '<button onclick="event.stopPropagation();shareContent(\'prayer\')" style="width:100%;margin-top:12px;padding:10px;background:linear-gradient(135deg,var(--gold),#D4922F);color:#fff;border-radius:10px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border:none">' + svgIcons.share + ' Share My Passport</button>';
  html += '</div>';

  // === CHALLENGES ===
  html += '<div class="section-title">' + svgIcons.flame + ' Active Challenges</div>';
  html += '<div style="padding:0 16px;display:flex;flex-direction:column;gap:10px">';
  var challenges = [
    {name:'7-Day Rosary Streak',desc:'Pray the Rosary every day for a week',progress:5,total:7,reward:'Rosary Master Badge',color:'var(--primary-blue)',icon:svgIcons.star},
    {name:'Family Prayer Week',desc:'Pray with your family 5 times this week',progress:3,total:5,reward:'Family Bond Badge',color:'var(--teal)',icon:svgIcons.family},
    {name:'Lent Challenge',desc:'Complete 40 days of Lenten prayer',progress:12,total:40,reward:'Lenten Warrior Badge',color:'var(--coral)',icon:svgIcons.flame}
  ];
  challenges.forEach(function(ch) {
    var chPct = Math.round(ch.progress/ch.total*100);
    html += '<div style="padding:14px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:' + ch.color + ';display:flex;align-items:center;justify-content:center">' +
      '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#fff">' + ch.icon.match(/<path[^>]+>/)[0] + '</svg></div>' +
      '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">' + ch.name + '</div>' +
      '<div style="font-size:11px;color:var(--text-light)">' + ch.desc + '</div></div>' +
      '<div style="font-size:13px;font-weight:700;color:' + ch.color + '">' + ch.progress + '/' + ch.total + '</div></div>' +
      '<div style="height:6px;background:var(--light-gray);border-radius:3px;overflow:hidden"><div style="height:100%;width:' + chPct + '%;background:' + ch.color + ';border-radius:3px;transition:width 0.5s"></div></div>' +
      '<div style="font-size:10px;color:var(--text-light);margin-top:4px">Reward: ' + ch.reward + '</div></div>';
  });
  html += '</div>';

  // === LEADERBOARD ===
  html += '<div class="section-title">' + svgIcons.star + ' Community Leaderboard</div>';
  html += '<div style="padding:0 16px">';
  var leaders = [
    {rank:1,name:'Maria S.',streak:45,prayers:312,color:'#FFD700',medal:'\ud83e\udd47'},
    {rank:2,name:'James T.',streak:38,prayers:289,color:'#C0C0C0',medal:'\ud83e\udd48'},
    {rank:3,name:'Amira H.',streak:31,prayers:245,color:'#CD7F32',medal:'\ud83e\udd49'},
    {rank:4,name:'Francois D.',streak:28,prayers:198,color:'var(--light-gray)',medal:'4'},
    {rank:5,name:'You',streak:streak,prayers:getPrayerCount ? getPrayerCount() : 0,color:'rgba(37,99,235,0.1)',medal:'5',isMe:true}
  ];
  leaders.forEach(function(l) {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:' + (l.isMe ? 'rgba(37,99,235,0.08)' : 'var(--card-bg)') + ';border-radius:10px;margin-bottom:6px;' + (l.isMe ? 'border:2px solid var(--primary-blue)' : 'box-shadow:var(--shadow)') + '">' +
      '<div style="width:28px;text-align:center;font-size:' + (l.rank <= 3 ? '18px' : '13px') + ';font-weight:700;color:' + (l.isMe ? 'var(--primary-blue)' : 'var(--navy)') + '">' + l.medal + '</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:' + (l.isMe ? '700' : '500') + ';color:' + (l.isMe ? 'var(--primary-blue)' : 'var(--navy)') + '">' + l.name + (l.isMe ? ' (You)' : '') + '</div></div>' +
      '<div style="text-align:right"><div style="font-size:13px;font-weight:700;color:var(--navy)">' + l.streak + ' days</div><div style="font-size:10px;color:var(--text-light)">' + l.prayers + ' prayers</div></div></div>';
  });
  html += '<div style="text-align:center;padding:8px"><span style="font-size:12px;color:var(--primary-blue);font-weight:600;cursor:pointer" onclick="showToast(\'Full leaderboard coming soon!\')">View Full Leaderboard</span></div>';
  html += '</div>';

  document.getElementById('screenHabits').innerHTML = html;
}

// === DATA HELPERS ===
function getPrayerHistory() {
  // Returns 35 days of prayer intensity (0-4)
  // Try localStorage first, fallback to generated data
  try {
    var saved = JSON.parse(localStorage.getItem('prayedPrayerHistory'));
    if(saved && saved.length === 35) return saved;
  } catch(e) {}
  // Generate from habits completion patterns
  var hist = [];
  for(var i = 0; i < 35; i++) {
    if(i < 28) {
      // Past days: pseudo-random based on position
      var seed = (i * 7 + 13) % 17;
      hist.push(seed < 3 ? 0 : seed < 6 ? 1 : seed < 10 ? 2 : seed < 14 ? 3 : 4);
    } else {
      // Current week: based on actual habit data
      var dayDone = habits.filter(function(h){return h.done}).length;
      hist.push(Math.min(4, Math.round(dayDone / habits.length * 4)));
    }
  }
  return hist;
}

function getWeeklyTrend() {
  try {
    var saved = JSON.parse(localStorage.getItem('prayedWeeklyTrend'));
    if(saved && saved.length > 0) return saved;
  } catch(e) {}
  // Default trend data (minutes)
  return [
    {label:'W1',val:32},{label:'W2',val:45},{label:'W3',val:38},
    {label:'W4',val:52},{label:'This',val:47}
  ];
}

function getPrayerCategoryPct(cat) {
  var catHabits = habits.filter(function(h){return h.cat === cat});
  if(catHabits.length === 0) {
    // Check extraHabits
    catHabits = extraHabits.filter(function(h){return h.cat === cat});
  }
  if(catHabits.length === 0) return 0;
  var done = catHabits.filter(function(h){return h.done}).length;
  return Math.round(done / catHabits.length * 100);
}

function getLongestStreak() {
  try {
    var saved = localStorage.getItem('prayedLongestStreak');
    if(saved) return parseInt(saved);
  } catch(e) {}
  return 23; // default
}

function getMonthLabel() {
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var now = new Date();
  return months[now.getMonth()] + ' ' + now.getFullYear();
}

function toggleHabit(i) {
  habits[i].done = !habits[i].done;
  if(habits[i].done) {
    var streakDay = 0;
    try { streakDay = parseInt(localStorage.getItem('prayedStreak')) || 0; } catch(e) {}
    logEvent('habit_completed', {habitName: habits[i].name, streakDay: streakDay});
    logEvent('personal_streak_day', {streakLength: streakDay});
    if(typeof incrementPrayerCount === 'function') incrementPrayerCount();
    if(typeof updateStreak === 'function') updateStreak();
  }
  if(userData){ userData.habits = habits; syncToCloud(); }
  renderHabits();
}
function toggleExtraHabit(i) { extraHabits[i].done = !extraHabits[i].done; if(userData){ userData.extraHabits = extraHabits; syncToCloud(); } renderHabits(); }
function quickToggleHabit(i) { habits[i].done = !habits[i].done; if(userData){ userData.habits = habits; syncToCloud(); } showToast(habits[i].done ? habits[i].name + ' completed! \u2713' : habits[i].name + ' unmarked'); renderHome(); }

// ===== HABITS PAGE (sub-page version) =====
function renderHabitsPage() {
  var doneCount = habits.filter(function(h){return h.done}).length;
  var totalCount = habits.length;
  var pct = totalCount > 0 ? Math.round(doneCount/totalCount*100) : 0;
  var html = '<div style="padding:0 4px">';
  html += '<div class="stats-row" style="margin-bottom:16px">';
  html += '<div class="stat-card"><div class="sc-val">' + doneCount + '/' + totalCount + '</div><div class="sc-label">Today</div></div>';
  html += '<div class="stat-card"><div class="sc-val">' + pct + '%</div><div class="sc-label">Complete</div></div>';
  html += '<div class="stat-card"><div class="sc-val">' + (getPersonalStreak ? getPersonalStreak() : 0) + '</div><div class="sc-label">Streak</div></div>';
  html += '</div>';
  habits.forEach(function(h, i) {
    html += '<div class="habit-item" onclick="toggleHabitFromPage(' + i + ')" style="cursor:pointer">' +
      '<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + (h.done ? '#10B981' : 'var(--light-gray)') + ';flex-shrink:0">' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:' + (h.done ? '#fff' : 'var(--gray)') + '"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
      '<div class="habit-name" style="color:' + (h.done ? '#10B981' : 'var(--navy)') + '">' + h.name + '</div>' +
      '<div class="habit-time">' + (h.done ? 'Done \u2713' : h.time) + '</div></div>';
  });
  html += '<button class="sp-btn" onclick="showSubPage(\'suggested-habits\',\'Add Habits\')" style="margin-top:12px">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--primary-blue)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Add New Habits</button>';
  html += '</div>';
  return html;
}

function toggleHabitFromPage(idx) {
  habits[idx].done = !habits[idx].done;
  if(userData) { userData.habits = habits; syncToCloud(); }
  showToast(habits[idx].name + (habits[idx].done ? ' completed!' : ' unchecked'));
  document.getElementById('spBody').innerHTML = renderHabitsPage();
}

// ===== SUGGESTED HABITS =====
function showSuggestedHabits() {
  var suggestions = [
    {name:'Rosary Decade', time:'5 min', cat:'prayer'},
    {name:'Examine of Conscience', time:'Evening', cat:'prayer'},
    {name:'Lectio Divina', time:'15 min', cat:'prayer'},
    {name:'Gratitude Journal', time:'Any time', cat:'wellness'},
    {name:'Family Meal Prayer', time:'Mealtime', cat:'family'},
    {name:'Psalm of the Day', time:'Morning', cat:'prayer'}
  ];
  var html = '<div class="sp-section"><h3>Suggested Habits</h3><p>Add new habits to deepen your spiritual life.</p></div>';
  suggestions.forEach(function(s, i) {
    html += '<div class="habit-item" style="cursor:pointer" onclick="addSuggestedHabit(\'' + escapeHtml(s.name) + '\',\'' + s.time + '\',\'' + s.cat + '\')">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:rgba(37,99,235,0.1);display:flex;align-items:center;justify-content:center">' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--primary-blue)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div>' +
      '<div class="habit-name">' + s.name + '</div><div class="habit-time">' + s.time + '</div></div>';
  });
  return html;
}

function addSuggestedHabit(name, time, cat) {
  var exists = habits.some(function(h) { return h.name === name; });
  if(exists) { showToast(name + ' is already in your habits'); return; }
  habits.push({name:name, time:time, done:false, cat:cat});
  if(userData) { userData.habits = habits; syncToCloud(); }
  showToast(name + ' added to your habits!');
  renderHabits();
}
