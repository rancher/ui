import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import EmberObject, { get, set, computed } from '@ember/object';
import layout from './template';
import { getSources } from 'ui/models/volume';
import C from 'ui/utils/constants';

export default Component.extend(ViewNewEdit, {
  intl:        service(),
  features:     service(),

  layout,
  model:      null,
  sourceName: null,

  titleKey:    'cruVolume.title',

  didReceiveAttrs() {
    const selectedSource = (get(this, 'sourceChoices') || []).find((source) => !!get(this, `primaryResource.${ get(source, 'value') }`));

    if ( selectedSource ) {
      set(this, 'sourceName', get(selectedSource, 'name'));
    }
  },

  actions: {
    updateParams(key, map) {
      getSources('ephemeral').forEach((source) => {
        if (source.value === key){
          set(this, `primaryResource.${ key }`, map);
        } else {
          set(this, `primaryResource.${ source.value }`, null);
        }
      });
    },
  },

  headerToken: computed('scope', function() {
    let k = 'cruPersistentVolumeClaim.define.';

    k += get(this, 'mode');

    return k;
  }),

  sourceChoices: computed('intl.locale', function() {
    const intl = get(this, 'intl');
    const skip = ['host-path', 'secret'];
    const out = getSources('ephemeral').map((p) => {
      const entry = Object.assign({}, p);
      const key = `volumeSource.${ entry.name }.title`;

      if ( skip.includes(entry.name) ) {
        entry.priority = 0;
      } else if ( intl.exists(key) ) {
        entry.label = intl.t(key);
        if ( p.persistent ) {
          entry.priority = 2;
        } else {
          entry.priority = 1;
        }
      } else {
        entry.label = entry.name;
        entry.priority = 3;
      }

      return entry;
    });

    return out.filter((x) => x.priority > 0 ).sortBy('priority', 'label');
  }),

  supportedSourceChoices: computed('sourceChoices', function() {
    const showUnsupported = get(this, 'features').isFeatureEnabled(C.FEATURES.UNSUPPORTED_STORAGE_DRIVERS);

    return get(this, 'sourceChoices').filter((choice) => showUnsupported || choice.supported)
  }),

  sourceComponent: computed('sourceName', function() {
    const name = get(this, 'sourceName');
    const sources = getSources('ephemeral');
    const entry = sources.findBy('name', name);

    if (entry) {
      return {
        component: `volume-source/source-${ name }`,
        field:     entry.value,
      }
    }
  }),

  willSave() {
    const vol = get(this, 'primaryResource');
    const entry = getSources('ephemeral').findBy('name', get(this, 'sourceName'));

    if ( !entry ) {
      const errors = [];
      const intl = get(this, 'intl');

      errors.push(intl.t('validation.required', { key: intl.t('cruVolume.source.label') }));
      set(this, 'errors', errors);

      return false;
    }

    vol.clearSourcesExcept(entry.value);

    let ok = this._super(...arguments);

    if ( ok ) {
      const out = EmberObject.create({ name: get(vol, 'name')  });

      set(out, entry.value, get(vol, entry.value));

      if (this.doSave) {
        this.doSave({ volume: out })
      }

      if (this.done) {
        this.done();
      }
    }

    return false;
  },

});
