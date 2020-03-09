import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service'

export default Mixin.create({
  globalStore: service(),

  loadClusterRule(model) {
    const gs = get(this, 'globalStore');
    const t = get(model, 'targetType');

    set(model, '_targetType', t);

    const nodeRule = gs.createRecord({ type: 'nodeRule' });
    const systemServiceRule = gs.createRecord({ type: 'systemServiceRule' });
    const clusterScanRule = gs.createRecord({
      type:        'clusterScanRule',
      scanRunType: 'manual'
    });
    const eventRule = gs.createRecord({ type: 'eventRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const et = get(model, 'eventRule.eventType') || '';

    switch (t) {
    case 'event':
      setProperties(model, {
        nodeRule,
        systemServiceRule,
        metricRule,
        clusterScanRule,
        _targetType: `${ et.toLowerCase() }Event`,
      });
      break;
    case 'node':
    case 'nodeSelector':
      setProperties(model, {
        eventRule,
        systemServiceRule,
        metricRule,
        clusterScanRule,
      });
      break;
    case 'systemService':
      setProperties(model, {
        nodeRule,
        eventRule,
        metricRule,
        clusterScanRule,
      });
      break;
    case 'metric':
      setProperties(model, {
        nodeRule,
        systemServiceRule,
        eventRule,
        clusterScanRule,
      });
      break;
    case 'cisScan':
      setProperties(model, {
        nodeRule,
        systemServiceRule,
        eventRule,
        metricRule,
      });
      break;
    }

    return model
  },

  loadProjectRule(model) {
    const globalStore = get(this, 'globalStore');
    const t = get(model, 'targetType');

    set(model, '_targetType', t);
    const workloadRule = globalStore.createRecord({ type: 'workloadRule' })
    const podRule = globalStore.createRecord({ type: 'podRule' })
    const metricRule = globalStore.createRecord({ type: 'metricRule' })

    switch (t) {
    case 'pod':
      setProperties(model, {
        workloadRule,
        metricRule,
      })
      break;
    case 'workload':
    case 'workloadSelector':
      setProperties(model, {
        podRule,
        metricRule,
      })
      break;
    case 'metric':
      setProperties(model, {
        podRule,
        workloadRule,
      })
      break;
    }

    return model
  },
});
