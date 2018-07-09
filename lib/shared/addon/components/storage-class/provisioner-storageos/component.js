import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['pool', 'description', 'fsType',
  'adminSecretNamespace', 'adminSecretName'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'storageos',
  fields:      FIELDS,
});
