import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var Password = Resource.extend({
  type: 'password',
});

Password.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },
});

export default Password;
