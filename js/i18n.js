// ===== INTERNATIONALIZATION (i18n) =====
// Simple JSON-based translation system

var i18n = {
  currentLang: 'en',
  translations: {},
  loaded: false,

  // Load a language file
  load: function(lang) {
    var self = this;
    if(self.translations[lang]) {
      self.currentLang = lang;
      self.loaded = true;
      return Promise.resolve();
    }
    return fetch('data/prayers/' + lang + '.json')
      .then(function(response) {
        if(!response.ok) throw new Error('Language file not found: ' + lang);
        return response.json();
      })
      .then(function(data) {
        self.translations[lang] = data;
        self.currentLang = lang;
        self.loaded = true;
        try {
          localStorage.setItem('prayed-lang', lang);
        } catch(e) {}
      })
      .catch(function(err) {
        console.warn('i18n: Language ' + lang + ' not available, falling back to English');
        if(lang !== 'en') {
          return self.load('en');
        }
      });
  },

  // Get a translation by dot-notation key
  // e.g. i18n.t('ui.home') => 'Home'
  // e.g. i18n.t('prayers.our_father') => 'Our Father...'
  t: function(key) {
    var keys = key.split('.');
    var value = this.translations[this.currentLang];
    for(var i = 0; i < keys.length; i++) {
      if(value && typeof value === 'object') {
        value = value[keys[i]];
      } else {
        value = undefined;
        break;
      }
    }
    // Fallback to English
    if(value === undefined && this.currentLang !== 'en' && this.translations['en']) {
      value = this.translations['en'];
      for(var j = 0; j < keys.length; j++) {
        if(value && typeof value === 'object') {
          value = value[keys[j]];
        } else {
          value = undefined;
          break;
        }
      }
    }
    return value !== undefined ? value : key;
  },

  // Get available languages
  getAvailableLanguages: function() {
    return [
      {code: 'en', name: 'English', native: 'English'},
      {code: 'es', name: 'Spanish', native: 'Español'},
      {code: 'tl', name: 'Filipino', native: 'Filipino'},
      {code: 'pt', name: 'Portuguese', native: 'Português'},
      {code: 'fr', name: 'French', native: 'Français'},
      {code: 'pl', name: 'Polish', native: 'Polski'}
    ];
  },

  // Get current language
  getCurrentLang: function() {
    return this.currentLang;
  },

  // Initialize - load saved language or detect from browser
  init: function() {
    var savedLang;
    try {
      savedLang = localStorage.getItem('prayed-lang');
    } catch(e) {}

    if(savedLang) {
      return this.load(savedLang);
    }

    // Detect browser language
    var browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0].toLowerCase();
    var supported = ['en', 'es', 'tl', 'pt', 'fr', 'pl'];
    var lang = supported.indexOf(browserLang) > -1 ? browserLang : 'en';

    return this.load(lang);
  }
};

// Load English by default on script load (non-blocking)
i18n.init().catch(function(err) {
  console.warn('i18n init error:', err);
});
