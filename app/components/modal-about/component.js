import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'generic', 'about', 'full-width-modal'],
  settings: Ember.inject.service(),
});
