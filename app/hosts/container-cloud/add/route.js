import Ember from 'ember';
import Plans from 'ui/utils/cloud-plans';


export default Ember.Route.extend({
  model(params/*, transition*/){
    if (params.cloud_id) {
      return this.get('store').find('hostTemplates', null, {forceReload: true}).then((templates) => {
        var plan = Plans.realms.findBy('id', params.cloud_id);
        return Ember.Object.create({
          plans: plan,
          hostTemplates: templates.filterBy('flavorPrefix', plan.provider)
        });
      });
    } else {
     return this.transitionTo('hosts.container-cloud');
    }
  },
});
