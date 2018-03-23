import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import layout from './template';
import { getSources } from 'ui/models/volume';

export default Component.extend(ViewNewEdit, {
  intl: service(),

  layout,
  model: null,
  sourceName: null,

  actions: {
    updateParams(key, map) {
      getSources(true).forEach(source => {
        if(source.value === key){
          set(this, `primaryResource.${key}`, map);
        } else {
          set(this, `primaryResource.${source.value}`, null);
        }
      });
    },
  },

  titleKey: 'cruVolume.title',
  headerToken: function() {
    let k = 'cruPersistentVolumeClaim.define.';
    k += get(this,'mode');
    return k;
  }.property('scope'),

  didReceiveAttrs() {
    const configName = get(this,'primaryResource.configName');
    const sources = getSources(true);
    const entry = sources.findBy('value', configName);
    if ( entry ) {
      set(this, 'sourceName', entry.name);
    }
  },

  willSave() {
    const vol = get(this,'primaryResource');
    const entry = getSources(true).findBy('name', get(this,'sourceName'));
    vol.clearSourcesExcept(entry.value);

    let ok = this._super(...arguments);
    if ( ok ) {
      this.sendAction('doSave', {
        volume: vol,
      });
      this.doneSaving();
    }

    return false;
  },

  doneSaving() {
    this.sendAction('done');
  },

  sourceChoices: computed('intl.locale', function() {
    const intl = get(this, 'intl');
    const out = getSources(true).map((p) => {
      const entry = Object.assign({}, p);
      const key = `volumeSource.${entry.name}.title`;
      if ( intl.exists(key) ) {
        entry.label = intl.t(key);
        if ( p.ephemeral ) {
          entry.priority = 1;
        } else {
          entry.priority = 2;
        }
      } else {
        entry.label = entry.name;
        entry.priority = 3;
      }

      return entry;
    });

    return out.sortBy('priority','label');
  }),

  sourceComponent: computed('sourceName', function() {
    const name = get(this, 'sourceName');
    const sources = getSources(true);
    const entry = sources.findBy('name', name);
    if (entry) {
      return {
        component: `volume-source/source-${name}`,
        field: entry.value,
      }
    }
  }),
});
