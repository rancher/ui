import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Service.extend({
  prefs         : Ember.inject.service(),
  session       : Ember.inject.service(),
  intl          : Ember.inject.service(),
  locales       : Ember.computed.alias('app.locales'),
  loadedLocales : null,

  bootstrap: function() {
    this.set('loadedLocales', []);
  }.on('init'),

  initLanguage() {
    const session     = this.get('session');
    const fromLogin   = session.get(C.SESSION.LOGIN_LANGUAGE);
    const fromPrefs   = this.get(`prefs.${C.PREFS.LANGUAGE}`); // get language from user prefs
    const fromSession = session.get(C.SESSION.LANGUAGE); // get local language

    let lang          = C.LANGUAGE.DEFAULT;

    if ( fromLogin ) {
      lang = fromLogin;
      session.set(C.SESSION.LOGIN_LANGUAGE, undefined);
    } else if ( fromPrefs ) {
      lang = fromPrefs;
    } else if (fromSession) {
      lang = fromSession;
    }

    session.set(C.SESSION.LANGUAGE, lang);
    return this.sideLoadLanguage(lang);
  },

  getLanguage() {
    return this.get('intl._locale')[0];
  },

  setLanguage(lang) {
    let session = this.get('session');
    lang = lang || session.get(C.SESSION.LANGUAGE);
    session.set(C.SESSION.LANGUAGE, lang);
    return this.set(`prefs.${C.PREFS.LANGUAGE}`, lang);
  },

  sideLoadLanguage(language) {
    let application   = this.get('app');
    let loadedLocales = this.get('loadedLocales');

    if (loadedLocales.contains(language)) {
      this.get('intl').setLocale(language);
      return Ember.RSVP.resolve();
    } else {
      return ajaxPromise({url: `${this.get('app.baseAssets')}translations/${language}.json?${application.version}`,
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
