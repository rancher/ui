import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set, observer, computed } from '@ember/object'


// Remember the last value and use that for new one
var lastContainer = 'ubuntu:xenial';

export default Component.extend({
  scope: service(),

  layout,
  // Inputs
  initialValue: null,
  errors:       null,

  userInput: null,
  tagName:   '',
  value:     null,
  allPods:   null,

  init() {
    this._super(...arguments);
    set(this, 'allPods', get(this, 'store').all('pod'));

    let initial = get(this, 'initialValue') || '';

    if ( !initial ) {
      initial = lastContainer;
    }

    scheduleOnce('afterRender', () => {
      this.send('setInput', initial);
      this.userInputDidChange();
    });
  },

  actions: {
    setInput(str) {
      set(this, 'userInput', str);
    },
  },

  userInputDidChange: observer('userInput', function() {
    var input = (get(this, 'userInput') || '').trim();
    var out;

    if ( input && input.length ) {
      lastContainer = input;
      out = input;
    } else {
      out = null;
    }

    set(this, 'value', out);

    if (this.changed) {
      this.changed(out);
    }

    this.validate();
  }),

  suggestions: computed('allPods.@each.containers', function() {
    let inUse = [];

    get(this, 'allPods').forEach((pod) => {
      inUse.addObjects(pod.get('containers') || []);
    });

    inUse = inUse.map((obj) => (obj.get('image') || ''))
      .filter((str) => !str.includes('sha256:') && !str.startsWith('rancher/'))
      .uniq()
      .sort();

    return { 'Used by other containers': inUse, };
  }),

  validate() {
    var errors = [];

    if ( !get(this, 'value') ) {
      errors.push('Image is required');
    }

    set(this, 'errors', errors);
  },

});
