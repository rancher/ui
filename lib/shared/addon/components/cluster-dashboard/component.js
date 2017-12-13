import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { formatSi } from 'shared/utils/util';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  nodes: null,
  cluster: null,
  gauges: null,


  init() {
    this._super(...arguments);
    this.initDashboard();
  },

  initDashboard() {
    const cpuGauge = this.initCpuGauge();
    const memoryGauge = this.initMemoryGauge();
    const podsGauge = this.initPodsGauge();
    this.set('gauges', [cpuGauge, memoryGauge, podsGauge]);
  },

  initCpuGauge() {
    return this.getGauge('cpu', n => n.allocatable.cpu, n => n.allocatable.cpu * Math.random());
  },

  initMemoryGauge() {
    return this.getGauge('memory',
      n => n.allocatable.memory.substr(0, n.allocatable.memory.length - 2),
      n => n.allocatable.memory.substr(0, n.allocatable.memory.length - 2) * Math.random(),
      v => formatSi(v, 1024, 'B', 'B', 1),
      v => formatSi(v, 1024, 'B', 'B', 1));
  },

  initPodsGauge() {
    return this.getGauge('pods',n => n.allocatable.pods,n => n.allocatable.pods * Math.random());
  },

  getGauge(field, totalCb, usedCb, totalFormatCb, usedFormatCb) {
    const nodes = this.getNodes(totalCb, usedCb);
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
      const found = ticks.find(tick => tick.value === node.value);
      if (found) {
        found.labels.push(node.label);
      } else {
        ticks.push({
          value: Math.round(node.value),
          labels: [node.node.name],
        });
      }
    });
    return ticks;
  },

  getNodes(totalCb, usedCb) {
    return (this.get('nodes') || []).map(node => {
      const total = parseInt(totalCb(node), 10);
      const used = parseInt(usedCb(node), 10);
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
