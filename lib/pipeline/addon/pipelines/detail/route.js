import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    return hash({
      pipeline:   store.find('pipeline', params.pipeline_id),
      executions: store.findAll('pipelineExecution'),
    });
  }
});
