import OverlayRoute from 'ui/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(/*params, transition*/) {
    return this.modelFor('project');
  },

  setupController: function(controller,model) {
    this._super();
    controller.set('model', model);
    controller.set('editing',true);
  },

  renderTemplate: function() {
    this.render('projects/new', {into: 'application', outlet: 'overlay', controller: 'project/edit'});
  },
});
