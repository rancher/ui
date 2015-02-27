import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

var minWidth = 260; // Minimum width of a column, including margin-right
var columnMargin = 10; // this must match the rule in styles/host.scss .host-column
var columnWidth = minWidth; // this will get changed by onResize;
var selector = '.host-column';

// Automatically apply the width to any columns that get added without a resize
jQuery(selector).initialize(function() {
  $(this).css('width', columnWidth+'px');
});

export default Ember.View.extend(ThrottledResize, {
  classNames: ['hosts','clearfix'],
  tagName: 'section',

  onResize: function() {
    try {
      var sectionWidth = $('.hosts').width();

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

  columnCount: 3, // Will be reset on didInsertElement and resize
  boxCount: 0, // Will be reset by columns()

  columns: function() {
    var boxCount = 0;
    var idx = 0;
    var hosts = this.get('context.hosts').sortBy('name');
    var machines = this.get('context.machines').sortBy('name');
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
      columns[nextIndex()].push(hosts.objectAt(i));

    }

    var machine;
    for ( i = 0 ; i < machines.get('length') ; i++ )
    {
      machine = machines.objectAt(i);
      if ( machine.get('isPending') )
      {
        columns[nextIndex()].push(Ember.Object.create({isPendingMachine: true, machine: machine}));
      }
    }

    // Add a placeholder for where to put the 'Add a host' button
    columns[nextIndex()].push(Ember.Object.create({isNewHostPlaceHolder: true}));

    return columns;

    function nextIndex() {
      var out = idx;

      idx++;
      boxCount++;
      if ( idx >= columnCount )
      {
        idx = 0;
      }

      return out;
    }

    this.set('boxCount', boxCount);
  }.property('context.hosts.[]','context.machines.@each.isPending','columnCount'),

  boxCountChanged: function() {
    Ember.run.next(this,'onResize');
  }.observes('boxCount'),
});
