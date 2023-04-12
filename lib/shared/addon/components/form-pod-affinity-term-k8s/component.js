import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';

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

  value:         null,
  mode:          'new',
  perferred:     false,
  remove:        null,

  actions:   {
    removeTerm(){
      if (this.remove){
        this.remove()
      }
    }
  },

  namespaceModeObserver: observer('namespaceMode', function() {
    const namespaceMode = get(this, 'namespaceMode');

    switch (namespaceMode){
    case namespaceModes.ALL:
      set(this, 'namespaceSelector', {})
      set(this, 'namespaces', '')
      break;

    case namespaceModes.THIS_POD:
      set(this, 'namespaceSelector', null);
      set(this, 'namespaces', '');
      break;

    case namespaceModes.IN_LIST:
      set(this, 'namespaceSelector', null)
    }
  }),

  editing:   computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  topologyKey: computed('value.topologyKey', function(){
    return get(this.value, 'topologyKey') || ''
  }),

  namespaces: computed('value.namespaces', 'namespaceMode', {
    get(){
      const namespaces = get(this.value, 'namespaces') || [];

      return namespaces.join(', ')
    },
    set(key, val){
      // TODO nb delete if not set
      if (val || val === ''){
      // a,b,c or a, b, c
        const parsed = val.split(/,\s*/g).map((ns) => ns.trim()).filter((ns) => !!ns)

        set(this.value, 'namespaces', parsed)
      } else if (this.value.namespaces){
        delete this.value.namespaces
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  namespaceSelector: computed('value.namespaceSelector', 'namespaceMode', {
    get(){
      return this.value.namespaceSelector || {}
    },
    set(key, val){
      if (val){
        set(this.value, 'namespaceSelector', val)
      } else if (this.value.namespaceSelector){
        delete this.value.namespaceSelector
        this.notifyPropertyChange('value')
      }

      return val
    }
  }),

  namespaceMode: namespaceModes.ALL,


})