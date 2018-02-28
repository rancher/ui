import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

let precanStages = ()=> [{
      name: 'clone',
      steps: []
    },{
      name: 'build',
      steps: []
    },{
      name: 'publish',
      steps: [{
        type:"build",
        "publishImageConfig": {
            "dockerfilePath": "./Dockerfile",
            "buildContext": ".",
            "tag": "pipeline/build:dev"
          }
      }]
    }];
export default Route.extend({
  globalStore: service(),
  projectStore: service('store'),

  precanStages: precanStages(),
  model: function() {
    var globalStore = this.get('globalStore');
    var projectStore = this.get('projectStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let projectId = projectModel.project.id;
    let clusterId = projectModel.project.clusterId;
    let accounts = globalStore.find('sourceCodeCredential');
    let clusterPipeline = globalStore.find('clusterPipeline', `${clusterId}:${clusterId}`, {forceReload: true});
    let projectDockerCredentials = projectStore.all('dockerCredential');
    let repositories = globalStore.find('SourceCodeRepository');
    return hash({accounts, clusterPipeline, projectDockerCredentials,repositories} ).then(({accounts, clusterPipeline, projectDockerCredentials,repositories})=>{
      let pipeline = globalStore.createRecord({type:'pipeline', projectId , stages: this.get('precanStages')})
      return {
        pipeline,
        accounts,
        clusterPipeline,
        projectDockerCredentials,
        repositories,
        language: 'custom'
      };
    })
  },
  resetController(controller){
    controller.set('errors', '');
    controller.set('saved', false);
    this.set('precanStages',precanStages())
  },
});