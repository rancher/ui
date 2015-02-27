import Ember from 'ember';

export default Ember.Mixin.create({
  boundResize: null,
  throttleTimer: null,

  didInsertElement: function() {
    this._super();

    this.set('boundResize', this.triggerResize.bind(this));
    $(window).on('resize', this.get('boundResize'));
    $(window).on('focus', this.get('boundResize'));
    Ember.run.next(this,'onResize');
  },

  triggerResize: function() {
    var timer = Ember.run.throttle(this, 'onResize', 200, false);
    this.set('throttleTimer', timer);
  },

  onResize: function() {
    // Override me with resize logic
  },

  willDestroyElement: function() {
    Ember.run.cancel(this.get('throttleTimer'));
    $(window).off('resize', this.get('boundResize'));
    $(window).off('focus', this.get('boundResize'));
  },
});
