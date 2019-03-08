import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import { next } from '@ember/runloop';
import { REGIONS } from 'shared/utils/amazon';
import { Promise } from 'rsvp';

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

export default Component.extend(ViewNewEdit, {
  globalStore:               service(),
  digitalOcean:              service(),
  intl:                      service(),
  layout,
  nodeConfigTemplateType:    null,
  cloudCredentialType:       null,
  model:                     null,
  cancelAdd:                 null,
  doneSavingCloudCredential: null,
  disableHeader:             false,
  validatingKeys:            false,
  errors:                    null,
  region:                    null,
  sinlgeCloudKeyChoice:      null,
  regionChoices:             REGIONS,
  mode:                      'new',

  init() {
    this._super(...arguments);

    let cloudCredentialType = 'amazon';
    let model               = null;

    if (get(this, 'driverName')) {
      let match           = CRED_CONFIG_CHOICES.findBy('driver', get(this, 'driverName'));

      cloudCredentialType = get(match, 'name');
      model               = this.globalStore.createRecord({ type: 'cloudCredential' });
    } else {
      if (get(this, 'originalModel')) {
        let configField     = Object.keys(this.originalModel).find((key) => key.toLowerCase().includes('config'));
        let configChoice    = CRED_CONFIG_CHOICES.findBy('configField', configField);

        cloudCredentialType = get(configChoice, 'name');
        model               = this.originalModel.clone();
      } else {
        model        = this.globalStore.createRecord({ type: 'cloudCredential' });
      }
    }

    setProperties(this, {
      cloudCredentialType,
      model,
    });

    if (!get(this, 'originalModel')) {
      this.initCloudCredentialConfig();
    }
  },

  actions: {
    selectConfig(configType) {
      this.cleanupPreviousConfig();

      set(this, 'cloudCredentialType', configType);

      this.initCloudCredentialConfig();
    },
  },

  config: computed('cloudCredentialType', 'model.{amazonec2credentialConfig,azurecredentialConfig,digitaloceancredentialConfig,vmwarevspherecredentialConfig}', function() {
    const { model }   = this;
    const configField = this.getConfigField();

    return get(model, configField);
  }),

  configChoices: computed('driverName', function() {
    if (get(this, 'driverName')) {
      const { driverName } = this;

      let match = CRED_CONFIG_CHOICES.findBy('driver', driverName);

      next(() => {
        setProperties(this, {
          cloudCredentialType:         get(match, 'name'),
          singleCloudKeyChoice: get(match, 'displayName'),
        });
        this.initCloudCredentialConfig();
      })

      return [match];
    } else {
      return CRED_CONFIG_CHOICES.sortBy('displayName');
    }
  }),

  savingLabel: computed('validatingKeys', 'cloudCredentialType', function() {
    if (this.validatingKeys) {
      switch (this.cloudCredentialType) {
      case 'amazon':
      case 'digitalOcean':
        return 'modalAddCloudKey.saving.validating';
      case 'azure':
      case 'vmware':
      default:
        return 'saveCancel.saving';
      }
    }

    return 'saveCancel.saving';
  }),

  validate() {
    var ok                        = this._super(...arguments);
    let errors                    = get(this, 'errors') || [];
    const { cloudCredentialType } = this;

    if (cloudCredentialType === 'amazon') {
      if (!get(this, 'region')) {
        ok = false;

        errors.pushObject(this.intl.t('modalAddCloudKey.errors.region'));
      }
    }

    set(this, 'errors', errors);

    return ok;
  },

  willSave() {
    set(this, 'errors', null);

    let ok = this._super(...arguments);

    if (!ok) {
      return ok;
    }

    const { cloudCredentialType }      = this;
    const keysThatWeCanValidate = ['amazon', 'digitalOcean'];
    const auth                  = {
      type:  'validate',
      token: null,
    };

    if (keysThatWeCanValidate.includes(cloudCredentialType)) {
      set(this, 'validatingKeys', true);

      if (cloudCredentialType === 'digitalOcean') {
        set(auth, 'token', get(this, 'config.accessToken'));

        return this.digitalOcean.request(auth, 'regions').then(() => {
          set(this, 'validatingKeys', false);

          return true;
        }).catch((err) => {
          return this.setError(`${ err.status } ${ err.statusText }`);
        });
      }

      if (cloudCredentialType === 'amazon') {
        let authConfig = {
          accessKeyId:     this.config.accessKey,
          secretAccessKey: this.config.secretKey,
          region:          this.region,
        };
        let ec2        = new AWS.EC2(authConfig);

        return new Promise((resolve, reject) => {
          ec2.describeAccountAttributes({}, (err) => {
            if ( err ) {
              reject(err);
            }

            return resolve();
          })
        }).then(() => {
          set(this, 'validatingKeys', false);

          return true;
        }).catch((err) => {
          return this.setError(`${ err.statusCode } ${ err.code }`);
        });
      }
    }

    set(this, 'validatingKeys', false);

    return ok;
  },

  setError(message = '') {
    setProperties(this, {
      validatingKeys: false,
      errors:         [this.intl.t('modalAddCloudKey.errors.validation', { status: message })],
    });

    return false;
  },

  initCloudCredentialConfig() {
    const { model }   = this;
    const configField = this.getConfigField();

    if (configField) {
      set(model, configField, this.globalStore.createRecord({ type: configField.toLowerCase() }));
    }
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
    const { cloudCredentialType, configChoices } = this;

    if (cloudCredentialType) {
      const matchType = configChoices.findBy('name', cloudCredentialType);

      return get(matchType, 'configField');
    }

    return;
  },

  parseNodeTemplateConfigType(nodeTemplate) {
    return Object.keys(nodeTemplate).find((f) => f.toLowerCase().indexOf('config') > -1);
  },

});
