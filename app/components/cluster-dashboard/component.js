import Component from '@ember/component';
import { get, computed } from '@ember/object';
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
  showDashboard:     computed('scope.currentCluster.isReady', 'nodes.[]', function() {

    return get(this, 'nodes').length && get(this, 'scope.currentCluster.isReady')

  }),

  inactiveNodes: computed('nodes.@each.state', function() {

    return this.get('nodes').filter( (n) => get(n, 'state') !== 'active');

  }),

  unhealthyComponents: computed('componentStatuses.@each.conditions', function() {

    return (this.get('componentStatuses') || [])
      .filter((s) => !s.conditions.any((c) => c.status === 'True'));

  }),

  updateComponentsStatus: function() {

    this.setComponents();

  }.observes('componentStatuses.@each.conditions', 'nodes.@each.{state}'),

  init() {

    this._super(...arguments);
    this.setComponents();

  },

  setComponents() {

    const etcd = this.getEtcdComponent();
    const controller = this.getControllerComponent();
    const scheduler = this.getSchedulerComponent();
    const node = this.getNodeComponent();

    this.set('components', [etcd, controller, scheduler, node]);

  },

  getEtcdComponent() {

    return {
      name:    this.get('intl').t('clusterDashboard.etcd'),
      healthy: this.isHealthy('etcd'),
    };

  },

  getControllerComponent() {

    return {
      name:    this.get('intl').t('clusterDashboard.controllerManager'),
      healthy: this.isHealthy('controller-manager'),
    };

  },

  getSchedulerComponent() {

    return {
      name:    this.get('intl').t('clusterDashboard.scheduler'),
      healthy: this.isHealthy('scheduler'),
    };

  },

  getNodeComponent() {

    return {
      name:    this.get('intl').t('clusterDashboard.node'),
      healthy: this.get('nodes').filterBy('state', 'active').length === this.get('nodes').length,
    };

  },

  isHealthy(field) {

    return (this.get('componentStatuses') || [])
      .filter((s) => s.name.startsWith(field))
      .any((s) => s.conditions.any((c) => c.status === 'True'));

  },
});
