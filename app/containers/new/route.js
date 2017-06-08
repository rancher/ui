import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {};

    if ( params.containerId )
    {
      dependencies.existing = store.find('container', params.containerId);
    }

    return Ember.RSVP.hash(dependencies, 'Load container dependencies').then((results) => {

      var data, healthCheckData;
      var instance = null;

      if ( results.existing ) {

        var linksToFollow = {
          ports: results.existing.followLink('ports'),
          instanceLinks: results.existing.followLink('instanceLinks'),
        };

        return Ember.RSVP.hash(linksToFollow).then((hash) => {

          results.existing.setProperties({
            instanceLinks: hash.instanceLinks,
            ports: hash.ports,
          });

          if ( params.upgrade )
          {
            return Ember.Object.create({
              instance: results.existing.clone(),
            });
          }

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

          if ( !data.environment )
          {
            data.environment = {};
          }

          healthCheckData = data.healthCheck;
          delete data.healthCheck;

          instance = store.createRecord(data);

          if ( healthCheckData ) {
            // The type isn't set on an existing one
            healthCheckData.type = 'instanceHealthCheck';
            instance.set('healthCheck', store.createRecord(healthCheckData));
          }

          return Ember.Object.create({
            instance: instance,
          });

        });

      } else {

        data = {
          type: 'container',
          requestedHostId: params.hostId,
          tty: true,
          stdinOpen: true,
        };

        instance = store.createRecord(data);

        if ( healthCheckData ) {
          // The type isn't set on an existing one
          healthCheckData.type = 'instanceHealthCheck';
          instance.set('healthCheck', store.createRecord(healthCheckData));
        }

        return Ember.Object.create({
          instance: instance,
        });

      }


    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('hostId', null);
      controller.set('stackId', null);
      controller.set('containerId', null);
      controller.set('stackId', null);
      controller.set('serviceId', null);
      controller.set('upgrade', null);
      controller.set('mode', null);
    }
  }
});
