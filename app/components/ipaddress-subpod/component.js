import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['subpod','instance','resource-action-hover'],
  classNameBindings: ['model.isManaged:managed'],

  click: function() {
    // For touch devices, show actions on a click anywhere in the component
    if ( $('BODY').hasClass('touch') )
    {
      this.send('showActions');
    }
  },

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),
});
