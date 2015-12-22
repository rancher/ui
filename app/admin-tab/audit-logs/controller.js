import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  application: Ember.inject.controller(),
  queryParams: ['sortBy', 'sortOrder', 'eventType', 'resourceType', 'resourceId', 'clientIp', 'authType'],

  sortableContent: Ember.computed.alias('model.auditLog'),
  resourceTypeAndId: null,

  actions: {
    updateResourceType: function(type) {
      this.set('filters.resourceType', type);
    },
    updateAuthType: function(type) {
      this.set('filters.authType', type.name);
      this.set('authTypeReadable', type.value);
    },
    changeSort: function(name) {
      this._super(name);
    },
    search: function() {
      this.setProperties({
        eventType: this.get('filters.eventType'),
        resourceType: this.get('filters.resourceType'),
        resourceId: this.get('filters.resourceId'),
        clientIp: this.get('filters.clientIp'),
        authType: this.get('filters.authType'),
      });
      this.send('filterLogs');
    },
    showResponseObjects: function(request, response) {
      this.get('application').setProperties({
        showAuditLogResponses: true,
        requestObject: request,
        responseObject: response,
      });
    },
    clearAll: function() {
      this.set('filters', {
        accountId: null,
        authType: null,
        authenticatedAsAccountId: null,
        authenticatedAsIdentityId: null,
        created: null,
        clientIp: null,
        description: null,
        eventType: null,
        id: null,
        kind: null,
        resourceId: null,
        resourceType: null,
        runtime: null,
      });
      this.setProperties({
        eventType: null,
        resourceType: null,
        resourceId: null,
        clientIp: null,
        authType: null,
      });
      this.setProperties({
        sortBy: 'created',
        sortOrder: 'desc',
      });
      this.set('authTypeReadable', null);
      this.send('filterLogs');
    },
  },

  sortBy: 'created',
  sortOrder: 'desc',
  descending: true,
  limit: 100,
  eventType: null,
  resourceType: null,
  resourceId: null,
  clientIp: null,
  authType: null,
  authTypes: null,
  authTypeReadable: null,
  filters: {
    accountId: null,
    authType: null,
    authenticatedAsAccountId: null,
    authenticatedAsIdentityId: null,
    created: null,
    description: null,
    eventType: null,
    clientIp: null,
    id: null,
    kind: null,
    resourceId: null,
    resourceType: null,
    runtime: null,
  },

  setup: function() {
    // @@TODO@@ - This is only here becuase i have to use the auth type map in an handlebars each
    // once we upgrade to 2.10.0 we can use the @key handlebar helper
    var authOut = [];

    for (var i in C.AUTH_TYPES) {
      authOut.push({name: i, value: C.AUTH_TYPES[i]});
    }

    this.set('authTypes', authOut);

  }.on('init'),

  setSortOrderObserver: function() {
    var out = 'asc';

    if (this.get('descending')) {
      out = 'desc';
    }

    this.set('sortOrder', out);
    this.send('logsSorted');

  }.observes('descending'),

  resourceIdReady: function() {
    if (this.get('filters.resourceType')) {
      return false;
    } else {
      return true;
    }
  }.property('filters.resourceType'),

  showPagination: function() {
    var pagination = this.get('model.auditLog.pagination');

    if (pagination.next) {
      return true;
    } else {
      return false;
    }
  }.property('model.auditLog.pagination'),

  // implemented here cause we're using sortable kinda but not really. Basically want the
  // actions but not the implmentation
  arranged: function() {}

});
