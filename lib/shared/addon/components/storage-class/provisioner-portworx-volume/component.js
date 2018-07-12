import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';

const FIELDS = ['fs', 'block_size', 'repl',
  'io_priority', 'snap_interval', 'aggregation_level', 'ephemeral'];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'portworx-volume',
  fields:      FIELDS,
});
