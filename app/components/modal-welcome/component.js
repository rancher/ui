import Ember from 'ember';
import C from 'ui/utils/constants';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'span-6', 'offset-3', 'modal-welcome'],
  settings: Ember.inject.service(),
  optIn: null,

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
