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

  nodeSelectorTerm: computed('value.priority', 'value.term.preference', {
    get(){
      if (this.value.priority === TERM_PRIORITY.PREFERRED){
        return this.value?.term?.preference
      }

      return this.value.term
    },
    set(key, val){
      // neu will be data actually populated in cluster spec
      // only include matchExpressions and matchFields keys if they contain data
      // strip _id field (added and used exclusively by UI)
      const neu = {}

      if (val.matchExpressions && val.matchExpressions.length){
        neu.matchExpressions = val.matchExpressions.map((match) => {
          const out = { ...match };

          delete out._id

          return out
        })
      }
      if (val.matchFields && val.matchFields.length){
        neu.matchFields = val.matchFields.map((match) => {
          const out = { ...match };

          delete out._id

          return out
        })
      }

      // the parent component is tracking 'value' in a combined array of affinity.preferred.. antiAffinity.preferred... affinity.required... etc
      // need to alter the existing object because creating a new one wouldn't affect the term that is actually stored in agentConfig.overrideAffinity
      let target;

      debugger
      if (this.value.priority === TERM_PRIORITY.PREFERRED){
        target = this.value?.term?.preference || {}
      } else {
        target = this.value?.term || {}
      }
      if (!neu.matchExpressions && target.matchExpressions){
        delete target.matchExpressions
      } else {
        set(target, 'matchExpressions', neu.matchExpressions)
      }
      if (!neu.matchFields && target.matchFields){
        delete target.matchFields
      } else {
        set(target, 'matchFields', neu.matchFields)
      }
      this.notifyPropertyChange('value')

      return val
    }

  })
})