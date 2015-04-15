import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAllUnremoved('environment');
  },

  actions: {
    didTransition: function() {
      this.send('setPageLayout', {label: 'Services', hasAside: 'nav-services active'});
    }
  },
});
