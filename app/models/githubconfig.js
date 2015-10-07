import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';

var GithubConfig = Resource.extend({
  type: 'githubConfig',
});

// Projects don't get pushed by /subscribe WS, so refresh more often
GithubConfig.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default GithubConfig;
