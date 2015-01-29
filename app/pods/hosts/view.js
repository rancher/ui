import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['hosts','clearfix'],
  tagName: 'section',

  resizeFn: null,
  didInsertElement: function() {
    this._super();

    this.set('resizeFn', this.onResize.bind(this));
    $(window).on('resize', this.get('resizeFn'));
    this.onResize();
  },

  willDestroyElement: function() {
    $(window).off('resize', this.get('resizeFn'));
  },

  sectionWidth: null, // Will be reset on didInsertElement and resize
  columnWidth: 265, // Must also change public/css/host.css .host-column

  onResize: function() {
    this.set('sectionWidth', $('.hosts').width());
  },

  columnCount: function() {
    var colWidth = this.get('columnWidth');
    var mainWidth = this.get('sectionWidth');
    if ( !mainWidth )
    {
      // The width isn't known until after the first render...
      return 3;
    }

    return Math.max(1,Math.floor(mainWidth/colWidth));
  }.property('sectionWidth','columnWidth'),

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
