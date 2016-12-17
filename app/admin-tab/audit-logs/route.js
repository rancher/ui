import Ember from 'ember';

const INTERVALCOUNT = 15000;

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

  timer   : null,
  userHasPaged : null,

  actions: {
    filterLogs() {
      this.cancelLogUpdate();
    },

    logsSorted() {
      this.cancelLogUpdate();
    },

    next() {
      this.cancelLogUpdate();
      this.set('userHasPaged', true);

      this.controller.model.auditLog.followPagination('next').then((response) => {
        this.controller.set('model.auditLog', response);
      });
    },

    first() {
      this.set('userHasPaged', false);
      this.refresh();
      this.scheduleLogUpdate();
    }
  },

  deactivate() {
    this.cancelLogUpdate();
    this.set('userHasPaged', false);
  },

  model(params) {
    this.cancelLogUpdate();

    return this.get('userStore').find('auditLog', null, this.parseFilters(params)).then((response) => {
      var resourceTypes = this.get('userStore').all('schema').filterBy('links.collection').map((x) => { return x.get('_id'); });

      return Ember.Object.create({
        auditLog: response,
        resourceTypes: resourceTypes
      });
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    this.scheduleLogUpdate();
  },

  scheduleLogUpdate() {
    Ember.run.cancel(this.get('timer'));

    this.set('timer', Ember.run.later(() => {
      var params = this.paramsFor('admin-tab.audit-logs');

      this.get('userStore').find('auditLog', null, this.parseFilters(params)).then((response) => {
        // We can get into a state where the user paged but we have an unresolved promise from the previous
        // run. If thats the case we dont want to replace the page with this unresolved promise.
        if (!this.get('userHasPaged')) {

          this.controller.set('model.auditLog', response);
          if ( this.get('timer') ) {
            this.scheduleLogUpdate();
          }
        }
      }, (/* error */) => {});
    }, INTERVALCOUNT));
  },

  cancelLogUpdate() {
    Ember.run.cancel(this.get('timer'));
    this.set('timer', null);
  },

  parseFilters(params) {
    var returnValue = {
      filter      : {},
      limit       : 100,
      depaginate  : false,
      forceReload : true,
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
