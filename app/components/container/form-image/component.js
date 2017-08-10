import Ember from 'ember';

// Remember the last value and use that for new one
var lastContainer = 'ubuntu:xenial';
var lastWindows = 'microsoft/nanoserver';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  // Inputs
  initialValue: null,
  errors: null,

  userInput: null,
  tagName: '',
  value: null,
  allContainers: null,

  actions: {
    setInput(str) {
      this.set('userInput', str);
    },
  },

  init() {
    this._super(...arguments);
    this.set('allContainers', this.get('store').all('container'));

    var initial;
    if ( this.get('initialValue') )
    {
      initial = this.get('initialValue')||'';
    }

    if ( !initial )
    {
      if ( this.get('projects.current.isWindows') ) {
        initial = lastWindows;
      } else {
        initial = lastContainer;
      }
    }

    Ember.run.scheduleOnce('afterRender', () => {
      this.send('setInput', initial);
      this.userInputDidChange();
    });
  },

  userInputDidChange: function() {
    var input = (this.get('userInput')||'').trim();
    var out;

    if ( input && input.length )
    {
      if ( this.get('projects.current.isWindows') ) {
        lastWindows = input;
      } else {
        lastContainer = input;
      }
      out = input;
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

  suggestions: function() {
    let inUse = this.get('allContainers')
      .map((obj) => (obj.get('image')||''))
      .filter((str) => !str.includes('sha256:') && !str.startsWith('rancher/'))
      .uniq()
      .sort();

    return {
      'Used by other containers': inUse,
    };
  }.property('allContainers.@each.image'),

});
