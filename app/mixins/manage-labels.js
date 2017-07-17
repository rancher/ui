import Ember from 'ember';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';

const USER     = 'user';
const SYSTEM   = 'system';
const AFFINITY = 'affinity';

export const TYPE = {
  USER,
  SYSTEM,
  AFFINITY
}

export function flattenLabelArrays(...lists) {
  let out = {};

  function flatten(row) {
    if ( row.value === undefined )
    {
      delete out[row.key];
    }
    else
    {
      out[row.key] = row.value;
    }
  }

  for ( let i = 0 ; i < lists.length ; i++ ) {
    (lists[i]||[]).forEach(flatten);
  }

  return out;
}

function isSoftUser(type,key) {
  // Include actual user labels
  if ( type === USER )
  {
    return true;
  }

  // Don't include any affinity labels
  if ( type === AFFINITY )
  {
    return false;
  }

  // Don't include any system labels that are blacklisted (because they have their own controls, like global)
  if ( C.SYSTEM_LABELS_WITH_CONTROL.indexOf(key) >= 0 )
  {
    return false;
  }

  // Include anything else
  return true;
}

export default Ember.Mixin.create({
  labelArray: null,

  actions: {
    addUserLabel() {
      this.get('labelArray').pushObject(Ember.Object.create({
        type: USER,
        key: '',
        value: '',
      }));
    },

    addSystemLabel() {
      this.get('labelArray').pushObject(Ember.Object.create({
        type: SYSTEM,
        key: '',
        value: '',
      }));
    },

    addAffinityLabel() {
      this.get('labelArray').pushObject(Ember.Object.create({
        type: AFFINITY,
        key: C.LABEL.SCHED_HOST_LABEL,
        value: '',
      }));
    },

    removeLabel(obj) {
      this.get('labelArray').removeObject(obj);
    },

    pastedLabels(str, target) {
      let ary = this.get('labelArray');
      str = str.trim();
      if ( str.indexOf('=') === -1 && str.indexOf(':') === -1)
      {
        // Just pasting a key
        $(target).val(str);
        return;
      }

      let lines = str.split(/\r?\n/);
      lines.forEach((line) => {
        line = line.trim();
        if ( !line )
        {
          return;
        }

        let idx = line.indexOf('=');
        if ( idx === -1 ) {
          idx = line.indexOf(':');
        }

        let key = '';
        let val = '';
        if ( idx > 0 )
        {
          key = line.substr(0,idx).trim();
          val = line.substr(idx+1).trim();
        }
        else
        {
          key = line.trim();
          val = '';
        }

        let existing = ary.filterBy('key',key)[0];
        if ( existing )
        {
          Ember.set(existing,'value',val);
        }
        else
        {
          ary.pushObject(Ember.Object.create({key: key, value: val, type: USER}));
        }
      });

      // Clean up empty user entries
      let toRemove = [];
      ary.filterBy('type',USER).forEach((item) => {
        if ( !item.get('key') && !item.get('value') )
        {
          toRemove.push(item);
        }
      });
      ary.removeObjects(toRemove);
    },
  },

  // User labels are actual user ones, plus system ones that have no controls in the UI so they are manually entered.
  userLabelArray: function() {
    return (this.get('labelArray')||[]).filter((item) => {
      return isSoftUser(item.get('type'), item.get('key'));
    });
  }.property('labelArray.@each.type'),

  strictUserLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',USER);
  }.property('labelArray.@each.type'),

  systemLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',SYSTEM);
  }.property('labelArray.@each.type'),

  affinityLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',AFFINITY);
  }.property('labelArray.@each.type'),

  getLabelObj: function(key) {
    let lcKey = (key||'').toLowerCase();
    let ary   = this.get('labelArray');
    let item;

    // Try specific case first
    for ( let i = 0 ; i < ary.get('length') ; i++ )
    {
      item = ary.objectAt(i);
      if ( item.get('key') === key )
      {
        return item;
      }
    }

    // Then case-insensitive
    for ( var i = 0 ; i < ary.get('length') ; i++ )
    {
      item = ary.objectAt(i);
      if ( item.get('key').toLowerCase() === lcKey )
      {
        return item;
      }
    }

    return null;
  },

  getLabel: function(key) {
    let obj = this.getLabelObj(key);
    if ( obj )
    {
      return obj.get('value');
    }

    return null;
  },

  setLabel: function(key, value) {
    let lcKey = (key||'').toLowerCase();
    let type  = 'user';

    // Rancher keys are always lowercase
    if ( lcKey.indexOf(C.LABEL.AFFINITY_PREFIX) === 0 )
    {
      type = 'affinity';
      key = lcKey;
    }
    else if ( lcKey.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
    {
      type = 'system';
      key = lcKey;
    }

    let existing = this.getLabelObj(key);
    if ( existing && existing.get('value') !== value )
    {
      Ember.setProperties(existing,{
        value: value,
        type: type,
      });
    }
    else
    {
      existing = this.get('labelArray').pushObject(Ember.Object.create({
        key: key,
        value: value,
        type: type,
      }));
    }

    return existing;
  },

  removeLabel: function(key, soft=false) {
    if ( soft )
    {
      this.setLabel(key, undefined);
    }
    else
    {
      let existing = this.getLabelObj(key);
      if ( existing )
      {
        this.get('labelArray').removeObject(existing);
      }
    }
  },

  initLabels: function(obj, onlyOfType, onlyKeys) {
    let out = [];

    if ( onlyKeys && !Ember.isArray(onlyKeys) )
    {
      onlyKeys = [onlyKeys];
    }


    Object.keys(obj||{}).forEach(function(key) {
      let type = 'user';
      if ( key.indexOf(C.LABEL.AFFINITY_PREFIX) === 0 )
      {
        type = 'affinity';
      }
      else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
      {
        type = 'system';
      }

      if ( C.LABELS_TO_IGNORE.indexOf(key) >= 0 )
      {
        // Skip ignored labels
        return;
      }

      if ( onlyOfType )
      {
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

      if ( onlyKeys && onlyKeys.indexOf(key) === -1 )
      {
        // Skip labels of keys we don't care about
        return;
      }

      out.push(Ember.Object.create({
        key: key,
        value: obj[key]||'',
        type: type,
      }));
    });

    this.set('labelArray', out);
    this.labelsChanged();
  },

  labelsChanged: debouncedObserver('labelArray.@each.{type,key,value}', function() {
    // Make a map of the keys we care about, and combine multiple values together
    let map = {};
    (this.get('labelArray')||[]).forEach(function(row) {
      let key   = row.get('key')   || '';
      let type  = row.get('type')  || '';

      // System and Affinity labels are always lowercase.
      if ( type !== USER )
      {
        key = key.toLowerCase();
      }

      // Pass undefined through, for soft-delete
      if ( row.get('value') === undefined )
      {
        map[key] = undefined;
        return;
      }

      let value = row.get('value') || '';

      // Skip empty keys, and system/affinity labels with no value
      if ( !key || (type !== USER && value === ''))
      {
        return;
      }

      // System and Affinity values used to be always lowercase.
      //if ( type !== USER )
      //{
      //  value = value.toLowerCase();
      //}

      // Affinity & System labels can be concatenated, Users just overwrite the previous value.
      if ( map[key] && type !== USER )
      {
        map[key] = map[key]+',' + value;
      }
      else
      {
        map[key] = value;
      }
    });

    // Then turn them back into an array because Ember hates maps.
    let out = [];
    Object.keys(map).forEach((key) => {
      out.push({key: key, value: map[key]});
    });

    this.updateLabels(out);
  }),

  updateLabels(/*labels*/) {
    // Override me to do something
  },
});
