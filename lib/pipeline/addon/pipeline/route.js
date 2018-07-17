import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  globalStore:  service(),
  projectStore: service('store'),

  queryParams: { mode: { refreshModel: true }, },
  model(params) {
    let globalStore = get(this, 'globalStore');
    let projectStore = get(this, 'projectStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let clusterId = projectModel.project.clusterId;
    let pipeline = globalStore.find('pipeline', params.pipeline_id);
    let pipelineHistory = null;

    if (params.mode === 'review'){
      pipelineHistory = globalStore.findAll('pipelineExecution');
    }
    let accounts = globalStore.findAll('sourceCodeCredential');
    let clusterPipeline = globalStore.find('clusterPipeline', `${ clusterId }:${ clusterId }`);
    let projectDockerCredentials = projectStore.all('dockerCredential');

    return clusterPipeline.then((cPipeline) => {
      clusterPipeline = cPipeline;

      return clusterPipeline.followLink('envvars')
    }).then((envvars) => {
      return hash({
        pipeline,
        pipelineHistory,
        accounts,
        clusterPipeline,
        projectDockerCredentials,
        envvars
      })
    }).then(({
      pipeline,
      pipelineHistory,
      accounts,
      clusterPipeline,
      projectDockerCredentials,
      envvars
    }) => {
      var piplineObj;

      if (params.mode === 'duplicate'){
        let originPipeline = pipeline.serialize();

        piplineObj = globalStore.createRecord(Object.assign({}, originPipeline, {
          id:          '',
          displayName: '',
          name:        ''
        }, { type: 'pipeline' }))
      } else if (params.mode === 'review'){
        piplineObj = pipeline;
      } else {
        piplineObj = globalStore.createRecord(
          pipeline.serialize()
        );
      }
      if (!accounts.content.length){
        return {
          pipeline:     piplineObj,
          pipelineHistory,
          accounts,
          clusterPipeline,
          projectDockerCredentials,
          envvars,
          repositories: [],
        }
      } else {
        return accounts.content[0]
          .followLink('sourceCodeRepositories')
          .then((res) => {
            return {
              pipeline:     piplineObj,
              pipelineHistory,
              accounts,
              clusterPipeline,
              projectDockerCredentials,
              envvars,
              repositories: res,
            }
          })
      }
    });
  }
});
