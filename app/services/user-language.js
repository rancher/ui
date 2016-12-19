import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import { loadScript } from 'ui/utils/load-script';

const RTL_LANGUAGES = ['fa-ir'];

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

  initUnauthed() {
    let lang = C.LANGUAGE.DEFAULT;
    const fromSession = this.get(`session.${C.SESSION.LANGUAGE}`);
    const fromCookie  = this.get('cookies').get(C.COOKIE.LANG);

    if (fromSession) {
      lang = fromSession;
    } else if(fromCookie){
      lang = fromCookie;
    }

    return this.sideLoadLanguage(lang);
  },

  initLanguage(save=false) {
    let lang          = C.LANGUAGE.DEFAULT;
    const session     = this.get('session');

    const fromLogin   = session.get(C.SESSION.LOGIN_LANGUAGE);
    const fromPrefs   = this.get(`prefs.${C.PREFS.LANGUAGE}`); // get language from user prefs
    const fromSession = session.get(C.SESSION.LANGUAGE); // get local language
    const fromCookie  = this.get('cookies').get(C.COOKIE.LANG);// get language from cookie 


    if ( fromLogin ) {
      lang = fromLogin;
      if ( save ) {
        session.set(C.SESSION.LOGIN_LANGUAGE, undefined);
      }
    } else if ( fromPrefs ) {
      lang = fromPrefs;
    } else if (fromSession) {
      lang = fromSession;
    } else if (fromCookie) {
      lang = fromCookie;
    }

    lang = this.normalizeLang(lang);

    this.setLanguage(lang, save);
    return this.sideLoadLanguage(lang);
  },

  normalizeLang(lang) {
    return lang.toLowerCase();
  },

  getLocale() {
    return this.get('intl._locale')[0];
  },

  setLanguage(lang, savePref=true) {
    let session = this.get('session');
    lang = lang || session.get(C.SESSION.LANGUAGE);

    session.set(C.SESSION.LANGUAGE, lang);
    if ( savePref && session.get(C.SESSION.ACCOUNT_ID) ) {
      return this.set(`prefs.${C.PREFS.LANGUAGE}`, lang);
    } else {
      return Ember.RSVP.resolve();
    }
  },

  sideLoadLanguage(language) {
    let application   = this.get('app');
    let loadedLocales = this.get('loadedLocales');

    if (loadedLocales.includes(language)) {
      this.get('intl').setLocale(language);
      this.setLanguage(language,false);
      this.get('userTheme').writeStyleNode();
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
            this.setLanguage(language,false);
            this.get('userTheme').writeStyleNode();
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
    return RTL_LANGUAGES.includes(lang.toLowerCase());
  },

});
