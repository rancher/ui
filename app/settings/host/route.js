import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  endpoint: Ember.inject.service(),

  model: function() {
    return this.get('store').find('setting', C.SETTING.API_HOST);
  },

  setupController: function(controller, model) {
    var thisPage = window.location.host;
    controller.set('thisPage', thisPage);
    var endpoint = this.get('endpoint.host');
    var isDifferent = endpoint !== thisPage;
    if ( endpoint !== thisPage )
    {
      controller.set('customValue', endpoint);
    }

    controller.set('model', model);
    controller.set('error', null);
    var value = model.get('value');
    if ( value )
    {
      if ( value === thisPage )
      {
        controller.set('customValue', '');
        controller.set('customRadio', 'no');
      }
      else
      {
        controller.set('customValue', value);
        controller.set('customRadio', 'yes');
      }
    }
    else if ( isDifferent )
    {
      controller.set('customValue', endpoint);
      controller.set('customRadio', 'yes');
    }
    else
    {
      controller.set('customValue', '');
      controller.set('customRadio', 'no');
    }
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('backToAdd', false);
    }
  }
});
