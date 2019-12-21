import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';

export default Component.extend( {
  layout,

  volume: null,
  config: alias('volume.csi'),

  init() {
    this._super();

    if ( !this.config ) {
      set(this, 'config', this.configForNew())
    }
  },

  configForNew() {
    const store = this.sourceStore || this.store;
    const index = get(this, 'volume.type').lastIndexOf('/') + 1
    const voluemType = get(this, 'volume.type').substr(index).toLowerCase();

    const volumeSchema = store.getById('schema', voluemType);
    const type = get(volumeSchema, `resourceFields.csi.type`).toLowerCase();

    const config = store.createRecord({
      type,
      readOnly: false
    });

    this.initSecret(store, type, 'controllerExpandSecretRef', config);
    this.initSecret(store, type, 'controllerPublishSecretRef', config);
    this.initSecret(store, type, 'nodePublishSecretRef', config);
    this.initSecret(store, type, 'nodeStageSecretRef', config);

    return config;
  },

  initSecret(store, type, ref, config) {
    const schema = store.getById('schema', type);

    if ( (schema.typeifyFields || []).indexOf(ref) > -1 ) {
      get(config, ref) || set(config, ref, {});
    }
  }
});
