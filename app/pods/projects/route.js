import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  renderTemplate: function() {
    this._super();
    this.send('setPageName','Manage Projects');
  },

  model: function() {
    return this.get('store').findAll('project');
  },

  actions: {
    newProject: function() {
      this.transitionTo('projects.new');
    }
  }
});
