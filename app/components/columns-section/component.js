import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

const MIN_WIDTH     = 260; // Minimum width of a column, including margin-right
const COLUMN_MARGIN = 10; // this must match the rule in styles/pod.scss .pod-column

export default Ember.Component.extend(ThrottledResize, {
  pods         : null, // Override me with an array of content pods
  emptyMessage : null,

  columnWidth  : MIN_WIDTH,
  columnFudge  : 0,

  classNames   : ['pods','clearfix'],
  tagName      : 'section',

  columnCount  : 3, // Will be reset on didInsertElement and resize
  podCount     : Ember.computed.alias('pods.length'),

  lastIndex: function() {
    return this.get('columnCount')-1;
  }.property('columnCount'),

  columnWidthCss: function() {
    return Ember.String.htmlSafe('width: ' + this.get('columnWidth') + 'px');
  }.property('columnWidth'),

  lastColumnWidthCss: function() {
    return Ember.String.htmlSafe('width: ' + (this.get('columnWidth')+this.get('columnFudge')) + 'px');
  }.property('columnWidth','columnFudge'),

  onResize: function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    try {
      let elem         = this.$();
      let sectionWidth = $('#application').width(); // On first call the pods aren't rendered yet, so approximate with the screen width
      if ( elem && elem.is(':visible') )
      {
        sectionWidth = elem.width();
      }

      let margins = COLUMN_MARGIN + 2;
      let logicalWidth = (sectionWidth + margins); // Add one extra COLUMN_MARGIN because the last column doesn't actually have one
      let columnCount  = Math.max(1, Math.floor(logicalWidth/MIN_WIDTH));
      let columnWidth  = Math.max(50, Math.floor((logicalWidth/columnCount) - margins));
      let columnFudge  = logicalWidth - (columnCount*(columnWidth+margins)); // Extra pixels that didn't divide evenly go onto the last column.

      /*
      console.log(
        'section='+sectionWidth,
        'logical='+logicalWidth,
        'count='+columnCount,
        'width='+columnWidth,
        'fudge='+columnFudge
      );
      */

      this.setProperties({
        columnCount: columnCount,
        columnWidth: columnWidth,
        columnFudge: columnFudge,
      });
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
    let i;
    let idx                           = 0;
    let pods                          = (this.get('pods')||[]).sortBy('displayName');
    let columnCount                   = this.get('columnCount');

    // Pre-initialize all the columns
    var columns                       = [];

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
      let out = idx;

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
    // Removes deprecation warning about modifing after insert
    Ember.run.scheduleOnce('afterRender', this, 'onResize');
  },
});
