import Component from '@ember/component';
import layout from './template';
import { get, set, setProperties, computed } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['box'],
  requestedClusterId: null,
  requestedClusterName: null,
  roles: null,
  defaultExpand: null,
  hasCluster: null,
  setDisabled: false,

  didReceiveAttrs() {
    if (get(this, 'hasCluster')) {
      next(() => {
        setProperties(this, {
          setDisabled: true,
          requestedClusterId: get(this, 'hasCluster.id'),
          requestedClusterName: get(this, 'hasCluster.name') || get(this, 'hasCluster.id'),
        });
      })
    }
  },

  actions: {
    addRole(role) {
      let roles = (get(this, 'role')||[]).slice();

      if (roles.includes(role)) {
        roles = roles.without(role);
      } else {
        roles.addObject(role);
      }

      set(this, 'role', roles);
    }
  },

  filteredClusters: computed('clusters.@each.canAddNode', function() {
    return (get(this,'clusters')||[]).filterBy('canAddNode',true);
  }),
});
