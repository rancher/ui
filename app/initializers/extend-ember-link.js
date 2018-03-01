import LinkComponent from '@ember/routing/link-component';

export function initialize(/*application */) {
  LinkComponent.reopen({
    attributeBindings: ['tooltip', 'data-placement'],

    // Set activeParent=true on a {{link-to}} to automatically propagate the active
    // class to the parent element (like <li>{{link-to}}</li>)
    activeParent: false,

    addActiveObserver: function () {
      if (this.get('activeParent')) {
        this.addObserver('active', this, 'activeChanged');
        this.activeChanged();
      }
    }.on('didInsertElement'),

    isOnlyCurrentWhen() {
      if (!this.get('onlyCurrentWhen')) {
        return false;
      }
      let currentRouteName = this.get('application.currentRouteName');
      const route = this.get('params.firstObject');
      return !this.get('onlyCurrentWhen').some(r => currentRouteName.startsWith(r));
    },

    activeChanged() {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      // need to mark the parent drop down as active as well
      if (!!this.get('active')) {
        if (this.get('submenuItem')) {
          if (!this.$().closest('li.dropdown.active').length) {
            var $dropdown = this.$().closest('li.dropdown');
            $dropdown.addClass('active');
            $dropdown.siblings('li.active').removeClass('active');
          }
        } else {
          if (this.$().parent().siblings('li.dropdown.active').length) {
            this.$().parent().siblings('li.dropdown.active').removeClass('active');
          }
        }
      }

      if (this.get('active') && !this.isOnlyCurrentWhen()) {
        this.$().parent().toggleClass('active', true);
      } else {
        this.$().parent().toggleClass('active', false);
      }
    }
  });

}

export default {
  name: 'extend-ember-link',
  initialize: initialize
};
