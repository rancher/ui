import { isArray } from '@ember/array';
import EmberObject, { set, setProperties, computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';
import { isEmpty } from '@ember/utils';

const USER     = 'user';
const SYSTEM   = 'system';
const AFFINITY = 'affinity';

export const TYPE = {
  USER,
  SYSTEM,
  AFFINITY
}

export const K3S_LABELS_TO_IGNORE = [
  C.LABEL.K3S_NODE_ARGS,
  C.LABEL.K3S_NODE_CONFIG_HASH,
  C.LABEL.K3S_NODE_ENV
];

export function flattenLabelArrays(...lists) {
  let out = {};

  function flatten(row) {
    if ( row.value === undefined ) {
      delete out[row.key];
    } else {
      out[row.key] = row.value;
    }
  }

  for ( let i = 0 ; i < lists.length ; i++ ) {
    (lists[i] || []).forEach(flatten);
  }

  return out;
}

function isSoftUser(type, key) {
  // Include actual user labels
  if ( type === USER ) {
    return true;
  }

  // Don't include any affinity labels
  if ( type === AFFINITY ) {
    return false;
  }

  // Don't include any system labels that are blacklisted (because they have their own controls, like global)
  if ( C.SYSTEM_LABELS_WITH_CONTROL.indexOf(key) >= 0 ) {
    return false;
  }

  // Include anything else
  return true;
}

export default Mixin.create({
  labelArray: null,

  k3sLabelsToIgnore: K3S_LABELS_TO_IGNORE,

  actions: {
    addUserLabel() {
      this.get('labelArray').pushObject(EmberObject.create({
        type:  USER,
        key:   '',
        value: '',
      }));
    },

    addSystemLabel() {
      this.get('labelArray').pushObject(EmberObject.create({
        type:  SYSTEM,
        key:   '',
        value: '',
      }));
    },

    addAffinityLabel() {
      this.get('labelArray').pushObject(EmberObject.create({
        type:  AFFINITY,
        key:   C.LABEL.SCHED_HOST_LABEL,
        value: '',
      }));
    },

    removeLabel(obj) {
      this.get('labelArray').removeObject(obj);
    },

    pastedLabels(str, target) {
      let ary = this.get('labelArray');

      str = str.trim();
      if ( str.indexOf('=') === -1 && str.indexOf(':') === -1) {
        // Just pasting a key
        $(target).val(str); // eslint-disable-line

        return;
      }

      let lines = str.split(/\r?\n/);

      lines.forEach((line) => {
        line = line.trim();
        if ( !line ) {
          return;
        }

        let idx = line.indexOf('=');

        if ( idx === -1 ) {
          idx = line.indexOf(':');
        }

        let key = '';
        let val = '';

        if ( idx > 0 ) {
          key = line.substr(0, idx).trim();
          val = line.substr(idx + 1).trim();
        } else {
          key = line.trim();
          val = '';
        }

        let existing = ary.filterBy('key', key)[0];

        if ( existing ) {
          set(existing, 'value', val);
        } else {
          ary.pushObject(EmberObject.create({
            key,
            value: val,
            type:  USER
          }));
        }
      });

      // Clean up empty user entries
      let toRemove = [];

      ary.filterBy('type', USER).forEach((item) => {
        if ( !item.get('key') && !item.get('value') ) {
          toRemove.push(item);
        }
      });
      ary.removeObjects(toRemove);
    },
  },

  // User labels are actual user ones, plus system ones that have no controls in the UI so they are manually entered.
  userLabelArray: computed('labelArray.@each.type', function() {
    return (this.get('labelArray') || []).filter((item) => {
      return isSoftUser(item.get('type'), item.get('key'));
    });
  }),

  strictUserLabelArray: computed('labelArray.@each.type', function() {
    return (this.get('labelArray') || []).filterBy('type', USER);
  }),

  systemLabelArray: computed('labelArray.@each.type', function() {
    return (this.get('labelArray') || []).filterBy('type', SYSTEM);
  }),

  affinityLabelArray: computed('labelArray.@each.type', function() {
    return (this.get('labelArray') || []).filterBy('type', AFFINITY);
  }),

  getLabelObj(key) {
    let lcKey = (key || '').toLowerCase();
    let ary   = this.get('labelArray');
    let item;

    // Try specific case first
    for ( let i = 0 ; i < ary.get('length') ; i++ ) {
      item = ary.objectAt(i);
      if ( item.get('key') === key ) {
        return item;
      }
    }

    // Then case-insensitive
    for ( var i = 0 ; i < ary.get('length') ; i++ ) {
      item = ary.objectAt(i);
      if ( item.get('key').toLowerCase() === lcKey ) {
        return item;
      }
    }

    return null;
  },

  getLabel(key) {
    let obj = this.getLabelObj(key);

    if ( obj ) {
      return obj.get('value');
    }

    return null;
  },

  setLabel(key, value) {
    let lcKey = (key || '').toLowerCase();
    let type  = 'user';

    // Rancher keys are always lowercase
    if ( lcKey.indexOf(C.LABEL.AFFINITY_PREFIX) === 0 ) {
      type = 'affinity';
      key = lcKey;
    } else if ( lcKey.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 ) {
      type = 'system';
      key = lcKey;
    }

    let existing = this.getLabelObj(key);

    if ( existing ) {
      if ( existing.get('value') !== value ) {
        setProperties(existing, {
          value,
          type,
        });
      }
    } else {
      existing = this.get('labelArray').pushObject(EmberObject.create({
        key,
        value,
        type,
      }));
    }

    return existing;
  },

  removeLabel(key, soft = false) {
    if ( soft ) {
      this.setLabel(key, undefined);
    } else {
      let existing = this.getLabelObj(key);

      if ( existing ) {
        this.get('labelArray').removeObject(existing);
      }
    }
  },

  initLabels(obj, onlyOfType, onlyKeys, readonlyKeys, labelsToIgnore) {
    let out = [];
    let ignoredLabels = [...C.LABELS_TO_IGNORE];

    if (!isEmpty(labelsToIgnore)) {
      ignoredLabels.pushObjects(labelsToIgnore);
    }

    if ( onlyKeys && !isArray(onlyKeys) ) {
      onlyKeys = [onlyKeys];
    }

    if ( readonlyKeys && !isArray(readonlyKeys) ) {
      readonlyKeys = [readonlyKeys];
    }

    Object.keys(obj || {}).forEach((key) => {
      let type = 'user';

      if ( key.indexOf(C.LABEL.AFFINITY_PREFIX) === 0 ) {
        type = 'affinity';
      } else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 ) {
        type = 'system';
      }

      if ( ignoredLabels.indexOf(key) >= 0 ) {
        // Skip ignored labels
        return;
      }

      if ( onlyOfType ) {
        // Strict User, only those with type actually == user
        if ( onlyOfType === 'strictUser' && type !== 'user' ) {
          return;
        }

        if ( onlyOfType === 'user' ) {
          // Soft user := user + system things that don't have UI controls
          if ( !isSoftUser(type, key) ) {
            return;
          }
        } else if ( onlyOfType !== type ) {
        // Generally the wrong type, for system or affinity
          return;
        }
      }

      if ( onlyKeys && onlyKeys.indexOf(key) === -1 ) {
        // Skip labels of keys we don't care about
        return;
      }

      out.push(EmberObject.create({
        key,
        value:    obj[key] || '',
        type,
        readonly: readonlyKeys && readonlyKeys.indexOf(key) >= 0
      }));
    });

    this.set('labelArray', out);
    this.labelsChanged();
  },

  labelsChanged: debouncedObserver('labelArray.@each.{type,key,value}', function() {
    // Make a map of the keys we care about, and combine multiple values together
    let map = {};

    (this.get('labelArray') || []).forEach((row) => {
      let key   = row.get('key')   || '';
      let type  = row.get('type')  || '';

      // System and Affinity labels are always lowercase.
      if ( type !== USER ) {
        key = key.toLowerCase();
      }

      // Pass undefined through, for soft-delete
      if ( row.get('value') === undefined ) {
        map[key] = undefined;

        return;
      }

      let value = row.get('value') || '';

      // Skip empty keys, and system/affinity labels with no value
      if ( !key || (type !== USER && value === '')) {
        return;
      }

      // System and Affinity values used to be always lowercase.
      // if ( type !== USER )
      // {
      //  value = value.toLowerCase();
      // }

      // Affinity & System labels can be concatenated, Users just overwrite the previous value.
      if ( map[key] && type !== USER ) {
        map[key] = `${ map[key] },${  value }`;
      } else {
        map[key] = value;
      }
    });

    // Then turn them back into an array because Ember hates maps.
    let out = [];

    Object.keys(map).forEach((key) => {
      out.push({
        key,
        value: map[key]
      });
    });

    this.updateLabels(out);
  }),

  updateLabels(/* labels*/) {
    // Override me to do something
  },
});
