import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';


const headers = [
  {
    name:           'url',
    classNames:     ['text-center'],
    translationKey: 'cruPrivateRegistry.registry.url.label',
  },
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

    set(this, 'config', get(this, `cluster.${ get(this, 'configName') }`));
  },

  actions: {
    addRegistry() {
      this.addRegistry(this.newPrivateRegistry());
    },

    removeRegistry(registry) {
      this.removeRegistry(registry);
    },
  },

  defaultSet: observer('privateRegistries.@each.{isDefault}', function() {
    const { privateRegistries } = this;

    if (privateRegistries && privateRegistries.findBy('isDefault', true)) {
      set(this, 'hasDefault', true);
    } else {
      set(this, 'hasDefault', false);
    }
  }),

  newPrivateRegistry(registryType = 'privateRegistry', isDefault = false) {
    return get(this, 'globalStore').createRecord({
      isDefault,
      type: registryType,
    });
  },

  addRegistry() {
    throw new Error('addRegistry action is required!');
  },

  removeRegistry() {
    throw new Error('removeRegistry action is required!');
  },

});
