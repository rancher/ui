import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { parseSi } from 'shared/utils/parse-unit';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import layout from './template';

export default Component.extend(ViewNewEdit, ChildHook, {
  layout,
  intl: service(),

  model: null,
  namespace: null,
  persistentVolumes: null,
  storageClasses: null,
  selectNamespace: true,
  actuallySave: true,
  useStorageClass: true,
  capacity: null,

  titleKey: 'cruPersistentVolumeClaim.title',

  actions: {
    cancel: function() {
      this.sendAction('cancel');
    },
  },

  didReceiveAttrs() {
    if ( !get(this,'isNew') ) {
      set(this, 'capacity', 10);
    } else {
      const capacity = get(this, 'primaryResource.resources.requests.storage');
      if ( capacity ) {
        const bytes = parseSi(capacity);
        const gib = bytes/(1024**3);
        set(this, 'capacity', gib);
      }
    }
  },

  headerToken: function() {
    let k = 'cruPersistentVolumeClaim.';

    if ( get(this,'actuallySave' ) ) {
      k += 'add.';
    } else {
      k += 'define.';
    }

    k += get(this,'mode');
    return k;
  }.property('scope'),

  willSave() {
    let pr = get(this, 'primaryResource');

    if( get(this, 'useStorageClass') ) {
      set(pr, 'volumeId', null);

    } else {
      set(pr, 'storageClassId', null);
      set(pr, 'resources', null);
    }

      const capacity = get(this,'capacity');
      if ( capacity ) {
        set(pr, 'resources', {
          requests: {
            storage: capacity + 'Gi',
          }
        });
      } else {
        set(pr, 'resources', null);
      }

    if ( !get(this,'actuallySave') ) {
      let ok = this._super(...arguments);
      if ( ok ) {
        this.sendAction('doSave', {
          pvc: pr,
        });
        this.doneSaving();
      }

      return false;
    }

    const self = this;
    const sup = this._super;
    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(pr, 'namespaceId', get(this,'namespace.id'));
      return sup.apply(self, ...arguments);
    });
  },

  doneSaving() {
    this.sendAction('done');
  },
});
