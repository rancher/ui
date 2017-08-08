import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  fullColspan: null,
  afterName: 0,
  showUpgrade: false,
  afterUpgrade: 0,
  showState: false,
  afterState: 0,
  alignState: 'text-center',
  showActions: true,

  tagName: '',

  nameSpan: function() {
    let span = this.get('fullColspan') -
           this.get('afterName') -
           (this.get('showUpgrade') ? 1 : 0) -
           this.get('afterUpgrade') -
           (this.get('showState') ? 1 : 0) -
           this.get('afterState') -
           (this.get('showActions') ? 1 : 0);

    return Math.max(span,1);
  }.property('fullColspan','afterName','showUpgrade','afterUpgrade','showState','afterState','showActions'),


});
