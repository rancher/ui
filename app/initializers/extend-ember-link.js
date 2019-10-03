import LinkComponent from '@ember/routing/link-component';
import { get } from '@ember/object';
import { on } from '@ember/object/evented';
import $ from 'jquery';

export function initialize(/* application */) {
  LinkComponent.reopen({
    attributeBindings: ['tooltip', 'data-placement'],

    // Set activeParent=LI on a {{link-to}} to automatically propagate the active
    // class to the parent element of that tag name (like <li>{{link-to}}</li>)
    activeParent: null,

    addActiveObserver: on('didInsertElement', function() {
      if ( this.get('activeParent') ) {
        this.addObserver('active', this, 'activeChanged');
        this.addObserver('application.currentRouteName', this, 'activeChanged');
        this.activeChanged();
      }
    }),

    activeChanged() {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      const parent = $().closest(get(this, 'activeParent'));

      if ( !parent || !parent.length ) {
        return;
      }

      let active = !!get(this, 'active');
      let more = get(this, 'currentWhen');

      if ( !active && more && more.length) {
        const currentRouteName = get(this, 'application.currentRouteName');

        for ( let i = 0 ; i < get(more, 'length') ; i++ )  {
          const entry = more.objectAt(i);

          if ( currentRouteName === entry || currentRouteName.startsWith(`${ entry }.`) ) {
            active = true;
            break;
          }
        }
      }

      parent.toggleClass('active', active);
    }
  });
}

export default {
  name:       'extend-ember-link',
  initialize
};
