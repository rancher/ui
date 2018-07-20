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
    this.set('model', this.get('originalModel').clone());
  },

  manageModel() {
    let clone = this.get('originalModel');
    let model = this.get('model');

    if (clone.get('key') === model.get('key')) {
      delete model.key;
    }
  },

  validate() {
    var model = this.get('model');
    var errors = this.get('errors') || [];
    var intl = this.get('intl');

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
