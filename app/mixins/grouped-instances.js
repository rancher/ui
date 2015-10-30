import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  groupedInstances: function() {
    var groups = [];

    // Sidekicks which have no main container.  This isn't supposed to happen but
    // can due to bugs, user deleting things on host, or during upgrade briefly.
    var haveNoMain = [];

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

    function getOrCreateUnit(groupName, deploymentUnit, addToHaveNoMain)
    {
      var group = getOrCreateGroup(groupName);
      var unit;
      if ( deploymentUnit )
      {
        unit = group.instances.filterBy('unit', deploymentUnit)[0];
      }

      if ( !unit )
      {
        unit = {unit: deploymentUnit, main: null, children: [], group: group};

        if ( addToHaveNoMain !== false )
        {
          haveNoMain.addObject(unit);
        }

        group.instances.push(unit);
      }

      return [group, unit];
    }


    (this.get('model.instances')||[]).forEach((instance) => {
      var labels = instance.get('labels')||{};
      var deploymentUnit = labels[C.LABEL.DEPLOYMENT_UNIT] || null;
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
        haveNoMain.removeObject(unit);
      }
    });

    // Convert orphaned sidekicks into standalone containers with no children, for lack of a better place
    haveNoMain.forEach((unit) => {
      var group = unit.group;

      unit.children.forEach((child) => {
        let [ , newUnit] = getOrCreateUnit('', null, false);
        newUnit.main = child;
      });

      group.instances.removeObject(unit);
    });

    // Sorting is nice
    groups = groups.sortBy('name');

    // Move no name/standalone containers to the end of the list instead of the beginning
    if ( groups[0] && groups[0].name === '' )
    {
      groups.push(groups.shift());
    }

    return groups;
  }.property('model.instances.@each.{name,id}'),
});
