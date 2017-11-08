import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  isCaas               : equal('app.mode',C.MODE.CAAS),
  newPassword: null,

  actions: {
    done() {
      window.history.back();
      //this.send('goToPrevious');
    }
  },
});
