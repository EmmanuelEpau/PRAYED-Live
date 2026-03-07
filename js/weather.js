// ===== WEATHER =====
var weatherData = null;

function fetchWeather(lat, lng) {
  // Check cache (30 min)
  var cached = localStorage.getItem('prayedLiveWeather');
  if(cached) {
    try {
      var c = JSON.parse(cached);
      if(Date.now() - c.ts < 30*60*1000) { weatherData = c; updateWeatherDisplay(); return; }
    } catch(e) {}
  }
  fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng+'&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if(data.current) {
        var code = data.current.weather_code;
        var emoji = '\u{1F324}\uFE0F';
        var desc = 'Clear';
        if(code === 0) { emoji='\u2600\uFE0F'; desc='Clear'; }
        else if(code <= 3) { emoji='\u26C5'; desc='Partly cloudy'; }
        else if(code <= 48) { emoji='\u{1F32B}\uFE0F'; desc='Foggy'; }
        else if(code <= 55) { emoji='\u{1F327}\uFE0F'; desc='Drizzle'; }
        else if(code <= 65) { emoji='\u{1F327}\uFE0F'; desc='Rain'; }
        else if(code <= 77) { emoji='\u{1F328}\uFE0F'; desc='Snow'; }
        else if(code <= 82) { emoji='\u{1F326}\uFE0F'; desc='Showers'; }
        else if(code <= 99) { emoji='\u26C8\uFE0F'; desc='Thunderstorm'; }
        weatherData = {
          temp: Math.round(data.current.temperature_2m),
          desc: desc,
          emoji: emoji,
          city: (userData && userData.city) || '',
          ts: Date.now()
        };
        localStorage.setItem('prayedLiveWeather', JSON.stringify(weatherData));
        updateWeatherDisplay();
      }
    }).catch(function(e) { console.warn('Weather fetch failed:', e); });
}

function updateWeatherDisplay() {
  var el = document.getElementById('weatherWidget');
  if(!el || !weatherData) return;
  var loc = weatherData.city ? ' \u00b7 ' + weatherData.city : '';
  el.innerHTML = weatherData.emoji + ' ' + weatherData.temp + '\u00b0F' + loc;
  el.style.display = 'block';
}
