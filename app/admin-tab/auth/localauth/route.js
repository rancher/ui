import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    return this.get('userStore').find('localauthconfig', null, {forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
