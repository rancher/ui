import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { get, set, setProperties } from '@ember/object';

const KIND_OPTIONS = [
  {
    value:          'shared',
    translationKey: 'cruStorageClass.azure-disk.kind.shared'
  },
  {
    value:          'dedicated',
    translationKey: 'cruStorageClass.azure-disk.kind.dedicated'
  },
  {
    value:          'managed',
    translationKey: 'cruStorageClass.azure-disk.kind.managed'
  },
];

export default Component.extend(StorageClassProvisioner, {
  layout,

  provisioner: 'azure-disk',
  kindOptions: KIND_OPTIONS,

  volumeType:         'new',
  skuName:            null,
  location:           null,
  storageAccount:     null,
  storageaccounttype: null,
  kind:               'shared',

  didReceiveAttrs() {
    const changes = {};
    const skuName = get(this, 'parameters.skuName') || '';
    const location = get(this, 'parameters.location') || '';
    const storageAccount = get(this, 'parameters.storageAccount') || '';

    const storageaccounttype = get(this, 'parameters.storageaccounttype') || '';
    const kind = get(this, 'parameters.kind') || 'shared';

    if (skuName || location || storageAccount) {
      changes['skuName'] = skuName;
      changes['location'] = location;
      changes['storageAccount'] = storageAccount;
      changes['volumeType'] = 'unmanaged';
    } else {
      changes['storageaccounttype'] = storageaccounttype;
      changes['kind'] = kind;
      changes['volumeType'] = 'new';
    }
    setProperties(this, changes);
  },

  updateParams() {
    const type = get(this, 'volumeType');
    const skuName = get(this, 'skuName');
    const location = get(this, 'location');
    const storageAccount = get(this, 'storageAccount');
    const storageaccounttype = get(this, 'storageaccounttype');
    const kind = get(this, 'kind');

    const out = {};

    if (type === 'unmanaged') {
      if (skuName) {
        out['skuName'] = skuName;
      }
      if (location) {
        out['location'] = location;
      }
      if (storageAccount) {
        out['storageAccount'] = storageAccount;
      }
    } else {
      if (storageaccounttype) {
        out['storageaccounttype'] = storageaccounttype;
      }
      if (kind) {
        out['kind'] = kind;
      }
    }

    set(this, 'parameters', out);
  },
});
