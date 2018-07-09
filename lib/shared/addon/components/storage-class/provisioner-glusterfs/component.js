import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['resturl', 'restuser', 'restuserkey',
  'secretNamespace', 'secretName', 'clusterid', 'gidMin', 'gidMax', 'volumetype'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'glusterfs',
  fields:      FIELDS,
});
