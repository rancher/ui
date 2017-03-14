import Ember from 'ember';
import Plans from 'ui/utils/cloud-plans';


export default Ember.Route.extend({
  model(params/*, transition*/){
    if (params.cloud_id) {
      return Plans.realms.findBy('id', params.cloud_id);
    } else {
     return this.transitionTo('hosts.container-cloud');
    }
  },
});
