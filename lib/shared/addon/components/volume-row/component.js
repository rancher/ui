import Component from '@ember/component';
import layout from './template'
import { volumes as VolumeHeaders } from 'shared/headers';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  scope:    service(),
  session:     service(),

  model:       null,
  tagName:     '',
  subMatches:  null,
  expanded:    null,

  bulkActions: true,
  showActions: true,
  headers:     VolumeHeaders,

  canExpand: function() {
    return this.get('model.type').toLowerCase() === 'volumetemplate';
  }.property('model.type'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
