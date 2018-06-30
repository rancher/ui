import Route from '@ember/routing/route';

export default Route.extend({
  model(/* params, transition*/) {

    return this.get('store').createRecord({
      type:       'dockerCredential',
      registries: {
        'index.docker.io': {
          username: '',
          password: '',
        }
      }
    });

  },
});
