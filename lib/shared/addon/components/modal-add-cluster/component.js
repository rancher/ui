import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  templates: alias('modalOpts.templates'),
  hosts: alias('modalOpts.hosts'),
  drivers: alias('modalOpts.drivers'),
  mode: null,
  launchHostTemplate: null,
  launchHostDriver: null,
  launchHost: null,
  init() {
    this._super(...arguments);
    set(this, 'mode', 'hostTemplate');
  },
  actions: {
    launch(template) {
      let driver = get(this, 'drivers').findBy('name', get(template, 'driver'));
      this.setProperties({
        mode: 'launch',
        launchHostTemplate: template,
        launchHostDriver: driver,
      });
    },
    // cancel() {},
    goBack() {
      this.get('modalService').toggleModal();
    },
    add() {},
  },
});
