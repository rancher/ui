import { inject as service } from '@ember/service';
import { get, computed, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const EFFECT = ['NO_SCHEDULE', 'PREFER_NO_SCHEDULE', 'NO_EXECUTE']

export default Component.extend({
  intl:                service(),
  scope:               service(),
  settings:            service(),

  layout,
  editing:             false,
  showWarning:         false,

  taints: null,

  actions: {
    addTaint() {
      const taints = get(this, 'taints') ? get(this, 'taints').slice() : [];

      taints.pushObject({
        effect: 'NO_SCHEDULE',
        key:    '',
        value:  '',
      });

      set(this, 'taints', taints);
    },

    removeTaint(obj) {
      get(this, 'taints').removeObject(obj);
    },
  },

  effectContent: computed(() => {
    return EFFECT.map((e) => {
      return {
        label: e,
        value: e,
      }
    })
  }),

});
