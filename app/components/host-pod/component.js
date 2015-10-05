import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ReadLabels,{
  model: null,
  mode: null,

  labelResource: Ember.computed.alias('model'),
  classNames: ['pod','host','resource-action-hover'],
  classNameBindings: ['stateBorder','isMachine:machine-host'],

  actions: {
    newContainer: function() {
      this.sendAction('newContainer', this.get('model.id'));
    },
  },

  arrangedInstances: function() {
    return (this.get('model.instances')||[]).sortBy('name','id');
  }.property('model.instances.@each.{name,id}'),

  groupedInstances: function() {
    var groups = [];
    // Everything must be sorted first to guarantee that parents appear before sidekicks
    (this.get('model.instances')||[]).sortBy('name','id').forEach((instance) => {
      var labels = instance.get('labels')||{};
      var isSidekick = !!labels[C.LABEL.LAUNCH_CONFIG] && labels[C.LABEL.LAUNCH_CONFIG] !== C.LABEL.LAUNCH_CONFIG_PRIMARY;
      var parentUnit = labels[C.LABEL.DEPLOYMENT_UNIT];
      var groupName = (instance.get('labels')||{})[C.LABEL.PROJECT_NAME] || '';
      var entry, group;

      if ( isSidekick && parentUnit )
      {
        group = groups.filterBy('name', groupName)[0];
        if ( group )
        {
          entry = group.instances.filterBy('unit', parentUnit)[0];
          if ( entry )
          {
            entry.children.push(instance);
            group.hasChildren = true;
          }
        }
      }
      else
      {
        group = groups.filterBy('name', groupName)[0];
        if ( !group )
        {
          group = { name: groupName, instances: [], hasChildren: false };
          groups.push(group);
        }

        group.instances.push({unit: parentUnit, main: instance, children: []});
      }
    });

    groups = groups.sortBy('name');
    if ( groups[0] && groups[0].name === '' )
    {
      // Move no name to the end of the list instead of the beginning
      groups.push(groups.shift());
    }

    return groups;
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
