import GithubSetting from 'pipeline/components/github-setting/component';

export default GithubSetting.extend({
  oauthType: 'gitlab',
  oauthHost: 'gitlab.com',

  getOauthUrl(clientId) {
    return `/oauth/authorize?client_id=${  clientId  }&response_type=code`;
  },
});
