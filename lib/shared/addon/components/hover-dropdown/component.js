import Component from '@ember/component';
import layout from './template';
import { cancel, later } from '@ember/runloop';
import { oneWay } from '@ember/object/computed';
import { get, set } from '@ember/object';
import calculatePosition from 'shared/utils/calculate-position';
import { inject as service } from '@ember/service'
import $ from 'jquery';

export default Component.extend({
  router:             service(),
  layout,
  delay:              200,
  renderInPlace:      true,
  publicDropdownApi:  null,
  dropdownCloseDelay: 150,
  ddCloseDelayTimer:  null,

  openDelay:          oneWay('delay'),
  closeDelay:         oneWay('delay'),

  actions: {
    registerAPI(dd) {
      this.registerAPI(dd);
    },

    open(forContent, dropdown) {
      if (get(this, 'closeTimer') || this.isTransitioning()) {
        cancel(get(this, 'closeTimer'));

        set(this, 'closeTimer', null);
      } else {
        let openFn = () => {
          set(this, 'openTimer', null);

          this.openDropdown.call(this, forContent, dropdown);
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
      if (this.openTimer || this.isTransitioning()) {
        cancel(this.openTimer);

        set(this, 'openTimer', null);
      } else {
        let closeFn = () => {
          set(this, 'closeTimer', null);

          this.closeDropdown.call(this, forContent, dropdown);
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

  openDropdown(forContent, dropdown) {
    if ( forContent ) {
      if (this.onBeforeOpen) {
        this.onBeforeOpen(dropdown);
      }
    }

    dropdown.actions.open();

    if ( forContent ) {
      if (this.onOpen) {
        this.onOpen(dropdown);
      }
    }
  },

  closeDropdown(forContent, dropdown, skipFocus = true) {
    if ( forContent ) {
      if (this.onBeforeClose) {
        this.onBeforeClose(dropdown);
      }
    }

    // signature - event, skipfocus
    dropdown.actions.close(null, skipFocus);

    if ( forContent ) {
      if (this.onClose) {
        this.onClose(dropdown);
      }
    }
  },

  isTransitioning() {
    if (this.router._routerMicrolib && this.router._routerMicrolib.activeTransition && this.router._routerMicrolib.activeTransition.isTransition) {
      return true
    }

    return false;
  },

  registerAPI(publicDropdown) {
    set(this, 'publicDropdownApi', publicDropdown);
  },

  focusIn() {
    if (this.ddCloseDelayTimer) {
      clearTimeout(this.ddCloseDelayTimer);
    }
  },

  focusOut() {
    if (this.publicDropdownApi && this.publicDropdownApi.isOpen) {
      set(this, 'ddCloseDelayTimer', setTimeout(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        set(this, 'ddCloseDelayTimer', null);

        this.closeDropdown(null, this.publicDropdownApi);
      }, this.dropdownCloseDelay));
    }
  },

  keyUp(e) {
    const code                  = e.keyCode;
    const { publicDropdownApi } = this;
    let tabList                 = $(`#ember-basic-dropdown-content-${ publicDropdownApi.uniqueId } > LI > a:first-child`);
    let currentFocusIndex       = tabList.index(e.target);

    switch (code) {
    case 27: {
      if (publicDropdownApi && publicDropdownApi.isOpen) {
        this.closeDropdown(null, publicDropdownApi, false);
      }
      break;
    }
    case 38: {
      // up
      let nextIndex = currentFocusIndex - 1;

      if (nextIndex >= tabList.length) {
        tabList.eq(tabList.length).focus();
      } else {
        tabList.eq(nextIndex).focus();
      }

      break;
    }
    case 40: {
      // down
      if (publicDropdownApi && publicDropdownApi.isOpen) {
        let nextIndex = currentFocusIndex + 1;

        if (nextIndex >= tabList.length) {
          tabList.eq(0).focus();
        } else {
          tabList.eq(nextIndex).focus();
        }
      } else if (publicDropdownApi && !publicDropdownApi.isOpen) {
        this.openDropdown(null, publicDropdownApi);

        later(() => {
          $(`#ember-basic-dropdown-content-${ publicDropdownApi.uniqueId } > LI > a:first-child`).first().focus();
        }, 10)
      }
      break;
    }
    default:
    }
  },
});
