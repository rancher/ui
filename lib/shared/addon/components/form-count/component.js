import { get, set, computed, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

function newMax(val, curMax, absoluteMax) {
  return Math.min(absoluteMax, Math.max(curMax, Math.ceil(val / 10) * 10));
}

export default Component.extend({
  layout,
  initialScale: null,
  min:          1,
  max:          100,

  userInput:      null,
  sliderMax:      10,

  init() {
    this._super(...arguments);
    set(this, 'userInput', `${ get(this, 'initialScale') || 1 }`);
    set(this, 'sliderMax', newMax(get(this, 'asInteger'), get(this, 'sliderMax'), get(this, 'max')));
  },

  actions: {
    increase() {
      set(this, 'userInput', Math.min(get(this, 'max'), get(this, 'asInteger') + 1));
    },

    decrease() {
      set(this, 'userInput', Math.max(get(this, 'min'), get(this, 'asInteger') - 1));
    },

    showAdvanced() {
      set(this, 'advancedShown', true);
    },
  },

  scaleChanged: observer('asInteger', function() {
    let cur = get(this, 'asInteger');

    if (this.setScale) {
      this.setScale(cur);
    }

    set(this, 'sliderMax', newMax(cur, get(this, 'sliderMax'), get(this, 'max')));
  }),
  asInteger: computed('userInput', function() {
    return parseInt(get(this, 'userInput'), 10) || 0;
  }),

});
