import { get, set } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  globalStore: service(),
  scope:       service(),
  clusterId:   reads('scope.currentCluster.id'),

  init() {
    this._super(...arguments);
    const resourceKinds = get(this, 'globalStore')
      .getById('schema', 'targetevent')
      .optionsFor('resourceKind').sort()
      .map((value) => ({
        label: value,
        value,
      }));
    const systemServices = get(this, 'globalStore')
      .getById('schema', 'targetsystemservice')
      .optionsFor('condition').sort()
      .map((value) => ({
        label: value,
        value,
      }));

    this.set('resourceKinds', resourceKinds);
    this.set('systemServices', systemServices);
  },

  actions: {
    // todo, don't know that this is needed
    noop() {
    },
  },

  targetTypeChanged: observer('model._targetType', function() {
    const t = get(this, 'model._targetType');

    this.setEventType(t);
  }),

  nodes: computed('clusterId', function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('node').filterBy('clusterId', clusterId);
  }),

  isEventTarget: computed('model._targetType', function() {
    const t = get(this, 'model._targetType');

    return t === 'warningEvent' || t ===  'normalEvent';
  }),

  verbStyles: computed('model._targetType', function() {
    const tt = get(this, 'model._targetType');
    let out = '';

    if (tt === 'node' || tt === 'nodeSelector') {
      out = `padding-top: 6px;`;
    }

    return htmlSafe(out);
  }),

  setEventType(t) {
    if (t === 'warningEvent') {
      set(this, 'model.targetEvent.eventType', 'Warning');
    }
    if (t === 'normalEvent') {
      set(this, 'model.targetEvent.eventType', 'Normal');
    }
  },
});
