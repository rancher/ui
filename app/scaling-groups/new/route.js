import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {}

    if ( params.serviceId )
    {
      dependencies['serviceOrContainer'] = store.find('service', params.serviceId);
    }
    else if ( params.containerId )
    {
      dependencies['serviceOrContainer'] = store.find('container', params.containerId, {include: ['ports']});
    }

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      var serviceOrContainer = results.serviceOrContainer
      var serviceLinks = [];
      var secondaryLaunchConfigs = [];

      if ( params.upgrade )
      {
        return Ember.Object.create({
          service: serviceOrContainer.clone(),
        });
      }

      var instanceData, serviceData, healthCheckData;
      if ( serviceOrContainer )
      {
        if ( serviceOrContainer.get('type').toLowerCase() === 'scalinggroup' )
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
          type: 'scalingGroup',
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
      });
    });
  },

  afterModel: function(model) {
    model.set('service.secondaryLaunchConfigs', this.setUiId(model.get('service.secondaryLaunchConfigs')||[]));
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
