import Ember from 'ember';

export default Ember.Route.extend({
  mesos: Ember.inject.service(),

  model() {
    return this.get('mesos').publicUrl().then((url) => {
      return Ember.Object.create({
        url: url,
        hosts: this.modelFor('authenticated').get('hosts'),
      });
    }).catch(() => {
      return Ember.Object.create({
        url: null,
        hosts: this.modelFor('authenticated').get('hosts'),
        ready: false,
      });
    });
  }
});
