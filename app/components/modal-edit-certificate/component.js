import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  intl: service(),

  layout,
  classNames:    ['large-modal'],
  editing:       true,
  model:         null,
  originalModel: alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);
    this.set('model', this.originalModel.clone());
  },

  manageModel() {
    let clone = this.originalModel;
    let model = this.model;

    if (clone.get('key') === model.get('key')) {
      delete model.key;
    }
  },

  validate() {
    var model = this.model;
    var errors = this.errors || [];
    var intl = this.intl;

    // key is the only node that can be deleted safely
    this.manageModel();

    if (!model.cert) {
      errors.push(intl.t('validation.required', { key: 'cert' }));
    }

    if (model.get('name') === null) {
      errors.push(intl.t('validation.required', { key: 'name' }));
    }

    this.set('errors', null);

    return true;
  },

  doneSaving() {
    this.send('cancel');
  },
});
