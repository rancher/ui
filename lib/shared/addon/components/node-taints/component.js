import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import EmberObject from '@ember/object';
import C from 'ui/utils/constants';

const NO_SCHEDULE = 'NoSchedule';
const NO_EXECUTE = 'NoExecute';
const PREFER_NO_SCHEDULE = 'PreferNoSchedule';

const EFFECTS = [
  {
    label: NO_SCHEDULE,
    value: NO_SCHEDULE,
  },
  {
    label: NO_EXECUTE,
    value: NO_EXECUTE,
  },
  {
    label: PREFER_NO_SCHEDULE,
    value: PREFER_NO_SCHEDULE,
  }
]

export default Component.extend({
  layout,

  setTaints: null,
  isNode:    false,

  effects: EFFECTS,
  taints:  null,

  init() {
    this._super(...arguments);

    this.initTaints();
  },

  actions: {
    addTaint() {
      const taint = EmberObject.create({
        key:    '',
        value:  '',
        effect: NO_SCHEDULE
      });

      get(this, 'taints').pushObject(taint);
    },

    removeTaint(taint) {
      get(this, 'taints').removeObject(taint);
    },
  },

  taintsDidChange: observer('taints.@each.{key,value,effect}', function() {
    const out = [];

    get(this, 'taints').filter((taint) => get(taint, 'key')).forEach((taint) => {
      const existing = out.find((t) => get(t, 'key') === get(taint, 'key') && get(t, 'effect') === get(taint, 'effect'));

      if ( existing ) {
        set(existing, 'value', get(taint, 'value'));
      } else {
        out.push({
          key:    get(taint, 'key'),
          value:  get(taint, 'value'),
          effect: get(taint, 'effect'),
        })
      }
    });

    if ( get(this, 'setTaints') ) {
      this.setTaints(out);
    } else if ( get(this, 'isNode') ) {
      set(this, 'model.taints', out);
    } else {
      set(this, 'model.nodeTaints', out);
    }
  }),

  initTaints() {
    set(this, 'taints', (get(this, 'model.nodeTaints') || get(this, 'model.taints') || []).map((taint) => {
      return {
        key:      get(taint, 'key'),
        value:    get(taint, 'value'),
        effect:   get(taint, 'effect'),
        readonly: C.LABEL_PREFIX_TO_IGNORE.find((L) => get(taint, 'key').startsWith(L))
      }
    }));
  },
});
