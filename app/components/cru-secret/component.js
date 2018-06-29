import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model: null,

  titleKey: 'newSecret.title',

  scope:     'project',
  namespace: null,

  projectType:    'secret',
  namespacedType: 'namespacedSecret',

  actions: {
    updateData(map) {

      set(this, 'primaryResource.data', map);

    },
  },

  validate() {

    const errors = [];

    if ( get(this, 'scope') !== 'project' ) {

      errors.pushObjects(get(this, 'namespaceErrors') || []);

    }
    set(this, 'errors', errors);

    return errors.length === 0;

  },

  doSave() {

    let self = this;
    let sup = self._super;

    return this.namespacePromise().then(() => sup.apply(self, arguments));

  },

  doneSaving() {

    this.sendAction('cancel');

  },
});
