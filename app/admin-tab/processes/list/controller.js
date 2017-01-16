import Ember from 'ember';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),

  queryParams: ['which','sortBy','descending'],
  which: 'running',
  sortBy: 'id',
  descending: false,

  actions: {
    replay(process) {
      if ( process.hasAction('replay') ) {
        process.doAction('replay');
      }
    }
  },

  headers: function() {
    let which = this.get('which');
    let out = [
      {
        displayName: 'ID',
        name: 'id',
        sort: ['id:desc'],
        width: '75px',
      },
      {
        displayName: 'Name',
        name: 'processName',
        sort: ['processName','id:desc'],
      },
      {
        displayName: 'Resource',
        name: 'resource',
        sort: ['typeAndId','id:desc'],
        searchField: ['typeAndId', 'resourceType','resourceId'],
      }
    ];

    if ( which === 'completed' ) {
      out.push({
        displayName: 'Exit Reason',
        name: 'exitReason',
        sort: ['exitReason','id'],
        width: '150px',
      });
    }

    out.push({
      displayName: 'Start Time',
      name: 'startTime',
      sort: ['startTime','id:desc'],
      width: '150px',
      searchField: false,
    });

    if ( which === 'completed' ) {
      out.push({
        displayName: 'End Time',
        name: 'endTime',
        sort: ['endTime:desc','id:desc'],
        width: '150px',
        searchField: false,
      });
    }

    out.push({
      displayName: 'Run Time',
      name: 'runTime',
      sort: ['runTime:desc','id'],
      width: '100px',
      searchField: false,
    });

    if ( which === 'delayed' ) {
      out.push({
        isActions: true,
        width: '50px',
      });
    }

    return out;
  }.property('which'),
});
