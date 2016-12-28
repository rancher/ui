import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

// Remember the last value and use that for new one
var lastContainer = 'ubuntu:14.04.3';
var lastVm = 'rancher/vm-ubuntu';
var lastWindows = 'microsoft/nanoserver';

export default Ember.Component.extend(ManageLabels, {
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),

  // Inputs
  initialValue: null,
  errors: null,
  isVm: null,

  userInput: null,
  tagName: '',
  pullImage: null,
  value: null,

  actions: {
    setInput(str) {
      this.set('userInput', str);
    },
  },

  init() {
    this._super(...arguments);
    this.initLabels(this.get('initialLabels'), null, C.LABEL.PULL_IMAGE);

    var pull = this.getLabel(C.LABEL.PULL_IMAGE) === C.LABEL.PULL_IMAGE_VALUE;
    this.set('pullImage', pull);

    var initial;
    if ( this.get('initialValue') )
    {
      initial = (this.get('initialValue')||'').replace(/^docker:/,'');
    }

    if ( !initial )
    {
      if ( this.get('projects.current.isWindows') ) {
        initial = lastWindows;
      } else {
        initial = ( this.get('isVm') ? lastVm : lastContainer);
      }
    }

    Ember.run.scheduleOnce('afterRender', () => {
      this.set('userInput', initial);
      this.userInputDidChange();
    });
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
      this.removeLabel(C.LABEL.PULL_IMAGE, true);
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
      if ( this.get('projects.current.isWindows') ) {
        lastWindows = input;
      } else if ( this.get('isVm') )
      {
        lastVm = input;
      }
      else
      {
        lastContainer = input;
      }
      out += input;
    }
    else
    {
      out = null;
    }

    this.set('value', out);
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
