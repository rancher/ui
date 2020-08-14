import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, set, setProperties } from '@ember/object';

const DEFAULT_PROVISIONER_CONFIG = {
  numberOfReplicas:    '3',
  staleReplicaTimeout: '2880',
  fromBackup:          '',
  diskSelector:        '',
  nodeSelector:        '',
  recurringJobs:       ''
};


export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner:              'longhorn',
  mode:                     'new',
  defaultProvisionerConfig: DEFAULT_PROVISIONER_CONFIG,
  fields:                   Object.keys(DEFAULT_PROVISIONER_CONFIG),

  didReceiveAttrs() {
    const { defaultProvisionerConfig } = this;
    const parameters = get(this, 'parameters') || {};

    setProperties(this, {
      model: {
        ...defaultProvisionerConfig,
        ...parameters
      }
    });
  },

  updateParams() {
    const filteredEntries = Object.entries(get(this, 'model') || {})
      .filter((entry) => entry[1])

    set(this, 'parameters', Object.fromEntries(filteredEntries));
  },
});
