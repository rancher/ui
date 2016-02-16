import Ember from 'ember';


export default Ember.Route.extend({
  queryParams: {
    sortBy: {
      refreshModel: true
    },
    sortOrder: {
      refreshModel: true
    },
    eventType: {
      refreshModel: true
    },
    resourceType: {
      refreshModel: true
    },
    resourceId: {
      refreshModel: true
    },
    clientIp: {
      refreshModel: true
    },
    authType: {
      refreshModel: true
    }
  },

  runLaterId: null,
  userHasPaged: null,

  actions: {
    filterLogs: function() {
      Ember.run.cancel(this.get('runLaterId'));
      this.set('runLaterId', null);
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
  },

  model: function(params) {

    if (this.get('runLaterId')) {
      Ember.run.cancel(this.get('runLaterId'));
      this.set('runLaterId', null);
    }
    return this.store.find('auditLog', null, this.parseFilters(params)).then((response) => {

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
    const intervalCount = 30000;

    this.set('runLaterId',
      Ember.run.later(() => {
        var params = this.paramsFor('admin-tab.audit-logs');
        //var filters = this.controller.get('filters');


        this.store.find('auditLog', null, this.parseFilters(params)).then((response) => {

          // We can get into a state where the user paged but we have an unresolved promise from the previous
          // run. If thats the case we dont want to replace the page with this unresolved promise.
          if (!this.get('userHasPaged')) {

            this.controller.set('model.auditLog', response);
            this.scheduleLogUpdate();
          }
        }, (/* error */) => {});

      }, intervalCount));
  },

  parseFilters: function(params) {
    var returnValue = {
      filter: {
      },
      limit: 100,
      depaginate: false,
      forceReload: true,
      include: 'account'
    };
    if (params) {
      _.forEach(params, (item, key) => {
        if ( ['sortBy','sortOrder','forceReload'].indexOf(key) >= 0 )  {
          returnValue[key] = item;
        } else {
          if (item) {
            returnValue.filter[key] = item;
          } else {
            delete returnValue.filter[key];
          }
        }
      });
    }
    return returnValue;
  },

});
