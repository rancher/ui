import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return this.get('globalStore').find('azureadconfig', null, {forceReload: true}).then((collection) => {
      let obj = collection.get('firstObject');
      obj.set('accessMode','unrestricted');
      return obj;
    });
  },
});
