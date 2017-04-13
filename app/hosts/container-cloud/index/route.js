import Ember from 'ember';
import Plans from 'ui/utils/cloud-plans';
import C from 'ui/utils/constants';


export default Ember.Route.extend({
  prefs: Ember.inject.service(),
  queryParams: {
    from: {
      refreshModel: true
    },
  },
  actions: {
    selectMachine(id) {
      this.transitionTo('hosts.container-cloud.add', id);
    },
    selectTab(from) {
      this.transitionTo('hosts.container-cloud', {queryParams: {from: from}});
    },
  },
  model(params/*, transition*/){
    var model = {};
    var plans = Plans;

    switch(params.from) {
    case 'favorites':
      var favs = this.get(`prefs.${C.PREFS.HOST_FAVORITES}`);
      if (favs) {
        model.plans = plans.realms.filter((plan) => {
          if (favs.contains(plan.id)) {
            return true;
          }
          return false;
        });
      } else {
        model.plans = [];
      }
      model.realms = plans.realmNames;
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
