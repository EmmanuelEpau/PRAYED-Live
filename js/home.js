// ===== RENDER HOME =====
function renderHome() {
  personalizeApp();
  var u = userData || {greeting:'Good Morning',cityDisplay:'',initials:'JD',firstName:'John'};
  var html = '';
  // Header
  html += '<div class="app-header"><div class="header-left">' +
    '<img src="'+imgMap['hcfm_logo_blue']+'" alt="HCFM" style="width:32px;height:32px;object-fit:contain">' +
    '<div class="greeting">' + (u.greeting||'Good Morning') + ', ' + (u.firstName||'Friend') +
    '<small>Welcome back!</small></div>' +
    '<div id="weatherWidget" style="display:none;font-size:13px;color:var(--text-light);margin-top:2px"></div>' +
    '</div>' +
    '<div class="header-right"><button class="notif-btn" onclick="showSubPage(\'notifications\',\'Notifications\')">' +
    svgIcons.bell + '<div class="notif-badge">2</div></button>' +
    '<div class="avatar" onclick="showScreen(\'profile\')">'+(u.initials||'JD')+'</div></div></div>';
  // Counter
  html += '<div class="counter-banner"><div class="count">'+countryCount+' countries connected today</div></div>';
  // Up Next
  html += '<div class="section-title">' + svgIcons.star + ' Up Next</div>';
  html += '<div class="carousel">';
  html += '<div class="carousel-card" onclick="showSubPage(\'rosary\',\'The Holy Rosary\')">' +
    '<img src="'+imgMap['children_rosary_1']+'" alt="Rosary"><div class="overlay"><h3>Daily Rosary</h3><p class="live-count"><span class="live-dot"></span> families praying</p></div></div>';
  html += '<div class="carousel-card" onclick="showSubPage(\'challenge\',\'Lent Prayer Challenge\')">' +
    '<img src="'+imgMap['diverse_family_praying']+'" alt="Challenge"><div class="overlay"><h3>Lent Family Challenge</h3><p>23,456 families joined</p></div></div>';
  html += '<div class="carousel-card" onclick="showScreen(\'circles\')">' +
    '<img src="'+imgMap['event_photo1']+'" alt="Circles"><div class="overlay"><h3>Circle Activity</h3><p>Your groups are praying</p></div></div>';
  html += '</div>';
  // Habit Quick Actions
  html += '<div class="section-title">' + svgIcons.check + ' Quick Habits</div>';
  html += '<div style="display:flex;gap:8px;padding:0 16px;overflow-x:auto;padding-bottom:4px">';
  var qh = habits || [];
  qh.forEach(function(h, i) {
    html += '<div onclick="quickToggleHabit('+i+')" style="min-width:100px;padding:12px;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow);text-align:center;cursor:pointer;border:2px solid ' + (h.done ? '#10B981' : 'transparent') + '">' +
      '<div style="width:28px;height:28px;border-radius:50%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;background:' + (h.done ? '#10B981' : 'var(--light-gray)') + '">' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:' + (h.done ? '#fff' : 'var(--gray)') + '"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
      '<div style="font-size:11px;font-weight:600;color:' + (h.done ? '#10B981' : 'var(--navy)') + ';white-space:nowrap">' + h.name.split(' ').slice(0,2).join(' ') + '</div>' +
      (h.done ? '<div style="font-size:9px;color:#10B981;margin-top:2px">Done \u2713</div>' : '<div style="font-size:9px;color:var(--text-light);margin-top:2px">' + h.time + '</div>') + '</div>';
  });
  html += '</div>';
  // Habit stats mini row
  var doneH = habits.filter(function(h){return h.done}).length;
  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 16px 8px">' +
    '<div style="font-size:12px;color:var(--text-light)">' + doneH + '/' + habits.length + ' completed today</div>' +
    '<button onclick="showSubPage(\'my-habits\',\'My Habits\')" style="font-size:12px;font-weight:600;color:var(--primary-blue);background:none;border:none;cursor:pointer;font-family:inherit">View All \u203A</button></div>';
  // Daily Challenge
  html += '<div class="challenge-card" onclick="showSubPage(\'daily-challenge\',\'Daily Challenge\')">' +
    '<h3>' + svgIcons.star + ' Daily Challenge</h3>' +
    '<p style="font-weight:500;color:var(--navy);margin-top:6px">In which mystery do we meditate on the Resurrection?</p>' +
    '<p>You have answered 7 days in a row!</p></div>';
  // Catholic Churches Near You (if available)
  if(nearbyChurchesCache && nearbyChurchesCache.length > 0) {
    html += '<div class="section-header mt-24 px-16"><h3>Catholic Churches Near You</h3></div>';
    html += '<div style="overflow-x:auto;padding:0 16px;display:flex;gap:12px;margin-top:8px">';
    nearbyChurchesCache.slice(0,5).forEach(function(ch) {
      html += '<div onclick="openGoogleMaps('+ch.lat+','+ch.lng+',\''+ch.name.replace(/'/g,"\\\'")+'\')"' +
        ' style="min-width:200px;background:var(--card-bg);border-radius:12px;padding:14px;box-shadow:var(--shadow);cursor:pointer">' +
        '<div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:4px">\u26EA ' + ch.name + '</div>' +
        '<div style="font-size:12px;color:var(--text-light)">' + ch.address + '</div>' +
        '<div style="font-size:12px;color:var(--text-light);margin-top:4px">' + ch.dist + ' mi away' +
        (ch.rating ? ' \u00B7 \u2B50 ' + ch.rating : '') + '</div></div>';
    });
    html += '</div>';
  }
  // Lent Banner (top priority during Lent season)
  html += '<div class="lent-banner" onclick="showSubPage(\'challenge\',\'Lent Prayer Challenge\')">' +
    '<h3><svg viewBox="0 0 24 24" width="20" height="20"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#fff"/></svg>' +
    ' Lent Family Prayer Challenge</h3><p>23,456 families joined &middot; 28 days left</p></div>';
  // Quote
  html += '<div class="quote-card" onclick="showSubPage(\'fr-peyton\',\'Fr. Patrick Peyton\')">' +
    svgIcons.star +
    '<blockquote class="crimson">"The family that prays together stays together."</blockquote>' +
    '<cite>\u2014 Fr. Patrick Peyton &middot; Matthew 18:20</cite></div>';
  // Verse of the Day
  var votd = getVerseOfTheDay();
  html += '<div class="votd-card" onclick="openVotdChapter()">' +
    '<div class="votd-label"><svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--gold)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg> Verse of the Day</div>' +
    '<div class="votd-text">\u201c' + escapeHtml(votd.text) + '\u201d</div>' +
    '<div class="votd-ref">\u2014 ' + votd.ref + ' (' + currentBibleVersion + ')</div>' +
    '<div class="votd-action"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--primary-blue)"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg> Read Full Chapter</div></div>';
  // Today's Prayers Grid
  html += '<div class="section-title">Today\'s Prayers</div>';
  html += '<div class="prayer-grid">';
  var pCards = [
    {key:'rosary_stock',name:'Rosary',page:'rosary'},
    {key:'mass_01',name:'Mass',page:'mass'},
    {key:'stained_glass',name:'Adoration',page:'adoration'},
    {key:'church_interior',name:'Gospel',page:'gospel-today'},
    {key:'prayer_stock3',name:'Night Prayer',page:'compline'},
    {key:'family_table_prayer',name:'Family',page:'family-prayers'}
  ];
  // imgMap is defined globally
  pCards.forEach(function(c) {
    html += '<div class="prayer-grid-card" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'"><div class="overlay"><h3>'+c.name+'</h3>' +
      '<div class="live-count"><span class="live-dot"></span> praying</div></div></div>';
  });
  html += '</div>';
  // Circle Activity
  html += '<div class="section-title">' + svgIcons.globe + ' Circle Activity</div>';
  feedUsers.forEach(function(f){
    html += '<div class="feed-item" onclick="showSubPage(\'circle-detail-daily-rosary\',\'Daily Rosary\')">' +
      '<div class="av" style="background:'+f.color+'">'+f.initials+'</div><div class="fi-body">' +
      '<div class="fi-name">'+f.name+' <span class="flag">'+flagSVG(f.flag)+'</span></div>' +
      '<div class="fi-text">'+f.action+'</div><div class="fi-time">'+f.time+'</div></div></div>';
  });
  // World Map
  html += '<div class="world-section" onclick="showSubPage(\'world-at-prayer\',\'A World at Prayer\')">' +
    '<h3>' + svgIcons.globe + ' A World at Prayer</h3>' +
    '<div class="map-container"><svg viewBox="0 0 1000 500" style="background:#EDF1F5;border-radius:12px" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M0,58L0,70L950,88L957,76L893,103L855,139L847,145L830,145L834,175L801,205L777,224L778,235L762,205L740,194L710,219L666,179L639,176L657,177L659,197L627,213L612,194L595,173L608,203L637,218L613,257L611,295L591,323L557,346L540,311L536,271L521,238L478,238L454,216L457,182L490,152L530,153L566,161L598,158L576,138L605,120L585,121L566,139L555,139L537,123L545,144L513,129L478,148L496,128L524,99L538,100L572,84L550,76L529,71L592,65L629,65L687,56L705,58L751,40L807,44L889,51L0,58Z" fill="#C8D3DC"/>' +
    '<path d="M248,57L274,64L237,86L278,108L290,77L326,88L329,111L321,122L314,126L299,135L291,142L289,148L276,172L266,166L248,169L229,181L246,198L256,199L254,206L265,206L267,217L278,224L294,219L303,223L321,220L341,233L360,250L402,265L387,308L359,336L342,351L323,367L308,391L290,385L296,353L301,298L275,261L282,245L282,227L273,227L264,223L257,214L239,206L208,196L196,177L181,164L193,183L184,176L172,157L155,136L153,111L120,88L79,81L52,96L61,87L39,79L46,71L38,59L84,54L141,56L180,61L227,62L243,56Z" fill="#C8D3DC"/>' +
    '<circle cx="303" cy="136" r="7" class="map-dot"/>' +
    '<circle cx="225" cy="196" r="7" class="map-dot"/>' +
    '<circle cx="286" cy="283" r="7" class="map-dot"/>' +
    '<circle cx="371" cy="315" r="7" class="map-dot"/>' +
    '<circle cx="304" cy="343" r="7" class="map-dot"/>' +
    '<circle cx="338" cy="346" r="7" class="map-dot"/>' +
    '<circle cx="483" cy="102" r="7" class="map-dot"/>' +
    '<circle cx="507" cy="114" r="7" class="map-dot"/>' +
    '<circle cx="490" cy="138" r="7" class="map-dot"/>' +
    '<circle cx="496" cy="237" r="7" class="map-dot"/>' +
    '<circle cx="514" cy="229" r="7" class="map-dot"/>' +
    '<circle cx="591" cy="249" r="7" class="map-dot"/>' +
    '<circle cx="602" cy="254" r="7" class="map-dot"/>' +
    '<circle cx="609" cy="269" r="7" class="map-dot"/>' +
    '<circle cx="578" cy="323" r="7" class="map-dot"/>' +
    '<circle cx="703" cy="197" r="7" class="map-dot"/>' +
    '<circle cx="751" cy="184" r="7" class="map-dot"/>' +
    '<circle cx="836" cy="209" r="7" class="map-dot"/>' +
    '</svg></div>' +
    '<p>Your prayers are part of a global movement. Every day, PRAYED families in 18 countries unite in faith.</p></div>';
  document.getElementById('screenHome').innerHTML = html;
  if(typeof updateWeatherDisplay === 'function') updateWeatherDisplay();
}

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
