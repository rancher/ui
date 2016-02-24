import Ember from 'ember';

export default Ember.Controller.extend({
  step: 1,
  kubeconfig: '',

  actions: {
    generate() {
      this.set('step', 2);
      setTimeout(() => { this.set('step', 3); this.set('kubeconfig','blah blah config'); }, 2000);
    },
  },
});
