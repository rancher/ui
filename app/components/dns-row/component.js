import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  session:  Ember.inject.service(),

  model: null,
  tagName: '',
  expanded: null,

  canExpand: function() {
    return !!this.get('model.isSelector');
  }.property('model.isSelector'),

  linkedServicesArray: Ember.computed('model.linkedServices', function() {
    let store = this.get('store');
    let links = this.get('model.linkedServices')||{};
    let out = Object.keys(links).map((key) => {
      return {as: key, service: store.getById('service', links[key])};
    });

    return out;
  }),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
