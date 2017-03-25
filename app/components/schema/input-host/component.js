import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),
  hostConfig:   null,
  hostName:   null,
  value: null,
  actions: {
    launchHost() {
      // we should reall not kill the previous driver if they edit, fix this in the future
      if (this.get('hostConfig')) {
        this.setProperties({
          hostConfig: null,
          hostName: null
        });
      }
      this.get('modalService').toggleModal('modal-catalog-host', {
        callee: this,
      });
    },
    completed(value){
      this.setProperties({
        hostConfig: value, // probably use this when we are sending it back up on edit
        value: JSON.stringify(value)
      });
      Object.keys(value).forEach((key) => {
        if (key.indexOf('Config') >= 0) {
          this.set('hostName', key.slice(0, key.indexOf('Config')).capitalize());
        }
      });
    }
  }
});
