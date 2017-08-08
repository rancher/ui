import Ember from 'ember';

export default Ember.Controller.extend({
  kubeconfig: null,
  saving: false,

  actions: {
    save() {
    },

    cancel() {
      this.send('goToPrevious');
    }
  },

  configSet: function() {
    return this.get('kubeconfig.length') > 0;
  }.property('kubeconfig'),
});
