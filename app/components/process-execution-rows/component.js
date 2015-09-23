import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    expand: function() {
      this.toggleProperty('expanded');
    }
  },
  tagName: '',
  expanded: false,
  depth: 0,
  setup: Ember.on('init', function() {
    if (this.get('nodeDepth')) {
      this.set('depth', this.get('nodeDepth') + 1);
    } else {
      this.set('depth', 1);
    }
  }),
  checkProcessHandlerExecutions: function() {
    if (this.get('execution').hasOwnProperty('processHandlerExecutions') && this.get('execution').processHandlerExecutions.length > 0) {
      return true;
    } else {
      return false;
    }
  }.property(),
  humanEndTime: Ember.computed('endTime', function() {
    var offset = new Date().getTimezoneOffset();
    return moment(this.get('endTime')).zone(offset).format('YYYY-MM-DDTHH:MM:SSZ');
  }),
  childrenExpanded: function() {
    if (this.get('expandAll')) {
      this.set('expanded', true);
    } else {
      this.set('expanded', false);
    }
  }.observes('expandAll')
});
