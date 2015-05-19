
import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['pod','project','resource-action-hover'],
  classNameBindings: ['stateBorder'],

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  instanceCount: function() {
    var count = 0;
    this.get('model.services').forEach((service) => {
      count += service.get('scale')||0;
    });

    return count;
  }.property('model.services.@each.scale'),
});
