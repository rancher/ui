import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      this.send('goToPrevious', 'authenticated.cluster.storage.persistent-volumes');
    },
  },
});
