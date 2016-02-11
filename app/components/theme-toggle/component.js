import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  prefs     : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),

  classNames : ['btn-group', 'btn-group-sm'],

  theme: Ember.computed(`prefs.${C.PREFS.THEME}`, function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  }),

  actions: {
    changeTheme: function(theme) {
      var userTheme = this.get('userTheme');
      var currentTheme  = userTheme.getTheme();

      if (theme !== currentTheme) {
        userTheme.setTheme(theme);
      }
    }
  },

});
