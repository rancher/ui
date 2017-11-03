import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['medium-modal', 'modal-logs'],
  originalModel  : Ember.computed.alias('modalService.modalOpts.originalModel'),
  action         : Ember.computed.alias('modalService.modalOpts.action'),
  alternateLabel : alternateLabel,
  intl           : Ember.inject.service(),

  actions: {

    confirm: function() {
      this.get('originalModel').send(this.get('action'));
      this.send('cancel');
    },
  },

  didRender: function() {
    setTimeout(() => {
      try {
        this.$('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },

  isService: Ember.computed('originalModel.type','intl.locale', function() {
    let type = this.get('originalModel.type');
    let out  = {};
    let intl = this.get('intl');

    switch (type) {
      case 'project':
        out.message = intl.t('modalConfirmDeactivate.buttons.project.message');
        out.button  = intl.t('modalConfirmDeactivate.buttons.project.button');
        break;
      case 'environment':
        out.message = intl.t('modalConfirmDeactivate.buttons.environment.message');
        out.button  = intl.t('modalConfirmDeactivate.buttons.environment.button');
        break;
      default:
        out.message = intl.t('modalConfirmDeactivate.buttons.default.message');
        out.button  = intl.t('modalConfirmDeactivate.buttons.default.button');
        break;
    }

    return out;
  }),
});
