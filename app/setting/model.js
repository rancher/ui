import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

var Setting = Cattle.TransitioningResource.extend({
});

Setting.reopenClass({
  headers: {
    [C.HEADER.PROJECT]: undefined, // Don't send project ID header for any requests to that type
  }
});

export default Setting;
