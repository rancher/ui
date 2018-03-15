import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['skuName', 'location', 'storageAccount', 'storageaccounttype', 'kind'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'azure-disk',
  fields: FIELDS,
});
