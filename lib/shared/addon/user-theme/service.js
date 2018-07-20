import $ from 'jquery';
import { cancel, later } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Service.extend({
  prefs:        service(),
  session:      service(),
  language:     service('user-language'),
  currentTheme: null,
  updateTimer:  null,
  app:          service(),

  setupTheme() {
    var userTheme    = this.get(`prefs.${ C.PREFS.THEME }`);
    var defaultTheme = this.get('session').get(C.PREFS.THEME);

    if (userTheme) {
      if (userTheme !== defaultTheme) {
        if (defaultTheme !== 'ui-auto') {
          this.setTheme(userTheme);
        } else {
          this.setAutoUpdate();
        }

        this.get('session').set(C.PREFS.THEME, userTheme);
      }
    } else { // no user pref'd theme
      this.set(`prefs.${ C.PREFS.THEME }`, defaultTheme);
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
      this.get('session').set(C.PREFS.THEME, newTheme);
    }
  },

  getTheme() {
    return this.get(`prefs.${ C.PREFS.THEME }`);
  },

  setAutoUpdate() {
    var hour         = new Date().getHours();
    var newTheme     = 'ui-light';
    var nextHalfHour = C.THEME.AUTO_UPDATE_TIMER - Math.round(new Date().getTime()) % C.THEME.AUTO_UPDATE_TIMER;
    var userTheme    = this.get('currentTheme');

    if ( hour < C.THEME.START_HOUR || hour >= C.THEME.END_HOUR ) {
      newTheme = 'ui-dark';
    }

    if (userTheme !== newTheme) {
      this.set('currentTheme', newTheme);
      this.writeStyleNode();
      this.get('session').set(C.PREFS.THEME, newTheme);
    }

    this.set('updateTimer', later(() => {
      return this.setAutoUpdate();
    }, nextHalfHour));
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
