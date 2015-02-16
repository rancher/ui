import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';
import CssHackery from 'ui/utils/css-hackery';

var columnRule;
var minWidth = 260; // Minimum width of a column, including margin-right
var sheetName = 'dynamic-css';
var selector = '.host-column';

export default Ember.View.extend(ThrottledResize, {
  classNames: ['hosts','clearfix'],
  tagName: 'section',

  init: function() {
    this._super();
    if ( !columnRule )
    {
      var sheet = CssHackery.findSheet(sheetName);
      CssHackery.addRule(sheet, selector, 'width: 260px; margin: 0 10px 10px 0;', 0);
      columnRule = CssHackery.findRule(selector, sheetName);
    }
  },

  onResize: function() {
    var sectionWidth = $('.hosts').width();
    var columnMargin = parseInt(columnRule.style.marginRight,10);

    var logicalWidth = (sectionWidth + columnMargin); // Add one extra columnMargin because the last column doesn't actually have one
    var columnCount = Math.floor(logicalWidth/minWidth);
    var columnWidth = Math.floor(logicalWidth/columnCount) - columnMargin - 3; // why 3?  Because reasons...

    console.log('section:',sectionWidth,'margin:',columnMargin,'logical:',logicalWidth,'count:',columnCount,'width:',columnWidth);

    columnRule.style.width = columnWidth+'px';

    this.setProperties({
      sectionWidth: sectionWidth,
      columnCount: columnCount
    });
  },

  sectionWidth: null, // Will be reset on didInsertElement and resize
  columnCount: 3, // Will be reset on didInsertElement and resize

  columns: function() {
    var hosts = this.get('context.arrangedContent');
    var columnCount = this.get('columnCount');
    var i;

    var columns = [];
    // Pre-initialize all the columns
    for ( i = 0 ; i < columnCount ; i++ )
    {
      columns[i] = [];
    }

    for ( i = 0 ; i < hosts.get('length') ; i++ )
    {
      columns[i % columnCount].push(hosts.objectAt(i));
    }

    // Add a placeholder for where to put the 'Add a host' button
    columns[i % columnCount].push(Ember.Object.create({isNewHostPlaceHolder: true}));

    return columns;
  }.property('context.arrangedContent.[]','columnCount'),
});
