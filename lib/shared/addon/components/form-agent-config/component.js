import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
  observer
} from '@ember/object';

import { once } from '@ember/runloop';

export default Component.extend({
  layout,

  mode:     'new',
  // TODO nb pass in fleet/cluster spec
  cluster:   {},
  agentKey: '',

  actions: {
    updateLimits(val){
      if (!val.cpu && !val.memory){
        this.updateResourceRequirement('limits', null)
      } else {
        this.updateResourceRequirement('limits', val)
      }
    },

    updateRequests(val){
      if (!val.cpu && !val.memory){
        this.updateResourceRequirement('requests', null)
      } else {
        this.updateResourceRequirement('requests', val)
      }
    },

    updateAffinity(val){
      // TODO nb do

      console.log('agentConfig updating affinity to: ', val)
    }

  },

  // TODO nb add affinity
  agentObserver: observer('agentConfig.overrideResourceRequirements', 'agentConfig.appendTolerations', 'agentConfig.overrideAffinity', function() {
    const agentConfig = get(this, 'agentConfig') || {}
    const agentKey = get(this, 'agentKey')

    if (Object.keys(agentConfig).length){
      set(this.cluster, agentKey, agentConfig)
    } else if (this.cluster[agentKey]){
      delete this.cluster[agentKey]
    }
  }),

  agentConfig: computed('cluster', 'agentKey', function() {
    const agentKey = get(this, 'agentKey')

    return get(this.cluster, agentKey) || {}
  }),

  overrideResourceRequirements: computed('agentConfig.overrideResourceRequirements.{requests,limits}', {
    get(){
      return get(this, 'agentConfig.overrideResourceRequirements') || {}
    },
    set(key, val = {}){
      if (val.limits || val.requests){
        set(this, 'agentConfig.overrideResourceRequirements', val)
      } else if (this.agentConfig.overrideResourceRequirements){
        delete this.agentConfig.overrideResourceRequirements
        this.notifyPropertyChange('agentConfig')
      }


      return val
    }
  }),

  limits: computed('overrideResourceRequirements.limits', function() {
    return get(this, 'overrideResourceRequirements.limits') || {}
  }),

  requests: computed('overrideResourceRequirements.requests', function() {
    return get(this, 'overrideResourceRequirements.requests') || {}
  }),

  appendTolerations: computed('agentConfig.appendTolerations', {
    get(){
      return get(this, 'agentConfig.appendTolerations') || []
    },
    set(key, val = []){
      if (val.length){
        set(this, 'agentConfig.appendTolerations', val)
      } else if (this.agentConfig.appendTolerations){
        delete this.agentConfig.appendTolerations
        this.notifyPropertyChange('agentConfig')
      }

      return val
    },
  }),

  overrideAffinity: computed('agentConfig.overrideAffinity', {
    get(){
      return get(this, 'agentConfig.overrideAffinity') || {}
    },
    set(key, val){
      // TODO nb update agentConfig
      return val
    }
  }),

  updateResourceRequirement(type, val){
    const neu = { ...this.overrideResourceRequirements }

    if (val){
      neu[type] = val
    } else if (neu[type]){
      delete neu[type]
    }

    this.set('overrideResourceRequirements', neu)
  },

})