import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['diskformat', 'storagePolicyName', 'datastore',
  'hostFailuresToTolerate', 'cachereservation', 'fstype'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'vsphere-volume',
  fields: FIELDS,
});
