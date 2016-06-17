import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend({
  originalModel  : null,
  action         : null,
  alternateLabel : alternateLabel,
  intl           : Ember.inject.service(),

  actions: {

    confirm: function() {
      this.get('originalModel').send(this.get('action'));
      this.sendAction('dismiss');
    },

    cancel: function() {
      this.sendAction('dismiss');
    },

  },

  didRender: function() {
    setTimeout(() => {
      this.$('BUTTON')[0].focus();
    }, 500);
  },

  isService: Ember.computed('originalModel.type','intl._locale', function() {
    let type = this.get('originalModel.type');
    let out  = {};
    let intl = this.get('intl');

    switch (type) {
      case 'project':
        out.message = intl.t('modalConfirmDeactiviate.buttons.project.message');
        out.button  = intl.t('modalConfirmDeactiviate.buttons.project.button');
        break;
      case 'environment':
        out.message = intl.t('modalConfirmDeactiviate.buttons.environment.message');
        out.button  = intl.t('modalConfirmDeactiviate.buttons.environment.button');
        break;
      default:
        out.message = intl.t('modalConfirmDeactiviate.buttons.default.message');
        out.button  = intl.t('modalConfirmDeactiviate.buttons.default.button');
        break;
    }

    return out;
  }),
});
