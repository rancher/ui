import GithubSetting from 'pipeline/components/github-setting/component';
import { observer } from '@ember/object';

export default GithubSetting.extend({
  oauthType: 'bitbucketcloud',
  oauthHost: 'bitbucket.org',

  targetDidChange: observer('target', function() {
    this.switch('bitbucketserver');
  }),

  getOauthUrl(clientId) {
    return `/site/oauth2/authorize?client_id=${  clientId  }&response_type=code`;
  },

  switch() {
    throw new Error('switch action is required!');
  }

});
