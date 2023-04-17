import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';
import { TERM_PRIORITY } from '../form-pod-affinity-k8s/component';

/** if preferred:
 * - {
  *   weight: int,
  *   podaffinityterm: podaffinityterm
  *  }
  *  else:
  *  - podAffinityTerm
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
  */

const namespaceModes = {
  ALL:      'all',
  THIS_POD: 'thisPod',
  IN_LIST:  'inList'
}

export const priorityOptions =  [{
  value: TERM_PRIORITY.REQUIRED,
  label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.required'
}, {
  value: TERM_PRIORITY.PREFERRED,
  label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.preferred'
}]


export default Component.extend({
  layout,
  namespaceModes,
  priorityOptions,
  TERM_PRIORITY,
  /**
   * {
   *  priority: preferred or required
   *  anti: bool - podAffinity or podAntiAffinity
   *  term: podaffinityterm OR
   *   {
   *    weight,
   *    podAffintyTerm
   *   }
   * }
   */
  value:         null,
  mode:          'new',
  remove:        null,
  typeChanged:   null,
  antiChanged:   null,


  affinityOptions: [{
    value: 'true',
    label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.antiAffinity'
  }, {
    value: 'false',
    label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.affinity'
  }],

  actions:   {
    removeTerm(){
      if (this.remove){
        this.remove()
      }
    }
  },

  editing:   computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),


  // TODO nb acccount for weight if value.priority === 'preferred'
  podAffintyTerm: computed('value.term', 'value.priority', function() {
    return get(this.value, 'priority') === TERM_PRIORITY.REQUIRED ? get(this.value, 'term') : get(this.value, 'term.podAffinityTerm')
  }),

  weight: computed('value.term', 'value.priority', {
    get(){
      return get(this.value, 'priority') === TERM_PRIORITY.REQUIRED ? null : get(this.value, 'term.weight')
    },
    set(key, val){
      if (val || val === 0) {
        try {
          const toInt = parseInt(val, 10)

          set(this.value.term, 'weight', toInt)
        } catch (e){
          // TODO nb handle bad weight value better
          console.error(e)
        }
      } else if (this.value?.term?.weight){
        delete this.value.term.weight
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  namespaces: computed('podAffintyTerm.namespaces', 'namespaceMode', {
    get(){
      const namespaces = get(this.podAffintyTerm, 'namespaces') || [];

      return namespaces.join(', ')
    },
    set(key, val){
      if (val || val === ''){
      // a,b,c or a, b, c
        const parsed = val.split(/,\s*/g).map((ns) => ns.trim()).filter((ns) => !!ns)

        set(this.podAffintyTerm, 'namespaces', parsed)
      } else if (this.podAffintyTerm.namespaces){
        delete this.podAffintyTerm.namespaces
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  namespaceSelector: computed('namespaceMode', 'podAffintyTerm.namespaceSelector', {
    get(){
      return this.podAffintyTerm.namespaceSelector || {}
    },
    set(key, val){
      if (val){
        set(this.podAffintyTerm, 'namespaceSelector', val)
      } else if (this.podAffintyTerm.namespaceSelector){
        delete this.podAffintyTerm.namespaceSelector
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  priority: computed('priorityOptions', 'value.priority', {
    get(){
      return get(this.value, 'priority')
    },
    set(key, val){
      const old = get(this.value, 'priority')

      set(this.value, 'priority', val)
      this.typeChanged(old)

      return val
    },
  }),

  anti: computed('affinityOptions', 'value.anti', {
    get(){
      const isAnti = get(this.value, 'anti')


      return isAnti ? 'true' : 'false'
    },
    set(key, val){
      const old = get(this, 'anti') === 'true'
      const neu = val === 'true'

      set(this.value, 'anti', neu)

      this.antiChanged(old)

      return val
    },
  }),

  // null or empty namespaces and null selector = 'this pod's namespace'
  // null or empty namespaces and empty object selector = 'all namespaces'
  namespaceMode: computed('podAffintyTerm.namespaceSelector', 'podAffintyTerm.namespaces.length', {
    get(){
      if (this.podAffintyTerm.namespaceSelector){
        return namespaceModes.ALL
      } else if (this.podAffintyTerm.namespaces){
        return namespaceModes.IN_LIST
      }

      return namespaceModes.THIS_POD
    },
    set(key, val){
      switch (val){
      case namespaceModes.ALL:
        set(this, 'namespaceSelector', {})
        set(this, 'namespaces', null)
        break;

      case namespaceModes.THIS_POD:
        set(this, 'namespaceSelector', null);
        set(this, 'namespaces', null);
        break;

      case namespaceModes.IN_LIST:
        set(this, 'namespaceSelector', null)
      }

      return val
    }
  }),

})