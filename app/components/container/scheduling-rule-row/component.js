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

function normalizedLabels(objects) {
  var out = {};
  objects.forEach((obj) => {
    var labels = obj.get('labels')||{};

    Object.keys(labels).filter((key) => {
      return key.indexOf(C.LABEL.SYSTEM_PREFIX) !== 0;
    }).forEach((key) => {
      let normalizedKey = key.trim().toLowerCase();
      if ( out[normalizedKey] )
      {
        out[normalizedKey].push(labels[key].toLowerCase());
      }
      else
      {
        out[normalizedKey] = [labels[key].toLowerCase()];
      }
    });
  });

  return out;
}

export default Ember.Component.extend({
  rule: null,
  instance: null,

  tagName: 'TR',
  classNames: 'main-row',

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

    this.set('allHosts', this.get('store').all('host'));

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

  getSuffixLabel: Ember.computed('suffix', function() {
    let label = this.get('schedulingRuleSuffixChoices').findBy('value', this.get('suffix')).label;
    label = label.split('.');
    return label[label.length -1];
  }),

  schedulingRuleSuffixChoices: function() {
    var out = [
      {label: 'schedulingRuleRow.must', value: ''},
    ];

    if ( !this.get('isGlobal') )
    {
      out.pushObjects([
        {label: 'schedulingRuleRow.should', value: '_soft'},
        {label: 'schedulingRuleRow.shouldNot', value: '_soft_ne'},
      ]);
    }

    out.push({label: 'schedulingRuleRow.mustNot', value: '_ne'});
    return out;
  }.property('isGlobal'),

  schedulingRuleKindChoices: function() {
    var out = [
      {label: 'schedulingRuleRow.hostLabel', value: 'host_label'},
    ];

    if ( !this.get('isGlobal') )
    {
      out.pushObjects([
        {label: 'schedulingRuleRow.containerLabel', value: 'container_label'},
        {label: 'schedulingRuleRow.serviceName', value: 'service_name'},
        {label: 'schedulingRuleRow.containerName', value: 'container_name'},
      ]);
    }

    return out;
  }.property('isGlobal'),

  normalizedHostLabels: function() {
    return normalizedLabels(this.get('allHosts'));
  }.property('allHosts.@each.labels'),

  hostLabelKeyChoices: function() {
    return Object.keys(this.get('normalizedHostLabels')).sort().uniq();
  }.property('normalizedHostLabels'),

  hostLabelValueChoices: function() {
    var key = this.get('userKey').toLowerCase();
    return ((this.get('normalizedHostLabels')[key])||[]).sort().uniq();
  }.property('userKey','normalizedHostLabels'),

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
  }.property('allHosts.@each.instances'),

  normalizedContainerLabels: function() {
    return normalizedLabels(this.get('allContainers'));
  }.property('allHosts.@each.labels'),

  containerLabelKeyChoices: function() {
    return Object.keys(this.get('normalizedContainerLabels')).sort().uniq();
  }.property('normalizedContainerLabels'),

  containerLabelValueChoices: function() {
    var key = this.get('userKey').toLowerCase();
    return ((this.get('normalizedContainerLabels')[key])||[]).sort().uniq();
  }.property('userKey','normalizedContainerLabels'),

  containerValueChoices: function() {
    var out = [];
    this.get('allContainers').forEach((container) => {
      var name = container.get('name');
      if ( name )
      {
        out.push(name);
      }
    });

    return out.map((key) => { return (key||'').toLowerCase(); }).sort().uniq();
  }.property('allContainers.@each.name'),

  serviceValueChoices: function() {
    var out = [];
    this.get('allContainers').forEach((container) => {
      var label = (container.get('labels')||{})[C.LABEL.SERVICE_NAME];
      if ( label )
      {
        out.pushObject(label);
      }
    });

    return out.map((key) => { return (key||'').toLowerCase(); }).sort().uniq();
  }.property('allContainers.@each.labels'),
});
