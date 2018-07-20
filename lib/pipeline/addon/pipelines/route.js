import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { set, get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  session:     service(),
  pipeline:    service(),

  model() {
    var globalStore = get(this, 'globalStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let projectId = projectModel.project.id;
    var model = globalStore.findAll('pipeline', { filter: { projectId } });

    return get(this, 'pipeline').isReady(projectModel.project.clusterId).then((deployed) => {
      if (!deployed){
        return { deployed, }
      }

      return model.then((pipelines) => {
        return {
          deployed,
          pipelines
        }
      })
    })
  },
  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'authenticated.project.pipeline.pipelines');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
