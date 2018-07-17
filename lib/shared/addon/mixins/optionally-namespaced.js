import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import { resolve, reject } from 'rsvp';

// Adds on to view-new-project/new-or-edit to handle resources that
// are optionally project-level or namespace-level
// (secrets)
export default Mixin.create({
  projectType:    'Set me to the type for project-level resources',
  namespacedType: 'Set me to the type for namespaced resources',

  namespacePromise() {
    let scope = get(this, 'scope');
    let pr = get(this, 'primaryResource');
    let ns = get(this, 'namespace');

    if ( !get(this, 'isNew')) {
      return resolve();
    }

    if ( scope === 'namespace' && !ns ) {
      return reject('No namespace specified');
    }

    let obj = pr.serialize();

    if ( scope === 'namespace' ) {
      obj.type = get(this, 'namespacedType');
      pr = get(this, 'store').createRecord(obj);
      set(this, 'primaryResource', pr);

      if ( get(ns, 'id') ) {
        set(pr, 'namespaceId', get(ns, 'id'));

        return resolve();
      } else {
        return ns.save().then((newNs) => {
          set(pr, 'namespaceId', get(newNs, 'id'));

          return newNs.waitForState('active');
        });
      }
    } else {
      obj.type = get(this, 'projectType');
      pr = get(this, 'store').createRecord(obj);
      set(this, 'primaryResource', pr);

      return resolve();
    }
  },

  doSave() {
    let self = this;
    let sup = self._super;

    return this.namespacePromise().then(() => {
      return sup.apply(self, arguments);
    });
  },
});
