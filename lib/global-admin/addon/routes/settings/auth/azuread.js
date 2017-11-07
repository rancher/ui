import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  userStore: service('user-store'),
  model: function() {
    return this.get('userStore').find('azureadconfig', null, {forceReload: true}).then((collection) => {
      let obj = collection.get('firstObject');
      obj.set('accessMode','unrestricted');
      return obj;
    });
  },
});
