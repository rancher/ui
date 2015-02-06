import Ember from 'ember';

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
  classNames: ['slider'],
  classNameBindings: ['disabled','active'],

  active: false,
  disabled: false,
  value: 0,
  valueMin: 0,
  valueMax: 100,
  step: 1,

  didInsertElement: function() {
    this._super();
  },

  percent: function() {
    var cur = this.get('value');
    var min = this.get('valueMin');
    var max = this.get('valueMax');
    return  (((cur-min)/(max-min))*100).toFixed(3);
  }.property('value','valueMin','valueMax'),

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
    var min = this.get('valueMin');
    var max = this.get('valueMax');

    var rawValue = min + (percent * (max-min));
    var aligned = this.alignValue(rawValue);
    return aligned;
  },

  click: function(event) {
    console.log('click',event);
    if ( this.get('disabled') )
    {
      return false;
    }

    var value = this.pointToValue(clientX(event));
    this.set('value', value);
  },

  dragStart: function(/*event*/) {
    console.log('drag start');
    if ( this.get('disabled') )
    {
      return false;
    }

    this.set('active',true);
  },

  drag: function(event) {
    console.log('drag');
    if ( this.get('disabled') )
    {
      return false;
    }

    var value = this.pointToValue(clientX(event));
    console.log('drag', clientX(event), value);

    this.set('value', value);

  },

  dragEnd: function(/*event*/) {
    console.log('drag end');
    this.set('active',false);

    if ( this.get('disabled') )
    {
      return false;
    }

  },

  valueChanged: function() {
    var percent = this.get('percent');
    this.$('.slider-bar').css('width', percent+'%');
    this.$('.slider-handle').css('left', percent+'%');
  }.observes('value','percent'),


});
