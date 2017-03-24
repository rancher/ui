import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),
  hostConfig:   null,
  actions: {
    launchHost() {
      this.get('modalService').toggleModal('modal-catalog-host', {
        callee: this,
      });
    },
    completed(value){
      Object.keys(value).forEach((key) => {
        if (key.indexOf('Config') >= 0) {
          this.set('hostConfig', key.slice(0, key.indexOf('Config').capitalize()));
        }
      });
    }
  }
});
