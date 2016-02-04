import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  beforeModel: function() {
    var store = this.get('store');
    var headers = {
      [C.HEADER.PROJECT]: undefined,
    };

    return Ember.RSVP.all([
      store.find('schema','githubconfig', {headers: headers}),
      store.find('schema','localauthconfig', {headers: headers}),
      store.find('schema','ldapconfig', {headers: headers}),
      store.find('schema','openldapconfig', {headers: headers}),
    ]);
  },
});
