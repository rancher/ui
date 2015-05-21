import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['dot'],
  classNameBindings: ['stateColor'],
  attributeBindings: ['tooltip'],

  tooltip: Ember.computed.alias('model.displayName'),

  render: function (buffer) {
    buffer.push('<i class="'+ this.get('model.stateIcon') + ' fa ' + this.get('model.stateColor') + '"></i>');
  },

  stateChanged: function() {
      this.rerender();
  }.observes('model.{stateIcon,stateColor}')
});
