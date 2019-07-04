import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';
import { get, set, observer } from '@ember/object'
import EmberObject from '@ember/object';

export default Component.extend({
  layout,

  editing:               true,
  route:                 null,
  showMatch:             false,
  httpRouteDestinations:  alias('route.route'),

  init() {
    this._super(...arguments);
    this.initRoute();
  },

  actions: {
    removeRoute(route) {
      if ( this.removeRoute ) {
        this.removeRoute(route);
      }
    },

    moveUpRoute(route) {
      const routes = get(this, 'routes');

      if ( routes ) {
        const index = routes.indexOf(route);

        routes.removeObject(route);
        routes.insertAt(index - 1, route);
      }
    },

    moveDownRoute(route) {
      const routes = get(this, 'routes');

      if ( routes ) {
        const index = routes.indexOf(route);

        routes.removeObject(route);
        routes.insertAt(index + 1, route);
      }
    },

    addMatch() {
      const match = EmberObject.create({});

      get(this, 'route.match').pushObject(match);
    },

    removeMatch(match) {
      get(this, 'route.match').removeObject(match);

      if ( get(this, 'route.match.length') === 0 && get(this, 'showMatch') ) {
        set(this, 'showMatch', false);
      }
    },

  },

  showMatchDidChange: observer('showMatch', function() {
    const showMatch = get(this, 'showMatch');

    if ( showMatch ) {
      if ( !get(this, 'route.match') ) {
        set(this, 'route.match', []);
      }
      if ( get(this, 'route.match.length') === 0 ) {
        this.send('addMatch');
      }

      const routes = get(this, 'routes');

      if ( routes ) {
        routes.removeObject(get(this, 'route'));
        routes.unshiftObject(get(this, 'route'));
      }
    } else {
      const route = get(this, 'route');

      delete route['match'];
    }
  }),

  initRoute() {
    if ( get(this, 'route.match.length') > 0 ) {
      set(this, 'showMatch', true);
    }

    if ( !get(this, 'httpRouteDestinations') ) {
      set(this, 'route.route', []);
    }

    const route = get(this, 'route');

    if ( !get(route, 'fault') ) {
      set(route, 'fault', {
        abort: {},
        delay: {}
      })
    } else if ( !get(route, 'fault.abort') ) {
      set(route, 'fault.abort', {})
    } else if ( !get(route, 'fault.delay') ) {
      set(route, 'fault.delay', {})
    }

    if ( !get(route, 'redirect') ) {
      set(route, 'redirect', {})
    }

    if ( !get(route, 'rewrite') ) {
      set(route, 'rewrite', {})
    }

    if ( !get(route, 'mirror') ) {
      set(route, 'mirror', {})
    }

    if ( !get(route, 'retries') ) {
      set(route, 'retries', {})
    }
  }
});
