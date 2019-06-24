import { computed, observer, get, set } from '@ember/object';
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

const HISTORY_LIMIT = 10;

function getDefaultConfig(config) {
  switch ( config ) {
  case 'deployment':
    return {
      type:                 'deploymentConfig',
      revisionHistoryLimit: HISTORY_LIMIT,
    };
  case 'daemonSet':
    return {
      type:                 'daemonSetConfig',
      revisionHistoryLimit: HISTORY_LIMIT,
    };
  case 'replicaSet':
    return { type: 'replicaSetConfig' };
  case 'replicationController':
    return { type: 'replicationControllerConfig' };
  case 'statefulSet':
    return {
      type:                 'statefulSetConfig',
      podManagementPolicy:  'OrderedReady',
      revisionHistoryLimit: HISTORY_LIMIT,
      volumeClaimTemplates: [],
    };
  case 'cronJob':
    return {
      type:                       'cronJobConfig',
      concurrencyPolicy:          'Allow',
      failedJobsHistoryLimit:     1,
      schedule:                   '0 * * * *',
      successfulJobsHistoryLimit: 3,
      jobConfig:                  {},
      suspend:                    false,
    };
  case 'job':
    return { type: 'jobConfig' };
  }
}

export default Component.extend({
  layout,
  initialScale:     null,
  isUpgrade:        null,
  isGlobal:         null,
  min:              0,
  max:              1000,
  scaleMode:        null,
  editing:          true,

  userInput:        null,

  canChangeScaleMode: not('isUpgrade'),

  init() {
    this._super(...arguments);

    let initial = get(this, 'initialScale');

    if ( initial === null ) {
      initial = 1;
    }

    set(this, 'userInput', `${ initial }`);
    this.scaleModeChanged();
    if ( get(this, 'scaleMode') !== 'deployment' && !get(this, 'isUpgrade') ) {
      set(this, 'advancedShown', true);
    }
  },

  actions: {
    increase() {
      set(this, 'userInput', Math.min(get(this, 'max'), get(this, 'asInteger') + 1));
    },

    decrease() {
      set(this, 'userInput', Math.max(get(this, 'min'), get(this, 'asInteger') - 1));
    },

    showAdvanced() {
      this.set('advancedShown', true);
    },
  },

  scaleChanged: observer('asInteger', function() {
    let cur = get(this, 'asInteger');

    this.setScale(cur);
  }),

  scaleModeChanged: observer('scaleMode', function() {
    var scaleMode = get(this, 'scaleMode');

    if ( !scaleMode || scaleMode === 'sidekick' ) {
      return;
    }

    const config = `${ scaleMode }Config`;
    const workload = get(this, 'workload');

    if ( !get(workload, config) ) {
      set(workload, config, get(this, 'store').createRecord(getDefaultConfig(scaleMode)));
    }
  }),

  canAdvanced: computed('advancedShown', 'isUpgrade', 'scaleMode', function() {
    if ( get(this, 'advancedShown') ) {
      return false;
    }

    if ( get(this, 'isUpgrade') ) {
      return false;
    }

    return true;
  }),

  asInteger: computed('userInput', function() {
    return parseInt(get(this, 'userInput'), 10) || 0;
  }),

  canChangeScale: computed('scaleMode', function() {
    return ['deployment', 'replicaSet', 'daemonSet', 'replicationController', 'statefulSet'].includes(get(this, 'scaleMode'));
  }),

  setScale() {
    throw new Error('setScale action is required!');
  },
});
