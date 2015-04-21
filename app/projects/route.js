import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    newProject: function() {
      this.transitionTo('projects.new');
    }
  },

  model: function() {
    return this.get('store').find('project', null, {filter: {all: 'true'}, forceReload: true});
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Manage Projects'});
  },
});
