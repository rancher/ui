import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';
import { alternateLabel } from 'ui/utils/platform';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'medium-modal'],
  resources: Ember.computed.alias('modalService.modalOpts.model'),
  alternateLabel: alternateLabel,

  actions: {
    evacuate: function() {
      this.get('resources').forEach((resource) => {
        resource.doAction('evacuate');
      });

      Ember.run.next(() => {
        this.send('cancel');
      });
    }
  }
});
