import Route from '@ember/routing/route'
import { get } from '@ember/object';
import { inject as service } from '@ember/service'

export default Route.extend({
  globalStore: service(),

  model() {
    const store = get(this, 'globalStore');
    return store.find('clusterRegistrationToken').then((tokens) => {
      let token = get(tokens,'firstObject');
      if ( token ) {
        return token;
      } else {
        token = store.createRecord({
          type: 'clusterRegistrationToken',
        });

        return token.save().then(() => {
          return token;
        });
      }
    });
  }
});
