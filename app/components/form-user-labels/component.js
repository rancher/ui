import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  initialLabels: null,

  actions: {
    addUserLabel() {
      this._super();
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.key').last()[0].focus();
      });
    }
  },

  init() {
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'),'user');
    this.labelsChanged();
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
