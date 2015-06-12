import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'), // Need inactive ones in case a link points to an inactive host
    ];

    if ( params.containerId )
    {
      dependencies.pushObject(store.find('container', params.containerId, {include: ['ports','instanceLinks']}));
    }

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then(function(results) {
      var allHosts = results[0];

      var data, healthCheckData;
      if ( params.containerId )
      {
        data = results[1].serializeForNew();
        data.ports = (data.ports||[]).map((port) => {
          delete port.id;
          return port;
        });

        data.instanceLinks = (data.instanceLinks||[]).map((link) => {
          delete link.id;
          return link;
        });

        healthCheckData = data.healthCheck;
        delete  data.healthCheck;
      }
      else
      {
        data = {
          type: 'container',
          requestedHostId: params.hostId,
          tty: true,
          stdinOpen: true,
        };
      }

      if ( !healthCheckData )
      {
        healthCheckData = {
          type: 'instanceHealthCheck',
          interval: 2000,
          responseTimeout: 2000,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
          requestLine: null,
        };
      }

      // The type isn't set on an existing one
      healthCheckData.type = 'instanceHealthCheck';

      var healthCheck = store.createRecord(healthCheckData);
      var instance = store.createRecord(data);
      instance.set('healthCheck', healthCheck);

      return Ember.Object.create({
        instance: instance,
        healthCheck: healthCheck,
        allHosts: allHosts,
      });
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel', null);
    controller.set('model', model);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('tab', 'command');
      controller.set('advanced', false);
      controller.set('hostId', null);
      controller.set('environmentId', null);
      controller.set('containerId', null);
    }
  }
});
