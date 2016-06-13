import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('userStore').find('azureadconfig', null, {forceReload: true}).then((collection) => {
      let obj = collection.get('firstObject');
      obj.set('accessMode','unrestricted');
      return obj;
    });
  },
});
