import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    return hash({
      run:        params.run_id,
      pipeline:   get(this, 'store').find('pipeline', params.pipeline_id),
      executions: get(this, 'store').findAll('pipelineExecution'),
    });
  }
});
