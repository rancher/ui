import Component from '@ember/component';
import layout from './template';
import { get, set, setProperties } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['box'],
  requestedClusterId: null,
  requestedClusterName: null,
  requestedRoles: null,
  defaultExpand: null,
  hasCluster: null,
  setDisabled: false,
  didReceiveAttrs() {
    if (get(this, 'hasCluster')) {
      next(() => {
        setProperties(this, {
          setDisabled: true,
          requestedClusterId: get(this, 'hasCluster.id'),
          requestedClusterName: get(this, 'hasCluster.name') || get(this, 'hasCluster.clusterName'),
        });
      })
    }
  },
  actions: {
    addRole(role) {
      let roles = (get(this, 'requestedRoles') || []).slice();

      if (roles.includes(role)) {
        roles = roles.without(role);
      } else {
        roles.addObject(role);
      }

      set(this, 'requestedRoles', roles);
    }
  },
});
