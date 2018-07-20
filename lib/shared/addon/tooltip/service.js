import { later, cancel } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';

const DELAY = 250;

export default Service.extend({
  app:                   service(),

  mouseLeaveTimer:       null,
  requireClick:          false,
  tooltipOpts:           null,
  openedViaContextClick: false,
  childOpened:           false,

  startTimer() {
    this.set('mouseLeaveTimer', later(() => {
      this.hide();
    }, DELAY));
  },

  cancelTimer() {
    cancel(this.get('mouseLeaveTimer'));
  },

  hide() {
    if (!get(this, 'childOpened')) {
      this.set('tooltipOpts', null);
    }
  },

  leave() {
    if ( !this.get('requireClick') ) {
      this.startTimer();
    }
  },

});
