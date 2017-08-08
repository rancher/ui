import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  initialLabel: null,
  initialScale: null,
  isService:    null,
  isUpgrade:    null,
  isGlobal:     null,
  canContainer: true,
  canSidekick:  true,
  min:          1,
  max:          100,
  mode:         null,

  userInput:      null,
  advancedAvailable: true,
  advancedShown:  false,
  sidekickServiceId: null,

  init() {
    this._super(...arguments);
    this.set('userInput', (this.get('initialScale')||1)+'');

    this.initLabels(this.get('initialLabels'), null, C.LABEL.SCHED_GLOBAL);
    var glb = this.getLabel(C.LABEL.SCHED_GLOBAL) === 'true';
    if ( this.get('mode') ) {
      // Do nothing
    } else if ( this.get('launchConfigIndex') >= 0 ) {
      this.set('mode', 'sidekick');
      this.set('advancedAvailable', false);
      this.sidekickChanged();
    } else  if ( glb ) {
      this.set('mode', 'global');
    } else if ( this.get('isService') ) {
      this.set('mode', 'service');
    } else {
      this.set('mode', 'container');
    }

    this.modeChanged();
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

  asInteger: Ember.computed('userInput', function() {
    return parseInt(this.get('userInput'),10) || 0;
  }),

  scaleChanged: Ember.observer('asInteger', function() {
    let cur = this.get('asInteger');
    this.sendAction('setScale', cur);
  }),

  modeChanged: Ember.observer('mode', function() {
    var mode = this.get('mode');

    if ( mode === 'container') {
      this.set('isService', false);
    } else {
      this.set('isService', true);
    }

    if ( mode === 'global' ) {
      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
      this.set('isGlobal', true);
    } else {
      this.removeLabel(C.LABEL.SCHED_GLOBAL);
      this.set('isGlobal', false);
    }

    if ( mode !== 'sidekick' ) {
      this.set('sidekickServiceId', null);
    }

    this.sendAction('setMode', mode);
  }),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  canScale: function() {
    return !(this.get('isUpgrade') && this.get('mode') === 'container' );
  }.property('isUpgrade','mode'),

  canAdvanced: function() {
    if ( this.get('advancedShown') || !this.get('advancedAvailable') ) {
      return false;
    }

    if ( this.get('isSidekick') ) {
      return false;
    }

    if ( !this.get('canScale') ) {
      return false;
    }

    return true;
  }.property('advancedShown','advancedAvailable','isSidekick','isUpgrade','mode'),

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
    let id = this.get('sidekickServiceId');
    if ( id ) {
      let service = this.get('store').getById('service', id);
      this.sendAction('setSidekick', service);
      this.set('sidekickService', service);
    } else if ( this.get('mode') === 'sidekick' ) {
      this.sendAction('setSidekick', null);
      this.set('sidekickService', null);
    } else {
      this.sendAction('setSidekick', undefined);
      this.set('sidekickService', null);
    }
  }.observes('sidekickServiceId','mode'),
});
