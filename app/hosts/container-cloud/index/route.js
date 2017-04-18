import Ember from 'ember';
import C from 'ui/utils/constants';


export default Ember.Route.extend({
  prefs: Ember.inject.service(),
  cloudPlans: Ember.inject.service(),
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
    var plans = this.get('cloudPlans.plans');

    model.realms = this.get('cloudPlans.realms');

    switch(params.from) {
    case 'favorites':
      var favs = this.get(`prefs.${C.PREFS.HOST_FAVORITES}`) || [];
      if (favs.length) {
        model.plans = plans.filter((plan) => {
          if (favs.includes(plan.uiOptions.id)) {
            return true;
          }
          return false;
        });
      } else {
        let defaults = ['digitalocean-sfo2-2gb', 'digitalocean-sfo2-4gb', 'digitalocean-sfo2-8gb', 'digitalocean-sfo2-16gb'];
        model.plans = plans.filter((plan) => {
          if (defaults.includes(plan.uiOptions.id)) {
            return true;
          }
        });
        this.set(`prefs.${C.PREFS.HOST_FAVORITES}`, model.plans.mapBy('uiOptions.id'));
      }
      break;
    default:
    case 'browse':
      model.plans = plans;
      break;
    }

    return model;
  },
});
