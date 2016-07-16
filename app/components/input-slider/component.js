import Ember from 'ember';
import C from 'ui/utils/constants';

function clientX(event) {
  if ( typeof event.clientX !== 'undefined' )
  {
    return event.clientX;
  }

  var orig = event.originalEvent;
  if ( orig )
  {
    if ( typeof orig.clientX !== 'undefined' )
    {
      return orig.clientX;
    }

    if ( orig.touches && orig.touches.length )
    {
      return orig.touches[0].clientX;
    }
  }

  return 0;
}

export default Ember.Component.extend({
  classNames        : ['slider'],
  classNameBindings : ['disabled','active'],

  disabled          : false,
  initialValue      : null,
  value             : null,  // Bind something to this to get the value, or use the action to get it
  valueMin          : 0,  // The smallest and biggest value is allowed to be
  valueMax          : 100,
  scaleMin          : null, // The smallest and biggest values shown on the display.  If these are not equal to valueMin/max then there will be
  scaleMax          : null, // a part of the slider that the user can't select, e.g. if you want to show 0 but have a minimum value of 1.
  step              : 1, // Increment

  active            : false,
  dragFn            : null,
  upFn              : null,

  init() {
    this._super(...arguments);

    var initial = this.get('initialValue');
    if ( initial !== null )
    {
      this.set('value', initial);
    }
  },

  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, 'valueChanged');
  },

  willDestroyElement: function() {
    $('BODY').off('mousemove', this.get('dragFn'));
    $('BODY').off('mouseup', this.get('upFn'));
  },

  _scaleMin: function() {
    var min = this.get('scaleMin');
    if ( min === null )
    {
      min = this.get('valueMin');
    }

    return min;
  }.property('scaleMin','valueMin'),

  _scaleMax: function() {
    var min = this.get('scaleMax');
    if ( min === null )
    {
      min = this.get('valueMax');
    }

    return min;
  }.property('scaleMax','valueMax'),

  percent: function() {
    var cur = this.get('value');
    var min = Math.min(this.get('_scaleMin'), this.get('valueMin'));
    var max = Math.max(this.get('_scaleMax'), this.get('valueMax'));
    return  (((cur-min)/(max-min))*100).toFixed(3);
  }.property('value','valueMin','valueMax','_scaleMin','_scaleMax'),

  alignValue: function(val) {
    var step = this.get('step');
    var min = this.get('valueMin');
    var max = this.get('valueMax');

    // Subtract out the minimum so that modulus will work for
    // determining how close val is to a valid step
    val -= min;

    var diff = val % step;
    if ( diff >= step/2 )
    {
      val = val - diff + step;
    }
    else if ( diff > 0 )
    {
      val = val - diff;
    }

    // Add the minimum back in
    val += min;

    // Make sure the value is within range
    // (if `max` is not an increment of `step` it's your problem..)
    val = Math.max(min, Math.min(val, max));

    return val;
  },

  pointToValue: function(screenX) {
    var $elem = this.$();
    var offset = $elem.offset();
    var width = $elem.outerWidth();

    var x = screenX - offset.left;
    var percent = Math.max(0, Math.min(x/width , 1));
    var min = this.get('_scaleMin');
    var max = this.get('_scaleMax');

    var rawValue = min + (percent * (max-min));
    var aligned = this.alignValue(rawValue);
    return aligned;
  },

  click: function(event) {
    if ( this.get('disabled') )
    {
      return false;
    }

    var value = this.pointToValue(clientX(event));
    this.set('value', value);
    this.$('.slider-handle').focus();
  },

  mouseDown: function(event) {
    if ( this.get('disabled') )
    {
      return false;
    }

    this.set('active',true);
    if ( !this.get('dragFn') )
    {
      this.set('dragFn', this.drag.bind(this));
    }

    if ( !this.get('upFn') )
    {
      this.set('upFn', this.mouseUp.bind(this));
    }

    $('BODY').on('mousemove', this.get('dragFn'));
    $('BODY').on('mouseup', this.get('upFn'));
    this.drag(event);
  },

  drag: function(event) {
    event.preventDefault();
    if ( this.get('disabled') )
    {
      return false;
    }

    var value = this.pointToValue(clientX(event));
    this.set('value', value);
  },

  mouseUp: function(/*event*/) {
    $('BODY').off('mousemove', this.get('dragFn'));
    $('BODY').off('mouseup', this.get('upFn'));
    this.set('active',false);
  },

  keyDown: function(event) {
    var handled = false;
    switch ( event.which )
    {
      case C.KEY.LEFT:
        this.decrementProperty('value', this.get('step'));
        handled = true;
        break;
      case C.KEY.RIGHT:
        this.incrementProperty('value', this.get('step'));
        handled = true;
        break;
      case C.KEY.UP:
        this.set('value', this.get('valueMax'));
        handled = true;
        break;
      case C.KEY.DOWN:
        this.set('value', this.get('valueMin'));
        handled = true;
        break;
    }

    if ( handled )
    {
      event.preventDefault();
    }
  },

  valueChanged: function() {
    var orig = this.get('value');
    var value = Math.max(this.get('valueMin'), Math.min(orig, this.get('valueMax')));
    if ( isNaN(value) )
    {
      value = this.get('valueMin');
    }

    this.sendAction('changed',value);

    if ( value && orig !== value )
    {
      this.set('value', value);
      return;
    }

    var percent = this.get('percent');
    this.$('.slider-bar').css('width', percent+'%');
    this.$('.slider-handle').css('left', percent+'%');
  }.observes('value','valueMin','valueMax','percent'),


});
