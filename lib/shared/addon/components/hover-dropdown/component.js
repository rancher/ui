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

    open(dropdown) {

      if (get(this, 'closeTimer')) {

        cancel(get(this, 'closeTimer'));
        set(this, 'closeTimer', null);

      } else {

        let openFn = () => {

          set(this, 'openTimer', null);
          dropdown.actions.open();

        };

        let openDelay = get(this, 'openDelay');

        if (openDelay) {

          set(this, 'openTimer', later(openFn, openDelay));

        } else {

          openFn();

        }

      }

    },

    close(dropdown) {

      if (this.openTimer) {

        cancel(this.openTimer);
        set(this, 'openTimer', null);

      } else {

        let closeFn = () => {

          set(this, 'closeTimer', null);
          // signature - event, skipfocus
          dropdown.actions.close(null, true);

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
