import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.digitalocean');
  },

  model: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'digitaloceanConfig',
      accessToken: '',
      size: '1gb',
      region: 'nyc3',
      image: 'ubuntu-14-04-x64'
    });

    return this.get('store').createRecord({
      type: 'machine',
      digitaloceanConfig: config,
    });
  },

  setupController: function(controller/*, model*/) {
    this._super.apply(this, arguments);
    controller.set('editing', false);
  },

  renderTemplate: function() {
    this.render('hosts/new/digitalocean', {into: 'hosts/new'});
  },
});
