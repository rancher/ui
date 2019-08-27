import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames:    ['large-modal'],
  model:         null,
  editing:       true,

  requireAny:     null,
  customName:     null,

  originalModel:      alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());

    if (this.get('model.name')) {
      this.set('customName', this.get('model.name'))
    }
  },

  customNameObserver: on('init', observer('customName', function() {
    let cn = this.get('customName');

    if (cn && cn.length > 0) {
      this.set('primaryResource.name', cn);
    } else {
      this.set('primaryResource.name', null);
    }
  })),

  doneSaving() {
    this.send('cancel');
  },
});
