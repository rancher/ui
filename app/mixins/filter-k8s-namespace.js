import Ember from 'ember';

export default Ember.Mixin.create({
  k8s: Ember.inject.service(),
  filterableContent: Ember.computed.alias('model'),

  init() {
    this._super();
  },

  filtered: function() {
    return (this.get('filterableContent')||[]).filterBy('metadata.namespace', this.get('k8s.namespace.id'));
  }.property('filterableContent.@each.metadata','k8s.namespace.id'),
});
