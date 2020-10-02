import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';

export default Component.extend({
  pipeline:   alias('model.pipeline'),
  executions: computed('model.executions.[]', 'pipeline.id', function() {
    return get(this, 'model.executions').filterBy('pipelineId', get(this, 'pipeline.id'));
  }),

});
