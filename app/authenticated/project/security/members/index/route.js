import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),

  model() {
    const pid = this.paramsFor('authenticated.project');
    const pm = this.modelFor('authenticated.project');

    this.controllerFor('authenticated.project.security.members.index').set('projectId', pid.project_id);

    // TODO 2.0 bug here with projectId on a PRTB where API mungs it up be removing the cluster id on the projectid
    return get(pm, 'project');
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.security.members.index');
  }),
});
