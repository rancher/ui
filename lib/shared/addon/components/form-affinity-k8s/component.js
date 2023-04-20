// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#affinity-v1-core
import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
} from '@ember/object';

/**
 * affinity: {
 *  nodeAffinity: {
 *    preferredDuringSchedulingIgnoredDuringExecution:
 *      - {
 *          preference: nodeselectorterm,
 *          weight: int
 *        }
 *    requiredDuringSchedulingIgnoredDuringExecution:
 *       nodeselectorterms:
 *          - nodeselectorterm
 *   }
 *
 *  podAffinity: {
 *    preferredDuringSchedulingIgnoredDuringExecution:
 *      - {
 *          weight: int,
 *          podaffinityterm: podaffinityterm
 *        }
 *    requiredDuringSchedulingIgnoredDuringExecution:
 *      - podaffinityterm
 *  }
 *
 *  podAntiAffinity: {
 *    same as podAffinity
 *  }
 * }
 */


export default Component.extend({
  layout,

  value:   null,
  editing: false,

  podAffinity: computed('value.podAffinity.{preferredDuringSchedulingIgnoredDuringExecution,requiredDuringSchedulingIgnoredDuringExecution}', {
    get(){
      if (!this.value?.podAffinity){
        set(this.value, 'podAffinity', {})
      }
      this.initPreferredRequired(this.value.podAffinity)

      return get(this.value, 'podAffinity')
    },
    set(key, val){
      const withoutId = {
        preferredDuringSchedulingIgnoredDuringExecution: this.removeIds(val.preferredDuringSchedulingIgnoredDuringExecution),
        requiredDuringSchedulingIgnoredDuringExecution:  this.removeIds(val.requiredDuringSchedulingIgnoredDuringExecution)
      }

      set(this.value, 'podAffinity', withoutId)
      this.notifyPropertyChange('value')

      return val
    }
  }),

  podAntiAffinity: computed('value.podAntiAffinity.{preferredDuringSchedulingIgnoredDuringExecution,requiredDuringSchedulingIgnoredDuringExecution}', {
    get(){
      if (!this.value?.podAntiAffinity){
        set(this.value, 'podAntiAffinity', {})
      }
      this.initPreferredRequired(this.value.podAntiAffinity)

      return get(this.value, 'podAntiAffinity')
    },
    set(key, val){
      const withoutId = {
        preferredDuringSchedulingIgnoredDuringExecution: this.removeIds(val.preferredDuringSchedulingIgnoredDuringExecution),
        requiredDuringSchedulingIgnoredDuringExecution:  this.removeIds(val.requiredDuringSchedulingIgnoredDuringExecution )
      }

      set(this.value, 'podAntiAffinity', withoutId)
      this.notifyPropertyChange('value')

      return val
    }
  }),

  nodeAffinity: computed('value.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution', 'value.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms', {
    get(){
      if (!this.value?.nodeAffinity){
        set(this.value, 'nodeAffinity', {})
      }
      this.initPreferredRequired(this.value.nodeAffinity, true)
      if (!this.value.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms){
        set(this.value, 'nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms', [])
      }

      return get(this.value, 'nodeAffinity')
    },
    set(key, val){
      const withoutId = {
        preferredDuringSchedulingIgnoredDuringExecution: this.removeIds(val.preferredDuringSchedulingIgnoredDuringExecution),
        requiredDuringSchedulingIgnoredDuringExecution:  this.removeIds(val?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms)
      }

      set(this.value, 'nodeAffinity', withoutId)
      this.notifyPropertyChange('value')

      return val
    }
  }),

  initPreferredRequired: (val, isNode) => {
    if (!val.preferredDuringSchedulingIgnoredDuringExecution){
      set(val, 'preferredDuringSchedulingIgnoredDuringExecution', [])
    }
    if (!val.requiredDuringSchedulingIgnoredDuringExecution){
      if (isNode){
        set(val, 'requiredDuringSchedulingIgnoredDuringExecution', { nodeSelectorTerms: [] })
      } else {
        set(val, 'requiredDuringSchedulingIgnoredDuringExecution', [])
      }
    }
  },

  removeIds: (terms = []) => {
    return terms.map((term) => {
      delete term._id

      return term
    })
  }
})