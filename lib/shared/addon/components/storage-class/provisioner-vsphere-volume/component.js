import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = [
  {
    id:      'diskformat',
    options: [
      {
        value:          'thin',
        label:          'thin',
        translationKey: 'cruStorageClass.vsphere-volume.diskformat.thin'
      },
      {
        value:          'zeroedthick',
        label:          'zeroedthick',
        translationKey: 'cruStorageClass.vsphere-volume.diskformat.zeroedthick'
      },
      {
        value:          'eagerzeroedthick',
        label:          'eagerzeroedthick',
        translationKey: 'cruStorageClass.vsphere-volume.diskformat.eagerzeroedthick'
      }]
  },
  'storagePolicyName',
  'datastore',
  'hostFailuresToTolerate',
  'cachereservation',
  'fstype'
];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'vsphere-volume',
  fields:      FIELDS,
});
