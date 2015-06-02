import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';

export default Ember.Component.extend(ReadLabels,{
  model: null,
  labelResource: Ember.computed.alias('model'),
  classNames: ['pod','host','resource-action-hover'],
  classNameBindings: ['stateBorder','isMachine:machine-host'],

  actions: {
    newContainer: function() {
      this.get('model').send('newContainer');
    },
  },

  isMachine: Ember.computed.equal('model.type','machine'),
  isActive: Ember.computed.equal('model.state','active'),

  showAdd: function() {
    return this.get('isActive') && !this.get('isMachine');
  }.property('isActive','isMachine'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),
});
