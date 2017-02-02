import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),
  modalOpts: Ember.computed.alias('modalService.modalOpts'),
  // Focus does not want to focus on modal el here, dont know why but
  // esc wont work if a modal doesnt have a focused element
  //init() {
    //this._super(...arguments);
    //Ember.run.scheduleOnce('afterRender', ()=> {
      //console.log('Focused: ', this.$());
      //this.$().focus();
    //});
  //},
  keyUp(e) {
    if (e.which === 27 && this.escToClose()) {
      this.get('modalService').toggleModal();
    }
  },
  escToClose() {
    var modalService = this.get('modalService');
    if (modalService.get('modalVisible') && modalService.get('modalOpts.escToClose')) {
      return true;
    } else {
      return false;
    }
  },
  actions: {
    cancel() {
      this.get('modalService').toggleModal();
    },
  },
});
