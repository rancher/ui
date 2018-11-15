import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  // Inputs
  instance: null,
  service:  null,
  errors:   null,
  editing:  null,

  initHostAliasesArray: [],
  initOptionsArray:     [],

  classNames: ['accordion-wrapper'],

  init() {
    this._super(...arguments);
    this.initHostAliases();
    this.initOptions();
  },

  actions: {
    hostAliasesChanged(hostAliases) {
      const out = [];

      hostAliases.filter((alias) => alias.value && alias.key).forEach((alias) => {
        out.push({
          hostnames: [alias.value],
          ip:        alias.key,
        });
      });
      set(this, 'service.hostAliases', out);
    },

    optionsChanged(options) {
      const out = [];

      options.filter((option) => get(option, 'key') && get(option, 'value')).forEach((option) => {
        out.push({
          name:  get(option, 'key'),
          value: get(option, 'value'),
        });
      });

      const dnsConfig = get(this, 'service.dnsConfig');

      if ( !dnsConfig ) {
        set(this, 'service.dnsConfig', { options: out });
      } else {
        set(this, 'service.dnsConfig.options', out);
      }
    },

    updateNameservers(nameservers) {
      const dnsConfig = get(this, 'service.dnsConfig');

      if ( !dnsConfig ) {
        set(this, 'service.dnsConfig', { nameservers });
      } else {
        set(this, 'service.dnsConfig.nameservers', nameservers);
      }
    },

    updateSearches(searches) {
      const dnsConfig = get(this, 'service.dnsConfig');

      if ( !dnsConfig ) {
        set(this, 'service.dnsConfig', { searches });
      } else {
        set(this, 'service.dnsConfig.searches', searches);
      }
    }
  },

  initHostAliases() {
    const aliases = get(this, 'service.hostAliases');

    set(this, 'initHostAliasesArray', []);
    (aliases || []).forEach((alias) => {
      (alias.hostnames || []).forEach((hostname) => {
        get(this, 'initHostAliasesArray').push({
          key:   alias.ip,
          value: hostname,
        });
      })
    });
  },

  initOptions() {
    const options = get(this, 'service.dnsConfig.options');

    set(this, 'initOptionsArray', []);
    (options || []).forEach((option) => {
      get(this, 'initOptionsArray').push({
        key:   get(option, 'name'),
        value: get(option, 'value'),
      });
    });
  },
});
