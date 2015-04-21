import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(/*params, transition*/) {
    var model = this.get('store').createRecord({
      type: 'project',
      externalIdType: 'project:github_user',
      externalId: this.get('session.user'),
    });

    return model;
  },

  setupController: function(controller,model) {
    this._super();
    controller.set('model', model);
    controller.set('editing',false);
    controller.set('isAdding',false);
    controller.initFields();
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Projects', backRoute: 'projects'});
  },
});
