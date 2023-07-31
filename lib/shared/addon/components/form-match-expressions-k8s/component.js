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
}

export default Component.extend({
  layout,
  attributeBindings: ['data-testid'],

  editing:          false,
  matchExpressions: null, // node selector term
  matchFields:      null, // node selector term
  isPod:            false, // pod affinity only has matchExpressions & has fewer operator options
  allMatches:       null,
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
    const  allMatches  = [];

    const addMatches = (matches, type) => {
      matches.forEach((match) => {
        allMatches.push({
          type,
          match
        })
      })
    }

    addMatches((this.matchExpressions || []), MATCH_TYPES.MATCH_EXPRESSIONS)
    addMatches((this.matchFields || []), MATCH_TYPES.MATCH_FIELDS)

    set(this, 'allMatches', allMatches)
  },

  actions: {
    addMatch(){
      const toAdd = {
        type:  this.isPod ?  MATCH_TYPES.LABEL_SELECTOR : MATCH_TYPES.MATCH_EXPRESSIONS,
        match: { operator: this.operatorOpts[0].value },
      }

      get(this, 'allMatches').addObject(toAdd)

      this.matchExpressions.push(toAdd.match)
      this.notifyPropertyChange('matchExpressions')
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
        // set values to empty array to force input component to update
        set(match, 'match.values', [])
        delete match.match.values
      } else if (!match.match.values) {
        match.match.values = []
      }
    },
  },

  // node match expressions/fields have a few more operator options
  operatorOpts: computed('isPod',  function(){
    const podAndNode = [
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

    return get(this, 'isPod') ?  podAndNode : [...podAndNode, ...nodeOnly]
  }),


  removeMatch(path, match){
    const target = get(this, path) || []

    const neu = target.filter((m) => m !== match)

    set(this, path, neu)
  },

})