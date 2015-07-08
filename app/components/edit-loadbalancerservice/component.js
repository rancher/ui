import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import EditService from 'ui/mixins/edit-service';
import C from 'ui/utils/constants';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Component.extend(NewOrEdit, EditService, {
  editing: true,
  loading: true,

  actions: {
    addServiceLink:        addAction('addServiceLink',  '.service-link'),
    addTargetIp:           addAction('addTargetIp',     '.target-ip'),

    removeTarget: function(tgt) {
      this.get('targetsArray').removeObject(tgt);
    },

    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  loadDependencies: function() {
    var service = this.get('originalModel');

    this.get('store').find('environment', service.get('environmentId')).then((env) => {
      env.importLink('services').then(() => {
        var model = Ember.Object.create({
          service: service.clone(),
          selectedEnvironment: env
        });

        this.setProperties({
          originalModel: service,
          model: model,
          service: model.service,
          environment: model.selectedEnvironment,
        });

        this.initFields();
        this.initTargets();
        this.set('loading', false);
      });
    });
  },

  canScale: function() {
    if ( ['service','loadbalancerservice'].indexOf(this.get('service.type').toLowerCase()) >= 0 )
    {
      return !this.getLabel(C.LABEL.SCHED_GLOBAL);
    }
    else
    {
      return false;
    }
  }.property('service.type'),

  isBalancer: function() {
    return this.get('service.type').toLowerCase() === 'loadbalancerservice';
  }.property('service.type'),

  hasServiceLinks: function() {
    return this.get('service.type').toLowerCase() !== 'externalservice';
  }.property('service.type'),

  hasTargetIp: function() {
    return this.get('service.type').toLowerCase() === 'externalservice';
  }.property('service.type'),

  didSave: function() {
    var balancer = this.get('service');
    // Set balancer targets
    return balancer.waitForNotTransitioning().then(() => {
      return balancer.doAction('setservicelinks', {
        serviceLinks: this.get('targetResources'),
      });
    });
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  },

  // @TODO copy pasta...
  initTargets: function() {
    var existing = this.get('service.consumedServicesWithNames');
    var out = [];
    if ( existing )
    {
      existing.forEach((map) => {
        map.get('ports').forEach((str) => {
          var parts = str.match(/^(\d+):?([^:\/]+)?(\/.*)?$/);
          var port = parts[1] || null;
          var hostname = parts[2] || null;
          var path = parts[3] || null;

          out.push(Ember.Object.create({ 
            isService: true,
            value: map.get('service.id'),
            hostname: hostname,
            port: port,
            path: path
          }));
        });
      });
    }

    this.set('targetsArray', out);
  },

  targetResources: function() {
    var out = [];
    this.get('targetsArray').filterProperty('isService',true).filterProperty('value').filterProperty('port').map((choice) => {
      var serviceId = Ember.get(choice,'value');
      var port = Ember.get(choice,'port');
      var hostname = Ember.get(choice,'hostname');
      var path = Ember.get(choice,'path');

      var entry = out.filterProperty('serviceId', serviceId)[0];
      if ( !entry )
      {
        entry = Ember.Object.create({
          serviceId: serviceId,
          ports: [],
        });
        out.pushObject(entry);
      }

      var str = port + ":" + (hostname ? hostname : '') + (path ? path : '');
      entry.get('ports').pushObject(str);
    });

    return out;
  }.property('targetsArray.@each.{isService,value,hostname,path,port}'),

  targetChoices: function() {
    var list = [];
    var env = this.get('environment');
    var envName = env.get('name') || ('(Environment '+env.get('id')+')');

    env.get('services').map((service) => {
      list.pushObject({
        group: 'Environment: ' + envName,
        id: service.get('id'),
        name: service.get('name') || ('(' + service.get('id') + ')')
      });
    });

    return list.sortBy('group','name','id');
  }.property('environment.services.@each.{name,id},environment.{name,id}').volatile(),
});
