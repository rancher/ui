import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  currentController: null,
  label: 'Add',

  classNames: ['subpod','add-to-pod'],
  classNameBindings: ['groupHasChildren:subpod-full-width:subpod-half-width'],

  click: function() {
    this.sendAction();
  }
});
