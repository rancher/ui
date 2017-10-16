import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('userStore').find('localauthconfig', null, {forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
