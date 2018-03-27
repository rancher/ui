import { get, set } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

const SYSTEM_SERVICES = [
  {label: 'Etcd', value: 'etcd'},
  {label: 'Controller Manager', value: 'controller-manager'},
  {label: 'Scheduler', value: 'scheduler'},
];

// **NOTE** backend needs capitalized value
const RESOURCE_KINDS = [
  {label: 'Pod', value: 'Pod'},
  {label: 'Node', value: 'Node'},
  {label: 'Deployment', value: 'Deployment'},
  {label: 'Statefulset', value: 'Statefulset'},
  {label: 'Daemonset', value: 'Daemonset'},
];
export default Component.extend({
  globalStore: service(),
  scope: service(),
  clusterId: reads('scope.currentCluster.id'),

  init(...args) {
    this._super(...args);
    this.set('systemServices', SYSTEM_SERVICES);
    this.set('resourceKinds', RESOURCE_KINDS);
  },

  nodes: function() {
    const clusterId = get(this, 'clusterId');
    return get(this, 'globalStore').all('node').filterBy('clusterId', clusterId);
  }.property('clusterId'),

  isEventTarget: function() {
    const t = get(this, 'model._targetType');
    return t === 'warningEvent' || t ===  'normalEvent';
  }.property('model._targetType'),

  setEventType(t) {
    if (t === 'warningEvent') {
      set(this, 'model.targetEvent.eventType', 'Warning');
    }
    if (t === 'normalEvent') {
      set(this, 'model.targetEvent.eventType', 'Normal');
    }
  },
  targetTypeChanged: function() {
    const t = get(this, 'model._targetType');
    this.setEventType(t);
  }.observes('model._targetType'),

  actions: {
    // todo, don't know that this is needed
    noop() {
    },
  }
});
