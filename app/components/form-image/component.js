import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

// Remember the last value and use that for new one
var last = 'ubuntu:14.04.3';

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  initialValue: null,
  errors: null,

  userInput: null,
  tagName: '',

  pullImage: null,

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'), null, C.LABEL.PULL_IMAGE);

    var pull = !!this.getLabel(C.LABEL.PULL_IMAGE);
    this.set('pullImage', pull);

    var initial;
    if ( this.get('initialValue') )
    {
      initial = (this.get('initialValue')||'').replace(/^docker:/,'');
    }

    if ( !initial )
    {
      initial = last;
    }

    this.set('userInput', initial);
    this.userInputDidChange();
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  pullImageDidChange: function() {
    if ( this.get('pullImage') )
    {
      this.setLabel(C.LABEL.PULL_IMAGE, C.LABEL.PULL_IMAGE_VALUE);
    }
    else
    {
      this.removeLabel(C.LABEL.PULL_IMAGE);
    }
  }.observes('pullImage'),

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

    this.sendAction('changed', out);
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
