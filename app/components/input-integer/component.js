import Ember from 'ember';
import { isMobile } from 'ui/utils/platform';

export default Ember.TextField.extend({
  type: Ember.computed(function() {
    return ( isMobile ? 'number' : 'text' );
  }),

  attributeBindings: ['pattern','inputmode'],
  pattern:"[0-9]*",
  inputmode:"numeric",

  _elementValueDidChange: function () {
    let val = this.element.value;
    let cur = val;
    val = (val+'').trim().replace(/[^0-9]/g,'');

    val = val.replace(/\..*$/g,'');
    let num = parseInt(val, 10);
    let min = parseInt(this.get('min'), 10);
    let max = parseInt(this.get('max'), 10);
    if ( !isNaN(num) ) {
      if ( !isNaN(min) && num < min ) {
        val = ""+min;
      } else if ( !isNaN(max) && num > max ) {
        val = ""+max;
      }
    }

    if ( cur !== val ) {
      this.element.value = val;
    }
    this.set('value', val);
  }
});
