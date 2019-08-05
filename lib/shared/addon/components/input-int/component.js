import { set, get } from '@ember/object';
import layout from './template';
import InputInteger from 'shared/components/input-integer/component';
import { sanitize } from 'shared/components/input-integer/component';

export default InputInteger.extend({
  layout,

  _elementValueDidChange() {
    let val = this.element.value;
    let cur = val;

    val = sanitize(val);

    let num = parseInt(val, 10);
    let max = parseInt(get(this, 'max'), 10);
    let min = parseInt(get(this, 'min'), 10);

    if ( !isNaN(num) && !isNaN(max) && num > max ) {
      val = `${ max }`;
    }

    if ( !isNaN(min) && (isNaN(num) || num < min ) ) {
      val = `${ min }`;
    }

    if ( cur !== val ) {
      this.element.value = val;
    }

    set(this, 'value', val && parseInt(val, 10))
  },
});
