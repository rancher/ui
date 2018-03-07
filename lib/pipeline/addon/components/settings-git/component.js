import Component from '@ember/component';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import {later, once} from '@ember/runloop';
import {oauthURIGenerator} from 'pipeline/utils/gitOauth';

export default Component.extend({
  globalStore: service(),
  session: service(),
  accountId: function() {
    return this.get('session.' + C.SESSION.ACCOUNT_ID)
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
    var model = this.get('model');
    var gitlabOauthed = model.get('gitlabConfig')||null;
    var githubOauthed = model.get('githubConfig')||null;
    var globalStore = this.get('globalStore');
    if (!gitlabOauthed) {
      gitlabOauthed = globalStore.createRecord({ type: 'sourcecodecredential',sourceCodeType: 'gitlab'});
    }
    if (!githubOauthed) {
      githubOauthed = globalStore.createRecord({ type: 'sourcecodecredential', sourceCodeType: 'github'});
    }
    if (!githubOauthed && gitlabOauthed) {
      gitlabOauthed && this.set('selectedOauthType', 'gitlab');
      this.set('oauthModel', gitlabOauthed);
    } else {
      githubOauthed && this.set('oauthModel', githubOauthed);
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
    if (this.get('isEnterprise')) {
      var hostname = this.get('oauthModel.hostName') || '';
      var match = hostname.match(/^http(s)?:\/\//i);
      if (match) {
        this.set('secure', ((match[1] || '').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/, '');
        this.set('oauthModel.hostName', hostname);
      }
    } else {
      this.set('oauthModel.hostName', null);
      this.set('secure', true);
    }

    this.set('oauthModel.scheme', this.get('secure'));
  },

  enterpriseDidChange: function() {
    if(this.get('oauthModel.isAuth')){
      return
    }
    once(this, 'updateEnterprise');
  }.observes('isEnterprise', 'oauthModel.hostName', 'secure'),

  actions: {
    changeOauthSource: function(useGloableConfig){
      this.set('useGloableConfig', useGloableConfig);
    },
    globalGithubConfigAuthenticate: function(){
      let globalGithubConfig = this.get('globalGithubConfig');
      this.send('authenticate', globalGithubConfig.clientId, globalGithubConfig.hostName, globalGithubConfig.tls, true)
    },
    changeOauthType: function(type) {
      this.set('selectedOauthType', type);
      var oauthModel = this.get('model').filter(ele => ele[`${type}Config`] === type);
      oauthModel && this.set('oauthModel', oauthModel);
    },
    disable: function() {
      var model = this.get('model');
      this.set('revoking', true);
      model.doAction('revokeapp').then(() => {
        model.doAction('destroy').then(()=>{
        });
      }).finally(()=>{
        this.set('revoking', false);
      });
    },
    promptDisable: function() {
      this.set('confirmDisable', true);
      later(this, function() {
        this.set('confirmDisable', false);
      }, 10000);
    },
    authenticate: function(clientId_P, hostName_P, tls_P, inheritGlobal, callBack) {
      var clientId = clientId_P||this.get('oauthModel.clientId');
      var hostname = hostName_P||this.get('oauthModel.hostName');
      var tls = (tls_P === undefined)&&this.get('oauthModel.scheme')||tls_P
      var scheme = tls?'https://': 'http://';
      var authorizeURL;
      let oauthURI = oauthURIGenerator(clientId);
      hostname||(hostname = this.get('selectedOauthType') + '.com')
      authorizeURL = scheme + hostname + oauthURI[this.get('selectedOauthType')];
      this.set('testing', true);
      this.get('github').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            this.set('testing', false);
          } else {
            callBack&&callBack(code)||this.send('gotCode', code, hostname, tls, inheritGlobal, () => {
              this.send('deployPipeline');
            });
          }
        }
      );
    },
    deployPipeline(){
      let model = this.get('model');
      return model.doAction('deploy').then(()=>{
        this.set('testing', false);
      });
    },
    gotCode: function(code, host, tls, inheritGlobal, cb) {
      let model = this.get('model');
      let oauthModel = this.get('oauthModel');
      if(inheritGlobal){
        oauthModel.setProperties({
          code,
          inheritGlobal,
          sourceCodeType: this.get('selectedOauthType')
        });
      }else{
        oauthModel.setProperties({
          code,
          host,
          tls: tls,
          sourceCodeType: this.get('selectedOauthType'),
          redirectUrl: this.get('github.redirect')
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

      this.set('testing', false);
    },

    showError: function(msg) {
      this.set('errors', [msg]);
      window.scrollY = 10000;
    },

    clearError: function() {
      this.set('errors', null);
    },
  }
});
