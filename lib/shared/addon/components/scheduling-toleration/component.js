import Component from '@ember/component';
import { observer } from '@ember/object'
import layout from './template';
const operatorChoices = ['Equals', 'Exists'];
const effectChoices = ['NoSchedule', 'NoExecute'];

export default Component.extend({
  layout,

  tolerate: null,
  title: null,
  tolerationArray: null,
  operatorChoices: null,
  effectChoices: null,

  init() {
    this._super(...arguments);
    this.initTolerationArray();
    this.initOperatorChoices();
    this.initEffectChoices();
  },

  actions: {
    addToleration(custom) {
      this.get('tolerationArray').pushObject({
        key: '',
        operator: '',
        value: '',
        effct: '',
        tolerationSeconds: '',
      });
    },

    removeToleration(rule) {
      this.get('tolerationArray').removeObject(rule);
    },
  },

  initTolerationArray() {
    const tolerate = this.get('tolerate') || [];
    this.set('tolerationArray', tolerate);
  },

  initOperatorChoices() {
    const choices = operatorChoices.map(operator => {
      return {
        label: operator,
        value: operator,
      };
    });
    this.set('operatorChoices', choices);
  },

  initEffectChoices() {
    const choices = effectChoices.map(effect => {
      return {
        label: effect,
        value: effect,
      };
    });
    this.set('effectChoices', choices);
  },

  inputChanged: observer('tolerationArray.@each.{key,value,operator,effct,tolerationSeconds}', function () {
    this.set('tolerate', this.get('tolerationArray')
      .filter(t => this.isTolerationValid(t))
      .map(t => this.convertToleration(t)));
  }),

  isTolerationValid(toleration) {
    if (toleration.operator === 'Equals') {
      return toleration.key && toleration.value;
    } else if (toleration.operator === 'Exists') {
      return toleration.key;
    } else {
      return toleration.effct;
    }
  },

  convertToleration(toleration) {
    const result = {};
    Object.keys(toleration).forEach(key => {
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
})
