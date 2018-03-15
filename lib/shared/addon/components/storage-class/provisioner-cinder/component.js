import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['type', 'availability'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'cinder',
  fields: FIELDS,
});
