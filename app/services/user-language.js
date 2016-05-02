import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default Ember.Service.extend({
  prefs            : Ember.inject.service(),
  session          : Ember.inject.service(),
  intl             : Ember.inject.service(),
  locales : Ember.computed.alias('app.locales'),
  loadedLocales    : null,

  bootstrap: function() {
    this.set('loadedLocales', []);
  }.on('init'),

  initLanguage() {
    const session       = this.get('session');
    const upl           = this.getLanguage(); // get language from user prefs
    const uplLocal      = session.get(C.SESSION.LANGUAGE); // get local language
    let defaultLanguage = C.LANGUAGE.DEFAULT;

    if (session.get(C.SESSION.LOGIN_LANGUAGE)){
      defaultLanguage = session.get(C.SESSION.LOGIN_LANGUAGE);
      session.set(C.SESSION.LOGIN_LANGUAGE, undefined);
      session.set(C.SESSION.LANGUAGE, defaultLanguage);

    } else {
      if (upl) { // if user prefs

        defaultLanguage = upl;
        session.set(C.SESSION.LANGUAGE, defaultLanguage);

      } else { // no user pref language
        if (uplLocal) {

          defaultLanguage = uplLocal;

          this.set(`prefs.${C.PREFS.LANGUAGE}`, defaultLanguage);
        }
      }
    }

    this.sideLoadLanguage(defaultLanguage);
  },

  getLanguage() {
    const languagePrefs = `prefs.${C.PREFS.LANGUAGE}`;

    return this.get(languagePrefs);
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
        this.get('intl').addTranslations(language, resp.xhr.responseJSON).then(() => {
          this.get('intl').setLocale(language);
        });
      });
    }
  },

  getAvailableTranslations() {
    return this.get('intl').getLocalesByTranslations();
  },
});
