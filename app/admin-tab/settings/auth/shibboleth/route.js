import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return this.get('authStore').find('config', null, {forceReload: true}).then(function(collection) {
      return collection;
    });
  },
});
