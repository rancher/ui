import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId','serviceId','tab'],
  environmentId: null,
  serviceId: null,
  tab: 'ssl',

  actions: {
    done() {
      return this.transitionToRoute('environment', this.get('model.service.environmentId'));
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
