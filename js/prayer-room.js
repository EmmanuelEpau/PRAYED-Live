// prayer-room.js - Family Prayer Room Engine

var prayerRoom = null;
var activeRoomId = null;
var activePrayerRoom = null;
var selectedPrayerForRoom = 'rosary-joyful';
var rosaryAudio = null;
var rosaryPlaylistIdx = 0;
var rosaryIsPlaying = false;
var isRoomLeader = false;
var pendingJoinRoomId = null;
var _lastSyncBroadcast = 0;

function selectPrayerOption(btn, prayerId) {
  selectedPrayerForRoom = prayerId;
  var options = document.querySelectorAll('.pr-prayer-option');
  options.forEach(function(opt) { opt.classList.remove('selected'); });
  btn.classList.add('selected');
}

// ===== ROSARY PLAYLIST =====
var rosaryPlaylists = {
  'rosary-joyful': {
    name: 'Joyful Mysteries',
    mysteries: ['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding in the Temple'],
    tracks: [
      {name:'Sign of the Cross', file:'prayers/sign-of-cross.mp3'},
      {name:"Apostle's Creed", file:'prayers/apostles-creed.mp3'},
      {name:'Our Father', file:'prayers/our-father.mp3'},
      {name:'3 Hail Marys', file:'prayers/hail-mary.mp3'},
      {name:'Glory Be', file:'prayers/glory-be.mp3'},
      {name:'1st Joyful Mystery', file:'joyful/1-annunciation.mp3'},
      {name:'2nd Joyful Mystery', file:'joyful/2-visitation.mp3'},
      {name:'3rd Joyful Mystery', file:'joyful/3-nativity.mp3'},
      {name:'4th Joyful Mystery', file:'joyful/4-presentation.mp3'},
      {name:'5th Joyful Mystery', file:'joyful/5-finding.mp3'},
      {name:'Hail Holy Queen', file:'prayers/hail-holy-queen.mp3'}
    ]
  },
  'rosary-sorrowful': {
    name: 'Sorrowful Mysteries',
    mysteries: ['The Agony in the Garden','The Scourging at the Pillar','The Crowning with Thorns','The Carrying of the Cross','The Crucifixion'],
    tracks: [
      {name:'Sign of the Cross', file:'prayers/sign-of-cross.mp3'},
      {name:"Apostle's Creed", file:'prayers/apostles-creed.mp3'},
      {name:'Our Father', file:'prayers/our-father.mp3'},
      {name:'1st Sorrowful Mystery', file:'sorrowful/1-agony.mp3'},
      {name:'2nd Sorrowful Mystery', file:'sorrowful/2-scourging.mp3'},
      {name:'3rd Sorrowful Mystery', file:'sorrowful/3-crowning.mp3'},
      {name:'4th Sorrowful Mystery', file:'sorrowful/4-way-of-cross.mp3'},
      {name:'5th Sorrowful Mystery', file:'sorrowful/5-crucifixion.mp3'},
      {name:'Hail Holy Queen', file:'prayers/hail-holy-queen.mp3'}
    ]
  },
  'rosary-glorious': {
    name: 'Glorious Mysteries',
    mysteries: ['The Resurrection','The Ascension','The Descent of the Holy Spirit','The Assumption','The Coronation'],
    tracks: [
      {name:'Sign of the Cross', file:'prayers/sign-of-cross.mp3'},
      {name:"Apostle's Creed", file:'prayers/apostles-creed.mp3'},
      {name:'Our Father', file:'prayers/our-father.mp3'},
      {name:'1st Glorious Mystery', file:'glorious/1-resurrection.mp3'},
      {name:'2nd Glorious Mystery', file:'glorious/2-ascension.mp3'},
      {name:'3rd Glorious Mystery', file:'glorious/3-pentecost.mp3'},
      {name:'4th Glorious Mystery', file:'glorious/4-assumption.mp3'},
      {name:'5th Glorious Mystery', file:'glorious/5-coronation.mp3'},
      {name:'Hail Holy Queen', file:'prayers/hail-holy-queen.mp3'}
    ]
  },
  'rosary-luminous': {
    name: 'Luminous Mysteries',
    mysteries: ['The Baptism in the Jordan','The Wedding at Cana','The Proclamation of the Kingdom','The Transfiguration','The Institution of the Eucharist'],
    tracks: [
      {name:'Sign of the Cross', file:'prayers/sign-of-cross.mp3'},
      {name:"Apostle's Creed", file:'prayers/apostles-creed.mp3'},
      {name:'Our Father', file:'prayers/our-father.mp3'},
      {name:'1st Luminous Mystery', file:'luminous/1-baptism.mp3'},
      {name:'2nd Luminous Mystery', file:'luminous/2-cana.mp3'},
      {name:'3rd Luminous Mystery', file:'luminous/3-kingdom.mp3'},
      {name:'4th Luminous Mystery', file:'luminous/4-transfiguration.mp3'},
      {name:'5th Luminous Mystery', file:'luminous/5-eucharist.mp3'},
      {name:'Hail Holy Queen', file:'prayers/hail-holy-queen.mp3'}
    ]
  }
};

// ===== TRACK-TO-ROSARY MAPPING =====
function ordinal(n) {
  var s = ['th','st','nd','rd'];
  var v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function getTrackRosaryPosition(prayerId, trackIdx, trackProgress) {
  var playlist = getRosaryPlaylist(prayerId);
  if (!playlist) return null;
  var totalTracks = playlist.tracks.length;
  var isJoyful = (prayerId === 'rosary-joyful');
  // Joyful has 11 tracks (extra "3 Hail Marys" + "Glory Be"), others have 9
  var decadeOffset = isJoyful ? 5 : 3;
  var closingIdx = totalTracks - 1;

  var result = {
    sectionName: '', decadeNumber: 0, mysteryName: '',
    currentPrayer: '', beadGroupIndex: 0, overallProgress: 0,
    isDecadeTrack: false, hailMaryEstimate: 0
  };

  result.overallProgress = (trackIdx + (trackProgress || 0)) / totalTracks;

  if (trackIdx >= decadeOffset && trackIdx < closingIdx) {
    // Decade track
    var decadeNum = trackIdx - decadeOffset + 1;
    result.isDecadeTrack = true;
    result.decadeNumber = decadeNum;
    result.sectionName = ordinal(decadeNum) + ' Decade';
    result.mysteryName = playlist.mysteries[decadeNum - 1] || '';
    result.beadGroupIndex = 2 + decadeNum; // groups 3-7
    result.decadeProgress = trackProgress || 0;
    if (trackProgress < 0.05) {
      result.currentPrayer = 'Our Father';
    } else if (trackProgress > 0.92) {
      result.currentPrayer = 'Glory Be';
      result.hailMaryEstimate = 10;
    } else {
      var hmProg = (trackProgress - 0.05) / 0.87;
      result.hailMaryEstimate = Math.min(10, Math.floor(hmProg * 10) + 1);
      result.currentPrayer = 'Hail Mary (' + result.hailMaryEstimate + ' of 10)';
    }
  } else if (trackIdx === closingIdx) {
    result.sectionName = 'Closing';
    result.decadeNumber = 6;
    result.currentPrayer = 'Hail Holy Queen';
    result.beadGroupIndex = 8;
  } else {
    // Opening prayers
    result.sectionName = 'Opening Prayers';
    result.currentPrayer = playlist.tracks[trackIdx] ? playlist.tracks[trackIdx].name : '';
    if (isJoyful) {
      // 0=Sign,1=Creed,2=OurFather→group0  3=3HailMarys→group1  4=GloryBe→group2
      if (trackIdx <= 2) result.beadGroupIndex = 0;
      else if (trackIdx === 3) result.beadGroupIndex = 1;
      else result.beadGroupIndex = 2;
    } else {
      // 0=Sign,1=Creed→group0  2=OurFather→group2 (skip to medal)
      if (trackIdx <= 1) result.beadGroupIndex = 0;
      else result.beadGroupIndex = 2;
    }
  }
  return result;
}

// ===== COLOR-CODED ROSARY SVG (59 beads + crucifix + medal) =====
// RED = Our Father, BLUE = Hail Mary, GOLD = Medal, BROWN = Crucifix
function generateRosarySVG(activeBeadGroup) {
  if (activeBeadGroup === undefined) activeBeadGroup = -1;
  var cx = 120, cy = 115, rx = 72, ry = 82;
  var totalLoop = 55;
  var ourFatherLoop = {0:true, 11:true, 22:true, 33:true, 44:true};

  function loopGroup(i) {
    if (i < 11) return 3; if (i < 22) return 4;
    if (i < 33) return 5; if (i < 44) return 6; return 7;
  }

  function op(group) {
    if (activeBeadGroup < 0) return 0.6;
    if (group < activeBeadGroup) return 1.0;
    if (group === activeBeadGroup) return 1.0;
    return 0.2;
  }

  function bFill(type, group) {
    var o = op(group);
    if (type === 'of') return 'rgba(217,48,37,' + o + ')';
    if (type === 'hm') return 'rgba(140,180,213,' + o + ')';
    if (type === 'gd') return 'rgba(212,166,78,' + Math.max(o, 0.35) + ')';
    if (type === 'cr') return 'rgba(139,105,20,' + o + ')';
    return 'rgba(255,255,255,' + o + ')';
  }

  var s = '<svg viewBox="0 0 240 300" class="pr-bead-svg">';
  s += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>';

  // 55 main loop beads (clockwise from bottom-right)
  var gapA = (2*Math.PI/totalLoop)*2, startA = gapA/2, spanA = 2*Math.PI-gapA;
  for (var i = 0; i < totalLoop; i++) {
    var t = startA + (i/(totalLoop-1))*spanA;
    var bx = cx + rx*Math.sin(t), by = cy + ry*Math.cos(t);
    var isOF = ourFatherLoop[i] === true;
    var r = isOF ? 5 : 3;
    var g = loopGroup(i);
    var c = (g === activeBeadGroup) ? ' class="pr-bead-active"' : '';
    s += '<circle cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" r="'+r+'" fill="'+bFill(isOF?'of':'hm', g)+'"'+c+'/>';
  }

  // Decade labels (I-V)
  var lbl = ['I','II','III','IV','V'], mid = [5,16,27,38,49];
  for (var d = 0; d < 5; d++) {
    var dt = startA + (mid[d]/(totalLoop-1))*spanA;
    var lx = cx+(rx+14)*Math.sin(dt), ly = cy+(ry+14)*Math.cos(dt);
    var lo = ((d+3) <= activeBeadGroup) ? '0.7' : '0.2';
    s += '<text x="'+lx.toFixed(1)+'" y="'+ly.toFixed(1)+'" fill="rgba(255,255,255,'+lo+')" font-size="9" font-weight="600" text-anchor="middle" dominant-baseline="middle">'+lbl[d]+'</text>';
  }

  // Medal at bottom of loop (GOLD, group 2 — also pulses at group 8 closing)
  var mY = cy+ry+3;
  var mO = op(2); if (activeBeadGroup === 8) mO = 1.0;
  var mC = (activeBeadGroup===2 || activeBeadGroup===8) ? ' class="pr-bead-active"' : '';
  s += '<ellipse cx="'+cx+'" cy="'+mY+'" rx="7" ry="9" fill="rgba(212,166,78,'+Math.max(mO,0.35)+')" stroke="rgba(212,166,78,'+(mO*0.5)+')" stroke-width="1"'+mC+'/>';
  s += '<line x1="'+cx+'" y1="'+(mY-3)+'" x2="'+cx+'" y2="'+(mY+3)+'" stroke="rgba(255,255,255,'+(mO*0.3)+')" stroke-width="0.7"/>';
  s += '<line x1="'+(cx-2.5)+'" y1="'+mY+'" x2="'+(cx+2.5)+'" y2="'+mY+'" stroke="rgba(255,255,255,'+(mO*0.3)+')" stroke-width="0.7"/>';

  // Chain from medal to pendant
  var pS = mY+9;
  s += '<line x1="'+cx+'" y1="'+pS+'" x2="'+cx+'" y2="'+(pS+55)+'" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>';

  // Pendant (medal → 3 Hail Marys → Our Father → Crucifix)
  // 3 Hail Marys (BLUE, group 1)
  var hmY = [pS+12, pS+22, pS+32];
  for (var h = 0; h < 3; h++) {
    var hc = (1 === activeBeadGroup) ? ' class="pr-bead-active"' : '';
    s += '<circle cx="'+cx+'" cy="'+hmY[h]+'" r="3" fill="'+bFill('hm',1)+'"'+hc+'/>';
  }
  // Our Father (RED, group 0)
  var ofY = pS+44;
  var oc = (0 === activeBeadGroup) ? ' class="pr-bead-active"' : '';
  s += '<circle cx="'+cx+'" cy="'+ofY+'" r="5" fill="'+bFill('of',0)+'"'+oc+'/>';
  // Crucifix (BROWN, group 0)
  var cT = ofY+10;
  var cf = bFill('cr', 0);
  s += '<line x1="'+cx+'" y1="'+cT+'" x2="'+cx+'" y2="'+(cT+18)+'" stroke="'+cf+'" stroke-width="2.5" stroke-linecap="round"/>';
  s += '<line x1="'+(cx-7)+'" y1="'+(cT+5)+'" x2="'+(cx+7)+'" y2="'+(cT+5)+'" stroke="'+cf+'" stroke-width="2.5" stroke-linecap="round"/>';

  s += '</svg>';
  return s;
}

function getRosaryPlaylist(prayerId) {
  return rosaryPlaylists[prayerId] || rosaryPlaylists['rosary-joyful'];
}

function startRosaryPlayback(prayerId) {
  var playlist = getRosaryPlaylist(prayerId);
  rosaryPlaylistIdx = 0;
  rosaryIsPlaying = true;
  isRoomLeader = true;
  if (!rosaryAudio) rosaryAudio = new Audio();
  rosaryAudio.onended = function() {
    rosaryPlaylistIdx++;
    if (rosaryPlaylistIdx < playlist.tracks.length) {
      playRosaryTrack(playlist, rosaryPlaylistIdx);
    } else {
      onRosaryComplete();
    }
  };
  playRosaryTrack(playlist, 0);
  renderPrayerRoomState('active', {prayerId: prayerId});
  logEvent('rosary_started', {mystery: prayerId});
}

function playRosaryTrack(playlist, idx) {
  if (!playlist || idx >= playlist.tracks.length) return;
  var track = playlist.tracks[idx];
  rosaryAudio.src = 'audio/rosary/' + track.file;
  rosaryAudio.play().catch(function(e) { console.warn('Audio play blocked:', e); });
  updateRosaryUI(playlist, idx);
  // Broadcast track change to Firebase if leader
  if (activePrayerRoom && isRoomLeader) {
    activePrayerRoom.updateTrackSync(idx, 0);
  }
}

function toggleRosaryPlayback() {
  if (!rosaryAudio) return;
  // Non-leaders only toggle local mute
  if (activePrayerRoom && !isRoomLeader) {
    toggleLocalMute();
    return;
  }
  if (rosaryAudio.paused) {
    rosaryAudio.play().catch(function(){});
    rosaryIsPlaying = true;
    if (activePrayerRoom) activePrayerRoom.resumePrayer();
  } else {
    rosaryAudio.pause();
    rosaryIsPlaying = false;
    if (activePrayerRoom) activePrayerRoom.pausePrayer();
  }
  updateRosaryPlayBtn();
}

function toggleLocalMute() {
  if (!rosaryAudio) return;
  rosaryAudio.muted = !rosaryAudio.muted;
  var btn = document.getElementById('prPlayBtn');
  if (btn) {
    btn.innerHTML = rosaryAudio.muted ?
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' :
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    btn.classList.toggle('pr-muted', rosaryAudio.muted);
  }
}

function skipRosaryTrack() {
  var playlist = getRosaryPlaylist(selectedPrayerForRoom);
  rosaryPlaylistIdx++;
  if (rosaryPlaylistIdx < playlist.tracks.length) {
    playRosaryTrack(playlist, rosaryPlaylistIdx);
  } else {
    onRosaryComplete();
  }
}

function skipRosaryBack() {
  if (rosaryPlaylistIdx <= 0) return;
  var playlist = getRosaryPlaylist(selectedPrayerForRoom);
  rosaryPlaylistIdx--;
  playRosaryTrack(playlist, rosaryPlaylistIdx);
}

function updateRosaryUI(playlist, idx) {
  updateRosaryPlayBtn();
  // Update time display and rosary visualization on timeupdate
  if (rosaryAudio) {
    rosaryAudio.ontimeupdate = function() {
      var timeEl = document.getElementById('prAudioTime');
      if (timeEl && rosaryAudio.duration) {
        timeEl.textContent = formatRosaryTime(rosaryAudio.currentTime) + ' / ' + formatRosaryTime(rosaryAudio.duration);
      }
      // Update rosary bead visualization
      updateActiveRosaryDisplay(selectedPrayerForRoom);
      // Broadcast sync to Firebase periodically (leader only)
      if (activePrayerRoom && isRoomLeader && rosaryAudio.currentTime) {
        var now = Date.now();
        if (now - _lastSyncBroadcast > 5000) {
          _lastSyncBroadcast = now;
          activePrayerRoom.updateTrackSync(rosaryPlaylistIdx, rosaryAudio.currentTime);
        }
      }
    };
  }
}

function updateActiveRosaryDisplay(prayerId) {
  prayerId = prayerId || selectedPrayerForRoom;
  if (!rosaryAudio) return;
  var trackProgress = (rosaryAudio.duration > 0) ? (rosaryAudio.currentTime / rosaryAudio.duration) : 0;
  var pos = getTrackRosaryPosition(prayerId, rosaryPlaylistIdx, trackProgress);
  if (!pos) return;

  // Update mystery name
  var mysteryEl = document.getElementById('prMysteryName');
  if (mysteryEl) {
    mysteryEl.textContent = pos.mysteryName || '';
    mysteryEl.style.display = pos.mysteryName ? 'block' : 'none';
  }

  // Update decade label
  var decadeEl = document.getElementById('prDecadeLabel');
  if (decadeEl) decadeEl.textContent = pos.sectionName;

  // Update current prayer label
  var prayerLabel = document.getElementById('prCurrentPrayerLabel');
  if (prayerLabel) prayerLabel.textContent = pos.currentPrayer;

  // Update rosary SVG (only regenerate when beadGroup changes)
  var rosaryWrap = document.getElementById('prActiveRosary');
  if (rosaryWrap && rosaryWrap._lastBeadGroup !== pos.beadGroupIndex) {
    rosaryWrap.innerHTML = generateRosarySVG(pos.beadGroupIndex);
    rosaryWrap._lastBeadGroup = pos.beadGroupIndex;
  }

  // Update progress bar
  var fillEl = document.getElementById('prBeadProgress');
  if (fillEl) fillEl.style.width = (pos.overallProgress * 100) + '%';
}

function updateRosaryPlayBtn() {
  var btn = document.getElementById('prPlayBtn');
  if (btn) {
    btn.innerHTML = rosaryIsPlaying ?
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  }
}

function formatRosaryTime(s) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  var m = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function onRosaryComplete() {
  rosaryIsPlaying = false;
  if (rosaryAudio) rosaryAudio.pause();
  renderPrayerRoomState('completed', {prayerId: selectedPrayerForRoom});
  localStorage.setItem('prayedLastFamilyPrayer', Date.now().toString());
  var streak = parseInt(localStorage.getItem('prayedFamilyStreak') || '0');
  localStorage.setItem('prayedFamilyStreak', (streak + 1).toString());
  logEvent('rosary_completed', {mystery: selectedPrayerForRoom});
  showToast('Rosary complete! God bless your family.');
}

// Database structure in Firebase Realtime Database:
// prayerRooms/{roomId}/state: "waiting|active|paused|completed"
// prayerRooms/{roomId}/prayerId: "rosary-joyful"
// prayerRooms/{roomId}/startedAt: timestamp
// prayerRooms/{roomId}/duration: seconds
// prayerRooms/{roomId}/createdBy: userId
// prayerRooms/{roomId}/familyId: familyId
// prayerRooms/{roomId}/participants/{userId}: {name, joinedAt, online, country, flag}

function PrayerRoomEngine(roomId, userId) {
  this.roomId = roomId;
  this.userId = userId;
  this.db = firebase.database();
  this.roomRef = this.db.ref('prayerRooms/' + roomId);
  this.audio = new Audio();
  this.clockOffset = 0;
  this.syncInterval = null;
  this.onStateChange = null;
  this.onParticipantsChange = null;
}

PrayerRoomEngine.prototype.calibrateClock = function() {
  var self = this;
  return new Promise(function(resolve) {
    var serverTimeRef = firebase.database().ref('.info/serverTimeOffset');
    serverTimeRef.on('value', function(snap) {
      self.clockOffset = snap.val() || 0;
      resolve();
    });
  });
};

PrayerRoomEngine.prototype.getServerTime = function() {
  return Date.now() + this.clockOffset;
};

PrayerRoomEngine.prototype.join = function(userName, country, flag) {
  var self = this;
  return this.calibrateClock().then(function() {
    var participantRef = self.roomRef.child('participants/' + self.userId);

    // Auto-remove on disconnect
    participantRef.onDisconnect().remove();

    return participantRef.set({
      name: userName,
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
      online: true,
      country: country || '',
      flag: flag || ''
    });
  }).then(function() {
    // Listen for room state changes
    self.roomRef.on('value', function(snap) {
      var room = snap.val();
      if (!room) return;
      self.handleStateChange(room);
    });

    // Listen for participants specifically
    self.roomRef.child('participants').on('value', function(snap) {
      var participants = snap.val() || {};
      if (self.onParticipantsChange) {
        self.onParticipantsChange(participants);
      }
    });
  });
};

PrayerRoomEngine.prototype.handleStateChange = function(room) {
  if (this.onStateChange) this.onStateChange(room.state, room);

  switch (room.state) {
    case 'waiting':
      this.audio.pause();
      break;
    case 'active':
      this.syncAndPlay(room);
      break;
    case 'paused':
      this.audio.pause();
      if (this.syncInterval) clearInterval(this.syncInterval);
      break;
    case 'completed':
      this.audio.pause();
      if (this.syncInterval) clearInterval(this.syncInterval);
      break;
  }
};

PrayerRoomEngine.prototype.syncAndPlay = function(room) {
  var self = this;
  var playlist = getRosaryPlaylist(room.prayerId);
  if (!playlist) return;

  var trackIdx = room.currentTrackIdx || 0;
  var serverNow = this.getServerTime();
  var syncAge = (serverNow - (room.lastSyncAt || room.startedAt)) / 1000;
  var estimatedTime = (room.currentTrackTime || 0) + syncAge;

  // Load the correct track from the playlist
  var track = playlist.tracks[trackIdx];
  if (!track) return;
  var audioUrl = 'audio/rosary/' + track.file;

  // Update the local rosary playback state to match
  selectedPrayerForRoom = room.prayerId;
  rosaryPlaylistIdx = trackIdx;
  rosaryIsPlaying = true;

  if (!this.audio.src.endsWith(track.file)) {
    this.audio.src = audioUrl;
    this.audio.addEventListener('loadedmetadata', function onLoaded() {
      self.audio.removeEventListener('loadedmetadata', onLoaded);
      if (estimatedTime < self.audio.duration) {
        self.audio.currentTime = estimatedTime;
      }
    }, {once: true});
  } else if (Math.abs(this.audio.currentTime - estimatedTime) > 1.0) {
    this.audio.currentTime = estimatedTime;
  }

  this.audio.play().catch(function(e) {
    if (self.onAutoplayBlocked) self.onAutoplayBlocked();
  });

  // Also wire up the local rosary audio reference
  rosaryAudio = this.audio;
  updateRosaryUI(playlist, trackIdx);

  // Re-sync every 10 seconds
  if (this.syncInterval) clearInterval(this.syncInterval);
  this.syncInterval = setInterval(function() {
    self.roomRef.once('value', function(snap) {
      var freshRoom = snap.val();
      if (!freshRoom || freshRoom.state !== 'active') return;
      var freshIdx = freshRoom.currentTrackIdx || 0;
      if (freshIdx !== rosaryPlaylistIdx) {
        rosaryPlaylistIdx = freshIdx;
        var newTrack = playlist.tracks[freshIdx];
        if (newTrack) {
          self.audio.src = 'audio/rosary/' + newTrack.file;
          self.audio.currentTime = freshRoom.currentTrackTime || 0;
          self.audio.play().catch(function(){});
          updateRosaryUI(playlist, freshIdx);
        }
      }
    });
  }, 10000);
};

PrayerRoomEngine.prototype.startPrayer = function(prayerId, duration) {
  return this.roomRef.update({
    state: 'active',
    prayerId: prayerId,
    startedAt: firebase.database.ServerValue.TIMESTAMP,
    duration: duration || 1200,
    currentTrackIdx: 0,
    currentTrackTime: 0,
    lastSyncAt: firebase.database.ServerValue.TIMESTAMP
  });
};

PrayerRoomEngine.prototype.updateTrackSync = function(trackIdx, trackTime) {
  return this.roomRef.update({
    currentTrackIdx: trackIdx,
    currentTrackTime: trackTime,
    lastSyncAt: firebase.database.ServerValue.TIMESTAMP
  });
};

PrayerRoomEngine.prototype.pausePrayer = function() {
  return this.roomRef.update({ state: 'paused' });
};

PrayerRoomEngine.prototype.resumePrayer = function() {
  return this.roomRef.update({ state: 'active' });
};

PrayerRoomEngine.prototype.completePrayer = function() {
  return this.roomRef.update({ state: 'completed' });
};

PrayerRoomEngine.prototype.getAudioUrl = function(prayerId) {
  // For now, use YouTube-based audio or a placeholder
  // This will be replaced with actual hosted audio files
  return 'audio/prayers/' + prayerId + '/medium.mp3';
};

PrayerRoomEngine.prototype.leave = function() {
  if (this.syncInterval) clearInterval(this.syncInterval);
  this.audio.pause();
  this.roomRef.child('participants/' + this.userId).remove();
  this.roomRef.off();
};

// Create or join a prayer room
function createPrayerRoom(familyId) {
  if (!firebase.database) {
    showToast('Prayer Room requires an internet connection');
    return;
  }

  var roomId = familyId + '-' + Date.now();
  var roomRef = firebase.database().ref('prayerRooms/' + roomId);

  roomRef.set({
    state: 'waiting',
    familyId: familyId,
    createdBy: (currentUser && currentUser.uid) || 'anonymous',
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    participants: {}
  }).then(function() {
    logEvent('prayer_room_created', {prayerType: selectedPrayerForRoom});
    openPrayerRoomUI(roomId);
  }).catch(function(err) {
    console.warn('Could not create prayer room:', err);
    showToast('Could not create prayer room. Please try again.');
  });
}

// Check for active room in Firebase
function checkForActiveRoom(familyId, callback) {
  if (typeof firebase === 'undefined' || !firebase.database) {
    callback(null, null);
    return;
  }
  var roomsRef = firebase.database().ref('prayerRooms');
  roomsRef.orderByChild('familyId').equalTo(familyId).limitToLast(1)
    .once('value', function(snap) {
      var rooms = snap.val();
      if (!rooms) { callback(null, null); return; }
      var keys = Object.keys(rooms);
      var latestKey = keys[keys.length - 1];
      var latestRoom = rooms[latestKey];
      callback(latestRoom, latestKey);
    }).catch(function() { callback(null, null); });
}

// Open the Prayer Room UI overlay
function openPrayerRoomUI(roomId) {
  var overlay = document.getElementById('prayerRoomOverlay');
  if (!overlay) return;

  overlay.style.display = 'block';

  // Generate accurate rosary SVG for waiting state
  var rosaryEl = document.getElementById('prRosaryDisplay');
  if (rosaryEl) rosaryEl.innerHTML = generateRosarySVG();

  var u = userData || {};
  var familyName = u.lastName ? u.lastName + ' Family' : 'Family';
  var nameEl = document.getElementById('prFamilyName');
  if (nameEl) nameEl.textContent = familyName + ' Prayer Room';

  // Check for active family room first (mid-session join)
  var hasRTDB = typeof firebase !== 'undefined' && firebase.database;
  if (!roomId && hasRTDB) {
    var familyId = (u.familyId) || 'default-family';
    checkForActiveRoom(familyId, function(activeRoom, activeRoomKey) {
      if (activeRoom && (activeRoom.state === 'active' || activeRoom.state === 'paused')) {
        pendingJoinRoomId = activeRoomKey;
        renderPrayerRoomState('joining', activeRoom);
        return;
      }
      // No active room — show waiting
      proceedToWaitingState(null);
    });
    return;
  }

  proceedToWaitingState(roomId);
}

function proceedToWaitingState(roomId) {
  var u = userData || {};
  renderPrayerRoomState('waiting', {participants: {}});

  var hasRTDB = typeof firebase !== 'undefined' && firebase.database;
  if (!hasRTDB || !roomId) {
    // Local/demo mode
    var localParticipants = {};
    localParticipants['local-user'] = {
      name: u.firstName || 'You',
      country: u.country || '', flag: ''
    };
    if (u.familyMembers) {
      u.familyMembers.forEach(function(m, i) {
        if (m.online) {
          localParticipants['fam-' + i] = {name: m.firstName, country: '', flag: ''};
        }
      });
    }
    renderPrayerRoomParticipants(localParticipants);
    logEvent('prayer_room_opened', {mode: 'local'});
    return;
  }

  // Firebase mode: create engine and join
  activeRoomId = roomId;
  isRoomLeader = true;
  var userId = (currentUser && currentUser.uid) || 'user-' + Math.random().toString(36).substr(2, 9);
  activePrayerRoom = new PrayerRoomEngine(roomId, userId);

  activePrayerRoom.onStateChange = function(state, room) {
    renderPrayerRoomState(state, room);
  };
  activePrayerRoom.onParticipantsChange = function(participants) {
    renderPrayerRoomParticipants(participants);
  };
  activePrayerRoom.onAutoplayBlocked = function() {
    var tapBtn = document.getElementById('prTapToJoin');
    if (tapBtn) tapBtn.style.display = 'flex';
  };

  var userName = u.firstName || 'Friend';
  activePrayerRoom.join(userName, u.country || '', '');
  logEvent('prayer_room_joined', {familyId: roomId});
}

// Join an already-active prayer room (mid-session)
function joinActiveRoom() {
  if (!pendingJoinRoomId) return;
  isRoomLeader = false;

  var roomId = pendingJoinRoomId;
  pendingJoinRoomId = null;

  var userId = (currentUser && currentUser.uid) || 'user-' + Math.random().toString(36).substr(2, 9);
  activePrayerRoom = new PrayerRoomEngine(roomId, userId);
  activeRoomId = roomId;

  activePrayerRoom.onStateChange = function(state, room) {
    renderPrayerRoomState(state, room);
  };
  activePrayerRoom.onParticipantsChange = function(participants) {
    renderPrayerRoomParticipants(participants);
  };
  activePrayerRoom.onAutoplayBlocked = function() {
    var tapBtn = document.getElementById('prTapToJoin');
    if (tapBtn) tapBtn.style.display = 'flex';
  };

  var u = userData || {};
  activePrayerRoom.join(u.firstName || 'Friend', u.country || '', '');
  logEvent('prayer_room_joined_mid_session', {roomId: roomId});
}

function closePrayerRoom() {
  // Stop voice call
  stopVoiceCall();
  if (activePrayerRoom) {
    activePrayerRoom.leave();
    activePrayerRoom = null;
  }
  if (rosaryAudio) {
    rosaryAudio.pause();
    rosaryAudio.src = '';
    rosaryIsPlaying = false;
  }
  activeRoomId = null;
  pendingJoinRoomId = null;
  isRoomLeader = false;
  // Reset voice choice dialogs
  var vc1 = document.getElementById('prVoiceChoice');
  var vc2 = document.getElementById('prJoinVoiceChoice');
  var sb = document.getElementById('prStartBtn');
  var jb = document.getElementById('prJoinBtn');
  if (vc1) vc1.style.display = 'none';
  if (vc2) vc2.style.display = 'none';
  if (sb) sb.style.display = '';
  if (jb) jb.style.display = '';
  var overlay = document.getElementById('prayerRoomOverlay');
  if (overlay) overlay.style.display = 'none';
}

function renderPrayerRoomState(state, room) {
  var waiting = document.getElementById('prWaiting');
  var joining = document.getElementById('prJoining');
  var active = document.getElementById('prActive');
  var completed = document.getElementById('prCompleted');

  if (!waiting || !active || !completed) return;

  waiting.style.display = state === 'waiting' ? 'block' : 'none';
  if (joining) joining.style.display = state === 'joining' ? 'block' : 'none';
  active.style.display = (state === 'active' || state === 'paused') ? 'block' : 'none';
  completed.style.display = state === 'completed' ? 'block' : 'none';

  if (state === 'joining' && room) {
    renderJoiningState(room);
  }

  if (state === 'active' && room) {
    var prayerId = room.prayerId || selectedPrayerForRoom || 'rosary-joyful';
    selectedPrayerForRoom = prayerId;
    var playlist = getRosaryPlaylist(prayerId);
    var nameEl = document.getElementById('prPrayerName');
    if (nameEl) nameEl.textContent = playlist.name || prayerId;
    // Initialize active rosary display
    var rosaryWrap = document.getElementById('prActiveRosary');
    if (rosaryWrap && !rosaryWrap.hasChildNodes()) {
      rosaryWrap.innerHTML = generateRosarySVG(0);
      rosaryWrap._lastBeadGroup = 0;
    }
    // Render voice participants
    renderVoiceParticipants();
  }

  if (state === 'completed' && room) {
    var prayerId2 = room.prayerId || selectedPrayerForRoom || 'rosary-joyful';
    var pl = getRosaryPlaylist(prayerId2);
    var prayerNameEl = document.getElementById('prCompletedPrayer');
    if (prayerNameEl) prayerNameEl.textContent = pl.name || prayerId2;

    var durationEl = document.getElementById('prDuration');
    if (durationEl) {
      if (rosaryAudio && rosaryAudio.duration) {
        durationEl.textContent = formatRosaryTime(rosaryAudio.duration);
      } else {
        var mins = Math.round((room.duration || 0) / 60);
        durationEl.textContent = mins + ' minutes';
      }
    }
    var dateEl = document.getElementById('prDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'});

    var streak = parseInt(localStorage.getItem('prayedFamilyStreak') || '1');
    var streakEl = document.getElementById('prStreak');
    if (streakEl) streakEl.innerHTML = '<span class="pr-streak-fire">&#128293;</span> ' + streak + ' day family streak';

    var participantCount = room.participants ? Object.keys(room.participants).length : 0;
    logEvent('family_prayer_completed', {duration: room.duration || 0, prayerType: prayerId2, participants: participantCount});
  }
}

function renderJoiningState(room) {
  var prayerId = room.prayerId || 'rosary-joyful';
  var playlist = getRosaryPlaylist(prayerId);
  var trackIdx = room.currentTrackIdx || 0;
  var trackTime = room.currentTrackTime || 0;
  // Estimate track progress (assume ~120 sec per track average)
  var estDuration = 120;
  var trackProgress = estDuration > 0 ? Math.min(1, trackTime / estDuration) : 0;

  var pos = getTrackRosaryPosition(prayerId, trackIdx, trackProgress);

  var u = userData || {};
  var nameEl = document.getElementById('prJoiningFamilyName');
  if (nameEl) nameEl.textContent = (u.lastName || 'Your') + ' Family';

  var mysteryEl = document.getElementById('prJoiningMystery');
  if (mysteryEl) mysteryEl.textContent = 'is praying the ' + (playlist.name || prayerId);

  var decadeEl = document.getElementById('prJoiningDecade');
  if (decadeEl && pos) decadeEl.textContent = 'Currently on ' + pos.sectionName;

  var beadEl = document.getElementById('prJoiningBead');
  if (beadEl && pos) beadEl.textContent = pos.currentPrayer;

  var rosaryEl = document.getElementById('prJoiningRosary');
  if (rosaryEl && pos) rosaryEl.innerHTML = generateRosarySVG(pos.beadGroupIndex);

  // Render participants in joining view
  if (room.participants) {
    var joinList = document.getElementById('prJoiningParticipantList');
    var joinCount = document.getElementById('prJoiningParticipantCount');
    var colors = ['#1B3A5C','#7C3AED','#0D9488','#C68A2E','#E74C8B','#3B82F6'];
    var keys = Object.keys(room.participants);
    if (joinList) {
      var html = '';
      keys.forEach(function(key, i) {
        var p = room.participants[key];
        var initial = (p.name || '?').charAt(0).toUpperCase();
        html += '<div class="pr-avatar-circle online" style="background:' + colors[i % colors.length] + '">' + initial + '</div>';
      });
      joinList.innerHTML = html;
    }
    if (joinCount) joinCount.textContent = keys.length + (keys.length === 1 ? ' person' : ' people') + ' praying';
  }
}

function renderPrayerRoomParticipants(participants) {
  var container = document.getElementById('prParticipantList');
  if (!container) return;

  var colors = ['#1B3A5C','#7C3AED','#0D9488','#C68A2E','#E74C8B','#3B82F6'];
  var html = '';
  var keys = Object.keys(participants);
  keys.forEach(function(key, i) {
    var p = participants[key];
    var initial = (p.name || '?').charAt(0).toUpperCase();
    html += '<div class="pr-avatar-circle online" style="background:' + colors[i % colors.length] + '">' + initial + '</div>';
  });

  container.innerHTML = html;

  // Update count
  var countEl = document.getElementById('prParticipantCount');
  if (countEl) countEl.textContent = keys.length + (keys.length === 1 ? ' person' : ' people') + ' in room';

  // Also update voice bar participants
  _renderVoiceList(document.getElementById('prVoiceParticipants'), participants);
}

function startFamilyPrayer(prayerId) {
  isRoomLeader = true;
  if (activePrayerRoom) {
    activePrayerRoom.startPrayer(prayerId, 1200);
  } else {
    startRosaryPlayback(prayerId);
  }
}

function tapToJoinPrayer() {
  if (!activePrayerRoom) return;
  activePrayerRoom.audio.play();
  var tapBtn = document.getElementById('prTapToJoin');
  if (tapBtn) tapBtn.style.display = 'none';
}

// ===== WEBRTC VOICE ENGINE =====
var prayerVoice = null;
var voiceMode = 'none'; // 'none', 'voice', 'listen'

function PrayerVoice(roomId, peerId) {
  this.roomId = roomId;
  this.peerId = peerId;
  this.localStream = null;
  this.peers = {};         // peerId → {pc, audioEl, stream}
  this.isMuted = false;
  this.audioCtx = null;
  this.analyserNodes = {};
  this.levelInterval = null;
  this.onPeerJoined = null;
  this.onPeerLeft = null;
  this.onAudioLevel = null;
  this._listeners = [];
}

PrayerVoice.prototype.start = function(withMic) {
  var self = this;
  var promise;
  if (withMic) {
    promise = navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
      self.localStream = stream;
    }).catch(function(e) {
      console.warn('Mic access denied, falling back to listen-only:', e);
      self.localStream = null;
    });
  } else {
    promise = Promise.resolve();
  }

  return promise.then(function() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    var voiceRef = firebase.database().ref('prayerRooms/' + self.roomId + '/voice');

    // Register self
    var myRef = voiceRef.child(self.peerId);
    myRef.set({joined: firebase.database.ServerValue.TIMESTAMP, muted: !self.localStream});
    myRef.onDisconnect().remove();

    // Listen for new peers
    var onAdded = voiceRef.on('child_added', function(snap) {
      var pid = snap.key;
      if (pid === self.peerId) return;
      self._createConnection(pid, true);
      if (self.onPeerJoined) self.onPeerJoined(pid);
    });
    self._listeners.push({ref: voiceRef, event: 'child_added', fn: onAdded});

    // Listen for peers leaving
    var onRemoved = voiceRef.on('child_removed', function(snap) {
      var pid = snap.key;
      self._closeConnection(pid);
      if (self.onPeerLeft) self.onPeerLeft(pid);
    });
    self._listeners.push({ref: voiceRef, event: 'child_removed', fn: onRemoved});

    // Start audio level monitoring
    self._startLevelMonitoring();
  });
};

PrayerVoice.prototype._createConnection = function(peerId, isInitiator) {
  var self = this;
  var config = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
  var pc = new RTCPeerConnection(config);
  var audioEl = document.createElement('audio');
  audioEl.autoplay = true;
  audioEl.volume = 0.7;
  document.body.appendChild(audioEl);

  this.peers[peerId] = {pc: pc, audioEl: audioEl, stream: null};

  // Add local tracks if we have mic
  if (this.localStream) {
    this.localStream.getTracks().forEach(function(track) {
      pc.addTrack(track, self.localStream);
    });
  }

  // Handle remote stream
  pc.ontrack = function(e) {
    if (e.streams && e.streams[0]) {
      audioEl.srcObject = e.streams[0];
      self.peers[peerId].stream = e.streams[0];
      self._addAnalyser(peerId, e.streams[0]);
    }
  };

  // ICE candidates
  var candRef = firebase.database().ref('prayerRooms/' + self.roomId + '/signal/' + self.peerId + '-' + peerId + '/candidates');
  var remoteCandRef = firebase.database().ref('prayerRooms/' + self.roomId + '/signal/' + peerId + '-' + self.peerId + '/candidates');

  pc.onicecandidate = function(e) {
    if (e.candidate) {
      candRef.push(e.candidate.toJSON());
    }
  };

  remoteCandRef.on('child_added', function(snap) {
    var cand = snap.val();
    if (cand) pc.addIceCandidate(new RTCIceCandidate(cand)).catch(function(){});
  });

  // Signaling
  var sigRef = firebase.database().ref('prayerRooms/' + self.roomId + '/signal/' + self.peerId + '-' + peerId);
  var remoteSigRef = firebase.database().ref('prayerRooms/' + self.roomId + '/signal/' + peerId + '-' + self.peerId);

  if (isInitiator) {
    pc.createOffer().then(function(offer) {
      return pc.setLocalDescription(offer);
    }).then(function() {
      sigRef.update({offer: pc.localDescription.toJSON()});
    }).catch(function(e) { console.warn('WebRTC offer error:', e); });

    // Listen for answer
    remoteSigRef.child('offer').on('value', function(snap) {
      var answer = snap.val();
      if (answer && answer.type === 'answer' && pc.signalingState !== 'stable') {
        pc.setRemoteDescription(new RTCSessionDescription(answer)).catch(function(){});
      }
    });
  } else {
    // Listen for offer
    remoteSigRef.child('offer').on('value', function(snap) {
      var offer = snap.val();
      if (offer && offer.type === 'offer') {
        pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function() {
          return pc.createAnswer();
        }).then(function(answer) {
          return pc.setLocalDescription(answer);
        }).then(function() {
          sigRef.update({offer: pc.localDescription.toJSON()});
        }).catch(function(e) { console.warn('WebRTC answer error:', e); });
      }
    });
  }
};

PrayerVoice.prototype._addAnalyser = function(peerId, stream) {
  if (!this.audioCtx) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  var source = this.audioCtx.createMediaStreamSource(stream);
  var analyser = this.audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.5;
  source.connect(analyser);
  this.analyserNodes[peerId] = analyser;
};

PrayerVoice.prototype._startLevelMonitoring = function() {
  var self = this;
  // Monitor local mic too
  if (this.localStream && !this.audioCtx) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (this.localStream) {
    var localSrc = this.audioCtx.createMediaStreamSource(this.localStream);
    var localAnalyser = this.audioCtx.createAnalyser();
    localAnalyser.fftSize = 256;
    localAnalyser.smoothingTimeConstant = 0.5;
    localSrc.connect(localAnalyser);
    this.analyserNodes[this.peerId] = localAnalyser;
  }

  this.levelInterval = setInterval(function() {
    var peerIds = Object.keys(self.analyserNodes);
    for (var i = 0; i < peerIds.length; i++) {
      var pid = peerIds[i];
      var analyser = self.analyserNodes[pid];
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      var sum = 0;
      for (var j = 0; j < data.length; j++) sum += data[j];
      var avg = sum / data.length;
      var level = Math.min(1, avg / 80);
      if (self.onAudioLevel) self.onAudioLevel(pid, level);
    }
  }, 150);
};

PrayerVoice.prototype._closeConnection = function(peerId) {
  var peer = this.peers[peerId];
  if (peer) {
    if (peer.pc) peer.pc.close();
    if (peer.audioEl) {
      peer.audioEl.srcObject = null;
      if (peer.audioEl.parentNode) peer.audioEl.parentNode.removeChild(peer.audioEl);
    }
    delete this.peers[peerId];
  }
  delete this.analyserNodes[peerId];
};

PrayerVoice.prototype.mute = function() {
  this.isMuted = true;
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(function(t) { t.enabled = false; });
  }
  this._updateMuteState();
};

PrayerVoice.prototype.unmute = function() {
  this.isMuted = false;
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(function(t) { t.enabled = true; });
  }
  this._updateMuteState();
};

PrayerVoice.prototype._updateMuteState = function() {
  if (typeof firebase !== 'undefined' && firebase.database) {
    firebase.database().ref('prayerRooms/' + this.roomId + '/voice/' + this.peerId + '/muted').set(this.isMuted);
  }
};

PrayerVoice.prototype.stop = function() {
  var self = this;
  if (this.levelInterval) clearInterval(this.levelInterval);
  // Close all peer connections
  Object.keys(this.peers).forEach(function(pid) { self._closeConnection(pid); });
  // Stop local stream
  if (this.localStream) {
    this.localStream.getTracks().forEach(function(t) { t.stop(); });
    this.localStream = null;
  }
  // Clean up Firebase
  if (typeof firebase !== 'undefined' && firebase.database) {
    firebase.database().ref('prayerRooms/' + this.roomId + '/voice/' + this.peerId).remove();
    firebase.database().ref('prayerRooms/' + this.roomId + '/signal').remove();
  }
  // Clean up listeners
  this._listeners.forEach(function(l) { l.ref.off(l.event, l.fn); });
  this._listeners = [];
  if (this.audioCtx) { this.audioCtx.close(); this.audioCtx = null; }
  this.analyserNodes = {};
};

// ===== VOICE UI INTEGRATION =====
function startVoiceCall(withMic) {
  var roomId = activeRoomId;
  if (!roomId) return;
  voiceMode = withMic ? 'voice' : 'listen';

  var peerId = (currentUser && currentUser.uid) || 'user-' + Math.random().toString(36).substr(2, 9);
  prayerVoice = new PrayerVoice(roomId, peerId);

  prayerVoice.onPeerJoined = function(pid) {
    renderVoiceParticipants();
  };
  prayerVoice.onPeerLeft = function(pid) {
    renderVoiceParticipants();
  };
  prayerVoice.onAudioLevel = function(pid, level) {
    var avatar = document.querySelector('[data-voice-peer="' + pid + '"] .pr-voice-avatar');
    if (avatar) {
      if (level > 0.15) {
        avatar.classList.add('speaking');
      } else {
        avatar.classList.remove('speaking');
      }
    }
  };

  prayerVoice.start(withMic).then(function() {
    renderVoiceParticipants();
    // Show leave button if on a voice call
    var leaveBtn = document.getElementById('prVoiceLeaveBtn');
    if (leaveBtn) leaveBtn.style.display = 'flex';
    // Update mute button state
    updateVoiceMuteBtn();
  });
}

function stopVoiceCall() {
  if (prayerVoice) {
    prayerVoice.stop();
    prayerVoice = null;
  }
  voiceMode = 'none';
  var leaveBtn = document.getElementById('prVoiceLeaveBtn');
  if (leaveBtn) leaveBtn.style.display = 'none';
}

function toggleVoiceMute() {
  if (!prayerVoice) return;
  if (prayerVoice.isMuted) {
    prayerVoice.unmute();
  } else {
    prayerVoice.mute();
  }
  updateVoiceMuteBtn();
  renderVoiceParticipants();
}

function updateVoiceMuteBtn() {
  var btn = document.getElementById('prVoiceMuteBtn');
  if (!btn || !prayerVoice) return;
  btn.classList.toggle('muted', prayerVoice.isMuted);
  btn.innerHTML = prayerVoice.isMuted ?
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9l4.18 4.18L21 19.73 4.27 3z"/></svg>' :
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.998.998 0 00-.98-.85c-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08a6.993 6.993 0 005.91-5.78c.1-.6-.39-1.14-1-1.14z"/></svg>';
}

function leaveVoiceCall() {
  stopVoiceCall();
  renderVoiceParticipants();
}

// ===== VOICE PERMISSION FLOW =====
function showVoiceChoice() {
  var choice = document.getElementById('prVoiceChoice');
  var startBtn = document.getElementById('prStartBtn');
  if (choice) choice.style.display = 'block';
  if (startBtn) startBtn.style.display = 'none';
}

function startWithVoice(withMic) {
  var choice = document.getElementById('prVoiceChoice');
  if (choice) choice.style.display = 'none';
  startFamilyPrayer(selectedPrayerForRoom || 'rosary-joyful');
  // Start voice after prayer starts
  setTimeout(function() {
    startVoiceCall(withMic);
  }, 500);
}

function showJoinVoiceChoice() {
  var choice = document.getElementById('prJoinVoiceChoice');
  var joinBtn = document.getElementById('prJoinBtn');
  if (choice) choice.style.display = 'block';
  if (joinBtn) joinBtn.style.display = 'none';
}

function joinWithVoice(withMic) {
  var choice = document.getElementById('prJoinVoiceChoice');
  if (choice) choice.style.display = 'none';
  joinActiveRoom();
  // Start voice after joining
  setTimeout(function() {
    startVoiceCall(withMic);
  }, 500);
}

function renderVoiceParticipants() {
  var container = document.getElementById('prVoiceParticipants');
  if (!container) return;

  // Get participants from Firebase room data
  var participants = {};
  if (activePrayerRoom && activePrayerRoom.roomRef) {
    activePrayerRoom.roomRef.child('participants').once('value', function(snap) {
      participants = snap.val() || {};
      _renderVoiceList(container, participants);
    });
  } else {
    // Local/demo mode: show current user
    var u = userData || {};
    participants['local'] = {name: u.firstName || 'You'};
    _renderVoiceList(container, participants);
  }
}

function _renderVoiceList(container, participants) {
  var colors = ['#1B3A5C','#7C3AED','#0D9488','#C68A2E','#E74C8B','#3B82F6'];
  var html = '';
  var keys = Object.keys(participants);

  keys.forEach(function(key, i) {
    var p = participants[key];
    var initial = (p.name || '?').charAt(0).toUpperCase();
    var color = colors[i % colors.length];
    var isSelf = prayerVoice && key === prayerVoice.peerId;
    var isMuted = isSelf ? (prayerVoice && prayerVoice.isMuted) : false;
    var statusClass = isMuted ? 'muted' : 'active';
    var avatarClass = 'pr-voice-avatar' + (isMuted ? ' muted' : '');

    html += '<div class="pr-voice-person" data-voice-peer="' + key + '">';
    html += '<div class="' + avatarClass + '" style="background:' + color + '">';
    html += '<div class="pr-voice-glow"></div>';
    html += initial;
    html += '</div>';
    html += '<span class="pr-voice-name">' + (p.name || '?') + '</span>';
    html += '<span class="pr-voice-status ' + statusClass + '">\u25CF</span>';
    html += '</div>';
  });

  container.innerHTML = html;
}
