import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var store = this.get('store');

    return Ember.RSVP.all([
      store.find('schema','project', {authAsUser: true}),
      store.find('schema','projectmember', {authAsUser: true}),
    ]);
  },

  model: function() {
    var store = this.get('store');
    return store.find('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true}).then(() => {
      return store.allUnremoved('project');
    });
  },
});
