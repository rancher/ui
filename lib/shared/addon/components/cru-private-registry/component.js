import Component from '@ember/component';
import layout from './template';
import {
  get,
  set,
  setProperties,
  observer
} from '@ember/object';
import { alias, gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  globalStore:       service(),

  layout,

  configName:              'rancherKubernetesEngineConfig',
  cluster:                 null,
  config:                  null,
  editing:                 true,
  urlInvalid:              null,
  urlWarning:              null,
  urlError:                null,

  clusterTemplateCreate:   false,
  enablePrivateRegistry:   false,
  privateRegistry:         null,
  clusterTemplateRevision: null,
  applyClusterTemplate:    null,
  privateRegistries:       alias('config.privateRegistries'),
  multipleRegistries:      gt('privateRegistries.length', 1),

  init() {
    this._super(...arguments);

    set(this, 'config', get(this, `cluster.${ get(this, 'configName') }`));

    if (this.config.privateRegistries) {
      if ( this.config.privateRegistries.length >= 1 ) {
        setProperties(this, {
          privateRegistry:       get(this, 'config.privateRegistries.firstObject'),
          enablePrivateRegistry: true,
        });
      }
    }
  },

  actions: {
    addRegistry(isDefault = true) {
      this.addRegistry(set(this, 'privateRegistry', this.newPrivateRegistry('privateRegistry', isDefault)));
    },

    removeRegistry(registry) {
      let match = null;

      if (this.multipleRegistries) {
        let prWithout = this.privateRegistries.without(registry);

        match = prWithout.length >= 1 ? prWithout.firstObject : null;
      }

      set(this, 'privateRegistry', match)

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

  enablePrivateRegistryChanged: observer('enablePrivateRegistry', function() {
    if (this.enablePrivateRegistry) {
      this.send('addRegistry');
    } else {
      this.send('removeRegistry', this.privateRegistry);
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
