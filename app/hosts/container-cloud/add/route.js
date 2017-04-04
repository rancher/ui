import Ember from 'ember';
import Plans from 'ui/utils/cloud-plans';


export default Ember.Route.extend({
  model(params/*, transition*/){
    if (params.cloud_id) {
      return this.get('store').find('hostTemplates', null, {forceReload: true}).then((templates) => {
        var plan = Plans.realms.findBy('id', params.cloud_id);
        return Ember.Object.create({
          plans: plan,
          hostTemplates: templates.filterBy('flavorPrefix', plan.provider),
          host: this.get('store').createRecord({type: 'host'}),
        });
      });
    } else {
     return this.transitionTo('hosts.container-cloud');
    }
  },
  resetController(controller, isExisting /*, transition*/) {
    if ( isExisting )
    {
      controller.set('host', null);
      controller.set('model', null);
    }
  },
});
