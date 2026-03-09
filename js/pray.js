// ===== RENDER PRAY =====
function renderPray() {
  var html = '<div class="pray-header"><h2>' + t('ui.pray') + '</h2><p>' + t('ui.find_prayers') + '</p></div>';
  html += '<div class="search-bar">' + svgIcons.search + '<input placeholder="' + t('ui.search_prayers') + '" oninput="searchPrayers(this.value)"></div>';
  html += '<div id="prayResults"></div>';

  // --- PRIMARY ROW (large cards): Rosary, Mass, Family Prayers ---
  html += '<div class="section-title" style="padding:16px 16px 8px">Featured</div>';
  html += '<div style="display:flex;gap:12px;overflow-x:auto;padding:0 16px 16px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">';
  var primaryCats = [
    {key:'rosary_stock', name:'Rosary', page:'rosary', sub:'Pray the mysteries'},
    {key:'mass_02', name:'Mass', page:'mass', sub:'Daily readings & prayers'},
    {key:'child_praying', name:'Family Prayers', page:'family-prayers', sub:'Pray together'}
  ];
  primaryCats.forEach(function(c) {
    html += '<div class="prayer-card-lg" onclick="logEvent(\'solo_prayer_started\',{prayerCategory:\'' + c.name + '\'});showSubPage(\'' + c.page + '\',\'' + c.name + '\')">' +
      '<img src="' + (imgMap[c.key] || '') + '" alt="' + c.name + '" loading="lazy">' +
      '<div class="prayer-card-lg__overlay"><h3>' + c.name + '</h3><p>' + c.sub + '</p></div></div>';
  });
  html += '</div>';

  // --- Pray with Family button ---
  html += '<div style="padding:0 16px 16px">' +
    '<button onclick="openPrayerRoomUI()" style="width:100%;padding:14px;border:none;border-radius:var(--radius-md);background:var(--color-primary, #1B3A5C);color:#fff;font-size:15px;font-weight:600;font-family:var(--font-display);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="2.5"/><path d="M7.5 20c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5"/><circle cx="5" cy="7" r="2"/><path d="M1.5 16c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4"/><circle cx="19" cy="7" r="2"/><path d="M15.5 16c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4"/></svg>' +
    ' ' + t('ui.pray_with_family') + '</button></div>';

  // --- SECONDARY GRID (medium cards): Adoration, Reflections, Courses, Night Prayer ---
  html += '<div class="section-title" style="padding:0 16px 8px">Explore</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 16px">';
  var secondaryCats = [
    {key:'holy_spirit', name:'Adoration', page:'adoration'},
    {key:'prayer_stock1', name:'Reflections', page:'reflections'},
    {key:'office_1', name:'Courses', page:'courses'},
    {key:'prayer_stock3', name:'Night Prayer', page:'compline'}
  ];
  secondaryCats.forEach(function(c) {
    html += '<div class="prayer-card-sm" onclick="logEvent(\'solo_prayer_started\',{prayerCategory:\'' + c.name + '\'});showSubPage(\'' + c.page + '\',\'' + c.name + '\')">' +
      '<img src="' + (imgMap[c.key] || '') + '" alt="' + c.name + '" loading="lazy">' +
      '<div class="prayer-card-sm__overlay"><h3>' + c.name + '</h3></div></div>';
  });
  html += '</div>';

  // --- BROWSE ALL (list): Chaplet, Stations, Novenas, Litanies ---
  html += '<div class="section-title" style="padding:0 16px 8px">Browse All</div>';
  html += '<div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">';
  var browseCats = [
    {key:'stained_glass', name:'Chaplet of Divine Mercy', page:'chaplet-mercy', icon:'rosary', color:'#7C3AED'},
    {key:'church_interior', name:'Stations of the Cross', page:'stations', icon:'stationsIcon', color:'#E85D4A'},
    {key:'prayer_stock3', name:'Novenas', page:'novenas', icon:'candle', color:'#C68A2E'},
    {key:'prayer_stock2', name:'Litanies', page:'litanies', icon:'litany', color:'#0D9488'}
  ];
  browseCats.forEach(function(c) {
    html += '<div class="browse-card" onclick="showSubPage(\'' + c.page + '\',\'' + c.name + '\')">' +
      '<div class="bc-icon" style="background:' + (c.color || 'var(--color-primary)') + '">' + (svgIcons[c.icon] || svgIcons.chevRight) + '</div>' +
      '<div class="bc-info"><div class="bc-name">' + c.name + '</div></div>' +
      '<div style="flex-shrink:0;display:flex;align-items:center;color:var(--text-light)">' + svgIcons.chevRight + '</div></div>';
  });
  html += '</div>';

  // --- Kids section (conditionally shown for parents) ---
  if (userData && userData.userType && userData.userType.indexOf('Parent / Guardian') > -1) {
    html += '<div class="section-title" style="padding:0 16px 8px">For Kids</div>';
    html += '<div style="padding:0 16px 20px;display:flex;flex-direction:column;gap:8px">';
    var kidsCats = [
      {key:'children_rosary_2', name:'Kids Rosary', page:'kids-rosary'},
      {key:'prayer_stock4', name:'Bible Stories', page:'bible-stories'},
      {key:'prayer_stock5', name:'Saints for Kids', page:'saints-for-kids'}
    ];
    kidsCats.forEach(function(c) {
      html += '<div class="browse-card" onclick="showSubPage(\'' + c.page + '\',\'' + c.name + '\')">' +
        '<div class="bc-icon" style="background:var(--color-primary, #1B3A5C)">' + svgIcons.chevRight + '</div>' +
        '<div class="bc-info"><div class="bc-name">' + c.name + '</div></div>' +
        '<div style="flex-shrink:0;display:flex;align-items:center;color:var(--text-light)">' + svgIcons.chevRight + '</div></div>';
    });
    html += '</div>';
  }

  document.getElementById('screenPray').innerHTML = html;
}

function searchPrayers(q) {
  var results = document.getElementById('prayResults');
  if (!q) { results.innerHTML = ''; return; }
  q = q.toLowerCase();
  var all = [
    {name:'Rosary', page:'rosary'},
    {name:'Mass', page:'mass'},
    {name:'Family Prayers', page:'family-prayers'},
    {name:'Adoration', page:'adoration'},
    {name:'Reflections', page:'reflections'},
    {name:'Courses', page:'courses'},
    {name:'Night Prayer', page:'compline'},
    {name:'Chaplet of Divine Mercy', page:'chaplet-mercy'},
    {name:'Stations of the Cross', page:'stations'},
    {name:'Novenas', page:'novenas'},
    {name:'Litanies', page:'litanies'},
    {name:'Gospel Reading', page:'gospel-today'},
    {name:'Children Rosary', page:'kids-rosary'},
    {name:'Bible Stories', page:'bible-stories'},
    {name:'Saints for Kids', page:'saints-for-kids'}
  ];
  var matched = all.filter(function(a) { return a.name.toLowerCase().indexOf(q) > -1; });
  if (matched.length === 0) {
    results.innerHTML = '<div style="color:var(--text-light);font-size:13px;padding:8px 16px">No results found</div>';
    return;
  }
  var h = '';
  matched.forEach(function(m) {
    h += '<div class="browse-card" onclick="showSubPage(\'' + m.page + '\',\'' + m.name + '\')">' +
      '<div class="bc-info"><div class="bc-name">' + m.name + '</div></div>' +
      '<div style="flex-shrink:0;display:flex;align-items:center;color:var(--text-light)">' + svgIcons.chevRight + '</div></div>';
  });
  results.innerHTML = '<div style="padding:0 16px 12px">' + h + '</div>';
}
