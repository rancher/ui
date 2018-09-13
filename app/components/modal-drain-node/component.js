import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  growl: service(),

  layout,
  classNames: ['large-modal'],

  model: alias('modalService.modalOpts.originalModel'),

  didReceiveAttrs() {
    const options = {
      force:            false,
      ignoreDaemonSets: true,
      deleteLocalData:  false,
      gracePeriod:      -1,
      timeout:          60,
    };

    set(this, 'options', options);
  },

  actions: {
    save(cb) {
      get(this, 'model').doAction('drain', get(this, 'options'))
        .then(() => {
          this.send('cancel');
        })
        .finally(() => {
          cb();
        });
    },
  },
});
