import Ember from 'ember';

export function initialize(/*application */) {
  Ember.LinkComponent.reopen({
    attributeBindings: ['tooltip', 'data-placement'],

    // Set activeParent=true on a {{link-to}} to automatically propagate the active
    // class to the parent element (like <li>{{link-to}}</li>)
    activeParent: false,

    addActiveObserver: function() {
      if ( this.get('activeParent') ) {
        this.addObserver('active', this, 'activeChanged');
        this.activeChanged();
      }
    }.on('didInsertElement'),

    activeChanged() {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      this.$().parent().toggleClass('active', this.get('active'));
    }
  });

}

export default {
  name: 'extend-ember-link',
  initialize: initialize
};
