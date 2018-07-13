import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model:          null,
  namespace:      null,
  namespacedType: 'namespacedSecret',
  projectType:    'secret',
  scope:          'project',
  titleKey:       'newSecret.title',

  init() {

    this._super(...arguments);

    if (get(this, 'model.type') === 'namespacedSecret') {

      set(this, 'scope', 'namespace');

    }

  },

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
    let sup  = self._super;

    return this.namespacePromise().then(() => sup.apply(self, arguments));

  },

  doneSaving() {

    this.sendAction('cancel');

  },

});
