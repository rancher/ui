import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('host', params.host_id);
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Hosts', backRoute: 'hosts', hasAside: 'nav-hosts active'});
  },
});
