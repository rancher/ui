import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var UserPreference = Resource.extend();

UserPreference.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default UserPreference;
