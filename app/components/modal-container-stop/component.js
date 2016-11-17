import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';
import { alternateLabel } from 'ui/utils/platform';

const TIMEOUT = 10;
export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'medium-modal'],
  resources: Ember.computed.alias('modalService.modalOpts.model'),
  inputTimeout: null,
  alternateLabel: alternateLabel,
  defaultTimeout: TIMEOUT,
  init() {
    this._super(...arguments);
    this.set('inputTimeout', TIMEOUT);
  },
  actions: {
    stop: function() {
      this.get('resources').forEach((resource) => {
        resource.doAction('stop', { timeout: (this.get('inputTimeout') || TIMEOUT) });
      });
      Ember.run.next(() => {
        this.send('cancel');
      });
    }
  }
});
