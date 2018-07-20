import { computed, observer } from '@ember/object';
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
    this.set('userInput', `${ this.get('initialScale') || 1 }`);
    this.set('sliderMax', newMax(this.get('asInteger'), this.get('sliderMax'), this.get('max')));
  },

  actions: {
    increase() {
      this.set('userInput', Math.min(this.get('max'), this.get('asInteger') + 1));
    },

    decrease() {
      this.set('userInput', Math.max(this.get('min'), this.get('asInteger') - 1));
    },

    showAdvanced() {
      this.set('advancedShown', true);
    },
  },

  scaleChanged: observer('asInteger', function() {
    let cur = this.get('asInteger');

    this.sendAction('setScale', cur);

    this.set('sliderMax', newMax(cur, this.get('sliderMax'), this.get('max')));
  }),
  asInteger: computed('userInput', function() {
    return parseInt(this.get('userInput'), 10) || 0;
  }),

});
