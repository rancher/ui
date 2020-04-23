import Resource from '@rancher/ember-api-store/models/resource';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';
import { get } from '@ember/object';

const cloudCredential = Resource.extend({
  modal:         service(),
  globalStore:    service(),
  nodeTemplates: hasMany('id', 'nodetemplate', 'cloudCredentialId', 'globalStore'),

  type:     'cloudCredential',

  canClone: false,
  canEdit:  true,

  isAmazon:    notEmpty('amazonec2credentialConfig'),
  isAzure:     notEmpty('azurecredentialConfig'),
  isDo:        notEmpty('digitaloceancredentialConfig'),
  isLinode:    notEmpty('linodecredentialConfig'),
  isOCI:       notEmpty('ocicredentialConfig'),
  isVMware:    notEmpty('vmwarevspherecredentialConfig'),
  displayType: computed('amazonec2credentialConfig', 'azurecredentialConfig', 'digitaloceancredentialConfig', 'linodecredentialConfig', 'ocicredentialConfig', 'vmwarevspherecredentialConfig', function() {
    const {
      isAmazon,
      isAzure,
      isDo,
      isLinode,
      isOCI,
      isVMware
    } = this;

    if (isAmazon) {
      return 'Amazon';
    } else if (isAzure) {
      return 'Azure';
    } else if (isDo) {
      return 'Digital Ocean';
    } else if (isLinode) {
      return 'Linode';
    } else if (isOCI) {
      return 'OCI';
    } else if (isVMware) {
      return 'VMware vSphere';
    }
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
});

export default cloudCredential;
