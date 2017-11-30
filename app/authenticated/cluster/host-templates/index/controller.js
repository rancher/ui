import Controller from '@ember/controller';

export default Controller.extend({
  backTo:           'hosts',
  currentClusterId: null,
  queryParams:      ['backTo'],

  actions: {
    launch(model) {
      this.transitionToRoute('authenticated.cluster.host-templates.launch', this.get('currentClusterId'), model.id);
    },
  },

});
