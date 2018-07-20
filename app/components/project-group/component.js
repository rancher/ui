import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  model:        null,
  fullColspan:  null,
  afterName:    0,
  afterState:   0,
  alignState:   'text-center',
  showActions:  true,
  noGroup:      'namespaceGroup.none',

  tagName:      '',

  nameSpan: computed('fullColspan', 'afterName', 'showState', 'afterState', 'showActions', function() {
    let span = this.get('fullColspan') -
        (this.get('showActions') ? 2 : 0);

    return Math.max(span, 1);
  }),


});
