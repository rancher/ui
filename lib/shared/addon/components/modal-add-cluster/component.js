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
  scope: alias('modalOpts.scope'),
  actions: {
    add() {
      get(this, 'list').pushObject(get(this, 'newHost'));
      get(this, 'scope').notifyPropertyChange('clusterList');
      get(this, 'scope').notifyPropertyChange(get(this, 'list'));
      this.send('cancel');
    },
  },
});
