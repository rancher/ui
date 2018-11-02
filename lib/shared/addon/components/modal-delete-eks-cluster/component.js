import Component from '@ember/component';
import layout from './template';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Component.extend(ModalBase, NewOrEdit, {
  modalService: service('modal'),


  classNames: ['medium-modal'],
  clone:      null,
  errors:     null,
  updateKeys: true,

  layout,

  originalModel:   alias('modalService.modalOpts.model'),
  primaryResource: alias('originalModel'),

  actions: {
    confirmKeys(cb) {
      get(this, 'primaryResource').save().then(() => {
        get(this, 'primaryResource').delete().then(() => {
          cb();
          this.send('cancel');
        }).catch( (e) => {
          cb(false, e);
        });
      }).catch( (e) => {
        cb(false, e);
      });
    }
  }
});
