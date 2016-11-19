import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    var store = this.get('store');
    return store.find('composeservice').then(() => {
      // services include projects, so they will be loaded here already
      return store.all('composeproject');
    });
  }
});
