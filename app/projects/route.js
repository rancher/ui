import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    refreshProjects: function() {
      var store = this.get('store');
      store.resetType('project');
      return store.find('project', null, {filter: {all: 'true'}, forceReload: true}).then(() => {
        this.send('refreshProjectDropdown');
      });
    },
    newProject: function() {
      this.transitionTo('projects.new');
    }
  },

  model: function() {
    var store = this.get('store');
    return store.find('project', null, {filter: {all: 'true'}, forceReload: true}).then(() => {
      return store.allUnremoved('project');
    });
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Manage Projects'});
  },
});
