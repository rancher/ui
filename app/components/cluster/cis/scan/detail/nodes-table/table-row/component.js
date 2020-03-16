import Component from '@ember/component';
import layout from './template';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  scope: service(),

  layout,
  tagName:    '',

  badgeState: computed('model.state', function() {
    const state = get(this, 'model.state');

    return {
      stateBackground: this.getStateBackground(state),
      displayState:    state
    }
  }),

  getStateBackground(state) {
    switch (state) {
    case 'Pass':
      return 'bg-success';
    case 'Skipped':
    case 'N/A':
      return 'bg-warning'
    default:
      return 'bg-error';
    }
  }
});
