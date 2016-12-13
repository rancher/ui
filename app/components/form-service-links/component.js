import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  service           : null,
  withAlias         : true,
  allServices       : null,
  serviceLinksArray : null,

  tagName: '',

  init() {
    this._super(...arguments);

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
    this.serviceLinksArrayDidChange();
  },

  serviceLinksArrayDidChange: function() {
    this.sendAction('changed', this.get('serviceLinksArray'));
  }.observes('serviceLinksArray.@each.{name,serviceId}'),

  actions: {
    addServiceLink: function() {
      this.get('serviceLinksArray').pushObject(Ember.Object.create({name: '', serviceId: null}));
    },
    removeServiceLink: function(obj) {
      this.get('serviceLinksArray').removeObject(obj);
    },
  },

  serviceChoices: function() {
    return this.get('allServices').sortBy('group','name','id');
  }.property('allServices.@each.{id,name,state,stackId}'),

  lbSafeServiceChoices: function() {
    return this.get('allServices').filterBy('lbSafe',true).sortBy('group','name','id');
  }.property('allServices.@each.{id,name,state,stackId}'),
});
