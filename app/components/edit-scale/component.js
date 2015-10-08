import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';
import { debouncedObserver } from 'ui/utils/debounce';

// Subtract 1 (because 11...), round to the nearest 10, then double it
function roundScale(num) {
  return Math.ceil((num-1)/10)*10*2;
}

export default Ember.Component.extend(ManageLabels, {
  initialLabels: null,
  initialScale: null,

  isGlobal: null,
  scale: null,
  max: 11,

  didInitAttrs() {
    this.set('scale', this.get('initialScale')||1);
    this.set('max', Math.max(11, roundScale(this.get('scale'))));

    this.initLabels(this.get('initialLabels'));
    var isGlobal = !!this.getLabel(C.LABEL.SCHED_GLOBAL);
    this.set('isGlobal', isGlobal);
  },

  isGlobalChanged: function() {
    this.sendAction('setGlobal', this.get('isGlobal'));
  }.observes('isGlobal'),

  scaleChanged: debouncedObserver('scale', function() {
    if ( this.get('scale') >= this.get('max') )
    {
      this.set('max', roundScale(this.get('scale')));
    }

    this.sendAction('setScale', this.get('scale'));
  }, 1000),

  oneLouder: function() {
    return this.get('max')+1;
  }.property('max'),

});
