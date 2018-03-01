import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default Controller.extend({
  sortBy: 'Name',
  router: service(),
  linkToDeploy: function(){
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let clusterId = projectModel.project.clusterId;
    let route = this.get('router').urlFor('authenticated.cluster.pipeline', clusterId);
    // return htmlSafe(`Pipeline is not enabled, click <a href="${route}" target="_blank">here</a> to enable Pipline`)
    return route
  }.property(),
});
