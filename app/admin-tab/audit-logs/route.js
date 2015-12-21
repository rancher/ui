import Ember from 'ember';


export default Ember.Route.extend({
  queryParams: {
    sortBy: {
      refreshModel: true
    },
    sortOrder: {
      refreshModel: true
    },
    limit: {
      refreshModel: true
    },
  },

  runLaterId: null,
  userHasPaged: null,

  actions: {
    filterLogs: function() {
      Ember.run.cancel(this.get('runLaterId'));
      this.set('runLaterId', null);

      this.refresh();
    },
    logsSorted: function() {
      Ember.run.cancel(this.get('runLaterId'));
      this.set('runLaterId', null);
    },
    next: function() {

      Ember.run.cancel(this.get('runLaterId'));

      this.set('userHasPaged', true);
      this.set('runLaterId', null);

      this.controller.model.auditLog.followPagination('next').then((response) => {

        this.controller.set('model.auditLog', response);
      });
    },
    first: function() {

      this.set('userHasPaged', false);
      this.refresh();
      this.scheduleLogUpdate();
    }
  },

  deactivate: function() {

    Ember.run.cancel(this.get('runLaterId'));

    this.set('userHasPaged', false);
    this.set('runLaterId', null);
    this.set('runLaterId', null);
  },

  model: function(params) {
    var filters;

    if (this.controller) {

      filters = this.controller.get('filters');
    }

    return this.store.find('auditLog', null, this.parseFilters(params, filters)).then((response) => {

      var resourceTypes = this.get('store').all('schema').filterBy('links.collection').map((x) => { return x.get('_id'); });

      return Ember.Object.create({
        auditLog: response,
        resourceTypes: resourceTypes
      });
    });
  },

  setupController: function(controller, model) {

    this._super(controller, model);
    this.scheduleLogUpdate();

  },

  scheduleLogUpdate: function() {
    const intervalCount = 2000;

    this.set('runLaterId',
      Ember.run.later(() => {
        var params = this.paramsFor('admin-tab.audit-logs');
        var filters = this.controller.get('filters');


        this.store.find('auditLog', null, this.parseFilters(params, filters)).then((response) => {

          // We can get into a state where the user paged but we have an unresolved promise from the previous
          // run. If thats the case we dont want to replace the page with this unresolved promise.
          if (!this.get('userHasPaged')) {

            this.controller.set('model.auditLog', response);
            this.scheduleLogUpdate();
          }
        }, (/* error */) => {});

      }, intervalCount));
  },

  parseFilters: function(params, filters) {
    var paramsOut = params;
    paramsOut.include = 'account';

    if (filters) {
      Object.keys(filters).forEach((key) => {
        /* do we have a non-null filter?*/
        if (filters[key]) {

          /*does the filter exist in the current params - if so add new filters to it*/
          if (params.filter) {
            paramsOut.filter[key] = filters[key];
          } else {
            /*it doesnt so create it*/
            paramsOut.filter = {};
            paramsOut.filter[key] = filters[key];
          }
        }
        else {
          /*did we remove the filter by hand?*/
          if (!filters[key] && (paramsOut.filter && paramsOut.filter[key])) {
            /*delete it*/
            delete paramsOut.filter[key];
          }
        }
      });
    }
    return paramsOut;
  },

});
