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

  hasContainers: function() {
    return ['service','loadbalancerservice'].indexOf(this.get('model.type').toLowerCase()) !== -1;
  }.property('model.type'),

  arrangedInstances: function() {
    return (this.get('model.instances')||[]).sortBy('name','id');
  }.property('model.instances.@each.{name,id}'),

  groupedInstances: function() {
    var instances = [];

    // Everything must be sorted first to guarantee that parents appear before sidekicks
    this.get('arrangedInstances').forEach((instance) => {
      var labels = instance.get('labels')||{};
      var isSidekick = !!labels[C.LABEL.LAUNCH_CONFIG] && labels[C.LABEL.LAUNCH_CONFIG] !== C.LABEL.LAUNCH_CONFIG_PRIMARY;
      var parentUnit = labels[C.LABEL.DEPLOYMENT_UNIT];
      var groupName = parentUnit;
      var entry, group;

      if ( isSidekick && parentUnit )
      {
        group = instances.filterBy('name', groupName)[0];
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
        group = instances.filterBy('name', groupName)[0];
        if ( !group )
        {
          group = { name: groupName, instances: [], hasChildren: false };
          instances.push(group);
        }

        group.instances.push({unit: parentUnit, main: instance, children: []});
      }
    });

    return instances;
  }.property('model.instances.@each.{name,id}'),

  hasChildren: function() {
    return this.get('groupedInstances').filterBy('hasChildren',true).get('length') > 0;
  }.property('groupedInstances.@each.hasChildren'),

  showScaleUp: function() {
    if ( this.get('isActive') && this.get('hasContainers') )
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
});
