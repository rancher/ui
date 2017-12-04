import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';


export default Route.extend({
  userStore: service('user-store'),
  model: function() {
    // @TODO-2.0
    let TRUE = true;
    if ( TRUE ) {
      return {};
    }

    return this.get('userStore').find('localauthconfig', null, {forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
