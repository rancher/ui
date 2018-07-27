import Component from '@ember/component';
import { set, get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  intl:  service(),
  scope: service(),

  layout,

  nodes:             null,
  components:        null,
  componentStatuses: alias('scope.currentCluster.componentStatuses'),

  init() {
    this._super(...arguments);
    this.setComponents();
  },

  updateComponentsStatus: observer('componentStatuses.@each.conditions', 'nodes.@each.{state}', function() {
    this.setComponents();
  }),

  showDashboard:     computed('scope.currentCluster.isReady', 'nodes.[]', function() {
    return get(this, 'nodes').length && get(this, 'scope.currentCluster.isReady')
  }),

  inactiveNodes: computed('nodes.@each.state', function() {
    return get(this, 'nodes').filter( (n) => get(n, 'state') !== 'active' && get(n, 'state') !== 'cordoned' );
  }),

  unhealthyComponents: computed('componentStatuses.@each.conditions', function() {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => !s.conditions.any((c) => c.status === 'True'));
  }),

  setComponents() {
    const etcd = this.getEtcdComponent();
    const controller = this.getControllerComponent();
    const scheduler = this.getSchedulerComponent();
    const node = this.getNodeComponent();

    set(this, 'components', [etcd, controller, scheduler, node]);
  },

  getEtcdComponent() {
    return {
      name:    get(this, 'intl').t('clusterDashboard.etcd'),
      healthy: this.isHealthy('etcd'),
    };
  },

  getControllerComponent() {
    return {
      name:    get(this, 'intl').t('clusterDashboard.controllerManager'),
      healthy: this.isHealthy('controller-manager'),
    };
  },

  getSchedulerComponent() {
    return {
      name:    get(this, 'intl').t('clusterDashboard.scheduler'),
      healthy: this.isHealthy('scheduler'),
    };
  },

  getNodeComponent() {
    return {
      name:    get(this, 'intl').t('clusterDashboard.node'),
      healthy: get(this, 'inactiveNodes.length') === 0,
    };
  },

  isHealthy(field) {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => s.name.startsWith(field))
      .any((s) => s.conditions.any((c) => c.status === 'True'));
  },
});
