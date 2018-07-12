import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['numberOfReplicas', 'staleReplicaTimeout', 'fromBackup'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'longhorn',
  fields:      FIELDS,
});
