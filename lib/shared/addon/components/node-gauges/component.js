import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { formatSi, parseSi } from 'shared/utils/parse-unit';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  nodes: null,

  gauges: null,

  init() {
    this._super(...arguments);
    this.setDashboard();
  },

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
        found.labels.push(node.node.nodeName);
      } else {
        ticks.push({
          value: Math.round(node.value),
          labels: [node.node.nodeName],
        });
      }
    });
    return ticks;
  },

  getNodes(field) {
    return (this.get('nodes') || []).map(node => {
      let tValue = "0";
      let uValue = "0";
      if (node.allocatable && node.requested) {
        tValue = node.allocatable[field];
        uValue = node.requested[field];
      }

      let total = parseSi(tValue);
      let used = parseSi(uValue);

      if (isNaN(total) || isNaN(used)) {
        used = 0;
        total = 0;
      }

      let value = 0;
      if (total > 0) {
        value = used * 100 / total;
      }

      return {
        node,
        used,
        total,
        value,
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
    const value = Math.round(used * 100 / total);
    return isNaN(value) ? 0 : value;
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
