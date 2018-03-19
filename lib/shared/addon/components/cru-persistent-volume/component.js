import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, setProperties, computed } from '@ember/object';
import layout from './template';
import { getSources } from 'ui/models/volume';
import { parseSi } from 'shared/utils/parse-unit';

export default Component.extend(ViewNewEdit, {
  intl: service(),
  clusterStore: service(),

  layout,
  model: null,
  sourceName: null,

  titleKey: 'cruPersistentVolume.title',

  storageClasses: null,
  capacity: null,
  accessRWO: null,
  accessROX: null,
  accessRWX: null,

  actions: {
    updateOptions(ary) {
      set(this, 'primaryResource.mountOptions', ary);
    },

    updateParams(key, map) {
      getSources().forEach(source => {
        if(source.value === key){
          set(this, `primaryResource.${key}`, map);
        } else {
          set(this, `primaryResource.${source.value}`, null);
        }
      });
    },
  },

  init() {
    this._super(...arguments);
    set(this, 'storageClasses', get(this, 'clusterStore').all('storageclass'));
  },

  didReceiveAttrs() {
    let accessRWO=true, accessROX=false, accessRWX=false;

    if ( get(this,'isNew') ) {
      set(this, 'capacity', 10);

    } else {
      const configName = get(this,'primaryResource.configName');
      const sources = getSources();
      const entry = sources.findBy('value', configName);
      if ( entry ) {
        set(this, 'sourceName', entry.name);
      }

      const modes = get(this,'primaryResource.accessModes')||[];
      accessRWO = modes.includes('ReadWriteOnce');
      accessROX = modes.includes('ReadOnlyMany');
      accessRWX = modes.includes('ReadWriteMany');

      const capacity = get(this, 'primaryResource.capacity.storage');
      if ( capacity ) {
        const bytes = parseSi(capacity);
        const gib = bytes/(1024**3);
        set(this, 'capacity', gib);
      }
    }

    setProperties(this, {
      accessRWO,
      accessROX,
      accessRWX,
    });
  },

  willSave() {
    const vol = get(this,'primaryResource');

    const entry = getSources().findBy('name', get(this,'sourceName'));
    vol.clearSourcesExcept(entry.value);

    const capacity = get(this,'capacity');
    if ( capacity ) {
      set(vol, 'capacity', {
        storage: capacity + 'Gi',
      });
    } else {
      set(vol, 'capacity', null);
    }

    const modes = [];
    if ( get(this, 'accessRWO') ) {
      modes.push('ReadWriteOnce');
    }
    if ( get(this, 'accessROX') ) {
      modes.push('ReadOnlyMany');
    }
    if ( get(this, 'accessRWX') ) {
      modes.push('ReadWriteMany');
    }

    set(vol, 'accessModes', modes);

    return this._super(...arguments);
  },

  doneSaving() {
    this.sendAction('cancel');
  },

  sourceChoices: computed('intl.locale', function() {
    const intl = get(this, 'intl');
    const out = getSources().map((p) => {
      const entry = Object.assign({}, p);
      const key = `volumeSource.${entry.name}.title`;
      if ( intl.exists(key) ) {
        entry.label = intl.t(key);
        entry.priority = 1;
      } else {
        entry.label = entry.name;
        entry.priority = 2;
      }

      return entry;
    });

    return out.sortBy('priority','label');
  }),

  sourceComponent: computed('sourceName', function() {
    const name = get(this, 'sourceName');
    const sources = getSources();
    const entry = sources.findBy('name', name);
    if (entry) {
      return {
        component: `volume-source/source-${name}`,
        field: entry.value,
      }
    }
  }),
});
