// ===== FIREBASE =====
var firebaseConfig = {
  apiKey: "AIzaSyAnnrgNTAJeqjNXnJsfuXeD3NI5ephTPHM",
  authDomain: "prayed-app-2a108.firebaseapp.com",
  databaseURL: "https://prayed-app-2a108-default-rtdb.firebaseio.com",
  projectId: "prayed-app-2a108",
  storageBucket: "prayed-app-2a108.firebasestorage.app",
  messagingSenderId: "540401821546",
  appId: "1:540401821546:web:07478623a3b94f51936713"
};
var db = null;
var auth = null;
var currentUser = null;
var rtdb = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  rtdb = firebase.database();
} catch(e) { console.warn('Firebase init failed:', e); }

// ===== ANALYTICS =====
// ===== i18n SHORTHAND =====
// Global translation helper - tries i18n.t() first, falls back gracefully
function t(key) {
  if(typeof i18n !== 'undefined') {
    var val = i18n.t(key);
    // i18n.t returns the key itself if not found - check if we got a real translation
    if(val !== key) return val;
  }
  // Fallback: use a hardcoded English map for critical UI strings
  var fallbacks = {
    'ui.tagline':'The family that prays together stays together',
    'ui.family_room':'Family Prayer Room','ui.enter_prayer_room':'Enter Prayer Room',
    'ui.no_one_online':'No one online right now','ui.todays_habits':'Today\'s Habits',
    'ui.todays_prayers':'Today\'s Prayers','ui.view_all':'View All','ui.completed':'completed',
    'ui.my_habits':'My Habits & Streaks','ui.lent_challenge':'Lent Family Prayer Challenge',
    'ui.verse_of_the_day':'Verse of the Day','ui.read_full_chapter':'Read Full Chapter',
    'ui.circle_activity':'Circle Activity','ui.a_world_at_prayer':'A World at Prayer',
    'ui.countries_connected':'countries unite in faith every day',
    'ui.pray':'Pray','ui.find_prayers':'Find prayers for every moment',
    'ui.search_prayers':'Search prayers, reflections, courses...',
    'ui.pray_with_family':'Pray with Family','ui.circles':'Circles',
    'ui.your_prayer_communities':'Your prayer communities',
    'ui.my_family':'My Family','ui.your_impact':'Your Impact',
    'ui.settings':'Settings','ui.dark_mode':'Dark Mode',
    'ui.notifications':'Notifications & Reminders','ui.sign_out':'Sign Out',
    'ui.share_prayed':'Share PRAYED'
  };
  return fallbacks[key] || key.split('.').pop().replace(/_/g, ' ');
}

function logEvent(eventName, params) {
  try {
    if(typeof firebase !== 'undefined' && firebase.analytics) {
      firebase.analytics().logEvent(eventName, params || {});
    }
  } catch(e) { /* analytics not critical */ }
}

function syncToCloud() {
  if(currentUser && userData && !userData.authUid) { userData.authUid = currentUser.uid; }
  localStorage.setItem('prayedLiveUser', JSON.stringify(userData));
  if (currentUser && db) {
    try {
      db.collection('users').doc(currentUser.uid).set(userData, {merge:true});
    } catch(e) { console.warn('Firestore sync failed:', e); }
  }
}

// ===== DATA =====
var userData = null;
var onbStep = 0;
var totalSteps = 8;
var currentScreen = 'home';
var playerState = {playing:false, expanded:false, title:'', image:'', progress:30, duration:754};

var habits = [
  {name:'Morning Prayer',time:'7:15 AM',done:true,cat:'prayer'},
  {name:'Daily Rosary',time:'12:30 PM',done:true,cat:'prayer'},
  {name:'Gospel Reading',time:'10:00 AM',done:true,cat:'prayer'},
  {name:'Family Check-In',time:'Later today',done:false,cat:'family'},
  {name:'Evening Prayer',time:'8:00 PM',done:false,cat:'prayer'},
  {name:'Scripture Reading',time:'Any time',done:false,cat:'prayer'}
];
var extraHabits = [
  {name:'Water (8 glasses)',time:'',done:false,cat:'wellness'},
  {name:'Exercise (30 min)',time:'',done:false,cat:'wellness'},
  {name:'Sleep (8 hours)',time:'',done:false,cat:'wellness'},
  {name:'Spiritual Reading',time:'15 min',done:false,cat:'wellness'}
];
var countryCount = 12;
var globalPrayerCount = 0;
var nearbyChurchesCache = [];

// Global prayer counter - syncs with Firestore
function fetchGlobalPrayerCount() {
  if (!db) return;
  try {
    db.collection('counters').doc('global').onSnapshot(function(doc) {
      if (doc.exists) {
        globalPrayerCount = doc.data().prayers || 0;
        // Update any visible counters
        var el = document.getElementById('globalCounterNum');
        if (el) el.textContent = globalPrayerCount.toLocaleString();
      }
    });
  } catch(e) { console.warn('Counter fetch failed:', e); }
}

function incrementPrayerCount() {
  if (!db) return;
  try {
    db.collection('counters').doc('global').set({
      prayers: firebase.firestore.FieldValue.increment(1),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge: true});
    globalPrayerCount++;
  } catch(e) { console.warn('Counter increment failed:', e); }
}

// Security: HTML escaping to prevent XSS attacks
function escapeHtml(str) {
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

var parishes = [
  {name:"Basilica of the Sacred Heart",city:"South Bend, IN",lat:41.6637,lng:-86.2420},
  {name:"St. Mary's Cathedral",city:"San Francisco, CA",lat:37.7749,lng:-122.4194},
  {name:"Holy Cross Church",city:"New York, NY",lat:40.7306,lng:-73.9352},
  {name:"Our Lady of Sorrows",city:"Chicago, IL",lat:41.8781,lng:-87.6298},
  {name:"Immaculate Heart",city:"Los Angeles, CA",lat:34.0522,lng:-118.2437},
  {name:"St. Patrick's Cathedral",city:"Washington DC",lat:38.8951,lng:-77.0369},
  {name:"Cathedral of Our Lady",city:"Boston, MA",lat:42.3601,lng:-71.0589},
  {name:"St. Paul the Apostle",city:"Denver, CO",lat:39.7392,lng:-104.9903},
  {name:"St. Anthony's",city:"Phoenix, AZ",lat:33.4484,lng:-112.0742},
  {name:"Cathedral Prep",city:"Philadelphia, PA",lat:39.9526,lng:-75.1652},
  {name:"Our Lady of the Cathedral",city:"San Antonio, TX",lat:29.4241,lng:-98.4936},
  {name:"St. Mary's",city:"San Diego, CA",lat:32.7157,lng:-117.1611},
  {name:"Cathedral Basilica",city:"Dallas, TX",lat:32.7767,lng:-96.7970},
  {name:"Holy Family",city:"San Jose, CA",lat:37.3382,lng:-121.8863},
  {name:"St. Mary's",city:"Austin, TX",lat:30.2672,lng:-97.7431},
  {name:"Cathedral of Christ the Light",city:"Oakland, CA",lat:37.7952,lng:-122.2724},
  {name:"St. Joseph's",city:"Kansas City, MO",lat:39.0997,lng:-94.5786},
  {name:"Sacred Heart",city:"Long Beach, CA",lat:33.7701,lng:-118.1937},
  {name:"St. Catherine's",city:"Fresno, CA",lat:36.7469,lng:-119.7727},
  {name:"Cathedral of the Blessed Sacrament",city:"Sacramento, CA",lat:38.5816,lng:-121.4944}
];

var userLat = 37.7749, userLng = -122.4194;
var geoDetected = false;

var circles = [
  {id:'family-us',name:'Family US',members:24,color:'#2563EB',icon:'family'},
  {id:'daily-rosary',name:'Daily Rosary',members:156,color:'#0D9488',icon:'rosary'},
  {id:'school-prayer',name:'School Prayer',members:89,color:'#C68A2E',icon:'book'}
];

var browseCircles = {
  'near': [],
  'intentions': [
    {id:'healing',name:'Prayers for Healing',meta:'Global',members:'2,847 members praying',color:'#E85D4A',icon:'heart'},
    {id:'peace',name:'Prayers for Peace',meta:'Global',members:'1,523 members praying',color:'#0D9488',icon:'dove'}
  ],
  'families': [
    {id:'young-fam',name:'Young Families',meta:'Global',members:'1,234 families',color:'#7C3AED',icon:'family'},
    {id:'homeschool',name:'Catholic Homeschoolers',meta:'Global',members:'567 families',color:'#C68A2E',icon:'book'}
  ],
  'global': [
    {id:'uganda',name:'Uganda Prayer Movement',meta:'East Africa',members:'456 members',color:'#E85D4A',icon:'globe'},
    {id:'france',name:'France Rosary Network',meta:'Europe',members:'312 members',color:'#2563EB',icon:'globe'},
    {id:'peru',name:'Peru Mission Circle',meta:'South America',members:'289 members',color:'#0D9488',icon:'globe'}
  ]
};

var feedUsers = [
  {name:'Maria Santos',initials:'MS',flag:'brazil',color:'#E85D4A',action:'Started the Daily Rosary',time:'2 min ago'},
  {name:'James Torres',initials:'JT',flag:'usa',color:'#2563EB',action:'Prayed the Joyful Mysteries with family',time:'8 min ago'},
  {name:'Amira Hassan',initials:'AH',flag:'egypt',color:'#0D9488',action:'Joined Prayers for Peace circle',time:'15 min ago'}
];

var circleWalls = {
  'family-us': [
    {name:'Sarah Mitchell',initials:'SM',flag:'usa',color:'#2563EB',text:'Please pray for our community - we are starting a new family prayer group this Sunday.',count:156,time:'2 min ago'},
    {name:'James Torres',initials:'JT',flag:'usa',color:'#0D9488',text:'Just finished praying the Joyful Mysteries with my family. What a beautiful evening!',count:324,time:'15 min ago'},
    {name:'Linda Chen',initials:'LC',flag:'usa',color:'#C68A2E',text:'Grateful for this community. My children look forward to our weekly rosary.',count:89,time:'1 hour ago'},
    {name:'Michael Brown',initials:'MB',flag:'usa',color:'#7C3AED',text:'Prayers for my mother who is undergoing surgery tomorrow. Thank you all.',count:412,time:'2 hours ago'},
    {name:'Rosa Hernandez',initials:'RH',flag:'mexico',color:'#E85D4A',text:'Our family just completed the 30-day prayer challenge! So blessed.',count:267,time:'3 hours ago'}
  ],
  'daily-rosary': [
    {name:'Maria Santos',initials:'MS',flag:'brazil',color:'#E85D4A',text:'Please pray for our community - we are starting a new family prayer group this Sunday.',count:156,time:'2 min ago'},
    {name:'Francois Dubois',initials:'FD',flag:'france',color:'#2563EB',text:'For vocations to the priesthood and religious life.',count:212,time:'30 min ago'},
    {name:'Fatima Okafor',initials:'FO',flag:'nigeria',color:'#0D9488',text:'Grateful for our circle support during this challenging time.',count:145,time:'1 hour ago'},
    {name:'Patrick Mwangi',initials:'PM',flag:'kenya',color:'#C68A2E',text:'Praying the rosary from Nairobi! United in prayer with all of you.',count:178,time:'2 hours ago'},
    {name:'Isabella Rossi',initials:'IR',flag:'italy',color:'#7C3AED',text:'Completed the 7-day prayer challenge! Feeling so blessed.',count:267,time:'4 hours ago'},
    {name:'Raj Patel',initials:'RP',flag:'india',color:'#E85D4A',text:'First time praying the rosary with my family. Thank you for the guidance.',count:198,time:'5 hours ago'}
  ],
  'school-prayer': [
    {name:'Sr. Catherine',initials:'SC',flag:'usa',color:'#C68A2E',text:'Our students prayed the rosary together today. So moving to see young hearts turned to God.',count:89,time:'1 hour ago'},
    {name:'Fr. Thomas',initials:'FT',flag:'ireland',color:'#0D9488',text:'Planning a prayer service for next Friday. All students welcome!',count:56,time:'3 hours ago'},
    {name:'Mary O Brien',initials:'MO',flag:'ireland',color:'#2563EB',text:'The children made beautiful rosary beads in class today.',count:134,time:'5 hours ago'},
    {name:'David Kim',initials:'DK',flag:'usa',color:'#7C3AED',text:'Thank you for the prayer resources for our 3rd grade class.',count:78,time:'6 hours ago'},
    {name:'Ana Garcia',initials:'AG',flag:'peru',color:'#E85D4A',text:'Our school just joined! Excited to be part of this prayer community.',count:45,time:'Yesterday'}
  ]
};

// SVG Icons
var svgIcons = {
  bell: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.22-.07.49.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94L2.86 14.52c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.06-1.58z"/></svg>',
  chevRight: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
  chevLeft: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.59-4.8S9.96 3.1 10.99 5.3c.93-2.2 2.51-4.63 2.51-4.63zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z"/></svg>',
  church: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M10 4h4"/><path d="M6 10l6-5 6 5"/><rect x="6" y="10" width="12" height="12"/><path d="M10 22v-4a2 2 0 014 0v4"/><circle cx="12" cy="14" r="1.5"/><path d="M3 22h18"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-1-1 1V4zm9 16H6V4h1v9l3-3 3 3V4h5v16z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
  verified: '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19.5c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5.5" r="2"/><circle cx="16" cy="5.5" r="2"/><circle cx="12" cy="9" r="1.5"/><path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6"/></svg>',
  dove: '<svg viewBox="0 0 24 24"><path d="M20.5 2c-1.95 0-4.05.4-5.5 1.5C13.55 2.4 11.45 2 9.5 2 7.55 2 5.45 2.4 4 3.5 2.55 2.4.45 2-1.5 2v2c1.03 0 2.05.25 3 .68v1.5c-.95-.43-1.97-.68-3-.68v2c1.03 0 2.05.25 3 .68v1.5c-.95-.43-1.97-.68-3-.68v2c1.03 0 2.05.25 3 .68V14c0 1.86.98 3.49 2.46 4.41L6.5 23h3l-1.18-3.59C9.5 19.12 10.44 19 11 19c3.17 0 5.83-1.44 7.16-3.68C19.69 13.72 21 11.06 21 8V4c0-1.1-.45-2-1.5-2z"/></svg>',
  passport: '<svg viewBox="0 0 24 24"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6zm6 3.75c2.07 0 3.75 1.68 3.75 3.75 0 2.07-1.68 3.75-3.75 3.75S8.25 11.57 8.25 9.5c0-2.07 1.68-3.75 3.75-3.75zM16.5 18h-9v-.75c0-1.5 3-2.25 4.5-2.25s4.5.75 4.5 2.25V18z"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>',
  cross: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
  rosary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><circle cx="7" cy="11.5" r=".8" fill="currentColor"/><circle cx="9" cy="14" r=".8" fill="currentColor"/><circle cx="15" cy="14" r=".8" fill="currentColor"/><circle cx="17" cy="11.5" r=".8" fill="currentColor"/><circle cx="12" cy="3.5" r=".8" fill="currentColor"/><path d="M12 15v3"/><path d="M10.5 19.5h3L12 22l-1.5-2.5z"/></svg>',
  candle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-.6 1.5-2 3-2 4.5a2 2 0 104 0C14 5 12.6 3.5 12 2z"/><rect x="10" y="8" width="4" height="13" rx="1"/><path d="M8 21h8"/></svg>',
  stationsIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M7 7h10"/><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>',
  litany: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>'
};

// Flag SVGs
function flagSVG(country) {
  var flags = {
    'usa': '<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#B22234"/><rect y="3.7" width="48" height="2.5" fill="#fff"/><rect y="8.6" width="48" height="2.5" fill="#fff"/><rect y="13.5" width="48" height="2.5" fill="#fff"/><rect y="18.5" width="48" height="2.5" fill="#fff"/><rect y="23.4" width="48" height="2.5" fill="#fff"/><rect y="28.3" width="48" height="2.5" fill="#fff"/><rect width="20" height="17" fill="#3C3B6E"/></svg>',
    'brazil': '<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#009c3b"/><path d="M24 3L45 16 24 29 3 16z" fill="#FFDF00"/><circle cx="24" cy="16" r="7" fill="#002776"/></svg>',
    'uganda': '<svg viewBox="0 0 48 32"><rect y="0" width="48" height="5.3" fill="#000"/><rect y="5.3" width="48" height="5.3" fill="#FCDC04"/><rect y="10.6" width="48" height="5.3" fill="#D90000"/><rect y="16" width="48" height="5.3" fill="#000"/><rect y="21.3" width="48" height="5.3" fill="#FCDC04"/><rect y="26.6" width="48" height="5.4" fill="#D90000"/><circle cx="24" cy="16" r="6" fill="#fff"/></svg>',
    'france': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#002395"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#ED2939"/></svg>',
    'kenya': '<svg viewBox="0 0 48 32"><rect y="0" width="48" height="8" fill="#000"/><rect y="9" width="48" height="6" fill="#fff"/><rect y="10" width="48" height="12" fill="#BB0000"/><rect y="23" width="48" height="1" fill="#fff"/><rect y="24" width="48" height="8" fill="#006600"/></svg>',
    'ireland': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#169B62"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#FF883E"/></svg>',
    'peru': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#D91023"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#D91023"/></svg>',
    'india': '<svg viewBox="0 0 48 32"><rect y="0" width="48" height="10.7" fill="#FF9933"/><rect y="10.7" width="48" height="10.6" fill="#fff"/><rect y="21.3" width="48" height="10.7" fill="#138808"/><circle cx="24" cy="16" r="3.5" fill="none" stroke="#000080" stroke-width="0.8"/></svg>',
    'mexico': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#006847"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#CE1126"/></svg>',
    'italy': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#009246"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#CE2B37"/></svg>',
    'philippines': '<svg viewBox="0 0 48 32"><rect y="0" width="48" height="16" fill="#0038A8"/><rect y="16" width="48" height="16" fill="#CE1126"/><path d="M0 0L20 16 0 32z" fill="#fff"/></svg>',
    'egypt': '<svg viewBox="0 0 48 32"><rect y="0" width="48" height="10.7" fill="#CE1126"/><rect y="10.7" width="48" height="10.6" fill="#fff"/><rect y="21.3" width="48" height="10.7" fill="#000"/></svg>',
    'nigeria': '<svg viewBox="0 0 48 32"><rect x="0" width="16" height="32" fill="#008751"/><rect x="16" width="16" height="32" fill="#fff"/><rect x="32" width="16" height="32" fill="#008751"/></svg>'
  };
  return flags[country] || flags['usa'];
}

// ===== BIBLE DATA =====
var bibleBooks = [
  {name:'Genesis',ch:50,num:1,t:'ot'},{name:'Exodus',ch:40,num:2,t:'ot'},
  {name:'Leviticus',ch:27,num:3,t:'ot'},{name:'Numbers',ch:36,num:4,t:'ot'},
  {name:'Deuteronomy',ch:34,num:5,t:'ot'},{name:'Joshua',ch:24,num:6,t:'ot'},
  {name:'Judges',ch:21,num:7,t:'ot'},{name:'Ruth',ch:4,num:8,t:'ot'},
  {name:'1 Samuel',ch:31,num:9,t:'ot'},{name:'2 Samuel',ch:24,num:10,t:'ot'},
  {name:'1 Kings',ch:22,num:11,t:'ot'},{name:'2 Kings',ch:25,num:12,t:'ot'},
  {name:'1 Chronicles',ch:29,num:13,t:'ot'},{name:'2 Chronicles',ch:36,num:14,t:'ot'},
  {name:'Ezra',ch:10,num:15,t:'ot'},{name:'Nehemiah',ch:13,num:16,t:'ot'},
  {name:'Esther',ch:10,num:17,t:'ot'},{name:'Job',ch:42,num:18,t:'ot'},
  {name:'Psalms',ch:150,num:19,t:'ot'},{name:'Proverbs',ch:31,num:20,t:'ot'},
  {name:'Ecclesiastes',ch:12,num:21,t:'ot'},{name:'Song of Solomon',ch:8,num:22,t:'ot'},
  {name:'Isaiah',ch:66,num:23,t:'ot'},{name:'Jeremiah',ch:52,num:24,t:'ot'},
  {name:'Lamentations',ch:5,num:25,t:'ot'},{name:'Ezekiel',ch:48,num:26,t:'ot'},
  {name:'Daniel',ch:12,num:27,t:'ot'},{name:'Hosea',ch:14,num:28,t:'ot'},
  {name:'Joel',ch:3,num:29,t:'ot'},{name:'Amos',ch:9,num:30,t:'ot'},
  {name:'Obadiah',ch:1,num:31,t:'ot'},{name:'Jonah',ch:4,num:32,t:'ot'},
  {name:'Micah',ch:7,num:33,t:'ot'},{name:'Nahum',ch:3,num:34,t:'ot'},
  {name:'Habakkuk',ch:3,num:35,t:'ot'},{name:'Zephaniah',ch:3,num:36,t:'ot'},
  {name:'Haggai',ch:2,num:37,t:'ot'},{name:'Zechariah',ch:14,num:38,t:'ot'},
  {name:'Malachi',ch:4,num:39,t:'ot'},
  {name:'Matthew',ch:28,num:40,t:'nt'},{name:'Mark',ch:16,num:41,t:'nt'},
  {name:'Luke',ch:24,num:42,t:'nt'},{name:'John',ch:21,num:43,t:'nt'},
  {name:'Acts',ch:28,num:44,t:'nt'},{name:'Romans',ch:16,num:45,t:'nt'},
  {name:'1 Corinthians',ch:16,num:46,t:'nt'},{name:'2 Corinthians',ch:13,num:47,t:'nt'},
  {name:'Galatians',ch:6,num:48,t:'nt'},{name:'Ephesians',ch:6,num:49,t:'nt'},
  {name:'Philippians',ch:4,num:50,t:'nt'},{name:'Colossians',ch:4,num:51,t:'nt'},
  {name:'1 Thessalonians',ch:5,num:52,t:'nt'},{name:'2 Thessalonians',ch:3,num:53,t:'nt'},
  {name:'1 Timothy',ch:6,num:54,t:'nt'},{name:'2 Timothy',ch:4,num:55,t:'nt'},
  {name:'Titus',ch:3,num:56,t:'nt'},{name:'Philemon',ch:1,num:57,t:'nt'},
  {name:'Hebrews',ch:13,num:58,t:'nt'},{name:'James',ch:5,num:59,t:'nt'},
  {name:'1 Peter',ch:5,num:60,t:'nt'},{name:'2 Peter',ch:3,num:61,t:'nt'},
  {name:'1 John',ch:5,num:62,t:'nt'},{name:'2 John',ch:1,num:63,t:'nt'},
  {name:'3 John',ch:1,num:64,t:'nt'},{name:'Jude',ch:1,num:65,t:'nt'},
  {name:'Revelation',ch:22,num:66,t:'nt'}
];
var bibleVersions = [
  {id:'DRB',name:'Douay-Rheims (Catholic)'},
  {id:'CPDV',name:'Catholic Public Domain Version'},
  {id:'KJV',name:'King James Version'},
  {id:'WEB',name:'World English Bible'},
  {id:'ASV',name:'American Standard Version'},
  {id:'BBE',name:'Bible in Basic English'},
  {id:'YLT',name:"Young's Literal Translation"}
];
var currentBibleBook = 0;
var currentBibleChapter = 1;
var currentBibleVersion = 'DRB';
var bibleHighlights = {};
var bibleCache = {};
var selectedVerseNum = null;
var votdVerses = [
  {ref:'Psalm 23:1',text:'The Lord is my shepherd; I shall not want.',b:18,c:23},
  {ref:'John 3:16',text:'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',b:42,c:3},
  {ref:'Philippians 4:13',text:'I can do all things through Christ which strengtheneth me.',b:49,c:4},
  {ref:'Romans 8:28',text:'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',b:44,c:8},
  {ref:'Jeremiah 29:11',text:'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',b:23,c:29},
  {ref:'Proverbs 3:5-6',text:'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',b:19,c:3},
  {ref:'Isaiah 41:10',text:'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.',b:22,c:41},
  {ref:'Matthew 11:28',text:'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',b:39,c:11},
  {ref:'Psalm 46:10',text:'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',b:18,c:46},
  {ref:'Joshua 1:9',text:'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.',b:5,c:1},
  {ref:'Romans 12:2',text:'Be not conformed to this world: but be ye transformed by the renewing of your mind.',b:44,c:12},
  {ref:'Psalm 27:1',text:'The Lord is my light and my salvation; whom shall I fear? The Lord is the strength of my life; of whom shall I be afraid?',b:18,c:27},
  {ref:'Ephesians 2:8-9',text:'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.',b:48,c:2},
  {ref:'Psalm 119:105',text:'Thy word is a lamp unto my feet, and a light unto my path.',b:18,c:119},
  {ref:'Matthew 6:33',text:'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',b:39,c:6},
  {ref:'1 Corinthians 13:4-5',text:'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking.',b:45,c:13},
  {ref:'Psalm 37:4',text:'Delight thyself also in the Lord; and he shall give thee the desires of thine heart.',b:18,c:37},
  {ref:'2 Timothy 1:7',text:'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',b:54,c:1},
  {ref:'Hebrews 11:1',text:'Now faith is the substance of things hoped for, the evidence of things not seen.',b:57,c:11},
  {ref:'Psalm 91:1-2',text:'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress.',b:18,c:91},
  {ref:'Galatians 5:22-23',text:'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance.',b:47,c:5},
  {ref:'1 Peter 5:7',text:'Casting all your care upon him; for he careth for you.',b:59,c:5},
  {ref:'Matthew 5:16',text:'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',b:39,c:5},
  {ref:'Psalm 34:8',text:'O taste and see that the Lord is good: blessed is the man that trusteth in him.',b:18,c:34},
  {ref:'Isaiah 40:31',text:'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.',b:22,c:40},
  {ref:'Colossians 3:23',text:'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.',b:50,c:3},
  {ref:'Psalm 121:1-2',text:'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the Lord, which made heaven and earth.',b:18,c:121},
  {ref:'John 14:6',text:'I am the way, the truth, and the life: no man cometh unto the Father, but by me.',b:42,c:14},
  {ref:'Romans 15:13',text:'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',b:44,c:15},
  {ref:'Psalm 139:14',text:'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works.',b:18,c:139}
];

// ===== HC COMMUNITY DATA =====
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
