import {  get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
const AUTHORITY = 'authority';
const METHOD = 'method';
const URI = 'uri';
const SCHEME = 'scheme';
const HEADERS = 'headers';
const TYPES = [
  {
    label: 'cruVirtualService.http.routes.matches.type.uri',
    value: URI
  },
  {
    label: 'cruVirtualService.http.routes.matches.type.scheme',
    value: SCHEME
  },
  {
    label: 'cruVirtualService.http.routes.matches.type.method',
    value: METHOD
  },
  {
    label: 'cruVirtualService.http.routes.matches.type.authority',
    value: AUTHORITY
  },
  {
    label: 'cruVirtualService.http.routes.matches.type.headers',
    value: HEADERS
  },
];

export default Component.extend({
  layout,

  match:       null,
  matcheTypes: TYPES,

  init() {
    this._super(...arguments);
    this.initMatcheTypes();
  },

  matchesDidChange: observer('matches.@each.{matchType,key,condition,value}', function() {
    set(this, 'matcheTypes', TYPES.filter((choice) => this.notExist(choice)));
  }),

  notExist(choice) {
    return !(get(this, 'matches') || []).find((m, index) => get(m, 'matchType') !== HEADERS && get(m, 'matchType') === get(choice, 'value') && index !== get(this, 'index'));
  },

  initMatcheTypes() {
    set(this, 'matcheTypes', TYPES.filter((choice) => this.notExist(choice)));
  }
});
