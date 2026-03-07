// ===== RENDER PRAY =====
function renderPray() {
  var html = '<div class="pray-header"><h2>Pray</h2><p>Find prayers for every moment of your day</p></div>';
  html += '<div class="search-bar">' + svgIcons.search + '<input placeholder="Search prayers, reflections, courses..." oninput="searchPrayers(this.value)"></div>';
  html += '<div id="prayResults"></div>';
  html += '<div class="category-grid" id="catGrid">';
  var cats = [
    {key:'rosary_stock',name:'Rosary',page:'rosary'},
    {key:'mass_02',name:'Mass',page:'mass'},
    {key:'holy_spirit',name:'Adoration',page:'adoration'},
    {key:'prayer_stock1',name:'Reflections',page:'reflections'},
    {key:'child_praying',name:'Family',page:'family-prayers'},
    {key:'office_1',name:'Courses',page:'courses'}
  ];
  // imgMap is defined globally
  cats.forEach(function(c){
    html += '<div class="cat-card" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'"><div class="overlay"><h3>'+c.name+'</h3></div></div>';
  });
  // Extra prayer categories
  var extraCats = [
    {key:'stained_glass',name:'Chaplet of Divine Mercy',page:'chaplet-mercy'},
    {key:'church_interior',name:'Stations of the Cross',page:'stations'},
    {key:'prayer_stock3',name:'Novenas',page:'novenas'},
    {key:'prayer_stock2',name:'Litanies',page:'litanies'},
    {key:'prayer_stock1',name:'\u2728 Bible',page:'bible-tab'},
    {key:'mass_02',name:'Night Prayer',page:'compline'}
  ];
  extraCats.forEach(function(c){
    html += '<div class="cat-card" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
      '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'"><div class="overlay"><h3>'+c.name+'</h3></div></div>';
  });
  // Kids section if parent
  if(userData && userData.userType && userData.userType.indexOf('Parent / Guardian')>-1) {
    var kidsCats = [
      {key:'children_rosary_2',name:'Kids Rosary',page:'kids-rosary'},
      {key:'prayer_stock4',name:'Bible Stories',page:'bible-stories'},
      {key:'prayer_stock5',name:'Saints for Kids',page:'saints-for-kids'}
    ];
    kidsCats.forEach(function(c){
      html += '<div class="cat-card" onclick="showSubPage(\''+c.page+'\',\''+c.name+'\')">' +
        '<img src="'+(imgMap[c.key]||'')+'" alt="'+c.name+'"><div class="overlay"><h3>'+c.name+'</h3></div></div>';
    });
  }
  html += '</div>';
  document.getElementById('screenPray').innerHTML = html;
}

function searchPrayers(q) {
  var results = document.getElementById('prayResults');
  if(!q) { results.innerHTML = ''; return; }
  q = q.toLowerCase();
  var all = [
    {name:'Rosary',page:'rosary'},{name:'Mass',page:'mass'},{name:'Adoration',page:'adoration'},
    {name:'Reflections',page:'reflections'},{name:'Family Prayers',page:'family-prayers'},
    {name:'Courses',page:'courses'},{name:'Night Prayer',page:'compline'},
    {name:'Gospel Reading',page:'gospel-today'},{name:'Children Rosary',page:'kids-rosary'},
    {name:'Bible Stories',page:'bible-stories'},{name:'Saints for Kids',page:'saints-for-kids'}
  ];
  var matched = all.filter(function(a){ return a.name.toLowerCase().indexOf(q)>-1; });
  if(matched.length===0) { results.innerHTML='<div class="px-16" style="color:var(--text-light);font-size:13px;padding:8px 16px">No results found</div>'; return; }
  var h = '';
  matched.forEach(function(m){
    h += '<div class="browse-card" onclick="showSubPage(\''+m.page+'\',\''+m.name+'\')"><div class="bc-info"><div class="bc-name">'+m.name+'</div></div>' +
      '<div class="bc-icon" style="background:var(--primary-blue)">' + svgIcons.chevRight + '</div></div>';
  });
  results.innerHTML = '<div style="padding:0 16px 12px">'+h+'</div>';
}
