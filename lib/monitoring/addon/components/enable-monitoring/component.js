import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import layout from './template';

const PROMETHEUS = 'prometheus';
const NONE = 'none';

export default Component.extend({
  scope: service(),
  growl: service(),

  layout,

  answers:                     null,
  selected:                    NONE,
  level:                       'cluster',
  justDeployed:                false,
  enablePrometheusPersistence: false,
  enableGrafanaPersistence:    false,
  enableNodeExporter:          true,
  prometheusPersistenceSize:   '50Gi',
  grafanaPersistenceSize:      '10Gi',
  prometheusStorageClass:      null,
  grafanaStorageClass:         null,
  nodeSelectors:               null,
  retention:                   360,
  port:                        9100,

  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),

  init() {
    this._super(...arguments);
    set(this, 'selected', get(this, 'enabled') ? PROMETHEUS : NONE);

    if ( get(this, 'enabled') ) {
      this.fetchSettings();
    }
  },

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

      let answers = get(this, 'answers') || {};

      if ( get(this, 'level') === 'cluster' ) {
        answers['exporter-node.enabled'] = `${ get(this, 'enableNodeExporter') }`;
        answers['exporter-node.ports.metrics.port'] = `${ get(this, 'port') }`;
        answers['exporter-kubelets.https'] = `${ !get(this, 'scope.currentCluster.isGKE') }`;
      }

      answers['prometheus.retention'] = `${ get(this, 'retention') }h`;
      answers['grafana.persistence.enabled'] = `${ get(this, 'enableGrafanaPersistence') }`;
      answers['prometheus.persistence.enabled'] = `${ get(this, 'enablePrometheusPersistence') }`;
      answers['prometheus.persistence.storageClass'] = `${ get(this, 'prometheusStorageClass') === null ? 'default' : get(this, 'prometheusStorageClass') }`;
      answers['grafana.persistence.storageClass'] = `${ get(this, 'grafanaStorageClass') === null ? 'default' : get(this, 'grafanaStorageClass') }`;
      answers['grafana.persistence.size'] = `${ get(this, 'grafanaPersistenceSize') }`;
      answers['prometheus.persistence.size'] = `${ get(this, 'prometheusPersistenceSize') }`;

      (get(this, 'nodeSelectors') || []).forEach((selector) => {
        answers[`nodeSelector.${ get(selector, 'key') }`] = get(selector, 'value');
      });

      let action = get(this, 'enabled') ?  'editMonitoring' : 'enableMonitoring';

      resource.doAction(action, { answers }).then(() => {
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
        cb(true);
        set(this, 'answers', null);
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        cb(false);
      });
    }
  },

  enabled: computed('cluster.enableClusterMonitoring', 'project.enableProjectMonitoring', 'level', function() {
    return get(this, 'level') === 'cluster' ? get(this, 'cluster.enableClusterMonitoring') : get(this, 'project.enableProjectMonitoring');
  }),

  saveDisabled: computed('selected', 'enabled', function() {
    return (get(this, 'selected') === NONE && !get(this, 'enabled'));
  }),

  fetchSettings() {
    const resource = get(this, 'level') === 'cluster' ? get(this, 'cluster') : get(this, 'project');

    set(this, 'loading', true);
    resource.waitForAction('viewMonitoring').then(() => {
      resource.doAction('viewMonitoring').then((res) => {
        const answers = get(res, 'answers');

        set(this, 'answers', answers);
        this.updateConfig(answers);
        set(this, 'loading', false);
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        set(this, 'loading', false);
      });
    })
  },

  updateConfig(answers) {
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
  },
});
