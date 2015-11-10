import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, ManageLabels, {
  editing: true,
  originalModel: null,
  model: null,

  willInsertElement() {
    this.set('model', this.get('originalModel').clone());
  },

  actions: {
    outsideClick() {
    },

    cancel() {
      this.sendAction('dismiss');
    },

    setLabels(labels) {
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('model.labels', out);
    },
  },

  doneSaving() {
    this.sendAction('dismiss');
  },
});
