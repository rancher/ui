import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  settings:   service(),
  layout,
  classNames: ['modal-container', 'about', 'span-6', 'offset-3', 'alert'],
});
