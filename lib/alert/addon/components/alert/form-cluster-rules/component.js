import { computed, get, set } from '@ember/object';
import Component from '@ember/component';

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

  init(...args) {
    this._super(...args);
    this.set('systemServices', SYSTEM_SERVICES);
    this.set('resourceKinds', RESOURCE_KINDS);
  },

  isEventTarget: function() {
    const t = get(this, 'model._targetType');
    return t === 'warningEvent' || t ===  'normalEvent';
  }.property('model._targetType'),

  setEventType(t) {
    if (t === 'warningEvent') {
      set(this, 'model.targetEvent.type', 'Warning');
    }
    if (t === 'normalEvent') {
      set(this, 'model.targetEvent.type', 'Normal');
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
