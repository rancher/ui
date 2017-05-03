import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  settings: Ember.inject.service(),
  classNames: ['lacsso', 'modal-container', 'generic', 'about', 'medium-modal'],
});
