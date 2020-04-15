import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, computed, observer } from '@ember/object';
import layout from './template';
import { getProvisioners } from 'ui/models/storageclass';
import ChildHook from 'shared/mixins/child-hook';
import C from 'ui/utils/constants';

const WAIT_FOR_FIRST_CONSUMER  = 'WaitForFirstConsumer';
const IMMEDIATE                = 'Immediate';
const LOCAL_STORAGE            = 'kubernetes.io/no-provisioner';
const { LONGHORN_PROVISIONER_KEY } = C.STORAGE;

export default Component.extend(ViewNewEdit, ChildHook, {
  intl:     service(),
  features: service(),

  layout,
  model:                  null,
  longhornProvisionerKey: LONGHORN_PROVISIONER_KEY,
  titleKey:               'cruStorageClass.title',

  didReceiveAttrs() {
    set(this, 'wasRecycle', get(this, 'primaryResource.reclaimPolicy') === 'Recycle');
  },

  actions: {
    updateParams(map) {
      set(this, 'primaryResource.parameters', map);
    },

    updateOptions(ary) {
      set(this, 'primaryResource.mountOptions', ary);
    },
  },

  provisionerChanged: observer('primaryResource.provisioner', function() {
    const provisioner = get(this, 'primaryResource.provisioner');

    if ( this.isNew ) {
      set(this, 'primaryResource.volumeBindingMode', provisioner === LOCAL_STORAGE ? WAIT_FOR_FIRST_CONSUMER : IMMEDIATE);
    }

    if (provisioner === this.longhornProvisionerKey) {
      set(this, 'primaryResource.allowVolumeExpansion', true);
    } else {
      set(this, 'primaryResource.allowVolumeExpansion', false);
    }
  }),

  paramsComponent: computed('primaryResource.provisioner', function() {
    const provisioner = get(this, 'primaryResource.provisioner');
    const entry = getProvisioners().findBy('value', provisioner);
    let component = 'generic';

    if ( entry && entry.component ) {
      component = entry.component;
    }

    return `storage-class/provisioner-${  component }`;
  }),

  provisionerChoices: computed('intl.locale', function() {
    const intl = get(this, 'intl');
    const out = getProvisioners().map((p) => {
      const entry = Object.assign({}, p);
      const key = `storageClass.${ entry.name }.title`;

      if ( intl.exists(key) ) {
        entry.label = intl.t(key);
        entry.priority = 1;
      } else {
        entry.label = entry.name;
        entry.priority = 2;
      }

      return entry;
    });

    return out.sortBy('priority', 'label');
  }),

  supportedProvisionerChoices: computed('provisionerChoices', function() {
    const showUnsupported = get(this, 'features').isFeatureEnabled(C.FEATURES.UNSUPPORTED_STORAGE_DRIVERS);

    return get(this, 'provisionerChoices').filter((choice) => showUnsupported || choice.supported)
  }),

  willSave() {
    const self = this;
    const sup = this._super;

    return this.applyHooks().then(() => sup.apply(self, ...arguments));
  },

  doneSaving() {
    if (this.done) {
      this.done();
    }
  },

});
