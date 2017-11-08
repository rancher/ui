import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  application:         controller(),
  actions: {
    cancel(prev) {
      this.send('goToPrevious',prev);
    }
  }
});
