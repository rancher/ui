import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

var UserPreference = Cattle.TransitioningResource.extend({
});

UserPreference.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default UserPreference;
