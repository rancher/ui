import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.packet');
  },

  model: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'packetConfig',
      apiKey: '',
      projectId: '',
      os: 'ubuntu_14_04',
      facilityCode: 'ewr1',
      plan: 'baremetal_1',
      billingCycle: 'hourly',
    });

    return this.get('store').createRecord({
      type: 'machine',
      packetConfig: config,
    });
  },

  setupController: function(controller/*, model*/) {
    this._super.apply(this, arguments);
    controller.set('editing', false);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render({into: 'hosts/new'});
  },
});
