import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['subpod','instance','resource-action-hover'],
  classNameBindings: ['model.isManaged:managed'],

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),
});
