import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import $ from 'jquery';
import { get } from '@ember/object';

export default Component.extend(ModalBase, {
  intl:       service(),
  layout,
  classNames:     ['medium-modal', 'modal-logs'],
  azureAd:    alias('modalService.modalOpts.azureAd'),
  config:     alias('modalService.modalOpts.model'),
  //   originalModel:  alias('modalService.modalOpts.originalModel'),
  action:         alias('modalService.modalOpts.action'),
  didRender() {
    setTimeout(() => {
      try {
        $('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },

  actions:        {

    confirm() {
      get
      this.get('azureAd').upgrade(get(this, 'config'))
      this.send('cancel');
    },
  },

});
