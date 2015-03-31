import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  currentController: null,
  label: 'Add',

  classNames: ['subpod','add-to-pod'],

  click: function() {
    this.sendAction();
  }
});
