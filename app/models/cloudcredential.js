import Resource from 'ember-api-store/models/resource';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { hasMany } from 'ember-api-store/utils/denormalize';

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


  numberOfNodeTemplateAssociations: computed.reads('nodeTemplates.length'),

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

  actions: {
    edit() {
      this.modal.toggleModal('modal-add-cloud-credential', {
        cloudCredential: this,
        mode:            'edit',
      });
    }
  },
});

export default cloudCredential;
