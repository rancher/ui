import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';
import { randomStr } from '../../utils/util';

/**  podAffinity: {
  *    preferredDuringSchedulingIgnoredDuringExecution:
  *      - {
  *          weight: int,
  *          podaffinityterm: podaffinityterm
  *        }
  *    requiredDuringSchedulingIgnoredDuringExecution:
  *      - podaffinityterm
  *  }
  * podAntiAffinity: same shape
  */

export const TERM_PRIORITY = {
  PREFERRED: 'preferred',
  REQUIRED:  'required'
}

export default Component.extend({
  layout,

  TERM_PRIORITY,
  podAffinity:     null,
  podAntiAffinity: null,
  value:           null,
  mode:            'new',
  allTerms:        [],
  /**
 * this component renders one list for required & preferred arrays of terms in affinity & antiAffinity
 * each podaffinitytermk8s component can change between affinity and antiaffinity and between required and perferred
 * the overall list shouldn't re-order when a term is moved to a different underlying array so rather than computing this off the arrays in spec
 * this list will track which array a term should belong to and the arrays in spec will be computed off this
 * list of all terms
 * - {
 *    priority: preferred/required
 *    anti: bool
 *    term:preferred or required term
 *   }
 *
 */
  init(){
    this._super(...arguments);
    const allTerms = []
    const addTerms = function(terms = [], priority, isAnti){
      terms.forEach((term) => {
        allTerms.push({
          priority,
          anti: isAnti,
          term
        })
      })
    }

    addTerms(this.podAffinity?.preferredDuringSchedulingIgnoredDuringExecution, TERM_PRIORITY.PREFERRED, false)
    addTerms(this.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution, TERM_PRIORITY.REQUIRED, false)
    addTerms(this.podAntiAffinity?.preferredDuringSchedulingIgnoredDuringExecution, TERM_PRIORITY.PREFERRED, true)
    addTerms(this.podAntiAffinity?.requiredDuringSchedulingIgnoredDuringExecution, TERM_PRIORITY.REQUIRED, true)

    set(this, 'allTerms', allTerms)
  },

  actions: {
    addTerm(){
      const neu = {
        priority: TERM_PRIORITY.REQUIRED,
        anti:     false,
        term:     { _id: randomStr() }
      }

      this.allTerms.push(neu)
      get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution').addObject(neu.term)
      this.notifyPropertyChange('allTerms')
      this.notifyPropertyChange('podAffinity')
    },

    removeTerm(term){
      // TODO nb update relevent spec array
      // TODO nb does removeObject work here? Will it work in typeChanged and antiChanged?
      get(this, 'allTerms').removeObject(term)
      if (term.anti){
        if (term.priority === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          removeFrom.removeObject(term.term)
        } else {
          const removeFrom = get(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          removeFrom.removeObject(term.term)
        }
        this.notifyPropertyChange('podAntiAffinity')
      } else {
        if (term.priority === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          removeFrom.removeObject(term.term)
        } else {
          const removeFrom = get(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          removeFrom.removeObject(term.term)
        }
        this.notifyPropertyChange('podAffinity')
      }
    },

    typeChanged(term, old){
      if (term.anti){
        // TODO nb add 'weight'
        if (old === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          set(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
          // preferred terms are an object with weight and podAffinityTerm fields; required terms are just the contents of podAffinityTerm
          set(term, 'term', this.addWeight(term.term))

          addTo.pushObject(term.term)
        } else {
          const removeFrom = get(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          set(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
          set(term, 'term', this.removeWeight(term))


          addTo.pushObject(term.term)
        }
        this.notifyPropertyChange('podAntiAffinity')
      } else {
        if (old === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          set(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
          set(term, 'term', this.addWeight(term.term))

          addTo.pushObject(term.term)
        } else {
          const removeFrom = get(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          set(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))
          set(term, 'term', this.removeWeight(term))

          addTo.pushObject(term.term)
        }
        this.notifyPropertyChange('podAffinity')
      }
    },

    antiChanged(term, old){
      if (old){
        if (term.priority === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          set(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))

          addTo.pushObject(term.term)
        } else {
          const removeFrom = get(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          set(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))

          addTo.pushObject(term.term)
        }
      } else {
        if (term.priority === TERM_PRIORITY.REQUIRED){
          const removeFrom = get(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAntiAffinity, 'requiredDuringSchedulingIgnoredDuringExecution')

          set(this.podAffinity, 'requiredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))

          addTo.pushObject(term.term)
        } else {
          const removeFrom = get(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')
          const addTo = get(this.podAntiAffinity, 'preferredDuringSchedulingIgnoredDuringExecution')

          set(this.podAffinity, 'preferredDuringSchedulingIgnoredDuringExecution', this.removeFromSpec(term.term, removeFrom))

          addTo.pushObject(term.term)
        }
      }
      this.notifyPropertyChange('podAffinity')
      this.notifyPropertyChange('podAntiAffinity')
    }
  },

  editing: computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  removeFromSpec: (term, array) => {
    return array.filter((each) => each._id !== term._id)
  },

  addWeight: (term) => {
    const out = {
      // weight:          null,
      podAffinityTerm: term,
      _id:             term._id
    }

    delete out.podAffinityTerm._id

    return out
  },

  removeWeight: (term) => {
    const out = {
      _id: term._id,
      ...term.podAffinityTerm
    }

    return out
  }

})