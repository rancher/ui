import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';
import { randomStr } from '../../utils/util';
import { TERM_PRIORITY } from '../form-pod-affinity-k8s/component';
/**
 *  nodeAffinity: {
 *    preferredDuringSchedulingIgnoredDuringExecution:
 *      - {
 *          preference: nodeselectorterm,
 *          weight: int
 *        }
 *    requiredDuringSchedulingIgnoredDuringExecution:
 *       nodeSelectorTerms:
 *          - nodeselectorterm
 *   }
 *
 *
 *   nodeselectorterm: {
 *    matchexpressions:
 *      - {
 *          key: string,
 *          operator: string, one of: [In, NotIn, Exists, DoesNotExist Gt, Lt]
 *          value: string array ... If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer.
 *      }
 *    matchfields: same as match expressions but matches fields instead of labels
 * }
 */


export default Component.extend({
  layout,

  TERM_PRIORITY,
  nodeAffinity:     null,
  mode:            'new',
  allTerms:        [],

  /**
 * this component renders one list for required & preferred arrays of node selector terms
 * each nodeaffinitytermk8s component can change between required and perferred
 * the overall list shouldn't re-order when a term is moved to a different underlying array so rather than computing this off the arrays in spec
 * this list will track which array a term should belong to and the arrays in spec will be computed off this
 *
 * list of all terms:
 * - {
 *    priority: preferred/required
 *    term:preferred or required term
 *   }
 *
 */
  init(){
    // TODO nb why is required... an array navigating back from view as yaml?
    this._super(...arguments);
    const allTerms = []
    const addTerms = function(terms = [], priority){
      terms.forEach((term) => {
        allTerms.push({
          priority,
          term
        })
      })
    }

    addTerms(this.nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution, TERM_PRIORITY.PREFERRED)
    addTerms(this.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms, TERM_PRIORITY.REQUIRED)
    set(this, 'allTerms', allTerms)
  },

  actions: {
    addTerm(){
      const neu = {
        priority: TERM_PRIORITY.REQUIRED,
        term:     { _id: randomStr() }
      }

      this.allTerms.push(neu)
      get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms').addObject(neu.term)
      this.notifyPropertyChange('allTerms')
      this.notifyPropertyChange('nodeAffinity')
    },

    removeTerm(term){
      // TODO nb does removeObject work here? Will it work in typeChanged?
      get(this, 'allTerms').removeObject(term)

      if (term.priority === TERM_PRIORITY.REQUIRED){
        const removeFrom = get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms')

        removeFrom.removeObject(term.term)
      } else {
        const removeFrom = get(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

        removeFrom.removeObject(term.term)
      }
      this.notifyPropertyChange('nodeAffinity')
    },


    typeChanged(term, old){
      // TODO nb add weight
      if (old === TERM_PRIORITY.REQUIRED){
        const removeFrom = get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms')
        const addTo = get(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

        set(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms', this.removeFromSpec(term.term, removeFrom))

        addTo.pushObject(term.term)
      } else {
        // TODO nb remove weight
        const removeFrom = get(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
        const addTo = get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms')

        set(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
        addTo.pushObject(term.term)
      }
      this.notifyPropertyChange('nodeAffinity')
    },

  },

  editing: computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  removeFromSpec: (term, array) => {
    return array.filter((each) => each._id !== term._id)
  },

})