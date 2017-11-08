import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import { task } from 'ember-concurrency';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  modalService: service('modal'),
  hostService: service('host'),
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
      next(() => {
        this.get('modalService').toggleModal();
      });
    },
  },
});
