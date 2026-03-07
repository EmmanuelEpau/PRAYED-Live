// ===== BIBLE READER =====
// Variables
var bibleCache = {};
var bibleHighlights = {};
var selectedVerseNum = null;
var currentBibleBook = 0;
var currentBibleChapter = 1;

// Load saved state
try {
  bibleHighlights = JSON.parse(localStorage.getItem('prayedBibleHL')) || {};
} catch(e) { bibleHighlights = {}; }
try {
  var savedBook = localStorage.getItem('prayedBibleBook');
  var savedCh = localStorage.getItem('prayedBibleCh');
  var savedVer = localStorage.getItem('prayedBibleVer');
  if(savedBook !== null) currentBibleBook = parseInt(savedBook);
  if(savedCh !== null) currentBibleChapter = parseInt(savedCh);
  if(savedVer) currentBibleVersion = savedVer;
} catch(e) {}

// Load highlights from Firestore on startup (after auth is ready)
setTimeout(function() {
  if(typeof loadHighlightsFromCloud === 'function') {
    loadHighlightsFromCloud();
  }
}, 2000);

function fetchBibleChapter(version, bookNum, chapter, callback) {
  var cacheKey = version + '_' + bookNum + '_' + chapter;
  if(bibleCache[cacheKey]) { callback(null, bibleCache[cacheKey]); return; }
  var url = 'https://bolls.life/get-text/' + version + '/' + bookNum + '/' + chapter + '/';
  fetch(url).then(function(r) {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(data) {
    if(!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No verses returned');
    }
    data.forEach(function(v) {
      if(v.text) {
        v.text = v.text.replace(/<[^>]+>/g, '');
        if(version === 'KJV') {
          v.text = v.text.replace(/([a-zA-Z'])\d+/g, '$1');
          v.text = v.text.replace(/ \d{2,}/g, '');
          v.text = v.text.replace(/^\d+\s*/, '');
        }
        v.text = v.text.replace(/\s+/g, ' ').trim();
      }
    });
    bibleCache[cacheKey] = data;
    callback(null, data);
  }).catch(function(err) {
    console.warn('Bible fetch error:', err);
    callback(err, null);
  });
}

function renderBibleText(verses) {
  var book = bibleBooks[currentBibleBook];
  var hlKey = currentBibleVersion + '_' + book.num + '_' + currentBibleChapter;
  var highlights = bibleHighlights[hlKey] || {};
  var html = '<div class="bible-verse-wrap">';
  verses.forEach(function(v) {
    var vNum = v.verse || v.pk;
    var hlClass = highlights[vNum] ? ' bible-hl-' + highlights[vNum] : '';
    html += '<span class="bible-verse-num" onclick="showVerseActions(' + vNum + ')">' + vNum + '</span>';
    html += '<span class="bible-verse-span' + hlClass + '" data-verse="' + vNum + '" onclick="showVerseActions(' + vNum + ')">' + escapeHtml(v.text) + ' </span>';
  });
  html += '</div>';
  return html;
}

function loadBibleChapter() {
  var book = bibleBooks[currentBibleBook];
  var body = document.getElementById('bibleReaderBody');
  if(!body) return;
  body.innerHTML = '<div class="bible-chapter-title">' + book.name + ' ' + currentBibleChapter + '</div>' +
    '<div class="bible-skeleton">' +
    '<div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div>' +
    '<div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div>' +
    '<div class="sk-line"></div><div class="sk-line"></div></div>';
  var bookBtn = document.getElementById('bibleBookBtn');
  var verBtn = document.getElementById('bibleVerBtn');
  if(bookBtn) bookBtn.textContent = book.name + ' ' + currentBibleChapter + ' \u25BE';
  if(verBtn) verBtn.textContent = currentBibleVersion + ' \u25BE';
  localStorage.setItem('prayedBibleBook', currentBibleBook);
  localStorage.setItem('prayedBibleCh', currentBibleChapter);
  localStorage.setItem('prayedBibleVer', currentBibleVersion);
  fetchBibleChapter(currentBibleVersion, book.num, currentBibleChapter, function(err, verses) {
    if(err || !verses) {
      body.innerHTML = '<div class="bible-chapter-title">' + book.name + ' ' + currentBibleChapter + '</div>' +
        '<div style="padding:40px 20px;text-align:center;color:var(--text-light)">' +
        '<p style="font-size:16px;margin-bottom:8px">Could not load this chapter.</p>' +
        '<p style="font-size:13px">This translation may not be available. Try switching versions.</p>' +
        '<button class="sp-btn primary" onclick="showVersionPicker()" style="margin-top:16px">Switch Version</button></div>';
      return;
    }
    var html = '<div class="bible-chapter-title">' + book.name + ' ' + currentBibleChapter + '</div>';
    html += renderBibleText(verses);
    html += '<div class="bible-nav">';
    if(currentBibleChapter > 1 || currentBibleBook > 0) {
      html += '<button class="bible-nav-arrow" onclick="prevBibleChapter()">' +
        '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>';
    } else {
      html += '<div style="width:48px"></div>';
    }
    html += '<div class="bible-nav-label">' + book.name + ' ' + currentBibleChapter + '<br>' + currentBibleVersion + '</div>';
    if(currentBibleChapter < book.ch || currentBibleBook < bibleBooks.length - 1) {
      html += '<button class="bible-nav-arrow" onclick="nextBibleChapter()">' +
        '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>';
    } else {
      html += '<div style="width:48px"></div>';
    }
    html += '</div>';
    body.innerHTML = html;
    body.scrollTop = 0;
  });
}

function prevBibleChapter() {
  hideVerseActions();
  if(currentBibleChapter > 1) {
    currentBibleChapter--;
  } else if(currentBibleBook > 0) {
    currentBibleBook--;
    currentBibleChapter = bibleBooks[currentBibleBook].ch;
  }
  loadBibleChapter();
}

function nextBibleChapter() {
  hideVerseActions();
  var book = bibleBooks[currentBibleBook];
  if(currentBibleChapter < book.ch) {
    currentBibleChapter++;
  } else if(currentBibleBook < bibleBooks.length - 1) {
    currentBibleBook++;
    currentBibleChapter = 1;
  }
  loadBibleChapter();
}

function showBookPicker() {
  hideVerseActions();
  var overlay = document.createElement('div');
  overlay.className = 'bible-picker-overlay';
  overlay.id = 'biblePickerOverlay';
  var html = '<div class="bible-picker-header"><h3>Select Book</h3>' +
    '<button class="bible-picker-close" onclick="closeBiblePicker()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div>';
  html += '<div class="bible-picker-search"><input type="text" placeholder="Search books..." oninput="filterBibleBooks(this.value)"></div>';
  html += '<div class="bible-picker-tabs">' +
    '<div class="bible-picker-tab active" onclick="switchBookTab(\'ot\',this)">Old Testament</div>' +
    '<div class="bible-picker-tab" onclick="switchBookTab(\'nt\',this)">New Testament</div></div>';
  html += '<div class="bible-picker-list" id="bibleBookList">';
  html += renderBookList('ot', '');
  html += '</div>';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
}

function renderBookList(testament, filter) {
  var html = '';
  bibleBooks.forEach(function(b, i) {
    if(b.t !== testament) return;
    if(filter && b.name.toLowerCase().indexOf(filter.toLowerCase()) === -1) return;
    var isCurrent = i === currentBibleBook;
    html += '<div class="bible-book-item' + (isCurrent ? ' active' : '') + '" onclick="selectBibleBook(' + i + ')" style="' + (isCurrent ? 'background:rgba(37,99,235,0.08)' : '') + '">' +
      '<span class="bb-name">' + b.name + '</span>' +
      '<span class="bb-chapters">' + b.ch + ' chapters</span></div>';
  });
  return html;
}

var currentBookTab = 'ot';
function switchBookTab(tab, el) {
  currentBookTab = tab;
  document.querySelectorAll('.bible-picker-tab').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  var list = document.getElementById('bibleBookList');
  if(list) list.innerHTML = renderBookList(tab, '');
}

function filterBibleBooks(q) {
  var list = document.getElementById('bibleBookList');
  if(!list) return;
  var html = '';
  if(q) {
    bibleBooks.forEach(function(b, i) {
      if(b.name.toLowerCase().indexOf(q.toLowerCase()) === -1) return;
      var isCurrent = i === currentBibleBook;
      html += '<div class="bible-book-item' + (isCurrent ? ' active' : '') + '" onclick="selectBibleBook(' + i + ')" style="' + (isCurrent ? 'background:rgba(37,99,235,0.08)' : '') + '">' +
        '<span class="bb-name">' + b.name + '</span>' +
        '<span class="bb-chapters">' + b.ch + ' chapters</span></div>';
    });
  } else {
    html = renderBookList(currentBookTab, '');
  }
  list.innerHTML = html;
}

function selectBibleBook(idx) {
  var book = bibleBooks[idx];
  var list = document.getElementById('bibleBookList');
  var header = document.querySelector('.bible-picker-header h3');
  if(header) header.textContent = book.name;
  var search = document.querySelector('.bible-picker-search');
  var tabs = document.querySelector('.bible-picker-tabs');
  if(search) search.style.display = 'none';
  if(tabs) tabs.style.display = 'none';
  var html = '<div class="bible-chapter-grid">';
  for(var c = 1; c <= book.ch; c++) {
    var isCurrent = idx === currentBibleBook && c === currentBibleChapter;
    html += '<button class="cg-num' + (isCurrent ? ' current' : '') + '" onclick="selectBibleChapter(' + idx + ',' + c + ')">' + c + '</button>';
  }
  html += '</div>';
  if(list) list.innerHTML = html;
}

function selectBibleChapter(bookIdx, chapter) {
  currentBibleBook = bookIdx;
  currentBibleChapter = chapter;
  closeBiblePicker();
  loadBibleChapter();
}

function showVersionPicker() {
  hideVerseActions();
  var overlay = document.createElement('div');
  overlay.className = 'bible-picker-overlay';
  overlay.id = 'biblePickerOverlay';
  var html = '<div class="bible-picker-header"><h3>Select Version</h3>' +
    '<button class="bible-picker-close" onclick="closeBiblePicker()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div>';
  html += '<div class="bible-picker-search"><input type="text" placeholder="Search versions..." oninput="filterBibleVersions(this.value)"></div>';
  html += '<div class="bible-picker-list" id="bibleVersionList">';
  bibleVersions.forEach(function(v) {
    var isActive = v.id === currentBibleVersion;
    html += '<div class="bible-version-item' + (isActive ? ' active' : '') + '" onclick="selectBibleVersion(\''+v.id+'\')">' +
      '<span class="bv-id">' + v.id + '</span>' +
      '<span class="bv-name">' + v.name + '</span>' +
      (isActive ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--primary-blue)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') + '</div>';
  });
  html += '</div>';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
}

function filterBibleVersions(q) {
  var list = document.getElementById('bibleVersionList');
  if(!list) return;
  var html = '';
  bibleVersions.forEach(function(v) {
    if(q && v.id.toLowerCase().indexOf(q.toLowerCase()) === -1 && v.name.toLowerCase().indexOf(q.toLowerCase()) === -1) return;
    var isActive = v.id === currentBibleVersion;
    html += '<div class="bible-version-item' + (isActive ? ' active' : '') + '" onclick="selectBibleVersion(\''+v.id+'\')">' +
      '<span class="bv-id">' + v.id + '</span>' +
      '<span class="bv-name">' + v.name + '</span>' +
      (isActive ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--primary-blue)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') + '</div>';
  });
  list.innerHTML = html;
}

function selectBibleVersion(verId) {
  currentBibleVersion = verId;
  closeBiblePicker();
  loadBibleChapter();
}

function closeBiblePicker() {
  var overlay = document.getElementById('biblePickerOverlay');
  if(overlay) overlay.remove();
}

function showVerseActions(verseNum) {
  selectedVerseNum = verseNum;
  hideVerseActions();
  var book = bibleBooks[currentBibleBook];
  var hlKey = currentBibleVersion + '_' + book.num + '_' + currentBibleChapter;
  var currentHL = bibleHighlights[hlKey] && bibleHighlights[hlKey][verseNum] ? bibleHighlights[hlKey][verseNum] : null;
  var colors = [
    {name:'yellow',hex:'#FFE066'},
    {name:'green',hex:'#7AE582'},
    {name:'blue',hex:'#74B9FF'},
    {name:'pink',hex:'#FD79A8'},
    {name:'orange',hex:'#FDCB6E'}
  ];
  var bar = document.createElement('div');
  bar.className = 'bible-hl-bar';
  bar.id = 'bibleHLBar';
  var html = '';
  colors.forEach(function(c) {
    html += '<div class="bible-hl-color' + (currentHL === c.name ? ' selected' : '') + '" style="background:' + c.hex + '" onclick="toggleBibleHighlight(' + verseNum + ',\''+c.name+'\')"></div>';
  });
  if(currentHL) {
    html += '<div class="bible-hl-action" onclick="toggleBibleHighlight(' + verseNum + ',null)" title="Remove highlight"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>';
  }
  html += '<div class="bible-hl-action" onclick="shareVerseWithFamily(' + verseNum + ')" title="Share with Family"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg></div>';
  html += '<div class="bible-hl-action" onclick="copyBibleVerse(' + verseNum + ')" title="Copy"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></div>';
  html += '<div class="bible-hl-action" onclick="hideVerseActions()" title="Close"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>';
  bar.innerHTML = html;
  document.body.appendChild(bar);
}

function hideVerseActions() {
  var bar = document.getElementById('bibleHLBar');
  if(bar) bar.remove();
  selectedVerseNum = null;
}

function toggleBibleHighlight(verseNum, color) {
  var book = bibleBooks[currentBibleBook];
  var hlKey = currentBibleVersion + '_' + book.num + '_' + currentBibleChapter;
  if(!bibleHighlights[hlKey]) bibleHighlights[hlKey] = {};
  if(color === null || bibleHighlights[hlKey][verseNum] === color) {
    delete bibleHighlights[hlKey][verseNum];
    if(Object.keys(bibleHighlights[hlKey]).length === 0) delete bibleHighlights[hlKey];
  } else {
    bibleHighlights[hlKey][verseNum] = color;
  }
  try { localStorage.setItem('prayedBibleHL', JSON.stringify(bibleHighlights)); } catch(e) {}
  syncHighlightsToCloud();
  var spans = document.querySelectorAll('.bible-verse-span[data-verse="' + verseNum + '"]');
  spans.forEach(function(s) {
    s.className = 'bible-verse-span';
    var hl = bibleHighlights[hlKey] && bibleHighlights[hlKey][verseNum];
    if(hl) s.classList.add('bible-hl-' + hl);
  });
  hideVerseActions();
  showToast(color ? 'Verse ' + verseNum + ' highlighted' : 'Highlight removed');
}

function copyBibleVerse(verseNum) {
  var span = document.querySelector('.bible-verse-span[data-verse="' + verseNum + '"]');
  if(!span) return;
  var book = bibleBooks[currentBibleBook];
  var text = span.textContent.trim();
  var ref = book.name + ' ' + currentBibleChapter + ':' + verseNum + ' (' + currentBibleVersion + ')';
  var fullText = '"' + text + '" \u2014 ' + ref;
  if(navigator.clipboard) {
    navigator.clipboard.writeText(fullText).then(function() { showToast('Verse copied!'); }).catch(function() { showToast('Could not copy'); });
  } else {
    var temp = document.createElement('textarea');
    temp.value = fullText;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); showToast('Verse copied!'); }
    catch(e) { showToast('Could not copy'); }
    document.body.removeChild(temp);
  }
  hideVerseActions();
}

function shareVerseWithFamily(verseNum) {
  var span = document.querySelector('.bible-verse-span[data-verse="' + verseNum + '"]');
  if(!span) return;
  var book = bibleBooks[currentBibleBook];
  var verseText = span.textContent.trim();
  var shareText = book.name + ' ' + currentBibleChapter + ':' + verseNum + ' - \'' + verseText + '\' (' + currentBibleVersion + ')';
  if(navigator.share) {
    navigator.share({
      title: 'Verse from PRAYED',
      text: shareText
    }).then(function() {
      showToast('Verse shared!');
    }).catch(function(err) {
      if(err.name !== 'AbortError') {
        fallbackCopyVerse(shareText);
      }
    });
  } else {
    fallbackCopyVerse(shareText);
  }
  hideVerseActions();
}

function fallbackCopyVerse(text) {
  if(navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Verse copied to clipboard!');
    }).catch(function() {
      showToast('Could not copy verse');
    });
  } else {
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); showToast('Verse copied to clipboard!'); }
    catch(e) { showToast('Could not copy verse'); }
    document.body.removeChild(temp);
  }
}

// ===== FIRESTORE HIGHLIGHT SYNC =====
function syncHighlightsToCloud() {
  if(currentUser && db) {
    try {
      db.collection('users').doc(currentUser.uid).collection('bibleHighlights').doc('highlights').set({
        data: bibleHighlights,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, {merge: true});
    } catch(e) { console.warn('Highlight cloud sync failed:', e); }
  }
}

function loadHighlightsFromCloud() {
  if(currentUser && db) {
    try {
      db.collection('users').doc(currentUser.uid).collection('bibleHighlights').doc('highlights').get()
        .then(function(doc) {
          if(doc.exists && doc.data() && doc.data().data) {
            var cloudHL = doc.data().data;
            // Merge cloud highlights with local (cloud wins on conflict)
            Object.keys(cloudHL).forEach(function(key) {
              if(!bibleHighlights[key]) {
                bibleHighlights[key] = cloudHL[key];
              } else {
                Object.keys(cloudHL[key]).forEach(function(vNum) {
                  bibleHighlights[key][vNum] = cloudHL[key][vNum];
                });
              }
            });
            try { localStorage.setItem('prayedBibleHL', JSON.stringify(bibleHighlights)); } catch(e) {}
          }
        })
        .catch(function(e) { console.warn('Could not load cloud highlights:', e); });
    } catch(e) { console.warn('Highlight cloud load failed:', e); }
  }
}

function getVerseOfTheDay() {
  var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return votdVerses[dayOfYear % votdVerses.length];
}

// ===== RENDER BIBLE SCREEN =====
function renderBible() {
  var book = bibleBooks[currentBibleBook];
  var votd = getVerseOfTheDay();
  var html = '';
  html += '<div class="bible-toolbar" style="position:relative">' +
    '<button class="bible-toolbar-btn" id="bibleBookBtn" onclick="showBookPicker()">' + book.name + ' ' + currentBibleChapter + ' \u25BE</button>' +
    '<button class="bible-toolbar-btn" id="bibleVerBtn" onclick="showVersionPicker()">' + currentBibleVersion + ' \u25BE</button>' +
    '<div style="flex:1"></div>' +
    '<button class="bible-toolbar-btn" onclick="showSubPage(\'gospel-today\',\'Today\u2019s Gospel\')" style="padding:8px 10px" title="Today\u2019s Gospel">' +
    '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg></button></div>';
  html += '<div onclick="openVotdFromBible()" style="padding:12px 16px;background:linear-gradient(135deg,rgba(37,99,235,0.05),rgba(198,138,46,0.06));border-bottom:1px solid var(--light-gray);cursor:pointer">' +
    '<div style="font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px">\u2728 Verse of the Day</div>' +
    '<div class="crimson" style="font-size:15px;line-height:1.4;color:var(--navy);font-style:italic;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">\u201c' + escapeHtml(votd.text) + '\u201d</div>' +
    '<div style="font-size:11px;color:var(--text-light);margin-top:4px">\u2014 ' + votd.ref + '</div></div>';
  html += '<div id="bibleReaderBody" style="padding-bottom:70px">' +
    '<div class="bible-chapter-title">' + book.name + ' ' + currentBibleChapter + '</div>' +
    '<div class="bible-skeleton"><div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div>' +
    '<div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div></div></div>';
  document.getElementById('screenBible').innerHTML = html;
  setTimeout(function() { loadBibleChapter(); }, 100);
}

function openVotdFromBible() {
  var votd = getVerseOfTheDay();
  for(var i = 0; i < bibleBooks.length; i++) {
    if(bibleBooks[i].num === votd.b) {
      currentBibleBook = i;
      break;
    }
  }
  currentBibleChapter = votd.c;
  renderBible();
}

function renderBibleReaderPage() {
  var book = bibleBooks[currentBibleBook];
  var html = '<div class="bible-toolbar">' +
    '<button class="bible-toolbar-btn" id="bibleBookBtn" onclick="showBookPicker()">' + book.name + ' ' + currentBibleChapter + ' \u25BE</button>' +
    '<button class="bible-toolbar-btn" id="bibleVerBtn" onclick="showVersionPicker()">' + currentBibleVersion + ' \u25BE</button>' +
    '<div style="flex:1"></div>' +
    '<button class="bible-toolbar-btn" onclick="showSubPage(\'gospel-today\',\'Today\u2019s Gospel\')" style="padding:8px 10px" title="Today\u2019s Gospel">' +
    '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--text)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg></button></div>';
  html += '<div id="bibleReaderBody">' +
    '<div class="bible-chapter-title">' + book.name + ' ' + currentBibleChapter + '</div>' +
    '<div class="bible-skeleton"><div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div>' +
    '<div class="sk-line"></div><div class="sk-line"></div><div class="sk-line"></div></div></div>';
  setTimeout(function() { loadBibleChapter(); }, 100);
  return html;
}

function openVotdChapter() {
  var votd = getVerseOfTheDay();
  for(var i = 0; i < bibleBooks.length; i++) {
    if(bibleBooks[i].num === votd.b) {
      currentBibleBook = i;
      break;
    }
  }
  currentBibleChapter = votd.c;
  showScreen('bible');
}
