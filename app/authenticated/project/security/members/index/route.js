import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    const pid = this.paramsFor('authenticated.project');
    const pm = this.modelFor('authenticated.project');
    this.controllerFor('authenticated.project.security.members.index').set('projectId', pid.project_id);
    // TODO 2.0 bug here with projectId on a PRTB where API mungs it up be removing the cluster id on the projectid
    return get(pm, 'project');
  },

});
