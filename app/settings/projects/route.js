import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var userStore = this.get('userStore');
    return userStore.find('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true}).then(() => {
      return userStore.allUnremoved('project');
    });
  },
});
