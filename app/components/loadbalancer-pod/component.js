import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['pod','loadbalancer','resource-action-hover'],
  classNameBindings: ['stateBorder'],

  actions: {
    newTarget: function() {
      this.get('model').send('newTarget');
    },
  },

  isActive: Ember.computed.equal('model.state','active'),
  showAdd: Ember.computed.alias('isActive'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  iconColor: function() {
    var color = this.get('model.stateColor');
    if ( color.indexOf('danger') >= 0 )
    {
      return color;
    }
  }.property('model.stateColor'),
});
