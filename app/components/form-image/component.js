import Ember from 'ember';

// Remember the last value and use that for new one
var last = 'ubuntu:14.04.3';

export default Ember.Component.extend({
  // Inputs
  value: null,
  errors: null,

  userInput: null,
  tagName: '',

  didInitAttrs() {
    var initial;
    if ( this.get('value') )
    {
      initial = (this.get('value')||'').replace(/^docker:/,'');
    }

    if ( !initial )
    {
      initial = last;
    }

    this.set('userInput', initial);
    this.userInputDidChange();
  },

  userInputDidChange: function() {
    var input = (this.get('userInput')||'').trim();
    var out = 'docker:';

    // Look for a redundant docker: pasted in
    if ( input.indexOf(out) === 0 )
    {
      out = input;
    }
    else if ( input && input.length )
    {
      last = input;
      out += input;
    }
    else
    {
      out = null;
    }

    this.set('value', out);
    this.validate();
  }.observes('userInput'),

  validate() {
    var errors = [];
    if ( !this.get('value') )
    {
      errors.push('Image is required');
    }

    this.set('errors', errors);
  },
});
