import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Service.extend({
  prefs            : Ember.inject.service(),
  session          : Ember.inject.service(),
  intl             : Ember.inject.service(),
  locales          : Ember.computed.alias('app.locales'),
  loadedLocales    : null,

  bootstrap: function() {
    this.set('loadedLocales', []);
  }.on('init'),

  initLanguage() {
    const session       = this.get('session');
    const fromLogin     = session.get(C.SESSION.LOGIN_LANGUAGE);
    const fromPrefs     = this.getLanguage(); // get language from user prefs
    const fromSession   = session.get(C.SESSION.LANGUAGE); // get local language
    let lang = C.LANGUAGE.DEFAULT;

    if ( fromLogin ) {
      lang = fromLogin;
      session.set(C.SESSION.LOGIN_LANGUAGE, undefined);
    } else if ( fromPrefs ) {
      lang = fromPrefs;
    } else if (fromSession) {
      lang = fromSession;
    }

    session.set(C.SESSION.LANGUAGE, lang);
    this.set(`prefs.${C.PREFS.LANGUAGE}`, lang);
    return this.sideLoadLanguage(lang);
  },

  getLanguage() {
    return this.get(`prefs.${C.PREFS.LANGAUGE}`);
  },

  setLanguage(lang) {
    return this.set(`prefs.${C.PREFS.LANGAUGE}`, lang);
  },

  sideLoadLanguage(language) {
    let loadedLocales = this.get('loadedLocales');
    if (loadedLocales.contains(language)) {
      this.get('intl').setLocale(language);
      return Ember.RSVP.resolve();
    } else {
      return ajaxPromise({url: `/translations/${language}.json`,
        method: 'GET',
        dataType: 'json',
      }).then((resp) => {
        loadedLocales.push(language);
        return this.get('intl').addTranslations(language, resp.xhr.responseJSON).then(() => {
          this.get('intl').setLocale(language);
        });
      });
    }
  },

  getAvailableTranslations() {
    return this.get('intl').getLocalesByTranslations();
  },
});
