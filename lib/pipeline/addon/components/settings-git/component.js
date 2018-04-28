import Component from '@ember/component';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import {later, once} from '@ember/runloop';
import {oauthURIGenerator} from 'pipeline/utils/gitOauth';
import { set, get } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  session: service(),
  accountId: function() {
    return get(this, 'session.' + C.SESSION.ACCOUNT_ID)
  }.property('session.' + C.SESSION.ACCOUNT_ID),
  classNames: ['accordion-wrapper'],
  github: service('pipeline-github'),
  selectedOauthType: 'github',
  oauthModel: {},
  useGloableConfig: true,
  homePageURL: function() {
    var redirect = window.location.origin;
    return redirect;
  }.property(''),
  destinationUrl: function() {
    var redirect = window.location.origin;
    return redirect;
  }.property('session.'+ C.SESSION.BACK_TO),
  init() {
    this._super();
    // set default oauth
    var model = get(this, 'model');
    var gitlabOauthed = model.get('gitlabConfig')||null;
    var githubOauthed = model.get('githubConfig')||null;
    var globalStore = get(this, 'globalStore');
    if (!gitlabOauthed) {
      gitlabOauthed = globalStore.createRecord({ type: 'sourcecodecredential',sourceCodeType: 'gitlab'});
    }
    if (!githubOauthed) {
      githubOauthed = globalStore.createRecord({ type: 'sourcecodecredential', sourceCodeType: 'github'});
    }
    if (!githubOauthed && gitlabOauthed) {
      gitlabOauthed && set(this, 'selectedOauthType', 'gitlab');
      set(this, 'oauthModel', gitlabOauthed);
    } else {
      githubOauthed && set(this, 'oauthModel', githubOauthed);
    }
  },
  errors: null,
  testing: false,
  statusClass: null,
  status: '',
  secure: false,
  isEnterprise: false,
  confirmDisable: false,
  updateEnterprise: function() {
    if (get(this, 'isEnterprise')) {
      var hostname = get(this, 'oauthModel.hostName') || '';
      var match = hostname.match(/^http(s)?:\/\//i);
      if (match) {
        set(this, 'secure', ((match[1] || '').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/, '');
        set(this, 'oauthModel.hostName', hostname);
      }
    } else {
      set(this, 'oauthModel.hostName', null);
      set(this, 'secure', true);
    }

    set(this, 'oauthModel.scheme', get(this, 'secure'));
  },

  enterpriseDidChange: function() {
    if(get(this, 'oauthModel.isAuth')){
      return
    }
    once(this, 'updateEnterprise');
  }.observes('isEnterprise', 'oauthModel.hostName', 'secure'),

  actions: {
    changeOauthSource: function(useGloableConfig){
      set(this, 'useGloableConfig', useGloableConfig);
    },
    globalGithubConfigAuthenticate: function(){
      let globalGithubConfig = get(this, 'globalGithubConfig');
      this.send('authenticate', globalGithubConfig.clientId, globalGithubConfig.hostName, globalGithubConfig.tls, true)
    },
    changeOauthType: function(type) {
      set(this, 'selectedOauthType', type);
      var oauthModel = get(this, 'model').filter(ele => ele[`${type}Config`] === type);
      oauthModel && set(this, 'oauthModel', oauthModel);
    },
    disable: function() {
      var model = get(this, 'model');
      set(this, 'revoking', true);
      model.doAction('revokeapp').then(() => {
        model.doAction('destroy').then(()=>{
        });
      }).finally(()=>{
        set(this, 'revoking', false);
      });
    },
    promptDisable: function() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);
    },
    authenticate: function(clientId_P, hostName_P, tls_P, inheritGlobal, callBack) {
      var clientId = clientId_P||get(this, 'oauthModel.clientId');
      var hostname = hostName_P||get(this, 'oauthModel.hostName');
      var tls = (tls_P === undefined)&&get(this, 'oauthModel.scheme')||tls_P
      var scheme = tls?'https://': 'http://';
      var authorizeURL;
      let oauthURI = oauthURIGenerator(clientId);
      hostname||(hostname = get(this, 'selectedOauthType') + '.com')
      authorizeURL = scheme + hostname + oauthURI[get(this, 'selectedOauthType')];
      set(this, 'testing', true);
      get(this, 'github').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            set(this, 'testing', false);
          } else {
            callBack&&callBack(code)||this.send('gotCode', code, hostname, tls, inheritGlobal, () => {
              this.send('deployPipeline');
            });
          }
        }
      );
    },
    deployPipeline(){
      let model = get(this, 'model');
      return model.doAction('deploy').then(()=>{
        set(this, 'testing', false);
      });
    },
    gotCode: function(code, host, tls, inheritGlobal, cb) {
      let model = get(this, 'model');
      let oauthModel = get(this, 'oauthModel');
      if(inheritGlobal){
        oauthModel.setProperties({
          code,
          inheritGlobal,
          sourceCodeType: get(this, 'selectedOauthType')
        });
      }else{
        oauthModel.setProperties({
          code,
          host,
          tls: tls,
          sourceCodeType: get(this, 'selectedOauthType'),
          redirectUrl: get(this, 'github.redirect')
        });
      }
      model.doAction('authapp', oauthModel).then(() => {
        cb();
      }).catch(res => {
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

      set(this, 'testing', false);
    },

    showError: function(msg) {
      set(this, 'errors', [msg]);
      window.scrollY = 10000;
    },

    clearError: function() {
      set(this, 'errors', null);
    },
  }
});
