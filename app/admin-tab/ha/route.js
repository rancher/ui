import Ember from 'ember';

const INTERVAL = 2000;

export default Ember.Route.extend({
  model() {
    return this.get('userStore').find('clustermembership');
  },

  activate() {
    this.scheduleTimer();
  },

  deactivate() {
    Ember.run.cancel(this.get('timer'));
    this.set('timer', null); // This prevents scheduleTimer from rescheduling if deactivate happened at just the wrong time.
  },

  timer: null,
  scheduleTimer: function() {
    Ember.run.cancel(this.get('timer'));
    this.set('timer', Ember.run.later(() => {
      this.get('userStore').find('clustermembership', null, {forceReload: true}).then((response) => {
        this.controller.set('model', response);
        if ( this.get('timer') ) {
          this.scheduleTimer();
        }
      });
    }, INTERVAL));
  },
});
