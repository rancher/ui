import Ember from 'ember';

export default Ember.Route.extend({
  driverName: '', // Override me

  newModel: function() {
    // Override me
  },

  activate: function() {
    this.controllerFor('hosts/new').set('lastRoute','hosts.new.' + this.get('driverName'));
  },

  model: function(params/*,transition*/) {
    var store = this.get('store');

    if ( params.machineId )
    {
      return store.find('machine', params.machineId).then((machine) => {
        if ( machine.get('driver') === this.get('driverName') )
        {
          var copy = machine.serializeForNew();
          return store.createRecord(copy);
        }
        else
        {
          return this.newModel();
        }
      }).catch(() => {
        return this.newModel();
      });
    }

    return this.newModel();
  },

  setupController: function(controller/*, model*/) {
    this._super.apply(this, arguments);
    controller.set('editing', false);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('machineId', null);
    }
  },

  renderTemplate: function() {
    this.render({into: 'hosts/new'});
  },
});
