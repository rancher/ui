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
        name: 'id',
        translationKey: 'generic.id',
        sort: ['id:desc'],
        width: '75px',
      },
      {
        name: 'processName',
        translationKey: 'generic.name',
        sort: ['processName','id:desc'],
      },
      {
        translationKey: 'processesPage.list.table.resource',
        name: 'resource',
        sort: ['resourceType','id:desc'],
        searchField: ['typeAndId', 'resourceType','resourceId'],
      }
    ];

    if ( which === 'delayed' || which === 'completed' ) {
      out.push({
        translationKey: 'processesPage.list.table.exitReason',
        name: 'exitReason',
        sort: ['exitReason','id:desc'],
        width: '150px',
      });
    }

    out.push({
      translationKey: 'processesPage.list.table.startTime',
      name: 'startTime',
      sort: ['startTime:desc','id:desc'],
      width: '120px',
      searchField: false,
    });

    if ( which === 'completed' ) {
      out.push({
        translationKey: 'processesPage.list.table.endTime',
        name: 'endTime',
        sort: ['endTime:desc','id:desc'],
        width: '120px',
        searchField: false,
      });
    }

    if ( which === 'delayed' ) {
      out.push({
        translationKey: 'processesPage.list.table.runAfter',
        name: 'runAfter',
        sort: ['runAfter:desc','id:desc'],
        width: '120px',
        searchField: false,
      });
    } else {
      out.push({
        translationKey: 'processesPage.list.table.runTime',
        name: 'runTime',
        sort: ['runTime:desc','id:desc'],
        width: '100px',
        searchField: false,
      });
    }

    out.push({
      isActions: true,
      width: '40px',
    });

    return out;
  }.property('which'),
});
