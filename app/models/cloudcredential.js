import Resource from '@rancher/ember-api-store/models/resource';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';
import { get } from '@ember/object';
import { requiredError } from 'shared/utils/util';

const cloudCredential = Resource.extend({
  modal:         service(),
  globalStore:    service(),
  nodeTemplates: hasMany('id', 'nodetemplate', 'cloudCredentialId', 'globalStore'),

  type: 'cloudCredential',

  canClone: false,
  canEdit:  true,

  isAmazon:    notEmpty('amazonec2credentialConfig'),
  isAzure:     notEmpty('azurecredentialConfig'),
  isDo:        notEmpty('digitaloceancredentialConfig'),
  isGoogle:    notEmpty('googlecredentialConfig'),
  isHarvester: notEmpty('harvestercredentialConfig'),
  isLinode:    notEmpty('linodecredentialConfig'),
  isOCI:       notEmpty('ocicredentialConfig'),
  isPNAP:      notEmpty('pnapcredentialConfig'),
  isVMware:    notEmpty('vmwarevspherecredentialConfig'),


  displayType: computed('amazonec2credentialConfig', 'azurecredentialConfig', 'digitaloceancredentialConfig', 'harvestercredentialConfig', 'googlecredentialConfig', 'linodecredentialConfig', 'ocicredentialConfig', 'pnapcredentialConfig', 'vmwarevspherecredentialConfig', function() {
    const {
      isAmazon,
      isAzure,
      isDo,
      isGoogle,
      isLinode,
      isOCI,
      isPNAP,
      isVMware,
      isHarvester
    } = this;

    if (isAmazon) {
      return 'Amazon';
    } else if (isAzure) {
      return 'Azure';
    } else if (isDo) {
      return 'Digital Ocean';
    } else if (isGoogle) {
      return 'Google';
    } else if (isLinode) {
      return 'Linode';
    } else if (isOCI) {
      return 'OCI';
    } else if (isPNAP) {
      return 'phoenixNAP';
    } else if (isVMware) {
      return 'VMware vSphere';
    } else if (isHarvester) {
      return 'Harvester'
    }

    return '';
  }),

  numberOfNodeTemplateAssociations: computed('nodeTemplates.[]', function() {
    return get(this, 'nodeTemplates').length;
  }),

  actions: {
    edit() {
      this.modal.toggleModal('modal-add-cloud-credential', {
        cloudCredential: this,
        mode:            'edit',
      });
    }
  },
  validationErrors() {
    let errors = [];

    if (this.isOCI) {
      if (!this.get('ocicredentialConfig.tenancyId')) {
        errors.push(requiredError('modalAddCloudKey.oci.tenancyOcid.label'));
      }

      if (!this.get('ocicredentialConfig.region')) {
        errors.push(requiredError('modalAddCloudKey.oci.authRegion.label'));
      }

      if (!this.get('ocicredentialConfig.userId')) {
        errors.push(requiredError('modalAddCloudKey.oci.userOcid.label'));
      }

      if (!this.get('ocicredentialConfig.fingerprint')) {
        errors.push(requiredError(`modalAddCloudKey.oci.userFingerprint.label`));
      }

      if (!this.get('ocicredentialConfig.privateKeyContents')) {
        errors.push(requiredError('modalAddCloudKey.oci.secretKey.label'));
      }

      return errors;
    }

    errors = this._super(...arguments);

    return errors;
  },
});

export default cloudCredential;
