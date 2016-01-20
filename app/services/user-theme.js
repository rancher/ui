import Ember from 'ember';
import C from 'ui/utils/constants';

const AUTO_UPDATE_TIMER = 1800000; // 30min
const START_DAY = 7;
const END_DAY = 17;

export default Ember.Service.extend({
  prefs   : Ember.inject.service(),
  session : Ember.inject.service(),

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

    if (newTheme === 'ui-auto') {
      this.setAutoUpdate();
    } else {
      this.writeStyleNode(newTheme);
    }

  },

  getTheme: function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  },

  setAutoUpdate: function() {

    var hour         = new Date().getHours();
    var newTheme     = 'ui-light';
    var nextHalfHour = AUTO_UPDATE_TIMER - Math.round(new Date().getTime())%AUTO_UPDATE_TIMER;

    if ((hour >= START_DAY && hour <= END_DAY)) {

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
    var application = this.get('app');
    var element = Ember.$('#theme');

    if (element.length) {

      element.attr('href', `${application.baseAssets}assets/${theme}.css?${application.version}`);
    } else {

      Ember.$('link[rel="stylesheet"]').after(`<link rel="stylesheet" href="${application.baseAssets}assets/${theme}.css?${application.version}">`);
    }

    this.get('session').set(C.PREFS.THEME, theme);

  },

});
