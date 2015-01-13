import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var session = this.get('session');
    session.clear();
    this.send('logout');
  }
});
