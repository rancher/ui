import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['pod','service','resource-action-hover'],
  classNameBindings: ['stateBorder'],

  actions: {
    scaleUp: function() {
      this.get('model').send('scaleUp');
    }
  },

  isActive: function() {
    return ['active','degraded','updating-active'].indexOf(this.get('model.state')) >= 0;
  }.property('model.state'),

  isInactive: Ember.computed.equal('model.state','inactive'),
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
