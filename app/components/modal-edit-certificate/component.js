import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  editing: true,
  model: null,
  intl: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
  },

  manageModel() {
    let clone = this.get('originalModel');
    let model = this.get('model');

    if (clone.get('key') === model.get('key')) {
      delete model.key;
    }
  },

  validate: function() {
    var model = this.get('model');
    var errors = this.get('errors') || [];
    var intl = this.get('intl');

    // key is the only node that can be deleted safely
    this.manageModel();

    if (!model.cert) {
      errors.push(intl.t('validation.required', {key: 'cert'}));
    }

    if (model.get('name') === null) {
      errors.push(intl.t('validation.required', {key: 'name'}));
    }

    this.set('errors', null);
    return true;
  },

  doneSaving() {
    this.send('cancel');
  },
});
