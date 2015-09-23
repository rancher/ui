import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import EditService from 'ui/mixins/edit-service';

export default Ember.ObjectController.extend(Cattle.LegacyNewOrEditMixin, EditService, {
  queryParams: ['environmentId','serviceId'],
  environmentId: null,
  serviceId: null,
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.dns'),

  actions: {
    addTargetService: function() {
      this.get('targetsArray').pushObject({isService: true, value: null});
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },
  },

  initFields: function() {
    this._super();
    this.initTargets();
  },

  initHosts: function() {
  },
  hostDisabled: Ember.computed.equal('hostChoices.length',0),
  hostChoices: function() {
    return this.get('allHosts').filter((host) => {
      return host.get('state') === 'active';
    }).sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  targetsArray: null,
  initTargets: function() {
    var existing = this.get('dns.serviceLinks');
    var out = [];
    if ( existing )
    {
      existing.forEach((map) => {
        out.push({ isService: true, value: Ember.get(map,'service.id') });
      });
    }
    else
    {
      out.push({isService: true, value: null});
    }

    this.set('targetsArray', out);
  },

  targetServiceIds: function() {
    return this.get('targetsArray').filterBy('isService',true).filterBy('value').map((choice) => {
      return Ember.get(choice,'value');
    }).uniq();
  }.property('targetsArray.@each.{isService,value}'),

  targetResources: function() {
    return this.get('targetsArray').filterBy('isService',true).filterBy('value').map((choice) => {
      return {
        serviceId: Ember.get(choice,'value'),
      };
    });
  }.property('targetsArray.@each.{isService,value}'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('targetServiceIds.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },


  didSave: function() {
    var dns = this.get('model.dns');
    // Set targets
    return dns.waitForNotTransitioning().then(() => {
      return dns.doAction('setservicelinks', {
        serviceLinks: this.get('targetResources'),
      });
    });
  },

  doneSaving: function() {
    this.transitionToRoute('environment', this.get('primaryResource.environmentId'));
  },
});
