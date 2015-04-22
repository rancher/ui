import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  classNames: ['articles'],

  actions: {
    hideAccessWarning: function() {
      this.set('prefs.'+C.ACCESS_WARNING, false);
    }
  },

  showAccessWarning: function() {
    return this.get('app.showArticles') !== false &&
           !this.get('app.authenticationEnabled') &&
           this.get('prefs.'+C.ACCESS_WARNING) !== false;
  }.property('app.showArticles','app.authenticationEnabled','prefs.'+C.ACCESS_WARNING)
});
