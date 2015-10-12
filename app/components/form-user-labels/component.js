import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  initialLabels: null,

  tagName: '',

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'));
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
