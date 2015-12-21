import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Sortable, {
  application: Ember.inject.controller(),
  queryParams: ['sortBy', 'sortOrder', 'limit', 'forceReload', 'depaginate'],

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
  forceReload: true,
  depaginate: false,
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

  filtersHaveChanged: debouncedObserver('filters.accountId','filters.authType','filters.authenticatedAsAccountId','filters.authenticatedAsIdentityId','filters.created','filters.description','filters.eventType','filters.id','filters.kind','filters.resourceId','filters.resourceType','filters.runtime', function() {
    this.send('filterLogs');
  }, 500),

  setSortOrderObserver: function() {
    var out = 'asc';

    if (this.get('descending')) {
      out = 'desc';
    }

    this.set('sortOrder', out);
    this.send('logsSorted');

  }.observes('descending'),

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
