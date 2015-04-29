import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.openstack');
  },

  model: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'openstackConfig',
      authUrl: '',
      username: '',
      password: '',
      tenantName: '',
      flavorName: '',
      imageName: '',
    });

    return this.get('store').createRecord({
      type: 'machine',
      openstackConfig: config,
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
