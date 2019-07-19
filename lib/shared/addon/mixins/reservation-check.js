import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { get, computed, setProperties } from '@ember/object';
import { convertToMillis, ucFirst, parseCamelcase } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import { requiredError } from 'shared/utils/util';

export default Mixin.create({
  scope:                 service(),

  preRequestsCpu:        null,
  preRequestsMemory:     null,
  clusterLevelMinCpu:    1000,
  clusterLevelMinMemory: 1000,
  projectLevelMinCpu:    500,
  projectLevelMinMemory: 500,

  insufficient: computed('scope.currentCluster.nodes', 'insufficientMemory', 'insufficientCpu', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

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
      const left =  convertToMillis(get(node, 'allocatable.cpu') || '0') - convertToMillis(get(node, 'requested.cpu') || '0');

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
      const left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory') || '0', 1024) / 1048576);

      leftMemory += left;
    });

    return leftMemory;
  }),

  insufficientMemory: computed('preRequestsMemory', 'requestsMemory', 'leftMemory', function() {
    const {
      preRequestsMemory, requestsMemory, leftMemory, enabled, minMemory
    } = this

    if ( enabled ) {
      return leftMemory <= parseInt(requestsMemory || 0, 10) - parseInt(preRequestsMemory || 0, 10);
    } else {
      return leftMemory <= minMemory;
    }
  }),

  insufficientCpu: computed('preRequestsCpu', 'requestsCpu', 'leftCpu', function() {
    const {
      preRequestsCpu, requestsCpu, leftCpu, enabled, minCpu
    } = this

    if ( enabled ) {
      return leftCpu <= parseInt(requestsCpu || 0, 10) - parseInt(preRequestsCpu || 0, 10);
    } else {
      return leftCpu <= minCpu;
    }
  }),

  minCpu: computed('requestsCpu', 'clusterLevelMinCpu', 'projectLevelMinCpu', function() {
    let cpu = parseInt(get(this, 'requestsCpu') || 0, 10);

    if ( isNaN(cpu) ) {
      cpu = 0;
    }

    return (get(this, 'level') === 'cluster' ? get(this, 'clusterLevelMinCpu') : get(this, 'projectLevelMinCpu'))  + cpu;
  }),

  minMemory: computed('requestsMemory', 'clusterLevelMinMemory', 'projectLevelMinMemory', function() {
    let memory = parseInt(get(this, 'requestsMemory') || 0, 10);

    if ( isNaN(memory) ) {
      memory = 0;
    }

    return  (get(this, 'level') === 'cluster' ? get(this, 'clusterLevelMinMemory') : get(this, 'projectLevelMinMemory')) + memory;
  }),

  getComponentInsufficient(component, type, reservation) {
    const allNodes = get(this, 'cluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    const maxLeft = get(this, `${ component }SchedulableNodes`).reduce((out, node) => {
      let left

      if (type === 'cpu') {
        left =  convertToMillis(get(node, `allocatable.${ type }`)) - convertToMillis(get(node, `requested.${ type }`) || '0');
      } else if (type === 'memory') {
        left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory') || '0', 1024) / 1048576);
      }

      return left > out ? left : out
    }, 0)

    const request = reservation ? reservation : get(this, `config.${ component }Request${ ucFirst(type) }`) || 0

    return get(this, 'enabled') ? false : maxLeft <= request
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

  getComponentWarning(component, componentCpu, componentMemory, displayComponent, ) {
    const insufficientCpu = get(this, `insufficient${ ucFirst(component) }Cpu`)
    const insufficientMemory = get(this, `insufficient${ ucFirst(component) }Memory`)
    const nodeSelectors = get(this, `${ component }NodeSelectors`) || []
    const intl = get(this, 'intl')

    const cpu = componentCpu ? componentCpu : get(this, `config.${ component }RequestCpu`)
    const memory = componentMemory ? componentMemory : get(this, `config.${ component }RequestMemory`)
    let prefix = 'clusterIstioPage.insufficientSize.selectors'

    if (nodeSelectors.length === 0) {
      prefix = 'clusterIstioPage.insufficientSize.workload'
    } else {
      const unsupportedSelectors = nodeSelectors.filter((n) => n.value === 'true' || n.value === 'false' || /^\d+$/g.test(n.value))

      if (unsupportedSelectors.length > 0) {
        return intl.t(`clusterIstioPage.insufficientSize.selectors.unsupported`, { component: displayComponent ? displayComponent : parseCamelcase(component), })
      }
    }

    if (insufficientCpu && insufficientMemory) {
      return intl.t(`${ prefix }.all`, {
        cpu,
        memory,
        component: displayComponent ? displayComponent : parseCamelcase(component),
      })
    } else if (insufficientCpu) {
      return intl.t(`${ prefix }.cpu`, {
        cpu,
        component: displayComponent ? displayComponent : parseCamelcase(component),
      })
    } else if (insufficientMemory) {
      return intl.t(`${ prefix }.memory`, {
        memory,
        component: displayComponent ? displayComponent : parseCamelcase(component),
      })
    }
  },

  validateLimitAndRequest(component) {
    const errors = [];

    ['requestCpu', 'limitCpu', 'requestMemory', 'limitMemory'].map((suffix) => {
      const key = `config.${ component }${ ucFirst(suffix) }`

      if (!get(this, key)) {
        errors.pushObject(requiredError(`formReservation.${ suffix }.label`, { component: ucFirst(component) }))
      }
    })

    return errors
  },

  updateCpuMemoryPreRequest() {
    const answers = get(this, 'app.answers') || {};
    const workloads = this.getEnalbedWorkloads(answers);

    const preRequestsCpu = workloads.reduce((all, current) => {
      const value = answers[`${ current }.resources.requests.cpu`]

      return value ? all + convertToMillis(value) : all
    }, 0)

    const preRequestsMemory = workloads.reduce((all, current) => {
      const value = answers[`${ current }.resources.requests.memory`]

      return value ? all + parseSi(value) / 1048576 : all
    }, 0)

    setProperties(this, {
      preRequestsCpu,
      preRequestsMemory,
    })
  },
});
