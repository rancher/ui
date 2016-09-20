import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Mixin.create(NewOrEdit, {
  settings           : Ember.inject.service(),
  allServicesService : Ember.inject.service('all-services'),
  allServices        : null,
  allCertificates    : null,
  service            : null,
  launchConfig       : Ember.computed.alias('service.launchConfig'),
  primaryResource    : Ember.computed.alias('service'),
  existing           : Ember.computed.alias('originalModel'),
  editing            : true,
  loading            : true,
  listenersArray     : null,

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
  },

  init() {
    this._super(...arguments);
    this.set('listenersArray',[]);
    this.set('targetsArray',[]);
    this.set('targetResources',[]);
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
    Ember.run.once(this, 'updateListeners');
  }.observes('listenersArray.@each.{host,protocol,container,isPublic,ssl}'),

  updateListeners: function() {
    var ports = [];
    var expose = [];
    this.get('listenersArray').forEach(function(listener) {
      var hostStr = listener.get('host');
      var hostIp, hostPort;
      var idx = hostStr.indexOf(':');
      if ( idx >= 0 )
      {
        hostIp = hostStr.substr(0,idx);
        hostPort = parseInt(hostStr.substr(idx+1),10);
      }
      else
      {
        hostIp = null;
        hostPort = parseInt(hostStr,10);
      }

      var container = parseInt(listener.get('container'),10);
      var proto = listener.get('protocol');

      // You almost definitely probably want 443->80.
      if ( hostPort === 443 && !container && listener.get('ssl'))
      {
        container = 80;
        listener.set('container', 80);
      }

      if ( hostPort && proto )
      {
        var str = (hostIp ? hostIp + ':' : '') + hostPort +':'+ (container ? + container : hostPort) + (proto === 'http' ? '': '/' + proto );
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
  },

  hasAdvancedSourcePorts: function() {
    return this.get('targetsArray').filterBy('isService',true).filter((target) => {
      return parseInt(target.get('srcPort'),10) > 0;
    }).get('length') > 0;
  }.property('targetsArray.@each.{isService,srcPort}'),

  hasMultipleTargets: function() {
    return this.get('targetsArray').filterBy('value').get('length') >= 2;
  }.property('targetsArray.@each.value'),

  showAdvancedMatchingWarning: Ember.computed.and('hasAdvancedSourcePorts','hasMultipleListeners','hasMultipleTargets'),
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
