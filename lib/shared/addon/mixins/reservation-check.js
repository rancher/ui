import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';

export default Mixin.create({
  scope:                 service(),

  preRequestsCpu:        null,
  preRequestsMemory:     null,
  clusterLevelMinCpu:    1000,
  clusterLevelMinMemory: 1000,
  projectLevelMinCpu:    500,
  projectLevelMinMemory: 500,

  insufficient: computed('insufficientMemory', 'insufficientCpu', function() {
    return get(this, 'insufficientMemory') || get(this, 'insufficientCpu');
  }),

  insufficientMemory: computed('preRequestsMemory', 'requestsMemory', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);
    let leftMemory = 0;

    schedulableNodes.forEach((node) => {
      const left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory'), 1024) / 1048576);

      leftMemory += left;
    });

    if ( get(this, 'enabled') ) {
      return leftMemory <= parseInt(get(this, 'requestsMemory'), 10) - parseInt(get(this, 'preRequestsMemory'), 10) ;
    } else {
      return leftMemory <= get(this, 'minMemory');
    }
  }),

  insufficientCpu: computed('preRequestsCpu', 'requestsCpu', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);

    let leftCpu = 0;

    schedulableNodes.forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.cpu')) - convertToMillis(get(node, 'requested.cpu'));

      leftCpu += left;
    });

    if ( get(this, 'enabled') ) {
      return leftCpu <= parseInt(get(this, 'requestsCpu'), 10) - parseInt(get(this, 'preRequestsCpu'), 10) ;
    } else {
      return leftCpu <= get(this, 'minCpu');
    }
  }),

  minCpu: computed('requestsCpu', 'clusterLevelMinCpu', 'projectLevelMinCpu', function() {
    let cpu = parseInt(get(this, 'requestsCpu'), 10);

    if ( isNaN(cpu) ) {
      cpu = 0;
    }

    return (get(this, 'level') === 'cluster' ? get(this, 'clusterLevelMinCpu') : get(this, 'projectLevelMinCpu'))  + cpu;
  }),

  minMemory: computed('requestsMemory', 'clusterLevelMinMemory', 'projectLevelMinMemory', function() {
    let memory = parseInt(get(this, 'requestsMemory'), 10);

    if ( isNaN(memory) ) {
      memory = 0;
    }

    return  (get(this, 'level') === 'cluster' ? get(this, 'clusterLevelMinMemory') : get(this, 'projectLevelMinMemory')) + memory;
  }),
});
