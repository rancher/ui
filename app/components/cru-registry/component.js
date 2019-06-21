import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';
import  { PRESETS_BY_NAME } from  'ui/models/dockercredential';
import { inject as service } from '@ember/service'

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  globalStore: service(),

  layout,

  model: null,

  titleKey: 'cruRegistry.title',

  scope:     'project',
  namespace: null,
  asArray:   null,

  projectType:    'dockerCredential',
  namespacedType: 'namespacedDockerCredential',

  init() {
    this._super(...arguments);

    if (get(this, 'model.type') === 'namespacedDockerCredential') {
      set(this, 'scope', 'namespace');
    }
    const globalRegistryEnabled = get(this, 'globalStore').all('setting').findBy('id', 'global-registry-enabled') || {};

    set(this, 'globalRegistryEnabled', get(globalRegistryEnabled, 'value') === 'true')

    let asArray = JSON.parse(JSON.stringify(get(this, 'model.asArray') || []))

    if (!globalRegistryEnabled && get(this, 'mode') === 'new') {
      asArray = asArray.map((item) => {
        if (item.preset === get(this, 'hostname')) {
          return {
            ...item,
            preset: 'custom'
          }
        }

        return item
      })
    }

    set(this, 'asArray', asArray);
  },

  arrayChanged: observer('asArray.@each.{preset,address,username,password,auth}', function() {
    const registries = {};

    get(this, 'asArray').forEach((obj) => {
      const preset = get(obj, 'preset');
      let key = get(obj, 'address');

      if ( PRESETS_BY_NAME[preset] ) {
        key = PRESETS_BY_NAME[preset];
      }

      let val = {};

      ['username', 'password', 'auth'].forEach((k) => {
        let v = get(obj, k);

        if ( v ) {
          val[k] = v;
        }
      });

      registries[key] = val;
    });

    set(this, 'model.registries', registries);

    return this._super(...arguments);
  }),

  hostname:  window.location.host,

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
    if (this.done) {
      this.done();
    }
  },
});
