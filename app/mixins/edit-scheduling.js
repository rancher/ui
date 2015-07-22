import Ember from 'ember';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.Mixin.create(EditLabels, {
  actions: {
    addSchedulingRule: function() {
      this.send('addSystemLabel','','','affinity');
    },

    removeSchedulingRule: function(obj) {
      this.send('removeLabel', obj);
    },
  },
});
