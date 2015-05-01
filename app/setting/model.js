import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

var Setting = Cattle.TransitioningResource.extend({
});

Setting.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  }
});

export default Setting;
