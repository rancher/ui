import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var ActiveSetting = Resource.extend();

ActiveSetting.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default ActiveSetting;
