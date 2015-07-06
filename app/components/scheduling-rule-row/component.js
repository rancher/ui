import Ember from 'ember';
import C from 'ui/utils/constants';

function splitEquals(str) {
  var idx = str.indexOf('=');
  if ( idx === -1 )
  {
    return null;
  }

  return [ str.substr(0,idx) , str.substr(idx+1) ];
}

export default Ember.Component.extend({
  rule: null,
  instance: null,
  allHosts: null,

  tagName: 'TR',

  isGlobal: null,
  kind: null,
  suffix: null,
  userKey: null,
  userValue: null,

  actions: {
    setKey: function(key) {
      this.set('userKey', key);
    },

    setValue: function(value) {
      this.set('userValue', value);
    },

    remove: function() {
      this.sendAction('remove', this.get('rule'));
    }
  },

  init: function() {
    this._super();

    var key = this.get('rule.key')||'';
    var value = this.get('rule.value')||'';
    var splitValue = splitEquals(value)||['',''];

    var match = key.match(/((_soft)?(_ne)?)$/);
    if ( match )
    {
      this.set('suffix', match[1]);
      key = key.substr(0, key.length - match[1].length);
    }
    else
    {
      this.set('suffix','');
    }

    // Convert from an existing key into the 4 fields
    switch ( key )
    {
      case C.LABEL.SCHED_CONTAINER:
        this.setProperties({
          kind: 'container_name',
          userKey: '',
          userValue: value,
        });
        break;
      case C.LABEL.SCHED_CONTAINER_LABEL:
        if ( splitValue[0] === C.LABEL.SERVICE_NAME )
        {
          this.setProperties({
            kind: 'service_name',
            userKey: '',
            userValue: splitValue[1],
          });
        }
        else
        {
          this.setProperties({
            kind: 'container_label',
            userKey: splitValue[0],
            userValue: splitValue[1],
          });
        }
        break;
      case C.LABEL.SCHED_HOST_LABEL:
        this.setProperties({
          kind: 'host_label',
          userKey: splitValue[0],
          userValue: splitValue[1],
        });
        break;
    }
  },

  valuesChanged: function() {
    var key = '';
    var value = null;

    var userKey = this.get('userKey')||'';
    var userValue = this.get('userValue')||'';

    switch ( this.get('kind') )
    {
      case 'host_label':
        key = C.LABEL.SCHED_HOST_LABEL;
        if ( userKey && userValue )
        {
          value = userKey + '=' + userValue;
        }
        break;
      case 'container_label':
        key = C.LABEL.SCHED_CONTAINER_LABEL;
        if ( userKey && userValue )
        {
          value = userKey + '=' + userValue;
        }
        break;
      case 'container_name':
        key = C.LABEL.SCHED_CONTAINER;
        if ( userValue )
        {
          value = userValue;
        }
        break;
      case 'service_name':
        key = C.LABEL.SCHED_CONTAINER_LABEL;
        if ( userValue )
        {
          value = C.LABEL.SERVICE_NAME + '=' + userValue;
        }
        break;
    }

    key += this.get('suffix');

    Ember.setProperties(this.get('rule'),{
      key: key,
      value: value
    });
  }.observes('kind','suffix','userKey','userValue'),

  isGlobalChanged: function() {
    if ( this.get('isGlobal') )
    {
      var kindChoices = this.get('schedulingRuleKindChoices').map((choice) => { return choice.value; });

      if ( kindChoices.indexOf(this.get('kind')) === -1 )
      {
        // This rule isn't allowed in global
        this.send('remove');
        return;
      }

      // 'Should' isn't allowed in global
      this.set('suffix', this.get('suffix').replace(/_soft/,''));
    }
  }.observes('isGlobal'),

  schedulingRuleSuffixChoices: function() {
    var out = [
      {label: 'must',       value: ''},
    ];

    if ( !this.get('isGlobal') )
    {
      out.pushObjects([
        {label: 'should',     value: '_soft'},
        {label: 'should not', value: '_soft_ne'},
      ]);
    }

    out.push({label: 'must not',   value: '_ne'});
    return out;
  }.property('isGlobal'),

  schedulingRuleKindChoices: function() {
    var out = [
      {label: 'host label',               value: 'host_label'},
    ];

    if ( !this.get('isGlobal') )
    {
      out.pushObjects([
        {label: 'container with label',     value: 'container_label'},
        {label: 'service with the name',    value: 'service_name'},
        {label: 'container with the name',  value: 'container_name'},
      ]);
    }

    return out;
  }.property('isGlobal'),

  hostLabelKeyChoices: function() {
    var out = [];
    this.get('allHosts').forEach((host) => {
      var keys = Object.keys(host.get('labels')||{}).filter((key) => {
        return key.indexOf(C.LABEL.SYSTEM_PREFIX) !== 0;
      });
      out.pushObjects(keys);
    });

    return out.sort().uniq();
  }.property('allHosts.@each.labels'),

  hostLabelValueChoices: function() {
    var key = this.get('userKey');

    var out = [];
    this.get('allHosts').forEach((host) => {
      var label = (host.get('labels')||{})[key];
      if ( label )
      {
        var parts = label.split(/\s*,\s*/);
        out.pushObjects(parts);
      }
    });

    return out.sort().uniq();
  }.property('userKey','allHosts.@each.labels'),

  allContainers: function() {
    var out = [];
    this.get('allHosts').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        return instance.get('kind') === 'container' &&
               !instance.get('systemContainer');
      });

      out.pushObjects(containers);
    });

    return out.sortBy('name','id').uniq();
  }.property('allHosts.@each.instancesUpdated'),

  containerLabelKeyChoices: function() {
    var out = [];
    this.get('allContainers').forEach((container) => {
      var keys = Object.keys(container.get('labels')||{}).filter((key) => {
        return key.indexOf(C.LABEL.SYSTEM_PREFIX) !== 0;
      });
      out.pushObjects(keys);
    });

    return out.sort().uniq();
  }.property('allContainers.@each.labels'),

  containerLabelValueChoices: function() {
    var key = this.get('userKey');
    var out = [];
    this.get('allContainers').forEach((container) => {
      var label = (container.get('labels')||{})[key];
      if ( label )
      {
        var parts = label.split(/\s*,\s*/);
        out.pushObjects(parts);
      }
    });

    return out.sort().uniq();
  }.property('userKey','allContainers.@each.labels'),

  containerValueChoices: function() {
    var out = [];
    this.get('allContainers').forEach((container) => {
      var name = container.get('name');
      if ( name )
      {
        out.push(name);
      }
    });

    return out.sort().uniq();
  }.property('allContainers.@each.name'),

  serviceValueChoices: function() {
    var out = [];
    this.get('allContainers').forEach((container) => {
      var label = (container.get('labels')||{})[C.LABEL.SERVICE_NAME];
      if ( label )
      {
        var parts = label.split(/\s*,\s*/);
        out.pushObjects(parts);
      }
    });

    return out.sort().uniq();
  }.property('allContainers.@each.labels'),
});
