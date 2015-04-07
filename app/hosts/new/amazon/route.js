import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.amazon');
  },

  model: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'amazonec2Config',
      region: 'us-east-1',
      instanceType: 't2.micro',
      securityGroup: 'docker-machine',
      zone: 'a',
      rootSize: 16

    });

    return this.get('store').createRecord({
      type: 'machine',
      amazonec2Config: config,
    });
  },

  setupController: function(controller/*, model*/) {
    this._super.apply(this, arguments);
    controller.set('editing', false);
  },

  renderTemplate: function() {
    this.render('hosts/new/amazon', {into: 'hosts/new'});
  },
});
