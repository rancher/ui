import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  model:      alias('modalService.modalOpts'),
  router:     service(),

  name: null,
  error: null,

  actions: {
    save(cb) {
      this.set('error', null);
      this.get('model').doAction('converttoservice', {}).then(() => {
        this.send('cancel');
        next(() => {
          this.get('router').transitionTo('containers.index');
        });
      }).catch((err) => {
        this.set('error', err);
      }).finally(() => {
        cb();
      });
    },
  },

  didReceiveAttrs() {
    this.set('name', this.get('model.displayName'));
  },

});
