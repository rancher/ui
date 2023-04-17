// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#affinity-v1-core
import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
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
 *
 *
 * nodeselectorterm: {
 *    matchexpressions:
 *      - {
 *          key: string,
 *          operator: string, one of: [In, NotIn, Exists, DoesNotExist Gt, Lt]
 *          value: string array ... If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer.
 *      }
 *    matchfields: same as match expressions but matches fields instead of labels
 * }
 *
 *
 * podaffinityterm: {
 *   namespaceSelector: same as labelSelector OR if empty object, 'all namespaces'
 *   namespaces: string array of namespaces - if [] && namespaceSelector==null, 'use this pod's namespace'
 *   toplogyKey: string
 *   labelSelector: {
 *      matchExpressions:
 *        - {
 *            key: string,
 *            operator string one of: In, NotIn, Exists and DoesNotExist
 *            value: string array ... If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty.
 *          }
 *      matchLabels: {
 *            map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value".
 *            The requirements are ANDed.
 *        }
 *    }

 * }
 *
 * COMPONENTS NEEDED:
 * podaffinity - 2x podaffinitytermComponent arrays
 * nodeaffinity - 2x nodeselectortermComponent arrays
 * podaffinityterm - bool to switch between regular podaffinityterm and podaffinityterm + weight
 * nodeselectorterm- bool to switch between regular nodeselectorterm and nodeselectorterm + weight
 * matchexpressions - should have pod/node bool prop to work for both podaffinityterm.labelselector.matchexpressions and nodeselectorterm.matchexpressions/matchfields
 *
 *
 *
 */


export default Component.extend({
  layout,

  // affinity object
  value: null,
  mode:  'new',

  actions: {
    affinityChanged(key, val){
      // TODO nb update affinity
      console.log('affinity ', key, ' changed to: ', val)
    }
  },

  podAffinity: computed('value.podAffinity.{preferredDuringSchedulingIgnoredDuringExecution,requiredDuringSchedulingIgnoredDuringExecution}', {
    get(){
      if (!this.value?.podAffinity){
        set(this.value, 'podAffinity', {})
      }
      this.initPreferredRequired(this.value.podAffinity)

      return get(this.value, 'podAffinity')
    },
    set(key, val){
      // TODO nb move withoutId to own function
      const withoutId = {
        preferredDuringSchedulingIgnoredDuringExecution: (val.preferredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        }),
        requiredDuringSchedulingIgnoredDuringExecution: (val.requiredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        })
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
        preferredDuringSchedulingIgnoredDuringExecution: (val.preferredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        }),
        requiredDuringSchedulingIgnoredDuringExecution: (val.requiredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        })
      }

      set(this.value, 'podAntiAffinity', withoutId)
      this.notifyPropertyChange('value')

      return val
    }
  }),

  nodeAffinity: computed('value.nodeAffinity.{preferredDuringSchedulingIgnoredDuringExecution,requiredDuringSchedulingIgnoredDuringExecution}', {
    get(){
      if (!this.value?.nodeAffinity){
        set(this.value, 'nodeAffinity', {})
      }
      this.initPreferredRequired(this.value.nodeAffinity)

      return get(this.value, 'nodeAffinity')
    },
    set(key, val){
      const withoutId = {
        preferredDuringSchedulingIgnoredDuringExecution: (val.preferredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        }),
        requiredDuringSchedulingIgnoredDuringExecution: (val.requiredDuringSchedulingIgnoredDuringExecution || []).map((term) => {
          delete term._id;

          return term
        })
      }

      set(this.value, 'nodeAffinity', withoutId)
      this.notifyPropertyChange('value')

      return val
    }
  }),

  initPreferredRequired: (val) => {
    if (!val.preferredDuringSchedulingIgnoredDuringExecution){
      set(val, 'preferredDuringSchedulingIgnoredDuringExecution', [])
    }
    if (!val.requiredDuringSchedulingIgnoredDuringExecution){
      set(val, 'requiredDuringSchedulingIgnoredDuringExecution', [])
    }
  }
})