import Ember from 'ember';
import ModalBase from 'shared/mixins/modal-base';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend(ModalBase, {
  classNames:     ['medium-modal'],
  resources:      Ember.computed.alias('modalService.modalOpts.model'),
  alternateLabel: alternateLabel,

  actions: {
    stop: function() {
      this.get('resources').forEach((resource) => {
        resource.send('stop');

      });
      Ember.run.next(() => {
        this.send('cancel');
      });
    }
  }
});
