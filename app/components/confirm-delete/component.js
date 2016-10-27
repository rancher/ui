import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'medium-modal'],
  resources: Ember.computed.alias('modalService.modalOpts'),
  alternateLabel: alternateLabel,
  settings: Ember.inject.service(),

  actions: {
    confirm: function() {
      this.get('resources').forEach((resource) => {
        resource.delete();
      });

      this.send('cancel');
    },

  },

  isEnvironment: Ember.computed('resources', function() {
    let resources = this.get('resources');
    let out = false;

    resources.forEach((resource) => {
      if (resource.type === 'project') {
        out = true;
      }
    });

    return out;
  }),

  didRender: function() {
    setTimeout(() => {
      try {
        this.$('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  }
});
