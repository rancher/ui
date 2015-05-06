import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

var minWidth = 260; // Minimum width of a column, including margin-right
var columnMargin = 10; // this must match the rule in styles/pod.scss .pod-column
var columnWidth = minWidth; // this will get changed by onResize;
var selector = '.pod-column'; // Each column must have this class

// Automatically apply the width to any columns that get added without a resize
jQuery(selector).initialize(function() {
  $(this).css('width', columnWidth+'px');
});

export default Ember.View.extend(ThrottledResize, {
  classNames: ['pods','clearfix'],
  tagName: 'section',

  onResize: function() {
    try {
      var sectionWidth = $('.pods').width();

      var logicalWidth = (sectionWidth + 10); // Add one extra columnMargin because the last column doesn't actually have one
      var columnCount = Math.floor(logicalWidth/(minWidth+columnMargin));

      columnWidth = Math.floor(logicalWidth/columnCount) - columnMargin - columnCount;

      //console.log('section:',sectionWidth,'margin:',columnMargin,'logical:',logicalWidth,'count:',columnCount,'width:',columnWidth);

      if ( this.get('columnCount') !== columnCount )
      {
        this.set('columnCount', columnCount);
      }

      Ember.run(this, () => {
        this.$(selector).css('width', columnWidth+'px');
      });
    } catch (e) {
      // Just in case..
    }
  },

  didInsertElement: function() {
    this._super();
    this.onResize();
  },

  columnCount: 3, // Will be reset on didInsertElement and resize
  podCount: 0, // Will be reset by columns()

  podCountChanged: function() {
    Ember.run.next(this,'onResize');
  }.observes('podCount'),

  columns: function() {
    // Override me:
    // - Set `podCount` to the number of pods there are
    // - Return an array of `columnCount` arrays of resources.
  }.property(/*'context.resource.[]','columnCount'*/),

});
