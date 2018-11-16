import Component from '@ember/component';
import layout from './template';
import { cancel, later } from '@ember/runloop';
import { oneWay } from '@ember/object/computed';
import { get, set } from '@ember/object';
import calculatePosition from 'shared/utils/calculate-position';

export default Component.extend({
  layout,
  delay:      200,
  openDelay:  oneWay('delay'),
  closeDelay: oneWay('delay'),

  actions: {

    open(forContent, dropdown) {
      if (get(this, 'closeTimer')) {
        cancel(get(this, 'closeTimer'));
        set(this, 'closeTimer', null);
      } else {
        let openFn = () => {
          set(this, 'openTimer', null);

          if ( forContent ) {
            this.sendAction('onBeforeOpen');
          }

          dropdown.actions.open();

          if ( forContent ) {
            this.sendAction('onOpen');
          }
        };

        let openDelay = get(this, 'openDelay');

        if (openDelay) {
          set(this, 'openTimer', later(openFn, openDelay));
        } else {
          openFn();
        }
      }
    },

    close(forContent, dropdown) {
      if (this.openTimer) {
        cancel(this.openTimer);
        set(this, 'openTimer', null);
      } else {
        let closeFn = () => {
          set(this, 'closeTimer', null);
          // signature - event, skipfocus

          if ( forContent ) {
            this.sendAction('onBeforeClose');
          }

          dropdown.actions.close(null, true);

          if ( forContent ) {
            this.sendAction('onClose');
          }
        };

        let closeDelay = get(this, 'closeDelay');

        if (closeDelay) {
          set(this, 'closeTimer', later(closeFn, closeDelay));
        } else {
          closeFn();
        }
      }
    },

    prevent() {
      return false;
    },

    calculatePosition,
  },
});
