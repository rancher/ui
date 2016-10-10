import Ember from 'ember';

export default Ember.Route.extend({
  catalog: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      drivers: this.get('userStore').findAll('machinedriver', null, {forceReload: true}),
      catalogDrivers: this.get('catalog').fetchTemplates({templateBase: 'machine', category: 'all', allowFailure: true}),
    }).then((hash) => {
      return hash;
    });
  },
});
