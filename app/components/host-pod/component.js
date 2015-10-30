import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import GroupedInstances from 'ui/mixins/grouped-instances';

export default Ember.Component.extend(ReadLabels, FasterLinksAndMenus, GroupedInstances, {
  model: null,
  mode: null,

  labelResource: Ember.computed.alias('model'),
  classNames: ['pod','host'],
  classNameBindings: ['stateBorder','isMachine:machine-host'],

  actions: {
    newContainer: function() {
      this.sendAction('newContainer', this.get('model.id'));
    },
  },

  arrangedInstances: function() {
    return (this.get('model.instances')||[]).sortBy('name','id');
  }.property('model.instances.@each.{name,id}'),

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
