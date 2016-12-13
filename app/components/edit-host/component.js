import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, ManageLabels, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  model: null,
  editing: true,

  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
  },

  actions: {
    setLabels(labels) {
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('model.labels', out);
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
