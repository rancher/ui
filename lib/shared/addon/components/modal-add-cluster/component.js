import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  templates: alias('modalOpts.templates'),
  hosts: alias('modalOpts.hosts'),
  drivers: alias('modalOpts.drivers'),
  driver: 'azure',
  mode: null,
  launchHostTemplate: null,
  launchHostDriver: null,
  launchHost: null,
  addHostModel: null,

  init() {
    this._super(...arguments);
    set(this, 'mode', 'hostTemplate');
  },

  actions: {
    completed(cb) {
      this.get('modalService').toggleModal();
    },

    launch(template) {
      let driver = get(this, 'drivers').findBy('name', get(template, 'driver'));
      this.setProperties({
        mode: 'launch',
        launchHostTemplate: template,
        launchHostDriver: driver,
      });
    },

    // cancel() {},
    //
    goBack() {
      this.get('modalService').toggleModal();
    },

    add() {
      this.setProperties({
        mode: 'add',
        addHostModel: {
          model: {
            availableDrivers: get(this, 'drivers'),
          }
        }
      });
    },
  },
});
