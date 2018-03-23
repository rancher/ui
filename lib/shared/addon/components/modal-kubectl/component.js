import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  access: service(),
  scope: service(),

  classNames: ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],
  model: null,
  error: null,

  init() {
    this._super(...arguments);
    this.shortcuts.disable();
  },

  willDestroy() {
    this._super(...arguments);
    this.shortcuts.enable();
  },

  url: alias('scope.currentCluster.links.shell'),
});
