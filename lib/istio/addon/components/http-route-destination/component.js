import Component from '@ember/component';
import layout from './template';
import { get, set, observer, setProperties } from '@ember/object'
import EmberObject from '@ember/object';
import { isNumeric } from 'shared/utils/util';

export default Component.extend({
  layout,

  editing: true,

  httpRouteDestinations: null,


  init() {
    this._super(...arguments);

    this.initDestinations();
  },

  didInsertElement() {
    if ( !get(this, 'route.type') && get(this, 'httpRouteDestinations.length') === 0 ) {
      this.send('addDestination');
    }
  },

  actions: {
    addDestination() {
      const destination = EmberObject.create({
        destination: { subset: this.getNewVersion(),  },
        weight:      get(this, 'httpRouteDestinations.length') === 0 ? 100 : 0
      });
      const hosts = get(this, 'hosts') || [];
      const firstHost = get(hosts, 'firstObject');

      if ( hosts.length === 1 && firstHost && firstHost.indexOf('*') === -1 ) {
        set(destination, 'destination.host', firstHost);
      }

      get(this, 'httpRouteDestinations').pushObject(destination);
    },

    removeDestination(destination) {
      get(this, 'httpRouteDestinations').removeObject(destination);
    },
  },

  hostsDidChange:  observer('hosts.[]', function() {
    const hosts = get(this, 'hosts') || [];
    const firstHost = get(hosts, 'firstObject');

    if ( hosts.length === 1 && firstHost && firstHost.indexOf('*') === -1 ) {
      (get(this, 'httpRouteDestinations') || []).forEach((destination) => {
        set(destination, 'destination.host', firstHost);
      });
    }
  }),

  inputDidChange: observer('httpRouteDestinations.@each.{weight,portNumberOrName}', function() {
    const httpRouteDestinations = (get(this, 'httpRouteDestinations') || []);

    httpRouteDestinations.forEach((destination) => {
      const port = get(destination, 'portNumberOrName');

      if ( port && isNumeric(port) ) {
        set(destination, 'destination.port', { number: parseInt(port, 10) });
      } else if ( port ) {
        set(destination, 'destination.port', { name: port });
      } else {
        delete destination.destination['port']
      }
    });

    if ( httpRouteDestinations.length === 2 ) {
      let { weight1, weight2 } = this.getCurrentWeights();

      if ( weight1 === get(this, 'weight1') && weight2 !== get(this, 'weight2') ) {
        weight1 = 100 - weight2;
        set(httpRouteDestinations[0], 'weight', weight1);
      } else if ( weight1 !== get(this, 'weight1') && weight2 === get(this, 'weight2') ) {
        weight2 = 100 - weight1;
        set(httpRouteDestinations[1], 'weight', weight2);
      }

      setProperties(this, {
        weight1,
        weight2
      })
    }
  }),

  getNewVersion() {
    const name = get(this, 'httpRouteDestinations.lastObject.destination.subset');

    if ( name ) {
      const matches = name.match(/\d+$/);

      if ( matches.length > 0) {
        const prefix = name.slice(0, name.length - matches[0].length);

        return `${ prefix }${ parseInt(matches[0], 10) + 1 }`
      }
    } else {
      return 'v1';
    }

    return '';
  },

  getCurrentWeights() {
    const httpRouteDestinations = (get(this, 'httpRouteDestinations') || []);
    let weight1 = 0;
    let weight2 = 0;

    if ( httpRouteDestinations.length === 2 ) {
      const dest1 = httpRouteDestinations[0];
      const dest2 = httpRouteDestinations[1];

      weight1 = get(dest1, 'weight');
      weight2 = get(dest2, 'weight');

      if ( !weight1 ) {
        weight1 = 0;
      }

      if ( !weight2 ) {
        weight2 = 0;
      }

      weight1 = parseInt(weight1, 10);
      weight2 = parseInt(weight2, 10);
    }

    return {
      weight1,
      weight2
    }
  },

  initDestinations() {
    const httpRouteDestinations = (get(this, 'httpRouteDestinations') || []);

    httpRouteDestinations.forEach((destination) => {
      const port = get(destination, 'destination.port');

      if ( port ) {
        set(destination, 'portNumberOrName', get(port, 'name') || get(port, 'number') || null);
      }
    });

    if ( httpRouteDestinations.length === 2 ) {
      setProperties(this, this.getCurrentWeights());
    }
  }
});
