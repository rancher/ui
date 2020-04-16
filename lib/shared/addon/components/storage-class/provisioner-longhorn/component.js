import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, setProperties } from '@ember/object';

const DEFAULT_PROVISIONER_CONFIG = {
  numberOfReplicas:    '3',
  staleReplicaTimeout: '2880',
  fromBackup:          '',
  diskSelector:        '',
  nodeSelector:        '',
  recurringJobs:       '',
};


export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner:              'longhorn',
  mode:                     'new',
  defaultProvisionerConfig: DEFAULT_PROVISIONER_CONFIG,
  fields:                   Object.keys(DEFAULT_PROVISIONER_CONFIG),

  didReceiveAttrs() {
    const { fields, defaultProvisionerConfig } = this;

    if (fields.length > 0) {
      const changes = {};

      fields.forEach((field) => {
        const key = field;

        changes[key] = get(this, `parameters.${ key }`) || get(defaultProvisionerConfig, key) || '';
      });

      setProperties(this, { model: changes });
    }
  },
});
