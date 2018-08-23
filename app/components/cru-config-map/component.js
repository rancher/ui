import { get, set } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { VIEW, NEW, EDIT } from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import { equal, or } from '@ember/object/computed'
import layout from './template';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model:     null,
  namespace: null,

  titleKey:       'newConfigMap.title',
  scope:          'namespace',
  namespacedType: 'configMap',

  isView:  equal('mode', VIEW),
  isNew:   equal('mode', NEW),
  isEdit:  equal('mode', EDIT),
  notView: or('isNew', 'isEdit'),

  init() {
    this._super(...arguments);

    const ns = get(this, 'primaryResource.namespace');

    if (ns) {
      set(this, 'namespace', ns);
    }
  },

  actions: {
    updateData(map) {
      set(this, 'primaryResource.data', map);
    },
  },

  willSave() {
    let pr = get(this, 'primaryResource');

    // Namespace is required, but doesn't exist yet... so lie to the validator
    let nsId = get(pr, 'namespaceId');

    set(pr, 'namespaceId', '__TEMP__');
    let ok = this.validate();

    set(pr, 'namespaceId', nsId);

    return ok;
  },

  validate() {
    this._super();

    const errors = get(this, 'errors') || [];

    errors.pushObjects(get(this, 'namespaceErrors') || []);
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
