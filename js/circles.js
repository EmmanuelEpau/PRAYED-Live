// ===== RENDER CIRCLES =====
function renderCircles() {
  var html = '<div class="app-header"><div class="header-left"><div class="greeting">Circles<small>Your prayer communities</small></div></div></div>';

  // --- My Circles ---
  html += '<div class="section-title" style="padding:12px 16px 8px">My Circles</div>';
  html += '<div class="circles-scroll">';
  circles.forEach(function(c) {
    // Determine type label based on circle properties
    var typeLabel = 'Family';
    if (c.icon === 'globe') typeLabel = 'Prayer Intention';
    else if (c.icon === 'church') typeLabel = 'Parish';
    html += '<div class="circle-item" onclick="showSubPage(\'circle-detail-' + c.id + '\',\'' + c.name + '\')">' +
      '<div class="circle-av" style="background:' + c.color + '">' + c.name.charAt(0) + '</div>' +
      '<div class="ci-name">' + c.name + '</div><div class="ci-count">' + c.members + ' members</div>' +
      '<div style="font-size:10px;color:var(--text-light);margin-top:2px">' + typeLabel + '</div></div>';
  });
  html += '<div class="circle-item" onclick="showSubPage(\'create-circle\',\'Create Circle\')"><div class="create-circle">' + svgIcons.plus + '</div><div class="ci-name">Create</div></div>';
  html += '</div>';

  // --- Catholic Churches Near You ---
  html += '<div class="browse-section"><h3 style="color:var(--color-primary, #1B3A5C)">Catholic Churches Near You</h3>';
  if (nearbyChurchesCache && nearbyChurchesCache.length > 0) {
    nearbyChurchesCache.slice(0, 5).forEach(function(ch) {
      var cid = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      html += '<div class="browse-card" onclick="showSubPage(\'circle-detail-' + cid + '\',\'' + ch.name.replace(/'/g, "\\'") + '\')">' +
        '<div class="bc-icon" style="background:var(--color-primary, #1B3A5C)">' + svgIcons.church + '</div>' +
        '<div class="bc-info"><div class="bc-name">' + ch.name + '<span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:500;color:var(--color-primary, #1B3A5C);background:var(--color-surface, #F3F1EC);padding:2px 6px;border-radius:4px">Parish</span></div>' +
        '<div class="bc-meta">' + ch.address + ' \u2014 ' + ch.dist + ' mi</div></div></div>';
    });
  } else {
    // No data available - prompt user to enable location
    html += '<div style="padding:16px;text-align:center;color:var(--text-light);font-size:13px">' +
      '<div style="margin-bottom:6px">' + svgIcons.church + '</div>' +
      'No churches found nearby \u2014 enable location to find local parishes</div>';
  }
  html += '</div>';

  // --- Circle type legend ---
  html += '<div style="padding:4px 16px 12px;display:flex;flex-wrap:wrap;gap:8px">';
  var typeLabels = [
    {label:'Family', desc:'private', color:'#7C3AED'},
    {label:'Parish', desc:'public', color:'var(--color-primary, #1B3A5C)'},
    {label:'Prayer Intention', desc:'global', color:'#0D9488'},
    {label:'Holy Cross', desc:'verified', color:'#C68A2E'}
  ];
  typeLabels.forEach(function(t) {
    html += '<div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text-light)">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + t.color + ';display:inline-block"></span>' +
      t.label + ' <span style="opacity:0.7">(' + t.desc + ')</span></div>';
  });
  html += '</div>';

  // --- Browse sections: Prayer Intentions, Families, Global ---
  var sectionTypes = {
    'Prayer Intentions': {data: browseCircles['intentions'], type: 'Prayer Intention'},
    'Families': {data: browseCircles['families'], type: 'Family'},
    'Global': {data: browseCircles['global'], type: 'Prayer Intention'}
  };
  Object.keys(sectionTypes).forEach(function(sec) {
    var section = sectionTypes[sec];
    html += '<div class="browse-section"><h3 style="color:var(--color-primary, #1B3A5C)">' + sec + '</h3>';
    section.data.forEach(function(c) {
      var iconHtml = c.img
        ? '<img src="' + c.img + '" alt="' + c.name + '" loading="lazy" style="width:44px;height:44px;border-radius:12px;object-fit:cover;flex-shrink:0">'
        : '<div class="bc-icon" style="background:' + c.color + '">' + (svgIcons[c.icon] || svgIcons.globe) + '</div>';
      html += '<div class="browse-card" onclick="showSubPage(\'circle-detail-' + c.id + '\',\'' + c.name + '\')">' +
        iconHtml +
        '<div class="bc-info"><div class="bc-name">' + c.name + '<span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:500;color:var(--text-light);background:var(--color-surface, #F3F1EC);padding:2px 6px;border-radius:4px">' + section.type + '</span></div>' +
        '<div class="bc-meta">' + c.meta + '</div>' +
        '<div class="bc-members">' + c.members + '</div></div></div>';
    });
    html += '</div>';
  });

  // --- Holy Cross Community Platform ---
  html += '<div class="comm-header" onclick="showSubPage(\'hc-community\',\'Holy Cross Community\')" style="display:flex;align-items:center;gap:12px">' +
    '<div style="flex:1"><h3><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg> Holy Cross Community' +
    '<span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:500;color:#C68A2E;background:rgba(198,138,46,0.15);padding:2px 6px;border-radius:4px">Verified</span></h3>' +
    '<p>Secure communication for CSC communities, HCFM staff &amp; Holy Cross institutions worldwide</p></div>' +
    '<img src="' + imgMap['csc_anchor_gold'] + '" alt="CSC" loading="lazy" style="width:48px;height:48px;object-fit:contain;flex-shrink:0;opacity:0.9"></div>';

  document.getElementById('screenCircles').innerHTML = html;
}

// ===== SUB-PAGE CONTENT =====
function getSubPageContent(name) {
  // imgMap is defined globally
  var content = {
    'rosary': '<img class="sp-hero" src="'+imgMap['rosary_stock']+'" alt="Rosary" loading="lazy">' +
      '<div class="sp-section"><h3>The Holy Rosary</h3><p>The Rosary is a powerful meditation on the life of Jesus through the eyes of His Mother Mary. For over 75 years, Family Rosary has helped families pray together. Join families around the world in this ancient prayer.</p></div>' +
      '<div class="sp-section"><h3>Today\'s Mystery</h3><p style="margin-bottom:8px">Based on the day of the week, pray today\'s mystery with families worldwide.</p>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Todays Rosary\',\'rk7Acpd5Lqw\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Pray Today\'s Rosary <span class="sp-btn-right"><span class="live-dot"></span> praying</span></button></div>' +
      '<div class="sp-section"><h3>The Four Mysteries</h3>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Joyful Mysteries\',\'XkE8fuk1rHs\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/></svg> Joyful Mysteries</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Sorrowful Mysteries\',\'ngqZ0Vwn-Eg\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--coral)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/></svg> Sorrowful Mysteries</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Glorious Mysteries\',\'W2SnQhWhcJc\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--teal)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/></svg> Glorious Mysteries</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Luminous Mysteries\',\'dgeZdrDu84U\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--primary-blue)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/></svg> Luminous Mysteries</button></div>' +
      '<div class="sp-section"><h3>Learn to Pray</h3>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'How to Pray the Rosary\',\'d1cKNvMBtnQ\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--navy)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg> How to Pray the Rosary</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Rosary for Children\',\'3qBKhhp6c60\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--teal)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> Rosary for Children</button></div>' +
      '<div class="sp-section"><h3>The Five Steps</h3><div class="sp-prayer">1. Make the Sign of the Cross<br>2. Pray the Apostles\' Creed<br>3. Pray one Our Father<br>4. Pray three Hail Marys<br>5. Pray the Glory Be<br><br>For each decade: Announce the Mystery, pray one Our Father, ten Hail Marys, and one Glory Be.</div></div>',

    'mass': '<img class="sp-hero" src="'+imgMap['mass_01']+'" alt="Mass" loading="lazy">' +
      '<div class="sp-section"><h3>Daily Mass</h3><p>The Eucharist is the source and summit of the Christian life. Join us for today\'s celebration of the Holy Sacrifice of the Mass.</p></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Todays Mass\',\'v7ur426-ZDs\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Watch Today\'s Mass</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Nicene Creed\',\'tJcruoD852Q\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--navy)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg> The Nicene Creed</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Stations of the Cross\',\'CTPalK4yFx0\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--coral)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Stations of the Cross</button>' +
      '<div class="sp-section"><h3>Today\'s Readings</h3><div class="sp-prayer"><span class="response">First Reading:</span> Isaiah 55:10-11<br>"For just as from the heavens the rain and snow come down and do not return there till they have watered the earth..."<br><br><span class="response">Responsorial Psalm:</span> Psalm 34<br>"The Lord is close to the brokenhearted."<br><br><span class="response">Gospel:</span> Matthew 6:7-15<br>"Your Father knows what you need before you ask him."</div></div>',

    'adoration': '<img class="sp-hero" src="'+imgMap['stained_glass']+'" alt="Adoration" loading="lazy">' +
      '<div class="sp-section"><h3>Eucharistic Adoration</h3><p>Spend time in the presence of the Blessed Sacrament. Let the peace of Christ fill your heart as you rest in His presence.</p></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Holy Hour\',\'4j1gOLI0AI4\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Begin Holy Hour</button>' +
      '<div class="sp-section"><h3>Guided Meditation</h3><div class="sp-prayer">Find a quiet place. Close your eyes. Breathe deeply.<br><br>Invite Jesus into your heart...<br><br>Rest in His presence. You do not need words. Simply be with Him.<br><br>"Be still, and know that I am God." \u2014 Psalm 46:10</div></div>' +
      '<div class="sp-section"><h3>Reflection Prompts</h3><div class="sp-prayer">What are you grateful for today?<br><br>What burdens do you carry?<br><br>What does God want you to hear right now?<br><br>How can you share His love with others today?</div></div>',

    'family-prayers': '<img class="sp-hero" src="'+imgMap['family_table_prayer']+'" alt="Family Prayer" loading="lazy">' +
      '<div class="sp-section"><h3>Family Prayer</h3><p>Whether you are just starting or deepening your practice, family prayer transforms homes. Begin where you are and grow together in faith.</p></div>' +
      '<div class="sp-section"><h3>Getting Started</h3><div class="sp-prayer">Begin with bedtime prayers. Even 30 seconds together changes everything. The goal is not perfection \u2014 it is presence.</div></div>' +
      '<div class="sp-section"><h3>Grace Before Meals</h3><div class="sp-prayer"><span class="response">Traditional:</span><br>"Bless us, O Lord, and these Thy gifts, which we are about to receive from Thy bounty, through Christ our Lord. Amen."<br><br><span class="response">Child-Friendly:</span><br>"Thank you, God, for this food. Thank you for our family. Help us to love each other well. Amen."</div></div>' +
      '<div class="sp-section"><h3>Bedtime Prayers</h3><div class="sp-prayer"><span class="response">Angel of God:</span><br>"Angel of God, my guardian dear, to whom God\'s love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen."</div></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Family Rosary\',\'OEjIKD6McsY\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Watch: Family Rosary Introduction</button>',

    'reflections': '<img class="sp-hero" src="'+imgMap['prayer_stock1']+'" alt="Reflections" loading="lazy">' +
      '<div class="sp-section"><h3>Daily Reflections</h3><p>Take a moment each day to reflect on God\'s Word and how it speaks to your life. Allow Scripture to transform your heart.</p></div>' +
      '<div class="sp-section"><h3>Today\'s Gospel Reflection</h3><div class="sp-prayer"><span class="response">Matthew 6:6</span><br>"But when you pray, go to your inner room, close the door, and pray to your Father in secret. And your Father who sees in secret will repay you."<br><br>In the quiet of our hearts, God speaks most clearly. Today, find a moment of silence. Step away from the noise. Let God meet you there.</div></div>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Fr. Peyton on Prayer\',\'VWebKiHR95c\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold)"><path d="M8 5v14l11-7z"/></svg> Mother Teresa and Fr. Peyton</button>' +
      '<button class="sp-btn" onclick="showInAppBrowser(\'Catholic Mom\',\'https://www.catholicmom.com\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--teal)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg> From Catholic Mom</button>',

    'compline': '<div class="sp-section"><h3>Night Prayer (Compline)</h3><p>End your day in peace with the ancient prayer of the Church.</p></div>' +
      '<div class="sp-prayer"><span class="response">V.</span> God, come to my assistance.<br><span class="response">R.</span> Lord, make haste to help me.<br><br><span class="response">V.</span> Glory be to the Father, and to the Son, and to the Holy Spirit.<br><span class="response">R.</span> As it was in the beginning, is now, and ever shall be, world without end. Amen.<br><br><strong>Psalm 91</strong><br><br>You who dwell in the shelter of the Most High,<br>who abide in the shadow of the Almighty,<br>say to the Lord, "My refuge and my fortress,<br>my God in whom I trust."<br><br>For He will rescue you from the snare of the fowler,<br>from the destroying pestilence.<br>With His pinions He will cover you,<br>and under His wings you shall take refuge.<br><br><span class="response">V.</span> Into your hands, Lord, I commend my spirit.<br><span class="response">R.</span> You have redeemed us, Lord God of truth.<br><br><strong>Canticle of Simeon</strong><br><br>Lord, now you let your servant go in peace;<br>your word has been fulfilled:<br>my own eyes have seen the salvation<br>which you have prepared in the sight of every people:<br>a light to reveal you to the nations<br>and the glory of your people Israel.<br><br><span class="response">Conclude:</span><br>"May the all-powerful Lord grant us a restful night and a peaceful death. Amen."</div>',

    'courses': '<div class="sp-section"><h3>Courses & Learning</h3><p>Deepen your faith with guided courses from Holy Cross Family Ministries.</p></div>' +
      '<div class="course-card"><h4>How to Pray the Rosary</h4><div class="cc-lessons">6 lessons</div><p>A step-by-step guide to praying the Rosary, from the basics to a deeper meditation on the Mysteries.</p><div class="cc-progress"><div class="cc-prog-fill" style="width:60%"></div></div><button class="cc-start" onclick="showVideoPlayer(\'How to Pray\',\'d1cKNvMBtnQ\')">Continue</button></div>' +
      '<div class="course-card"><h4>Introduction to Mariology</h4><div class="cc-lessons">8 lessons</div><p>Explore the theology and devotion surrounding the Blessed Virgin Mary, from Scripture to the present day.</p><div class="cc-progress"><div class="cc-prog-fill" style="width:25%"></div></div><button class="cc-start">Start</button></div>' +
      '<div class="course-card"><h4>Prayer Foundations</h4><div class="cc-lessons">4 lessons</div><p>Build a lasting prayer practice. Learn the foundations of Catholic prayer from lectio divina to contemplation.</p><div class="cc-progress"><div class="cc-prog-fill" style="width:0%"></div></div><button class="cc-start">Start</button></div>' +
      '<div class="course-card"><h4>Saints and Their Stories</h4><div class="cc-lessons">12 lessons</div><p>Meet the saints who shaped the faith. Each lesson explores the life, virtues, and legacy of a beloved saint.</p><div class="cc-progress"><div class="cc-prog-fill" style="width:0%"></div></div><button class="cc-start">Start</button></div>',

    'gospel-today': '<div class="sp-section"><h3>Today\'s Gospel</h3><div class="sp-prayer"><span class="response">Matthew 6:7-15</span><br><br>Jesus said to his disciples: "In praying, do not babble like the pagans, who think that they will be heard because of their many words. Do not be like them. Your Father knows what you need before you ask him.<br><br>This is how you are to pray:<br><br><em>Our Father who art in heaven,<br>hallowed be thy name,<br>thy Kingdom come,<br>thy will be done,<br>on earth as it is in heaven.<br>Give us this day our daily bread;<br>and forgive us our trespasses,<br>as we forgive those who trespass against us;<br>and lead us not into temptation,<br>but deliver us from evil.</em><br><br>If you forgive others their transgressions, your heavenly Father will forgive you."</div></div>' +
      '<div class="sp-section"><h3>Reflection</h3><p>Jesus teaches us that prayer is not about the quantity of words but the quality of our hearts. The Our Father is both a prayer and a pattern for all prayer \u2014 it begins with praise, moves to petition, and ends with trust.</p></div>',

    'fr-peyton': '<img class="sp-hero" src="'+imgMap['peyton_portrait']+'" alt="Fr. Peyton" loading="lazy">' +
      '<div class="sp-section"><h3>Fr. Patrick Peyton, C.S.C.</h3><p>Father Patrick Peyton was born in 1909 in County Mayo, Ireland. After immigrating to the United States at age 17, he entered the Congregation of Holy Cross and was ordained a priest. Known as "The Rosary Priest," Fr. Peyton dedicated his life to promoting family prayer through the Rosary. He founded the Family Rosary Crusade and became a television pioneer with the Family Theater of the Air program. His unwavering conviction that "The family that prays together stays together" became the mission of Holy Cross Family Ministries. Fr. Peyton was declared Venerable in 1998 and is on the path to sainthood.</p></div>' +
      '<div class="sp-section"><h3>Timeline</h3><div class="timeline">' +
      '<div class="timeline-item"><div class="tl-year">1909</div><div class="tl-text">Born in Carracastle, County Mayo, Ireland</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1926</div><div class="tl-text">Immigrates to the United States</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1941</div><div class="tl-text">Ordained as a Holy Cross priest</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1942</div><div class="tl-text">Founds the Family Rosary Crusade</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1947</div><div class="tl-text">Launches Family Theater of the Air</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1952</div><div class="tl-text">Begins television broadcasts</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1992</div><div class="tl-text">Dies at age 83</div></div>' +
      '<div class="timeline-item"><div class="tl-year">1998</div><div class="tl-text">Declared Venerable by the Church</div></div></div></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Fr. Peyton Documentary\',\'zt_r5GWpQqs\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Watch the Documentary</button>' +
      '<button class="sp-btn" onclick="showVideoPlayer(\'Mother Teresa & Fr. Peyton\',\'VWebKiHR95c\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold)"><path d="M8 5v14l11-7z"/></svg> Mother Teresa and Fr. Peyton</button>' +
      '<button class="sp-btn primary" style="margin-top:16px;background:linear-gradient(135deg,var(--gold),#A0722A)" onclick="showInAppBrowser(\'Donate\',\'https://www.hcfm.org/donate\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Continue His Mission</button>',

    'challenge': '<div class="sp-section"><h3>Lent Family Prayer Challenge</h3><p>Join 23,456 families in a 30-day journey of prayer, reflection, and community during the season of Lent.</p></div>' +
      '<div style="background:var(--primary-blue);color:#fff;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">' +
      '<div style="font-size:32px;font-weight:800">Day 7</div><div style="font-size:14px;opacity:0.9">of 30</div>' +
      '<div style="height:6px;background:rgba(255,255,255,0.3);border-radius:3px;margin-top:12px"><div style="height:100%;width:23%;background:#fff;border-radius:3px"></div></div></div>' +
      '<div class="sp-section"><h3>Today\'s Challenge</h3><div class="sp-prayer">Pray one decade of the Rosary as a family. Choose the Sorrowful Mysteries and reflect on how Jesus suffered for love of us.<br><br><span class="response">Intention:</span> Pray for families who are separated or struggling.</div></div>' +
      '<button class="sp-btn primary" onclick="playContent(\'Lent Challenge Day 7\',\''+imgMap['diverse_family_praying']+'\',audioSources.lent)"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Begin Today\'s Prayer</button>',

    'daily-challenge': '<div class="sp-section"><h3>Daily Challenge</h3><p>Test your Catholic knowledge with a daily trivia question!</p></div>' +
      '<div style="font-size:15px;font-weight:600;color:var(--navy);margin-bottom:16px;line-height:1.4">In which mystery of the Rosary do we meditate on the Resurrection of Jesus?</div>' +
      '<button class="trivia-option" onclick="submitChallengeAnswer(this,false)">Joyful Mysteries</button>' +
      '<button class="trivia-option" onclick="submitChallengeAnswer(this,false)">Sorrowful Mysteries</button>' +
      '<button class="trivia-option" onclick="submitChallengeAnswer(this,true)">Glorious Mysteries</button>' +
      '<button class="trivia-option" onclick="submitChallengeAnswer(this,false)">Luminous Mysteries</button>' +
      '<div id="triviaResult"></div>' +
      '<div style="margin-top:16px;padding:12px;background:var(--light-gray);border-radius:12px;text-align:center">' +
      '<div style="font-size:13px;color:var(--text-light);display:flex;align-items:center;justify-content:center;gap:6px"><span style="display:inline-flex;width:16px;height:16px">' + svgIcons.flame + '</span> Streak: 7 days</div></div>',

    'notifications': '<div class="sp-section"><h3 style="margin-bottom:4px">Today</h3>' +
      '<div class="notif-item"><div class="ni-icon">' + svgIcons.bell + '</div><div class="ni-body"><div class="ni-text">Daily Rosary starting in 15 minutes</div><div class="ni-time">5 minutes ago</div></div><div class="ni-dot"></div></div>' +
      '<div class="notif-item"><div class="ni-icon">' + svgIcons.flame + '</div><div class="ni-body"><div class="ni-text">Congratulations! 7-day streak earned</div><div class="ni-time">2 hours ago</div></div><div class="ni-dot"></div></div>' +
      '<div class="notif-item"><div class="ni-icon">' + svgIcons.family + '</div><div class="ni-body"><div class="ni-text">3 new members joined your circle</div><div class="ni-time">4 hours ago</div></div><div class="ni-dot read"></div></div></div>' +
      '<div class="sp-section"><h3 style="margin-bottom:4px">Earlier</h3>' +
      '<div class="notif-item"><div class="ni-icon">' + svgIcons.heart + '</div><div class="ni-body"><div class="ni-text">Maria Santos is praying for your intention</div><div class="ni-time">Yesterday</div></div><div class="ni-dot read"></div></div>' +
      '<div class="notif-item"><div class="ni-icon">' + svgIcons.star + '</div><div class="ni-body"><div class="ni-text">Your giving helped build a new classroom!</div><div class="ni-time">2 days ago</div></div><div class="ni-dot read"></div></div></div>',

    'settings': '<div class="sp-section"><h3>Prayer Preferences</h3></div>' +
      '<div class="settings-list">' +
      '<div class="settings-item" onclick="toggleDarkMode()"><div class="si-left">' + svgIcons.moon + '<span class="si-label">Dark Mode</span></div><div class="toggle-switch'+(document.body.classList.contains('dark-mode')?' on':'')+'"><div class="toggle-knob"></div></div></div>' +
      '<div class="settings-item" onclick="toggleDistanceUnit()"><div class="si-left">' + svgIcons.globe + '<span class="si-label">Distance Units</span></div><span id="distUnitLabel" style="font-size:13px;color:var(--primary-blue);font-weight:600">'+(distanceUnit==='mi'?'Miles':'Kilometers')+'</span></div>' +
      '</div>' +
      '<div class="sp-section" style="margin-top:16px"><h3>Prayer Times</h3><p>Adjust your daily prayer reminders</p></div>' +
      '<div class="settings-list">' +
      '<div class="settings-item"><div class="si-left">' + svgIcons.sun + '<span class="si-label">Morning Prayer</span></div><span style="font-size:13px;color:var(--primary-blue);font-weight:600">'+(userData&&userData.morningTime?userData.morningTime:'07:00')+'</span></div>' +
      '<div class="settings-item"><div class="si-left">' + svgIcons.bell + '<span class="si-label">Midday Prayer</span></div><span style="font-size:13px;color:var(--primary-blue);font-weight:600">'+(userData&&userData.middayTime?userData.middayTime:'12:00')+'</span></div>' +
      '<div class="settings-item"><div class="si-left">' + svgIcons.cross + '<span class="si-label">Afternoon Prayer</span></div><span style="font-size:13px;color:var(--primary-blue);font-weight:600">'+(userData&&userData.afternoonTime?userData.afternoonTime:'15:00')+'</span></div>' +
      '<div class="settings-item"><div class="si-left">' + svgIcons.moon + '<span class="si-label">Evening Prayer</span></div><span style="font-size:13px;color:var(--primary-blue);font-weight:600">'+(userData&&userData.eveningTime?userData.eveningTime:'20:00')+'</span></div>' +
      '</div>' +
      '<div class="sp-section" style="margin-top:16px"><h3>Notifications</h3></div>' +
      '<div class="settings-list">' +
      '<div class="settings-item" onclick="requestNotifPermission()"><div class="si-left">' + svgIcons.bell + '<span class="si-label">Enable Notifications</span></div>' +
      '<span style="font-size:11px;color:var(--primary-blue);font-weight:600">Tap to Enable</span></div>' +
      '</div>' +
      '<div style="text-align:center;padding:16px;font-size:12px;color:var(--gray)">PRAYED 1.0.0 &middot; Holy Cross Family Ministries</div>',

    'giving-detail': '<div class="sp-section"><h3>Your Giving Impact</h3><p>Every gift makes a difference. Holy Cross Family Ministries works in 18 countries to bring families together in prayer.</p></div>' +
      '<div style="background:var(--light-gray);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">' +
      '<div style="font-size:13px;color:var(--text-light)">If 1,000 families give $5...</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--navy);margin-top:4px">We could provide prayer books to 5,000 children</div></div>' +
      '<div class="sp-section"><h3>Giving History</h3>' +
      '<div style="padding:12px;border-bottom:1px solid var(--light-gray)"><div style="font-size:14px;font-weight:500;color:var(--navy)">Family Membership</div><div style="font-size:12px;color:var(--text-light)">$99/year \u2014 Renewed March 1, 2025</div></div>' +
      '<div style="padding:12px;border-bottom:1px solid var(--light-gray)"><div style="font-size:14px;font-weight:500;color:var(--navy)">Holy Cross Ministries</div><div style="font-size:12px;color:var(--text-light)">$25 \u2014 February 14, 2025</div></div>' +
      '<div style="padding:12px"><div style="font-size:14px;font-weight:500;color:var(--navy)">Uganda Mission Support</div><div style="font-size:12px;color:var(--text-light)">$50 \u2014 January 15, 2025</div></div></div>' +
      '<div style="background:rgba(37,99,235,0.05);border-radius:12px;padding:16px;text-align:center">' +
      '<p style="font-size:14px;color:var(--navy);line-height:1.5">Your giving has helped build 2 classrooms and provide prayer books to 150 families. Thank you!</p></div>' +
      '<button class="sp-btn primary" style="margin-top:16px" onclick="showInAppBrowser(\'Donate\',\'https://www.hcfm.org/donate\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> Donate Now</button>',

    'add-family': '<div class="sp-section"><h3>Add Family Member</h3><p>Invite your family to pray together on PRAYED.</p></div>' +
      '<input id="famFirstName" class="onb-input" placeholder="First name"><input id="famLastName" class="onb-input" placeholder="Last name">' +
      '<select id="famRelation" class="onb-select"><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option></select>' +
      '<input id="famEmail" class="onb-input" type="email" placeholder="Email (optional)">' +
      '<button class="sp-btn primary" style="margin-top:8px" onclick="addFamilyMember()"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Add Member</button>',

    'badges': '<div class="sp-section"><h3>Your Badges</h3><p>Earn badges by building consistent prayer habits and engaging with the PRAYED community.</p></div>' +
      '<div class="sp-section"><h3>Earned</h3>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<div class="card" style="padding:16px;text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:var(--gold);margin:0 auto 8px;display:flex;align-items:center;justify-content:center">' + svgIcons.check + '</div><div style="font-size:13px;font-weight:600;color:var(--navy)">First Prayer</div><div style="font-size:11px;color:var(--text-light)">Completed your first prayer</div></div>' +
      '<div class="card" style="padding:16px;text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:#DB2777;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">' + svgIcons.star + '</div><div style="font-size:13px;font-weight:600;color:var(--navy)">Rosary Master</div><div style="font-size:11px;color:var(--text-light)">Prayed all 4 mysteries</div></div>' +
      '<div class="card" style="padding:16px;text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:var(--primary-blue);margin:0 auto 8px;display:flex;align-items:center;justify-content:center">' + svgIcons.flame + '</div><div style="font-size:13px;font-weight:600;color:var(--navy)">7-Day Streak</div><div style="font-size:11px;color:var(--text-light)">Prayed 7 days in a row</div></div>' +
      '<div class="card" style="padding:16px;text-align:center"><div style="width:48px;height:48px;border-radius:50%;background:var(--teal);margin:0 auto 8px;display:flex;align-items:center;justify-content:center">' + svgIcons.heart + '</div><div style="font-size:13px;font-weight:600;color:var(--navy)">Family Bond</div><div style="font-size:11px;color:var(--text-light)">Prayed with family 5 times</div></div></div></div>' +
      '<div class="sp-section"><h3>In Progress</h3>' +
      '<div class="card" style="padding:16px;margin-bottom:12px;opacity:0.6"><div style="display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;border-radius:50%;background:var(--gray);display:flex;align-items:center;justify-content:center">' + svgIcons.globe + '</div><div><div style="font-size:13px;font-weight:600;color:var(--navy)">Global Intercessor</div><div style="font-size:11px;color:var(--text-light)">Pray for people in 10 countries</div><div style="height:4px;background:var(--light-gray);border-radius:2px;margin-top:6px;width:120px"><div style="height:100%;width:80%;background:var(--teal);border-radius:2px"></div></div></div></div></div>' +
      '<div class="card" style="padding:16px;opacity:0.6"><div style="display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;border-radius:50%;background:var(--gray);display:flex;align-items:center;justify-content:center">' + svgIcons.star + '</div><div><div style="font-size:13px;font-weight:600;color:var(--navy)">100 Days</div><div style="font-size:11px;color:var(--text-light)">Keep going! 88 days away.</div></div></div></div></div>',

    'passport-detail': '<div class="sp-section"><h3>Rosary Passport</h3><p>Pray the Rosary with communities around the world. Each time you join a rosary from a different country, you earn a passport stamp. Track your global prayer journey.</p></div>' +
      '<div style="text-align:center;padding:16px;background:var(--light-gray);border-radius:12px;margin-bottom:16px"><div style="font-size:32px;font-weight:800;color:var(--navy)">8</div><div style="font-size:13px;color:var(--text-light)">Countries Visited</div></div>' +
      '<div class="sp-section"><h3>Your Stamps</h3><p>Keep praying to unlock more countries and connect with the global Church!</p></div>',

    'world-at-prayer': '<div class="sp-section"><h3>A World at Prayer</h3><p>Holy Cross Family Ministries operates in 18 countries across 6 continents, bringing families together through the power of prayer.</p></div>' +
      '<div class="sp-section"><h3>Ministry Centers</h3>' +
      '<div style="display:grid;gap:8px">' +
      '<div class="browse-card"><div class="bc-icon" style="background:var(--primary-blue)">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">North Easton, USA (HQ)</div><div class="bc-meta">Global headquarters of HCFM</div></div></div>' +
      '<div class="browse-card"><div class="bc-icon" style="background:var(--teal)">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">Nairobi, Kenya</div><div class="bc-meta">East African ministry center</div></div></div>' +
      '<div class="browse-card"><div class="bc-icon" style="background:var(--coral)">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">Kampala, Uganda</div><div class="bc-meta">Youth and children programs</div></div></div>' +
      '<div class="browse-card"><div class="bc-icon" style="background:var(--gold)">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">Manila, Philippines</div><div class="bc-meta">Family Rosary Asia</div></div></div>' +
      '<div class="browse-card"><div class="bc-icon" style="background:#7C3AED">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">Mumbai, India</div><div class="bc-meta">South Asian ministry</div></div></div>' +
      '<div class="browse-card"><div class="bc-icon" style="background:var(--primary-blue)">' + svgIcons.church + '</div><div class="bc-info"><div class="bc-name">Dublin, Ireland</div><div class="bc-meta">Fr. Peyton\'s homeland</div></div></div>' +
      '</div></div>',

    'hc-community': '<div id="hcLoginGate">' +
      '<div style="text-align:center;padding:40px 20px 20px">' +
      '<img src="'+imgMap['csc_anchor_navy']+'" alt="CSC" loading="lazy" style="width:80px;height:80px;object-fit:contain;margin:0 auto 16px">' +
      '<h2 style="font-size:22px;font-weight:700;color:var(--navy);margin-bottom:6px">Holy Cross Community</h2>' +
      '<p style="font-size:13px;color:var(--text-light);margin-bottom:24px">Secure platform for Congregation of Holy Cross members, HCFM staff &amp; Holy Cross institutions</p>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px">' +
      '<span class="lock-badge">' + svgIcons.lock + ' End-to-End Encrypted</span>' +
      '<span class="lock-badge" style="color:var(--teal);background:rgba(13,148,136,0.1)">' + svgIcons.verified + ' Verified Members</span></div>' +
      '</div>' +
      '<div style="padding:0 16px">' +
      '<input class="onb-input" id="hcEmail" placeholder="Holy Cross email address" type="email">' +
      '<input class="onb-input" id="hcPass" placeholder="Password" type="password">' +
      '<button class="sp-btn primary" style="width:100%;margin-bottom:12px" onclick="hcLogin()">' +
      '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg> Sign In</button>' +
      '<div style="text-align:center;font-size:12px;color:var(--text-light);margin-bottom:16px">or</div>' +
      '<button class="sp-btn" style="width:100%;border:2px solid var(--primary-blue);color:var(--primary-blue);margin-bottom:12px" onclick="hcLogin()">' +
      'Sign in with SSO (Holy Cross)</button>' +
      '<div style="text-align:center;margin-top:12px">' +
      '<span style="font-size:12px;color:var(--text-light)">Don\u2019t have access? </span>' +
      '<span style="font-size:12px;color:var(--primary-blue);font-weight:600;cursor:pointer">Request Credentials</span></div>' +
      '<div style="text-align:center;margin-top:20px;padding:12px;background:rgba(37,99,235,0.05);border-radius:12px">' +
      '<p style="font-size:11px;color:var(--text-light);line-height:1.5">Access is restricted to verified members of the Congregation of Holy Cross, HCFM staff, and affiliated Holy Cross institutions. Contact your provincial secretary or HCFM administrator for credentials.</p></div>' +
      '</div></div>' +
      '<div id="hcMainContent" style="display:none">' +
      '<div class="comm-header" style="margin:0 0 12px;display:flex;align-items:center;gap:12px">' +
      '<div style="flex:1"><h3><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg> Holy Cross Community</h3>' +
      '<p>Verified &amp; secure platform for Holy Cross communities worldwide</p></div>' +
      '<img src="'+imgMap['csc_anchor_gold']+'" alt="CSC" loading="lazy" style="width:48px;height:48px;object-fit:contain;flex-shrink:0;opacity:0.9"></div>' +
      '<div class="comm-tabs" id="commTabs">' +
      '<div class="comm-tab active" onclick="switchCommTab(\'csc\',this)">CSC Provinces</div>' +
      '<div class="comm-tab" onclick="switchCommTab(\'hcfm\',this)">HCFM</div>' +
      '<div class="comm-tab" onclick="switchCommTab(\'sisters\',this)">Sisters</div>' +
      '<div class="comm-tab" onclick="switchCommTab(\'education\',this)">Education</div>' +
      '</div>' +
      '<div id="commContent"></div></div>',

    'hc-channel': '',

    'create-circle': '<div class="sp-section"><h3>Create a Circle</h3><p>Start a prayer community and invite others to join you.</p></div>' +
      '<input id="createCircleName" class="onb-input" placeholder="Circle name">' +
      '<select id="createCircleCategory" class="onb-select"><option>Prayer Intentions</option><option>Parish</option><option>Family</option><option>School</option><option>Global</option></select>' +
      '<textarea id="createCircleDesc" class="onb-input" style="height:80px;resize:none" placeholder="Describe your circle..."></textarea>' +
      '<button class="sp-btn primary" onclick="createCircle()"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Create Circle</button>',

    'kids-rosary': '<img class="sp-hero" src="'+imgMap['children_rosary_2']+'" alt="Kids Rosary" loading="lazy">' +
      '<div class="sp-section"><h3>Children\'s Rosary</h3><p>A beautiful, child-friendly version of the Rosary. Perfect for kids ages 5-12. Designed to engage young hearts in prayer.</p></div>' +
      '<div style="background:rgba(13,148,136,0.1);border-radius:12px;padding:12px;margin-bottom:16px;font-size:13px;color:var(--teal)">This is a safe, curated space for children ages 5-12.</div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Rosary for Children\',\'3qBKhhp6c60\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Watch the Children\'s Rosary</button>' +
      '<div class="sp-section"><h3>How Kids Pray the Rosary</h3><div class="sp-prayer">1. Hold the cross and make the Sign of the Cross<br>2. Say "I believe in God" (the Creed)<br>3. On each big bead, say "Our Father"<br>4. On each small bead, say "Hail Mary"<br>5. After 10 small beads, say "Glory Be"<br>6. Think about the story of Jesus for each group of 10</div></div>',

    'bible-stories': '<div class="sp-section"><h3>Bible Stories for Kids</h3><p>Beautiful stories from Scripture, told in a way children can understand and love.</p></div>' +
      '<div class="story-card"><div class="sc-body"><h4>The Good Samaritan</h4><p>A man was hurt and left on the road. Two people walked past him. But a kind stranger stopped, bandaged his wounds, and took care of him. Jesus tells us: be the kind stranger.</p><div class="sc-meta">5 min read</div></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>David and Goliath</h4><p>A young shepherd boy named David faced a giant warrior named Goliath. With only a sling and a stone \u2014 and trust in God \u2014 David defeated the giant. God can help us face our own giants.</p><div class="sc-meta">6 min read</div></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>The Lost Sheep</h4><p>A shepherd had 100 sheep and one wandered away. He left the 99 to find the lost one. When he found it, he was so happy! Jesus says God loves each of us that much.</p><div class="sc-meta">4 min read</div></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>Jonah and the Whale</h4><p>God asked Jonah to deliver a message, but Jonah ran away! He ended up inside a great fish for three days. When he finally listened to God, amazing things happened.</p><div class="sc-meta">5 min read</div></div></div>',

    'chaplet-mercy': '<div class="sp-section"><h3>Chaplet of Divine Mercy</h3><p>Given by Jesus to St. Faustina, this powerful prayer is prayed on ordinary rosary beads. Pray at 3:00 PM, the hour of mercy.</p></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Divine Mercy Chaplet\',\'KGXJCE_DpPw\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Pray the Chaplet <span class="sp-btn-right"><span class="live-dot"></span> praying</span></button>' +
      '<div class="sp-section"><h3>How to Pray</h3><div class="sp-prayer"><strong>Opening:</strong><br>Our Father, Hail Mary, The Apostles\' Creed<br><br><strong>On each large bead:</strong><br>"Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world."<br><br><strong>On each small bead (10x):</strong><br>"For the sake of His sorrowful Passion, have mercy on us and on the whole world."<br><br><strong>Closing (3x):</strong><br>"Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world."</div></div>',

    'stations': '<div class="sp-section"><h3>Stations of the Cross</h3><p>Walk with Jesus on His journey to Calvary through these 14 stations of prayer and reflection.</p></div>' +
      '<button class="sp-btn primary" onclick="showVideoPlayer(\'Stations of the Cross\',\'CTPalK4yFx0\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Pray the Stations</button>' +
      '<div class="sp-section"><h3>The 14 Stations</h3><div class="sp-prayer">' +
      '<strong>I.</strong> Jesus is condemned to death<br><strong>II.</strong> Jesus carries His cross<br><strong>III.</strong> Jesus falls the first time<br><strong>IV.</strong> Jesus meets His Mother<br><strong>V.</strong> Simon of Cyrene helps carry the cross<br><strong>VI.</strong> Veronica wipes the face of Jesus<br><strong>VII.</strong> Jesus falls the second time<br><strong>VIII.</strong> Jesus meets the women of Jerusalem<br><strong>IX.</strong> Jesus falls the third time<br><strong>X.</strong> Jesus is stripped of His garments<br><strong>XI.</strong> Jesus is nailed to the cross<br><strong>XII.</strong> Jesus dies on the cross<br><strong>XIII.</strong> Jesus is taken down from the cross<br><strong>XIV.</strong> Jesus is laid in the tomb<br><br><em>At each station: "We adore You, O Christ, and we bless You, because by Your Holy Cross You have redeemed the world."</em></div></div>',

    'novenas': '<div class="sp-section"><h3>Novenas</h3><p>Nine days of focused prayer for special intentions. Choose a novena to begin your journey of faith.</p></div>' +
      '<div class="course-card"><h4>Novena to the Sacred Heart</h4><div class="cc-lessons">9 days</div><p>Pray to the Sacred Heart of Jesus for healing, protection, and love. One of the most powerful devotions.</p><button class="cc-start" onclick="showVideoPlayer(\'Sacred Heart Novena\',\'8OfwQGqJrWA\')">Begin</button></div>' +
      '<div class="course-card"><h4>Novena to St. Jude</h4><div class="cc-lessons">9 days</div><p>The patron saint of hopeless cases and desperate situations. Pray for impossible intentions.</p><button class="cc-start" onclick="showVideoPlayer(\'St Jude Novena\',\'M8L_RtPp8BI\')">Begin</button></div>' +
      '<div class="course-card"><h4>Novena to Our Lady of Perpetual Help</h4><div class="cc-lessons">9 days</div><p>Ask Our Lady for her constant intercession and loving care in all your needs.</p><button class="cc-start">Begin</button></div>' +
      '<div class="course-card"><h4>Novena to St. Joseph</h4><div class="cc-lessons">9 days</div><p>Pray to the foster father of Jesus for family protection, work, and provision.</p><button class="cc-start">Begin</button></div>',

    'litanies': '<div class="sp-section"><h3>Litanies</h3><p>Beautiful repetitive prayers that invoke the intercession of God, the saints, and the Blessed Mother.</p></div>' +
      '<div class="sp-section"><h3>Litany of the Blessed Virgin Mary</h3><div class="sp-prayer"><span class="response">Lord, have mercy.</span> Lord, have mercy.<br><span class="response">Christ, have mercy.</span> Christ, have mercy.<br><span class="response">Lord, have mercy.</span> Lord, have mercy.<br><br><span class="response">Holy Mary,</span> pray for us.<br><span class="response">Holy Mother of God,</span> pray for us.<br><span class="response">Most honored of virgins,</span> pray for us.<br><span class="response">Mother of Christ,</span> pray for us.<br><span class="response">Mother of the Church,</span> pray for us.<br><span class="response">Mother of mercy,</span> pray for us.<br><span class="response">Mirror of justice,</span> pray for us.<br><span class="response">Seat of wisdom,</span> pray for us.<br><span class="response">Cause of our joy,</span> pray for us.<br><span class="response">Queen of the Holy Rosary,</span> pray for us.<br><span class="response">Queen of peace,</span> pray for us.</div></div>' +
      '<button class="sp-btn" onclick="showSubPage(\'compline\',\'Night Prayer\')"><svg viewBox="0 0 24 24" width="20" height="20" style="fill:var(--navy)"><path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19.5c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg> Night Prayer (Compline)</button>',

    'my-habits': renderHabitsPage(),

    'suggested-habits': showSuggestedHabits(),

    'bible-reader': renderBibleReaderPage(),

    'saints-for-kids': '<div class="sp-section"><h3>Saints for Kids</h3><p>Meet the saints who lived extraordinary lives of faith, courage, and love.</p></div>' +
      '<div class="story-card"><div class="sc-body"><h4>St. Nicholas</h4><p>The Giver Saint. Nicholas was a bishop who secretly gave gifts to the poor. He once dropped bags of gold coins down a chimney to help a family in need.</p></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>St. Francis of Assisi</h4><p>Friend to All Creation. Francis gave up his wealth to live simply and serve the poor. He loved animals and all of God\'s creation, often preaching to birds and wolves.</p></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>St. Joan of Arc</h4><p>Brave and Bold. At just 17, Joan led an army to defend her country. She trusted God\'s voice even when others doubted her. Her courage changed history.</p></div></div>' +
      '<div class="story-card"><div class="sc-body"><h4>St. Therese of Lisieux</h4><p>The Little Way. Therese showed that you do not need to do great things \u2014 small acts of love, done with great heart, are what matter most to God.</p></div></div>'
  };

  // Handle circle detail pages
  if (name.startsWith('circle-detail-')) {
    var cid = name.replace('circle-detail-', '');
    activeCircleId = cid;
    var circleType = 'general';
    circles.forEach(function(c) { if(c.id === cid) circleType = c.icon || 'general'; });
    logEvent('circle_joined', {circleId: cid, circleType: circleType});
    var wall = circleWalls[cid] || circleWalls['daily-rosary'];
    var h = '<img class="sp-hero" src="'+imgMap['event_photo2']+'" alt="Circle" loading="lazy">' +
      '<div class="cd-header"><div><h2>' + (document.getElementById('spTitle').textContent||'Circle') + '</h2><div class="cd-count"> members</div></div>' +
      '<div class="cd-actions"><button class="cd-btn joined">Joined</button><button class="cd-btn invite" onclick="inviteToCircle(\''+cid+'\')">Invite</button><button class="video-call-btn" onclick="startGroupCall(\''+cid+'\')">📹 Pray</button></div></div>' +
      '<p style="padding:0 16px;font-size:13px;color:var(--text-light);margin-bottom:12px">A community of faith united in prayer. Share your intentions, pray together, and grow in holiness.</p>' +
      '<div class="cd-tabs"><div class="cd-tab active" onclick="switchCircleTab(\'feed\',this)">Feed</div>' +
      '<div class="cd-tab" onclick="switchCircleTab(\'chat\',this)">💬 Chat</div>' +
      '<div class="cd-tab" onclick="switchCircleTab(\'members\',this)">Members</div>' +
      '<div class="cd-tab" onclick="switchCircleTab(\'events\',this)">Events</div>' +
      '<div class="cd-tab" onclick="switchCircleTab(\'pray\',this)">Pray</div></div>';
    h += '<div class="cd-tab-content" id="circleTabContent">';
    // Post input
    if(currentUser) {
      h += '<div style="padding:12px;background:var(--card-bg);border-radius:12px;margin-bottom:12px;box-shadow:var(--shadow)">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div class="pw-av" style="background:var(--primary-blue);width:32px;height:32px;font-size:12px">'+(userData&&userData.initials?userData.initials:'ME')+'</div>' +
        '<span style="font-size:13px;color:var(--text-light)">Share a prayer intention...</span></div>' +
        '<textarea id="circlePostInput" placeholder="What\'s on your heart? Share a prayer intention, testimony, or encouragement..." style="width:100%;border:1px solid var(--light-gray);border-radius:10px;padding:10px;font-size:13px;resize:none;height:60px;font-family:inherit;background:var(--warm-bg);color:var(--text)"></textarea>' +
        '<button onclick="postToCircle(\''+cid+'\')" style="margin-top:8px;padding:8px 20px;background:var(--primary-blue);color:#fff;border-radius:8px;font-size:13px;font-weight:600;float:right">' + svgIcons.heart + ' Post</button>' +
        '<div style="clear:both"></div></div>';
    }
    // Show locally stored circle posts
    var circleLocalKey = 'prayedCircle_'+cid;
    var localPosts = [];
    try { localPosts = JSON.parse(localStorage.getItem(circleLocalKey)) || []; } catch(e) {}
    localPosts.forEach(function(w) {
      h += '<div class="prayer-wall-item"><div class="pw-header"><div class="pw-av" style="background:'+(w.color||'var(--primary-blue)')+'">'+escapeHtml(w.initials)+'</div>' +
        '<div class="pw-name">'+escapeHtml(w.name)+'</div><div class="pw-time">'+escapeHtml(w.time)+'</div></div>' +
        '<div class="pw-text">'+escapeHtml(w.text)+'</div>' +
        '<div class="pw-pray-btn">' + svgIcons.heart + ' '+(w.count||1)+' praying</div></div>';
    });
    // Feed (default/seed posts)
    wall.forEach(function(w) {
      h += '<div class="prayer-wall-item"><div class="pw-header"><div class="pw-av" style="background:'+w.color+'">'+w.initials+'</div>' +
        '<div class="pw-name">'+w.name+' '+flagSVG(w.flag)+'</div><div class="pw-time">'+w.time+'</div></div>' +
        '<div class="pw-text">'+w.text+'</div>' +
        '<div class="pw-pray-btn">' + svgIcons.heart + ' '+w.count+' praying</div></div>';
    });
    h += '</div>';
    return h;
  }

  return content[name] || '<div class="sp-section"><h3>Coming Soon</h3><p>This content is being prepared. Check back soon!</p></div>';
}

function switchCircleTab(tab, el) {
  document.querySelectorAll('.cd-tab').forEach(function(t){t.classList.remove('active')});
  el.classList.add('active');
  var tc = document.getElementById('circleTabContent');
  if (tab === 'members') {
    var colors = ['#2563EB','#0D9488','#C68A2E','#E85D4A','#7C3AED','#DB2777','#059669','#D97706'];
    var names = ['Maria S','James T','Amira H','Francois D','Fatima O','Patrick M','Isabella R','Raj P','Linda C','David K'];
    tc.innerHTML = '<div class="members-grid">' + names.map(function(n,i){
      return '<div class="member-item"><div class="mi-av" style="background:'+colors[i%colors.length]+'">'+n.split(' ').map(function(x){return x[0]}).join('')+'</div><div class="mi-name">'+n+'</div></div>';
    }).join('') + '</div>';
  } else if (tab === 'events') {
    var rsvps = {};
    try { rsvps = JSON.parse(localStorage.getItem('prayedRSVPs')) || {}; } catch(e) {}
    var evts = [
      {id:'weekly-rosary',title:'Weekly Family Rosary',time:'Every Sunday at 7:00 PM'},
      {id:'prayer-meeting',title:'Prayer Intention Meeting',time:'Every Thursday at 8:00 PM'}
    ];
    var evHtml = '';
    evts.forEach(function(ev) {
      var isRsvpd = rsvps[ev.id] === true;
      evHtml += '<div class="event-card"><h4>' + ev.title + '</h4><p>' + ev.time + '</p>' +
        '<button class="ec-rsvp" id="rsvp-'+ev.id+'" onclick="rsvpEvent(\''+ev.id+'\')" style="' +
        (isRsvpd ? 'background:#10B981' : '') + '">' +
        (isRsvpd ? 'Going \u2713' : 'RSVP') + '</button></div>';
    });
    tc.innerHTML = evHtml;
  } else if (tab === 'pray') {
    tc.innerHTML = '<div class="card" style="padding:20px;text-align:center;margin-bottom:12px"><h3 style="font-size:16px;font-weight:600;color:var(--navy)">Pray the Rosary Together</h3>' +
      '<p style="font-size:13px;color:var(--text-light);margin-top:4px">20 minutes</p>' +
      '<div class="live-count" style="justify-content:center;margin-top:8px"><span class="live-dot"></span> praying now</div>' +
      '<button class="sp-btn primary" style="margin-top:12px" onclick="showVideoPlayer(\'Group Rosary\',\'rk7Acpd5Lqw\')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg> Join Now</button></div>';
  } else if (tab === 'chat') {
    var cid = activeCircleId || 'daily-rosary';
    var circleChannelKey = 'circle-' + cid;
    var circleName = (document.getElementById('spTitle') ? document.getElementById('spTitle').textContent : 'Circle');
    var ch = '';
    ch += '<div style="padding:14px;text-align:center;background:linear-gradient(135deg,#059669,#0D9488);border-radius:12px;margin-bottom:12px;color:#fff">' +
      '<div style="font-size:15px;font-weight:700;margin-bottom:6px">\ud83d\ude4f Group Prayer Call</div>' +
      '<button onclick="startGroupCall(\''+cid+'\')" style="padding:10px 24px;background:#fff;color:#059669;border-radius:24px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:none;box-shadow:0 2px 12px rgba(0,0,0,0.15)">\ud83d\udcf9 Start Video Call</button>' +
      '<div style="font-size:11px;opacity:0.85;margin-top:6px">Free \u00b7 No download \u00b7 Up to 75 people</div></div>';
    ch += '<div id="circleMsgList" class="circle-chat-area">';
    ch += '<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px"><div style="font-size:28px;margin-bottom:8px">\ud83d\udcac</div>Welcome to the group chat!<br>Start a conversation with your prayer circle.</div>';
    ch += '</div>';
    if(currentUser) {
      ch += '<div class="chat-input" style="margin-top:8px"><input id="circleMsgInput" maxlength="500" placeholder="Message '+circleName.replace(/'/g,'')+'..." onkeydown="if(event.key===\'Enter\')sendCircleChat()">' +
        '<button onclick="sendCircleChat()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';
    } else {
      ch += '<div class="chat-input" style="margin-top:8px"><input placeholder="Sign in to chat..." disabled>' +
        '<button disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>' +
        '<div style="text-align:center;padding:8px;font-size:12px;color:var(--text-light)"><a href="#" onclick="showAuthModal(\'signin\');return false" style="color:var(--primary-blue);font-weight:600">Sign in</a> to start chatting</div>';
    }
    tc.innerHTML = ch;
    loadCircleChat(circleChannelKey);
  } else {
    // Reload feed
    showSubPage(document.getElementById('spTitle').textContent, document.getElementById('spTitle').textContent);
  }
}

function postToCircle(cid) {
  var inp = document.getElementById('circlePostInput');
  if(!inp || !inp.value.trim()) return;
  var text = inp.value.trim();
  inp.value = '';
  var u = userData || {};
  var initials = u.initials || 'ME';
  var displayName = (u.firstName ? u.firstName + ' ' + (u.lastName||'') : 'User').trim();
  var now = new Date();
  var timeStr = 'Just now';
  var postObj = {
    name: displayName,
    initials: initials,
    color: 'var(--primary-blue)',
    text: text,
    time: timeStr,
    count: 1,
    ts: now.getTime()
  };
  // Store locally
  var circleLocalKey = 'prayedCircle_'+cid;
  var localPosts = [];
  try { localPosts = JSON.parse(localStorage.getItem(circleLocalKey)) || []; } catch(e) {}
  localPosts.unshift(postObj);
  localStorage.setItem(circleLocalKey, JSON.stringify(localPosts.slice(0,20)));
  // Write to Firestore
  if(db && currentUser) {
    try {
      db.collection('circles').doc(cid).collection('posts').add(postObj)
        .catch(function(e) { console.warn('Firestore circle post:', e); });
    } catch(e) {}
  }
  // Re-render the circle detail page
  var title = document.getElementById('spTitle').textContent;
  showSubPage('circle-detail-'+cid, title);
}

// ===== INVITE, RSVP, FAMILY, CREATE CIRCLE =====
function inviteToCircle(circleId) {
  var circleName = document.getElementById('spTitle') ? document.getElementById('spTitle').textContent : 'a prayer circle';
  var shareUrl = 'https://emmanuelepau.github.io/PRAYED-Live/?circle=' + encodeURIComponent(circleId);
  var shareText = 'Join our prayer circle "' + circleName + '" on PRAYED. Let\'s pray together!';
  if(navigator.share) {
    navigator.share({ title: 'Join ' + circleName + ' on PRAYED', text: shareText, url: shareUrl }).catch(function(e) {
      if(e.name !== 'AbortError') console.warn('Share failed:', e);
    });
  } else {
    var temp = document.createElement('textarea');
    temp.value = shareText + '\n' + shareUrl;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); showToast('Invite link copied!'); }
    catch(e) { showToast('Could not copy link'); }
    document.body.removeChild(temp);
  }
}

function rsvpEvent(eventId) {
  var rsvps = {};
  try { rsvps = JSON.parse(localStorage.getItem('prayedRSVPs')) || {}; } catch(e) {}
  rsvps[eventId] = !rsvps[eventId];
  localStorage.setItem('prayedRSVPs', JSON.stringify(rsvps));
  var btn = document.getElementById('rsvp-' + eventId);
  if(btn) {
    if(rsvps[eventId]) {
      btn.textContent = 'Going \u2713';
      btn.style.background = '#10B981';
      showToast('RSVP confirmed!');
    } else {
      btn.textContent = 'RSVP';
      btn.style.background = 'var(--primary-blue)';
      showToast('RSVP cancelled');
    }
  }
}

function addFamilyMember() {
  var fn = document.getElementById('famFirstName');
  var ln = document.getElementById('famLastName');
  var rel = document.getElementById('famRelation');
  var em = document.getElementById('famEmail');
  if(!fn || !fn.value.trim()) { showToast('Please enter a first name'); return; }
  var firstName = fn.value.trim();
  var lastName = ln ? ln.value.trim() : '';
  var initials = firstName.charAt(0).toUpperCase() + (lastName ? lastName.charAt(0).toUpperCase() : '');
  var colors = ['#2563EB','#0D9488','#C68A2E','#E85D4A','#7C3AED','#DB2777','#059669','#D97706'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  var member = {
    firstName: firstName,
    lastName: lastName,
    relationship: rel ? rel.value : 'Other',
    email: em ? em.value.trim() : '',
    initials: initials,
    color: color,
    addedAt: Date.now()
  };
  if(!userData) userData = {};
  if(!userData.familyMembers) userData.familyMembers = [];
  userData.familyMembers.push(member);
  syncToCloud();
  closeSubPage();
  showToast(firstName + ' added to your family!');
  renderProfile();
}

function createCircle() {
  var nameInput = document.getElementById('createCircleName');
  var catSelect = document.getElementById('createCircleCategory');
  var descInput = document.getElementById('createCircleDesc');
  if(!nameInput || !nameInput.value.trim()) { showToast('Please enter a circle name'); return; }
  var name = nameInput.value.trim();
  var category = catSelect ? catSelect.value : 'Prayer Intentions';
  var description = descInput ? descInput.value.trim() : '';
  var id = 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  var colors = ['#2563EB','#0D9488','#C68A2E','#E85D4A','#7C3AED','#DB2777','#059669'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  var newCircle = {
    id: id,
    name: name,
    category: category,
    description: description,
    members: 1,
    color: color,
    icon: 'globe',
    createdBy: currentUser ? currentUser.uid : 'local',
    createdAt: Date.now()
  };
  circles.push(newCircle);
  var customCircles = [];
  try { customCircles = JSON.parse(localStorage.getItem('prayedUserCircles')) || []; } catch(e) {}
  customCircles.push(newCircle);
  localStorage.setItem('prayedUserCircles', JSON.stringify(customCircles));
  if(db && currentUser) {
    try {
      db.collection('circles').doc(id).set(newCircle)
        .catch(function(e) { console.warn('Firestore create circle:', e); });
    } catch(e) {}
  }
  closeSubPage();
  showToast('Circle "' + escapeHtml(name) + '" created!');
  showScreen('circles');
}

// ===== CIRCLE GROUP CHAT + VIDEO CALLS =====
var activeCircleId = '';

function loadCircleChat(channelKey) {
  var list = document.getElementById('circleMsgList');
  if(!list) return;
  var localMsgs = channelLocalMessages[channelKey] || [];
  var h = '';
  if(localMsgs.length > 0) {
    localMsgs.forEach(function(m) { h += renderChatMsg(m); });
  }
  list.innerHTML = h || '<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px"><div style="font-size:28px;margin-bottom:8px">\ud83d\udcac</div>Welcome to the group chat!<br>Start a conversation with your prayer circle.</div>';
  if(db && currentUser) {
    try {
      db.collection('channels').doc(channelKey).collection('messages')
        .orderBy('ts','asc').limitToLast(50)
        .onSnapshot(function(snap) {
          var msgList = document.getElementById('circleMsgList');
          if(!msgList) return;
          var newH = '';
          snap.forEach(function(doc) {
            newH += renderChatMsg(doc.data(), channelKey, doc.id);
          });
          if(newH) {
            msgList.innerHTML = newH;
            msgList.scrollTop = msgList.scrollHeight;
          }
        });
    } catch(e) { console.warn('Circle chat listen:', e); }
  }
  setTimeout(function(){ if(list) list.scrollTop = list.scrollHeight; }, 200);
}

var lastMsgTime = 0;
function sendCircleChat() {
  var now = Date.now();
  if(now - lastMsgTime < 2000) { showToast('Please wait a moment before sending again'); return; }
  lastMsgTime = now;
  var inp = document.getElementById('circleMsgInput');
  if(!inp || !inp.value.trim()) return;
  var text = inp.value.trim().substring(0, 500);
  inp.value = '';
  var u = userData || {};
  var initials = (u.initials || (currentUser && currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'));
  var displayName = (u.firstName ? u.firstName + ' ' + (u.lastName||'') : (currentUser ? currentUser.email : 'User')).trim();
  var now = new Date();
  var h = now.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h % 12 || 12;
  var timeStr = h12 + ':' + (now.getMinutes()<10?'0':'') + now.getMinutes() + ' ' + ampm;
  var msgObj = {
    name: displayName,
    initials: initials,
    color: 'var(--primary-blue)',
    text: text,
    time: timeStr,
    ts: now.getTime(),
    uid: currentUser ? currentUser.uid : ''
  };
  var list = document.getElementById('circleMsgList');
  if(list) {
    // Remove welcome message if present
    if(list.querySelector('div[style*="text-align:center"]')) {
      list.innerHTML = '';
    }
    list.innerHTML += renderChatMsg(msgObj);
    list.scrollTop = list.scrollHeight;
  }
  var channelKey = 'circle-' + activeCircleId;
  if(!channelLocalMessages[channelKey]) channelLocalMessages[channelKey] = [];
  channelLocalMessages[channelKey].push(msgObj);
  if(db && currentUser) {
    try {
      db.collection('channels').doc(channelKey).collection('messages').add(msgObj)
        .catch(function(e) { console.warn('Circle chat write:', e); });
    } catch(e) { console.warn('Circle chat:', e); }
  }
}

var jitsiApi = null;

function startGroupCall(roomId) {
  var roomName = 'PRAYED-' + roomId.replace(/[^a-zA-Z0-9-]/g, '-');
  var u = userData || {};
  var displayName = (u.firstName ? u.firstName + ' ' + (u.lastName||'') : 'Guest').trim();

  // Show overlay
  document.getElementById('videoCallOverlay').style.display = 'flex';
  document.getElementById('vcTitle').textContent = 'Prayer Call';
  document.getElementById('vcStatus').textContent = 'Connecting...';

  // Clean up previous instance
  if (jitsiApi) {
    try { jitsiApi.dispose(); } catch(e) {}
    jitsiApi = null;
  }
  document.getElementById('jitsiContainer').innerHTML = '';

  // Check if API loaded
  if (typeof JitsiMeetExternalAPI === 'undefined') {
    document.getElementById('jitsiContainer').innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:16px">\ud83d\udcf9</div>' +
      '<p style="font-size:15px;margin-bottom:12px">Loading video call...</p>' +
      '<p style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:20px">If the call doesn\'t load, your browser may be blocking it.</p>' +
      '<a href="https://meet.jit.si/'+roomName+'" target="_blank" style="padding:12px 24px;background:#059669;color:#fff;border-radius:12px;font-weight:600;text-decoration:none">Open in Browser</a></div>';
    // Retry after script loads
    setTimeout(function() {
      if (typeof JitsiMeetExternalAPI !== 'undefined') {
        initJitsi(roomName, displayName);
      }
    }, 3000);
    return;
  }

  initJitsi(roomName, displayName);
}

function initJitsi(roomName, displayName) {
  try {
    document.getElementById('jitsiContainer').innerHTML = '';
    jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: document.getElementById('jitsiContainer'),
      userInfo: { displayName: displayName },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        disableThirdPartyRequests: true
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: ['microphone','camera','chat','raisehand','hangup','fullscreen','tileview','participants-pane'],
        MOBILE_APP_PROMO: false,
        HIDE_DEEP_LINKING_LOGO: true
      }
    });

    jitsiApi.addEventListener('videoConferenceJoined', function() {
      document.getElementById('vcStatus').textContent = 'Connected';
    });

    jitsiApi.addEventListener('readyToClose', function() {
      closeVideoCall();
    });

    jitsiApi.addEventListener('participantJoined', function() {
      try {
        var count = jitsiApi.getNumberOfParticipants();
        if(count > 0) document.getElementById('vcStatus').textContent = count + ' in call';
      } catch(e) {}
    });

    jitsiApi.addEventListener('participantLeft', function() {
      try {
        var count = jitsiApi.getNumberOfParticipants();
        document.getElementById('vcStatus').textContent = count > 0 ? count + ' in call' : 'Connected';
      } catch(e) {}
    });

  } catch(e) {
    console.warn('Jitsi init failed:', e);
    document.getElementById('jitsiContainer').innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;padding:20px;text-align:center">' +
      '<p style="font-size:15px;margin-bottom:12px">Could not start video call.</p>' +
      '<a href="https://meet.jit.si/'+roomName+'" target="_blank" style="padding:12px 24px;background:#059669;color:#fff;border-radius:12px;font-weight:600;text-decoration:none">Open in Browser</a></div>';
  }
}

function closeVideoCall() {
  if (jitsiApi) {
    try { jitsiApi.dispose(); } catch(e) {}
    jitsiApi = null;
  }
  document.getElementById('jitsiContainer').innerHTML = '';
  document.getElementById('videoCallOverlay').style.display = 'none';
}

// ===== HC COMMUNITY PLATFORM =====
var cscAnchorNavy = imgMap['csc_anchor_navy'];
var cscAnchorGold = imgMap['csc_anchor_gold'];
var cscAnchorWhite = imgMap['csc_anchor_white'];
var hcfmSymbolBlue = imgMap['hcfm_symbol_blue'];
var hcfmSymbolGold = imgMap['hcfm_symbol_gold'];
var famRosaryLogo = imgMap['fam_rosary_logo'];
var famTheaterLogo = imgMap['fam_theater_logo'];
var catholicMomLogo = imgMap['catholic_mom_logo'];

var hcChannels = {
  csc: [
    {name:'General Administration',loc:'Rome, Italy',members:48,color:'#1B3A5C',online:12,img:cscAnchorGold},
    {name:'United States Province',loc:'Notre Dame, IN',members:312,color:'#2563EB',online:87,img:cscAnchorNavy},
    {name:'Midwest Province (Brothers)',loc:'Notre Dame, IN',members:89,color:'#0D9488',online:23,img:cscAnchorGold},
    {name:'Moreau Province (Brothers)',loc:'Austin, TX',members:64,color:'#C68A2E',online:15,img:cscAnchorNavy},
    {name:'Canada Province',loc:'Montreal, QC',members:78,color:'#E85D4A',online:19,img:cscAnchorGold},
    {name:'Province of East Africa',loc:'Kampala, Uganda',members:245,color:'#059669',online:68,img:cscAnchorNavy},
    {name:'Province of West Africa',loc:'Cape Coast, Ghana',members:156,color:'#D97706',online:42,img:cscAnchorGold},
    {name:'Province of Haiti',loc:'Port-au-Prince',members:92,color:'#7C3AED',online:18,img:cscAnchorNavy},
    {name:'North East India Province',loc:'Agartala, Tripura',members:187,color:'#DB2777',online:54,img:cscAnchorGold},
    {name:'South India Province',loc:'Bangalore',members:234,color:'#2563EB',online:71,img:cscAnchorNavy},
    {name:'Tamil Nadu Province',loc:'Trichy',members:145,color:'#0D9488',online:38,img:cscAnchorGold},
    {name:'Sacred Heart Province',loc:'Dhaka, Bangladesh',members:198,color:'#C68A2E',online:52,img:cscAnchorNavy},
    {name:'France (Mother Province)',loc:'Le Mans',members:34,color:'#E85D4A',online:8,img:cscAnchorGold},
    {name:'Brazil District',loc:'Campinas, SP',members:67,color:'#059669',online:14,img:cscAnchorNavy},
    {name:'Chile-Peru District',loc:'Santiago / Lima',members:58,color:'#7C3AED',online:11,img:cscAnchorGold}
  ],
  hcfm: [
    {name:'HCFM Global Leadership',loc:'North Easton, MA (HQ)',members:28,color:'#1B3A5C',online:9,badge:'Staff',img:hcfmSymbolBlue},
    {name:'Family Rosary',loc:'18 Countries',members:156,color:'#2563EB',online:45,badge:'Ministry',img:famRosaryLogo},
    {name:'Family Theater Productions',loc:'Hollywood, CA',members:42,color:'#C68A2E',online:12,badge:'Media',img:famTheaterLogo},
    {name:'Catholic Mom',loc:'Digital / North Easton',members:35,color:'#DB2777',online:8,badge:'Content',img:catholicMomLogo},
    {name:'Museum of Family Prayer',loc:'North Easton, MA',members:18,color:'#0D9488',online:5,badge:'Staff',img:hcfmSymbolGold},
    {name:'HCFM East Africa',loc:'Kampala, Uganda',members:67,color:'#059669',online:22,badge:'Region',img:hcfmSymbolBlue},
    {name:'HCFM South Asia',loc:'Bangalore, India',members:54,color:'#D97706',online:16,badge:'Region',img:hcfmSymbolGold},
    {name:'HCFM Latin America',loc:'Lima, Peru',members:48,color:'#7C3AED',online:11,badge:'Region',img:hcfmSymbolBlue},
    {name:'Peyton Institute',loc:'North Easton / Bangalore',members:22,color:'#E85D4A',online:6,badge:'Research',img:hcfmSymbolGold},
    {name:'HCFM Ireland & Europe',loc:'Dublin / Madrid',members:31,color:'#2563EB',online:7,badge:'Region',img:hcfmSymbolBlue}
  ],
  sisters: [
    {name:'Sisters of the Holy Cross',loc:'Notre Dame, IN',members:370,color:'#DB2777',online:89,img:cscAnchorNavy},
    {name:'Sisters of Holy Cross (Montreal)',loc:'Saint-Laurent, QC',members:450,color:'#7C3AED',online:102,img:cscAnchorGold},
    {name:'Marianites of Holy Cross',loc:'New Orleans, LA',members:85,color:'#C68A2E',online:21,img:cscAnchorNavy},
    {name:'CSC Sisters \u2014 India Mission',loc:'8 States across India',members:124,color:'#0D9488',online:38,img:cscAnchorGold},
    {name:'CSC Sisters \u2014 Uganda',loc:'Kampala & Fort Portal',members:67,color:'#059669',online:18,img:cscAnchorNavy},
    {name:'CSC Sisters \u2014 Ghana',loc:'Cape Coast & Accra',members:45,color:'#D97706',online:11,img:cscAnchorGold},
    {name:'CSC Sisters \u2014 Brazil',loc:'S\u00e3o Paulo & Campinas',members:38,color:'#E85D4A',online:9,img:cscAnchorNavy}
  ],
  education: [
    {name:'University of Notre Dame',loc:'Notre Dame, IN',members:890,color:'#0C2340',online:234,badge:'University',img:cscAnchorNavy},
    {name:'Stonehill College',loc:'Easton, MA',members:245,color:'#5B2B82',online:67,badge:'University',img:cscAnchorGold},
    {name:'University of Portland',loc:'Portland, OR',members:312,color:'#5E2D91',online:82,badge:'University',img:cscAnchorNavy},
    {name:"King's College",loc:'Wilkes-Barre, PA',members:178,color:'#CF202E',online:42,badge:'University',img:cscAnchorGold},
    {name:"St. Edward's University",loc:'Austin, TX',members:267,color:'#BF5700',online:58,badge:'University',img:cscAnchorNavy},
    {name:'Holy Cross College',loc:'Notre Dame, IN',members:145,color:'#002855',online:34,badge:'College',img:cscAnchorGold},
    {name:'HC Secondary Schools \u2014 USA',loc:'17 Schools',members:456,color:'#2563EB',online:112,badge:'Schools',img:cscAnchorNavy},
    {name:'HC Schools \u2014 India',loc:'24 Schools',members:678,color:'#0D9488',online:189,badge:'Schools',img:cscAnchorGold},
    {name:'HC Schools \u2014 Bangladesh',loc:'19 Schools',members:423,color:'#C68A2E',online:98,badge:'Schools',img:cscAnchorNavy},
    {name:'HC Schools \u2014 East Africa',loc:'Uganda, Kenya, Tanzania',members:234,color:'#059669',online:67,badge:'Schools',img:cscAnchorGold},
    {name:'Holy Cross Institute',loc:"St. Edward's, Austin",members:34,color:'#7C3AED',online:8,badge:'Research',img:cscAnchorNavy}
  ]
};

var hcChatMessages = {
  'default': [
    {name:'Fr. David Marcotte, C.S.C.',initials:'DM',color:'#1B3A5C',role:'Provincial',text:'Brothers and sisters, please remember to submit your quarterly ministry reports by March 15th. Thank you for your continued service.',time:'10:30 AM'},
    {name:'Sr. Maria Torres',initials:'MT',color:'#DB2777',role:'Director',text:'The East Africa youth retreat was a tremendous success. Over 200 young people attended. Photos and report coming soon.',time:'9:15 AM'},
    {name:'Emmanuel Patel',initials:'EP',color:'#0D9488',role:'Staff',text:'Updated the HCFM branding guidelines on the shared drive. Please review before the next newsletter goes out.',time:'Yesterday'},
    {name:'Fr. Thomas Nguyen, C.S.C.',initials:'TN',color:'#2563EB',role:'Chaplain',text:'Reminder: Global prayer intention this week is for vocations to religious life. Please share with your communities.',time:'Yesterday'},
    {name:'Br. Patrick Okafor, C.S.C.',initials:'PO',color:'#059669',role:'Teacher',text:'The new catechesis curriculum materials are ready for review. Would appreciate feedback from all province education coordinators.',time:'Mar 3'},
    {name:'Lisa Chen',initials:'LC',color:'#C68A2E',role:'Admin',text:'Travel forms for the General Chapter meeting in Rome are due by March 20th. Please coordinate with your provincial secretaries.',time:'Mar 2'}
  ]
};

function switchCommTab(tab, el) {
  document.querySelectorAll('.comm-tab').forEach(function(t){t.classList.remove('active')});
  el.classList.add('active');
  var tc = document.getElementById('commContent');
  var channels = hcChannels[tab] || [];
  var h = '<div style="padding:0 0 8px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:0 0 8px">' +
    '<span class="lock-badge">' + svgIcons.lock + ' End-to-End Encrypted</span>' +
    '<span style="font-size:11px;color:var(--text-light)">' + channels.length + ' channels</span></div>';
  channels.forEach(function(c) {
    var iconHtml = c.img ?
      '<img src="'+c.img+'" alt="" loading="lazy" style="width:44px;height:44px;border-radius:12px;object-fit:contain;flex-shrink:0;padding:4px;background:'+c.color+'20">' :
      '<div class="ch-icon" style="background:'+c.color+'">'+c.name.charAt(0)+'</div>';
    h += '<div class="channel-card" onclick="showHCChannel(\''+c.name.replace(/'/g,"\\'")+'\',\''+c.loc.replace(/'/g,"\\'")+'\',\''+c.color+'\')">' +
      iconHtml +
      '<div class="ch-info"><div class="ch-name">'+c.name+'</div>' +
      '<div class="ch-desc">'+c.loc+'</div>' +
      '<div class="ch-meta">' + (c.badge ? '<span class="ch-badge">'+c.badge+'</span>' : '') +
      '<span class="ch-online">'+c.online+' online</span>' +
      '<span style="font-size:10px;color:var(--gray);margin-left:4px">\u00b7 '+c.members+' members</span>' +
      '</div></div></div>';
  });
  h += '</div>';
  tc.innerHTML = h;
}

function hcLogin() {
  if(!currentUser) {
    showAuthModal('signin');
    return;
  }
  var gate = document.getElementById('hcLoginGate');
  var main = document.getElementById('hcMainContent');
  if(gate) gate.style.display = 'none';
  if(main) { main.style.display = 'block'; setTimeout(function(){ var t = document.querySelector('.comm-tab.active'); if(t) switchCommTab('csc', t); }, 50); }
}

var activeChannelName = '';
var activeChannelColor = '';
var channelLocalMessages = {};

function showHCChannel(name, loc, color) {
  activeChannelName = name;
  activeChannelColor = color;
  var channelKey = name.toLowerCase().replace(/[^a-z0-9]/g,'-');
  var msgs = hcChatMessages['default'];
  var h = '<div style="padding:12px;background:'+color+';border-radius:12px;margin-bottom:12px;color:#fff">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div><div style="font-size:15px;font-weight:700">'+name+'</div>' +
    '<div style="font-size:12px;opacity:0.8;margin-top:2px">'+loc+'</div></div>' +
    '<button onclick="startGroupCall(\'hc-'+channelKey+'\')" style="padding:6px 14px;background:rgba(255,255,255,0.25);color:#fff;border-radius:16px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:4px;cursor:pointer;border:none;backdrop-filter:blur(4px)">\ud83d\udcf9 Call</button></div>' +
    '<div style="display:flex;gap:12px;margin-top:8px">' +
    '<span class="lock-badge" style="color:#fff;background:rgba(255,255,255,0.2)">' + svgIcons.lock + ' Secure</span>' +
    '</div></div>';
  h += '<div class="sp-section"><h3 style="font-size:14px">Messages</h3></div>';
  h += '<div id="hcMsgList">';
  msgs.forEach(function(m) {
    h += renderChatMsg(m);
  });
  // Show locally stored messages for this channel
  var localMsgs = channelLocalMessages[channelKey] || [];
  localMsgs.forEach(function(m) {
    h += renderChatMsg(m);
  });
  h += '</div>';
  // Chat input - enabled if signed in
  if(currentUser) {
    h += '<div class="chat-input"><input id="hcMsgInput" maxlength="500" placeholder="Message '+name.replace(/'/g,'')+'..." onkeydown="if(event.key===\'Enter\')sendHCMessage()">' +
      '<button onclick="sendHCMessage()"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';
  } else {
    h += '<div class="chat-input"><input placeholder="Sign in to send messages..." disabled>' +
      '<button disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>' +
      '<div style="text-align:center;padding:8px;font-size:11px;color:var(--text-light)"><a href="#" onclick="showAuthModal(\'signin\');return false" style="color:var(--primary-blue);font-weight:600">Sign in</a> to send messages</div>';
  }
  document.getElementById('spTitle').textContent = name;
  document.getElementById('spBody').innerHTML = h;
  document.getElementById('subPage').style.display = 'flex';
  // Load messages from Firestore if available
  if(db && currentUser) {
    try {
      db.collection('channels').doc(channelKey).collection('messages')
        .orderBy('ts','asc').limitToLast(50)
        .onSnapshot(function(snap) {
          var list = document.getElementById('hcMsgList');
          if(!list) return;
          // Clear and re-render all (seed + Firestore)
          var newH = '';
          msgs.forEach(function(m) { newH += renderChatMsg(m); });
          snap.forEach(function(doc) {
            var d = doc.data();
            newH += renderChatMsg(d, channelKey, doc.id);
          });
          list.innerHTML = newH;
          list.scrollTop = list.scrollHeight;
        });
    } catch(e) { console.warn('Firestore channel listen:', e); }
  }
  // Scroll to bottom
  setTimeout(function(){ var list = document.getElementById('hcMsgList'); if(list) list.scrollTop = list.scrollHeight; }, 200);
}

function renderChatMsg(m, channelKey, docId) {
  var isMe = currentUser && m.uid && m.uid === currentUser.uid;
  var safeText = escapeHtml(m.text);
  var safeName = escapeHtml(m.name);
  var safeInitials = escapeHtml(m.initials);
  var safeTime = escapeHtml(m.time);
  var safeRole = m.role ? escapeHtml(m.role) : '';
  var delBtn = (isMe && channelKey && docId) ? '<span class="cm-delete" onclick="deleteMessage(\''+channelKey+'\',\''+docId+'\',this)" title="Delete" style="cursor:pointer;opacity:0.4;font-size:11px;margin-left:6px">&#10005;</span>' : '';
  if (isMe) {
    return '<div class="chat-msg chat-msg-me">' +
      '<div class="cm-bubble cm-bubble-me">' +
      '<div class="cm-text">'+safeText+'</div>' +
      '<div class="cm-time-inline">'+safeTime+delBtn+'</div>' +
      '</div></div>';
  }
  return '<div class="chat-msg chat-msg-other">' +
    '<div class="cm-av" style="background:'+(m.color||'var(--primary-blue)')+'">'+
    safeInitials+'</div>' +
    '<div class="cm-bubble cm-bubble-other">' +
    '<div class="cm-name-bubble">'+safeName+(safeRole ? '<span class="cm-role-bubble">'+safeRole+'</span>' : '')+'</div>' +
    '<div class="cm-text">'+safeText+'</div>' +
    '<div class="cm-time-inline">'+safeTime+'</div>' +
    '</div></div>';
}

function deleteMessage(channelKey, docId, el) {
  if(!confirm('Delete this message?')) return;
  if(db && currentUser) {
    db.collection('channels').doc(channelKey).collection('messages').doc(docId).delete()
      .then(function() {
        var msgDiv = el.closest('.chat-msg');
        if(msgDiv) msgDiv.remove();
        showToast('Message deleted');
      })
      .catch(function(e) { showToast('Could not delete message'); console.warn('Delete msg:', e); });
  }
}

function sendHCMessage() {
  var now = Date.now();
  if(now - lastMsgTime < 2000) { showToast('Please wait a moment before sending again'); return; }
  lastMsgTime = now;
  var inp = document.getElementById('hcMsgInput');
  if(!inp || !inp.value.trim()) return;
  var text = inp.value.trim().substring(0, 500);
  inp.value = '';
  var u = userData || {};
  var initials = (u.initials || (currentUser && currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'));
  var displayName = (u.firstName ? u.firstName + ' ' + (u.lastName||'') : (currentUser ? currentUser.email : 'User')).trim();
  var now = new Date();
  var timeStr = now.getHours() + ':' + (now.getMinutes()<10?'0':'') + now.getMinutes() + (now.getHours()>=12?' PM':' AM');
  var msgObj = {
    name: displayName,
    initials: initials,
    color: 'var(--primary-blue)',
    text: text,
    time: timeStr,
    ts: now.getTime(),
    uid: currentUser ? currentUser.uid : ''
  };
  // Add to local display immediately
  var list = document.getElementById('hcMsgList');
  if(list) {
    list.innerHTML += renderChatMsg(msgObj);
    list.scrollTop = list.scrollHeight;
  }
  // Store locally
  var channelKey = activeChannelName.toLowerCase().replace(/[^a-z0-9]/g,'-');
  if(!channelLocalMessages[channelKey]) channelLocalMessages[channelKey] = [];
  channelLocalMessages[channelKey].push(msgObj);
  // Write to Firestore
  if(db && currentUser) {
    try {
      db.collection('channels').doc(channelKey).collection('messages').add(msgObj)
        .catch(function(e) { console.warn('Firestore msg write:', e); });
    } catch(e) { console.warn('Firestore msg:', e); }
  }
}

function submitChallengeAnswer(el, correct) {
  document.querySelectorAll('.trivia-option').forEach(function(btn){ btn.disabled = true; });
  el.classList.add(correct ? 'correct' : 'wrong');
  if (correct) {
    document.querySelectorAll('.trivia-option')[2].classList.add('correct');
  } else {
    document.querySelectorAll('.trivia-option')[2].classList.add('correct');
  }
  var result = document.getElementById('triviaResult');
  if (correct) {
    result.innerHTML = '<div style="padding:12px;background:rgba(13,148,136,0.1);border-radius:12px;margin-top:12px;color:var(--teal);font-size:14px">' +
      svgIcons.check + ' Correct! The Resurrection is the first Glorious Mystery.</div>';
  } else {
    result.innerHTML = '<div style="padding:12px;background:rgba(232,93,74,0.1);border-radius:12px;margin-top:12px;color:var(--coral);font-size:14px">' +
      'Not quite. The Resurrection is the first Glorious Mystery. Keep learning!</div>';
  }
}

// ===== NOTIFICATION PERMISSION =====
function requestNotifPermission() {
  if(!('Notification' in window)) {
    showToast('Notifications not supported in this browser');
    return;
  }
  if(Notification.permission === 'granted') {
    showToast('Notifications already enabled! \u2705');
    schedulePrayerNotifications();
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if(perm === 'granted') {
      showToast('Notifications enabled! You\'ll be reminded to pray.');
      schedulePrayerNotifications();
    } else {
      showToast('Please allow notifications in your browser settings');
    }
  });
}
