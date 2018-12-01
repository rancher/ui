import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const HTTPS = 'HTTPS';
const HTTP = 'HTTP'

const OPTIONS = [
  {
    label: HTTP,
    value: HTTP
  },
  {
    label: HTTPS,
    value: HTTPS
  }
];

export default Component.extend({
  scope:    service(),

  layout,

  editing: false,

  protocolOptions: OPTIONS,

  init() {
    this._super(...arguments);

    set(this, 'metrics', get(this, 'workload.workloadMetrics') || []);
  },

  actions: {
    add() {
      get(this, 'metrics').pushObject({
        path:   '',
        port:   '',
        schema: HTTP
      });
    },

    remove(obj) {
      get(this, 'metrics').removeObject(obj);
    },
  },

  metricsChanged: observer('metrics.@each.{port,path,schema}', function() {
    set(this, 'workload.workloadMetrics', get(this, 'metrics').filter((metric) => get(metric, 'port')));
  })
});