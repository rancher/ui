import { get, setProperties } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import layout from './template';

export default Component.extend({
  globalStore:       service(),
  scope:             service(),
  condictions:       [],
  layout,
  editing:           true,

  clusterId:         reads('scope.currentCluster.id'),

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
    })
    const alertRules = get(this, 'alertRules') || []

    if (alertRules.length === 0) {
      this.addCondiction()
    }
  },

  actions: {
    addRule() {
      const pageScope = get(this, 'pageScope')
      let newAlert

      if (pageScope === 'cluster') {
        newAlert = this.getNewClusterAlert()
      } else {
        newAlert = this.getNewProjectAlert()
      }

      get(this, 'alertRules').pushObject(newAlert);
    },

    removeRule(rule) {
      get(this, 'alertRules').removeObject(rule);
    },
  },

  nodes: computed('clusterId', function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'globalStore').all('node').filterBy('clusterId', clusterId);
  }),

  addCondiction() {
    this.send('addRule')
  },

  getNewClusterAlert() {
    const gs = get(this, 'globalStore');
    const clusterId = get(this, 'scope.currentCluster.id')
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

    const opt = {
      type:                  'clusterAlertRule',
      clusterId,
      clusterScanRule,
      nodeRule,
      eventRule,
      systemServiceRule,
      metricRule,
      severity:              'critical',
      inherited:             true,
      groupIntervalSeconds:  180,
      groupWaitSeconds:      30,
      repeatIntervalSeconds: 3600,
    };
    const newAlert = gs.createRecord(opt);

    return newAlert;
  },

  getNewProjectAlert() {
    const gs = get(this, 'globalStore');
    const projectId = get(this, 'scope.currentProject.id')
    const podRule = gs.createRecord({ type: 'podRule' });
    const workloadRule = gs.createRecord({ type: 'workloadRule' });
    const metricRule = gs.createRecord({
      type:           'metricRule',
      comparison:     'greater-than',
      duration:       '5m',
      thresholdValue: 0,
    })

    const opt = {
      type:                  'projectAlertRule',
      projectId,
      initialWaitSeconds:    180,
      repeatIntervalSeconds: 3600,
      targetName:            '',
      inherited:             true,
      groupIntervalSeconds:  180,
      groupWaitSeconds:      30,

      podRule,
      workloadRule,
      metricRule,
    };

    const newAlert = gs.createRecord(opt);

    return newAlert;
  },
});
