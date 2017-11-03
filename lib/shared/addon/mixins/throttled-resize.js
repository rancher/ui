import Ember from 'ember';

export default Ember.Mixin.create({
  boundResize: null,
  throttleTimer: null,
  resizeInterval: 200,

  init: function() {
    this._super(...arguments);
    this.set('boundResize', this.triggerResize.bind(this));
    Ember.$(window).on('resize', this.get('boundResize'));
    Ember.$(window).on('focus', this.get('boundResize'));
    Ember.run.next(this,'onResize');
  },

  triggerResize: function() {
    var timer = Ember.run.throttle(this, 'onResize', this.get('resizeInterval'), false);
    this.set('throttleTimer', timer);
  },

  onResize: function() {
    // Override me with resize logic
  },

  willDestroyElement: function() {
    Ember.run.cancel(this.get('throttleTimer'));
    Ember.$(window).off('resize', this.get('boundResize'));
    Ember.$(window).off('focus', this.get('boundResize'));
  },
});
