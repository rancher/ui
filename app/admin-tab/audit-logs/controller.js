import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Controller.extend(Sortable, {
  application: Ember.inject.controller(),
  queryParams: ['sortBy', 'sortOrder', 'limit', 'forceReload', 'depaginate'],

  sortableContent: Ember.computed.alias('model.auditLog'),
  resourceTypeAndId: null,

  actions: {
    updateResourceType: function(type) {
      this.set('filters.resourceType', type);
    },
    changeSort: function(name) {
      this._super(name);
    },
    toggleFilter: function() {
      this.toggleProperty('showFilter');
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
      this.set('filters.resourceType', null);
      this.send('filterLogs');
    },
  },

  showFilter: false,
  sortBy: 'created',
  sortOrder: 'desc',
  descending: true,
  limit: 100,
  forceReload: true,
  depaginate: false,
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

  filtersHaveChanged: debouncedObserver('filters.accountId','filters.authType','filters.authenticatedAsAccountId','filters.authenticatedAsIdentityId','filters.created','filters.description','filters.eventType','filters.id','filters.kind','filters.resourceId','filters.resourceType','filters.runtime', function() {
    this.send('filterLogs');
  }, 500),

  setSortOrderObserver: function() {
    var out = 'asc';

    if (this.get('descending')) {
      out = 'desc';
    }

    this.set('sortOrder', out);

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
