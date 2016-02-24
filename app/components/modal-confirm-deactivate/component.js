import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';

export default Ember.Component.extend({
  originalModel  : null,
  action         : null,
  alternateLabel : alternateLabel,

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

  isService: Ember.computed('originalModel.type', function() {
    let type = this.get('originalModel.type');
    let out  = {};

    switch (type) {
      case 'service':
        out.message = 'deactivate';
        out.button  = 'Deactivate';
        break;
      case 'project':
        out.message = 'deactivate your environment';
        out.button  = 'Deactivate';
        break;
      case 'environment':
        out.message = 'stop services for';
        out.button  = 'Stop Services';
        break;
      default:
        break;
    }

    return out;
  }),
});
