import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var hosts = this.modelFor('hosts');
    return this.get('store').find('machine').then((machines) => {
      return {
        hosts: hosts,
        machines: machines
      };
    }).catch(() => {
      return {
        hosts: hosts,
        machines: []
      };
    });
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Hosts', addRoute: 'hosts.new'});
  },
});
