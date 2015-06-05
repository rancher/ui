import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  labelResource: Ember.computed.alias('primaryResource'),

  actions: {
    addLabel: function() {
      this.get('labelArray').pushObject(Ember.Object.create({
        isUser: true,
        type: 'user',
        key: '',
        value: '',
      }));
    },

    addSystemLabel: function(key, value, type) {
      if ( !type )
      {
        type = ((key||'').indexOf(C.LABEL.SCHED_AFFINITY) === 0 ? 'affinity' : 'system');
      }

      this.get('labelArray').pushObject(Ember.Object.create({
        isUser: false,
        type: type,
        key: key,
        value: value,
      }));
    },

    removeLabel: function(obj) {
      this.get('labelArray').removeObject(obj);
    },

    pastedLabels: function(str, target) {
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

        var existing = ary.filterProperty('key',key)[0];
        if ( existing )
        {
          Ember.set(existing,'value',val);
        }
        else
        {
          ary.pushObject(Ember.Object.create({key: key, value: val}));
        }
      });

      ary.forEach((item) => {
        if ( !item.key && !item.value )
        {
          ary.removeObject(item);
        }
      });
    },
  },

  labelArray: null,

  userLabelArray: function() {
    return (this.get('labelArray')||[]).filterProperty('isUser',true);
  }.property('labelArray.@each.isUser'),

  systemLabelArray: function() {
    return (this.get('labelArray')||[]).filterProperty('isUser',false);
  }.property('labelArray.@each.isUser'),

  affinityLabelArray: function() {
    return (this.get('labelArray')||[]).filterProperty('type','affinity');
  }.property('labelArray.@each.type'),

  initFields: function() {
    this._super();
    this.initLabels();
  },

  initLabels: function() {
    var obj = this.get('labelResource.labels')||{};
    var keys = Object.keys(obj);
    var out = [];
    keys.forEach(function(key) {
      var type = 'user';
      if ( key.indexOf(C.LABEL.SCHED_AFFINITY) === 0 )
      {
        type = 'affinity';
      }
      else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
      {
        type = 'system';
      }

      out.push(Ember.Object.create({
        key: key,
        value: obj[key],
        type: type,
        isUser: (type === 'user'),
      }));
    });

    this.set('labelArray', out);
  },

  labelsChanged: function() {
    // Sync with the actual environment object
    var out = {};
    this.get('labelArray').forEach(function(row) {
      if ( row.key )
      {
        // System labels have to have a value before they're added, users ones can be just key.
        if ( row.isUser || row.value )
        {
          out[row.key] = row.value;
        }
      }
    });

    if ( this.get('labelResource') )
    {
      this.set('labelResource.labels', out);
    }
  }.observes('labelArray.@each.{key,value}'),

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
        isUser: (type === 'user'),
      });
    }
    else
    {
      existing = this.get('labelArray').pushObject(Ember.Object.create({
        key: key,
        value: value,
        type: type,
        isUser: (type === 'user'),
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
});
