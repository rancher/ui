
import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['pod','resource-action-hover'],
  classNameBindings: ['stateBorder'],

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),
});
