import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['quobyteAPIServer', 'registry', 'adminSecretNamespace',
  'adminSecretName', 'user', 'group', 'quobyteConfig', 'quobyteTenant'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'quobyte',
  fields:      FIELDS,
});
