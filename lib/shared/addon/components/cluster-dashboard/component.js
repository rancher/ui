import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { formatSi, parseSi } from 'shared/utils/parse-unit';
import layout from './template';
import { get } from '@ember/object';

export default Component.extend({
  intl: service(),
  scope: service(),

  layout,

  nodes: null,
  componentStatuses: alias('scope.currentCluster.componentStatuses'),
  gauges: null,
  components: null,

  init() {
    this._super(...arguments);
    this.setDashboard();
    this.setComponents();
  },

  inactiveNodes: computed('nodes.@each.{name,state}', function () {
    return this.get('nodes').filterBy('state', 'inactive');
  }),

  unhealthyComponents: computed('nodes.@each.{name,state}', function () {
    return this.get('componentStatuses')
      .filter(s => !s.conditions.any(c => c.status === 'True'));
  }),

  updateComponentsStatus: function () {
    this.setComponents();
  }.observes('componentStatuses'),

  setDashboard() {
    const cpuGauge = this.getCpuGauge();
    const memoryGauge = this.getMemoryGauge();
    const podsGauge = this.getPodsGauge();
    this.set('gauges', [cpuGauge, memoryGauge, podsGauge]);
  },

  getCpuGauge() {
    return this.getGauge('cpu',
      v => formatSi(v, 1000, '', ''),
      v => formatSi(v, 1000, '', '')
    );
  },

  getMemoryGauge() {
    return this.getGauge('memory',
      v => formatSi(v, 1024, 'B', 'B'),
      v => formatSi(v, 1024, 'B', 'B')
    );
  },

  getPodsGauge() {
    return this.getGauge('pods');
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
      name: this.get('intl').t('clusterDashboard.etcd'),
      healthy: false, //this.isHealthy('etcd'),
    };
  },

  getControllerComponent() {
    return {
      name: this.get('intl').t('clusterDashboard.controllerManager'),
      healthy: this.isHealthy('controller-manager'),
    };
  },

  getSchedulerComponent() {
    return {
      name: this.get('intl').t('clusterDashboard.scheduler'),
      healthy: this.isHealthy('scheduler'),
    };
  },

  getNodeComponent() {
    return {
      name: this.get('intl').t('clusterDashboard.node'),
      healthy: this.get('nodes').filterBy('state', 'inactive').length === 0,
    };
  },

  isHealthy(field) {
    return this.get('componentStatuses')
      .filter(s => s.name.startsWith(field))
      .any(s => s.conditions.any(c => c.status === 'True'));
  },

  getGauge(field, totalFormatCb, usedFormatCb) {
    const nodes = this.getNodes(field);
    return {
      value: this.getValue(nodes),
      title: this.get('intl').t(`clusterDashboard.${field}`),
      subtitle: this.getSubtitle(nodes, totalFormatCb, usedFormatCb),
      ticks: this.getTicks(nodes),
    };
  },

  getTicks(nodes) {
    let filtered = [];
    if (nodes.length > 0) {
      const min = nodes[0].value;
      const max = nodes[nodes.length - 1].value;
      filtered = nodes.filter(node => node.value === min || node.value === max);
    }
    const ticks = [];
    filtered.forEach(node => {
      const found = ticks.find(tick => tick.value === Math.round(node.value));
      if (found) {
        found.labels.push(node.node.name);
      } else {
        ticks.push({
          value: Math.round(node.value),
          labels: [node.node.name],
        });
      }
    });
    return ticks;
  },

  getNodes(field) {
    return (this.get('nodes') || []).map(node => {
      let tValue = node.allocatable[field];
      let uValue = node.requested[field];
      const total = parseSi(tValue);
      const used = parseSi(uValue);
      return {
        node,
        used,
        total,
        value: used * 100 / total,
      };
    }).sortBy('value');
  },

  getValue(nodes) {
    let used = 0;
    let total = 0;
    nodes.forEach(node => {
      total += node.total;
      used += node.used;
    });
    return Math.round(used * 100 / total);
  },

  getSubtitle(nodes, totalCb, usedCb) {
    let used = 0;
    let total = 0;
    nodes.forEach(node => {
      total += node.total;
      used += node.used;
    });
    return this.get('intl').t('clusterDashboard.subtitle', {
      used: usedCb ? usedCb(used) : used,
      total: totalCb ? totalCb(total) : total,
    });
  },
});
