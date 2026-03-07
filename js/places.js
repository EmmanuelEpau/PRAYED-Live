// ===== PLACES (Overpass API - OpenStreetMap, free, no key needed) =====
var nearbyChurchesCache = null;

function searchNearbyChurches(lat, lng) {
  // Check localStorage cache first (1-hour cache)
  var cacheKey = 'prayedLiveChurches';
  var cached = localStorage.getItem(cacheKey);
  if(cached) {
    try {
      var c = JSON.parse(cached);
      if(c.ts && (Date.now() - c.ts < 3600000) && c.lat && c.lng) {
        var dd = haversineKm(lat, lng, c.lat, c.lng);
        if(dd < 5) {
          nearbyChurchesCache = c.data;
          if(currentScreen === 'home') renderHome();
          return;
        }
      }
    } catch(e) {}
  }

  // Overpass API query for Catholic churches within 10 miles (16093m)
  var query = '[out:json][timeout:15];(' +
    'node["amenity"="place_of_worship"]["religion"="christian"]["denomination"~"catholic|roman_catholic"](around:16093,' + lat + ',' + lng + ');' +
    'way["amenity"="place_of_worship"]["religion"="christian"]["denomination"~"catholic|roman_catholic"](around:16093,' + lat + ',' + lng + ');' +
    'node["amenity"="place_of_worship"]["denomination"~"catholic"](around:16093,' + lat + ',' + lng + ');' +
    'way["amenity"="place_of_worship"]["denomination"~"catholic"](around:16093,' + lat + ',' + lng + ');' +
    ');out center;';

  var endpoints = ['https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];
  var ep = endpoints[Math.floor(Math.random()*endpoints.length)];
  fetch(ep, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
  .then(function(r) {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(data) {
    if(!data.elements || data.elements.length === 0) return;

    // Deduplicate by name+proximity
    var seen = {};
    var churches = [];
    data.elements.forEach(function(el) {
      var eLat = el.lat || (el.center ? el.center.lat : null);
      var eLng = el.lon || (el.center ? el.center.lon : null);
      if(!eLat || !eLng) return;
      var name = (el.tags && el.tags.name) ? el.tags.name : '';
      if(!name) return;
      var dedup = name.toLowerCase().replace(/[^a-z]/g,'');
      if(seen[dedup]) return;
      seen[dedup] = true;

      var addr = '';
      if(el.tags) {
        var t = el.tags;
        if(t['addr:housenumber'] && t['addr:street']) {
          addr = t['addr:housenumber'] + ' ' + t['addr:street'];
          if(t['addr:city']) addr += ', ' + t['addr:city'];
        } else if(t['addr:street']) {
          addr = t['addr:street'];
          if(t['addr:city']) addr += ', ' + t['addr:city'];
        } else if(t['addr:city']) {
          addr = t['addr:city'];
        }
      }

      var dist = haversineKm(lat, lng, eLat, eLng) * 0.621371;
      churches.push({
        name: name,
        address: addr,
        lat: eLat,
        lng: eLng,
        rating: 0,
        dist: dist.toFixed(1),
        open: null
      });
    });

    nearbyChurchesCache = churches.sort(function(a,b) {
      return parseFloat(a.dist) - parseFloat(b.dist);
    }).slice(0, 15);

    // Cache results
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: nearbyChurchesCache, lat: lat, lng: lng, ts: Date.now()
      }));
    } catch(e) {}

    if(currentScreen === 'home') renderHome();
  })
  .catch(function(err) {
    console.log('Overpass API error:', err);
  });
}

function haversineKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2-lat1)*Math.PI/180;
  var dLng = (lng2-lng1)*Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function openGoogleMaps(lat, lng, name) {
  window.open('https://www.google.com/maps/dir/?api=1&destination='+lat+','+lng+'&destination_place_id='+encodeURIComponent(name), '_blank');
}
