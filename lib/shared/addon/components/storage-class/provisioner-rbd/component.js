import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['monitors', 'adminId', 'adminSecretNamespace',
  'adminSecretName', 'pool', 'userId', 'userSecretNamespace', 'userSecretName', 'fsType', 'imageFormat', 'imageFeatures'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'rbd',
  fields:      FIELDS,
});
