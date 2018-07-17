import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Controller.extend({
  router:       service(),
  sortBy:       'Name',
  linkToDeploy: function(){
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let clusterId = projectModel.project.clusterId;
    let route = get(this, 'router').urlFor('authenticated.cluster.pipeline', clusterId);

    return route
  }.property(),
});
