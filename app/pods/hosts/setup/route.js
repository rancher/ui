import OverlayRoute from 'ui/pods/overlay/route';
import C from 'ui/utils/constants';

export default OverlayRoute.extend({
  model: function() {
    return this.get('store').find('setting', C.SETTING_API_HOST);
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    var value = model.get('value');
    controller.set('customValue', value);
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },
});
