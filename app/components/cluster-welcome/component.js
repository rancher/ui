import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  clusters: null,

  canCreate: true,
  canImport: true,
  canReuse: Ember.computed.gt('clusters.length', 0),

  init() {
    this._super(),

    this.set('clusters', this.get('store').all('cluster'));
  },
});
