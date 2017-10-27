import Ember from 'ember';

const DELAY = 250;

export default Ember.Service.extend({
  mouseLeaveTimer: null,
  requireClick: false,
  tooltipOpts: null,
  openedViaContextClick: false,

  startTimer() {
    this.set('mouseLeaveTimer', Ember.run.later(() => {
      this.hide();
    }, DELAY));
  },

  cancelTimer() {
    Ember.run.cancel(this.get('mouseLeaveTimer'));
  },

  hide() {
    this.set('tooltipOpts', null);
  },

  leave() {
    if ( !this.get('requireClick') )
    {
      this.startTimer();
    }
  },
});
