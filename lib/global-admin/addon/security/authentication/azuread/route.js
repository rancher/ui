import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  // model: function() {
  //   return this.get('globalStore').find('azureadconfig', null, {forceReload: true}).then((collection) => {
  //     let obj = collection.get('firstObject');
  //     obj.set('accessMode','unrestricted');
  //     return obj;
  //   });
  // },
  globalStore: service(),

  model() {
    let gs = get(this, 'globalStore');
    return hash({
      azureADConfig: gs.find('authconfig', 'azuread'),
      principals: gs.all('principal')
    }).catch( e =>  e);
  },

  afterModel(model) {
    return set(model, 'azureADConfig.accessMode', 'unrestricted'); // why?

  },

  // setupController(controller, model) {
  //   debugger;

  //   let hostname = get(model, 'azureADConfig.hostname')

  //   controller.setProperties({
  //     model: model,
  //     confirmDisable: false,
  //     testing: false,
  //     organizations: get(this, 'session.orgs')||[],
  //     errors: null,
  //     isEnterprise: ( hostname && hostname !== 'github.com' ? true : false),
  //   });

  //   controller.set('saved',true);
  // }
});
