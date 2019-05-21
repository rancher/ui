import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { convertToMillis, ucFirst } from 'shared/utils/util';

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

  leftCpu: computed('cluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'cluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);

    let leftCpu = 0;

    schedulableNodes.forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.cpu')) - convertToMillis(get(node, 'requested.cpu') || '0');

      leftCpu += left;
    });

    return leftCpu;
  }),

  leftMemory: computed('cluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'cluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);

    let leftMemory = 0;

    schedulableNodes.forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.memory')) - convertToMillis(get(node, 'requested.memory') || '0');

      leftMemory += left;
    });

    return leftMemory;
  }),

  insufficientMemory: computed('preRequestsMemory', 'requestsMemory', 'leftMemory', function() {
    const {
      preRequestsMemory, requestsMemory, leftMemory, enabled, minMemory
    } = this

    if ( enabled ) {
      return leftMemory <= parseInt(requestsMemory, 10) - parseInt(preRequestsMemory, 10);
    } else {
      return leftMemory <= minMemory;
    }
  }),

  insufficientCpu: computed('preRequestsCpu', 'requestsCpu', 'leftCpu', function() {
    const {
      preRequestsCpu, requestsCpu, leftCpu, enabled, minCpu
    } = this

    if ( enabled ) {
      return leftCpu <= parseInt(requestsCpu, 10) - parseInt(preRequestsCpu, 10);
    } else {
      return leftCpu <= minCpu;
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

  getComponentInsufficient(component, type) {
    const allNodes = get(this, 'cluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const maxLeft = get(this, `${ component }SchedulableNodes`).reduce((out, node) => {
      const left =  convertToMillis(get(node, `allocatable.${ type }`)) - convertToMillis(get(node, `requested.${ type }`));

      return left > out ? left : out
    }, 0)

    const request = get(this, `config.${ component }Request${ ucFirst(type) }`)

    return get(this, 'enabled') ? maxLeft <= request - get(this, `pre${ ucFirst(component) }Request${ ucFirst(type) }`) : maxLeft <= request
  },

  getSchedulableNodes(component) {
    const allNodes = get(this, 'cluster.nodes') || [];
    const out = allNodes.filterBy('isUnschedulable', false)
      .filter((node) => (get(this, `${ component }NodeSelectors`) || [])
        .every((selector) => {
          const labelValue = (get(node, 'labels') || {})[get(selector, 'key')];

          if ( get(selector, 'value') === '' ) {
            return labelValue !== undefined;
          } else {
            return get(selector, 'value') === labelValue;
          }
        }));

    return out;
  },

  getComponentWarning(component) {
    const insufficientCpu = get(this, `insufficient${ ucFirst(component) }Cpu`)
    const insufficientMemory = get(this, `insufficient${ ucFirst(component) }Memory`)
    const nodeSelectors = get(this, `${ component }NodeSelectors`) || []
    const intl = get(this, 'intl')

    const cpu = get(this, `config.${ component }RequestCpu`)
    const memory = get(this, `config.${ component }RequestMemory`)
    let prefix = 'clusterIstioPage.insufficientSize.selectors'

    if (nodeSelectors.length === 0) {
      prefix = 'clusterIstioPage.insufficientSize.workload'
    }

    if (insufficientCpu && insufficientMemory) {
      return intl.t(`${ prefix }.all`, {
        cpu,
        memory,
        component
      })
    } else if (insufficientCpu) {
      return intl.t(`${ prefix }.cpu`, {
        cpu,
        component
      })
    } else if (insufficientMemory) {
      return intl.t(`${ prefix }.memory`, {
        memory,
        component
      })
    }
  },
});
