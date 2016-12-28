import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      allHosts: store.findAll('host'), // Need inactive ones in case a link points to an inactive host
      allStoragePools: store.findAll('storagepool'),
    };

    if ( params.serviceId )
    {
      dependencies.service = store.find('service', params.serviceId);
    }
    else if ( params.virtualMachineId )
    {
      dependencies.vm = store.find('virtualmachine', params.virtualMachineId, {include: ['ports']});
    }

    return Ember.RSVP.hash(dependencies, 'Load VM dependencies').then((results) => {
      var store = this.get('store');
      var serviceOrVm = results.service || results.vm;
      var serviceLinks = [];
      var secondaryLaunchConfigs = [];

      if ( params.upgrade )
      {
        return Ember.Object.create({
          service: serviceOrVm.clone(),
          allHosts: results.allHosts,
          allStoragePools: results.allStoragePools,
        });
      }

      var instanceData, serviceData, healthCheckData;
      if ( serviceOrVm )
      {
        if ( serviceOrVm.get('type') === 'service' )
        {
          serviceData = serviceOrVm.serializeForNew();
          serviceLinks = serviceOrVm.get('consumedServicesWithNames');
          instanceData = serviceData.launchConfig;
          delete serviceData.launchConfig;
          delete serviceData.instances;

          (serviceOrVm.secondaryLaunchConfigs||[]).forEach((slc) => {
            var data = slc.serializeForNew();
            secondaryLaunchConfigs.push(store.createRecord(data));
          });

          delete serviceData.secondaryLaunchConfigs;
        }
        else
        {
          instanceData = serviceOrVm.serializeForNew();
        }

        healthCheckData = instanceData.healthCheck;
      }
      else
      {
        instanceData = {
          type: 'launchConfig',
          kind: 'virtualMachine',
          memoryMb: 512,
          tty: true,
          stdinOpen: true,
          restartPolicy: {name: 'always'},
        };
      }

      if ( !serviceData )
      {
        serviceData = {
          type: 'service',
          stackId: params.stackId,
          scale: 1,
          startOnCreate: true,
        };
      }

      var instance = store.createRecord(instanceData);
      var service = store.createRecord(serviceData);
      service.set('serviceLinks', serviceLinks);

      if ( healthCheckData )
      {
        // The type isn't set on an existing one
        healthCheckData.type = 'instanceHealthCheck';
        instance.set('healthCheck', store.createRecord(healthCheckData));
      }

      service.set('launchConfig', instance);
      service.set('secondaryLaunchConfigs', secondaryLaunchConfigs);

      return Ember.Object.create({
        service: service,
        allHosts: results.allHosts,
        allStoragePools: results.allStoragePools,
      });
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('stackId', null);
      controller.set('serviceId', null);
      controller.set('virtualMachineId', null);
      controller.set('upgrade', null);
    }
  }
});
