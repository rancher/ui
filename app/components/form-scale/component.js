import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';
import { debouncedObserver } from 'ui/utils/debounce';

// Subtract 1 (because 11...), round up to the nearest 10, then double it
function roundScale(num) {
  return Math.ceil((num-1)/10)*10*2;
}

export default Ember.Component.extend(ManageLabels, {
  initialLabels : null,
  initialScale  : null,
  isGlobal      : null,
  editing       : false,
  isVm          : null,

  scale         : null,
  max           : 11,

  init() {
    this._super(...arguments);


    this.set('scale', this.get('initialScale')||1);
    this.set('max', Math.max(11, roundScale(this.get('scale'))));

    this.initLabels(this.get('initialLabels'), null, C.LABEL.SCHED_GLOBAL);
    Ember.run.scheduleOnce('afterRender', () => {
      var on = this.getLabel(C.LABEL.SCHED_GLOBAL) === 'true';
      this.sendAction('setGlobal', this.set('isGlobal', on));
    });
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  isGlobalChanged: function() {
    var on = this.get('isGlobal');
    if ( on )
    {
      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
    }
    else
    {
      this.removeLabel(C.LABEL.SCHED_GLOBAL);
    }

    this.sendAction('setGlobal', on);
  }.observes('isGlobal'),

  scaleChanged: debouncedObserver('scale', function() {
    if ( this.get('scale') >= this.get('max') )
    {
      this.set('max', roundScale(this.get('scale')));
    }

    this.sendAction('setScale', this.get('scale'));
  }, 500),

  oneLouder: function() {
    return this.get('max')+1;
  }.property('max'),

});
