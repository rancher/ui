import Component from '@ember/component';
import layout from './template';
import {
  get,
  set,
} from '@ember/object';
import { randomStr } from '../../utils/util';
import { TERM_PRIORITY } from '../form-pod-affinity-k8s/component';

export default Component.extend({
  layout,
  attributeBindings: ['data-testid'],

  TERM_PRIORITY,
  nodeAffinity:      null,
  editing:           false,
  allTerms:          [],

  /**
 * this component renders one list for required & preferred arrays of node selector terms
 * each nodeaffinitytermk8s component can change between required and preferred
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
      if (old === TERM_PRIORITY.REQUIRED){
        const removeFrom = get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms')
        const addTo = get(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

        set(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms', this.removeFromSpec(term.term, removeFrom))
        set(term, 'term', this.addWeight(term.term))

        addTo.pushObject(term.term)
      } else {
        const removeFrom = get(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
        const addTo = get(this.nodeAffinity, 'requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms')

        set(this.nodeAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
        set(term, 'term', this.removeWeight(term.term))


        addTo.pushObject(term.term)
      }
      this.notifyPropertyChange('nodeAffinity')
    },

  },

  removeFromSpec: (term, array) => {
    array.removeObject(term)

    return array
  },

  addWeight: (term) => {
    const out = {
      preference: term,
      _id:             term._id
    }

    delete out.preference._id

    return out
  },

  removeWeight: (term) => {
    return {
      _id: term._id,
      ...term.preference
    }
  }

})