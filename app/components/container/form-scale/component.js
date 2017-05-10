import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

function newMax(val, curMax, absoluteMax) {
  return Math.min(absoluteMax, Math.max(curMax, Math.ceil(val/10)*10));
}

export default Ember.Component.extend(ManageLabels, {
  initialLabel:   null,
  initialScale:   null,
  editing:        false,
  min:            1,
  max:            100,
  mode:           'container',

  userInput:      null,
  advancedShown:   false,
  sliderMax:      10,

  classNames: ['inline-form'],

  init() {
    this._super(...arguments);
    this.set('userInput', (this.get('initialScale')||1)+'');
    this.set('sliderMax', newMax(this.get('asInteger'), this.get('sliderMax'), this.get('max')));

    this.initLabels(this.get('initialLabels'), null, C.LABEL.SCHED_GLOBAL);
    var glb = this.getLabel(C.LABEL.SCHED_GLOBAL) === 'true';
    if ( glb ) {
      this.set('mode', 'global');
    } else {
      this.set('mode', 'service');
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

  asInteger: Ember.computed('userInput', function() {
    return parseInt(this.get('userInput'),10) || 0;
  }),

  scaleChanged: Ember.observer('asInteger', function() {
    let cur = this.get('asInteger');
    this.sendAction('setScale', cur);

    this.set('sliderMax', newMax(cur, this.get('sliderMax'), this.get('max')));
  }),

  modeChanged: Ember.observer('mode', function() {
    var mode = this.get('mode');
    if ( mode === 'global' ) {
      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
    } else {
      this.removeLabel(C.LABEL.SCHED_GLOBAL);
    }

  }),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});

