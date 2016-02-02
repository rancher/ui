import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  settings: Ember.inject.service(),

  isStandalone: true,
  service: null,
  existing: null,
  balancerConfig: null,
  haproxyConfig: null,
  allHosts: null,
  allServices: null,
  allCertificates: null,

  listenersArray: null,
  targetResources: null,
  targetsArray: null,
  serviceLinksArray: null,
  isGlobal: null,
  isRequestedHost: null,
  portsAsStrArray: null,

  // Errors from components
  schedulingErrors: null,
  scaleErrors: null,
  portErrors: null,

  primaryResource: Ember.computed.alias('service'),
  launchConfig: Ember.computed.alias('service.launchConfig'),

  actions: {
    setScale(scale) {
      this.set('service.scale', scale);
    },

    toggleAdvanced() {
      this.set('advanced', !this.get('advanced'));
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setGlobal(bool) {
      this.set('isGlobal', bool);
    },

    setListeners(listeners) {
      this.set('listenersArray', listeners);
    },

    setTargets(array, resources) {
      this.set('targetsArray', array);
      this.set('targetResources', resources);
    },

    setServiceLinks(links) {
      this.set('serviceLinksArray', links);
    },

    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didInitAttrs() {
    this.labelsChanged();
    this.set('listenersArray',[]);
    this.set('targetsArray',[]);
    this.set('targetResources',[]);
  },

  didInsertElement() {
    this.send('selectTab','ssl');
    this.$('INPUT')[0].focus();
  },

  hasMultipleListeners: function() {
    return this.get('listenersArray').filterBy('host').get('length') >= 2;
  }.property('listenersArray.@each.host'),

  hasHttpListeners: function() {
    return this.get('listenersArray').filterBy('protocol','http').get('length') > 0;
  }.property('listenersArray.@each.protocol'),

  hasSslListeners: function() {
    return this.get('listenersArray').filterBy('ssl',true).get('length') > 0;

  }.property('listenersArray.@each.ssl'),

  listenersChanged: function() {
    var ports = [];
    var expose = [];
    this.get('listenersArray').forEach(function(listener) {
      var host = parseInt(listener.get('host'),10);
      var container = parseInt(listener.get('container'),10);
      var proto = listener.get('protocol');

      // You almost definitely probably want 443->80.
      if ( host === 443 && !container && listener.get('ssl'))
      {
        container = 80;
        listener.set('container', 80);
      }

      if ( host && proto )
      {
        var str = host +':'+ (container ? + container : host) + (proto === 'http' ? '': '/' + proto );
        if ( listener.get('isPublic') )
        {
          ports.pushObject(str);
        }
        else
        {
          expose.pushObject(str);
        }
      }
    });

    this.set('launchConfig.ports', ports.sort().uniq());
    this.set('launchConfig.expose', expose.sort().uniq());
  }.observes('listenersArray.@each.{host,protocol,container,isPublic,ssl}'),

  hasAdvancedSourcePorts: function() {
    return this.get('targetsArray').filterBy('isService',true).filter((target) => {
      return parseInt(target.get('srcPort'),10) > 0;
    }).get('length') > 0;
  }.property('targetsArray.@each.{isService,srcPort}'),

  hasMultipleTargets: function() {
    return this.get('targetsArray').filterBy('value').get('length') >= 2;
  }.property('targetsArray.@each.value'),

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,
  sslLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    'sslLabels.@each.{key,value}',
    function() {
      var out = {};

      (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('sslLabels')||[]).forEach((row) => { out[row.key] = row.value; });

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave() {
    var errors = [];
    if ( !this.get('editing') )
    {
      // Errors from components
      errors.pushObjects(this.get('schedulingErrors')||[]);
      errors.pushObjects(this.get('scaleErrors')||[]);

      if ( errors.length )
      {
        this.set('errors', errors);
        return false;
      }
    }

    return this._super();
  },

  validate: function() {
    var errors = [];
    if (!this.get('launchConfig.ports.length') && !this.get('launchConfig.expose.length') )
    {
      errors.push('Choose one or more ports to listen on');
    }

    if ( !this.get('targetResources.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    var bad = this.get('targetsArray').filter(function(obj) {
      return !Ember.get(obj,'value');
    });
    if ( bad.get('length') )
    {
      if ( this.get('isAdvanced') )
      {
        errors.push('Target Service is required on each Target');
      }
      else
      {
        this.get('targetsArray').removeObjects(bad);
      }
    }

    bad = this.get('targetsArray').filter(function(obj) {
      return Ember.get(obj, 'srcPort') && !Ember.get(obj, 'hostname') && !Ember.get(obj, 'dstPort') && !Ember.get(obj,'path');
    });
    if ( bad.get('length') )
    {
      errors.push('A Target can\'t have just a Source Port.  Remove it, or add a Request Host, Request Path, or Target Port.');
    }

    if ( !this.get('service.defaultCertificateId') )
    {
      bad = this.get('listenersArray').filterBy('ssl',true);
      if ( bad.get('length') )
      {
        errors.push('Certificate is required with SSL listening ports.');
      }
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    // Generic validation
    this._super();
    errors = this.get('errors')||[];

    errors.pushObjects(this.get('service').validationErrors());

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },


  didSave() {
    // Set balancer targets
    return this.get('service').doAction('setservicelinks', {
      serviceLinks: this.get('targetResources'),
    });
  },

  doneSaving() {
    this.send('done');
  },
});
