import { computed, observer, get, set } from '@ember/object';
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import ManageLabels from 'ui/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  initialLabel:     null,
  initialScale:     null,
  isUpgrade:        null,
  isGlobal:         null,
  canSidekick:      true,
  min:              1,
  max:              1000,
  scaleMode:        null,

  userInput:        null,
  _previousService: null,

  init() {
    this._super(...arguments);
    set(this,'userInput', (get(this,'initialScale')||1)+'');
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

  canAdvanced: computed('advancedShown','launchConfigIndex','isSidekick','isUpgrade','scaleMode', function() {
    if ( get(this,'advancedShown') || get(this,'launchConfigIndex') >= 0 ) {
      return false;
    }

    if ( get(this,'isSidekick') ) {
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
    if ( !scaleMode ) {
      return;
    }

    if ( scaleMode === 'sidekick' ) {
      this.setProperties({
        _previousService: get(this,'service'),
        service: null,
      });
    }

    if (get(this,'_previousService')) {
      this.setProperties({
        service:          get(this,'_previousService'),
        _previousService: null,
      });
    }

    if ( scaleMode === 'global' ) {
      set(this,'isGlobal', true);
    } else {
      set(this,'isGlobal', false);
    }
  }),

  globalChanged: observer('isGlobal', function() {
    let val = get(this, 'isGlobal') ? 'global' : 'parallel';

    let strategy = get(this,'service.deploymentStrategy');
    if ( strategy ) {
      set(strategy, 'kind', val);
    } else {
      strategy = {kind: val};
      set(this, 'service.deploymentStrategy', strategy);
    }
  }),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  canChangeScaleMode: not('isUpgrade'),

  canChangeScale: computed('scaleMode', function() {
    return ['deployment','replicaSet','daemonSet','replicationController','statefulSet'].includes(get(this,'scaleMode'));
  }),

  showSidekick: function() {
    if ( !get(this,'canSidekick') ) {
      return false;
    }

    if ( get(this,'isUpgrade') ) {
      return false;
    } else {
      return true;
    }
  }.property('isUpgrade', 'canSidekick'),

  sidekickChanged: function() {
    let service = get(this,'service');
    if ( service) {
      set(this,'scaleMode','sidekick')
    }
  }.observes('service'),
});
