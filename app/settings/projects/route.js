import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return store.find('project', null, {filter: {all: 'true'}, forceReload: true}).then(() => {
      return store.allUnremoved('project');
    });
  },
});
