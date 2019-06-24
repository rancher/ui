import Component from '@ember/component';
import layout from './template';
import StorageClassProvisioner from 'shared/mixins/storage-class-provisioner';
import { set, setProperties } from '@ember/object';

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

  kindOptions:        KIND_OPTIONS,

  skuName:            null,
  location:           null,
  storageAccount:     null,
  storageaccounttype: null,

  kind:               'shared',
  provisioner:        'azure-disk',

  didReceiveAttrs() {
    const changes = {};
    let { parameters = {} }                            = this;
    const { storageaccounttype = '', kind = 'shared' } = parameters;

    changes['storageaccounttype'] = storageaccounttype;
    changes['kind']               = kind;

    setProperties(this, changes);
  },

  // registered in the StorageClassProvisioner mixin
  updateParams() {
    const {
      storageaccounttype,
      kind,
      out = {}
    } = this;

    if (storageaccounttype) {
      out['storageaccounttype'] = storageaccounttype;
    }
    if (kind) {
      out['kind'] = kind;
    }

    set(this, 'parameters', out);
  },
});
