import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['dot'],
  classNameBindings: ['stateColor'],

  render: function (buffer) {
    buffer.push('<i class="fa '+ this.get('context.stateIcon') + ' ' + this.get('context.stateColor') + '"></i>');
  },

  stateChanged: function() {
      this.rerender();
  }.observes('context.{stateIcon,stateColor}')
});
