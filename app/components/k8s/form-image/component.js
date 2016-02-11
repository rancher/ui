import Ember from 'ember';

// Remember the last value and use that for new one
var lastImage = 'ubuntu:14.04.3';
var lastPull = '';

export default Ember.Component.extend({
  // Inputs
  initialImage: null,
  initialPull: null,

  image: null,
  pull: null,

  tagName: '',

  didInitAttrs() {
    this.set('image', this.get('initialImage') || lastImage);
    this.set('pull', this.get('initialPull') || lastPull);
    this.didChange();
  },

  didChange: function() {
    var image = (this.get('image')||'').trim();
    var pull = this.get('pull');

    lastImage= image;
    lastPull = pull;

    this.sendAction('changedImage', image);
    this.sendAction('changedPull', pull);
    this.validate();
  }.observes('image','pull'),

  validate() {
    var errors = [];
    if ( !this.get('image') )
    {
      errors.push('Image is required');
    }

    this.set('errors', errors);
  },
});
