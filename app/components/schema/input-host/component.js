import Ember from 'ember';

export default Ember.Component.extend({
  modalService:       Ember.inject.service('modal'),
  hostConfig: null,
  actions: {
    launchHost() {
      this.get('modalService').toggleModal('modal-catalog-host');
    }
  }
});
