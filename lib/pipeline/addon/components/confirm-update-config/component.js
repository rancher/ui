import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import C from 'ui/utils/constants';

export default Component.extend(ModalBase, {
  modal:      service(),
  prefs:      service(),

  layout,
  classNames: ['medium-modal'],

  push: null,

  download:   alias('modalService.modalOpts.download'),
  pushToRepo: alias('modalService.modalOpts.pushToRepo'),
  cancel:     alias('modalService.modalOpts.cancel'),
  branches:   alias('modalService.modalOpts.updatedBranch'),

  init() {
    this._super(...arguments);

    let pushToRepo = get(this, `prefs.${ C.PREFS.PUSH_TO_REPO }`);

    if ( pushToRepo === undefined ) {
      pushToRepo = true;
    }

    set(this, 'push', !!pushToRepo);
  },

  actions: {
    save() {
      if ( get(this, 'push') ) {
        this.pushToRepo();
      } else {
        this.download();
      }
      get(this, 'modal').toggleModal();
    },

    cancel() {
      this.cancel();
      get(this, 'modal').toggleModal();
    },
  },
  pushDidChange: observer('push', function() {
    set(this, `prefs.${ C.PREFS.PUSH_TO_REPO }`, get(this, 'push'));
  }),

});
