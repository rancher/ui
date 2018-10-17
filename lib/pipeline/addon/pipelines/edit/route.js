import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { set, get } from '@ember/object';

let precanStages = () => [{
  name:  'clone',
  steps: []
}];

export default Route.extend({
  projectStore: service('store'),
  precanStages: precanStages(),

  model(params) {
    var store = get(this, 'store');
    var projectStore = get(this, 'projectStore');

    let projectDockerCredentials = projectStore.all('dockerCredential');
    let pipelines = store.findAll('pipeline');

    return hash({
      projectDockerCredentials,
      pipelines,
    }).then((hash) => {
      const { projectDockerCredentials, pipelines } = hash;
      let pipeline = pipelines.findBy('id', params.pipeline_id);

      if ( !get(pipeline, 'sourceCodeCredentialId') ){
        return {
          pipelineConfig: {
            selectedSource: 'github',
            name:           pipeline.name,
            url:            pipeline.repositoryUrl,
          },
          pipeline,
          accounts: [],
          projectDockerCredentials,
        };
      } else {
        return {
          pipelineConfig: {
            selectedSource: get(pipeline, 'sourceCodeCredential.sourceCodeType'),
            name:           pipeline.name,
            url:            pipeline.repositoryUrl,
            trigger:        {
              triggerWebhookPr:      pipeline.triggerWebhookPr,
              triggerWebhookPush:    pipeline.triggerWebhookPush,
              triggerWebhookTag:     pipeline.triggerWebhookTag,
              triggerCronExpression: pipeline.triggerCronExpression,
              triggerCronTimezone:   pipeline.triggerCronTimezone,
            }
          },
          pipeline,
          accounts: [get(pipeline, 'sourceCodeCredential')],
          projectDockerCredentials,
        }
      }
    })
  },
  resetController(controller){
    controller.set('errors', '');
    controller.set('saved', false);
    set(this, 'precanStages', precanStages())
  },
});
