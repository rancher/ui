import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Route.extend({
  globalStore: service(),
  projectStore: service('store'),

  queryParams: {
    mode: {
      refreshModel: true
    },
  },
  model: function(params) {
    let globalStore = this.get('globalStore');
    let projectStore = this.get('projectStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let clusterId = projectModel.project.clusterId;
    let pipeline = globalStore.find('pipeline',params.pipeline_id);
    let pipelineHistory = null;
    if(params.mode === 'review'){
      pipelineHistory = globalStore.find('pipelineExecution', null, {forceReload: true});
    }
    let accounts = globalStore.find('sourceCodeCredential');
    let clusterPipeline = globalStore.find('clusterPipeline', `${clusterId}:${clusterId}`);
    let projectDockerCredentials = projectStore.all('dockerCredential');
    let repositories = globalStore.find('sourceCodeRepository');
    return Ember.RSVP.hash({
        pipeline,
        pipelineHistory,
        accounts,
        clusterPipeline, 
        projectDockerCredentials,
        repositories
      }).then(({
        pipeline,
        pipelineHistory,
        accounts,
        clusterPipeline, 
        projectDockerCredentials,
        repositories
      })=>{
        var piplineObj;
        if(params.mode === 'duplicate'){
          let originPipeline = pipeline.serialize();
          piplineObj = globalStore.createRecord(Object.assign({},originPipeline,{
            id: '',
            displayName: '',
            name: ''
          },{
            type: 'pipeline'
          }))
        }else if(params.mode === 'review'){
          piplineObj = pipeline;
        }else{
          piplineObj = globalStore.createRecord(
            pipeline.serialize()
          );
        }
        return {
          pipeline: piplineObj,
          pipelineHistory,
          accounts,
          clusterPipeline, 
          projectDockerCredentials,
          repositories
        }
      });
  }
});
