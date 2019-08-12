import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  globalStore:            service(),
  scope:                  service(),

  restartIntervalSeconds: null,
  graphStatus:            null,
  projectId:              reads('scope.currentProject.id'),

  init(...args) {
    this._super(...args);

    const n = get(this, 'model.podRule.restartIntervalSeconds') / 60 || 5;

    set(this, 'restartIntervalSeconds', n);
    set(this, 'model.podRule.restartIntervalSeconds', n * 60);

    this.expressionChange()
  },

  actions: {
    showAdvanced() {
      set(this, 'showAdvancedSection', true)
    },
  },
  expressionChange: observer('model.metricRule.expression', function() {
    if (!get(this, 'monitoringEnabled')) {
      return
    }

    const expression = get(this, 'model.metricRule.expression')
    const globalStore = get(this, 'globalStore')
    const projectId = get(this, 'scope.currentProject.id')

    if (expression) {
      set(this, 'graphLoading', true)
      globalStore.rawRequest({
        url:    `monitormetrics?action=queryproject`,
        method: 'POST',
        data:   {
          expr:     expression,
          from:     'now-24h',
          interval: '300s',
          to:       'now',
          projectId,
        }
      }).then((res) => {
        if (res.body) {
          const body = JSON.parse(res.body)
          const { series = [] } = body

          setProperties(this, {
            chartOption: { series },
            graphStatus: 'success',
          })
        } else {
          set(this, 'graphStatus', 'noData')
        }
      }).catch(() => {
        set(this, 'graphStatus', 'error')
      }).finally(() => {
        set(this, 'graphLoading', false)
      })
    }
  }),

  restartIntervalSecondsChanged: observer('restartIntervalSeconds', function() {
    const n = +get(this, 'restartIntervalSeconds') || 5;

    set(this, 'model.podRule.restartIntervalSeconds', n * 60);
  }),

  pods: computed('projectId', function() {
    const projectId = get(this, 'projectId');

    return get(this, 'store').all('pod').filterBy('projectId', projectId);
  }),

  workloads: computed('projectId', function() {
    const projectId = get(this, 'projectId');

    return get(this, 'store').all('workload').filterBy('projectId', projectId);
  }),

  metricsContent: computed('metrics.[]', function() {
    const metrics = get(this, 'metrics') || []

    return metrics.map((m) => ({
      label: m,
      value: m
    }))
  }),

  expressionStyle: computed('monitoringEnabled', function() {
    const out = get(this, 'monitoringEnabled') ? '' : 'color: #bfbfbf;'

    return htmlSafe(out);
  }),
});
