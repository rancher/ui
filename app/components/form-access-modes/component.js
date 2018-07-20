import Component from '@ember/component';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  mode:  null,
  model: null,

  accessRWO: null,
  accessROX: null,
  accessRWX: null,

  didReceiveAttrs() {
    let accessRWO = true;
    let accessROX = false;
    let accessRWX = false;

    if ( get(this, 'mode') !== 'new' ) {
      const modes = get(this, 'model.accessModes') || [];

      accessRWO = modes.includes('ReadWriteOnce');
      accessROX = modes.includes('ReadOnlyMany');
      accessRWX = modes.includes('ReadWriteMany');
    }

    setProperties(this, {
      accessRWO,
      accessROX,
      accessRWX,
    });

    this.modesChanged();
  },

  modesChanged: observer('accessRWO', 'accessROX', 'accessRWX', function() {
    const modes = [];

    if ( get(this, 'accessRWO') ) {
      modes.push('ReadWriteOnce');
    }
    if ( get(this, 'accessROX') ) {
      modes.push('ReadOnlyMany');
    }
    if ( get(this, 'accessRWX') ) {
      modes.push('ReadWriteMany');
    }

    set(this, 'model.accessModes', modes);
  }),
  editing: computed('mode', function() {
    return get(this, 'mode') !== 'view';
  }),

});
