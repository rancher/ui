import Ember from 'ember';
import {headers} from 'ui/volume/controller';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  session:  Ember.inject.service(),

  model: null,
  tagName: '',
  subMatches: null,
  expanded: null,

  bulkActions: true,
  showActions: true,
  headers: headers,

  canExpand: function() {
    return this.get('model.type').toLowerCase() === 'volumetemplate';
  }.property('model.type'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
