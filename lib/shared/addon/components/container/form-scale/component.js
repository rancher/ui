import { computed, observer, get, set } from '@ember/object';
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

const HISTORY_LIMIT = 10;
const DEFAULT_CONFIG = {
  deployment: {
    type: 'deploymentConfig',
    revisionHistoryLimit: HISTORY_LIMIT,
  },
  daemonSet: {
    type: 'daemonSetConfig',
    revisionHistoryLimit: HISTORY_LIMIT,
  },
  replicaSet: {
    type: 'replicaSetConfig',
  },
  replicationController: {
    type: 'replicationControllerConfig',
  },
  statefulSet: {
    type: 'statefulSetConfig',
    podManagementPolicy: 'OrderedReady',
    revisionHistoryLimit: HISTORY_LIMIT,
    volumeClaimTemplates: [],
  },
  cronJob: {
    type: 'cronJobConfig',
    concurrencyPolicy: 'Allow',
    failedJobsHistoryLimit: HISTORY_LIMIT,
    schedule: '0 * * * *',
    successfulJobsHistoryLimit: HISTORY_LIMIT,
  },
  job: {
    type: 'jobConfig',
  },
};

export default Component.extend({
  layout,
  initialScale:     null,
  isUpgrade:        null,
  isGlobal:         null,
  min:              1,
  max:              1000,
  scaleMode:        null,
  editing:          true,

  userInput:        null,

  init() {
    this._super(...arguments);
    set(this,'userInput', (get(this,'initialScale')||1)+'');
    this.scaleModeChanged();
    if ( get(this, 'scaleMode') !== 'deployment' && !get(this, 'isUpgrade') ) {
      set(this, 'advancedShown', true);
    }
  },

  actions: {
    increase() {
      set(this,'userInput', Math.min(get(this,'max'), get(this,'asInteger')+1));
    },

    decrease() {
      set(this,'userInput', Math.max(get(this,'min'), get(this,'asInteger')-1));
    },

    showAdvanced() {
      this.set('advancedShown', true);
    },
  },

  canAdvanced: computed('advancedShown','isUpgrade','scaleMode', function() {
    if ( get(this,'advancedShown') ) {
      return false;
    }

    if ( get(this,'isUpgrade') ) {
      return false;
    }

    return true;
  }),

  asInteger: computed('userInput', function() {
    return parseInt(get(this,'userInput'),10) || 0;
  }),

  scaleChanged: observer('asInteger', function() {
    let cur = get(this,'asInteger');
    this.sendAction('setScale', cur);
  }),

  scaleModeChanged: observer('scaleMode', function() {
    var scaleMode = get(this,'scaleMode');
    if ( !scaleMode || scaleMode === 'sidekick' ) {
      return;
    }

    const config = scaleMode+'Config';
    const workload = get(this,'workload');
    if ( !get(workload,config) ) {
      set(workload, config, get(this,'store').createRecord(DEFAULT_CONFIG[scaleMode]));
    }
  }),

  canChangeScaleMode: not('isUpgrade'),

  canChangeScale: computed('scaleMode', function() {
    return ['deployment','replicaSet','daemonSet','replicationController','statefulSet'].includes(get(this,'scaleMode'));
  }),
});
