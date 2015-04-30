import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    var ports;

    return store.find('container', params.container_id).then(function(container) {
      return container.followLink('ports').then(function(p) {
        ports = p;
        return container;
      });
    }).then(function(container) {
      var opt = {
        include: ['volume'],
        filter: {instanceId: container.get('id')}
      };

      // Find all the mounts for this container
      return store.find('mount', null, opt).then(function(containerMounts) {
        var mounts = container.get('mounts');
        if ( !Ember.isArray(mounts) )
        {
          mounts = [];
          container.set('mounts',mounts);
        }
        mounts.replace(0,mounts.get('length'), containerMounts.get('content'));

        var promises = [];
        mounts.forEach(function(mount) {
          // And get the volumes for those mounts and all their mounts (for "shared with")
          promises.push(mount.get('volume').importLink('mounts'));
        });

        return Ember.RSVP.all(promises,'Get container mounts');
      }).then(function(volumes) {
        var promises = [];

        volumes.forEach(function(volume) {
          volume.get('mounts').forEach(function(mount) {
            // Find the related containers, but skip this one
            if ( mount.get('instanceId') === container.get('id') )
            {
              return;
            }

            if ( ['removed','purged'].indexOf(mount.get('state')) !== -1 )
            {
              return;
            }

            var promise = store.find('container',mount.get('instanceId')).then(function(relatedInstance) {
              if ( !volume.get('sharedWith') )
              {
                volume.set('sharedWith',[]);
              }

              volume.get('sharedWith').pushObject(relatedInstance);
            });

            promises.push(promise);
          });
        });

        return Ember.RSVP.all(promises).then(function() {
          return volumes;
        });
      }).then(function(volumesWithInstances) {
        return Ember.Object.create({
          container: container,
          relatedVolumes: volumesWithInstances,
          ports: ports,
        });
      }).catch(function(err) {
        return Ember.Object.create({
          container: container,
          mountError: err,
          relatedVolumes: [],
          ports: [],
        });
      });
    });
  },

  setupController: function(controller, data) {
    this._super(controller, data.get('container'));
    controller.setProperties({
      mountError: data.get('mountError'),
      relatedVolumes: data.get('relatedVolumes'),
      ports: data.get('ports'),
    });
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Container', backPrevious: true, hasAside: 'nav-containers active'});
  },
});
