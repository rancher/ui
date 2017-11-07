import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return this.get('userStore').find('localauthconfig', null, {forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
