// ===== APP ENTRY POINT =====
// initApp is called on DOMContentLoaded

function initApp() {
  // Load saved user data
  try {
    var saved = localStorage.getItem('prayedUserData');
    if(saved) {
      userData = JSON.parse(saved);
      // Restore habits if saved
      if(userData.habits) habits = userData.habits;
      if(userData.extraHabits) extraHabits = userData.extraHabits;
    }
  } catch(e) { console.warn('Could not load saved data:', e); }

  // Load custom circles
  try {
    var customCircles = JSON.parse(localStorage.getItem('prayedUserCircles')) || [];
    customCircles.forEach(function(c) {
      if(!circles.some(function(existing) { return existing.id === c.id; })) {
        circles.push(c);
      }
    });
  } catch(e) {}

  // Set splash screen images from imgMap
  var splashLogo = document.getElementById('splashLogo');
  var splashGlobeImg = document.getElementById('splashGlobeImg');
  if(splashLogo && imgMap['hcfm_logo_white']) splashLogo.src = imgMap['hcfm_logo_white'];
  if(splashGlobeImg && imgMap['earth_globe']) splashGlobeImg.src = imgMap['earth_globe'];

  // Check dark mode preference
  try {
    if(localStorage.getItem('prayedDarkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  } catch(e) {}

  // Check if user has completed onboarding
  var hasOnboarded = localStorage.getItem('prayedOnboarded');
  if(hasOnboarded) {
    // Skip splash and onboarding
    document.getElementById('splash').style.display = 'none';
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';

    // Initialize default userData if needed
    if(!userData) {
      userData = {
        firstName: 'Friend',
        lastName: '',
        initials: 'FR',
        greeting: 'Good Morning',
        city: '',
        cityDisplay: '',
        country: '',
        morningTime: '07:00',
        eveningTime: '20:00',
        frequency: '',
        userType: [],
        interests: [],
        habits: habits
      };
    }

    // Set greeting based on time
    var hour = new Date().getHours();
    if(hour < 12) userData.greeting = 'Good Morning';
    else if(hour < 17) userData.greeting = 'Good Afternoon';
    else userData.greeting = 'Good Evening';

    // Render all screens
    renderHome();
    renderPray();
    renderCircles();
    renderBible();
    renderProfile();

    // Show the home screen
    showScreen('home');

    // Fetch weather and nearby churches in background
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        geoDetected = true;
        if(typeof fetchWeather === 'function') fetchWeather(userLat, userLng);
        if(typeof searchNearbyChurches === 'function') {
          searchNearbyChurches(userLat, userLng, function(churches) {
            nearbyChurchesCache = churches;
            // Re-render screens that show churches
            renderHome();
            renderCircles();
          });
        }
      }, function(err) {
        console.warn('Geolocation error:', err.message);
      }, {timeout: 10000, maximumAge: 300000});
    }
  } else {
    // Show splash screen
    runSplashAnimation();
  }
}

// Register Service Worker for offline support
if('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
      console.log('SW registered:', reg.scope);
    }).catch(function(err) {
      console.warn('SW registration failed:', err);
    });
  });
}

// Init on load
document.addEventListener('DOMContentLoaded', initApp);
