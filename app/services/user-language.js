import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  prefs   : Ember.inject.service(),
  session : Ember.inject.service(),
  intl    : Ember.inject.service(),

  initLanguage() {
    let upl = this.getLanguage(); // get language from user prefs
    let uplLocal = this.get('session').get(C.PREFS.LANGUAGE); // get local language
    let defaultLanguage = C.LANGUAGE.DEFAULT;

    if (upl) { // if user prefs
      if (upl !== uplLocal) { // doesnt match local?
        // set uplLocal to upl
        this.get('session').set(C.PREFS.LANGUAGE, upl);
      }
    } else {
      this.setLanguage(defaultLanguage, true);
    }
  },
  getLanguage() {
    const languagePrefs = `prefs.${C.PREFS.LANGUAGE}`;

    return this.get(languagePrefs);
  },
  getTranslations() {
    return this.get('app.translations');
  },
  setLanguage(language, setSession=false) {
    this.set(`prefs.${C.PREFS.LANGUAGE}`, language);
    this.get('intl').setLocale(language);

    if (setSession) {
      this.get('session').set(C.PREFS.LANGUAGE, language);
    }
  },
  getAvailableTranslations() {
    return this.get('intl').getLocalesByTranslations();
  },
});
