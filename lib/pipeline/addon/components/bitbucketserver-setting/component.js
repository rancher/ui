import GithubSetting from 'pipeline/components/github-setting/component';
import { set, get, setProperties, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default GithubSetting.extend({
  intl:     service(),
  router:   service(),
  settings: service(),

  oauthType:       'bitbucketserver',
  oauthHost:       'bitbucket.org',
  applicationLink: null,
  consumerKey:     null,
  publicKey:       null,

  init() {
    this._super(...arguments);

    setProperties(this, {
      isEnterprise:    true,
      applicationLink: window.location.href
    })
    const provider = get(this, 'provider');

    if ( !get(provider, 'consumerKey') ) {
      set(this, 'generating', true);
      provider.doAction('generateKeys').finally(() => {
        set(this, 'generating', false);
      });
    }
  },

  actions: {
    authenticate() {
      const hostname = get(this, 'oauthModel.hostName');
      const errors = [];

      if ( !hostname ) {
        errors.pushObject(get(this, 'intl').t('authPage.bitbucketserver.form.hostname.required'));
      }
      set(this, 'errors', errors);

      if ( get(errors, 'length') > 0 ) {
        return;
      }

      set(this, 'testing', true);
      const provider = get(this, 'provider');
      const tls = get(this, 'secure');
      const redirectUrl = `${ get(this, 'destinationUrl') }/verify-auth`;

      provider.doAction('requestLogin', {
        hostname,
        redirectUrl,
        tls
      }).then((res) => {
        const authorizeURL = get(res, 'loginUrl');

        get(this, 'gitService').authorizeTest(
          authorizeURL,
          (err, code) => {
            if (err) {
              this.send('gotError', err);
              set(this, 'testing', false);
            } else {
              this.send('gotCode', code, hostname, redirectUrl, tls);
            }
          }
        );
      }).catch(() => {
        set(this, 'testing', false);
      });
    },

    gotCode(code, hostname, redirectUrl, tls) {
      const param = {
        hostname,
        oauthToken:    get(code, 'oauthToken'),
        oauthVerifier: get(code, 'oauthVerifier'),
        redirectUrl,
        tls,
      };

      get(this, 'provider').doAction('testAndApply', param).then(() => {
        get(this, 'router').transitionTo('authenticated.project.pipeline.repositories');
      }).finally(() => {
        set(this, 'testing', false);
      });
    },
  },

  targetDidChange: observer('target', function() {
    this.switch('bitbucketcloud');
  }),

  switch() {
    throw new Error('switch action is required!');
  }
});
