import Ember from 'ember';

export default Ember.Component.extend({
  model: null,

  classNames: ['dot','hand'],
  classNameBindings: ['stateColor'],
  attributeBindings: ['tooltip'],

  tooltip: Ember.computed.alias('model.displayName'),

  click: function() {
    this.get('router').transitionTo('container', this.get('model.id'));
  },

  render: function (buffer) {
    buffer.push('<i class="'+ this.get('model.stateIcon') + ' ' + this.get('model.stateColor') + '"></i>');
  },

  stateChanged: function() {
    this.$('I')[0].className = this.get('model.stateIcon') + ' ' + this.get('model.stateColor');
  }.observes('model.{stateIcon,stateColor}')
});
