import Ember from 'ember';

export default Ember.Component.extend({
  initialLabel:   null,
  initialScale:   null,
  editing:        false,
  min:            1,
  max:            100,
  mode:           'container',

  userInput:      null,
  showAdvanced:   false,
  sliderMax:      10,

  classNames: ['inline-form'],

  init() {
    this._super(...arguments);
    this.set('userInput', (this.get('initialScale')||1)+'');
    if ( this.get('mode') !== 'container' ) {
      this.set('showAdvanced', true);
    }
  },

  actions: {
    increase() {
      this.set('userInput', Math.min(this.get('max'), this.get('asInteger')+1));
    },

    decrease() {
      this.set('userInput', Math.max(this.get('min'), this.get('asInteger')-1));
    },

    showAdvanced() {
      this.set('showAdvanced', true);
    },
  },

  asInteger: Ember.computed('userInput', function() {
    return parseInt(this.get('userInput'),10) || 0;
  }),

  scaleChanged: Ember.observer('asInteger', function() {
    let cur = this.get('asInteger');
    this.sendAction('setScale', cur);

    this.set('sliderMax', Math.min(this.get('max'), Math.max(this.get('sliderMax'), Math.ceil(cur/10)*10)));
  }),
});
