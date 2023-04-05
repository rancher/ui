import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
  set,
} from '@ember/object';

export default Component.extend({
  layout,

  mode:   'new',
  // TODO nb pass in fleet/cluster agent config
  config: {},

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

  overrideResourceRequirements: computed('config.overrideResourceRequirements.{requests,limits}', {
    get(){
      return get(this, 'config.overrideResourceRequirements') || {}
    },
    set(key, val){
      if ((!val?.limits && !val?.requests) && get(this.config, 'overrideResourceRequirements')){
        delete this.config.overrideResourceRequirements
      } else {
        set(this, 'config.overrideResourceRequirements', val)
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