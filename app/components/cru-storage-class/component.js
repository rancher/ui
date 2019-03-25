import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import layout from './template';
import { getProvisioners } from 'ui/models/storageclass';
import ChildHook from 'shared/mixins/child-hook';

export default Component.extend(ViewNewEdit, ChildHook, {
  intl: service(),

  layout,
  model: null,

  titleKey: 'cruStorageClass.title',

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
