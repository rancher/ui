import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  prefs     : Ember.inject.service(),
  userTheme : Ember.inject.service('user-theme'),

  classNames : ['btn-group', 'btn-group-sm'],

  theme: Ember.computed(`prefs.${C.PREFS.THEME}`, function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  }),

  click(e) {
    var userTheme = this.get('userTheme');
    var currentTheme  = userTheme.getTheme();
    var selectedTheme = $(e.target).data('value');

    if (selectedTheme !== currentTheme) {
      userTheme.setTheme(selectedTheme);
    }
  },

});
