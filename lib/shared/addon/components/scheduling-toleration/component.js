import Component from '@ember/component';
import { get, observer, set } from '@ember/object'
import layout from './template';
import C from 'ui/utils/constants';

const DEFAULT_OPERATOR = 'Equal'
const DEFAULT_EFFECT = 'NoSchedule'

export default Component.extend({
  layout,

  tolerate:        null,
  editing:         true,
  title:           null,
  tolerationArray: null,
  init() {
    this._super(...arguments);
    this.initTolerationArray();
  },

  actions: {
    addToleration() {
      get(this, 'tolerationArray').pushObject({
        key:               '',
        operator:          DEFAULT_OPERATOR,
        value:             '',
        effect:            DEFAULT_EFFECT,
        tolerationSeconds: '',
      });
    },

    removeToleration(rule) {
      get(this, 'tolerationArray').removeObject(rule);
    },
  },

  inputChanged: observer('tolerationArray.@each.{key,value,operator,effect,tolerationSeconds}', function() {
    set(this, 'tolerate', get(this, 'tolerationArray')
      .filter((t) => this.isTolerationValid(t))
      .map((t) => this.convertToleration(t)));
  }),

  initTolerationArray() {
    const tolerate = get(this, 'tolerate') || [];

    set(this, 'tolerationArray', tolerate);
  },

  isTolerationValid(toleration) {
    if (toleration.operator === 'Equal') {
      return toleration.key && toleration.value;
    } else if (toleration.operator === 'Exists') {
      return true;
    } else {
      return toleration.effect;
    }
  },

  convertToleration(toleration) {
    const result = {};

    Object.keys(toleration).forEach((key) => {
      if (toleration[key]) {
        result[key] = toleration[key];
      }
    });

    if (result.effect !== 'NoExecute') {
      delete result['tolerationSeconds'];
    }

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
