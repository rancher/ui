import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['gateway', 'system', 'protectionDomain',
  'storagePool', 'storageMode', 'secretRef', 'readOnly', 'fsType'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'scaleio',
  fields: FIELDS,
});
