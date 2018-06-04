import Component from '@ember/component';
import { observer } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import C from 'shared/utils/pipeline-constants';

export default Component.extend({
  scope: service(),

  layout,

  // Inputs
  config:     null,
  registries: null,

  // Internal
  invalidRegistry: false,
  registryChoices: null,

  linkToRegistry: null,

  init() {
    this._super(...arguments);

    this.initRegistries();
    set(this, 'linkToRegistry', `/p/${ get(this, 'scope.currentProject.id') }/registries/add`);
  },

  registriesDidChange: observer('registries.[]', function() {
    this.initRegistries();
  }),

  initRegistries() {
    const out = [];

    get(this, 'registries').find((item) => {
      Object.keys(get(item, 'registries')).forEach((registry) => {
        if ( C.DEFAULT_REGISTRY === registry ) {
          out.unshift({
            label: 'Docker Hub',
            value: registry,
          });
        } else {
          out.push({
            label: registry,
            value: registry,
          });
        }
      });
    });
    set(this, 'registryChoices', out);
    if ( !get(this, 'config.registry') && out.length ) {
      set(this, 'config.registry', get(this, 'registryChoices.firstObject.value'));
    }
  },
});
