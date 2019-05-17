import Component from '@ember/component';
import layout from './template';
import { set, get } from '@ember/object';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);
    this.storageClassInit()
    if (get(this, 'config.storageClass')) {
      set(this, 'useStorageClass', true)
    }
    if (get(this, 'config.existingClaim')) {
      set(this, 'useStorageClass', false)
    }
  },

  storageClassInit() {
    const storageClassId = get(this, 'config.storageClass')

    if (!storageClassId) {
      return
    }
    const { storageClasses = [] } = this
    const filtered = storageClasses.filter((s) => s.id === storageClassId)

    if (filtered.length === 0) {
      set(this, 'config.storageClass', null)
    }
  },
});
