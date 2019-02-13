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

      let answers;

      if ( get(this, 'level') === 'cluster' ) {
        answers = {
          'prometheus.retention':                `${ get(this, 'retention') }h`,
          'exporter-node.enabled':               `${ get(this, 'enableNodeExporter') }`,
          'exporter-node.ports.metrics.port':    `${ get(this, 'port') }`,
          'grafana.persistence.enabled':         `${ get(this, 'enableGrafanaPersistence') }`,
          'prometheus.persistence.enabled':      `${ get(this, 'enablePrometheusPersistence') }`,
          'prometheus.persistence.storageClass': `${ get(this, 'prometheusStorageClass') === null ? 'default' : get(this, 'prometheusStorageClass') }`,
          'grafana.persistence.storageClass':    `${ get(this, 'grafanaStorageClass') === null ? 'default' : get(this, 'grafanaStorageClass') }`,
          'grafana.persistence.size':            `${ get(this, 'grafanaPersistenceSize') }`,
          'prometheus.persistence.size':         `${ get(this, 'prometheusPersistenceSize') }`,
          'exporter-kubelets.https':             `${ !get(this, 'scope.currentCluster.isGKE') }`,
        };
      } else {
        answers = {
          'grafana.persistence.enabled':      `${ get(this, 'enableGrafanaPersistence') }`,
          'grafana.persistence.size':         `${ get(this, 'grafanaPersistenceSize') }`,
          'grafana.persistence.storageClass': `${ get(this, 'grafanaStorageClass') === null ? 'default' : get(this, 'grafanaStorageClass') }`,
        }
      }

      (get(this, 'nodeSelectors') || []).forEach((selector) => {
        answers[`nodeSelector.${ get(selector, 'key') }`] = get(selector, 'value');
      });
      resource.doAction('enableMonitoring', { answers }).then(() => {
        set(this, 'justDeployed', true);
        cb(true);
      }).catch((err) => {
        get(this, 'growl').fromError(err);
        cb(false);
      });
    },

    disable(cb) {
      const resource = get(this, 'level') === 'cluster' ? get(this, 'cluster') : get(this, 'project');

      resource.doAction('disableMonitoring').then(() => {
        cb(true);
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
    return (get(this, 'selected') === NONE && !get(this, 'enabled')) || (get(this, 'selected') === PROMETHEUS && get(this, 'enabled'));
  }),

});
