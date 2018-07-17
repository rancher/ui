import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import { alternateLabel } from 'ui/utils/platform';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:     ['modal-container', 'medium-modal', 'alert'],
  alternateLabel,

  resources: alias('modalService.modalOpts.model'),
  actions:   {
    evacuate() {
      this.get('resources').forEach((resource) => {
        resource.doAction('evacuate');
      });

      next(() => {
        this.send('cancel');
      });
    }
  }
});
