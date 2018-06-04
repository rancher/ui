import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  router:     service(),
  layout,
  classNames: ['medium-modal', 'alert'],

  canConfig: alias('modalService.modalOpts.canConfig'),

  actions: {
    save() {
      get(this, 'router').transitionTo('authenticated.project.pipeline.settings');
    },
  }
});
