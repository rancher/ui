import Ember from 'ember';
import ModalBase from 'shared/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['modal-container','about','span-6','offset-3', 'alert'],
  settings: Ember.inject.service(),
});
