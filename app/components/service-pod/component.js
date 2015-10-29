import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ReadLabels, FasterLinksAndMenus, {
  model: null,
  mode: null,

  labelResource: Ember.computed.alias('model.launchConfig'),
  classNames: ['pod','service'],
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
      var groupName = deploymentUnit;

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

  hasChildren: function() {
    return this.get('groupedInstances').filterBy('hasChildren',true).get('length') > 0;
  }.property('groupedInstances.@each.hasChildren'),

  showScaleUp: function() {
    if ( this.get('isActive') && this.get('model.hasContainers') && this.get('model.canScale') )
    {
      return this.getLabel(C.LABEL.SCHED_GLOBAL) === null;
    }
    else
    {
      return false;
    }
  }.property('isActive','hasBody','model.labels'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  iconColor: function() {
    var color = this.get('model.stateColor');
    if ( color.indexOf('danger') >= 0 || color.indexOf('warning') >= 0 )
    {
      return color;
    }
  }.property('model.stateColor'),

  iconLabel: function() {
    switch ( this.get('model.type').toLowerCase() ) {
      case 'kubernetesreplicationcontroller': return 'Controller';
      case 'kubernetesservice': return 'Service';
      default: return '';
    }
  }.property('model.type'),

});
