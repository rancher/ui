import Ember from 'ember';
import ShellQuote from 'npm:shell-quote';

export const OPS = ['||','&&',';;','|&','&',';','(',')','|','<','>'];
export function reop(xs) {
  return xs.map(function(s) {
    if ( OPS.includes(s) ) {
      return {op: s};
    } else {
      return s;
    }
  });
}

export function unparse(xs) {
    return xs.map(function (s) {
        if (s && typeof s === 'object') {
            if (s.hasOwnProperty('pattern')) {
                return '"' + s.pattern + '"';
            } else {
                return s.op;
            }
        }
        else if (/["\s]/.test(s) && !/'/.test(s)) {
            return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        }
        else if (/["'\s]/.test(s)) {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
        }
        else {
            return String(s).replace(/([\\$`()!#&*|])/g, '\\$1');
        }
    }).join(' ');
}


export default Ember.TextField.extend({
  type: 'text',

  init() {
    this._super(...arguments);

    let initial = this.get('initialValue')||'';
    if ( Ember.isArray(initial) )
    {
      this.set('value', unparse(reop(initial)));
    }
    else
    {
      this.set('value', initial);
    }
  },

  valueChanged: function() {
    let out = ShellQuote.parse(this.get('value')||'').map(function(piece) {
      if ( typeof piece === 'object' && piece )
      {
        if ( piece.pattern )
        {
          return piece.pattern;
        }
        else if ( piece.op )
        {
          return piece.op;
        }
        else
        {
          return '';
        }
      }

      return piece;
    });

    if ( out.length )
    {
      this.sendAction('changed', out);
    }
    else
    {
      this.sendAction('changed', null);
    }
  }.observes('value'),
});
