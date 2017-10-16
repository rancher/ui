import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  isCaas               : Ember.computed.equal('app.mode',C.MODE.CAAS),
  newPassword: null,

  actions: {
    done() {
      window.history.back();
      //this.send('goToPrevious');
    }
  },
});
