import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  model: function(params) {
    var globalStore = this.get('globalStore');
    var pipeline = globalStore.find('pipeline',params.pipeline_id);
    return pipeline.then(pipelineObj => {
      return pipelineObj.followLink('config');
    });
  }
});