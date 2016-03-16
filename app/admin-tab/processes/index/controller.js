import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  processesController : Ember.inject.controller('admin-tab.processes'),
  parentQueryParams   : Ember.computed.alias('processesController.queryParams'),
  showRunning         : Ember.computed.alias('processesController.showRunning'),
  resourceId          : Ember.computed.alias('processesController.resourceId'),
  resourceType        : Ember.computed.alias('processesController.resourceType'),
  processName         : Ember.computed.alias('processesController.processName'),
  // these are here so we can execute the search with the search button
  // so we dont have to do this.refresh in the route. I used this.refresh
  // in the route for something else and it caused other issues so i decided
  // against using it.
  ownResourceId        : null,
  ownResourceType      : null,
  ownProcessName       : null,
  resourceTypeReadable : null,

  sortableContent : Ember.computed.alias('model.processInstance'),
  sortBy          : 'startTime',
  descending      : true,

  sorts: {
    id          : ['id'],
    processName : ['processName', 'id'],
    resource    : ['resourceType', 'resourceId', 'id'],
    startTime   : ['startTime', 'id'],
    endTime     : ['endTime', 'id'],
    runTime     : ['runTime', 'id']
  },

  actions: {
    showRunningProcesses: function() {
      this.toggleProperty('showRunning');
    },
    updateType: function(type) {
      this.set('resourceTypeReadable', type);
      this.set('ownResourceType', type);
    },
    submit: function() {
      this.setProperties({
        resourceId   : this.get('ownResourceId'),
        resourceType : this.get('ownResourceType'),
        processName  : this.get('ownProcessName')
      });
    },
    reset: function() {
      this.setProperties({
        resourceId           : null,
        ownResourceId        : null,
        resourceType         : null,
        resourceTypeReadable : null,
        ownResourceType      : null,
        processName          : null,
        ownProcessName       : null
      });
      Ember.$('#resource-type').val('');
    },
  },

  parseParams: Ember.on('init', function() {
    // This parses the parent query strings since the input values are not bound
    // directly to the querystrings. See this.refresh comment at top of file for
    // more information.
    _.forEach(this.get('parentQueryParams'), (param) => {

      let paramVal = this.get(param);

      if (param !== 'showRunning') {

        if (paramVal) {

          switch (param) {
            case 'resourceId':
              this.set('ownResourceId', paramVal);
              break;
            case 'resourceType':
              this.set('ownResourceType', paramVal);

              Ember.run.later(() => {

                Ember.$('#resource-type').val(_.find(this.get('model.resourceTypes'), (item) =>{
                  return item === this.get(param);
                }));

              });
              break;
            case 'processName':
              this.set('ownProcessName', paramVal);
              break;
            default:
              break;
          }

        }
      }
    });
  }),

  disableId: Ember.computed('ownResourceType', function() {
    if (this.get('ownResourceType')) {
      return false;
    } else {
      return true;
    }
  }),
});
