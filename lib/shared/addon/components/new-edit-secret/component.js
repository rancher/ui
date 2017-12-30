import { get, set } from '@ember/object';
import { resolve, reject } from 'rsvp';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';

export default Component.extend(ViewNewEdit, {
  layout,
  model: null,

  titleKey: 'newSecret.title',

  scope: 'project',
  namespace: null,

  actions: {
    updateData(map) {
      set(this, 'primaryResource.data', map);
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  doSave() {
    let mode = get(this, 'mode');
    let scope = get(this, 'scope');
    let pr = get(this, 'primaryResource');
    let ns = get(this, 'namespace');

    if ( mode === 'edit' || scope === 'project' ) {
      return this._super(...arguments);
    }

    let promise = resolve();

    // Convert to a namespacedSecret and create the NS as needed
    if ( ns ) {
      let obj = pr.serialize();
      obj.type = 'namespacedSecret';
      pr = get(this,'store').createRecord(obj);
      set(this,'primaryResource',pr);

      if ( get(ns, 'id') ) {
        set(pr, 'namespaceId', get(ns, 'id'));
      } else if ( ns ) {
        promise = ns.save().then((newNs) => {
          set(pr, 'namespaceId', get(newNs, 'id'));
          return newNs.waitForState('active');
        });
      } else {
        return reject('No namespace specified');
      }
    }

    let self = this;
    let sup = self._super;
    return promise.then(() => {
      return sup.apply(self,arguments);
    });
  },

  doneSaving() {
    this.sendAction('cancel');
  },
});
