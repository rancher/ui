import { later, cancel } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

const DELAY = 250;

export default Service.extend({
  mouseLeaveTimer: null,
  requireClick: false,
  tooltipOpts: null,
  openedViaContextClick: false,
  app: service(),

  startTimer() {
    this.set('mouseLeaveTimer', later(() => {
      this.hide();
    }, DELAY));
  },

  cancelTimer() {
    cancel(this.get('mouseLeaveTimer'));
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
