import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { VIEW, NEW, EDIT } from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import { equal, or } from '@ember/object/computed'
import layout from './template';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model: null,
  namespace: null,

  titleKey: 'newConfigMap.title',
  scope: 'namespace',
  namespacedType: 'configMap',

  isView: equal('mode', VIEW),
  isNew: equal('mode', NEW),
  isEdit: equal('mode', EDIT),
  notView: or('isNew', 'isEdit'),

  actions: {
    updateData(map) {
      set(this, 'primaryResource.data', map);
    },
  },

  init() {
    this._super(...arguments);

    const ns = get(this, 'primaryResource.namespace');
    if (ns) {
      set(this, 'namespace', ns);
    }
  },

  validate() {
    const errors = [];
    errors.pushObjects(get(this,'namespaceErrors')||[]);
    set(this,'errors', errors);
    return errors.length === 0;
  },

  doSave() {
    let self = this;
    let sup = self._super;
    return this.namespacePromise().then(() => {
      return sup.apply(self, arguments);
    });
  },

  doneSaving() {
    this.sendAction('cancel');
  },
});
