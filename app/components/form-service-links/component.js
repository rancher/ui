import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  service           : null,
  withAlias         : true,
  serviceLinksArray : null,
  hasRegion         : null,

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
        customMode: service.get('arbitraryString'),
        serviceId: service.get('arbitraryString') ? null : service.get('id'),
        service: service.get('arbitraryString') ? service.get('id') : null,
      }));
    });

    this.set('serviceLinksArray', out);
    this.serviceLinksArrayDidChange();

    const regions = this.get('userStore').all('region');
    this.set('hasRegion', regions.get('length') > 0);
  },

  serviceLinksArrayDidChange: function() {
    this.sendAction('changed', this.get('serviceLinksArray'));
  }.observes('serviceLinksArray.@each.{name,serviceId,customMode,service}'),

  actions: {
    addServiceLink: function() {
      this.get('serviceLinksArray').pushObject(Ember.Object.create({name: '', serviceId: null}));
    },
    removeServiceLink: function(obj) {
      this.get('serviceLinksArray').removeObject(obj);
    },
  },
});
