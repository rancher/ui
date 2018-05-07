import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,
  prefs     : service(),
  userTheme : service('user-theme'),


  theme: computed(`prefs.${C.PREFS.THEME}`, function() {
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
