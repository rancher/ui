import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  tagName: 'I',

  classNames: ['dot','hand'],
  classNameBindings: ['model.stateColor','model.stateIcon'],
  attributeBindings: ['tooltip'],

  tooltip: Ember.computed.alias('model.displayName'),

  click: function() {
    this.get('router').transitionTo('container', this.get('model.id'));
  },
});
