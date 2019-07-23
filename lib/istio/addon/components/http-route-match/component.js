import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object'
import EmberObject from '@ember/object';

const HEADERS = 'headers';
const EXACT = 'exact';
const PREFIX = 'prefix';
const REGEX = 'regex'
const AUTHORITY = 'authority';
const METHOD = 'method';
const URI = 'uri';
const SCHEME = 'scheme';

const CONDITIONS = [
  {
    label: 'cruVirtualService.http.routes.matches.condition.exact',
    value: EXACT
  },
  {
    label: 'cruVirtualService.http.routes.matches.condition.prefix',
    value: PREFIX
  },
  {
    label: 'cruVirtualService.http.routes.matches.condition.regex',
    value: REGEX
  },
];

function getStringMatch(condition, value) {
  const out = {};

  out[condition] = value

  return out;
}

export default Component.extend({
  layout,

  editing: true,

  matches:     null,
  route:       null,
  conditions:  CONDITIONS,
  model:       null,

  init() {
    this._super(...arguments);

    this.initMatches();
  },

  didInsertElement() {
    if ( get(this, 'matches.length') === 0 ) {
      this.send('addMatch');
    }
  },

  actions: {
    addMatch() {
      const match = EmberObject.create({
        matchType: HEADERS,
        condition: EXACT,
      });

      get(this, 'matches').pushObject(match);
    },

    removeMatch(match) {
      get(this, 'matches').removeObject(match);
    },

    removeRouteMatch(match) {
      if ( this.removeMatch ) {
        this.removeMatch(match);
      }
    },

    setGateways(gateways) {
      set(this, 'model.gateways', gateways);
    },

    setSourceLabels(labels) {
      if ( Object.keys(labels || {}).length > 0 ) {
        set(this, 'model.sourceLabels', labels)
      } else {
        const model = get(this, 'model');

        delete model['sourceLabels'];
      }
    }
  },

  portDidChange: observer('model.port', function() {
    const port = get(this, 'model.port');

    if ( port === undefined || port === '') {
      delete get(this, 'model')['port']
    }
  }),

  matchesDidChange: observer('matches.@each.{matchType,key,condition,value}', function() {
    const matches = get(this, 'matches') || [];
    const model = get(this, 'model');
    let authority = false;
    let method = false;
    let uri = false;
    let scheme = false;

    matches.filterBy('value').forEach((match) => {
      switch (match.matchType) {
      case AUTHORITY:
        set(model, AUTHORITY, getStringMatch(match.condition, match.value))
        authority = true;
        break;
      case URI:
        set(model, URI, getStringMatch(match.condition, match.value))
        uri = true;
        break;
      case SCHEME:
        set(model, SCHEME, getStringMatch(match.condition, match.value))
        scheme = true;
        break;
      case METHOD:
        set(model, METHOD, getStringMatch(match.condition, match.value))
        method = true
        break;
      }
    });

    if ( !authority ) {
      delete model[AUTHORITY];
    }

    if ( !method ) {
      delete model[METHOD];
    }

    if ( !uri ) {
      delete model[URI];
    }

    if ( !scheme ) {
      delete model[SCHEME];
    }

    this.setHeaders();
  }),

  setHeaders() {
    const model = get(this, 'model');
    const matches = get(this, 'matches') || [];
    const out = {};

    matches.filter((match) => match.key && match.value && match.matchType === HEADERS).forEach((match) => {
      set(out, match.key, getStringMatch(match.condition, match.value));
    })

    if ( Object.keys(out).length > 0 ) {
      set(model, HEADERS, out)
    } else {
      delete model[HEADERS];
    }
  },

  initMatches() {
    const out = [];
    const model = get(this, 'model') || {};

    const authority = get(model, AUTHORITY);
    const method = get(model, METHOD);
    const uri = get(model, URI);
    const scheme = get(model, SCHEME);
    const headers = get(model, HEADERS);

    if ( authority ) {
      out.pushObjects(this.getMatchArray(AUTHORITY, authority))
    }
    if ( method ) {
      out.pushObjects(this.getMatchArray(METHOD, method))
    }
    if ( uri ) {
      out.pushObjects(this.getMatchArray(URI, uri))
    }
    if ( scheme ) {
      out.pushObjects(this.getMatchArray(SCHEME, scheme))
    }
    if ( headers ) {
      Object.keys(headers).forEach((key) => {
        const array = this.getMatchArray(HEADERS, headers[key]);

        array.forEach((item) => set(item, 'key', key));
        out.pushObjects(array);
      })
    }

    set(this, 'matches', out);
  },

  getMatchArray(type, match) {
    const out = [];

    if ( !match ) {
      return out;
    }

    const exact = get(match, EXACT);
    const prefix = get(match, PREFIX);
    const regex = get(match, REGEX);

    if ( exact ) {
      out.push({
        matchType: type,
        condition: EXACT,
        value:     exact
      })
    }

    if ( prefix ) {
      out.push({
        matchType: type,
        condition: PREFIX,
        value:     prefix
      })
    }

    if ( regex ) {
      out.push({
        matchType: type,
        condition: REGEX,
        value:     regex
      })
    }

    return out;
  }
});
