import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'generic', 'about', 'medium-modal'],
  settings: Ember.inject.service(),
});
