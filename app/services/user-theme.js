import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  prefs        : Ember.inject.service(),
  session      : Ember.inject.service(),
  language     : Ember.inject.service('user-language'),
  currentTheme : null,
  updateTimer  : null,

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

    if (this.get('updateTimer')) {
      Ember.run.cancel(this.get('updateTimer'));
    }


    if (newTheme === 'ui-auto') {
      this.setAutoUpdate();
    } else {
      this.set('currentTheme', newTheme);
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
    var userTheme    = this.get('currentTheme');

    if ( hour < C.THEME.START_HOUR || hour >= C.THEME.END_HOUR ) {
      newTheme = 'ui-dark';
    }

    if (userTheme !== newTheme) {
      this.set('currentTheme', newTheme);
      this.writeStyleNode(newTheme);
      this.get('session').set(C.PREFS.THEME, newTheme);
    }


    this.set('updateTimer', Ember.run.later(() => {
      return this.setAutoUpdate();
    }, nextHalfHour));

  },

  writeStyleNode: function(theme) {
    var application = this.get('app');
    var $body = $('BODY');
    let lang = this.get(`session.${C.SESSION.LANGUAGE}`);
    var direction = '';
    $body.attr('class').split(/\s+/).forEach((cls) => {
      if ( cls.indexOf('theme-') === 0 )
      {
        $body.removeClass(cls);
      }
    });

    $body.addClass('theme-' + theme);

    if (this.get('language').isRtl(lang)) {
      direction = '.rtl';
    }

    Ember.$('#theme').attr('href', `${application.baseAssets}assets/${theme}${direction}.css?${application.version}`);
    Ember.$('#vendor').attr('href', `${application.baseAssets}assets/vendor${direction}.css?${application.version}`);
  },

});