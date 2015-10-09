import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  initialLabels: null,

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'));
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
