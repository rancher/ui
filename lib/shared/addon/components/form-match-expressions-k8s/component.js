// matchexpressions that matches k8s spec rather than norman spec
import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';
import { randomStr } from '../../utils/util';
/**
 * FOR NODE:
 * nodeSelectorTerm: {
 *    matchexpressions:
 *      - {
 *          key: string,
 *          operator: string, one of: [In, NotIn, Exists, DoesNotExist Gt, Lt]
 *          value: string array ... If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer.
 *      }
 *   matchFields: same as matchExpressions
 * }

* FOR POD:
labelSelector: {
*      matchExpressions:
*        - {
*            key: string,
*            operator string one of: In, NotIn, Exists and DoesNotExist
*            value: string array ... If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty.
*          }
}

 */

const MATCH_TYPES = {
  MATCH_EXPRESSIONS: 'matchExpressions',
  MATCH_FIELDS:      'matchFields',
  LABEL_SELECTOR:    'labelSelector'
}

export default Component.extend({
  layout,
  mode:             'new',
  // TODO nb have parent component delete keys if empty
  // TODO nb strip ID from match in parent component
  nodeSelectorTerm: null,
  labelSelector:    null,
  allMatches:       [],
  MATCH_TYPES,

  typeOpts: [
    {
      value:    MATCH_TYPES.MATCH_EXPRESSIONS,
      label: 'clusterNew.agentConfig.overrideAffinity.nodeAffinity.nodeSelectorTerm.typeOptions.matchExpression'
    },
    {
      value:    MATCH_TYPES.MATCH_FIELDS,
      label: 'clusterNew.agentConfig.overrideAffinity.nodeAffinity.nodeSelectorTerm.typeOptions.matchField'
    }
  ],

  // nodeSelectorTerms contain matchExpressions and matchFields, which will be shown as one list
  // each item has a dropdown to change from expression to field - we want to preserve the order of the list shown to the user when this is changed
  init(){
    this._super(...arguments);
    if (this.nodeSelectorTerm){
      const allMatches = []
      const addMatches = function(matches = [], type){
        matches.forEach((match) => {
          allMatches.push({
            type,
            match: {
              _id: randomStr(),
              ...match
            }
          })
        })
      }

      addMatches(this.nodeSelectorTerm?.matchExpressions, MATCH_TYPES.MATCH_EXPRESSIONS)
      addMatches(this.nodeSelectorTerm?.matchFields, MATCH_TYPES.MATCH_FIELDS)
      set(this, 'allMatches', allMatches)
    } else {
      const allMatches = (this.labelSelector?.matchExpressions || []).map((match) => {
        return {
          type:  MATCH_TYPES.LABEL_SELECTOR,
          match: {
            _id: randomStr(),
            ...match
          }
        }
      })

      set(this, 'allMatches', allMatches)
    }
  },

  actions: {
    addMatch(){
      const toAdd = {
        type:  this.nodeSelectorTerm ? MATCH_TYPES.MATCH_EXPRESSIONS : MATCH_TYPES.LABEL_SELECTOR,
        match: {
          _id:      randomStr(),
          operator: this.operatorOpts[0].value
        },
      }

      get(this, 'allMatches').addObject(toAdd)
      if (this.nodeSelectorTerm){
        if (!this.nodeSelectorTerm.matchExpressions){
          set(this.nodeSelectorTerm, 'matchExpressions', [])
        }
        this.nodeSelectorTerm.matchExpressions.push(toAdd.match)
        this.notifyPropertyChange('nodeSelectorTerm')
      } else {
        this.labelSelector.push(toAdd)
        this.notifyPropertyChange('labelSelector')
      }
    },

    removeMatchAction(match){
      set(this, 'allMatches', this.allMatches.filter((m) => m.match._id !== match.match._id))
      switch (match.type){
      case MATCH_TYPES.MATCH_EXPRESSIONS:
        this.removeMatch('nodeSelectorTermmatchExpressions', match.match)
        this.notifyPropertyChange('nodeSelectorTerm')
        break;
      case MATCH_TYPES.MATCH_FIELDS:
        this.removeMatch('nodeSelectorTerm.matchFields', match.match)
        this.notifyPropertyChange('nodeSelectorTerm')
        break;
      case MATCH_TYPES.LABEL_SELECTOR:
        this.removeMatch('labelSelector', match.match)
        this.notifyPropertyChange('labelSelector')
        break;
      default:
        break;
      }
    },

    typeChanged(match){
      if (match.type === MATCH_TYPES.MATCH_EXPRESSIONS){
        this.removeMatch('nodeSelectorTerm.matchExpressions', match.match)
        if (!this.nodeSelectorTerm.matchFields){
          set(this.nodeSelectorTerm, 'matchFields', [])
        }
        this.nodeSelectorTerm.matchFields.push(match.match)
      } else {
        this.removeMatch('nodeSelectorTerm.matchFields', match.match)
        if (!this.nodeSelectorTerm.matchExpressions){
          set(this.nodeSelectorTerm, 'matchExpressions', [])
        }
        this.nodeSelectorTerm.matchExpressions.push(match.match)
      }
      debugger
      this.notifyPropertyChange('nodeSelectorTerm')
    },
  },

  editing:   computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  operatorOpts: computed('nodeSelectorTerm', function(){
    const either = [
      {
        value:    'In',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.in'
      },
      {
        value:    'NotIn',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.notIn'
      },
      {
        value:    'Exists',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.exists'
      },
      {
        value:    'DoesNotExist',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.doesNotExist'
      }
    ];
    const nodeOnly = [
      {
        value:    'Gt',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.gt'
      },
      {
        value:    'Lt',
        label: 'clusterNew.agentConfig.overrideAffinity.podAffinity.matchExpressions.operatorOptions.lt'
      }
    ]

    return get(this, 'nodeSelectorTerm') ? [...either, ...nodeOnly] : either
  }),


  removeMatch(path, match){
    const target = get(this, path) || []
    const neu = target.filter((m) => m._id !== match._id);

    set(this, path, neu)
  },

})