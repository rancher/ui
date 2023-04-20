import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

import {
  computed,
  get,
  set,
  observer
} from '@ember/object';


import { isEqual } from '@ember/utils';


export default Component.extend({
  globalStore: service(),

  layout,

  mode:               'new',
  cluster:            {},
  // cluster or fleet agent deployment
  type:               'cluster',
  useDefaultAffinity: true,

  init(){
    this._super(...arguments);
    if ( this.overrideAffinity && !isEqual(this.defaultAffinity, this.overrideAffinity)){
      this.useDefaultAffinity = false
    }
  },

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
    }

  },

  agentObserver: observer('agentConfig.overrideResourceRequirements', 'agentConfig.appendTolerations', 'agentConfig.overrideAffinity', function() {
    const agentConfig = get(this, 'agentConfig') || {}
    const agentKey = get(this, 'agentKey')

    if (Object.keys(agentConfig).length){
      set(this.cluster, agentKey, agentConfig)
    } else if (this.cluster[agentKey]){
      delete this.cluster[agentKey]
    }
  }),

  useDefaultAffinityObserver: observer('useDefaultAffinity', function(){
    if (!this.useDefaultAffinity){
      this.set('overrideAffinity', this.defaultAffinity)
    } else {
      // default rules will be applied by BE if this field is empty
      this.set('overrideAffinity', null)
    }
  }),

  agentKey: computed('type', function(){
    return `${ this.type }AgentDeploymentConfiguration`
  }),

  defaultSettingId: computed('type', function(){
    return `${ this.type }-agent-default-affinity`
  }),

  editing:   computed('mode', function() {
    const mode = get(this, 'mode')

    return mode === 'new' || mode === 'edit'
  }),

  defaultAffinity: computed('defaultSettingId', function(){
    if (!this.defaultSettingId){
      return null
    }
    const setting =  this.globalStore.getById('setting', this.defaultSettingId)

    if (setting){
      try {
        const parsed = JSON.parse(setting.value)

        return parsed
      } catch (e){
        console.error('error parsing affinity default value: ', e)
      }
    }

    return null
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
      return get(this, 'agentConfig.overrideAffinity')
    },
    set(key, val){
      if (val){
        set(this.agentConfig, 'overrideAffinity', val)
      } else if (this.agentConfig?.overrideAffinity){
        delete this.agentConfig.overrideAffinity
        this.notifyPropertyChange('agentConfig')
      }

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