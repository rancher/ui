import { next, throttle, cancel } from '@ember/runloop';
import $ from 'jquery';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  boundResize:    null,
  throttleTimer:  null,
  resizeInterval: 200,

  init() {
    this._super(...arguments);
    this.set('boundResize', this.triggerResize.bind(this));
    $(window).on('resize', this.get('boundResize'));
    $(window).on('focus', this.get('boundResize'));
    next(this, 'onResize');
  },

  triggerResize() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    var timer = throttle(this, 'onResize', this.get('resizeInterval'), false);

    this.set('throttleTimer', timer);
  },

  onResize() {
    // Override me with resize logic
  },

  willDestroyElement() {
    this.stopResize();
  },

  stopResize() {
    cancel(this.get('throttleTimer'));
    $(window).off('resize', this.get('boundResize'));
    $(window).off('focus', this.get('boundResize'));
  },
});
