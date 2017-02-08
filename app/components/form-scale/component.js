import Ember from 'ember';

export default Ember.Component.extend({
  initialLabel:   null,
  initialScale:   null,
  editing:        false,

  userInput:      null,
  min:            1,
  max:            100,

  classNames: ['inline-form'],

  init() {
    this._super(...arguments);
    this.set('userInput', (this.get('initialScale')||1)+'');
  },

  actions: {
    increase() {
      this.set('userInput', Math.min(this.get('max'), this.get('asInteger')+1));
    },

    decrease() {
      this.set('userInput', Math.max(this.get('min'), this.get('asInteger')-1));
    }
  },

  asInteger: Ember.computed('userInput', function() {
    return parseInt(this.get('userInput'),10) || 0;
  }),

  scaleChanged: Ember.observer('asInteger', function() {
    this.sendAction('setScale', this.get('asInteger'));
  }),
});
