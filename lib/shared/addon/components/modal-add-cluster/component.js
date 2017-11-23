import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get/* , set */ } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  newHost: alias('modalOpts.newHost'),
  list: alias('modalOpts.list'),
  actions: {
    add() {
      get(this, 'list').pushObject(get(this, 'newHost'));
      this.send('cancel');
    },
  },
});
