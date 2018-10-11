import { isArray } from '@ember/array';
import TextField from '@ember/component/text-field';
import layout from './template';

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

  init() {
    this._super(...arguments);

    let initial = this.get('initialValue') || '';

    if ( isArray(initial) ) {
      this.set('value', unparse(reop(initial)));
    } else {
      this.set('value', initial);
    }
  },

  valueChanged: function() {
    let out = ShellQuote.parse(this.get('value') || '').map((piece) => {
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
      this.sendAction('changed', out);
    } else {
      this.sendAction('changed', null);
    }
  }.observes('value'),
});
