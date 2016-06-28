import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  dropdownSelector: '.navbar .dropdown',
  didInsertElement: function() {
    const dropdownCloseTimer = 250;
    let dropdown             = null;
    let timerObj             = null;
    let selector             = this.get('dropdownSelector');

    this.$().on('click', selector, (e) => {
      let anchor = Ember.$(e.target).closest('A');
      if ( anchor.hasClass('dropdown-toggle') && anchor[0].href.match(/#$/) ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      timerObj = null;
      dropdown = null;

      let collapsedNav = Ember.$('#navbar');

      if (collapsedNav.hasClass('in')) {
        collapsedNav.collapse('toggle');
      }

      this.clearHeaderMenus();
    });

    this.$().on('mouseenter', selector, (e) => {
      let anchor = Ember.$(e.currentTarget).find('a:first');

      Ember.run.cancel(timerObj);

      timerObj   = null;

      if (dropdown) { // dropdown open alread

        if (dropdown.data('dropdown-id') !== Ember.$(e.currentTarget).find('ul').data('dropdown-id')) { // not the same dropdown

          this.clearHeaderMenus();

          dropdown = null;
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

    });

    this.$().on('mouseleave', selector, () => {
      timerObj = Ember.run.later(() => {

        if (dropdown) {

          this.clearHeaderMenus();

          dropdown = null;
          timerObj = null;
        }

      }, dropdownCloseTimer);
    });

    this.$().on('keydown', `${selector} a`, (e) => {
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
          let $currentTarget = $(e.currentTarget);
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
    });
  },

  showMenu: function(el, drpd) {
    drpd.addClass('block');
    if (el.attr('aria-expanded')) {
      el.attr('aria-expanded', true);
    }
  },

  clearHeaderMenus: function() {
    const navbar       = Ember.$('.navbar');

    navbar.find('.dropdown-menu.block').removeClass('block');
    navbar.find('a.dropdown-toggle[aria-expanded=true]').attr('aria-expanded', false);
  }
});
