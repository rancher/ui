import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
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

export default Component.extend(NewOrEdit, {
  globalStore:               service(),
  digitalOcean:              service(),
  intl:                      service(),
  layout,
  nodeConfigTemplateType:    null,
  cloudKeyType:              null,
  model:                     null,
  cancelAdd:                 null,
  doneSavingCloudCredential: null,
  disableHeader:             false,
  validatingKeys:            false,
  errors:                    null,
  region:                    null,
  regionChoices:             REGIONS,
  sinlgeCloudKeyChoice:      null,

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
        setProperties(this, {
          cloudKeyType:         get(match, 'name'),
          singleCloudKeyChoice: get(match, 'displayName'),
        });
        this.initCloudCredentialConfig();
      })

      return [match];
    } else {
      return CRED_CONFIG_CHOICES.sortBy('displayName');
    }
  }),

  savingLabel: computed('validatingKeys', 'cloudKeyType', function() {
    if (this.validatingKeys) {
      switch (this.cloudKeyType) {
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

  saveDisabled: computed(
    'config.{amazonec2credentialConfig,azurecredentialConfig,digitaloceancredentialConfig,vmwarevspherecredentialConfig}',
    'cloudKeyType',
    function() {
      if (this.getConfigField()) {
        return false;
      }

      return true;
    }),

  willSave() {
    set(this, 'errors', null);

    const { cloudKeyType }      = this;
    const keysThatWeCanValidate = ['amazon', 'digitalOcean'];
    const auth                  = {
      type:  'validate',
      token: null,
    };

    if (keysThatWeCanValidate.includes(cloudKeyType)) {
      set(this, 'validatingKeys', true);

      if (cloudKeyType === 'digitalOcean') {
        set(auth, 'token', get(this, 'config.accessToken'));

        return this.digitalOcean.request(auth, 'regions').then(() => {
          set(this, 'validatingKeys', false);

          return true;
        }).catch((err) => {
          setProperties(this, {
            errors:         [this.intl.t('modalAddCloudKey.error', { status: err.status })],
            validatingKeys: false,
          })

          return false;
        });
      }

      if (cloudKeyType === 'amazon') {
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
          set(this, 'validatingKeys', false);
          set(this, 'errors', [this.intl.t('modalAddCloudKey.error', { status: `${ err.statusCode } ${ err.code }` })]);

          return false;
        });
      }
    }

    set(this, 'validatingKeys', false);

    return this._super(...arguments);
  },

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
