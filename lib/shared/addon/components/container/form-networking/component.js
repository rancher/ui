import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  //Inputs
  instance: null,
  isService: null,
  service: null,
  errors: null,
  editing: null,

  initHostAliasesArray: [],

  classNames: ['accordion-wrapper'],

  init() {
    this._super(...arguments);
    this.initHostAliases();
  },

  actions: {
    hostAliasesChanged(hostAliases) {
      const map = {};
      hostAliases.forEach(line => {
        if (map[line.key]) {
          const hostnames = get(map[line.key], 'hostnames');
          hostnames.push(line.value);
        } else {
          map[line.key] = {
            hostnames: [line.value]
          };
        }
      });
      set(this, 'service.hostAliases', map);
    },
  },

  initHostAliases() {
    const aliases = get(this, 'service.hostAliases');
    set(this, 'initHostAliasesArray', []);
    if (aliases) {
      Object.keys(aliases).forEach((alias) => {
        if (aliases[alias] && aliases[alias].hostnames) {
          aliases[alias].hostnames.forEach(hostname => {
            get(this, 'initHostAliasesArray').push({
              key: alias,
              value: hostname,
            });
          })
        }
      });
    }
  },
});
