import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ChildHook from 'shared/mixins/child-hook';
import layout from './template';

export default Component.extend(NewOrEdit, ChildHook, {
  layout,
  intl: service(),

  model: null,
  namespace: null,
  persistentVolumes: null,
  storageClasses: null,
  selectNamespace: true,
  actuallySave: true,
  useStorageClass: true,

  titleKey: 'cruPersistentVolumeClaim.title',

  actions: {
    cancel: function() {
      this.sendAction('cancel');
    },
  },

  headerToken: function() {
    let k = 'editVolume.';

    if ( this.get('actuallySave' ) ) {
      k += 'add.';
    } else {
      k += 'define.';
    }

    k += this.get('scope');
    return k;
  }.property('scope'),

  willSave() {
    let pr = get(this, 'primaryResource');

    if ( !this.get('actuallySave') ) {
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
