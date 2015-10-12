import Ember from 'ember';

export default Ember.Mixin.create({
  primaryResource: Ember.computed.alias('model.service'),
  labelResource: Ember.computed.alias('model.service.launchConfig'),

  actions: {
    addServiceLink: function() {
      this.get('serviceLinksArray').pushObject(Ember.Object.create({name: '', serviceId: null}));
    },
    removeServiceLink: function(obj) {
      this.get('serviceLinksArray').removeObject(obj);
    },

    setScale: function(scale) {
      this.set('model.service.scale', scale);
    },
  },

  initFields: function() {
    this._super();
    this.initServiceLinks();
  },

  // ----------------------------------
  // Services
  // ----------------------------------
  serviceChoices: function() {
    return this.get('model.allServices').sortBy('group','name','id');
  }.property('model.allServices.@each.{id,name,state,environmentId}'),

  lbSafeServiceChoices: function() {
    return this.get('model.allServices').filterBy('lbSafe',true).sortBy('group','name','id');
  }.property('model.allServices.@each.{id,name,state,environmentId}'),

  serviceLinksArray: null,
  initServiceLinks: function() {
    var out = [];
    var links;
    if ( this.get('service.id') )
    {
      // Edit
      links = this.get('service.consumedServicesWithNames')||[];
    }
    else
    {
      // New / Clone
      links = this.get('service.serviceLinks')||[];
    }

    links.forEach(function(obj) {
      var name = obj.get('name');
      var service = obj.get('service');

      out.push(Ember.Object.create({
        name: (name === service.get('name') ? '' : name),
        obj: service,
        serviceId: service.get('id'),
      }));
    });

    this.set('serviceLinksArray', out);
  },

  serviceLinksDidChange: function() {
  }.observes('serviceLinksArray.@each.{name,serviceId}'),

  // ----------------------------------
  // Save
  // ----------------------------------
  didSave: function() {
    var service = this.get('model.service');
    var ary = [];
    this.get('serviceLinksArray').forEach((row) => {
      if ( row.serviceId )
      {
        ary.push({name: row.name, serviceId: row.serviceId});
      }
    });

    return service.doAction('setservicelinks', {serviceLinks: ary});
  },
});
