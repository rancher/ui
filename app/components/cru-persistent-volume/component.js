import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import layout from './template';
import { getSources } from 'ui/models/volume';
import { parseSi } from 'shared/utils/parse-unit';

export default Component.extend(ViewNewEdit, {
  intl:         service(),
  clusterStore: service(),

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
    if ( get(this, 'isNew') ) {
      set(this, 'capacity', 10);
    } else {
      set(this, 'sourceName', get(this, 'primaryResource.sourceName'));

      const capacity = get(this, 'primaryResource.capacity.storage');

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

    if ( !entry ) {
      const errors = [];
      const intl = get(this, 'intl');

      errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolume.source.label') }));
      set(this, 'errors', errors);

      return false;
    }

    vol.clearSourcesExcept(entry.value);

    const capacity = get(this, 'capacity');

    if ( capacity ) {
      set(vol, 'capacity', { storage: `${ capacity  }Gi`, });
    } else {
      const errors = [];
      const intl = get(this, 'intl');

      errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolumeClaim.capacity.label') }));
      set(this, 'errors', errors);

      return false;
    }

    return this._super(...arguments);
  },

  doneSaving() {
    this.sendAction('cancel');
  },

});
