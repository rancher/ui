import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Component.extend(ModalBase, NewOrEdit, {
  intl: service(),

  layout,
  classNames: ['large-modal', 'alert'],

  model:           null,
  errors:          [],
  editing: false,

  modalOpts:       alias('modalService.modalOpts'),
  primaryResource: alias('originalModel'),

  init() {

    this._super(...arguments);

    const stage = get(this, 'modalOpts.stage');

    if ( stage ) {

      set(this, 'model', stage);
      set(this, 'editing', true);

    } else {

      set(this, 'model', {
        id:    null,
        name:  null,
        steps: [],
        when:  null,
      })

    }

  },

  actions: {
    save(cb) {

      if ( !get(this, 'model.name') || get(this, 'model.name').trim() === '' ) {

        set(this, 'errors', [get(this, 'intl').t('newPipelineStage.errors.name.required')]);
        cb();

        return;

      }
      get(this, 'modalOpts').save(get(this, 'model'));

    },

    remove() {

      get(this, 'modalOpts').remove();

    }
  }
});
