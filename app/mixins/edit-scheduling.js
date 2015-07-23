import Ember from 'ember';
import C from 'ui/utils/constants';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.Mixin.create(EditLabels, {
  isGlobal: null,
  isRequestedHost: null,

  actions: {
    addSchedulingRule: function() {
      this.send('addSystemLabel','','','affinity');
    },

    removeSchedulingRule: function(obj) {
      this.send('removeLabel', obj);
    },
  },

  initScheduling: function() {
    var existing = this.getLabel(C.LABEL.SCHED_GLOBAL);
    this.set('isGlobal', !!existing);
    this._super();
    if ( this.get('isRequestedHost') )
    {
      this.set('isGlobal', false);
    }
  },

  globalDidChange: function() {
    if ( this.get('isGlobal') )
    {
      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
      this.set('isRequestedHost', false);
    }
    else
    {
      this.removeLabel(C.LABEL.SCHED_GLOBAL);
    }
  }.observes('isGlobal'),

  isRequestedHostDidChangeGlobal: function() {
    if ( this.get('isRequestedHost') )
    {
      this.set('isGlobal', false);
    }
  }.observes('isRequestedHost'),

});
