import Ember from 'ember';

export default Ember.Mixin.create({
  pollInterval: 2000,

  growl: Ember.inject.service(),

  pollTimer: null,

  setupController() {
    this._super(...arguments);
    this.scheduleTimer();
  },

  deactivate() {
    this.cancelTimer();
  },

  scheduleTimer() {
    Ember.run.cancel(this.get('pollTimer'));
    this.set('pollTimer', Ember.run.later(() => {
      let controller = this.controller;
      let qp = {};
      (controller.get('queryParams')||[]).forEach((param) => {
        qp[param] = controller.get(param);
      });
      this.model(qp).then((model) => {
        this.controller.set('model', model);

        if ( this.get('pollTimer') ) {
          this.scheduleTimer();
        }
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    }, this.get('pollInterval')));
  },

  cancelTimer() {
    Ember.run.cancel(this.get('pollTimer'));
    // This prevents scheduleTimer from rescheduling if deactivate happened at just the wrong time.
    this.set('pollTimer', null);
  }
});
