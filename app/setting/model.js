import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

var Setting = Resource.extend();

Setting.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default Setting;
