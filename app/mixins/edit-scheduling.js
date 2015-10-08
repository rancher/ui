import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  isGlobal: null,
  isService: null,
  isRequestedHost: null,

  actions: {
    setGlobal: function(bool) {
      this.set('isGlobal', bool);
    },
  },

  initScheduling: function() {
//    var isGlobal = !!this.getLabel(C.LABEL.SCHED_GLOBAL);
//    this.set('isGlobal', isGlobal);
  },

  globalDidChange: function() {
    if ( this.get('isGlobal') )
    {
//      this.setLabel(C.LABEL.SCHED_GLOBAL,'true');
    }
    else
    {
//      this.removeLabel(C.LABEL.SCHED_GLOBAL);
    }
  }.observes('isGlobal'),
});
