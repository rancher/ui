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
  repositories: [],
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
    if(!accounts.length){
      return null;
    }
    this.set('selectedModel.sourceCodeConfig.sourceCodeCredentialId', accounts.content[0].id)
    return accounts.content[0];
  }.property('modalOpts.accounts'),
  profileComponent: function(){
    var accounts = this.get('modalOpts.accounts');
    let profile = Object.assign({},accounts.content[0]);
    profile.name = profile.loginName;
    profile.username = profile.displayName;
    profile.profilePicture = profile.avatarUrl;
    return profile;
  }.property('modalOpts.accounts'),
  init(){
    this._super(...arguments);
    let repositories = this.get('modalOpts.routeState.repositories');
    this.set('repositories', repositories);
    this.set('statusFetching',false);
  },
  urlObserve: function(){
    let url = this.get('selectedModel.sourceCodeConfig.url');
    let repositories = this.get('repositories');
    let selected = repositories.find((ele)=> ele.url === url);
    selected&&this.set('routeState.language', selected.language);
  }.observes('selectedModel.sourceCodeConfig.url','repositories'),
  actions: {
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
      this.get('github').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            this.set('testing', false);
          } else {
            this.send('gotCode', code, () => {
              this.set('testing', false);
            });
          }
        }
      );
    },
    gotCode: function(code, cb) {
      let clusterPipeline = this.get('clusterPipeline');
      clusterPipeline.doAction('authuser', {code}).then(() => {
        cb();
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
