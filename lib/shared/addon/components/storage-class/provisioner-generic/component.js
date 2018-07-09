import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

export default Component.extend(StorageClassProvisioner, { layout, });
