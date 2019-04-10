import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import Component from '@ember/component';
import { set, get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import ReservationCheck from 'shared/mixins/reservation-check';
import layout from './template';

const PROMETHEUS = 'prometheus';
const NONE = 'none';
const EXPOSED_OPTIONS = ['exporter-node.enabled', 'exporter-node.ports.metrics.port',
  'exporter-kubelets.https', 'prometheus.retention', 'grafana.persistence.enabled',
  'prometheus.persistence.enabled', 'prometheus.persistence.storageClass',
  'grafana.persistence.storageClass', 'grafana.persistence.size',
  'prometheus.persistence.size', 'prometheus.resources.core.requests.cpu',
  'exporter-node.resources.limits.cpu', 'exporter-node.resources.limits.memory',
  'prometheus.resources.core.limits.cpu', 'prometheus.resources.core.requests.memory',
  'prometheus.resources.core.limits.memory'];
const NODE_EXPORTER_CPU = 100;
const NODE_EXPORTER_MEMORY = 30;
const CLUSTER_CPU = 900;
const CLUSTER_MEMORY = 970;

export default Component.extend(ReservationCheck, {
  scope:    service(),
  growl:    service(),
  settings: service(),

  layout,

  answers:                     null,
  customAnswers:               null,
  selected:                    NONE,
  level:                       'cluster',
  justDeployed:                false,
  enablePrometheusPersistence: false,
  enableGrafanaPersistence:    false,
  enableNodeExporter:          true,
  prometheusPersistenceSize:   '50Gi',
  grafanaPersistenceSize:      '10Gi',
  requestsCpu:                 '750',
  limitsCpu:                   '1000',
  nodeExporterLimitsCpu:       '200',
  nodeExporterLimitsMemory:    '200',
  requestsMemory:              '750',
  limitsMemory:                '1000',
  prometheusStorageClass:      null,
  grafanaStorageClass:         null,
  nodeSelectors:               null,
  retention:                   12,
  port:                        9796,
  projectLevelMinCpu:          500,
  projectLevelMinMemory:       500,

  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  actions: {
    changeSelected(selected) {
      set(this, 'selected', selected);
    },

    save(cb) {
      if ( get(this, 'selected') === NONE ) {
        this.send('disable', cb);
      } else {
        this.send('enable', cb);
      }
    },

    enable(cb) {
      const resource = get(this, 'level') === 'cluster' ? get(this, 'cluster') : get(this, 'project');

      let answers = {};

      if ( get(this, 'level') === 'cluster' ) {
        answers['exporter-node.enabled'] = `${ get(this, 'enableNodeExporter') }`;
        answers['exporter-node.ports.metrics.port'] = `${ get(this, 'port') }`;
        answers['exporter-kubelets.https'] = `${ !(get(this, 'scope.currentCluster.isGKE') || get(this, 'scope.currentCluster.isAKS')) }`;
        answers['exporter-node.resources.limits.cpu'] = `${ get(this, 'nodeExporterLimitsCpu') }m`;
        answers['exporter-node.resources.limits.memory'] = `${ get(this, 'nodeExporterLimitsMemory') }Mi`;
      }

      answers['prometheus.retention'] = `${ get(this, 'retention') }h`;
      answers['grafana.persistence.enabled'] = `${ get(this, 'enableGrafanaPersistence') }`;
      answers['prometheus.persistence.enabled'] = `${ get(this, 'enablePrometheusPersistence') }`;
      answers['prometheus.persistence.storageClass'] = `${ get(this, 'prometheusStorageClass') === null ? 'default' : get(this, 'prometheusStorageClass') }`;
      answers['grafana.persistence.storageClass'] = `${ get(this, 'grafanaStorageClass') === null ? 'default' : get(this, 'grafanaStorageClass') }`;
      answers['grafana.persistence.size'] = `${ get(this, 'grafanaPersistenceSize') }`;
      answers['prometheus.persistence.size'] = `${ get(this, 'prometheusPersistenceSize') }`;
      answers['prometheus.resources.core.requests.cpu'] = `${ get(this, 'requestsCpu') }m`;
      answers['prometheus.resources.core.limits.cpu'] = `${ get(this, 'limitsCpu') }m`;
      answers['prometheus.resources.core.requests.memory'] = `${ get(this, 'requestsMemory') }Mi`;
      answers['prometheus.resources.core.limits.memory'] = `${ get(this, 'limitsMemory') }Mi`;

      Object.keys(answers).filter((key) => key.startsWith('prometheus.nodeSelectors[') ).forEach((key) => {
        delete answers[key]
      });

      (get(this, 'nodeSelectors') || []).forEach((selector, index) => {
        let s = get(selector, 'key');
        let v = get(selector, 'value');

        if ( v && v.startsWith('"') && v.endsWith('"') ) {
          s += `="${ get(selector, 'value') }"`;
        } else if (v) {
          s += `="${ get(selector, 'value') }"`;
        }
        answers[`prometheus.nodeSelectors[${ index }]`] = s;
      });

      let action = get(this, 'enabled') ?  'editMonitoring' : 'enableMonitoring';

      const customAnswers = get(this, 'customAnswers') || {};

      Object.keys(customAnswers).forEach((key) => {
        answers[key] = customAnswers[key]
      });

      resource.doAction(action, { answers }).then(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        set(this, 'justDeployed', true);
        cb(true);
        this.fetchSettings();
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        cb(false);
      });
    },

    disable(cb) {
      const resource = get(this, 'level') === 'cluster' ? get(this, 'cluster') : get(this, 'project');

      resource.doAction('disableMonitoring').then(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        cb(true);
        set(this, 'answers', null);
        set(this, 'customAnswers', null)
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        cb(false);
      });
    }
  },

  enabled: computed('cluster.enableClusterMonitoring', 'project.enableProjectMonitoring', 'level', function() {
    return get(this, 'level') === 'cluster' ? get(this, 'cluster.enableClusterMonitoring') : get(this, 'project.enableProjectMonitoring');
  }),

  clusterLevelMinCpu: computed('cluster.enableClusterMonitoring', 'project.enableProjectMonitoring', 'level', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];
    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);

    return  CLUSTER_CPU + get(schedulableNodes, 'length') * NODE_EXPORTER_CPU;
  }),

  clusterLevelMinMemory: computed('cluster.enableClusterMonitoring', 'project.enableProjectMonitoring', 'level', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];
    const schedulableNodes = allNodes.filterBy('isUnschedulable', false);

    return  CLUSTER_MEMORY + get(schedulableNodes, 'length') * NODE_EXPORTER_MEMORY;
  }),

  saveDisabled: computed('insufficientPrometheusMemory', 'insufficientPrometheusCpu', 'insufficient', 'selected', 'enabled', function() {
    if ( get(this, 'selected') === NONE  ) {
      return !get(this, 'enabled');
    } else {
      return get(this, 'insufficient') || get(this, 'insufficientPrometheusCpu') || get(this, 'insufficientPrometheusMemory');
    }
  }),

  insufficientPrometheusCpu: computed('schedulableNodes.@each.{allocatable,requested}', 'requestsCpu', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftCpu = 0;

    get(this, 'schedulableNodes').forEach((node) => {
      const left =  convertToMillis(get(node, 'allocatable.cpu')) - convertToMillis(get(node, 'requested.cpu'));

      if ( left > maxLeftCpu) {
        maxLeftCpu = left;
      }
    });

    return !get(this, 'enabled') && maxLeftCpu <= get(this, 'requestsCpu');
  }),

  insufficientPrometheusMemory: computed('schedulableNodes.@each.{allocatable,requested}', 'requestsMemory', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];

    if ( get(allNodes, 'length') === 0 ) {
      return false;
    }

    let maxLeftMemory = 0;

    get(this, 'schedulableNodes').forEach((node) => {
      const left =  (parseSi(get(node, 'allocatable.memory'), 1024) / 1048576) - (parseSi(get(node, 'requested.memory'), 1024) / 1048576);

      if ( left > maxLeftMemory) {
        maxLeftMemory = left;
      }
    });

    return !get(this, 'enabled') && maxLeftMemory <= get(this, 'requestsMemory');
  }),

  schedulableNodes: computed('nodeSelectors', 'scope.currentCluster.nodes.@each.{allocatable,requested}', function() {
    const allNodes = get(this, 'scope.currentCluster.nodes') || [];
    const out = allNodes.filterBy('isUnschedulable', false)
      .filter((node) => (get(this, 'nodeSelectors') || [])
        .every((selector) => {
          const labelValue = (get(node, 'labels') || {})[get(selector, 'key')];

          if ( get(selector, 'value') === '' ) {
            return labelValue !== undefined;
          } else {
            return get(selector, 'value') === labelValue;
          }
        }));

    return out;
  }),

  initSettings: on('init', observer('scope.currentProject.id', 'scope.currentCluster.id', function() {
    set(this, 'selected', get(this, 'enabled') ? PROMETHEUS : NONE);

    if ( get(this, 'enabled') ) {
      this.fetchSettings();
    }
  })),

  fetchSettings() {
    const resource = get(this, 'level') === 'cluster' ? get(this, 'cluster') : get(this, 'project');

    if ( !resource ) {
      return;
    }

    set(this, 'loading', true);
    resource.waitForAction('viewMonitoring').then(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      resource.doAction('viewMonitoring').then((res) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        const body = get(res, 'answers');
        const answers = {};
        const customAnswers = {};

        Object.keys(body || {}).forEach((key) => {
          if ( EXPOSED_OPTIONS.indexOf(key) > -1 || key.startsWith('prometheus.nodeSelectors[') ) {
            answers[key] = body[key];
          } else {
            customAnswers[key] = body[key];
          }
        });

        set(this, 'answers', answers);
        set(this, 'customAnswers', customAnswers);
        this.updateConfig(answers);
        set(this, 'loading', false);
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        set(this, 'loading', false);
      });
    })
  },

  updateConfig(answers) {
    if ( answers['prometheus.resources.core.requests.cpu'] ) {
      set(this, 'requestsCpu', convertToMillis(answers['prometheus.resources.core.requests.cpu']));
      set(this, 'preRequestsCpu', get(this, 'requestsCpu'));
    }

    if ( answers['prometheus.resources.core.limits.cpu'] ) {
      set(this, 'limitsCpu', convertToMillis(answers['prometheus.resources.core.limits.cpu']));
    }

    if ( answers['exporter-node.resources.limits.cpu'] ) {
      set(this, 'nodeExporterLimitsCpu', convertToMillis(answers['exporter-node.resources.limits.cpu']));
    }

    if ( answers['prometheus.resources.core.requests.memory'] ) {
      set(this, 'requestsMemory', parseSi(answers['prometheus.resources.core.requests.memory'], 1024) / 1048576);
      set(this, 'preRequestsMemory', get(this, 'requestsMemory'));
    }

    if ( answers['prometheus.resources.core.limits.memory'] ) {
      set(this, 'limitsMemory', parseSi(answers['prometheus.resources.core.limits.memory'], 1024) / 1048576);
    }

    if ( answers['exporter-node.resources.limits.memory'] ) {
      set(this, 'nodeExporterLimitsMemory', parseSi(answers['exporter-node.resources.limits.memory'], 1024) / 1048576);
    } else {
      set(this, 'nodeExporterLimitsMemory', '50');
    }

    if ( answers['prometheus.retention'] ) {
      set(this, 'retention', answers['prometheus.retention'].substr(0, answers['prometheus.retention'].length - 1));
    }
    if ( answers['grafana.persistence.enabled'] ) {
      set(this, 'enableGrafanaPersistence', answers['grafana.persistence.enabled'] === 'true');
    }
    if ( answers['prometheus.persistence.enabled'] ) {
      set(this, 'enablePrometheusPersistence', answers['prometheus.persistence.enabled'] === 'true');
    }
    if ( answers['prometheus.persistence.storageClass'] ) {
      set(this, 'prometheusStorageClass', answers['prometheus.persistence.storageClass'] === 'default' ? null : answers['prometheus.persistence.storageClass']);
    }
    if ( answers['grafana.persistence.storageClass'] ) {
      set(this, 'grafanaStorageClass', answers['grafana.persistence.storageClass'] === 'default' ? null : answers['grafana.persistence.storageClass']);
    }
    if ( answers['grafana.persistence.size'] ) {
      set(this, 'grafanaPersistenceSize', answers['grafana.persistence.size'])
    }
    if ( answers['prometheus.persistence.size'] ) {
      set(this, 'prometheusPersistenceSize', answers['prometheus.persistence.size'])
    }
    if ( get(this, 'level') === 'cluster' ) {
      if ( answers['exporter-node.enabled'] ) {
        set(this, 'enableNodeExporter', answers['exporter-node.enabled'] === 'true');
      }
      if ( answers['exporter-node.ports.metrics.port'] ) {
        set(this, 'port', answers['exporter-node.ports.metrics.port'])
      }
    }
    let nodeSelectorsStr = '';

    Object.keys(answers).filter((key) => key.startsWith('prometheus.nodeSelectors[') ).forEach((key) => {
      let value = answers[key];

      if ( value ) {
        const index = value.indexOf('=');

        if ( index > -1 ) {
          let keyStr = value.slice(index + 1);

          if ( keyStr && keyStr.startsWith('"') && keyStr.endsWith('"') ) {
            keyStr = keyStr.slice(1, keyStr.length - 1);
          }

          value = `${ value.slice(0, index) }=${ keyStr }`;
        }
      }
      nodeSelectorsStr += `${ value },`;
    });

    set(this, 'nodeSelectorsStr', nodeSelectorsStr);
  },
});
