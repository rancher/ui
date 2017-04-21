import Ember from 'ember';


export default Ember.Route.extend({
  cloudPlans: Ember.inject.service(),
  actions: {
    save() {
      this.transitionTo('hosts');
    },
    cancel() {
      this.transitionTo('hosts.container-cloud');
    }
  },
  model(params/*, transition*/){
    if (params.cloud_id) {
      return this.get('store').find('hostTemplates', null, {forceReload: true}).then((templates) => {
        var plan = this.get('cloudPlans.plans').findBy('uiOptions.id', params.cloud_id);
        return Ember.Object.create({
          plans: plan,
          hostTemplates: templates.filterBy('flavorPrefix', plan.pretty_provider),
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
