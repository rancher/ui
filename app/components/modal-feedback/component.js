import Ember from 'ember';
import C from 'ui/utils/constants';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'span-6', 'offset-3'],
  settings: Ember.inject.service(),
  prefs: Ember.inject.service(),

  actions: {

    send() {
      this.set(`prefs.${C.PREFS.FEEDBACK}`,'sent');
      this.send('cancel');
    },

    cancel() {
      let time = (new Date()).getTime() + C.PREFS.FEEDBACK_DELAY;
      this.set(`prefs.${C.PREFS.FEEDBACK_TIME}`, time);
      this.get('modalService').toggleModal();
    },

    never() {
      this.set(`prefs.${C.PREFS.FEEDBACK}`,'never');
      this.send('cancel');
    }
  },
});
