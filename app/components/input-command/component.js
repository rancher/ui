import Ember from 'ember';
import ShellQuote from 'npm:shell-quote';

export default Ember.TextField.extend({
  type: 'text',

  didInitAttrs() {
    var initial = this.get('initialValue')||'';
    if ( Ember.isArray(initial) )
    {
      this.set('value', ShellQuote.quote(initial));
    }
    else
    {
      this.set('value', initial);
    }
  },

  valueChanged: function() {
    var out = ShellQuote.parse(this.get('value')||'').map(function(piece) {
      if ( typeof piece === 'object' && piece && piece.op )
      {
        return piece.op;
      }
      else
      {
        return piece;
      }
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
