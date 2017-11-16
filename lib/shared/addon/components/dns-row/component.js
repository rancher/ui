import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  scope: service(),
  session:  service(),

  model: null,
  tagName: '',
  expanded: null,

  canExpand: function() {
    return !!this.get('model.isSelector');
  }.property('model.isSelector'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
