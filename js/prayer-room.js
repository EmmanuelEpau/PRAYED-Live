// prayer-room.js - Family Prayer Room Engine

var prayerRoom = null;
var activeRoomId = null;
var activePrayerRoom = null;
var selectedPrayerForRoom = 'rosary-joyful';

function selectPrayerOption(btn, prayerId) {
  selectedPrayerForRoom = prayerId;
  // Remove selected class from all options
  var options = document.querySelectorAll('.pr-prayer-option');
  options.forEach(function(opt) { opt.classList.remove('selected'); });
  btn.classList.add('selected');
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
  var serverNow = this.getServerTime();
  var elapsedMs = serverNow - room.startedAt;
  var elapsedSec = elapsedMs / 1000;

  // Load audio if not loaded
  var audioUrl = this.getAudioUrl(room.prayerId);
  if (this.audio.src !== audioUrl) {
    this.audio.src = audioUrl;
  }

  // Seek to correct position
  if (Math.abs(this.audio.currentTime - elapsedSec) > 0.5) {
    this.audio.currentTime = elapsedSec;
  }

  // Play
  this.audio.play().catch(function(e) {
    // Autoplay blocked: show tap-to-join UI
    if (self.onAutoplayBlocked) self.onAutoplayBlocked();
  });

  // Re-sync every 10 seconds
  if (this.syncInterval) clearInterval(this.syncInterval);
  this.syncInterval = setInterval(function() {
    var serverNow = self.getServerTime();
    var expected = (serverNow - room.startedAt) / 1000;
    var actual = self.audio.currentTime;
    var drift = Math.abs(expected - actual);

    if (drift > 1.0) {
      self.audio.currentTime = expected;
    } else if (drift > 0.3) {
      self.audio.playbackRate = expected > actual ? 1.02 : 0.98;
      setTimeout(function() { self.audio.playbackRate = 1.0; }, 2000);
    }
  }, 10000);
};

PrayerRoomEngine.prototype.startPrayer = function(prayerId, duration) {
  return this.roomRef.update({
    state: 'active',
    prayerId: prayerId,
    startedAt: firebase.database.ServerValue.TIMESTAMP,
    duration: duration || 1200
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

// Open the Prayer Room UI overlay
function openPrayerRoomUI(roomId) {
  activeRoomId = roomId;
  var overlay = document.getElementById('prayerRoomOverlay');
  if (!overlay) return;

  overlay.style.display = 'block';

  // Create engine
  var userId = (currentUser && currentUser.uid) || 'user-' + Math.random().toString(36).substr(2, 9);
  activePrayerRoom = new PrayerRoomEngine(roomId, userId);

  // Set up callbacks
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

  // Join the room
  var userName = userData ? userData.firstName : 'Friend';
  var country = userData ? (userData.country || '') : '';
  activePrayerRoom.join(userName, country, '');
  logEvent('prayer_room_joined', {familyId: roomId});

  // Show waiting state initially
  renderPrayerRoomState('waiting', {participants: {}});
}

function closePrayerRoom() {
  if (activePrayerRoom) {
    activePrayerRoom.leave();
    activePrayerRoom = null;
  }
  activeRoomId = null;
  var overlay = document.getElementById('prayerRoomOverlay');
  if (overlay) overlay.style.display = 'none';
}

function renderPrayerRoomState(state, room) {
  var waiting = document.getElementById('prWaiting');
  var active = document.getElementById('prActive');
  var completed = document.getElementById('prCompleted');

  if (!waiting || !active || !completed) return;

  waiting.style.display = state === 'waiting' ? 'block' : 'none';
  active.style.display = (state === 'active' || state === 'paused') ? 'block' : 'none';
  completed.style.display = state === 'completed' ? 'block' : 'none';

  if (state === 'active' && room) {
    var nameEl = document.getElementById('prPrayerName');
    if (nameEl) nameEl.textContent = room.prayerId || 'Prayer';
  }

  if (state === 'completed' && room) {
    var durationEl = document.getElementById('prDuration');
    if (durationEl) {
      var mins = Math.round((room.duration || 0) / 60);
      durationEl.textContent = mins + ' minutes';
    }
    var participantCount = room.participants ? Object.keys(room.participants).length : 0;
    logEvent('family_prayer_completed', {duration: room.duration || 0, prayerType: room.prayerId || '', participants: participantCount});
  }
}

function renderPrayerRoomParticipants(participants) {
  var container = document.getElementById('prParticipantList');
  if (!container) return;

  var html = '';
  var keys = Object.keys(participants);
  keys.forEach(function(key) {
    var p = participants[key];
    html += '<div class="pr-participant">' +
      '<div class="pr-participant-avatar" style="background:var(--color-primary)">' + (p.name || '?').charAt(0) + '</div>' +
      '<span class="pr-participant-name">' + escapeHtml(p.name || 'Unknown') + '</span>' +
      '<span class="pr-participant-flag">' + (p.flag || '') + '</span>' +
      '<span class="pr-participant-status online">Connected</span>' +
    '</div>';
  });

  container.innerHTML = html;

  // Update count
  var countEl = document.getElementById('prParticipantCount');
  if (countEl) countEl.textContent = keys.length + (keys.length === 1 ? ' person' : ' people') + ' in room';
}

function startFamilyPrayer(prayerId) {
  if (!activePrayerRoom) return;
  activePrayerRoom.startPrayer(prayerId, 1200);
}

function tapToJoinPrayer() {
  if (!activePrayerRoom) return;
  activePrayerRoom.audio.play();
  var tapBtn = document.getElementById('prTapToJoin');
  if (tapBtn) tapBtn.style.display = 'none';
}
