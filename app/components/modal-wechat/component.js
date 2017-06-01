import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default ModalBase.extend({
  settings: Ember.inject.service(),
  classNames: ['modal-container','about','span-6','offset-3', 'alert'],
});
