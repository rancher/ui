import Ember from 'ember';
import C from 'ui/utils/constants';
import { debouncedObserver } from 'ui/utils/debounce';

const USER = 'user';
const SYSTEM = 'system';
const AFFINITY = 'affinity';

export default Ember.Mixin.create({
  labelArray: null,
  labelObj: null,

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
      var ary = this.get('labelArray');
      str = str.trim();
      if ( str.indexOf('=') === -1 )
      {
        // Just pasting a key
        $(target).val(str);
        return;
      }

      var lines = str.split(/\r?\n/);
      lines.forEach((line) => {
        line = line.trim();
        if ( !line )
        {
          return;
        }

        var idx = line.indexOf('=');
        var key = '';
        var val = '';
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

        var existing = ary.filterBy('key',key)[0];
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
      var toRemove = [];
      ary.filterBy('type',USER).forEach((item) => {
        if ( !item.get('key') && !item.get('value') )
        {
          toRemove.push(item);
        }
      });
      ary.removeObjects(toRemove);
    },
  },

  userLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',USER);
  }.property('labelArray.@each.type'),

  systemLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',SYSTEM);
  }.property('labelArray.@each.type'),

  affinityLabelArray: function() {
    return (this.get('labelArray')||[]).filterBy('type',AFFINITY);
  }.property('labelArray.@each.type'),

  getLabel: function(key) {
    key = (key||'').toLowerCase();
    var ary = this.get('labelArray');
    var item;
    for ( var i = 0 ; i < ary.get('length') ; i++ )
    {
      item = ary.objectAt(i);
      if ( item.get('key').toLowerCase() === key )
      {
        return item;
      }
    }

    return null;
  },

  setLabel: function(key, value) {
    key = (key||'').toLowerCase();
    var type = 'user';
    if ( key.indexOf(C.LABEL.SCHED_AFFINITY) === 0 )
    {
      type = 'affinity';
    }
    else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
    {
      type = 'system';
    }

    var existing = this.getLabel(key);
    if ( existing )
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

  removeLabel: function(key) {
    var existing = this.getLabel(key);
    if ( existing )
    {
      this.get('labelArray').removeObject(existing);
    }
  },

  initLabels: function(obj, onlyOfType, onlyKeys) {
    var out = [];

    if ( onlyKeys && !Ember.isArray(onlyKeys) )
    {
      onlyKeys = [onlyKeys];
    }


    Object.keys(obj||{}).forEach(function(key) {
      var type = 'user';
      if ( key.indexOf(C.LABEL.SCHED_AFFINITY) === 0 )
      {
        type = 'affinity';
      }
      else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
      {
        type = 'system';
      }

      if ( onlyOfType && type !== onlyOfType )
      {
        // Skip labels of the wrong type
        return;
      }

      if ( onlyKeys && onlyKeys.indexOf(key) === -1 )
      {
        // Skip labels of keys we don't care about
        return;
      }

      // Split values on comma
      var values = (obj[key]||'').split(/,/);
      values.forEach(function(value) {
        out.push(Ember.Object.create({
          key: key,
          value: value,
          type: type,
        }));
      });
    });

    this.set('labelArray', out);
    this.labelsChanged();
  },

  labelsChanged: debouncedObserver('labelArray.@each.{type,key,value}', function() {
    // Make a map of the keys we care about, and combine multiple values together
    var map = {};
    this.get('labelArray').forEach(function(row) {
      var key   = row.get('key')   || '';
      var type  = row.get('type')  || '';
      var value = row.get('value') ||  '';

      // Skip empty keys, and system/affinity labels with no value
      if ( !key || (type !== USER && value === ''))
      {
        return;
      }

      // System and Affinity labels are always lowercase.
      if ( type !== USER )
      {
        key = key.toLowerCase();
        value = value.toLowerCase();
      }

      // Affinity labels can be concatenated, others just overwrite the previous value.
      if ( map[key] && type === AFFINITY )
      {
        map[key] = map[key]+',' + value;
      }
      else
      {
        map[key] = value;
      }
    });

    // Then turn them back into an array because Ember hates maps.
    var out = [];
    Object.keys(map).forEach((key) => {
      out.push({key: key, value: map[key]});
    });

    this.updateLabels(out);
  }),

  updateLabels(/*labels*/) {
    throw new Error('Override me to do something');
  }

});
