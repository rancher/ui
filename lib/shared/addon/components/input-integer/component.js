import Ember from 'ember';
import { isMobile } from 'ui/utils/platform';

function sanitize(val) {
  val = (val+'').trim().replace(/[^0-9-]/g,'');
  val = val.substr(0,1) + val.substr(1).replace('-','');
  return val;
}

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
    val = sanitize(val);

    let num = parseInt(val, 10);
    let max = parseInt(this.get('max'), 10);
    if ( !isNaN(num) && !isNaN(max) && num > max ) {
        val = ""+max;
    }

    if ( cur !== val ) {
      this.element.value = val;
    }
    this.set('value', val);
  },

  focusOut() {
    this._super(...arguments);

    let val = this.element.value;
    let cur = val;
    val = sanitize(val);

    let num = parseInt(val, 10);
    let min = parseInt(this.get('min'), 10);
    if ( !isNaN(num) && !isNaN(min) && num < min ) {
      val = ""+min;
    }

    if ( cur !== val ) {
      this.element.value = val;
      this.set('value', val);
    }
  }
});
