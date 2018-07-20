import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { oauthURIGenerator } from 'pipeline/utils/gitOauth';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';
import { set, get } from '@ember/object';

export default Component.extend({
  github:      service('pipeline-github'),
  layout,
  branchTypes: branchConditionsEnums,
  state:       {
    auth_ing:       false,
    refreshingRepo: false,
    repoRefresh:    false,
  },
  authErrors:                          [],
  allowOnly:                           false,
  Oauth:                               false,
  fetchPipelineFromRepoState:          false,
  fetchPipelineFromRepoMessageShow:    false,
  fetchPipelineFromRepoMessageSuccess: false,
  importFromBranch:                    '',
  repositories:                        [],
  selectedRepo:                        null,
  triggerTypes:                        [{
    label: 'Webhook',
    value: 'webhook',
    dsc:   'Automatically build the pipeline whenever there is git commit'
  }, {
    label: 'Cron',
    value: 'cron',
    dsc:   'On a fixed schedule'
  }, {
    label: 'Manually',
    value: 'manually',
    dsc:   'Trigger by just manually'
  }],
  selectedTriggerType:                 'webhook',
  clusterPipeline:     alias('modalOpts.clusterPipeline'),
  pipeline:            alias('modalOpts.pipeline'),
  routeState:          alias('modalOpts.routeState'),
  init(){
    this._super(...arguments);
    let repositories = get(this, 'modalOpts.routeState.repositories');

    set(this, 'repositories', repositories);
    set(this, 'statusFetching', false);

    let existUrl = get(this, 'selectedModel.sourceCodeConfig.url');

    if (!existUrl){
      const initUrl = repositories.content && repositories.content[0] && repositories.content[0].url;

      set(this, 'selectedModel.sourceCodeConfig.url', initUrl);
    }
    this.urlObserve();
  },
  didInsertElement() {
    const input = this.$('.input-search')[0];

    if (input) {
      input.focus();
    }
  },

  actions: {
    fetchPipelineFromRepo(){
      set(this, 'fetchPipelineFromRepoMessageError', false);
      let repositories = get(this, 'repositories');
      let url = get(this, 'selectedModel.sourceCodeConfig.url');

      if (!url){
        return
      }
      let selected = repositories.find((ele) => ele.url === url);

      set(this, 'fetchPipelineFromRepoMessage', []);
      let branch = get(this, 'selectedModel.sourceCodeConfig.branch');
      let branchCondition = get(this, 'selectedModel.sourceCodeConfig.branchCondition');

      if (selected){
        set(this, 'fetchPipelineFromRepoState', true);
        set(this, 'fetchPipelineFromRepoMessageShow', false);
        if (branchCondition !== 'only'){
          branch = '';
        }
        selected.followLink('pipeline', { filter: { branch } }).then((res) => {
          let resObj = JSON.parse(res);
          let pipeline = resObj.pipeline;

          if (pipeline && pipeline.stages){
            let precanPipeline = get(this, 'pipeline');
            let importedStages = pipeline.stages.slice(-(pipeline.stages.length - 1));
            let stages = [].concat(precanPipeline.stages[0], importedStages);

            set(this, 'pipeline.stages', stages);
            for (var key in pipeline){
              let val = pipeline[key];

              if (key !== 'stages'){
                set(this, `pipeline.${ key }`, val);
              }
            }
            set(this, 'importFromBranch', resObj.branch);
            set(this, 'fetchPipelineFromRepoMessageSuccess', true);
          } else {
            set(this, 'fetchPipelineFromRepoMessageSuccess', false);
          }
          set(this, 'fetchPipelineFromRepoMessageShow', true);
        }).catch(() => {
          set(this, 'fetchPipelineFromRepoMessageError', true);
          set(this, 'fetchPipelineFromRepoMessageShow', true);
        }).finally(() => {
          set(this, 'fetchPipelineFromRepoState', false);
        })
      }
    },
    triggerOptionsChange(options){
      set(this, 'allowOnly', options.cron);
      if (options.cron){
        set(this, 'selectedModel.sourceCodeConfig.branchCondition', 'only')
      }
    },
    setState(state, desiredState){
      set(this, state, desiredState);
    },
    reloadRepo(){
      var accountsInfo = get(this, 'accountsInfo');

      if (!accountsInfo){
        return
      }
      set(this, 'state.repoRefresh', true);
      accountsInfo.doAction('refreshrepos').then((res) => {
        set(this, 'repositories', res.content);
      }).finally(() => {
        set(this, 'state.repoRefresh', false);
      });
    },
    authenticate() {
      var clientId = get(this, 'clusterPipeline.githubConfig.clientId');
      var hostname = 'github.com';
      var scheme = get(this, 'clusterPipeline.tls') ? 'https://' : 'http://';
      var authorizeURL;
      let oauthURI = oauthURIGenerator(clientId);

      hostname || (hostname = `${ get(this, 'selectedOauthType')  }.com`)
      authorizeURL = scheme + hostname + oauthURI['github'];
      set(this, 'testing', true);
      get(this, 'github').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            set(this, 'testing', false);
          } else {
            this.send('gotCode', code, (res) => {
              let user = res;

              set(this, 'testing', false);
              set(this, 'accountsInfo', user);
              set(this, 'state.repoRefresh', true);
              user.followLink('sourceCodeRepositories').then((res) => {
                set(this, 'repositories', res);
                set(this, 'state.repoRefresh', false);
              });
            });
          }
        }
      );
    },
    gotCode(code, cb) {
      let clusterPipeline = get(this, 'clusterPipeline');

      clusterPipeline.doAction('authuser', {
        code,
        sourceCodeType: 'github'
      }).then((res) => {
        cb(res);
      }).catch((res) => {
        // Github auth succeeded but didn't get back a token
        this.send('gotError', res);
      });
    },
    gotError(err) {
      if (err.message) {
        this.send('showError', err.message + (err.detail ? `(${  err.detail  })` : ''));
      } else {
        this.send('showError', `Error (${  err.status  } - ${  err.code  })`);
      }
      set(this, 'testing', false);
    },
    showError(msg) {
      set(this, 'authErrors', [msg]);
    }
  },
  selectedTriggerDesc:                 function(){
    let triggerTypes = get(this, 'triggerTypes');
    let selectedTriggerType = get(this, 'selectedTriggerType');

    return triggerTypes.find((ele) => ele.value === selectedTriggerType).dsc;
  }.property('selectedTriggerType'),

  accountsInfo: function(){
    var accounts = get(this, 'modalOpts.accounts');

    if (!accounts.content.length){
      return get(this, 'pipeline.sourceCodeCredential');
    }
    let accountsInfo = accounts.content[0];

    if (!accountsInfo){
      return null
    }

    return accountsInfo;
  }.property('modalOpts.accounts'),
  sourceCodeCredentialObserve: function(){
    let selectedRepo = get(this, 'selectedRepo');
    let accountsInfo = get(this, 'accountsInfo');

    if (!selectedRepo){
      set(this, 'selectedModel.sourceCodeConfig.sourceCodeCredentialId', undefined);
    }
    if (accountsInfo){
      set(this, 'selectedModel.sourceCodeConfig.sourceCodeCredentialId', accountsInfo.id);
    }
  }.observes('accountsInfo', 'selectedRepo'),
  profileComponent: function(){
    var account = get(this, 'accountsInfo');

    if (!account){
      return
    }
    let profile = Object.assign({}, account);

    profile.name = profile.loginName;
    profile.username = profile.displayName;
    profile.profilePicture = profile.avatarUrl;
    profile.avatarSrc = profile.avatarUrl;

    return profile;
  }.property('accountsInfo'),
  urlObserve: function(){
    let url = get(this, 'selectedModel.sourceCodeConfig.url');
    let repositories = get(this, 'repositories');
    let selected = repositories.find((ele) => ele.url === url);

    if (selected) {
      set(this, 'routeState.language', selected.language);
      set(this, 'selectedRepo', selected);
    }
  }.observes('selectedModel.sourceCodeConfig.url', 'repositories'),
});
