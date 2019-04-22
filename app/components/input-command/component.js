import { isArray } from '@ember/array';
import TextField from '@ember/component/text-field';
import layout from './template';
import { get, observer, set } from '@ember/object';

const ShellQuote = window.ShellQuote;

export const OPS = ['||', '&&', ';;', '|&', '&', ';', '(', ')', '|', '<', '>'];
export function reop(xs) {
  return xs.map((s) => {
    if ( OPS.includes(s) ) {
      return { op: s };
    } else {
      return s;
    }
  });
}

export function unparse(xs) {
  return xs.map((s) => {
    if (s && typeof s === 'object') {
      if (s.hasOwnProperty('pattern')) {
        return `"${  s.pattern  }"`;
      } else {
        return s.op;
      }
    } else if (/["\s]/.test(s) && !/'/.test(s)) {
      return `'${  s.replace(/(['\\])/g, '\\$1')  }'`;
    } else if (/["'\s]/.test(s)) {
      return `"${  s.replace(/(["\\$`!])/g, '\\$1')  }"`;
    } else {
      return String(s).replace(/([\\$`()!#&*|])/g, '\\$1');
    }
  }).join(' ');
}


export default TextField.extend({
  layout,
  type: 'text',

  disabled: false,

  init() {
    this._super(...arguments);

    let initial = get(this, 'initialValue') || '';

    if ( isArray(initial) ) {
      set(this, 'value', unparse(reop(initial)));
    } else {
      set(this, 'value', initial);
    }
  },

  valueChanged: observer('value', function() {
    let out = ShellQuote.parse(get(this, 'value') || '').map((piece) => {
      if ( typeof piece === 'object' && piece ) {
        if ( piece.pattern ) {
          return piece.pattern;
        } else if ( piece.op ) {
          return piece.op;
        } else {
          return '';
        }
      }

      return piece;
    });

    if ( out.length ) {
      if (this.changed) {
        this.changed(out);
      }
    } else {
      if (this.changed) {
        this.changed(null);
      }
    }
  }),
});
