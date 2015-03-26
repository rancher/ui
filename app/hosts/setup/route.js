import OverlayRoute from 'ui/overlay/route';
import C from 'ui/utils/constants';

export default OverlayRoute.extend({
  model: function() {
    return this.get('store').find('setting', C.SETTING_API_HOST);
  },

  setupController: function(controller, model) {
    var thisPage = window.location.host;
    controller.set('thisPage', thisPage);
    var endpoint = this.controllerFor('application').get('endpointHost');
    if ( endpoint !== thisPage )
    {
      controller.set('customValue', endpoint);
    }

    controller.set('model', model);
    var value = model.get('value');
    if ( value )
    {
      controller.set('customValue', value);
    }
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },
});
