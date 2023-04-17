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


export default Component.extend({
  layout,
  namespaceModes,

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

  priorityOptions: [{
    value: TERM_PRIORITY.REQUIRED,
    label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.required'
  }, {
    value: TERM_PRIORITY.PREFERRED,
    label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.typeOptions.preferred'
  }],

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

  // namespaceModeObserver: observer('namespaceMode', () => {

  // }),

  editing:   computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  term: computed('value.term', function(){
    return get(this.value, 'term') || {}
  }),

  topologyKey: computed('value.topologyKey', function(){
    return get(this.value, 'topologyKey') || ''
  }),

  namespaces: computed('term.namespaces', 'namespaceMode', {
    get(){
      const namespaces = get(this.term, 'namespaces') || [];

      return namespaces.join(', ')
    },
    set(key, val){
      if (val || val === ''){
      // a,b,c or a, b, c
        const parsed = val.split(/,\s*/g).map((ns) => ns.trim()).filter((ns) => !!ns)

        set(this.term, 'namespaces', parsed)
      } else if (this.term.namespaces){
        delete this.term.namespaces
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  namespaceSelector: computed('namespaceMode', 'term.namespaceSelector', {
    get(){
      return this.term.namespaceSelector || {}
    },
    set(key, val){
      if (val){
        set(this.term, 'namespaceSelector', val)
      } else if (this.term.namespaceSelector){
        delete this.term.namespaceSelector
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
  namespaceMode: computed('term.namespaceSelector',  'term.namespaces.length', {
    get(){
      if (this.term.namespaceSelector){
        return namespaceModes.ALL
      } else if (this.term.namespaces){
        return namespaceModes.IN_LIST
      }

      return namespaceModes.THIS_POD
    },
    set(key, val){
      // const namespaceMode = get(this, 'namespaceMode');

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
  })


})