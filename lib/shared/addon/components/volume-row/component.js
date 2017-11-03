import Component from '@ember/component';
import { volumes as VolumeHeaders } from 'shared/headers';
import { inject as service } from '@ember/service'

export default Component.extend({
  projects:    service(),
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
