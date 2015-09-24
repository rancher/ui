import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  needs: ['admin-tab/processes'],
  parentQueryParams: Ember.computed.alias('controllers.admin-tab/processes.queryParams'),
  showRunning: Ember.computed.alias('controllers.admin-tab/processes.showRunning'),
  resourceId: Ember.computed.alias('controllers.admin-tab/processes.resourceId'),
  resourceType: Ember.computed.alias('controllers.admin-tab/processes.resourceType'),
  processName: Ember.computed.alias('controllers.admin-tab/processes.processName'),
  actions: {
    showRunningProcesses: function() {
      this.toggleProperty('showRunning');
    },
    updateQuery: function() {
      var selectVal = Ember.$('#query-select').val();
      var setVal = null;
      if (!_.isEmpty(selectVal)) { // need to check empty here so we can set the param back to null if its an empty string
        setVal = selectVal;
      } else {
        this.set('searchValue', null);
      }
      this.set('selectedSearchParam', setVal);
    },
    submit: function() {
      this.set(this.get('selectedSearchParam'), this.get('searchValue'));
    },
    reset: function() {
      this.setProperties({
        selectedSearchParam: null,
        searchValue: null
      });
      Ember.$('#query-select').val('');
    }
  },
  selectedSearchParam: null,
  searchValue: null,
  sortableContent: Ember.computed.alias('model'),
  sortBy: 'id',
  sorts: {
    id: ['id'],
    processName: ['processName', 'id'],
    resource: ['resourceType', 'resourceId', 'id'],
    startTime: ['startTime', 'id'],
    endTime: ['endTime', 'id'],
    runTime: ['runTime', 'id']
  },
  parseParams: Ember.on('init', function() {
    _.forEach(this.get('parentQueryParams'), (param) => {
      if (param !== 'showRunning') {
        if (this.get(param)) {
          this.set('searchValue', this.get(param));
          this.set('selectedSearchParam', param);

          Ember.run.later(() => {
            Ember.$('#query-select').val(param);
          });
        }
      }
    });
  }),
  resetQuery: function() {
    _.forEach(this.get('parentQueryParams'), (item) => {
      if (item !== 'showRunning') {
        if (!_.isNull(this.get(item)) && item !== this.get('selectedSearchParam')) {
          this.set(item, null);
          this.set('searchValue', null);
        }
      }
    });
  }.observes('selectedSearchParam'),
  disabledInputs: Ember.computed('selectedSearchParam', function() {
    if (this.get('selectedSearchParam')) {
      return false;
    } else {
      return true;
    }
  })
});
