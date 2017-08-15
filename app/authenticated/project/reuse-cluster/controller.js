import Ember from 'ember';

export default Ember.Controller.extend({
  growl: Ember.inject.service(),

  actions: {
    select(cluster) {
      let project = this.get('model.project');
      project.set('clusterId', cluster.get('id'));
      project.save().then(() => {
        this.send('cancel');
      }).catch((err) => {
        this.get('growl').fromError(err);
      });
    },

    cancel() {
      this.send('goToPrevious');
    }
  },
});
