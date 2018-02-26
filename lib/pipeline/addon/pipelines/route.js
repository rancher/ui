import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  session: service(),

  model: function() {
    var globalStore = this.get('globalStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let projectId = projectModel.project.id;
    var model = globalStore.find('pipeline', null, { filter: { projectId }});
    return model
  },
  setDefaultRoute: on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'authenticated.project.pipeline.pipelines');
  }),
});
