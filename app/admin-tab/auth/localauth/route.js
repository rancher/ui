import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {

    var headers = {};
    headers[C.HEADER.PROJECT] = undefined;

    return this.get('store').find('localauthconfig', null, {headers: headers, forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
