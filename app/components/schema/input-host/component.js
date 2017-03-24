import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),
  hostConfig:   Ember.computed.alias('modalService.modalOpts.hostConfig'),
  actions: {
    launchHost() {
      this.get('modalService').toggleModal('modal-catalog-host', {
        callee: this,
      });
    },
    completed(value){
      this.set('hostConfig', value);
    }
  }
});
