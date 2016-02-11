import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

const MIN_WIDTH     = 260; // Minimum width of a column, including margin-right
const COLUMN_MARGIN = 10; // this must match the rule in styles/pod.scss .pod-column

let columnWidth     = MIN_WIDTH; // this will get changed by onResize;


export default Ember.Component.extend(ThrottledResize, {
  pods         : null, // Override me with an array of content pods
  emptyMessage : null,

  classNames   : ['pods','clearfix'],
  tagName      : 'section',

  columnCount  : 3, // Will be reset on didInsertElement and resize
  podCount     : Ember.computed.alias('pods.length'),

  onResize: function() {
    try {
      var elem = this.$();
      var sectionWidth = $('#application').width(); // On first call the pods aren't rendered yet, so approximate with the screen width
      if ( elem && elem.is(':visible') )
      {
        sectionWidth = elem.width();
      }

      var logicalWidth = (sectionWidth + 10); // Add one extra COLUMN_MARGIN because the last column doesn't actually have one
      var columnCount = Math.max(1, Math.floor(logicalWidth/(MIN_WIDTH+COLUMN_MARGIN)));
      columnWidth = Math.max(50, Math.floor(logicalWidth/columnCount) - COLUMN_MARGIN - columnCount);

      if ( this.get('columnCount') !== columnCount )
      {
        this.set('columnCount', Math.min(columnCount, this.get('podCount')));
      }

    } catch (e) {
      // Just in case..
    }
  },

  init: function() {
    this._super();
    this.onResize(); // Estimate the columnCount so it doesn't have to get called twice in most cases
  },

  podCountChanged: function() {
    Ember.run.next(this,'onResize');
  }.observes('podCount'),

  columns: function() {
    var i;
    var idx = 0;
    var pods = this.get('pods')||[];
    var columnCount = this.get('columnCount');

    // Pre-initialize all the columns
    var columns = [];
    for ( i = 0 ; i < columnCount ; i++ )
    {
      columns[i] = [];
    }

    // Copy in the hosts
    for ( i = 0 ; i < pods.get('length') ; i++ )
    {
      columns[nextIndex()].push(pods.objectAt(i));
    }

    return columns;

    function nextIndex() {
      var out = idx;

      idx++;
      if ( idx >= columnCount )
      {
        idx = 0;
      }

      return out;
    }
  }.property('pods.[]','columnCount'),

  didInsertElement: function() {
    this._super();
    this.onResize();
  },
});
