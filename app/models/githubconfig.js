import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';

var GithubConfig = Resource.extend({
  type: 'githubConfig',
});

// Projects don't get pushed by /subscribe WS, so refresh more often
GithubConfig.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },

  mangleIn: function(data, store) {
    if ( data.allowedIdentities )
    {
      // Labels shouldn't be a model even if it has a key called 'type'
      data.allowedIdentities = data.allowedIdentities.map((obj) => {
        obj.type = 'identity';
        return store.createRecord(obj);
      });
    }

    return data;
  },
});

export default GithubConfig;
