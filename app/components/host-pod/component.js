import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ReadLabels, FasterLinksAndMenus, {
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

  groupedInstances: function() {
    var groups = [];

    function getOrCreateGroup(groupName)
    {
      var group = groups.filterBy('name', groupName)[0];
      if ( !group )
      {
        group = { name: groupName, instances: [], hasChildren: false };
        groups.push(group);
      }

      return group;
    }

    function getOrCreateUnit(groupName, deploymentUnit)
    {
      var group = getOrCreateGroup(groupName);
      var entry = group.instances.filterBy('unit', deploymentUnit)[0];
      if ( !entry )
      {
        entry = {unit: deploymentUnit, main: null, children: []};
        group.instances.push(entry);
      }

      return [group, entry];
    }


    (this.get('model.instances')||[]).forEach((instance) => {
      var labels = instance.get('labels')||{};
      var deploymentUnit = labels[C.LABEL.DEPLOYMENT_UNIT];
      var isSidekick = deploymentUnit && labels[C.LABEL.LAUNCH_CONFIG] !== C.LABEL.LAUNCH_CONFIG_PRIMARY;
      var groupName = (instance.get('labels')||{})[C.LABEL.PROJECT_NAME] || '';

      //console.log(deploymentUnit, groupName, isSidekick, instance.get('id'), instance.get('name'));

      let [group, unit] = getOrCreateUnit(groupName, deploymentUnit);
      if ( isSidekick )
      {
        unit.children.push(instance);
        group.hasChildren = true;
      }
      else
      {
        unit.main = instance;
      }
    });

    groups = groups.sortBy('name');
    if ( groups[0] && groups[0].name === '' )
    {
      // Move no name/standalone containers to the end of the list instead of the beginning
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
