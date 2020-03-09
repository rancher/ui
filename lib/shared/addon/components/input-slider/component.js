import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { computed, observer, get, set } from '@ember/object';
import $ from 'jquery';

function clientX(event) {
  if ( typeof event.clientX !== 'undefined' ) {
    return event.clientX;
  }

  var orig = event.originalEvent;

  if ( orig ) {
    if ( typeof orig.clientX !== 'undefined' ) {
      return orig.clientX;
    }

    if ( orig.touches && orig.touches.length ) {
      return orig.touches[0].clientX;
    }
  }

  return 0;
}

export default Component.extend({
  layout,
  classNames:        ['slider'],
  classNameBindings: ['disabled', 'active'],

  disabled:          false,
  initialValue:      null,
  value:             null,  // Bind something to this to get the value, or use the action to get it
  valueMin:          0,  // The smallest and biggest value is allowed to be
  valueMax:          100,
  scaleMin:          null, // The smallest and biggest values shown on the display.  If these are not equal to valueMin/max then there will be
  scaleMax:          null, // a part of the slider that the user can't select, e.g. if you want to show 0 but have a minimum value of 1.
  step:              1, // Increment

  active:            false,
  dragFn:            null,
  upFn:              null,

  init() {
    this._super(...arguments);

    var initial = get(this, 'initialValue');

    if ( initial !== null ) {
      set(this, 'value', initial);
    }
  },

  didInsertElement() {
    scheduleOnce('afterRender', this, 'valueChanged');
  },

  willDestroyElement() {
    $('BODY').off('mousemove', get(this, 'dragFn')); // eslint-disable-line
    $('BODY').off('mouseup', get(this, 'upFn')); // eslint-disable-line
  },

  valueChanged: observer('value', 'valueMin', 'valueMax', 'percent', 'elementId', function() {
    const { elementId }    = this
    const originalValue    = get(this, 'value');
    let targetSliderBar    = elementId ? `.${ elementId }.slider-bar` : '.slider-bar';
    let targetSliderHandle = elementId ? `.${ elementId }.slider-handle` : '.slider-handle';
    let value              = Math.max(get(this, 'valueMin'), Math.min(originalValue, get(this, 'valueMax')));

    if ( isNaN(value) ) {
      value = get(this, 'valueMin');
    }

    if (this.changed) {
      this.changed(value);
    }

    if ( value && originalValue !== value ) {
      set(this, 'value', value);

      return;
    }

    var percent = get(this, 'percent');

    $(targetSliderBar).css('width', `${ percent }%`); // eslint-disable-line
    $(targetSliderHandle).css('left', `${ percent }%`); // eslint-disable-line
  }),


  _scaleMin: computed('scaleMin', 'valueMin', function() {
    var min = get(this, 'scaleMin');

    if ( min === null ) {
      min = get(this, 'valueMin');
    }

    return min;
  }),

  _scaleMax: computed('scaleMax', 'valueMax', function() {
    var min = get(this, 'scaleMax');

    if ( min === null ) {
      min = get(this, 'valueMax');
    }

    return min;
  }),

  percent: computed('value', 'valueMin', 'valueMax', '_scaleMin', '_scaleMax', function() {
    var cur = get(this, 'value');
    var min = Math.min(get(this, '_scaleMin'), get(this, 'valueMin'));
    var max = Math.max(get(this, '_scaleMax'), get(this, 'valueMax'));

    return  (((cur - min) / (max - min)) * 100).toFixed(3);
  }),

  alignValue(val) {
    var step = get(this, 'step');
    var min = get(this, 'valueMin');
    var max = get(this, 'valueMax');

    // Subtract out the minimum so that modulus will work for
    // determining how close val is to a valid step
    val -= min;

    var diff = val % step;

    if ( diff >= step / 2 ) {
      val = val - diff + step;
    } else if ( diff > 0 ) {
      val = val - diff;
    }

    // Add the minimum back in
    val += min;

    // Make sure the value is within range
    // (if `max` is not an increment of `step` it's your problem..)
    val = Math.max(min, Math.min(val, max));

    return val;
  },

  pointToValue(screenX) {
    var $elem    = $(this.element);
    var offset   = $elem.offset();
    var width    = $elem.outerWidth();

    var x        = screenX - offset.left;
    var percent  = Math.max(0, Math.min(x / width, 1));
    var min      = get(this, '_scaleMin');
    var max      = get(this, '_scaleMax');

    var rawValue = min + (percent * (max - min));
    var aligned  = this.alignValue(rawValue);

    return aligned;
  },

  click(event) {
    if ( get(this, 'disabled') ) {
      return false;
    }

    var value = this.pointToValue(clientX(event));

    set(this, 'value', value);

    $('.slider-handle').focus();
  },

  mouseDown(event) {
    if ( get(this, 'disabled') ) {
      return false;
    }

    set(this, 'active', true);

    if ( !get(this, 'dragFn') ) {
      set(this, 'dragFn', this.drag.bind(this));
    }

    if ( !get(this, 'upFn') ) {
      set(this, 'upFn', this.mouseUp.bind(this));
    }

    $('BODY').on('mousemove', get(this, 'dragFn')); // eslint-disable-line
    $('BODY').on('mouseup', get(this, 'upFn')); // eslint-disable-line

    this.drag(event);
  },

  drag(event) {
    event.preventDefault();

    if ( get(this, 'disabled') ) {
      return false;
    }

    var value = this.pointToValue(clientX(event));

    set(this, 'value', value);
  },

  mouseUp(/* event*/) {
    $('BODY').off('mousemove', get(this, 'dragFn')); // eslint-disable-line
    $('BODY').off('mouseup', get(this, 'upFn')); // eslint-disable-line

    set(this, 'active', false);
  },

  keyDown(event) {
    var handled = false;

    switch ( event.which ) {
    case C.KEY.LEFT:
      this.decrementProperty('value', get(this, 'step'));
      handled = true;
      break;
    case C.KEY.RIGHT:
      this.incrementProperty('value', get(this, 'step'));
      handled = true;
      break;
    case C.KEY.UP:
      set(this, 'value', get(this, 'valueMax'));
      handled = true;
      break;
    case C.KEY.DOWN:
      set(this, 'value', get(this, 'valueMin'));
      handled = true;
      break;
    }

    if ( handled ) {
      event.preventDefault();
    }
  },

});
