import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');

    return store.find('container', params.container_id).then(function(container) {
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
        container.set('relatedVolumes', volumesWithInstances);
        return container;
      }).catch(function(err) {
        container.set('mountError',err);
        container.set('mounts',[]);
        container.set('relatedVolumes',[]);
        return container;
      });
    });
  },

  renderTemplate: function() {
    this.render('container', {into: 'hosts'});
    this.send('setPageName','Container');
  },
});
