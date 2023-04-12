import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';

/**  podAffinity: {
  *    preferredDuringSchedulingIgnoredDuringExecution:
  *      - {
  *          weight: int,
  *          podaffinityterm: podaffinityterm
  *        }
  *    requiredDuringSchedulingIgnoredDuringExecution:
  *      - podaffinityterm
  *  }
  */
export default Component.extend({
  layout,

  value: null,
  mode:  'new',
  anti:  false,

  actions: {
    addRequired(){
      this.requiredDuringSchedulingIgnoredDuringExecution.pushObject({})
    },
    addPreferred(){
      this.preferredDuringSchedulingIgnoredDuringExecution.pushObject({})
    },

    removeTerm(term, key){
      get(this, key).removeObject(term)
    }
  },

  editing: computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  requiredDuringSchedulingIgnoredDuringExecution: computed('value.requiredDuringSchedulingIgnoredDuringExecution', function(){
    return get(this.value, 'requiredDuringSchedulingIgnoredDuringExecution') || []
  }),

  preferredDuringSchedulingIgnoredDuringExecution: computed('value.preferredDuringSchedulingIngnoredDuringExecution', function(){
    return get(this.value, 'preferredDuringSchedulingIgnoredDuringExecution') || []
  }),



})