import Ember from 'ember';
import C from 'ui/utils/constants';

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
          this.setTheme(userTheme);
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
      this.get('session').set(C.PREFS.THEME, newTheme);
    }

  },

  getTheme: function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  },

  setAutoUpdate: function() {

    var hour         = new Date().getHours();
    var newTheme     = 'ui-light';
    var nextHalfHour = C.THEME.AUTO_UPDATE_TIMER - Math.round(new Date().getTime())%C.THEME.AUTO_UPDATE_TIMER;

    if ( hour < C.THEME.START_HOUR || hour >= C.THEME.END_HOUR ) {
      newTheme = 'ui-dark';
    }

    this.writeStyleNode(newTheme);
    this.get('session').set(C.PREFS.THEME, newTheme);

    this.set('updateTimer', Ember.run.later(() => {

      return this.setAutoUpdate();
    }, nextHalfHour));

  },

  writeStyleNode: function(theme) {
    var application = this.get('app');

    Ember.$('#theme').attr('href', `${application.baseAssets}assets/${theme}.css?${application.version}`);

  },

});
