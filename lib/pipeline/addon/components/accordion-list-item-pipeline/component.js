import Ember from 'ember';

export const STATUS_INTL_KEY = 'accordionRow.status';

export default Ember.Component.extend({
  name: null,
  title: null,
  detail: null,
  status: null,
  statusClass: null,

  classNames: ['accordion'],
  expanded: false,
  expandAll: false,
  intent: null,
  expdObserver: Ember.on('init', Ember.observer('expanded', function() {
    if (this.get('expanded') && !this.get('intent')) {
      this.set('intent', this.get('componentName'));
    }
  })),

  expandAllObserver: Ember.on('init', Ember.observer('expandAll', function() {
    var ea = this.get('expandAll');
    if (ea) {
      this.set('expanded', true);
    } else {
      this.set('expanded', false);
    }
  })),
});
