import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      allHosts: store.findAll('host'), // Need inactive ones in case a link points to an inactive host
      allStoragePools: store.findAll('storagepool')
    };

    if ( params.virtualMachineId )
    {
      dependencies['existing'] = store.find('virtualmachine', params.virtualMachineId, {include: ['ports','instanceLinks']});
    }

    return Ember.RSVP.hash(dependencies, 'Load VM dependencies').then(function(results) {
      var data, healthCheckData;
      if ( results.existing )
      {
        data = results.existing.serializeForNew();
        data.ports = (data.ports||[]).map((port) => {
          delete port.id;
          return port;
        });

        if ( Ember.isArray(data.instanceLinks) )
        {
          data.instanceLinks = (data.instanceLinks||[]).map((link) => {
            delete link.id;
            return link;
          });
        }

        healthCheckData = data.healthCheck;
        delete  data.healthCheck;
      }
      else
      {
        data = {
          type: 'virtualMachine',
          requestedHostId: params.hostId,
          tty: true,
          stdinOpen: true,
        };
      }

      var instance = store.createRecord(data);
      if ( healthCheckData )
      {
        // The type isn't set on an existing one
        healthCheckData.type = 'instanceHealthCheck';
        instance.set('healthCheck', store.createRecord(healthCheckData));
      }

      return Ember.Object.create({
        instance: instance,
        allHosts: results.allHosts,
        allStoragePools: results.allStoragePools,
      });
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('hostId', null);
      controller.set('stackId', null);
      controller.set('virtualMachineId', null);
    }
  }
});
