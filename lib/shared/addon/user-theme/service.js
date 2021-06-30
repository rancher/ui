import $ from 'jquery';
import { cancel, later } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { isEmpty } from '@ember/utils';

export default Service.extend({
  prefs:        service(),
  session:      service(),
  language:     service('user-language'),
  currentTheme: null,
  updateTimer:  null,
  app:          service(),

  setupTheme() {
    var defaultTheme = this.get('session').get(C.PREFS.THEME);
    var userTheme    = this.get(`prefs.${ C.PREFS.THEME }`);
    const isEmbedded = window.top !== window;

    if ( userTheme ) {
      this.setTheme(userTheme, false);
    } else { // no user pref'd theme
      if (isEmbedded && isEmpty(defaultTheme)) {
        // on an upgrade if the user theme pref was never set and we're in the dashboard which defaults to dark, reset the user theme to dark.
        defaultTheme = 'ui-dark';
      }

      this.setTheme(defaultTheme, true);
    }
  },

  setTheme(newTheme, save = true) {
    if ( save ) {
      this.set(`prefs.${ C.PREFS.THEME }`, newTheme);
    }

    if (this.get('updateTimer')) {
      cancel(this.get('updateTimer'));
    }

    if (newTheme === 'ui-auto') {
      this.setAutoUpdate();
    } else {
      this.set('currentTheme', newTheme);
      this.writeStyleNode();
    }
  },

  getTheme() {
    return this.get(`prefs.${ C.PREFS.THEME }`);
  },

  setAutoUpdate() {
    var self = this;
    const watchDark = window.matchMedia('(prefers-color-scheme: dark)');
    const watchLight = window.matchMedia('(prefers-color-scheme: light)');
    const watchNone = window.matchMedia('(prefers-color-scheme: no-preference)');

    var nextHalfHour = C.THEME.AUTO_UPDATE_TIMER - Math.round(new Date().getTime()) % C.THEME.AUTO_UPDATE_TIMER;

    if ( !this.updateTimer ) {
      if ( watchDark.matches ) {
        changed('ui-dark');
      } else if ( watchLight.matches ) {
        changed('ui-light');
      } else {
        changed(fromClock());
      }

      watchDark.addListener((e) => {
        if ( e.matches ) {
          changed('ui-dark');
        }
      });

      watchLight.addListener((e) => {
        if ( e.matches ) {
          changed('ui-light');
        }
      });

      watchNone.addListener((e) => {
        if ( e.matches ) {
          changed(fromClock());
        }
      });
    }

    this.set('updateTimer', later(() => {
      return this.setAutoUpdate();
    }, nextHalfHour));

    function fromClock() {
      const hour = new Date().getHours();

      if ( hour < C.THEME.START_HOUR || hour >= C.THEME.END_HOUR ) {
        return 'ui-dark';
      }

      return 'ui-light';
    }

    function changed(newTheme) {
      console.log('Theme change', newTheme);
      self.set('currentTheme', newTheme);
      self.writeStyleNode();
    }
  },

  writeStyleNode() {
    var application = this.get('app');
    var $body = $('BODY');
    let theme = this.get('currentTheme');
    let lang = this.get(`session.${ C.SESSION.LANGUAGE }`);
    var direction = '';
    let assets = application.get('baseAssets');
    let version = application.get('version');

    if ( !theme || !lang ) {
      return;
    }

    $body.attr('class').split(/\s+/).forEach((cls) => {
      if ( cls.indexOf('theme-') === 0 ) {
        $body.removeClass(cls);
      }
    });

    $body.addClass(`theme-${  theme }`);

    if (this.get('language').isRtl(lang)) {
      direction = '.rtl';
    }

    updateHref('#theme', `${ assets }assets/${ theme }${ direction }.css?${ version }`);
    updateHref('#vendor', `${ assets }assets/vendor${ direction }.css?${ version }`);

    function updateHref(node, neu) {
      let elem = $(node);
      let cur = elem.attr('href');

      if ( cur !== neu ) {
        elem.attr('href', neu);
      }
    }
  },

});
