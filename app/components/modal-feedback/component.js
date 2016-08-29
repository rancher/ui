import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  prefs: Ember.inject.service(),

  actions: {
    outsideClick() {
    },

    send() {
      this.set(`prefs.${C.PREFS.FEEDBACK}`,'sent');
      this.sendAction('dismiss');
    },

    cancel() {
      let time = (new Date()).getTime() + C.PREFS.FEEDBACK_DELAY;
      this.set(`prefs.${C.PREFS.FEEDBACK_TIME}`, time);
      this.sendAction('dismiss');
    },

    never() {
      this.set(`prefs.${C.PREFS.FEEDBACK}`,'never');
      this.sendAction('dismiss');
    }
  },
});
