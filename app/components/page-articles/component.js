import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),
  access: Ember.inject.service(),

  classNames: ['articles'],

  actions: {
    hideAccessWarning: function() {
      this.set(`prefs.${C.PREFS.ACCESS_WARNING}`, false);
    }
  },

  showAccessWarning: function() {
    return this.get('app.showArticles') !== false &&
           !this.get('access.enabled') &&
           this.get('prefs.'+C.PREFS.ACCESS_WARNING) !== false;
  }.property('app.showArticles','access.enabled',`prefs.${C.PREFS.ACCESS_WARNING}`)
});
