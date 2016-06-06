import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAllUnremoved('backuptarget').then((targets) => {
      return targets;
    });
  }
});
