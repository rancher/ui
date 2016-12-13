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
  },

  timer: null,
  scheduleTimer: function() {
    Ember.run.cancel(this.get('timer'));
    this.set('timer', Ember.run.later(() => {
      this.get('userStore').find('clustermembership').then((response) => {
        this.controller.get('model').replaceWith(response);
        this.scheduleTimer();
      });
    }, INTERVAL));
  },

});
