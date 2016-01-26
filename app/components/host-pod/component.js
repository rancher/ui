import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import GroupedInstances from 'ui/mixins/grouped-instances';

export default Ember.Component.extend(ManageLabels, FasterLinksAndMenus, GroupedInstances, {
  model: null,
  mode: null,

  classNames: ['pod','host'],
  classNameBindings: ['isMachine:machine-host'],

  didInitAttrs() {
    this.initLabels(this.get('model.labels'));
  },

  actions: {
    newContainer() {
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

});
