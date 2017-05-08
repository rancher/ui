import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  settings: Ember.inject.service(),

  // Inputs
  service           : null,
  withAlias         : true,
  serviceLinksArray : null,

  classNames: ['accordion-wrapper'],

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

  actions: {
    addServiceLink: function() {
      this.get('serviceLinksArray').pushObject(Ember.Object.create({name: '', serviceId: null}));
    },
    removeServiceLink: function(obj) {
      this.get('serviceLinksArray').removeObject(obj);
    },
  },

  expand(item) {
    item.toggleProperty('expanded');
  },

  serviceLinksArrayDidChange: function() {
    this.sendAction('changed', this.get('serviceLinksArray'));
  }.observes('serviceLinksArray.@each.{name,serviceId}'),

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('serviceLinksArray').filter((x) => !!x.get('serviceId')).get('length') || 0;

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('serviceLinksArray.@each.serviceId')
});
