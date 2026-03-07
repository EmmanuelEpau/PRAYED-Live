// ===== RENDER HABITS =====
function renderHabits() {
  var doneCount = habits.filter(function(h){return h.done}).length;
  var totalCount = habits.length;
  var pct = Math.round(doneCount/totalCount*100);
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var today = new Date().getDay();
  var todayIdx = today === 0 ? 6 : today - 1;
  var html = '<div class="app-header"><div class="header-left"><div class="greeting">Habits<small>Track your spiritual growth</small></div></div></div>';
  // Week header
  html += '<div class="week-header">';
  days.forEach(function(d,i){
    var done = i < todayIdx || (i===todayIdx && pct > 50);
    html += '<div class="week-day'+(i===todayIdx?' today':'')+'"><span class="wd-label">'+d+'</span><div class="wd-dot'+(done?' done':'')+'"></div></div>';
  });
  html += '</div>';
  // Stats
  html += '<div class="stats-row">';
  html += '<div class="stat-card"><div class="sc-val">47</div><div class="sc-label">Minutes</div></div>';
  html += '<div class="stat-card"><div class="sc-val">5.2</div><div class="sc-label">Avg Streak</div></div>';
  html += '<div class="stat-card"><div class="sc-val">'+pct+'%</div><div class="sc-label">Consistency</div></div>';
  html += '</div>';
  // Progress Rings
  var prayerPct = 67, wellPct = 45, famPct = 89;
  html += '<div class="rings-section"><div class="rings-wrap">' +
    '<svg viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="54" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle cx="60" cy="60" r="54" fill="none" stroke="var(--coral)" stroke-width="6" stroke-dasharray="'+Math.round(339*famPct/100)+' 339" stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1s"/>' +
    '<circle cx="60" cy="60" r="44" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle cx="60" cy="60" r="44" fill="none" stroke="var(--teal)" stroke-width="6" stroke-dasharray="'+Math.round(276*wellPct/100)+' 276" stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1s"/>' +
    '<circle cx="60" cy="60" r="34" fill="none" stroke="var(--light-gray)" stroke-width="6"/>' +
    '<circle cx="60" cy="60" r="34" fill="none" stroke="var(--primary-blue)" stroke-width="6" stroke-dasharray="'+Math.round(213*prayerPct/100)+' 213" stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1s"/>' +
    '</svg><div class="rings-center"><div class="rc-pct">'+pct+'%</div><div class="rc-label">This Week</div></div></div>' +
    '<div class="rings-legend">' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--primary-blue)"></div>Prayer</div>' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--teal)"></div>Wellness</div>' +
    '<div class="rl-item"><div class="rl-dot" style="background:var(--coral)"></div>Family</div>' +
    '</div></div>';
  // Heatmap
  html += '<div class="heatmap"><h3>When You Pray Most</h3><div class="hm-row">' +
    '<div class="hm-card" style="background:rgba(37,99,235,0.8);color:#fff"><div class="hm-label">Morning</div><div class="hm-count">12</div><div class="hm-bar"><div class="hm-fill" style="width:95%"></div></div></div>' +
    '<div class="hm-card" style="background:rgba(37,99,235,0.4);color:#fff"><div class="hm-label">Afternoon</div><div class="hm-count">3</div><div class="hm-bar"><div class="hm-fill" style="width:20%"></div></div></div>' +
    '<div class="hm-card" style="background:rgba(37,99,235,0.6);color:#fff"><div class="hm-label">Evening</div><div class="hm-count">8</div><div class="hm-bar"><div class="hm-fill" style="width:65%"></div></div></div>' +
    '</div></div>';
  // Insight
  html += '<div class="insight-card"><h3>' + svgIcons.lightbulb + ' Your Insights</h3>' +
    '<p>You pray most consistently in the morning. Try adding an evening prayer to boost your score.</p></div>';
  // Streak
  html += '<div class="streak-banner">' + svgIcons.flame +
    '<div><div class="sb-num">12</div></div><div><div class="sb-text">Day Streak</div><div class="sb-sub">Your longest: 23 days</div></div></div>';
  // Habits
  html += '<div class="section-title">Daily Habits</div><div class="habit-list">';
  habits.forEach(function(h,i){
    html += '<div class="habit-item" onclick="toggleHabit('+i+')">' +
      '<div class="habit-check'+(h.done?' checked':'')+'">' + svgIcons.check + '</div>' +
      '<div class="habit-name">'+h.name+'</div><div class="habit-time">'+h.time+'</div></div>';
  });
  html += '</div>';
  // Extra habits
  html += '<div class="section-title">Habit Bundling</div><div class="habit-list">';
  extraHabits.forEach(function(h,i){
    html += '<div class="habit-item" onclick="toggleExtraHabit('+i+')">' +
      '<div class="habit-check'+(h.done?' checked':'')+'">' + svgIcons.check + '</div>' +
      '<div class="habit-name">'+h.name+'</div><div class="habit-time">'+h.time+'</div></div>';
  });
  html += '</div>';
  // Badges
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
      '<div class="badge-circle'+(b.locked?' locked':'')+'" style="'+(b.color?'background:'+b.color:'')+'">'+b.icon+'</div>' +
      '<div class="bi-name">'+b.name+'</div></div>';
  });
  html += '</div>';
  // Add New Habit
  html += '<button onclick="showSubPage(\'suggested-habits\',\'Suggested Habits\')" style="width:100%;padding:12px;border:2px dashed var(--primary-blue);border-radius:12px;color:var(--primary-blue);font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;background:transparent;cursor:pointer;margin:8px 0 16px">' +
    svgIcons.plus + ' Add New Habit</button>';
  // Passport - redesigned
  var earnedStamps = 8;
  var totalStampsCount = 12;
  var passportPct = Math.round(earnedStamps/totalStampsCount*100);
  html += '<div class="passport-section" onclick="showSubPage(\'passport-detail\',\'Rosary Passport\')">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<h3 style="display:flex;align-items:center;gap:8px">' + svgIcons.passport + ' Rosary Passport</h3>';
  html += '<div style="display:flex;align-items:center;gap:6px"><div style="font-size:20px;font-weight:800;color:var(--gold)">' + earnedStamps + '</div><div style="font-size:11px;color:var(--text-light)">/ ' + totalStampsCount + '<br>stamps</div></div>';
  html += '</div>';
  // Progress bar
  html += '<div style="height:6px;background:var(--light-gray);border-radius:3px;margin-bottom:14px;overflow:hidden"><div style="height:100%;width:'+passportPct+'%;background:linear-gradient(90deg,var(--gold),#E8A838);border-radius:3px;transition:width 0.5s"></div></div>';
  // Stamp grid
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
    html += '<div class="stamp-card'+(s.earned?'':' locked')+'" style="border:2px solid '+s.border+';position:relative;overflow:hidden">' +
      (s.earned ? '<div style="position:absolute;top:-2px;right:-2px;background:'+s.border+';color:#fff;font-size:8px;padding:2px 6px;border-radius:0 0 0 8px;font-weight:700">\u2713</div>' : '') +
      '<div class="sc-flag" style="'+(s.earned?'filter:none':'filter:grayscale(100%) opacity(0.4)')+'">'+flagSVG(s.flag)+'</div><div class="sc-country" style="font-weight:'+(s.earned?'700':'400')+'">'+s.country+'</div>' +
      (s.earned ? '<div class="sc-info" style="font-size:10px;color:var(--text-light)">'+s.families+' families</div>' : '<div class="sc-info">' + svgIcons.lock + '</div>') + '</div>';
  });
  html += '</div>';
  // Share button
  html += '<button onclick="event.stopPropagation();shareContent(\'prayer\')" style="width:100%;margin-top:12px;padding:10px;background:linear-gradient(135deg,var(--gold),#D4922F);color:#fff;border-radius:10px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border:none">' + svgIcons.share + ' Share My Passport</button>';
  html += '</div>';
  // Gamification - Challenges
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
      '<div style="width:36px;height:36px;border-radius:50%;background:'+ch.color+';display:flex;align-items:center;justify-content:center">' +
      '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#fff">' + ch.icon.match(/<path[^>]+>/)[0] + '</svg></div>' +
      '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">' + ch.name + '</div>' +
      '<div style="font-size:11px;color:var(--text-light)">' + ch.desc + '</div></div>' +
      '<div style="font-size:13px;font-weight:700;color:'+ch.color+'">' + ch.progress + '/' + ch.total + '</div></div>' +
      '<div style="height:6px;background:var(--light-gray);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+chPct+'%;background:'+ch.color+';border-radius:3px;transition:width 0.5s"></div></div>' +
      '<div style="font-size:10px;color:var(--text-light);margin-top:4px">Reward: ' + ch.reward + '</div></div>';
  });
  html += '</div>';
  // Leaderboard
  html += '<div class="section-title">' + svgIcons.star + ' Community Leaderboard</div>';
  html += '<div style="padding:0 16px">';
  var leaders = [
    {rank:1,name:'Maria S.',streak:45,prayers:312,color:'#FFD700',medal:'\ud83e\udd47'},
    {rank:2,name:'James T.',streak:38,prayers:289,color:'#C0C0C0',medal:'\ud83e\udd48'},
    {rank:3,name:'Amira H.',streak:31,prayers:245,color:'#CD7F32',medal:'\ud83e\udd49'},
    {rank:4,name:'Francois D.',streak:28,prayers:198,color:'var(--light-gray)',medal:'4'},
    {rank:5,name:'You',streak:12,prayers:47,color:'rgba(37,99,235,0.1)',medal:'5',isMe:true}
  ];
  leaders.forEach(function(l) {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+(l.isMe?'rgba(37,99,235,0.08)':'var(--card-bg)')+';border-radius:10px;margin-bottom:6px;'+(l.isMe?'border:2px solid var(--primary-blue)':'box-shadow:var(--shadow)')+'">' +
      '<div style="width:28px;text-align:center;font-size:'+(l.rank<=3?'18px':'13px')+';font-weight:700;color:'+(l.isMe?'var(--primary-blue)':'var(--navy)')+'">'+l.medal+'</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:'+(l.isMe?'700':'500')+';color:'+(l.isMe?'var(--primary-blue)':'var(--navy)')+'">'+l.name+(l.isMe?' (You)':'')+'</div></div>' +
      '<div style="text-align:right"><div style="font-size:13px;font-weight:700;color:var(--navy)">'+l.streak+' days</div><div style="font-size:10px;color:var(--text-light)">'+l.prayers+' prayers</div></div></div>';
  });
  html += '<div style="text-align:center;padding:8px"><span style="font-size:12px;color:var(--primary-blue);font-weight:600;cursor:pointer" onclick="showToast(\'Full leaderboard coming soon!\')">View Full Leaderboard</span></div>';
  html += '</div>';
  document.getElementById('screenHabits').innerHTML = html;
}

function toggleHabit(i) { habits[i].done = !habits[i].done; if(userData){ userData.habits = habits; syncToCloud(); } renderHabits(); }
function toggleExtraHabit(i) { extraHabits[i].done = !extraHabits[i].done; if(userData){ userData.extraHabits = extraHabits; syncToCloud(); } renderHabits(); }
function quickToggleHabit(i) { habits[i].done = !habits[i].done; if(userData){ userData.habits = habits; syncToCloud(); } showToast(habits[i].done ? habits[i].name + ' completed! \u2713' : habits[i].name + ' unmarked'); renderHome(); }

// ===== HABITS PAGE (sub-page version) =====
function renderHabitsPage() {
  var doneCount = habits.filter(function(h){return h.done}).length;
  var totalCount = habits.length;
  var pct = totalCount > 0 ? Math.round(doneCount/totalCount*100) : 0;
  var html = '<div style="padding:0 4px">';
  // Stats
  html += '<div class="stats-row" style="margin-bottom:16px">';
  html += '<div class="stat-card"><div class="sc-val">' + doneCount + '/' + totalCount + '</div><div class="sc-label">Today</div></div>';
  html += '<div class="stat-card"><div class="sc-val">' + pct + '%</div><div class="sc-label">Complete</div></div>';
  html += '<div class="stat-card"><div class="sc-val">5.2</div><div class="sc-label">Streak</div></div>';
  html += '</div>';
  // Habits list
  habits.forEach(function(h, i) {
    html += '<div class="habit-item" onclick="toggleHabitFromPage('+i+')" style="cursor:pointer">' +
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
  // Re-render the sub-page content
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
    html += '<div class="habit-item" style="cursor:pointer" onclick="addSuggestedHabit(\''+escapeHtml(s.name)+'\',\''+s.time+'\',\''+s.cat+'\')">' +
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
