import { get, computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  intl: service(),
  // linksArray, allHosts, instance should be set

  isManagedNetwork: equal('instance.networkMode', 'managed'),

  init() {
    this.set('allHosts', this.get('store').all('host'));
    this._super(...arguments);
  },

  containerChoices: computed('allHosts.@each.instances', 'intl.locale', function() {
    var list = [];
    var id = this.get('id');
    var intl = this.get('intl');

    var expectContainerIds = (this.get('linksArray') || []).map((obj) => {
      return get(obj, 'targetInstanceId');
    });

    this.get('allHosts').map((host) => {
      var containers = (host.get('instances') || []).filter((instance) => {
        // You can't link to yourself, or to other types of instances, or to system containers
        return instance.get('id') !== id &&
               instance.get('kind') === 'container' &&
               !instance.get('systemContainer');
      });

      let hostLabel;

      if ( host.get('state') === 'active' ) {
        hostLabel = intl.t('containerChoices.hostGroup', { name: host.get('displayName') });
      } else {
        hostLabel = intl.t('containerChoices.hostGroupWithState', {
          name:  host.get('displayName'),
          state: host.get('state')
        });
      }

      list.pushObjects(containers.map((container) => {
        expectContainerIds.removeObject(container.get('id'));

        let containerLabel;

        if ( container.get('state') === 'running' ) {
          containerLabel = intl.t('containerChoices.containerOption', { name: container.get('displayName') });
        } else {
          containerLabel = intl.t('containerChoices.containerOption', {
            name:  container.get('displayName'),
            state: container.get('state')
          });
        }

        return {
          group:  hostLabel,
          hostId: host.get('id'),
          id:     container.get('id'),
          name:   containerLabel,
        };
      }));
    });

    if ( expectContainerIds.get('length') ) {
      // There are some links to containers which are not in the list somehow..
      expectContainerIds.forEach((id) => {
        var container = this.get('store').getById('container', id);

        return {
          group:  intl.t('containerChoices.unknownHost'),
          hostId: null,
          id,
          name:   (container && container.get('name') ? container.get('name') : `(${ id })`)
        };
      });
    }

    return list.sortBy('group', 'name', 'id');
  }),

  containersOnRequestedHost: computed('containerChoices.@each.hostId', 'instance.requestedHostId', function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');

    if ( requestedHostId ) {
      return all.filterBy('hostId', requestedHostId);
    } else {
      return all;
    }
  }),

  containersOnRequestedHostIfUnmanaged: computed('containerChoices.@each.hostId', 'instance.requestedHostId', 'isManagedNetwork', 'intl.locale', function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');
    var isManagedNetwork = this.get('isManagedNetwork');

    if ( requestedHostId && !isManagedNetwork ) {
      return all.filterBy('hostId', requestedHostId);
    } else {
      return all;
    }
  }),
});
