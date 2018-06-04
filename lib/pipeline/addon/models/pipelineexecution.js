import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { reference } from 'ember-api-store/utils/denormalize';

let PipelineExecution = Resource.extend({
  pipeline: reference('pipelineId', 'pipeline'),

  relevantState:    alias('executionState'),
  availableActions: computed('actionLinks.{rerun,stop}', function() {

    const a = get(this, 'actionLinks');

    return [
      {
        label:    'action.rerun',
        icon:     'icon icon-refresh',
        action:   'rerun',
        enabled:  !!a.rerun,
        bulkable: true
      },
      {
        label:    'action.stop',
        icon:     'icon icon-stop',
        action:   'stop',
        enabled:  !!a.stop,
        bulkable: true
      },
      { divider: true },
    ];

  }),

  amount: computed('pipelineConfig.stages.[]', function(){

    const activity_stages = get(this, 'pipelineConfig.stages');
    let countStage = 0;
    let countStep = 0;

    for (let i = 0; i < activity_stages.length; i++) {

      const stage = activity_stages[i];

      countStage++;
      for (let j = 0; j < stage.steps.length; j++) {

        stage.steps[j];
        countStep++;

      }

    }

    return {
      countStage,
      countStep
    };

  }),

  shortCommit: computed('commit', function() {

    const commit = get(this, 'commit')

    if (commit) {

      return commit.substr(0, 8)

    }

    return '';

  }),

  startedTimeStamp: computed('started', function(){

    const time = get(this, 'started');

    return new Date(time);

  }),

  showTransitioning: computed('showTransitioningMessage', 'executionState', function() {

    return get(this, 'showTransitioningMessage') && get(this, 'executionState') !== 'Aborted' && get(this, 'executionState') !== 'Failed';

  }),

  commitUrl: computed('commit', function() {

    let url = get(this, 'repositoryUrl');

    if ( url.endsWith('.git') ) {

      url = url.substr(0, url.length - 4);

    }

    return `${ url }/commit/${ get(this, 'commit') }`;

  }),

  branchUrl: computed('branch', function() {

    let url = get(this, 'repositoryUrl');

    if ( url.endsWith('.git') ) {

      url = url.substr(0, url.length - 4);

    }

    return `${ url }/tree/${ get(this, 'branch') }`;

  }),

  duration: computed('started', 'ended', function(){

    const started = get(this, 'started');
    const ended = get(this, 'ended');

    if ( ended ) {

      const duration = new Date(ended).getTime() - new Date(started).getTime();

      return duration < 0 ? null : duration;

    }

  }),

  type:    'pipelineexecution',
  router:  service(),
  actions: {
    rerun() {

      return this.doAction('rerun').then(() => {

        const pipelineId = get(this, 'pipeline.id');
        const nextRun = get(this, 'pipeline.nextRun');

        get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines.run', pipelineId, nextRun);

      });

    },

    stop() {

      return this.doAction('stop');

    },
  },

});


PipelineExecution.reopenClass({
  mangleIn(data) {

    if ( data && data.pipeline ) {

      data.pipeline._type = data.pipeline.type;
      delete data.pipeline.type;

    }

    return data;

  },
});

export default PipelineExecution