import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = [
  'gateway',
  'system',
  'protectionDomain',
  'storagePool',
  {
    id:      'storageMode',
    options: [
      {
        value:          'ThinProvisioned',
        translationKey: 'cruStorageClass.scaleio.storageMode.ThinProvisioned'
      },
      {
        value:          'ThickProvisioned',
        translationKey: 'cruStorageClass.scaleio.storageMode.ThickProvisioned'
      },
    ]
  },
  'secretRef',
  {
    id:      'readOnly',
    options: [
      {
        value:          'false',
        translationKey: 'generic.no'
      },
      {
        value:          'true',
        translationKey: 'generic.yes'
      },
    ]
  },
  'fsType'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'scaleio',
  fields:      FIELDS,
});
