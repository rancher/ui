import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['generic', 'about', 'medium-modal'],
  settings: Ember.inject.service(),
});
