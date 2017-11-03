import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(ModalBase, {
  modalService: Ember.inject.service('modal'),
  hostService: Ember.inject.service('host'),
  classNames:  ['full-modal'],
  loading:     true,
  model:       null,
  hostConfig: null,
  getDrivers: task(function * () {
    var hs = this.get('hostService');

    var drivers = yield hs.loadAllDrivers()
    this.set('machineDrivers', drivers);
    var model = yield hs.getModel();
    this.set('model', model);
  }).on('init'),
  actions: {
    completed(hostConfig) {
      this.get('modalService.modalOpts.callee').send('completed', hostConfig);
      Ember.run.next(() => {
        this.get('modalService').toggleModal();
      });
    },
  },
});
