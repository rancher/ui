import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { set, get } from '@ember/object';

let precanStages = () => [{
  name:  'clone',
  steps: []
}, {
  name:  'build',
  steps: []
}, {
  name:  'publish',
  steps: [{
    type:                 'build',
    'publishImageConfig': {
      'dockerfilePath': './Dockerfile',
      'buildContext':   '.',
      'tag':            'pipeline/build:${CICD_EXECUTION_SEQUENCE}'
    }
  }]
}];

export default Route.extend({
  globalStore:  service(),
  projectStore: service('store'),
  precanStages: precanStages(),
  model() {
    var globalStore = get(this, 'globalStore');
    var projectStore = get(this, 'projectStore');
    let projectModel = window.l('route:application').modelFor('authenticated.project');
    let projectId = projectModel.project.id;
    let clusterId = projectModel.project.clusterId;
    let accounts = globalStore.findAll('sourceCodeCredential');
    let clusterPipeline = globalStore.find('clusterPipeline', `${ clusterId }:${ clusterId }`, { forceReload: true });
    let projectDockerCredentials = projectStore.all('dockerCredential');

    return clusterPipeline.then((pipeline) => {
      clusterPipeline = pipeline;

      return clusterPipeline.followLink('envvars')
    }).then((envvars) => {
      return hash({
        accounts,
        clusterPipeline,
        projectDockerCredentials,
        envvars
      })
    })
      .then(({
        accounts, clusterPipeline, projectDockerCredentials, envvars
      }) => {
        let pipeline = globalStore.createRecord({
          type:   'pipeline',
          projectId,
          stages: get(this, 'precanStages')
        });

        if (!accounts.content.length){
          return {
            pipeline,
            accounts,
            clusterPipeline,
            projectDockerCredentials,
            envvars,
            repositories: [],
            language:     'Custom'
          };
        } else {
          return accounts.content[0].followLink('sourceCodeRepositories').then((res) => {
            return {
              pipeline,
              accounts,
              clusterPipeline,
              projectDockerCredentials,
              envvars,
              repositories: res,
              language:     'Custom'
            }
          })
        }
      })
  },
  resetController(controller){
    controller.set('errors', '');
    controller.set('saved', false);
    set(this, 'precanStages', precanStages())
  },
});