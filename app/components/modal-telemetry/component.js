import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  settings:   service(),
  layout,
  classNames: ['modal-container', 'span-6', 'offset-3', 'modal-telemetry', 'alert'],
  optIn:      null,

  init() {

    this._super(...arguments);
    let cur = this.get('settings').get(C.SETTING.TELEMETRY);
    let optIn;
    let version = this.get('settings.rancherVersion');

    if ( !version ) {

      // For master, default to opt out
      optIn = (cur === 'in');

    } else {

      // For releases, default to opt in
      optIn = (cur !== 'out');

    }

    this.set('optIn', optIn);

  },

  actions: {
    cancel() {

      this.get('settings').set(C.SETTING.TELEMETRY, (this.get('optIn') ? 'in' : 'out'));
      this.get('modalService').toggleModal();

    },
  },
});
