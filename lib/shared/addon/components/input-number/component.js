import { computed } from '@ember/object';
import TextField from '@ember/component/text-field';
import { isMobile } from 'ui/utils/platform';
import layout from './template';

function sanitize(val) {
  val = (`${ val }`).trim().replace(/[^0-9.-]/g, '');
  val = val.substr(0, 1) + val.substr(1).replace('-', '');
  let idx = val.indexOf('.');

  if ( idx >= 0) {
    let idx2 = val.indexOf('.', idx + 1);

    if ( idx2 >= 0) {
      val = val.substr(0, idx2);
    }
  }

  if ( idx === 0 ) {
    val = `0${  val }`;
  }

  return val;
}

export default TextField.extend({
  layout,
  attributeBindings: ['pattern', 'inputmode'],
  pattern:           '[0-9]*(\.[0-9]*)?',
  inputmode:         'numeric',

  type: computed(() => {
    return ( isMobile ? 'number' : 'text' );
  }),

  _elementValueDidChange() {
    let val = this.element.value;
    let cur = val;

    val = sanitize(val);

    let num = parseFloat(val);
    let max = parseFloat(this.get('max'));

    if ( !isNaN(num) && !isNaN(max) && num > max ) {
      val = `${ max }`;
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

    let num = parseFloat(val);
    let min = parseFloat(this.get('min'));

    if ( !isNaN(num) && !isNaN(min) && num < min ) {
      val = `${ min }`;
    }

    if ( cur !== val ) {
      this.element.value = val;
      this.set('value', val);
    }
  }
});
