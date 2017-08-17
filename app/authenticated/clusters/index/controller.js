import Ember from 'ember';

export default Ember.Controller.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  application: Ember.inject.controller(),

  byCluster: function() {
    let none = [];
    let clusters = [];

    this.get('model.clusters').forEach((cluster) => {
      clusters.push({
        id: cluster.get('id'),
        cluster: cluster,
        projects: [],
      });
    });

    this.get('model.projects').forEach((project) => {
      let cluster = project.get('cluster');
      if ( cluster ) {
        let clusterId = cluster.get('id');
        let entry = clusters.findBy('id', clusterId);
        if ( !entry ) {
          entry = {
            id: clusterId,
            cluster: cluster,
            projects: [],
          };
          clusters.push(entry);
        }

        entry.projects.push(project);
      } else {
        none.push(project);
      }
    });



    return {
      none,
      clusters
    };
  }.property('model.project.@each.clusterId','model.clusters.[]'),

  sortBy:   'name',
  headers:  [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
      translationKey: 'generic.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'generic.name',
    },
    {
      name:           'description',
      sort:           ['description','name','id'],
      translationKey: 'generic.description',
    },
    {
      name:           'default',
      sort:           false,
      translationKey: 'generic.default',
      width:          80,
    },
  ],
});
