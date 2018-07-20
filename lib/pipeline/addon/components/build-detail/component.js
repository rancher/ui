import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  get, computed, observer
} from '@ember/object';

export default Component.extend({
  router:  service(),

  build: computed('model.executions.@each.run', 'model.run', function() {

    return get(this, 'model.executions').find((exe) => get(exe, 'pipelineId') === get(this, 'model.pipeline.id') && get(exe, 'run') === parseInt(get(this, 'model.run'), 10));

  }),

  buildStateDidChange: observer('build', function() {

    if ( !get(this, 'build') && get(this, 'router.currentRouteName') === 'authenticated.project.pipeline.pipelines.run' ) {

      get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');

    }

  }),
});
