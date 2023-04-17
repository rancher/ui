import Component from '@ember/component';
import layout from './template';
import { priorityOptions } from '../form-pod-affinity-term-k8s/component';

export default Component.extend({
  layout,

  value: null,
  mode:  'new',

  priorityOptions,

  actions:   {
    removeTerm(){
      if (this.remove){
        this.remove()
      }
    }
  },

})