import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import { loadScript } from 'ui/utils/load-script';

export default Ember.Service.extend({
  prefs         : Ember.inject.service(),
  session       : Ember.inject.service(),
  intl          : Ember.inject.service(),
  locales       : Ember.computed.alias('app.locales'),
  growl         : Ember.inject.service(),
  cookies       : Ember.inject.service(),
  userTheme     : Ember.inject.service('user-theme'),
  loadedLocales : null,

  bootstrap: function() {
    this.set('loadedLocales', []);
  }.on('init'),

  initLanguage() {
    const session     = this.get('session');
    const fromLogin   = session.get(C.SESSION.LOGIN_LANGUAGE);
    const fromPrefs   = this.get(`prefs.${C.PREFS.LANGUAGE}`); // get language from user prefs
    const fromSession = session.get(C.SESSION.LANGUAGE); // get local language
    const fromCookie  = this.get('cookies').get(C.COOKIE.LANG);// get language from cookie 
    let lang          = C.LANGUAGE.DEFAULT;

    if ( fromLogin ) {
      lang = fromLogin;
      session.set(C.SESSION.LOGIN_LANGUAGE, undefined);
    } else if ( fromPrefs ) {
      lang = fromPrefs;
    } else if (fromSession) {
      lang = fromSession;
    } else if (fromCookie) {
      lang = fromCookie;
    }

    lang = this.normalizeLang(lang);

    session.set(C.SESSION.LANGUAGE, lang);
    return this.sideLoadLanguage(lang);
  },

  normalizeLang(lang) {
    return lang.toLowerCase();
  },

  getLanguage() {
    return this.get('intl._locale')[0];
  },

  setLanguage(lang) {
    let session = this.get('session');
    lang = lang || session.get(C.SESSION.LANGUAGE);
    session.set(C.SESSION.LANGUAGE, lang);
    this.get('userTheme').writeStyleNode(session.get(C.PREFS.THEME));
    return this.set(`prefs.${C.PREFS.LANGUAGE}`, lang);
  },

  sideLoadLanguage(language) {
    let application   = this.get('app');
    let loadedLocales = this.get('loadedLocales');
    let session = this.get('session');

    if (loadedLocales.includes(language)) {
      this.get('intl').setLocale(language);
      this.get('userTheme').writeStyleNode(session.get(C.PREFS.THEME));
      return Ember.RSVP.resolve();
    } else {
      return ajaxPromise({url: `${this.get('app.baseAssets')}translations/${language}.json?${application.version}`,
        method: 'GET',
        dataType: 'json',
      }).then((resp) => {
        let promise;
        if ( this.get('app.needIntlPolyfill') ) {
          promise = loadScript(`${this.get('app.baseAssets')}assets/intl/locales/${language.toLowerCase()}.js?${application.version}`);
        } else {
          promise = Ember.RSVP.resolve();
        }

        return promise.then(() => {
          loadedLocales.push(language);
          return this.get('intl').addTranslations(language, resp.xhr.responseJSON).then(() => {
            this.get('intl').setLocale(language);
           this.get('userTheme').writeStyleNode(session.get(C.PREFS.THEME));
          });
        });
      }).catch((err) => {
        this.get('growl').fromError('Error loading language: ' + language, err);
        if ( language !== C.LANGUAGE.DEFAULT ) {
          return this.sideLoadLanguage(C.LANGUAGE.DEFAULT);
        }
      });
    }
  },

  getAvailableTranslations() {
    return this.get('intl').getLocalesByTranslations();
  },

  isRtl(lang) {
    return ['fa-ir'].includes(lang);
  },

});