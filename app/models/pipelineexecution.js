import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'shared/utils/pipeline-constants';
import { reference } from 'ember-api-store/utils/denormalize';

let PipelineExecution = Resource.extend({
  router:   service(),
  type:     'pipelineexecution',
  pipeline: reference('pipelineId', 'pipeline'),

  relevantState:    alias('executionState'),
  availableActions: computed('actionLinks.{rerun,stop}', function() {
    const a = this.actionLinks || {};

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
    const commit = this.commit

    if (commit) {
      return commit.substr(0, 8)
    }

    return '';
  }),

  startedTimeStamp: computed('started', function(){
    const time = this.started;

    return new Date(time);
  }),

  showTransitioning: computed('showTransitioningMessage', 'executionState', function() {
    return this.showTransitioningMessage && this.executionState !== C.STATES.ABORTED && this.executionState !== C.STATES.FAILED;
  }),

  displayRepositoryUrl: computed('repositoryUrl', function() {
    let url = this.repositoryUrl;

    if ( url.endsWith('.git') ) {
      url = url.substr(0, url.length - 4);
    }

    return url;
  }),

  commitUrl: computed('commit', 'displayRepositoryUrl', 'pipeline.displayName', 'pipeline.sourceCodeCredential.sourceCodeType', function() {
    let url = this.displayRepositoryUrl;
    const sourceCodeType = get(this, 'pipeline.sourceCodeCredential.sourceCodeType');
    const name = get(this, 'pipeline.displayName');

    switch ( sourceCodeType ) {
    case 'bitbucketserver':
      if ( name.startsWith('~') ) {
        return `${ this.bitbucketRootUrl('users') }/commits/${ this.commit }`;
      } else {
        return `${ this.bitbucketRootUrl('projects') }/commits/${ this.commit }`;
      }
    case 'bitbucketcloud':
      return `${ url }/commits/${ this.commit }`;
    default:
      return `${ url }/commit/${ this.commit }`;
    }
  }),

  branchUrl: computed('branch', 'displayRepositoryUrl', 'pipeline.displayName', 'pipeline.sourceCodeCredential.sourceCodeType', function() {
    let url = this.displayRepositoryUrl;
    const sourceCodeType = get(this, 'pipeline.sourceCodeCredential.sourceCodeType');
    const name = get(this, 'pipeline.displayName');

    switch ( sourceCodeType ) {
    case 'bitbucketserver':
      if ( name.startsWith('~') ) {
        return `${ this.bitbucketRootUrl('users') }/browse?at=refs%2Fheads%2F${ this.branch }`;
      } else {
        return `${ this.bitbucketRootUrl('projects') }/browse?at=refs%2Fheads%2F${ this.branch }`;
      }
    case 'bitbucketcloud':
      return `${ url }/src/${ this.branch }`;
    default:
      return `${ url }/tree/${ this.branch }`;
    }
  }),

  duration: computed('started', 'ended', function(){
    const started = this.started;
    const ended = this.ended;

    if ( ended ) {
      const duration = new Date(ended).getTime() - new Date(started).getTime();

      return duration < 0 ? null : duration;
    }

    return null;
  }),

  bitbucketRootUrl(repoType) {
    let url = this.displayRepositoryUrl;

    url = url.substr(0, get(url, 'length') - get(this, 'pipeline.displayName.length') - 5);

    return `${ url }/${ repoType }/${ get(this, 'pipeline.projectName') }/repos/${ get(this, 'pipeline.repoName') }`;
  },

  actions: {
    rerun() {
      return this.doAction('rerun').then(() => {
        const pipelineId = get(this, 'pipeline.id');
        const nextRun = get(this, 'pipeline.nextRun');

        this.router.transitionTo('authenticated.project.pipeline.pipelines.run', pipelineId, nextRun);
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
