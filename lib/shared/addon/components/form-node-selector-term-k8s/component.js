import Component from '@ember/component';
import layout from './template';
import { priorityOptions } from '../form-pod-affinity-term-k8s/component';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';
import { TERM_PRIORITY } from '../form-pod-affinity-k8s/component';

/**   nodeselectorterm: {
  *    matchexpressions:
  *      - {
  *          key: string,
  *          operator: string, one of: [In, NotIn, Exists, DoesNotExist Gt, Lt]
  *          value: string array ... If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer.
  *      }
  *    matchfields: same as match expressions but matches fields instead of labels
  * }
  *
  */


export default Component.extend({
  layout,

  value: null,
  mode:  'new',

  priorityOptions,
  TERM_PRIORITY,


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

  weight: computed('value.term', 'value.priority', {
    get(){
      return get(this.value, 'term.weight')
    },
    set(key, val){
      if (val || val === '0') {
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

  nodeSelectorTerm: computed('value.priority', 'value.term.preference', function() {
    if (this.value.priority === TERM_PRIORITY.PREFERRED){
      return this.value?.term?.preference
    }

    return this.value.term
  }),

  matchExpressions: computed('nodeSelectorTerm.matchExpressions', {
    get(){
      return get(this, 'nodeSelectorTerm.matchExpressions') || []
    },
    set(key, val){
      if ((!val || !val.length) && this.nodeSelectorTerm.matchExpressions){
        delete get(this, 'nodeSelectorTerm').matchExpressions

        this.notifyPropertyChange('nodeSelectorTerm')
      } else if (val && val.length){
        set(this.nodeSelectorTerm, 'matchExpressions', val)
      }

      return val
    }
  }),

  matchFields: computed('nodeSelectorTerm.matchFields', {
    get(){
      return get(this, 'nodeSelectorTerm.matchFields') || []
    },
    set(key, val){
      if ((!val || !val.length) && this.nodeSelectorTerm.matchFields){
        delete get(this, 'nodeSelectorTerm').matchFields

        this.notifyPropertyChange('nodeSelectorTerm')
      } else if (val && val.length) {
        set(this.nodeSelectorTerm, 'matchFields', val)
      }

      return val
    }
  }),

})