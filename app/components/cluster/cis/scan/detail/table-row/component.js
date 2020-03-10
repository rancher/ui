import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  tagName:              '',
  expanded:             false,
  hasExpandableContent: computed.notEmpty('model.nodes'),
  actions:              {
    toggle() {
      set(this, 'expanded', !get(this, 'expanded'));
    },
    toggleSkip() {
      get(this, 'model.toggleSkip')()
    },
  },
  isInSkipList: computed('model.skipList.@each', function() {
    return get(this, 'model.skipList').indexOf(get(this, 'model.id')) !== -1;
  }),
  showSkipButton: computed('model.state', 'isInSkipList', function() {
    return get(this, 'model.state') !== 'Pass' && get(this, 'model.state') !== 'N/A' && !get(this, 'isInSkipList');
  }),
  showUnskipButton: computed('model.state', 'isInSkipList', function() {
    return get(this, 'model.state') !== 'Pass' && get(this, 'isInSkipList');
  }),
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
      return 'bg-warning'
    case 'N/A':
      return 'bg-warning';
    default:
      return 'bg-error';
    }
  }
});
