import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  currentController: null,

  classNames: ['instance','add-container'],

  click: function() {
    this.sendAction();
  }
});
