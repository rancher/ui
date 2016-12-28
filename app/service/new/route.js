import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'), // Need inactive ones in case a link points to an inactive host
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }
    else if ( params.containerId )
    {
      dependencies.pushObject(store.find('container', params.containerId, {include: ['ports']}));
    }

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then((results) => {
      var store = this.get('store');
      var allHosts = results[0];
      var serviceOrContainer = results[1];
      var serviceLinks = [];
      var secondaryLaunchConfigs = [];

      if ( params.upgrade )
      {
        return Ember.Object.create({
          service: serviceOrContainer.clone(),
          allHosts: allHosts,
        });
      }

      var instanceData, serviceData, healthCheckData;
      if ( serviceOrContainer )
      {
        if ( serviceOrContainer.get('type') === 'service' )
        {
          serviceData = serviceOrContainer.serializeForNew();
          serviceLinks = serviceOrContainer.get('consumedServicesWithNames');
          instanceData = serviceData.launchConfig;
          delete serviceData.launchConfig;
          delete serviceData.instances;

          (serviceOrContainer.secondaryLaunchConfigs||[]).forEach((slc) => {
            var data = slc.serializeForNew();
            secondaryLaunchConfigs.push(store.createRecord(data));
          });

          delete serviceData.secondaryLaunchConfigs;
        }
        else
        {
          instanceData = serviceOrContainer.serializeForNew();
        }

        healthCheckData = instanceData.healthCheck;
      }
      else
      {
        instanceData = {
          type: 'launchConfig',
          tty: true,
          stdinOpen: true,
          labels: { [C.LABEL.PULL_IMAGE]: C.LABEL.PULL_IMAGE_VALUE },
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
        allHosts: allHosts,
      });
    });
  },

  afterModel: function(model) {
    model.set('service.secondaryLaunchConfigs', this.setUiId(model.get('service.secondaryLaunchConfigs')));
  },

  setUiId: function(configs) {
    configs.forEach((config) => {
      let uiId = Util.randomStr();
      config.uiId = uiId;
    });
    return configs;
  },



  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('stackId', null);
      controller.set('serviceId', null);
      controller.set('containerId', null);
      controller.set('upgrade', null);
    }
  }
});
