import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
} from '@ember/object';

const MATCH_TYPES = {
  MATCH_EXPRESSIONS: 'matchExpressions',
  MATCH_FIELDS:      'matchFields',
  LABEL_SELECTOR:    'labelSelector'
}

export default Component.extend({
  layout,
  editing:          false,
  matchExpressions: null,
  matchFields:      null,

  // labelSelector.matchExpressions
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
    if (this.labelSelector) {
      const allMatches = (this.labelSelector?.matchExpressions || []).map((match) => {
        return {
          type: MATCH_TYPES.LABEL_SELECTOR,
          match
        }
      })

      set(this, 'allMatches', allMatches)
    } else {
      const allMatches = []
      const addMatches = function(matches = [], type){
        matches.forEach((match) => {
          allMatches.push({
            type,
            match
          })
        })
      }

      addMatches(this.matchExpressions, MATCH_TYPES.MATCH_EXPRESSIONS)
      addMatches(this.matchFields, MATCH_TYPES.MATCH_FIELDS)
      set(this, 'allMatches', allMatches)
    }
  },

  actions: {
    addMatch(){
      const toAdd = {
        type:  this.labelSelector ?  MATCH_TYPES.LABEL_SELECTOR : MATCH_TYPES.MATCH_EXPRESSIONS,
        match: { operator: this.operatorOpts[0].value },
      }

      get(this, 'allMatches').addObject(toAdd)
      if (this.labelSelector) {
        this.labelSelector.push(toAdd.match)
        this.notifyPropertyChange('labelSelector')
      } else {
        this.matchExpressions.push(toAdd.match)
        this.notifyPropertyChange('matchExpressions')
      }
    },

    removeMatchAction(match){
      set(this, 'allMatches', this.allMatches.filter((m) => m !== match))
      switch (match.type){
      case MATCH_TYPES.MATCH_EXPRESSIONS:
        this.removeMatch('matchExpressions', match.match)

        break;
      case MATCH_TYPES.MATCH_FIELDS:
        this.removeMatch('matchFields', match.match)

        break;
      case MATCH_TYPES.LABEL_SELECTOR:
        this.removeMatch('labelSelector', match.match)
        break;
      default:
        break;
      }
    },

    typeChanged(match){
      if (match.type === MATCH_TYPES.MATCH_EXPRESSIONS){
        this.removeMatch('matchExpressions', match.match)

        this.matchFields.push(match.match)
        this.notifyPropertyChange('matchFields')
      } else {
        this.removeMatch('matchFields', match.match)

        this.matchExpressions.push(match.match)
        this.notifyPropertyChange('matchExpressions')
      }
    },

    operatorChanged(match, selected){
      if (selected.value === 'Exists' || selected.value === 'DoesNotExist'){
        match.match.values = []
      }
    }
  },

  operatorOpts: computed('labelSelector', function(){
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

    return get(this, 'labelSelector') ?  either : [...either, ...nodeOnly]
  }),


  removeMatch(path, match){
    const target = get(this, path) || []

    const neu = target.filter((m) => m !== match)

    set(this, path, neu)
  },

})