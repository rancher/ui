import { get, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  globalStore:         service(),
  scope:               service(),

  chartOption:               null,
  monitoringEnabled:         false,
  condition:                 null,
  graphLoading:              null,
  graphStatus:               null,
  showAdvancedSection:        false,
  clustScanRuleFailuresOnly: 'false',

  clusterId:           reads('scope.currentCluster.id'),

  init() {
    this._super(...arguments);
    const resourceKinds = get(this, 'globalStore')
      .getById('schema', 'eventrule')
      .optionsFor('resourceKind').sort()
      .map((value) => ({
        label: value,
        value,
      }));
    const systemServices = get(this, 'globalStore')
      .getById('schema', 'systemservicerule')
      .optionsFor('condition').sort()
      .map((value) => ({
        label: value,
        value,
      }));

    setProperties(this, {
      resourceKinds,
      systemServices,
      clustScanRuleFailuresOnly: get(this, 'model.clusterScanRule.failuresOnly') === true ? 'true' : 'false'
    })
    set(this, 'chartOption', get(this, 'chartOption'))
    this.expressionChange()
  },

  actions: {
    showAdvanced() {
      set(this, 'showAdvancedSection', true)
    },
  },
  targetTypeChanged: observer('model._targetType', function() {
    const t = get(this, 'model._targetType');

    this.setEventType(t);
  }),

  clustScanRuleFailuresOnlyChanged: observer('clustScanRuleFailuresOnly', function() {
    set(this, 'model.clusterScanRule.failuresOnly', get(this, 'clustScanRuleFailuresOnly') === 'true');
  }),

  expressionChange: observer('model.metricRule.expression', function() {
    if (!get(this, 'monitoringEnabled')) {
      return
    }

    const expression = get(this, 'model.metricRule.expression')
    const globalStore = get(this, 'globalStore')
    const clusterId = get(this, 'scope.currentCluster.id')

    if (expression) {
      set(this, 'graphLoading', true)
      globalStore.rawRequest({
        url:    `monitormetrics?action=querycluster`,
        method: 'POST',
        data:   {
          expr:     expression,
          from:     'now-24h',
          interval: '300s',
          to:       'now',
          clusterId,
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

  models: computed('model', function() {
    return [get(this, 'model')]
  }),

  metricsContent: computed('metrics.[]', function() {
    const metrics = get(this, 'metrics') || []

    return metrics.map((m) => ({
      label: m,
      value: m
    }))
  }),

  nodes: computed('clusterId', function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('node').filterBy('clusterId', clusterId);
  }),

  isEventTarget: computed('model._targetType', function() {
    const t = get(this, 'model._targetType');

    return t === 'warningEvent' || t ===  'normalEvent';
  }),

  verbStyles: computed('model._targetType', function() {
    const tt = get(this, 'model._targetType');
    let out = '';

    if (tt === 'node' || tt === 'nodeSelector') {
      out = `padding-top: 6px;`;
    }

    return htmlSafe(out);
  }),

  canRemoveRule: computed('alertRules.[]', 'isCreate', 'editRule', function() {
    const alertRules = get(this, 'alertRules') || []
    const isCreate = get(this, 'isCreate')
    const editRule = get(this, 'editRule')

    if (alertRules.length > 1 && isCreate && !editRule) {
      return true
    }

    return false
  }),

  expressionStyle: computed('monitoringEnabled', function() {
    const out = get(this, 'monitoringEnabled') ? '' : 'color: #bfbfbf;'

    return htmlSafe(out);
  }),

  setEventType(t) {
    if (t === 'warningEvent') {
      set(this, 'model.eventRule.eventType', 'Warning');
    }
    if (t === 'normalEvent') {
      set(this, 'model.eventRule.eventType', 'Normal');
    }
  },

});
