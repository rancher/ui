import Ember from 'ember';
import C from 'ui/utils/constants';
import { positionDropdown } from 'ui/utils/position-dropdown';

const DROPDOWNCLOSETIMER = 250;
const PARENT             = 'HEADER NAV';
const SELECTOR           = 'NAV .dropdown';
const WINDOW_SM          = 694;
let timerObj             = null;
let dropdown             = null;

export default Ember.Mixin.create({
  didInsertElement: function() {
    let $body = Ember.$('BODY');

    if ($body.hasClass('touch') && Ember.$(window).width() <= WINDOW_SM) {

      // below iphone 6plus vertical width no need for dropdown logic
      this.$().on('click', () => {
        if (dropdown) {
          Ember.run.later(() => {
            this.clearHeaderMenus();
          }, DROPDOWNCLOSETIMER);
        }
      });

      this.$('#environment-dropdown').on('touchstart', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.touchHandler(e);
      });

      this.$('ul[data-dropdown-id="enviroment"] > li > a').on('touchend', () => {
        if (dropdown) {
          Ember.run.later(() => {
            this.clearHeaderMenus();
          }, DROPDOWNCLOSETIMER);
        }
      });


    } else {

      // ipad/tablet width
      $body.on('touchend', (e) => {
        let $el = $(e.target);
        if ($el.closest('.navbar').length < 1) {
          Ember.run.later(() => {
            this.clearHeaderMenus();
          });
        }
      });


      this.$().on('touchstart', SELECTOR, (e) => {
        let $el = $(e.currentTarget).find('a.dropdown-toggle');

        if ($el.attr('aria-expanded') === 'false') {
          e.preventDefault();
          e.stopPropagation();
          this.enterHandler(e);
        }
      });

      // desktop width
      this.$().on('click', SELECTOR, (e) => {
        this.onClickHandler(e, false);
      });

      this.$().on('mouseenter', SELECTOR, (e) => {
        this.enterHandler(e, false);
      });

      this.$().on('mouseleave', SELECTOR, () => {
        this.leaveHandler();
      });

      this.$().on('keydown', `${SELECTOR} a`, (e) => {
        this.keydownHandler(e);
      });
    }

  },

  touchHandler(e) {
    let anchor = Ember.$(e.currentTarget);

    Ember.run.cancel(timerObj);

    timerObj   = null;
    if (dropdown) { // dropdown open alread

      if (dropdown.data('dropdown-id') !== Ember.$(e.currentTarget).find('ul').data('dropdown-id')) { // not the same dropdown

        this.clearHeaderMenus();

        dropdown = Ember.$(e.currentTarget).siblings('ul');

        if (dropdown) {
          this.showMenu(anchor, dropdown);
        }
      }
    } else { // no dropdown open

      dropdown = Ember.$(e.currentTarget).siblings('ul');

      if (dropdown) {
        this.showMenu(anchor, dropdown);
      }
    }
  },

  enterHandler(e) {
    let anchor = Ember.$(e.currentTarget).find('a:first');

    Ember.run.cancel(timerObj);

    timerObj   = null;

    if (dropdown) { // dropdown open alread

      if (dropdown.data('dropdown-id') !== Ember.$(e.currentTarget).find('ul').data('dropdown-id')) { // not the same dropdown

        this.clearHeaderMenus();

        dropdown = Ember.$(e.currentTarget).find('ul');

        if (dropdown) {
          this.showMenu(anchor, dropdown);
        }
      }
    } else { // no dropdown open

      dropdown = Ember.$(e.currentTarget).find('ul');

      if (dropdown) {
        this.showMenu(anchor, dropdown);
      }
    }

  },

  leaveHandler() {
    timerObj = Ember.run.later(() => {

      if (dropdown) {

        this.clearHeaderMenus();

        timerObj = null;
      }

    }, DROPDOWNCLOSETIMER);
  },

  onClickHandler(e) {
    let anchor = Ember.$(e.target).closest('A');
    if ( anchor.hasClass('dropdown-toggle') && anchor[0].href.match(/#$/) ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    timerObj = null;

    let collapsedNav = Ember.$('#navbar');

    if (collapsedNav.hasClass('in')) {
      collapsedNav.collapse('toggle');
    }

    this.clearHeaderMenus();
  },

  keydownHandler(e) {
    let items = this.get('items');
    let currentIndex = 0;

    let element      = Ember.$(e.currentTarget);
    let dropdownMenu = element.siblings('ul').length ? element.siblings('ul') : element.parent().parent('ul'); // if we're not in the top link we're in the ul links

    if (dropdownMenu) {
      items = dropdownMenu.find('li > a');
      currentIndex = items.index(e.currentTarget);

      if (currentIndex < 0) {
        currentIndex = 0;
      }
    }

    switch (e.which) {
      case C.KEY.ESCAPE:
        this.clearHeaderMenus();
        element.focus();
        break;
      case C.KEY.SPACE:
        this.clearHeaderMenus();
        this.showMenu(element, dropdownMenu);
        break;
      case C.KEY.UP:
        if (currentIndex > 0) {
          currentIndex--;
        }
        items.eq(currentIndex).focus();
        break;
      case C.KEY.DOWN:
        var $currentTarget = $(e.currentTarget);
        if (dropdownMenu && !$currentTarget.parent().parent('ul.dropdown-menu').length) {
          this.clearHeaderMenus();
          this.showMenu(element, dropdownMenu);
          dropdownMenu.addClass('block');
          if (element.attr('aria-expanded') === false) {
            element.attr('aria-expanded', true);
          }
        } else {
          if (currentIndex < items.length -1) {
            currentIndex++;
          }
        }
        items.eq(currentIndex).focus();
        break;
      default:
        break;
    }
  },

  showMenu: function(el, drpd) {
    let body = Ember.$('BODY');
    if (body.hasClass('touch')) {
      Ember.$('BODY').addClass('nav-dropdown-open');
    }

    drpd.addClass('invisible');
    drpd.addClass('block');
    positionDropdown(drpd, el, drpd.hasClass('dropdown-menu-right'));
    drpd.removeClass('invisible');

    if (el.attr('aria-expanded')) {
      el.attr('aria-expanded', true);
    }
  },

  clearHeaderMenus: function() {
    let body = Ember.$('BODY');
    if (body.hasClass('touch')) {
      Ember.$('BODY').removeClass('nav-dropdown-open');
    }
    const navbar       = Ember.$(PARENT);

    dropdown = null;

    navbar.find('.dropdown-menu.block').removeClass('block');
    navbar.find('a.dropdown-toggle[aria-expanded=true]').attr('aria-expanded', false);
  }
});
