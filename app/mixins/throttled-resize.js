import Ember from 'ember';

export default Ember.Mixin.create({
  boundResize: null,

  didInsertElement: function() {
    this._super();

    this.set('boundResize', this.triggerResize.bind(this));
    $(window).on('resize', this.get('boundResize'));
    this.onResize();
  },

  triggerResize: function() {
    Ember.run.throttle(this, 'onResize', 200, false);
  },

  onResize: function() {
    // Override me with resize logic
  },

  willDestroyElement: function() {
    $(window).off('resize', this.get('boundResize'));
  },
});
