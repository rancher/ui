import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  modalService: Ember.inject.service('modal'),
  hostService: Ember.inject.service('host'),
  classNames:  ['full-modal'],
  loading:     true,
  model:       null,
  hostConfig: null,
  goBack:     null,
  actions: {
    completed(hostConfig) {
      this.get('modalService.modalOpts.callee').send('completed', hostConfig);
      Ember.run.next(() => {
        this.get('modalService').toggleModal();
      });
    }
  },
  init() {
    this._super(...arguments);
    var hs = this.get('hostService');

    hs.loadAllDrivers().then((drivers) => {
      this.set('machineDrivers', drivers);
      hs.getModel().then((hash) => {
        this.set('model', hash);
        this.set('loading', false);
      });
    });
  }
});
