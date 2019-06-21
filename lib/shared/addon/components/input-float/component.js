import { get } from '@ember/object';
import InputNumber from '../input-number/component'

export default InputNumber.extend({
  _elementValueDidChange() {
    let val = this.element.value;
    let cur = val;

    val = this.sanitize(val);

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

  sanitize(val) {
    val = (`${ val }`).trim().replace(/[^0-9.-]/g, '');
    val = val.substr(0, 1) + val.substr(1).replace('-', '');
    let idx = val.indexOf('.');

    if ( idx >= 0) {
      let idx2 = val.indexOf('.', idx + 1);

      if ( idx2 >= 0) {
        val = val.substr(0, idx2);
      }

      val = val.substr(0, idx + 1 + get(this, 'precision'))
    }

    if ( idx === 0 ) {
      val = `0${  val }`;
    }

    return val;
  }
});
