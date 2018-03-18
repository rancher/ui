import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {oauthURIGenerator} from 'pipeline/utils/gitOauth';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';

export default Component.extend({
  layout,
  github: service('pipeline-github'),
  branchTypes: branchConditionsEnums,
  state: {
    auth_ing: false,
    refreshingRepo: false,
    repoRefresh: false,
  },
  allowOnly: false,
  Oauth: false,
  fetchPipelineFromRepoState: false,
  fetchPipelineFromRepoMessageShow: false,
  fetchPipelineFromRepoMessageSuccess: false,
  importFromBranch: '',
  repositories: [],
  selectedRepo: null,
  clusterPipeline: alias('modalOpts.clusterPipeline'),
  pipeline: alias('modalOpts.pipeline'),
  routeState: alias('modalOpts.routeState'),
  triggerTypes: [{label:'Webhook',value:'webhook', dsc: 'Automatically build the pipeline whenever there is git commit'}, {label: 'Cron',value:'cron', dsc:'On a fixed schedule'},{label: 'Manually',value:'manually', dsc: 'Trigger by just manually'}],
  selectedTriggerType: 'webhook',
  selectedTriggerDesc: function(){
    let triggerTypes = this.get('triggerTypes');
    let selectedTriggerType = this.get('selectedTriggerType');
    return triggerTypes.find(ele=>ele.value===selectedTriggerType).dsc;
  }.property('selectedTriggerType'),

  accountsInfo: function(){
    var accounts = this.get('modalOpts.accounts');
    if(!accounts.content.length){
      return this.get('pipeline.sourceCodeCredential');
    }
    let accountsInfo = accounts.content[0];
    if(!accountsInfo){
      return null
    }
    this.set('selectedModel.sourceCodeConfig.sourceCodeCredentialId', accountsInfo.id)
    return accountsInfo;
  }.property('modalOpts.accounts'),
  profileComponent: function(){
    var account = this.get('accountsInfo');
    if(!account){
      return
    }
    let profile = Object.assign({},account);
    profile.name = profile.loginName;
    profile.username = profile.displayName;
    profile.profilePicture = profile.avatarUrl;
    profile.avatarSrc = profile.avatarUrl;
    return profile;
  }.property('accountsInfo'),
  init(){
    this._super(...arguments);
    let repositories = this.get('modalOpts.routeState.repositories');
    this.set('repositories', repositories);
    this.set('statusFetching',false);
    this.urlObserve();
  },
  urlObserve: function(){
    let url = this.get('selectedModel.sourceCodeConfig.url');
    let repositories = this.get('repositories');
    let selected = repositories.find((ele)=> ele.url === url);
    if(selected) {
      this.set('routeState.language', selected.language);
      this.set('selectedRepo', selected);
    }
  }.observes('selectedModel.sourceCodeConfig.url','repositories'),
  actions: {
    fetchPipelineFromRepo: function(){
      let repositories = this.get('repositories');
      let url = this.get('selectedModel.sourceCodeConfig.url');
      if(!url){
        return
      }
      let selected = repositories.find((ele)=> ele.url === url);
      this.set('fetchPipelineFromRepoMessage', []);
      let branch = this.get('selectedModel.sourceCodeConfig.branch');
      let branchCondition = this.get('selectedModel.sourceCodeConfig.branchCondition');
      if(selected){
        this.set('fetchPipelineFromRepoState', true);
        this.set('fetchPipelineFromRepoMessageShow', false);
        if(branchCondition !== 'only'){
          branch = '';
        }
        selected.followLink('pipeline',{filter:{branch}}).then(res => {
          let resObj = JSON.parse(res);
          let pipeline = resObj.pipeline;
          if(pipeline&&pipeline.stages){
            let precanPipeline = this.get('pipeline');
            let importedStages = pipeline.stages.slice(-(pipeline.stages.length-1));
            let stages = [].concat(precanPipeline.stages[0],importedStages);
            this.set('pipeline.stages', stages);
            for(var key in pipeline){
              let val = pipeline[key];
              if(key !== 'stages'){
                this.set(`pipeline.${key}`, val);
              }
            }
            this.set('importFromBranch',resObj.branch);
            this.set('fetchPipelineFromRepoMessageSuccess', true);
          }else{
            this.set('fetchPipelineFromRepoMessageSuccess', false);
          }
          this.set('fetchPipelineFromRepoMessageShow', true);
        }).finally(()=>{
          this.set('fetchPipelineFromRepoState', false);
        })
      }
    },
    triggerOptionsChange:function(options){
      this.set('allowOnly', options.cron);
      if(options.cron){
        this.set('selectedModel.sourceCodeConfig.branchCondition', 'only')
      }
    },
    setState: function(state, desiredState){
      this.set(state,desiredState);
    },
    reloadRepo: function(){
      var accountsInfo = this.get('accountsInfo');
      if(!accountsInfo){
        return
      }
      this.set('state.repoRefresh', true);
      accountsInfo.doAction('refreshrepos').then((res)=>{
        this.set('repositories', res.content);
      }).finally(()=>{
        this.set('state.repoRefresh', false);
      });
    },
    authenticate: function() {
      var clientId = this.get('clusterPipeline.githubConfig.clientId');
      var hostname = 'github.com';
      var scheme = this.get('clusterPipeline.tls')?'https://':'http://';
      var authorizeURL;
      let oauthURI = oauthURIGenerator(clientId);
      hostname||(hostname = this.get('selectedOauthType') + '.com')
      authorizeURL = scheme + hostname + oauthURI['github'];
      this.set('testing', true);
      this.get('github').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            this.set('testing', false);
          } else {
            this.send('gotCode', code, (res) => {
              let user = res;
              this.set('testing', false);
              this.set('accountsInfo', user);
              this.set('state.repoRefresh', true);
              user.followLink('sourceCodeRepositories').then(res=>{
                this.set('repositories', res);
                this.set('state.repoRefresh', false);
              });
            });
          }
        }
      );
    },
    gotCode: function(code, cb) {
      let clusterPipeline = this.get('clusterPipeline');
      clusterPipeline.doAction('authuser', {code,sourceCodeType: 'github'}).then((res) => {
        cb(res);
      }).catch((res) => {
        // Github auth succeeded but didn't get back a token
        this.send('gotError', res);
      });
    },
    gotError: function(err) {
      if (err.message) {
        this.send('showError', err.message + (err.detail ? '(' + err.detail + ')' : ''));
      } else {
        this.send('showError', 'Error (' + err.status + ' - ' + err.code + ')');
      }
      this.set('testing', false);
    },
  }
});
