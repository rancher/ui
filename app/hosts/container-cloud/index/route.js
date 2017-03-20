import Ember from 'ember';
import Plans from 'ui/utils/cloud-plans';


export default Ember.Route.extend({
  queryParams: {
    from: {
      refreshModel: true
    },
  },
  model(params/*, transition*/){
    var model = {};
    var plans = Plans;

    switch(params.from) {
    case 'favorites':
      // get the fav's from user store or reg store?
      break;
    case 'provider':
      break;
    default:
    case 'browse':
      model.plans = plans.realms.sortBy('name');
      model.realms = plans.realmNames;
      break;
    }

    return model;
  },
});
