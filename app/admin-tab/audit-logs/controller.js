import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application       : Ember.inject.controller(),
  queryParams       : ['sortBy', 'sortOrder', 'eventType', 'resourceType', 'resourceId', 'clientIp', 'authType'],
  resourceTypeAndId : null,
  modalService:       Ember.inject.service('modal'),

  headers: [
    {
      name: 'created',
      sort: ['created:desc','id'],
      serverSortReversed: true,
      translationKey: 'auditLogsPage.table.time',
      width: 115
    },
    {
      name: 'eventType',
      sort: ['eventType','created:desc','id'],
      translationKey: 'auditLogsPage.table.eventType',
    },
    {
      name: 'accountId',
      translationKey: 'auditLogsPage.table.environment',
      width: 125
    },
    {
      name: 'resourceType',
      translationKey: 'auditLogsPage.table.resourceTypeId',
    },
    {
      name: 'authenticatedAsIdentityId',
      translationKey: 'auditLogsPage.table.identity',
      width: 175
    },
    {
      name: 'authIp',
      translationKey: 'auditLogsPage.table.authIp',
      sort: ['clientIp'],
      searchFields: ['authType','clientIp'],
      width: 150
    },
  ],


  actions: {
    updateResourceType: function(type) {
      this.set('filters.resourceType', type);
    },

    updateAuthType: function(type) {
      this.set('filters.authType', type.name);
      this.set('authTypeReadable', type.value);
    },

    search: function() {
      this.setProperties({
        eventType    : this.get('filters.eventType'),
        resourceType : this.get('filters.resourceType'),
        resourceId   : this.get('filters.resourceId'),
        clientIp     : this.get('filters.clientIp'),
        authType     : this.get('filters.authType'),
      });
    },

    showResponseObjects: function(request, response) {
      this.get('modalService').toggleModal('modal-auditlog-info', {
        requestObject         : request,
        responseObject        : response,
      });
    },

    clearAll: function() {
      this.set('filters', {
        accountId                 : null,
        authType                  : null,
        authenticatedAsAccountId  : null,
        authenticatedAsIdentityId : null,
        created                   : null,
        clientIp                  : null,
        description               : null,
        eventType                 : null,
        id                        : null,
        kind                      : null,
        resourceId                : null,
        resourceType              : null,
        runtime                   : null,
      });

      this.setProperties({
        eventType: null,
        resourceType : null,
        resourceId   : null,
        clientIp     : null,
        authType     : null,
      });

      this.setProperties({
        sortBy    : 'created',
        sortOrder : 'desc',
      });
      this.set('authTypeReadable', null);
    },
  },

  sortBy           : 'created',
  sortOrder        : 'asc',
  descending       : false,
  eventType        : null,
  resourceType     : null,
  resourceId       : null,
  clientIp         : null,
  authType         : null,
  authTypes        : null,
  authTypeReadable : null,
  filters: {
    accountId                 : null,
    authType                  : null,
    authenticatedAsAccountId  : null,
    authenticatedAsIdentityId : null,
    created                   : null,
    description               : null,
    eventType                 : null,
    clientIp                  : null,
    id                        : null,
    kind                      : null,
    resourceId                : null,
    resourceType              : null,
    runtime                   : null,
  },

  setup: function() {
    var out = [];

    Object.keys(C.AUTH_TYPES).forEach((key) => {
      var val = C.AUTH_TYPES[key];
      if ( val !== C.AUTH_TYPES.HeaderAuth && val !== C.AUTH_TYPES.TokenAccount )
      {
        out.push({name: key, value: val});
      }
    });

    this.set('authTypes', out);
    this.updateServerDirection();
  }.on('init'),

  updateServerSort: function() {
    this.set('descending', false);
  }.observes('sortBy'),

  updateServerDirection: function() {
    let out = 'asc';
    let entry = this.get('headers').findBy('name', this.get('sortBy'));
    if ( entry.serverSortReversed ) {
      out = 'desc';
    }

    if (this.get('descending')) {
      out = (out == 'asc' ? 'desc' : 'asc');
    }

    this.set('sortOrder', out);
  }.observes('descending'),

  resourceIdReady: function() {
    if (this.get('filters.resourceType')) {
      return false;
    } else {
      return true;
    }
  }.property('filters.resourceType'),
});
