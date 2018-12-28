import Component from '@ember/component';
import { observer } from '@ember/object'
import layout from './template';
import C from 'ui/utils/constants';

export default Component.extend({
  layout,

  tolerate:        null,
  title:           null,
  tolerationArray: null,
  init() {
    this._super(...arguments);
    this.initTolerationArray();
  },

  actions: {
    addToleration() {
      this.get('tolerationArray').pushObject({
        key:               '',
        operator:          '',
        value:             '',
        effct:             '',
        tolerationSeconds: '',
      });
    },

    removeToleration(rule) {
      this.get('tolerationArray').removeObject(rule);
    },
  },

  inputChanged:    observer('tolerationArray.@each.{key,value,operator,effct,tolerationSeconds}', function() {
    this.set('tolerate', this.get('tolerationArray')
      .filter((t) => this.isTolerationValid(t))
      .map((t) => this.convertToleration(t)));
  }),

  initTolerationArray() {
    const tolerate = this.get('tolerate') || [];

    this.set('tolerationArray', tolerate);
  },

  isTolerationValid(toleration) {
    if (toleration.operator === 'Equal') {
      return toleration.key && toleration.value;
    } else if (toleration.operator === 'Exists') {
      return toleration.key;
    } else {
      return toleration.effct;
    }
  },

  convertToleration(toleration) {
    const result = {};

    Object.keys(toleration).forEach((key) => {
      if (toleration[key]) {
        result[key] = toleration[key];
      }
    });
    if (result.tolerationSeconds) {
      result.tolerationSeconds = parseInt(result.tolerationSeconds, 10);
    }
    if (result.operator === 'Exists') {
      delete result['value'];
    }

    return result;
  },
  operatorChoices: C.SCHED_TOLERATION_OPERATOR,
  effectChoices:   C.SCHED_TOLERATION_EFFECT,

})
