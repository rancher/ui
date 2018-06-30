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

  classNames: ['accordion-wrapper'],

  init() {

    this._super(...arguments);
    this.initHostAliases();

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
});
