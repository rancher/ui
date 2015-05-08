import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.digitalocean');
  },

  model: function(params/*,transition*/) {
    var store = this.get('store');

    if ( params.machineId )
    {
      return store.find('machine', params.machineId).then((machine) => {
        return store.createRecord({
          type: 'machine',
          digitaloceanConfig: machine.serialize().digitaloceanConfig,
        });
      }).catch(() => {
        return neu();
      });
    }

    return neu();

    function neu() {
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
    }
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
