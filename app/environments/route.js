import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('environment');
  },

  actions: {
    didTransition: function() {
      this.send('setPageLayout', {label: 'Services', hasAside: 'nav-services active'});
    }
  },
});
