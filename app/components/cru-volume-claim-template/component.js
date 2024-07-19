import { inject as service } from '@ember/service';
import { gt } from '@ember/object/computed';
import { get, set, computed } from '@ember/object';
import { parseSi } from 'shared/utils/parse-unit';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import layout from './template';
import Errors from 'ui/utils/errors';

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
  titleKey:          'cruVolumeClaimTemplate.title',

  canUseStorageClass: gt('storageClasses.length', 0),

  didReceiveAttrs() {
    if ( !this.persistentVolumes ) {
      set(this, 'persistentVolumes', this.clusterStore.all('persistentVolume'));
    }

    if ( !this.storageClasses ) {
      set(this, 'storageClasses', this.clusterStore.all('storageClass'));
    }

    if ( !this.selectNamespace ) {
      set(this, 'primaryResource.namespaceId', get(this, 'namespace.id') || get(this, 'namespace.name'));
    }

    if ( this.isNew ) {
      const capacity = get(this, 'primaryResource.resources.requests.storage');

      if ( capacity ) {
        const bytes = parseSi(capacity);
        const gib = bytes / (1024 ** 3);

        set(this, 'capacity', gib);
      }

      if ( !this.canUseStorageClass) {
        set(this, 'useStorageClass', false);
      }
    } else {
      set(this, 'capacity', 10);
    }
  },


  actions: {
    cancel() {
      if (this.cancel) {
        this.cancel();
      }
    },
  },

  persistentVolumeChoices: computed('persistentVolumes.@each.{name,state}', function() {
    return this.persistentVolumes.map((v) => {
      let label      = get(v, 'displayName');
      const state    = get(v, 'state');
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
    const pr = this.primaryResource;
    const intl = this.intl;

    if ( this.useStorageClass ) {
      set(pr, 'volumeId', null);

      const capacity = this.capacity;

      if ( capacity ) {
        set(pr, 'resources', { requests: { storage: `${ capacity  }Gi`, } });
      } else {
        const errors = [];

        errors.push(intl.t('validation.required', { key: intl.t('cruPersistentVolumeClaim.capacity.label') }));
        set(this, 'errors', errors);

        return false;
      }
    } else {
      set(pr, 'storageClassId', get(pr, 'persistentVolume.storageClassId') || null);
      set(pr, 'resources', { requests: Object.assign({}, get(pr, 'persistentVolume.capacity')), });
    }

    if ( !this.actuallySave ) {
      let ok = this._super(...arguments);

      if ( ok ) {
        if (this.doSave) {
          this.doSave({ pvc: pr })
        }

        this.doneSaving();
      }

      return false;
    }

    const self = this;
    const sup = this._super;

    if ( this.selectNamespace ) {
      const errors = [];

      errors.pushObjects(this.namespaceErrors || []);

      set(this, 'errors', errors);

      if ( get(errors, 'length') !== 0 ) {
        return false;
      }

      return this.applyHooks('_beforeSaveHooks').then(() => {
        set(pr, 'namespaceId', get(this, 'namespace.id'));

        return sup.apply(self, ...arguments);
      }).catch((err) => {
        set(this, 'errors', [Errors.stringify(err)]);
      });
    } else {
      if ( !get(pr, 'namespaceId') ) {
        set(pr, 'namespaceId', '__REPLACE_ME__');
      }

      return sup.apply(self, ...arguments);
    }
  },

  doneSaving() {
    if (this.done) {
      this.done();
    }
  },

});
