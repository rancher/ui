import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';


const headers = [
  {
    name:           'user',
    classNames:     ['text-center'],
    translationKey: 'cruPrivateRegistry.registry.user.label',
  },
  {
    name:           'password',
    classNames:     ['text-center'],
    sort:           false,
    translationKey: 'cruPrivateRegistry.registry.password.label',
  },
  {
    name:           'url',
    classNames:     ['text-center'],
    translationKey: 'cruPrivateRegistry.registry.url.label',
  },
  {
    name:           'default',
    classNames:     ['text-center'],
    translationKey: 'cruPrivateRegistry.registry.default.label',
    width:          250,
  },
  {
    name:           'remove',
    sort:           false,
    classNames:     ['text-center'],
    width:          50,
  }
];

export default Component.extend({
  globalStore:       service(),

  layout,
  headers,

  configName:        'rancherKubernetesEngineConfig',
  cluster:           null,
  config:            null,
  editing:           true,
  urlInvalid:        null,
  urlWarning:        null,
  urlError:          null,

  privateRegistries: alias('config.privateRegistries'),

  init() {
    this._super(...arguments);

    const config = set(this, 'config', get(this, `cluster.${ get(this, 'configName') }`));

    if (( config.privateRegistries || [] ).length <= 0) {
      set(config, 'privateRegistries', [this.newPrivateRegistry()]);
    }
  },

  actions: {
    addRegistry() {
      get(this, 'privateRegistries').pushObject(this.newPrivateRegistry());
    },
    removeRegistry(registry) {
      get(this, 'privateRegistries').removeObject(registry);
    },
  },

  defaultSet: on('init', observer('privateRegistries.@each.{isDefault}', function() {
    const { privateRegistries } = this;

    if (privateRegistries.findBy('isDefault', true)) {
      set(this, 'hasDefault', true);
    } else {
      set(this, 'hasDefault', false);
    }
  })),

  newPrivateRegistry(registryType = 'privateRegistry') {
    return get(this, 'globalStore').createRecord({ type: registryType });
  }
});
