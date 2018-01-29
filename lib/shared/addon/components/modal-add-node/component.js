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
  driver: 'digitalocean',
  mode: null,
  launchMachineTemplate: null,
  launchHostDriver: null,
  launchHost: null,
  addHostModel: null,
  clusterNodes: null,

  init() {
    this._super(...arguments);
    if ( get(this, 'templates.length') ) {
      set(this, 'mode', 'machineTemplate');
    } else {
      this.send('add');
    }

    set(this, 'clusterNodes', []);
  },

  actions: {
    completed() {
      this.get('modalService').toggleModal();
    },

    launch(template) {
      let driver = get(this, 'drivers').findBy('name', get(template, 'driver'));
      this.setProperties({
        mode: 'launch',
        launchMachineTemplate: template,
        launchHostDriver: driver,
        clusterNodes: get(this, 'clusterNodes'),
      });
    },

    goBack() {
      if (this.get('clusterNodes')) {
        this.get('modalOpts.cluster.nodes').pushObjects(this.get('clusterNodes'));
      }
      this.get('modalService').toggleModal();
    },

    add() {
      this.setProperties({
        mode: 'add',
        addHostModel: {
          model: {
            availableDrivers: get(this, 'drivers'),
          }
        },
        clusterNodes: get(this, 'clusterNodes'),
      });
    },
  },
});
