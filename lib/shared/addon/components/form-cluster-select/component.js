import Component from '@ember/component';
import layout from './template';
import { get, set, setProperties, computed, observer } from '@ember/object';
import { next } from '@ember/runloop';

const VALID_ROLES = ['etcd','controlplane','worker'];

export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['box'],
  requestedClusterId: null,
  requestedClusterName: null,
  role: null,
  defaultExpand: null,
  hasCluster: null,
  setDisabled: false,

  etcd: false,
  controlplane: false,
  worker: false,

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

    let roles = get(this, 'role');
    if ( typeof roles === 'undefined' ) {
      roles = ['worker'];
    }

    if ( roles && roles.length) {
      VALID_ROLES.forEach((role) => {
        if ( roles.includes(role) ) {
          set(this, role, true);
        }
      });
    }
  },

  rolesChanged: observer('etcd','controlplane','worker', function() {
    const roles = VALID_ROLES.filter((x) => get(this,x));
    set(this, 'role', roles);
  }),

  filteredClusters: computed('clusters.@each.canAddNode', function() {
    return (get(this,'clusters')||[]).filterBy('canAddNode',true);
  }),
});
