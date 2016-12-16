import Ember from 'ember';
import C from 'ui/utils/constants';

function labelsMatching(ary,key,val) {
  return ary.filter((x) => {
    return (x.get('labels')||{})[key] === val;
  });
}


export default Ember.Mixin.create({
  groupedInstances: function() {
    console.log('groupedInstances',this.get('model.id'));
    var groups = [];

    function getOrCreateGroup(id, name, isK8s)
    {
      let group = groups.findBy('id', id);
      if ( !group )
      {
        group = { id: id, name: name, instances: [], hasChildren: false, kubernetes: isK8s };
        groups.push(group);
      }

      return group;
    }

    function getOrCreateUnit(groupId, groupName, deploymentUnit)
    {
      var group = getOrCreateGroup(groupId, groupName);
      var unit;
      if ( deploymentUnit )
      {
        unit = group.instances.filterBy('unit', deploymentUnit)[0];
      }

      if ( !unit )
      {
        unit = {unit: deploymentUnit, main: null, children: [], group: group};
        group.instances.push(unit);
      }

      return unit;
    }

    let remaining = this.get('filteredInstances').slice();
    while ( remaining.get('length') ) {
      let instance = remaining.objectAt(0);

      let labels = instance.get('labels')||{};
      let deploymentUnit = labels[C.LABEL.DEPLOYMENT_UNIT] || null;

      let k8sName = (instance.get('labels')||{})[C.LABEL.K8S_POD_NAMESPACE] || '';
      let stackId = instance.get('primaryStack.id') || '';
      let stackName = instance.get('primaryStack.displayName') || '';

      let groupId, groupName;
      if ( k8sName ) {
        groupId = '_k8s_'+k8sName;
        groupName = k8sName||'';
      } else {
        groupId = stackId||'';
        groupName = stackName||'';
      }

      getOrCreateGroup(groupId, groupName, !!k8sName);

      let orphans = [];

      if ( deploymentUnit ) {
        let related = labelsMatching(remaining, C.LABEL.DEPLOYMENT_UNIT, deploymentUnit);
        let primary = labelsMatching(related, C.LABEL.LAUNCH_CONFIG, C.LABEL.LAUNCH_CONFIG_PRIMARY).sortBy('createdTS').reverse()[0];

        // Normal case, there's a primary service and maybe some sidekicks and/or old primary.
        if ( primary ) {
          related.removeObject(primary);

          let unit = getOrCreateUnit(groupId, groupName, deploymentUnit);
          unit.group.hasChildren = true;
          unit.main = primary;
          unit.children.pushObjects(related);
          remaining.removeObject(primary);
        } else {
          orphans = related;
        }

        remaining.removeObjects(related);
      } else {
        orphans = [instance];
      }

      if ( orphans.length ) {
        for ( let i = 0 ; i < orphans.length ; i++ ) {
          let unit = getOrCreateUnit('', '', null);
          unit.main = orphans[i];
        }
        remaining.removeObjects(orphans);
      }

      remaining.removeObject(instance);
    }

    // Sorting is nice
    groups = groups.sortBy('name');

    // Standalone last
    let standalone = getOrCreateGroup('');
    groups.removeObject(standalone);
    groups.push(standalone);

    // Collapse all
    groups.forEach((group) => {
      group.collapsed = true;
    });

    return groups;
  }.property('filteredInstances.@each.{name,id}'),
});
