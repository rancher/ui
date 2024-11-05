import { resolve } from 'rsvp';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
// @@TODO@@ - 10-27-17 - move to addon
import { loadScript } from 'ui/utils/load-script';
import { on } from '@ember/object/evented';

const RTL_LANGUAGES = ['fa-ir'];

export default Service.extend({
  access:        service(),
  prefs:         service(),
  session:       service(),
  settings:      service(),
  intl:          service(),
  locales:       alias('app.locales'),
  growl:         service(),
  cookies:       service(),
  userTheme:     service('user-theme'),
  app:           service(),
  loadedLocales: null,

  bootstrap: on('init', function() {
    this.set('loadedLocales', []);
  }),

  initUnauthed() {
    let lang = C.LANGUAGE.DEFAULT;
    const fromSession = this.get(`session.${ C.SESSION.LANGUAGE }`);
    const fromCookie  = this.get('cookies').get(C.COOKIE.LANG);

    if (fromSession) {
      lang = fromSession;
    } else if (fromCookie){
      lang = fromCookie;
    }

    return this.sideLoadLanguage(lang);
  },

  initLanguage(save = false) {
    let lang          = C.LANGUAGE.DEFAULT;
    const session     = this.get('session');

    const fromLogin   = session.get(C.SESSION.LOGIN_LANGUAGE);
    const fromPrefs   = this.get(`prefs.${ C.PREFS.LANGUAGE }`); // get language from user prefs
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
    return this.get('intl.locale')[0];
  },

  setLanguage(lang, savePref = true) {
    // Don't save 'none', so you can't get stuck in it across reloads
    if ( lang === 'none' ) {
      return resolve();
    }

    let session = this.get('session');

    lang = lang || session.get(C.SESSION.LANGUAGE);

    session.set(C.SESSION.LANGUAGE, lang);
    if ( savePref && this.get('access.principal') ) {
      return this.set(`prefs.${ C.PREFS.LANGUAGE }`, lang);
    } else {
      return resolve();
    }
  },

  sideLoadLanguage(language) {
    let version = this.get('settings.uiVersion');
    let loadedLocales = this.get('loadedLocales');

    if (loadedLocales.includes(language)) {
      this.get('intl').setLocale(language);
      this.setLanguage(language, false);
      this.get('userTheme').writeStyleNode();

      return resolve();
    } else {
      return ajaxPromise({
        url:      `${ this.get('app.baseAssets') }translations/${ language }.json?${ version }`,
        method:   'GET',
        dataType: 'json',
      }).then((resp) => {
        let promise;

        if ( this.get('app.needIntlPolyfill') ) {
          promise = loadScript(`${ this.get('app.baseAssets') }assets/intl/locales/${ language.toLowerCase() }.js?${ version }`);
        } else {
          promise = resolve();
        }

        return promise.then(() => {
          loadedLocales.push(language);

          this.get('intl').addTranslations(language, resp.xhr.responseJSON);
          this.get('intl').setLocale(language);
          this.setLanguage(language, false);
          this.get('userTheme').writeStyleNode();

          return resolve();
        });
      }).catch((err) => {
        this.get('growl').fromError(`Error loading language: ${  language }`, err);

        if ( language !== C.LANGUAGE.DEFAULT ) {
          return this.sideLoadLanguage(C.LANGUAGE.DEFAULT);
        }

        // Why would we resolve in a catch? The application route beforeModel initializes the language
        // we don't want to break the app if the translations have had some kind of error
        // a growl notification will be sufficient as the app can load without translations
        // it won't be very usable but its better then an error page.
        return resolve();
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
