import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { next } from '@ember/runloop';

const CRED_CONFIG_CHOICES = [
  {
    name:        'amazon',
    displayName: 'Amazon',
    driver:      'amazonec2',
    configField: 'amazonec2credentialConfig',
  },
  {
    name:        'azure',
    displayName: 'Azure',
    driver:      'azure',
    configField: 'azurecredentialConfig',
  },
  {
    name:        'digitalOcean',
    displayName: 'Digital Ocean',
    driver:      'digitalocean',
    configField: 'digitaloceancredentialConfig',
  },
  {
    name:        'vmware',
    displayName: 'VMware vSphere',
    driver:      'vmwarevsphere',
    configField: 'vmwarevspherecredentialConfig',
  },
]

export default Component.extend(NewOrEdit, {
  globalStore:               service(),
  layout,
  nodeConfigTemplateType:    null,
  cloudKeyType:              null,
  model:                     null,
  cancelAdd:                 null,
  doneSavingCloudCredential: null,
  disableHeader:             false,

  didReceiveAttrs() {
    set(this, 'model', this.globalStore.createRecord({ type: 'cloudCredential' }));
  },

  actions: {
    selectConfig(configType) {
      this.cleanupPreviousConfig();

      set(this, 'cloudKeyType', configType);

      this.initCloudCredentialConfig();
    },
  },

  config: computed('cloudKeyType', {
    get() {
      const { model } = this;
      const type = this.getConfigField();

      return get(model, type);
    }
  }),

  configChoices: computed('driverName', function() {
    if (get(this, 'driverName')) {
      const { driverName } = this;

      let match = CRED_CONFIG_CHOICES.findBy('driver', driverName);


      next(() => {
        set(this, 'cloudKeyType', get(match, 'name'));
        this.initCloudCredentialConfig();
      })

      return [match];
    } else {
      return CRED_CONFIG_CHOICES.sortBy('displayName');
    }
  }),

  saveDisabled: computed('config.{amazonec2credentialConfig,azurecredentialConfig,digitaloceancredentialConfig,vmwarevspherecredentialConfig}', 'cloudKeyType', function() {
    if (this.getConfigField()) {
      return false;
    }

    return true;
  }),

  initCloudCredentialConfig() {
    const { model } = this;
    const type = this.getConfigField();

    set(model, type, this.globalStore.createRecord({ type: type.toLowerCase() }));
  },

  doneSaving(neu) {
    this.doneSavingCloudCredential(neu);
  },

  cleanupPreviousConfig() {
    const { model } = this;
    const configField = this.getConfigField();

    if (configField) {
      delete model[configField];
    }
  },

  getConfigField() {
    const { cloudKeyType, configChoices } = this;

    if (cloudKeyType) {
      const matchType = configChoices.findBy('name', cloudKeyType);

      return get(matchType, 'configField');
    }

    return;
  },

  parseNodeTemplateConfigType(nodeTemplate) {
    return Object.keys(nodeTemplate).find((f) => f.toLowerCase().indexOf('config') > -1);
  },

});
