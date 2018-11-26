import { inject as service } from '@ember/service';
import { gt } from '@ember/object/computed';
import { get, set, computed } from '@ember/object';
import { parseSi } from 'shared/utils/parse-unit';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import layout from './template';

export default Component.extend(ViewNewEdit, ChildHook, {
  intl:  service(),
  scope: service(),

  layout,
  model:             null,
  namespace:         null,
  persistentVolumes: null,
  storageClasses:    null,
  selectNamespace:   true,
  actuallySave:      true,
  useStorageClass:   true,
  capacity:          null,

  titleKey: 'cruPersistentVolumeClaim.title',

  canUseStorageClass: gt('storageClasses.length', 0),

  didReceiveAttrs() {
    if ( !get(this, 'persistentVolumes') ) {
      set(this, 'persistentVolumes', get(this, 'clusterStore').all('persistentVolume'));
    }

    if ( !get(this, 'storageClasses') ) {
      set(this, 'storageClasses', get(this, 'clusterStore').all('storageClass'));
    }

    if ( !get(this, 'selectNamespace') ) {
      set(this, 'primaryResource.namespaceId', get(this, 'namespace.id') || get(this, 'namespace.name'));
    }

    if ( get(this, 'isNew') ) {
      const capacity = get(this, 'primaryResource.resources.requests.storage');

      if ( capacity ) {
        const bytes = parseSi(capacity);
        const gib = bytes / (1024 ** 3);

        set(this, 'capacity', gib);
      }

      if ( !get(this, 'canUseStorageClass')) {
        set(this, 'useStorageClass', false);
      }
    } else {
      set(this, 'capacity', 10);
    }
  },

  actions: {
    cancel() {
      this.sendAction('cancel');
    },
  },

  headerToken: function() {
    let k = 'cruPersistentVolumeClaim.';

    if ( get(this, 'actuallySave' ) ) {
      k += 'add.';
    } else {
      k += 'define.';
    }

    k += get(this, 'mode');

    return k;
  }.property('actuallySave', 'mode'),

  persistentVolumeChoices: computed('persistentVolumes.@each.{name,state}', function() {
    return get(this, 'persistentVolumes').map((v) => {
      let label = get(v, 'displayName');
      const state = get(v, 'state');
      const disabled = state !== 'available';

      if ( disabled ) {
        label += ` (${  state  })`;
      }

      return {
        label,
        disabled,
        value: get(v, 'id'),
      }
    })
      .sortBy('label');
  }),
  willSave() {
    const pr = get(this, 'primaryResource');
    const intl = get(this, 'intl');

    if ( get(this, 'useStorageClass') ) {
      set(pr, 'volumeId', null);

      const capacity = get(this, 'capacity');

      if ( capacity ) {
        set(pr, 'resources', { requests: { storage: `${ capacity  }Gi`, } });
      } else {
        const errors = [];

        errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolumeClaim.capacity.label') }));
        set(this, 'errors', errors);

        return false;
      }
    } else {
      set(pr, 'storageClassId', null);
      set(pr, 'resources', { requests: Object.assign({}, get(pr, 'persistentVolume.capacity')), });
    }

    if ( !get(this, 'actuallySave') ) {
      let ok = this._super(...arguments);

      if ( ok ) {
        this.sendAction('doSave', { pvc: pr, });
        this.doneSaving();
      }

      return false;
    }

    const self = this;
    const sup = this._super;

    if ( get(this, 'selectNamespace') ) {
      if ( get(this, 'namespaceErrors.length') ) {
        return false;
      }

      return this.applyHooks('_beforeSaveHooks').then(() => {
        set(pr, 'namespaceId', get(this, 'namespace.id'));

        return sup.apply(self, ...arguments);
      });
    } else {
      if ( !get(pr, 'namespaceId') ) {
        set(pr, 'namespaceId', '__REPLACE_ME__');
      }

      return sup.apply(self, ...arguments);
    }
  },

  doneSaving() {
    this.sendAction('done');
  },

});
