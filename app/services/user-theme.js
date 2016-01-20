import Ember from 'ember';
import C from 'ui/utils/constants';

const AUTO_UPDATE_TIMER = 1800000; // 30min

export default Ember.Service.extend({
  prefs   : Ember.inject.service(),
  session : Ember.inject.service(),

  themeObserver: function() {
    if (this.get(`prefs.${C.PREFS.THEME}`) === 'ui-auto') {
      this.setAutoUpdate();
    }
  }.observes(`prefs.${C.PREFS.THEME}`),

  setupTheme: function() {
    var userTheme    = this.get(`prefs.${C.PREFS.THEME}`);
    var defaultTheme = this.get('session').get(C.PREFS.THEME);

    // does the uitheme exist in prefs
    if (userTheme) {

      // dooes the user pref'd theme match the default theme from local storage
      if (userTheme !== defaultTheme) {

        if (defaultTheme !== 'ui-auto') {
          this.set(`prefs.${C.PREFS.THEME}`, userTheme);
        } else {
          this.setAutoUpdate();
        }

        this.get('session').set(C.PREFS.THEME, userTheme);
      }
    } else { // no user pref'd theme
      this.set(`prefs.${C.PREFS.THEME}`, defaultTheme);
    }
  },

  setTheme: function(newTheme) {
    this.set(`prefs.${C.PREFS.THEME}`, newTheme);

    this.writeStyleNode(newTheme);

  },

  getTheme: function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  },

  setAutoUpdate: function() {

    var hour         = new Date().getHours();
    var newTheme     = 'ui-light';
    var nextHalfHour = AUTO_UPDATE_TIMER - Math.round(new Date().getTime())%AUTO_UPDATE_TIMER;

    if ((hour >= 7 && hour <= 17)) {

      this.writeStyleNode(newTheme);
    } else {

      newTheme = 'ui-dark';

      this.writeStyleNode(newTheme);
    }

    this.set('updateTimer', Ember.run.later(() => {

      return this.setAutoUpdate();
    }, nextHalfHour));

  },

  writeStyleNode: function(theme) {
    var element = Ember.$('link[href*=ui]');

    if (element.length) {

      element.attr('href', `/assets/${theme}.css`);
    } else {

      Ember.$('link[rel="stylesheet"]').after(`<link rel="stylesheet" href="assets/${theme}.css">`);
    }

    this.get('session').set(C.PREFS.THEME, theme);

  },

});
