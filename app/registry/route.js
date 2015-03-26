import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('registry', params.registry_id);
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Registries', backRoute: 'registries', hasAside: 'nav-registries active'});
  },
});
