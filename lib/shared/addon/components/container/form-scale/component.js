import { computed, observer } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  initialLabel:     null,
  initialScale:     null,
  isService:        null,
  isUpgrade:        null,
  isGlobal:         null,
  canContainer:     true,
  canSidekick:      true,
  min:              1,
  max:              1000,
  mode:             null,

  userInput:        null,
  advancedShown:    false,
  _previousService: null,

  init() {
    this._super(...arguments);
    this.set('userInput', (this.get('initialScale')||1)+'');
    this.initLabels(this.get('initialLabels'), null, C.LABEL.SCHED_GLOBAL);
    var glb = this.getLabel(C.LABEL.SCHED_GLOBAL) === 'true';
    let mode = this.get('mode');
    if ( mode === 'service' && glb ) {
      next(() => {
        this.set('mode', 'global');
      });
    }
  },

  actions: {
    increase() {
      this.set('userInput', Math.min(this.get('max'), this.get('asInteger')+1));
    },

    decrease() {
      this.set('userInput', Math.max(this.get('min'), this.get('asInteger')-1));
    },

    showAdvanced() {
      this.set('advancedShown', true);
    },
  },

  asInteger: computed('userInput', function() {
    return parseInt(this.get('userInput'),10) || 0;
  }),

  scaleChanged: observer('asInteger', function() {
    let cur = this.get('asInteger');
    this.sendAction('setScale', cur);
  }),

  modeChanged: observer('mode', function() {
    var mode = this.get('mode');
    if ( !mode ) {
      return;
    }

    if ( mode === 'sidekick' ) {
      this.setProperties({
        _previousService: this.get('service'),
        service: null,
      });
    }

    if ( mode === 'container') {
      this.set('isService', false);
    } else {
      if (this.get('_previousService')) {
        this.setProperties({
          service:          this.get('_previousService'),
          _previousService: null,
        });
      }
      this.set('isService', true);
    }

    if ( mode === 'global' ) {
      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
      this.set('isGlobal', true);
    } else {
      this.removeLabel(C.LABEL.SCHED_GLOBAL);
      this.set('isGlobal', false);
    }
  }),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  canScale: function() {
    return !(this.get('isUpgrade') && this.get('mode') === 'container' );
  }.property('isUpgrade','mode'),

  canAdvanced: function() {
    if ( this.get('advancedShown') || this.get('launchConfigIndex') >= 0 ) {
      return false;
    }

    if ( this.get('isSidekick') ) {
      return false;
    }

    if ( !this.get('canScale') ) {
      return false;
    }

    return true;
  }.property('advancedShown','launchConfigIndex','isSidekick','isUpgrade','mode'),

  showContainer: function() {
    if ( !this.get('canContainer') ) {
      return false;
    }

    if ( this.get('isUpgrade') && this.get('isService') ) {
      return false;
    }

    return true;
  }.property('canContainer','isUpgrade','isService'),

  showSidekick: function() {
    if ( !this.get('canSidekick') ) {
      return false;
    }

    if ( this.get('isUpgrade') && this.get('isService') ) {
      return false;
    } else {
      return true;
    }
  }.property('isUpgrade','isService','canSidekick'),

  sidekickChanged: function() {
    let service = this.get('service');
    if ( service) {
      this.set('mode','sidekick')
    }
  }.observes('service'),
});
