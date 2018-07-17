import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  model(params) {
    var globalStore = get(this, 'globalStore');
    var pipeline = globalStore.find('pipeline', params.pipeline_id);

    return pipeline.then((pipelineObj) => {
      return pipelineObj.followLink('config');
    });
  }
});