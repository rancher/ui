import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['ingressId', 'upgrade'],
  ingressId:   null,
  upgrade:     null,

  actions: {
    done() {
      this.send('goToPrevious', 'ingresses.index');
    },

    cancel() {
      this.send('goToPrevious', 'ingresses.index');
    },
  },
});
