import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  formatSi, parseSi, exponentNeeded
} from 'shared/utils/parse-unit';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  nodes: null,

  gauges: null,

  updateDashboard: observer('nodes.@each.{allocatable,requested}', function() {

    this.setDashboard();

  }),

  init() {

    this._super(...arguments);
    setTimeout(() => {

      this.setDashboard();

    }, 150);

  },

  setDashboard() {

    const cpuGauge = this.getCpuGauge();
    const memoryGauge = this.getMemoryGauge();
    const podsGauge = this.getPodsGauge();

    this.set('gauges', [cpuGauge, memoryGauge, podsGauge]);

  },

  getCpuGauge() {

    return this.getGauge('cpu',
      (u, t) => formatSi(u, 1000, '', '', 0, exponentNeeded(t), 1).replace(/\s.*$/, ''),
      (t) => formatSi(t, 1000, '', '', 0, exponentNeeded(t), 1)
    );

  },

  getMemoryGauge() {

    return this.getGauge('memory',
      (u, t) => formatSi(u, 1024, '', '', 0, exponentNeeded(t), 1).replace(/\s.*$/, ''),
      (t) => formatSi(t, 1024, 'iB', 'B', 0, exponentNeeded(t), 1)
    );

  },

  getPodsGauge() {

    return this.getGauge('pods',
      (u, t) => formatSi(u, 1000, '', '', 0, exponentNeeded(t), 1).replace(/\s.*$/, ''),
      (t) => formatSi(t, 1000, '', '', 0, exponentNeeded(t), 1)
    );

  },

  getGauge(field, usedFormatCb, totalFormatCb) {

    const nodes = this.getNodes(field);

    return {
      value:    this.getValue(nodes),
      title:    this.get('intl').t(`clusterDashboard.${ field }`),
      subtitle: this.getSubtitle(nodes, totalFormatCb, usedFormatCb),
      ticks:    this.getTicks(nodes),
    };

  },

  getTicks(nodes) {

    let filtered = [];

    if (nodes.length > 0) {

      const min = nodes[0].value;
      const max = nodes[nodes.length - 1].value;

      filtered = nodes.filter((node) => node.value === min || node.value === max);

    }
    const ticks = [];

    filtered.forEach((node) => {

      const found = ticks.find((tick) => tick.value === Math.round(node.value));

      if (found) {

        found.labels.push(node.node.nodeName);

      } else {

        ticks.push({
          value:  Math.round(node.value),
          labels: [node.node.nodeName],
        });

      }

    });

    return ticks;

  },

  getNodes(field) {

    return (this.get('nodes') || []).map((node) => {

      const tValue = node.allocatable && node.allocatable[field] ? node.allocatable[field] : '0';
      const uValue = node.requested && node.requested[field] ? node.requested[field] : '0';

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

    nodes.forEach((node) => {

      total += node.total;
      used += node.used;

    });
    const value = Math.round(used * 100 / total);

    return isNaN(value) ? 0 : value;

  },

  getSubtitle(nodes, totalCb, usedCb) {

    let used = 0;
    let total = 0;

    nodes.forEach((node) => {

      total += node.total;
      used += node.used;

    });

    return this.get('intl').t('clusterDashboard.subtitle', {
      used:  usedCb ? usedCb(used, total) : used,
      total: totalCb ? totalCb(total) : total,
    });

  },
});
