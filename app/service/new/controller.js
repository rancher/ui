import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';

export default Ember.ObjectController.extend(EditContainer, {
  queryParams: ['environmentId'],
  environmentId: null,

  editing: false,
  primaryResource: Ember.computed.alias('model.service'),

  actions: {
    addServiceLink: function() {
      this.get('serviceLinksArray').pushObject(Ember.Object.create({serviceId: null}));
    },
    removeServiceLink: function(obj) {
      this.get('serviceLinksArray').removeObject(obj);
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
    var envNames = {};
    this.get('allEnvironments').forEach((env) => {
      var name = 'Environment:' + (env.get('name') || '('+env.get('id')+')');
      if ( env.get('id') === this.get('environmentId') )
      {
        name += ' (current)';
      }
      envNames[env.get('id')] = name;
    });

    var list = this.get('allServices').map((service) => {
      var serviceLabel = (service.get('name') || '('+service.get('id')+')');
      if ( service.get('state') !== 'active' )
      {
        serviceLabel += ' (' + service.get('state') + ')';
      }

      return {
        group: envNames[ service.get('environmentId') ] || '???',
        id: service.get('id'),
        name: serviceLabel,
      };
    });

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.{id,name,state}'),

  serviceLinksArray: null,
  initServiceLinks: function() {
    var out = [];
    var links = this.get('service.consumedservices')||[];

    links.forEach(function(value) {
      // Objects, from edit
      var id;
      if ( typeof value === 'object' )
      {
        id = value.get('id');
        if ( id )
        {
          out.push(Ember.Object.create({
            existing: true,
            obj: value,
            serviceId: id,
          }));
        }
      }
      else
      {
        out.push(Ember.Object.create({serviceId: value, existing: false}));
      }
    });

    this.set('serviceLinksArray', out);
  },

  // ----------------------------------
  // Save
  // ----------------------------------
  didSave: function() {
    var service = this.get('model.service');
    var ids = this.get('serviceLinksArray').map(function(link) {
      return link.get('serviceId');
    }).uniq();

    var promises = [];
    ids.forEach((id) => {
      promises.push(service.doAction('addservicelink',{serviceId: id}));
    });

    return Ember.RSVP.all(promises);
  },
});
