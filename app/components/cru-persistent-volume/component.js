import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import layout from './template';
import { getSources } from 'ui/models/volume';
import { parseSi } from 'shared/utils/parse-unit';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';

export default Component.extend(ViewNewEdit, {
  intl:         service(),
  clusterStore: service(),
  features:     service(),

  layout,
  model:      null,
  sourceName: null,

  titleKey: 'cruPersistentVolume.title',

  storageClasses: null,
  capacity:       null,

  init() {
    this._super(...arguments);
    set(this, 'storageClasses', get(this, 'clusterStore').all('storageclass'));
  },

  didReceiveAttrs() {
    const { primaryResource } = this;
    const { sourceName = '' } = primaryResource;

    if ( get(this, 'isNew') ) {
      set(this, 'capacity', 10);
    } else {
      const source = get(primaryResource, sourceName);

      if (sourceName === 'csi' && source.driver && source.driver === 'driver.longhorn.io') {
        set(this, 'sourceName', 'csi-volume-longhorn')
      } else {
        set(this, 'sourceName', sourceName);
      }

      const capacity = get(primaryResource, 'capacity.storage');

      if ( capacity ) {
        const bytes = parseSi(capacity);
        const gib = bytes / (1024 ** 3);

        set(this, 'capacity', gib);
      }
    }
  },

  actions: {
    updateOptions(ary) {
      set(this, 'primaryResource.mountOptions', ary);
    },

    updateNodeAffinities(nodeSelector) {
      if ( nodeSelector.nodeSelectorTerms.length > 0 ) {
        set(this, 'primaryResource.nodeAffinity', { required: nodeSelector });
      } else {
        set(this, 'primaryResource.nodeAffinity', null);
      }
    },

  },

  sourceChoices: computed('intl.locale', function() {
    const intl = get(this, 'intl');
    const out = getSources('persistent').map((p) => {
      const entry = Object.assign({}, p);
      const key = `volumeSource.${ entry.name }.title`;

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

  supportedSourceChoices: computed('sourceChoices', function() {
    const showUnsupported = get(this, 'features').isFeatureEnabled(C.FEATURES.UNSUPPORTED_STORAGE_DRIVERS);

    return get(this, 'sourceChoices').filter((choice) => showUnsupported || choice.supported)
  }),

  sourceDisplayName: computed('sourceName', 'sourceChoices.[]', function() {
    const { sourceChoices, sourceName } = this;
    const match = sourceChoices.findBy('name', sourceName);

    return match ? get(match, 'label') : '';
  }),

  sourceComponent: computed('sourceName', function() {
    const name = get(this, 'sourceName');
    const sources = getSources('persistent');
    const entry = sources.findBy('name', name);

    if (entry) {
      return `volume-source/source-${ name }`;
    }
  }),

  willSave() {
    const vol = get(this, 'primaryResource');
    const entry = getSources('persistent').findBy('name', get(this, 'sourceName'));
    const intl = get(this, 'intl');
    const errors = [];

    if ( !entry ) {
      errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolume.source.label') }));
      set(this, 'errors', errors);

      return false;
    }

    if (vol.csi && vol.csi.driver === C.STORAGE.LONGHORN_PROVISIONER_KEY) {
      if (isEmpty(vol.csi.volumeHandle)) {
        errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolumeClaim.volumeHandleRequired.label') }));

        set(this, 'errors', errors);

        return false;
      }
    }

    vol.clearSourcesExcept(entry.value);

    const capacity = get(this, 'capacity');

    if ( capacity ) {
      set(vol, 'capacity', { storage: `${ capacity  }Gi`, });
    } else {
      errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolumeClaim.capacity.label') }));

      set(this, 'errors', errors);

      return false;
    }

    return this._super(...arguments);
  },

  doneSaving() {
    if (this.cancel) {
      this.cancel();
    }
  },

});
