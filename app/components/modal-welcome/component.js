import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  classNames      : ['modal-welcome'],

  optIn: null,

  didInitAttrs() {
    let cur = this.get('settings').get(C.SETTING.TELEMETRY);
    this.set('optIn', cur !== 'out');
  },

  actions: {
    outsideClick() {
    },

    cancel() {
      this.get('settings').set(C.SETTING.TELEMETRY, (this.get('optIn') ? 'in' : 'out'));
      this.sendAction('dismiss');
    },
  },
});
