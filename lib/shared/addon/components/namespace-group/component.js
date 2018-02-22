import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:        null,
  fullColspan:  null,
  afterName:    0,
  showState:    false,
  afterState:   0,
  alignState:   'text-center',
  showActions:  true,
  noGroup:      'namespaceGroup.none',

  tagName:      '',

  nameSpan: function() {
    let span = this.get('fullColspan') -
           this.get('afterName') -
           (this.get('showState') ? 1 : 0) -
           this.get('afterState') -
           (this.get('showActions') ? 1 : 0);

    return Math.max(span,1);
  }.property('fullColspan','afterName','showState','afterState','showActions'),


});
