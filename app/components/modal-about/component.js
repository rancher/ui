import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'span-6', 'offset-3', 'generic', 'about'],
  settings: Ember.inject.service(),

  actions: {

  },
});
