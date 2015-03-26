import OverlayRoute from 'ui/overlay/route';

export default OverlayRoute.extend({
  actions: {
    cancel: function() {
      this.send('goToPrevious');
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
  },

  renderTemplate: function() {
    this.render('projects/new', {into: 'application', outlet: 'overlay'});
  },
});
