import { cancel, later } from '@ember/runloop';
import Route from '@ember/routing/route';

const INTERVAL = 2000;

export default Route.extend({
  model() {
    return this.get('userStore').find('hamembership');
  },

  activate() {
    this.scheduleTimer();
  },

  deactivate() {
    cancel(this.get('timer'));
    this.set('timer', null); // This prevents scheduleTimer from rescheduling if deactivate happened at just the wrong time.
  },

  timer: null,
  scheduleTimer: function() {
    cancel(this.get('timer'));
    this.set('timer', later(() => {
      this.get('userStore').find('hamembership', null, {forceReload: true}).then((response) => {
        this.controller.set('model', response);
        if ( this.get('timer') ) {
          this.scheduleTimer();
        }
      });
    }, INTERVAL));
  },
});
